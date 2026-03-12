from telethon import TelegramClient, events
from telethon.sessions import StringSession
import asyncio
from sqlalchemy.future import select
from ..database import AsyncSessionLocal
from ..models import TgAccount, Channel, Topic, Vacancy, Log
from .ai_filter import AIFilter
import os

class UserbotManager:
    def __init__(self):
        self.clients = {}
        self.ai_filter = None

    async def init_ai(self, db):
        # Load AI settings from DB or ENV
        api_key = os.getenv("AI_API_KEY")
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
        client = TelegramClient(StringSession(acc.session_string), acc.api_id, acc.api_hash)
        self.clients[acc.id] = client
        
        @client.on(events.NewMessage)
        async def handler(event):
            if event.is_channel:
                await self.process_message(event)

        await client.start()
        print(f"Userbot {acc.phone} started")
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
            if not any(kw.lower() in text.lower() for kw in topic.keywords):
                return
            if any(mw.lower() in text.lower() for mw in topic.minus_words):
                return

            # AI filtering
            ai_res = await self.ai_filter.filter_vacancy(topic.ai_description, text)
            if ai_res and ai_res.get("is_vacancy") and ai_res.get("is_suitable"):
                # Save vacancy
                try:
                    vacancy = Vacancy(
                        message_id=event.id,
                        channel_id=channel.id,
                        topic_id=topic.id,
                        text=text,
                        author=event.sender_id,
                        message_link=f"https://t.me/{channel.username}/{event.id}" if channel.username else None,
                        ai_reason=ai_res.get("reason")
                    )
                    db.add(vacancy)
                    await db.commit()
                    # TODO: Trigger Bot Notification
                except Exception as e:
                    log = Log(level="error", message=f"Error saving vacancy: {e}")
                    db.add(log)
                    await db.commit()

manager = UserbotManager()
