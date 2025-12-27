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


def upload_image(file, public_id=None, folder="course_thumbnails", width=None, height=None):
    """Upload a generic image to Cloudinary and return the secure URL.

    file: a file-like object (werkzeug FileStorage is acceptable)
    public_id: optional public id string; if None, Cloudinary will auto-generate
    folder: Cloudinary folder to store the image
    width/height: optional crop sizing
    """
    try:
        transformation = None
        if width and height:
            transformation = [{"width": width, "height": height, "crop": "fill"}]

        kwargs = {
            "folder": folder,
            "resource_type": "image",
        }
        if public_id:
            kwargs["public_id"] = public_id
        if transformation:
            kwargs["transformation"] = transformation

        result = cloudinary.uploader.upload(file, **kwargs)
        return result.get("secure_url")
    except Exception as e:
        # Return None on failure (caller should handle)
        return None
    
    