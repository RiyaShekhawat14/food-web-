from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.cart_item import CartItem
from app.models.order import Order, OrderItem


def build_cart_summary(user_id: int, db: Session):
    cart_entries = (
        db.query(CartItem)
        .filter(CartItem.user_id == user_id)
        .all()
    )

    items = []
    subtotal = 0
    total_quantity = 0

    for entry in cart_entries:
        product = entry.product
        line_total = product.price * entry.quantity
        subtotal += line_total
        total_quantity += entry.quantity
        items.append(
            {
                "product_id": product.id,
                "name": product.name,
                "image": product.image,
                "price": product.price,
                "quantity": entry.quantity,
                "total": line_total,
            }
        )

    delivery_fee = settings.delivery_fee if subtotal else 0
    return {
        "items": items,
        "cart_items": {item["product_id"]: item["quantity"] for item in items},
        "subtotal": subtotal,
        "delivery_fee": delivery_fee,
        "total": subtotal + delivery_fee,
        "total_quantity": total_quantity,
    }


def create_order_from_cart(user, payload, db: Session) -> Order:
    cart_entries = db.query(CartItem).filter(CartItem.user_id == user.id).all()
    if not cart_entries:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Your cart is empty.")

    subtotal = sum(entry.product.price * entry.quantity for entry in cart_entries)
    delivery_fee = settings.delivery_fee if subtotal else 0

    order = Order(
        user_id=user.id,
        first_name=payload.first_name,
        last_name=payload.last_name,
        email=payload.email,
        street=payload.street,
        city=payload.city,
        state=payload.state,
        zip_code=payload.zip_code,
        country=payload.country,
        phone=payload.phone,
        subtotal=subtotal,
        delivery_fee=delivery_fee,
        total=subtotal + delivery_fee,
        status="pending",
        payment_status="pending",
    )
    db.add(order)
    db.flush()

    for entry in cart_entries:
        db.add(
            OrderItem(
                order_id=order.id,
                product_id=entry.product.id,
                name=entry.product.name,
                image=entry.product.image,
                quantity=entry.quantity,
                unit_price=entry.product.price,
                total_price=entry.product.price * entry.quantity,
            )
        )

    db.commit()
    db.refresh(order)
    return order


def clear_cart(user_id: int, db: Session):
    db.query(CartItem).filter(CartItem.user_id == user_id).delete()
    db.commit()
