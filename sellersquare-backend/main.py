from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.seller import router as seller_router
from routes.product import router as product_router
from routes.dashboard import router as dashboard_router
from routes.upload import router as upload_router
from routes.order import router as order_router

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later replace with frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(seller_router)
app.include_router(product_router)
app.include_router(order_router)
app.include_router(dashboard_router)
app.include_router(upload_router)


@app.get("/")
def home():
    return {"message": "PrimeBasket API Running"}
