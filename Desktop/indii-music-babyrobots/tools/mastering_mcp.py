from mcp import Server, Tool
import httpx

server = Server("mastering")

@server.tool()
async def master_track(stems_url: str, target_loudness: float = -14):
    return {"wav_url": "https://tmp.link/demo_master.wav"}

if __name__ == "__main__":
    server.run()
