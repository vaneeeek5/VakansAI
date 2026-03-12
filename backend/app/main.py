from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
import asyncio

import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from .database import engine, Base
from .api import admin_auth, topics, channels, accounts, settings, vacancies, monitoring
from .services.bot import bot_manager
from .services.userbot import manager as userbot_manager


app = FastAPI(title="Telegram Vacancy Parser API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    logger.info("Starting application...")
    try:
        # Initialize and start TG Bot
        logger.info("Initializing Telegram Bot...")
        await bot_manager.application.initialize()
        await bot_manager.application.start()
        await bot_manager.application.updater.start_polling()
        logger.info("Telegram Bot started.")
        
        # Start Userbots
        logger.info("Starting Userbots...")
        asyncio.create_task(userbot_manager.start_all())
        logger.info("Userbot start task created.")
    except Exception as e:
        logger.error(f"Error during startup: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    # Stop TG Bot
    await bot_manager.application.updater.stop()
    await bot_manager.application.stop()
    await bot_manager.application.shutdown()

# API Routers
app.include_router(admin_auth.router, prefix="/api/admin", tags=["Admin Auth"])
app.include_router(topics.router, prefix="/api/admin/topics", tags=["Topics"])
app.include_router(channels.router, prefix="/api/admin/channels", tags=["Channels"])
app.include_router(accounts.router, prefix="/api/admin/accounts", tags=["Accounts"])
app.include_router(settings.router, prefix="/api/admin/settings", tags=["Settings"])
app.include_router(vacancies.router, prefix="/api/admin/vacancies", tags=["Vacancies"])
app.include_router(monitoring.router, prefix="/api/admin/monitoring", tags=["Monitoring"])

# Healthcheck
@app.get("/health")
async def health():
    return {"status": "ok"}

# Serve Frontend Static Files (if directory exists)
frontend_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "frontend/dist")
if os.path.exists(frontend_path):
    app.mount("/", StaticFiles(directory=frontend_path, html=True), name="frontend")
