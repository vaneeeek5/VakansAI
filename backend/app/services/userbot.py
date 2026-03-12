from telethon import TelegramClient, events
from telethon.sessions import StringSession
import asyncio
from sqlalchemy.future import select
from ..database import AsyncSessionLocal
from ..models import TgAccount, Channel, Topic, Vacancy, Log
from .ai_filter import AIFilter
from .bot import bot_manager
import os

class UserbotManager:
    def __init__(self):
        self.clients = {}
        self.ai_filter = None

    async def init_ai(self, db):
        # Load AI settings from DB or ENV
        api_key = os.getenv("AI_API_KEY")
        if not api_key or api_key == "pending":
            print("AI Filter is disabled: API key is not set.")
            return

        base_url = os.getenv("AI_API_BASE_URL", "https://api.openai.com/v1")
        model = os.getenv("AI_MODEL", "gpt-4o-mini")
        self.ai_filter = AIFilter(api_key, base_url, model)

    async def start_all(self):
        async with AsyncSessionLocal() as db:
            await self.init_ai(db)
            result = await db.execute(select(TgAccount).where(TgAccount.is_active == True))
            accounts = result.scalars().all()
            
            for acc in accounts:
                if acc.session_string:
                    asyncio.create_task(self.start_client(acc))

    async def start_client(self, acc: TgAccount):
        print(f"Starting userbot for {acc.phone}...")
        client = TelegramClient(StringSession(acc.session_string), acc.api_id, acc.api_hash)
        self.clients[acc.id] = client
        
        @client.on(events.NewMessage)
        async def handler(event):
            if event.is_channel:
                await self.process_message(event)

        await client.start()
        print(f"Userbot {acc.phone} online")
        await client.run_until_disconnected()

    async def process_message(self, event):
        async with AsyncSessionLocal() as db:
            # Check if channel is monitored
            res = await db.execute(select(Channel).where(Channel.id == event.chat_id))
            channel = res.scalar_one_or_none()
            if not channel:
                return

            # Check keywords/minus words
            res = await db.execute(select(Topic).where(Topic.id == channel.topic_id))
            topic = res.scalar_one_or_none()
            if not topic:
                return

            text = event.message.text
            if not text:
                return

            # Simple keyword check first
            keywords = topic.keywords or []
            minus_words = topic.minus_words or []

            if keywords and not any(kw.lower() in text.lower() for kw in keywords):
                return
            if any(mw.lower() in text.lower() for mw in minus_words):
                return

            # AI filtering
            if self.ai_filter:
                ai_res = await self.ai_filter.filter_vacancy(topic.ai_description, text)
            else:
                ai_res = {"is_vacancy": True, "is_suitable": True, "reason": "AI фильтрация временно отключена"}
            
            if ai_res and ai_res.get("is_vacancy") and ai_res.get("is_suitable"):
                # Save vacancy
                try:
                    vacancy = Vacancy(
                        message_id=event.id,
                        channel_id=channel.id,
                        topic_id=topic.id,
                        text=text,
                        author=str(event.sender_id) if event.sender_id else None,
                        message_link=f"https://t.me/{channel.username}/{event.id}" if channel.username else f"https://t.me/c/{str(event.chat_id)[4:]}/{event.id}",
                        ai_reason=ai_res.get("reason")
                    )
                    db.add(vacancy)
                    await db.commit()
                    
                    # Trigger Bot Notification
                    await bot_manager.send_vacancy(vacancy, topic, channel)
                    
                except Exception as e:
                    print(f"Error saving/sending vacancy: {e}")
                    log = Log(level="error", message=f"Error saving vacancy: {e}")
                    db.add(log)
                    await db.commit()

manager = UserbotManager()
