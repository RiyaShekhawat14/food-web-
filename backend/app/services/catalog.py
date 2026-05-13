from sqlalchemy.orm import Session

from app.models.product import Product


PRODUCT_SEED = [
    {"id": "1", "name": "Greek salad", "image": "food_1.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Salad"},
    {"id": "2", "name": "Veg salad", "image": "food_2.png", "price": 18, "description": "Food provides essential nutrients for overall health and well-being", "category": "Salad"},
    {"id": "3", "name": "Clover Salad", "image": "food_3.png", "price": 16, "description": "Food provides essential nutrients for overall health and well-being", "category": "Salad"},
    {"id": "4", "name": "Chicken Salad", "image": "food_4.png", "price": 24, "description": "Food provides essential nutrients for overall health and well-being", "category": "Salad"},
    {"id": "5", "name": "Lasagna Rolls", "image": "food_5.png", "price": 14, "description": "Food provides essential nutrients for overall health and well-being", "category": "Rolls"},
    {"id": "6", "name": "Peri Peri Rolls", "image": "food_6.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Rolls"},
    {"id": "7", "name": "Chicken Rolls", "image": "food_7.png", "price": 20, "description": "Food provides essential nutrients for overall health and well-being", "category": "Rolls"},
    {"id": "8", "name": "Veg Rolls", "image": "food_8.png", "price": 15, "description": "Food provides essential nutrients for overall health and well-being", "category": "Rolls"},
    {"id": "9", "name": "Ripple Ice Cream", "image": "food_9.png", "price": 14, "description": "Food provides essential nutrients for overall health and well-being", "category": "Deserts"},
    {"id": "10", "name": "Fruit Ice Cream", "image": "food_10.png", "price": 22, "description": "Food provides essential nutrients for overall health and well-being", "category": "Deserts"},
    {"id": "11", "name": "Jar Ice Cream", "image": "food_11.png", "price": 10, "description": "Food provides essential nutrients for overall health and well-being", "category": "Deserts"},
    {"id": "12", "name": "Vanilla Ice Cream", "image": "food_12.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Deserts"},
    {"id": "13", "name": "Chicken Sandwich", "image": "food_13.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Sandwich"},
    {"id": "14", "name": "Vegan Sandwich", "image": "food_14.png", "price": 18, "description": "Food provides essential nutrients for overall health and well-being", "category": "Sandwich"},
    {"id": "15", "name": "Grilled Sandwich", "image": "food_15.png", "price": 16, "description": "Food provides essential nutrients for overall health and well-being", "category": "Sandwich"},
    {"id": "16", "name": "Bread Sandwich", "image": "food_16.png", "price": 24, "description": "Food provides essential nutrients for overall health and well-being", "category": "Sandwich"},
    {"id": "17", "name": "Cup Cake", "image": "food_17.png", "price": 14, "description": "Food provides essential nutrients for overall health and well-being", "category": "Cake"},
    {"id": "18", "name": "Vegan Cake", "image": "food_18.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Cake"},
    {"id": "19", "name": "Butterscotch Cake", "image": "food_19.png", "price": 20, "description": "Food provides essential nutrients for overall health and well-being", "category": "Cake"},
    {"id": "20", "name": "Sliced Cake", "image": "food_20.png", "price": 15, "description": "Food provides essential nutrients for overall health and well-being", "category": "Cake"},
    {"id": "21", "name": "Garlic Mushroom", "image": "food_21.png", "price": 14, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pure Veg"},
    {"id": "22", "name": "Fried Cauliflower", "image": "food_22.png", "price": 22, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pure Veg"},
    {"id": "23", "name": "Mix Veg Pulao", "image": "food_23.png", "price": 10, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pure Veg"},
    {"id": "24", "name": "Rice Zucchini", "image": "food_24.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pure Veg"},
    {"id": "25", "name": "Cheese Pasta", "image": "food_25.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pasta"},
    {"id": "26", "name": "Tomato Pasta", "image": "food_26.png", "price": 18, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pasta"},
    {"id": "27", "name": "Creamy Pasta", "image": "food_27.png", "price": 16, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pasta"},
    {"id": "28", "name": "Chicken Pasta", "image": "food_28.png", "price": 24, "description": "Food provides essential nutrients for overall health and well-being", "category": "Pasta"},
    {"id": "29", "name": "Buttter Noodles", "image": "food_29.png", "price": 14, "description": "Food provides essential nutrients for overall health and well-being", "category": "Noodles"},
    {"id": "30", "name": "Veg Noodles", "image": "food_30.png", "price": 12, "description": "Food provides essential nutrients for overall health and well-being", "category": "Noodles"},
    {"id": "31", "name": "Somen Noodles", "image": "food_31.png", "price": 20, "description": "Food provides essential nutrients for overall health and well-being", "category": "Noodles"},
    {"id": "32", "name": "Cooked Noodles", "image": "food_32.png", "price": 15, "description": "Food provides essential nutrients for overall health and well-being", "category": "Noodles"},
]


def seed_products(db: Session):
    existing_count = db.query(Product).count()
    if existing_count:
        return

    db.add_all(Product(**product) for product in PRODUCT_SEED)
    db.commit()
