from pymongo import MongoClient
from config import settings

client = MongoClient(settings.MONGO_URI)

db = client["primebasket"]

seller_collection = db["sellers"]
product_collection = db["products"]
order_collection = db["orders"]