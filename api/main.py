import random
import os
import json
import base64
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import unquote
from PIL import Image
import torch
from transformers import CLIPProcessor, CLIPModel

class Folder(BaseModel):
    folder_path: str


app = FastAPI()

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "Image Ranker API is running"}

@app.get("/dummy")
def dummy_endpoint():
    # return a random number between 0 and 100
    return {"message": random.randint(0, 100)}

@app.post("/folder")
def folder_endpoint(folder: Folder):
    # decode the folder path
    folder_path = unquote(folder.folder_path)

    print(f"Folder received: {folder_path}")

    # check if folder exists
    if not os.path.exists(folder_path):
        return {"message": "Folder does not exist"}

    # read folder contents
    folder_contents = os.listdir(folder_path)

    # read folder contents as json
    folder_contents_json = json.dumps(folder_contents)
    print(f"Folder contents: {folder_contents_json}")

    return {"message": "Folder received", "folder_path": folder_path, "folder_contents": folder_contents}


# Load model at startup
model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name)
processor = CLIPProcessor.from_pretrained(model_name)

def get_aesthetic_score(image_path: str) -> float:
    image = Image.open(image_path).convert("RGB")
    inputs = processor(images=image, return_tensors="pt")
    with torch.no_grad():
        # Example usage – actual approach might differ
        outputs = model.get_image_features(**inputs)
        # This returns a vector. The official code for the model might
        # produce a direct "score" or you'd have a separate head. 
        # For illustration, let's just sum the vector or something simplistic:
        score = float(outputs[0].sum().item()) 
    return score

@app.post("/folder/images")
def folder_images_endpoint(folder: Folder):
    # decode the folder path
    folder_path = unquote(folder.folder_path)

    print(f"Folder received: {folder_path}")

    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png','.jpg','.jpeg'))]
    scored = []
    for img in images:
        path = os.path.join(folder_path, img)
        score = get_aesthetic_score(path)
        scored.append((img, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    top_5 = scored[:5]

    # create a base64 encoded image for each top image
    top_images = []
    for img, score in top_5:
        with open(os.path.join(folder_path, img), "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            top_images.append({"filename": img, "score": score, "base64_image": base64_image})

    return {"top_images": top_images}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 