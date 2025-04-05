import random
import os
import json
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from urllib.parse import unquote

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000) 