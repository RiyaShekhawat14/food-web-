from pydantic import BaseModel, Field, field_validator


class CartItemInput(BaseModel):
    product_id: str
    quantity: int = 1


class CartSyncInput(BaseModel):
    items: dict[str, int] = Field(default_factory=dict)

    @field_validator("items", mode="before")
    @classmethod
    def normalize_items(cls, value):
        if value is None:
            return {}
        if not isinstance(value, dict):
            raise ValueError("items must be an object")

        normalized = {}
        for key, raw_quantity in value.items():
            try:
                quantity = int(raw_quantity)
            except (TypeError, ValueError):
                continue
            if quantity > 0:
                normalized[str(key)] = quantity
        return normalized


class CartItemDetail(BaseModel):
    product_id: str
    name: str
    image: str
    price: int
    quantity: int
    total: int


class CartResponse(BaseModel):
    items: list[CartItemDetail]
    cart_items: dict[str, int]
    subtotal: int
    delivery_fee: int
    total: int
    total_quantity: int
