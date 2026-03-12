from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import Application, CommandHandler, CallbackQueryHandler, ContextTypes
from sqlalchemy.future import select
from ..database import AsyncSessionLocal
from ..models import Subscriber, Topic, SubscriberTopic, Vacancy, Channel, Log
import os

class BotManager:
    def __init__(self, token: str):
        self.application = Application.builder().token(token).build()
        self.setup_handlers()

    def setup_handlers(self):
        self.application.add_handler(CommandHandler("start", self.start))
        self.application.add_handler(CommandHandler("topics", self.topics))
        self.application.add_handler(CommandHandler("my", self.my_subscriptions))
        self.application.add_handler(CommandHandler("stop", self.stop))
        self.application.add_handler(CallbackQueryHandler(self.button_handler))

    async def start(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user = update.effective_user
        async with AsyncSessionLocal() as db:
            sub = await db.execute(select(Subscriber).where(Subscriber.telegram_id == user.id))
            if not sub.scalar_one_or_none():
                new_sub = Subscriber(telegram_id=user.id, username=user.username, first_name=user.first_name)
                db.add(new_sub)
                await db.commit()
        
        await update.message.reply_text(
            f"Привет, {user.first_name}! 👋\n\nЯ бот для автоматического поиска вакансий в Telegram.\n"
            "Используйте /topics для выбора тематик.",
            reply_markup=InlineKeyboardMarkup([[InlineKeyboardButton("Выбрать тематики", callback_query_data="view_topics")]])
        )

    async def topics(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Topic))
            topics = res.scalars().all()
            
            keyboard = []
            for t in topics:
                keyboard.append([InlineKeyboardButton(f"{t.emoji} {t.name}", callback_query_data=f"topic_{t.id}")])
            
            await update.message.reply_text("Выберите тематики для подписки:", reply_markup=InlineKeyboardMarkup(keyboard))

    async def button_handler(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        user_id = query.from_user.id
        await query.answer()

        if query.data == "view_topics":
            await self.topics(update, context)
        elif query.data.startswith("topic_"):
            topic_id = int(query.data.split("_")[1])
            async with AsyncSessionLocal() as db:
                sub_res = await db.execute(select(Subscriber).where(Subscriber.telegram_id == user_id))
                sub = sub_res.scalar_one_or_none()
                if sub:
                    # Toggle subscription
                    st_res = await db.execute(select(SubscriberTopic).where(
                        SubscriberTopic.subscriber_id == sub.id, 
                        SubscriberTopic.topic_id == topic_id)
                    )
                    st = st_res.scalar_one_or_none()
                    if st:
                        await db.delete(st)
                        msg = "Отписано от тематики!"
                    else:
                        db.add(SubscriberTopic(subscriber_id=sub.id, topic_id=topic_id))
                        msg = "Подписка оформлена!"
                    await db.commit()
                    await query.edit_message_text(msg)

    async def my_subscriptions(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.effective_user.id
        async with AsyncSessionLocal() as db:
            sub_res = await db.execute(select(Subscriber).where(Subscriber.telegram_id == user_id))
            sub = sub_res.scalar_one_or_none()
            if not sub:
                return await update.message.reply_text("Вы еще не зарегистрированы. Используйте /start")
            
            res = await db.execute(select(Topic).join(SubscriberTopic).where(SubscriberTopic.subscriber_id == sub.id))
            subs = res.scalars().all()
            if not subs:
                return await update.message.reply_text("У вас нет активных подписок.")
            
            msg = "Ваши подписки:\n" + "\n".join([f"- {t.emoji} {t.name}" for t in subs])
            await update.message.reply_text(msg)

    async def stop(self, update: Update, context: ContextTypes.DEFAULT_TYPE):
        user_id = update.effective_user.id
        async with AsyncSessionLocal() as db:
            sub_res = await db.execute(select(Subscriber).where(Subscriber.telegram_id == user_id))
            sub = sub_res.scalar_one_or_none()
            if not sub:
                return await update.message.reply_text("Вы не зарегистрированы.")
                
            from sqlalchemy import delete
            await db.execute(delete(SubscriberTopic).where(SubscriberTopic.subscriber_id == sub.id))
            await db.commit()
            
            await update.message.reply_text("Вы успешно отписались от всех тематик. 🔕")

    async def send_vacancy(self, vacancy: Vacancy, topic: Topic, channel: Channel):
        # Forward or send message to all subscribers of this topic
        async with AsyncSessionLocal() as db:
            res = await db.execute(select(Subscriber).join(SubscriberTopic).where(SubscriberTopic.topic_id == topic.id))
            subs = res.scalars().all()
            
            msg_text = (
                f"🏷 Тематика: {topic.emoji} {topic.name}\n"
                f"📢 Канал: {channel.title}\n"
                f"👤 Автор: {vacancy.author or 'не указан'}\n"
                f"🔗 {vacancy.message_link}\n\n"
                f"📝 Превью:\n{vacancy.text[:300]}..."
            )
            
            for sub in subs:
                try:
                    await self.application.bot.send_message(chat_id=sub.telegram_id, text=msg_text)
                except Exception as e:
                    print(f"Error sending vacancy to {sub.telegram_id}: {e}")

bot_manager = BotManager(os.getenv("TELEGRAM_BOT_TOKEN"))
