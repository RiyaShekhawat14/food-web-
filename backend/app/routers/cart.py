from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.cart_item import CartItem
from app.models.product import Product
from app.schemas.cart import CartItemInput, CartResponse, CartSyncInput
from app.services.orders import build_cart_summary


router = APIRouter()


@router.get("", response_model=CartResponse)
def get_cart(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    return build_cart_summary(current_user.id, db)


@router.post("/items", response_model=CartResponse)
def add_item(payload: CartItemInput, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    product = db.get(Product, payload.product_id)
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found.")

    quantity = max(1, payload.quantity)
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == payload.product_id)
        .first()
    )

    if cart_item:
        cart_item.quantity += quantity
    else:
        db.add(CartItem(user_id=current_user.id, product_id=payload.product_id, quantity=quantity))

    db.commit()
    return build_cart_summary(current_user.id, db)


@router.patch("/items/{product_id}", response_model=CartResponse)
def update_item(product_id: str, payload: CartItemInput, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
        .first()
    )
    if not cart_item:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Cart item not found.")

    if payload.quantity <= 0:
        db.delete(cart_item)
    else:
        cart_item.quantity = payload.quantity

    db.commit()
    return build_cart_summary(current_user.id, db)


@router.delete("/items/{product_id}", response_model=CartResponse)
def remove_item(product_id: str, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    cart_item = (
        db.query(CartItem)
        .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
        .first()
    )
    if cart_item:
        db.delete(cart_item)
        db.commit()
    return build_cart_summary(current_user.id, db)


@router.post("/sync", response_model=CartResponse)
def sync_cart(payload: CartSyncInput, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    for product_id, quantity in payload.items.items():
        product = db.get(Product, product_id)
        if not product or quantity <= 0:
            continue
        cart_item = (
            db.query(CartItem)
            .filter(CartItem.user_id == current_user.id, CartItem.product_id == product_id)
            .first()
        )
        if cart_item:
            cart_item.quantity += quantity
        else:
            db.add(CartItem(user_id=current_user.id, product_id=product_id, quantity=quantity))

    db.commit()
    return build_cart_summary(current_user.id, db)


@router.delete("/clear", response_model=CartResponse)
def clear_cart(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    db.query(CartItem).filter(CartItem.user_id == current_user.id).delete()
    db.commit()
    return build_cart_summary(current_user.id, db)
