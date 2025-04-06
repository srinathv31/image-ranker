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
import multiprocessing as mp

# Constants for optimization
BATCH_SIZE = 32  # Process images in batches
TARGET_IMAGE_SIZE = (224, 224)  # CLIP's preferred input size
NUM_PROCESSES = max(1, mp.cpu_count() - 1)  # Leave one CPU core free

class Folder(BaseModel):
    folder_path: str
    processing_mode: str = "batch"  # "batch" or "single"

class PromptImageRanking(BaseModel):
    folder_path: str
    prompt: str
    processing_mode: str = "batch"  # "batch" or "single"

app = FastAPI()

# Configure CORS for local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# index endpoint
@app.get("/")
async def index():
    return {"message": "Hello, World!"}


# Health check endpoint
@app.get("/healthcheck")
async def health_check():
    return {"status": "ok"}


# Load model at startup - make it global for multiprocessing
model_name = "openai/clip-vit-base-patch32"
model = CLIPModel.from_pretrained(model_name)
processor = CLIPProcessor.from_pretrained(model_name)

# Move model to GPU if available
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model = model.to(device)

def preprocess_image(image_path: str) -> Image.Image:
    """Preprocess image by resizing while maintaining aspect ratio"""
    image = Image.open(image_path).convert("RGB")
    
    # Resize image while maintaining aspect ratio
    aspect_ratio = image.size[0] / image.size[1]
    if aspect_ratio > 1:
        new_size = (int(TARGET_IMAGE_SIZE[0] * aspect_ratio), TARGET_IMAGE_SIZE[1])
    else:
        new_size = (TARGET_IMAGE_SIZE[0], int(TARGET_IMAGE_SIZE[1] / aspect_ratio))
    
    image = image.resize(new_size, Image.Resampling.LANCZOS)
    
    # Center crop to target size
    left = (image.size[0] - TARGET_IMAGE_SIZE[0]) // 2
    top = (image.size[1] - TARGET_IMAGE_SIZE[1]) // 2
    right = left + TARGET_IMAGE_SIZE[0]
    bottom = top + TARGET_IMAGE_SIZE[1]
    
    return image.crop((left, top, right, bottom))

def process_image_batch(images: list, prompt: str = None) -> list:
    """Process a batch of images and return their scores"""
    preprocessed_images = [preprocess_image(img_path) for img_path in images]
    
    # Prepare batch input
    inputs = processor(images=preprocessed_images, return_tensors="pt", padding=True)
    inputs = {k: v.to(device) for k, v in inputs.items()}
    
    with torch.no_grad():
        if prompt is None:
            # Aesthetic scoring
            image_features = model.get_image_features(**inputs)
            scores = [float(feat.sum().item()) for feat in image_features]
        else:
            # Prompt-based scoring
            image_features = model.get_image_features(**inputs)
            image_features = image_features / image_features.norm(p=2, dim=-1, keepdim=True)
            
            # Process prompt once for the batch
            text_inputs = processor(text=prompt, return_tensors="pt", padding=True, truncation=True)
            text_inputs = {k: v.to(device) for k, v in text_inputs.items()}
            text_features = model.get_text_features(**text_inputs)
            text_features = text_features / text_features.norm(p=2, dim=-1, keepdim=True)
            
            # Compute similarities
            scores = [(image_features[i] * text_features[0]).sum().item() for i in range(len(images))]
    
    return scores

async def process_images_generator(folder_path: str, prompt: str = None, processing_mode: str = "batch") -> AsyncGenerator[str, None]:
    images = [f for f in os.listdir(folder_path) if f.lower().endswith(('.png','.jpg','.jpeg'))]
    total_images = len(images)
    scored = []
    
    if processing_mode == "batch":
        # Process images in batches
        for i in range(0, len(images), BATCH_SIZE):
            batch_images = images[i:i + BATCH_SIZE]
            batch_paths = [os.path.join(folder_path, img) for img in batch_images]
            
            # Process batch
            batch_scores = process_image_batch(batch_paths, prompt)
            scored.extend(zip(batch_images, batch_scores))
            
            # Send progress updates for the batch
            for idx, img in enumerate(batch_images, 1):
                progress = {
                    "type": "progress",
                    "current": min(i + idx, total_images),
                    "total": total_images,
                    "percentage": (min(i + idx, total_images) / total_images) * 100,
                    "currentImage": img
                }
                yield f"data: {json.dumps(progress)}\n\n"
                await asyncio.sleep(0.01) # Small delay to avoid overwhelming the client/server
    else:
        # Process images one by one
        for idx, img in enumerate(images, 1):
            path = os.path.join(folder_path, img)
            scores = process_image_batch([path], prompt)  # Still using batch function with size 1
            scored.append((img, scores[0]))
            
            progress = {
                "type": "progress",
                "current": idx,
                "total": total_images,
                "percentage": (idx / total_images) * 100,
                "currentImage": img
            }
            yield f"data: {json.dumps(progress)}\n\n"
            await asyncio.sleep(0.1)  # Slower updates for single mode
    
    # Sort and get top 5
    scored.sort(key=lambda x: x[1], reverse=True)
    top_5 = scored[:5]
    
    # Create final result with base64 images
    top_images = []
    for img, score in top_5:
        with open(os.path.join(folder_path, img), "rb") as image_file:
            base64_image = base64.b64encode(image_file.read()).decode('utf-8')
            top_images.append({"filename": img, "score": score, "base64_image": base64_image})
    
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
        process_images_generator(folder_path, processing_mode=folder.processing_mode),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

@app.post("/folder/images/prompt")
async def folder_images_prompt_stream_endpoint(data: PromptImageRanking):
    folder_path = unquote(data.folder_path)
    prompt = data.prompt
    
    if not os.path.exists(folder_path):
        return {"error": "Folder does not exist"}
        
    return StreamingResponse(
        process_images_generator(folder_path, prompt, processing_mode=data.processing_mode),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 