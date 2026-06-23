from pymongo import MongoClient
from config import settings

client = MongoClient(settings.MONGO_URI)

db = client["primebasket"]

seller_collection = db["sellers"]
product_collection = db["products"]
order_collection = db["orders"]
reset_collection = db["password_resets"]
otp_collection = db["otp_codes"]
admin_collection = db["admins"]
customer_collection = db["customers"]
customer_otp_collection = db["customer_otps"]
cart_collection = db["carts"]
wishlist_collection = db["wishlists"]