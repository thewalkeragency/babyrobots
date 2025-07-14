from fastapi import FastAPI, UploadFile, Form, File

app = FastAPI()

@app.get("/")
def health():
    return {"status": "ok"}

@app.post("/chat")
def chat(message: str = Form(...), file: UploadFile = File(...)):
    return {"card": {"type": "mastering", "wav_url": "demo_master.wav"}}
