import cloudinary
import cloudinary.uploader
import os 
from dotenv import load_dotenv
from flask import jsonify

load_dotenv()

cloudinary.config(
  cloud_name = os.getenv("CLOUDINARY_CLOUD_NAME"), 
  api_key = os.getenv("CLOUDINARY_API_KEY"), 
  api_secret = os.getenv("CLOUDINARY_API_SECRET")
)

def upload_profile(file , public_id):
    try:
        result = cloudinary.uploader.upload(
            file , 
            public_id = public_id , 
            folder = "avatars",
            resource_type = "image" , 
            transformation=[{"width": 400, "height": 400, "crop": "fill"}]
        
        )
        return result["secure_url"]

    except Exception as e:
        return jsonify(e)
    
    