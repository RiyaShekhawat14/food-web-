from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.product import Product
from app.schemas.product import ProductResponse


router = APIRouter()


@router.get("", response_model=list[ProductResponse])
def list_products(db: Session = Depends(get_db)):
    return db.query(Product).filter(Product.is_active.is_(True)).order_by(Product.id.asc()).all()
