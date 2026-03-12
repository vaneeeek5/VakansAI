import asyncio
from httpx import AsyncClient
from backend.app.main import app

async def test_topic():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        response = await ac.post("/api/admin/topics/", json={"name": "ИИ", "emoji": "📁", "description": "1111", "keywords": ["python"], "minus_words": []})
        print(response.status_code)
        print(response.json())

if __name__ == "__main__":
    asyncio.run(test_topic())
