from fastapi import FastAPI, Form, UploadFile, File
import uvicorn
from memory_hub import MemoryHub
from agents.crew_runtime import LabelHead

app = FastAPI()
mem = MemoryHub()

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(message: str = Form(...), file: UploadFile = File(...)):
    # 1. Persist file & metadata
    release_id = mem.save("user", "demo", {"message": message, "filename": file.filename})
    # 2. Spawn LabelHead agent
    lh = LabelHead(memory=mem)
    card = lh.handle(message, file)
    return card
