from pydantic import BaseModel


class VerifySessionRequest(BaseModel):
    order_id: int
    session_id: str


class VerifySessionResponse(BaseModel):
    verified: bool
    payment_status: str
    order_status: str


class PaymentConfigResponse(BaseModel):
    provider: str
    label: str
