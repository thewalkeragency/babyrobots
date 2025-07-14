import uuid
import json
import chromadb
from typing import Any, Dict

class MemoryHub:
    def __init__(self, persist_dir: str = "./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_dir)
        self.coll = self.client.get_or_create_collection("indii")

    def save(self, agent: str, release_id: str, payload: Dict[str, Any]) -> str:
        doc_id = str(uuid.uuid4())
        self.coll.add(
            documents=[json.dumps(payload)],
            metadatas=[{"agent": agent, "release_id": release_id}],
            ids=[doc_id]
        )
        return doc_id
