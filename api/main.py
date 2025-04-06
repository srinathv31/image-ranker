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
from fastapi.responses import StreamingResponse
import asyncio
from typing import AsyncGenerator

class Folder(BaseModel):
    folder_path: str

class PromptImageRanking(BaseModel):
    folder_path: str
    prompt: str


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

async def process_images_generator(folder_path: str) -> AsyncGenerator[str, None]:
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png','.jpg','.jpeg'))]
    total_images = len(images)
    scored = []
    
    for idx, img in enumerate(images, 1):
        path = os.path.join(folder_path, img)
        score = get_aesthetic_score(path)
        scored.append((img, score))
        
        # Send progress update
        progress = {
            "type": "progress",
            "current": idx,
            "total": total_images,
            "percentage": (idx / total_images) * 100,
            "currentImage": img
        }
        yield f"data: {json.dumps(progress)}\n\n"
        await asyncio.sleep(0.1)  # Small delay to prevent overwhelming the client
    
    # Sort and get top 5
    scored.sort(key=lambda x: x[1], reverse=True)
    top_5 = scored[:5]
    
    # Create final result with base64 images
    top_images = []
    for img, score in top_5:
        with open(os.path.join(folder_path, img), "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            top_images.append({"filename": img, "score": score, "base64_image": base64_image})
    
    # Send final result
    final_result = {
        "type": "complete",
        "top_images": top_images
    }
    yield f"data: {json.dumps(final_result)}\n\n"

@app.post("/folder/images/stream")
async def folder_images_stream_endpoint(folder: Folder):
    folder_path = unquote(folder.folder_path)
    
    if not os.path.exists(folder_path):
        return {"error": "Folder does not exist"}
        
    return StreamingResponse(
        process_images_generator(folder_path),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/folder/images")
async def folder_images_endpoint(folder: Folder):
    folder_path = unquote(folder.folder_path)
    
    if not os.path.exists(folder_path):
        return {"error": "Folder does not exist"}
    
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png','.jpg','.jpeg'))]
    scored = []
    for img in images:
        path = os.path.join(folder_path, img)
        score = get_aesthetic_score(path)
        scored.append((img, score))
    scored.sort(key=lambda x: x[1], reverse=True)
    top_5 = scored[:5]
    
    top_images = []
    for img, score in top_5:
        with open(os.path.join(folder_path, img), "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            top_images.append({"filename": img, "score": score, "base64_image": base64_image})
    
    return {"top_images": top_images}


async def process_images_generator_prompt(folder_path: str, prompt: str) -> AsyncGenerator[str, None]:
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png','.jpg','.jpeg'))]
    total_images = len(images)
    
    # === 1) Compute text embedding for the prompt ===
    text_inputs = processor(text=prompt, return_tensors="pt", padding=True, truncation=True)
    with torch.no_grad():
        text_features = model.get_text_features(**text_inputs)
        # Normalize text embeddings
        text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
    
    # We'll store tuples: (image_filename, similarity_score)
    scored = []
    
    # === 2) Loop over images to compute similarity ===
    for idx, img in enumerate(images, 1):
        path = os.path.join(folder_path, img)
        
        # Load image and compute image features
        image = Image.open(path).convert("RGB")
        image_inputs = processor(images=image, return_tensors="pt")
        
        with torch.no_grad():
            image_features = model.get_image_features(**image_inputs)
            # Normalize image embeddings
            image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
            
            # Compute similarity (dot product)
            similarity = (image_features * text_features).sum().item()
        
        scored.append((img, similarity))
        
        # === 3) Yield progress event for SSE ===
        progress = {
            "type": "progress",
            "current": idx,
            "total": total_images,
            "percentage": (idx / total_images) * 100,
            "currentImage": img
        }
        yield f"data: {json.dumps(progress)}\n\n"
        
        # Optional: small sleep to avoid flooding the frontend
        await asyncio.sleep(0.05)
    
    # === 4) After finishing all images, sort and get top 5 ===
    scored.sort(key=lambda x: x[1], reverse=True)
    top_5 = scored[:5]

    # Convert top 5 images to base64
    top_images = []
    for img, score in top_5:
        with open(os.path.join(folder_path, img), "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            top_images.append({"filename": img, "score": score, "base64_image": base64_image})
    
    # === 5) Yield final “complete” event with top 5 images ===
    final_result = {
        "type": "complete",
        "top_images": top_images
    }
    yield f"data: {json.dumps(final_result)}\n\n"


@app.post("/folder/images/prompt")
async def folder_images_prompt_stream_endpoint(data: PromptImageRanking):
    folder_path = unquote(data.folder_path)
    prompt = data.prompt
    
    if not os.path.exists(folder_path):
        return {"error": "Folder does not exist"}
        
    # Return the SSE streaming response
    return StreamingResponse(
        process_images_generator_prompt(folder_path, prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 