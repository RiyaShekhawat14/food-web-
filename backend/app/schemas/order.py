from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class CheckoutRequest(BaseModel):
    first_name: str = Field(min_length=1)
    last_name: str = Field(min_length=1)
    email: str = Field(min_length=5)
    street: str = Field(min_length=3)
    city: str = Field(min_length=2)
    state: str = Field(min_length=2)
    zip_code: str = Field(min_length=2)
    country: str = Field(min_length=2)
    phone: str = Field(min_length=5)


class OrderItemResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    product_id: str
    name: str
    image: str
    quantity: int
    unit_price: int
    total_price: int


class OrderResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    first_name: str
    last_name: str
    email: str
    street: str
    city: str
    state: str
    zip_code: str
    country: str
    phone: str
    subtotal: int
    delivery_fee: int
    total: int
    status: str
    payment_status: str
    stripe_session_id: str | None
    created_at: datetime
    items: list[OrderItemResponse]


class CheckoutSessionResponse(BaseModel):
    order_id: int
    checkout_url: str
    publishable_key: str
