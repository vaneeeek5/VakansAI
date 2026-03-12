from fastapi import APIRouter, Depends, HTTPException, WebSocket, WebSocketDisconnect
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
from telethon import TelegramClient
from telethon.sessions import StringSession
from telethon.errors import SessionPasswordNeededError
import asyncio
import json

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
    
    session = StringSession()
    client = TelegramClient(
        session, db_account.api_id, db_account.api_hash,
        device_model="Desktop", system_version="Windows 11", app_version="1.0"
    )
    
    try:
        await client.connect()
        sent = await client.send_code_request(db_account.phone)
        db_account.session_string = session.save()
        await db.commit()
        return {"phone_code_hash": sent.phone_code_hash}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Telegram API Error: {str(e)}")
    finally:
        await client.disconnect()

@router.post("/{account_id}/signin")
async def sign_in(account_id: int, code: str, phone_code_hash: str, db: AsyncSession = Depends(get_db)):
    db_account = await db.get(TgAccount, account_id)
    if not db_account:
        raise HTTPException(status_code=404, detail="Account not found")
    
    if not db_account.session_string:
         raise HTTPException(status_code=400, detail="No active session found. Request code first.")
         
    client = TelegramClient(
        StringSession(db_account.session_string), db_account.api_id, db_account.api_hash,
        device_model="Desktop", system_version="Windows 11", app_version="1.0"
    )
    
    try:
        await client.connect()
        user = await client.sign_in(db_account.phone, code, phone_code_hash=phone_code_hash)
        session_str = client.session.save()
        db_account.session_string = session_str
        db_account.is_active = True
        await db.commit()
        return {"status": "signed_in"}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=f"Telegram API Error: {str(e)}")
    finally:
        await client.disconnect()

@router.websocket("/{account_id}/qr")
async def qr_login_ws(websocket: WebSocket, account_id: int, db: AsyncSession = Depends(get_db)):
    await websocket.accept()
    
    db_account = await db.get(TgAccount, account_id)
    if not db_account:
        await websocket.send_text(json.dumps({"type": "error", "message": "Account not found"}))
        await websocket.close()
        return

    session = StringSession(db_account.session_string or "")
    client = TelegramClient(
        session, db_account.api_id, db_account.api_hash,
        device_model="Desktop", system_version="Windows 11", app_version="1.0"
    )
    
    try:
        await client.connect()
        if not await client.is_user_authorized():
            qr_login = await client.qr_login()
            await websocket.send_text(json.dumps({"type": "qr_url", "url": qr_login.url}))
            
            wait_task = asyncio.create_task(qr_login.wait())
            
            async def wait_disconnect():
                try:
                    while True:
                        await websocket.receive_text()
                except WebSocketDisconnect:
                    return True
            
            disconnect_task = asyncio.create_task(wait_disconnect())
            done, pending = await asyncio.wait([wait_task, disconnect_task], return_when=asyncio.FIRST_COMPLETED)
            
            if disconnect_task in done:
                wait_task.cancel()
                return
                
            if wait_task in done:
                disconnect_task.cancel()
                try:
                    await wait_task
                    session_str = client.session.save()
                    db_account.session_string = session_str
                    db_account.is_active = True
                    await db.commit()
                    await websocket.send_text(json.dumps({"type": "success"}))
                except SessionPasswordNeededError:
                    db_account.session_string = session.save()
                    await db.commit()
                    await websocket.send_text(json.dumps({"type": "2fa_required"}))
                except Exception as e:
                    import traceback
                    traceback.print_exc()
                    await websocket.send_text(json.dumps({"type": "error", "message": f"Login failed: {str(e)}"}))
        else:
             db_account.is_active = True
             await db.commit()
             await websocket.send_text(json.dumps({"type": "success"}))
             
    except Exception as e:
        import traceback
        traceback.print_exc()
        try:
             await websocket.send_text(json.dumps({"type": "error", "message": f"Connection error: {str(e)}"}))
        except:
             pass
    finally:
        await client.disconnect()
        try:
            await websocket.close()
        except:
            pass
