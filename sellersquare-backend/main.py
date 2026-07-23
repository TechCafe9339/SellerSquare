from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.seller import router as seller_router
from routes.product import router as product_router
from routes.dashboard import router as dashboard_router
from routes.upload import router as upload_router
from routes.seller_order import router as seller_order_router
from routes.admin import router as admin_router
from routes.cart import router as cart_router
from routes.wishlist import router as wishlist_router
from routes.order import router as order_router
from routes.address import router as address_router
from routes.products import router as products_router


from routes.customer import router as customer_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seller_router)
app.include_router(product_router)
app.include_router(products_router)
app.include_router(seller_order_router)
app.include_router(dashboard_router)
app.include_router(upload_router)
app.include_router(admin_router)
app.include_router(customer_router)
app.include_router(cart_router)
app.include_router(wishlist_router)
app.include_router(order_router)
app.include_router(address_router)


@app.get("/")
def home():
    return {"message": "PrimeBasket API Running"}
