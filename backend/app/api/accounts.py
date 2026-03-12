from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from telethon import TelegramClient
from telethon.sessions import StringSession

from ..database import get_db
from ..models import TgAccount
from ..schemas import TgAccountCreate, TgAccount as TgAccountSchema

router = APIRouter()

@router.get("/", response_model=List[TgAccountSchema])
async def read_accounts(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(TgAccount))
    return result.scalars().all()

@router.post("/")
async def add_account(account: TgAccountCreate, db: AsyncSession = Depends(get_db)):
    db_account = TgAccount(**account.dict())
    db.add(db_account)
    await db.commit()
    await db.refresh(db_account)
    return db_account

@router.post("/{account_id}/send-code")
async def send_code(account_id: int, db: AsyncSession = Depends(get_db)):
    db_account = await db.get(TgAccount, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    client = TelegramClient(StringSession(), db_account.api_id, db_account.api_hash)
    await client.connect()
    sent = await client.send_code_request(db_account.phone)
    await client.disconnect()
    return {"phone_code_hash": sent.phone_code_hash}

@router.post("/{account_id}/signin")
async def sign_in(account_id: int, code: str, phone_code_hash: str, db: AsyncSession = Depends(get_db)):
    db_account = await db.get(TgAccount, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    client = TelegramClient(StringSession(), db_account.api_id, db_account.api_hash)
    await client.connect()
    try:
        user = await client.sign_in(db_account.phone, code, phone_code_hash=phone_code_hash)
        session_str = client.session.save()
        db_account.session_string = session_str
        await db.commit()
    finally:
        await client.disconnect()
    return {"status": "signed_in"}
