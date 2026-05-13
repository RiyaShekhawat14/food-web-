from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.config import settings
from app.db.session import get_db
from app.dependencies import get_current_user
from app.models.order import Order
from app.schemas.payment import PaymentConfigResponse, VerifySessionRequest, VerifySessionResponse
from app.services.payments import verify_checkout_session


router = APIRouter()


@router.get("/config", response_model=PaymentConfigResponse)
def payment_config():
    provider = settings.payment_provider
    label = "Demo Payment" if provider == "demo" else "Stripe Checkout"
    return PaymentConfigResponse(provider=provider, label=label)


@router.post("/verify-session", response_model=VerifySessionResponse)
def verify_session(payload: VerifySessionRequest, current_user=Depends(get_current_user), db: Session = Depends(get_db)):
    order = (
        db.query(Order)
        .options(joinedload(Order.items))
        .filter(Order.id == payload.order_id, Order.user_id == current_user.id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Order not found.")

    verified, updated_order = verify_checkout_session(order, payload.session_id, db)
    return VerifySessionResponse(
        verified=verified,
        payment_status=updated_order.payment_status,
        order_status=updated_order.status,
    )
