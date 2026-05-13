from fastapi import HTTPException, status
import stripe
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.order import Order
from app.services.orders import clear_cart


def _ensure_stripe_configured():
    if not settings.stripe_secret_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Stripe is not configured. Add STRIPE_SECRET_KEY to backend/.env.",
        )
    stripe.api_key = settings.stripe_secret_key


def _create_demo_checkout_session(order: Order, db: Session):
    session_id = f"demo_session_{order.id}"
    order.stripe_session_id = session_id
    db.commit()
    db.refresh(order)
    return type(
        "DemoSession",
        (),
        {
            "id": session_id,
            "url": (
                f"{settings.frontend_base_url}/demo-checkout"
                f"?order_id={order.id}&session_id={session_id}"
            ),
        },
    )()


def create_checkout_session(order: Order, db: Session):
    if settings.payment_provider == "demo":
        return _create_demo_checkout_session(order, db)

    _ensure_stripe_configured()

    line_items = [
        {
            "price_data": {
                "currency": settings.currency,
                "product_data": {"name": item.name},
                "unit_amount": item.unit_price * 100,
            },
            "quantity": item.quantity,
        }
        for item in order.items
    ]

    if order.delivery_fee:
        line_items.append(
            {
                "price_data": {
                    "currency": settings.currency,
                    "product_data": {"name": "Delivery Fee"},
                    "unit_amount": order.delivery_fee * 100,
                },
                "quantity": 1,
            }
        )

    session = stripe.checkout.Session.create(
        mode="payment",
        payment_method_types=["card"],
        customer_email=order.email,
        line_items=line_items,
        metadata={"order_id": str(order.id), "user_id": str(order.user_id)},
        success_url=(
            f"{settings.frontend_base_url}/payment-status"
            f"?status=success&order_id={order.id}&session_id={{CHECKOUT_SESSION_ID}}"
        ),
        cancel_url=f"{settings.frontend_base_url}/payment-status?status=cancelled&order_id={order.id}",
    )

    order.stripe_session_id = session.id
    db.commit()
    db.refresh(order)
    return session


def verify_checkout_session(order: Order, session_id: str, db: Session):
    if settings.payment_provider == "demo":
        if session_id != order.stripe_session_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session does not match order.")

        order.payment_status = "paid"
        order.status = "confirmed"
        order.stripe_payment_intent_id = f"demo_intent_{order.id}"
        db.commit()
        clear_cart(order.user_id, db)
        return True, order

    _ensure_stripe_configured()

    session = stripe.checkout.Session.retrieve(session_id)
    if session.id != order.stripe_session_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Session does not match order.")

    if session.payment_status == "paid":
        order.payment_status = "paid"
        order.status = "confirmed"
        order.stripe_payment_intent_id = session.payment_intent
        db.commit()
        clear_cart(order.user_id, db)
        return True, order

    order.payment_status = session.payment_status or "pending"
    db.commit()
    return False, order
