from typing import Any
from memory_hub import MemoryHub

class LabelHead:
    def __init__(self, memory: MemoryHub):
        self.memory = memory

    def handle(self, message: str, file: Any) -> dict:
        # Placeholder: returns the same stub card
        return {"card": {"type": "mastering", "wav_url": "demo_master.wav"}}
