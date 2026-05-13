from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.order import Order
from app.schemas.order import CheckoutRequest, CheckoutSessionResponse, OrderResponse
from app.services.orders import create_order_from_cart
from app.services.payments import create_checkout_session


router = APIRouter()


@router.get("/mine", response_model=list[OrderResponse])
def list_my_orders(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    orders = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.user_id == current_user.id)
        .order_by(Order.created_at.desc())
        .all()
    )
    return orders


@router.post("/checkout-session", response_model=CheckoutSessionResponse)
def start_checkout(payload: CheckoutRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    order = create_order_from_cart(current_user, payload, db)
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == order.id)
        .first()
    )
    session = create_checkout_session(order, db)
    return CheckoutSessionResponse(
        order_id=order.id,
        checkout_url=session.url,
        publishable_key=settings.stripe_publishable_key,
    )
