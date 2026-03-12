from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import get_db
from ..models import Channel
from ..schemas import ChannelCreate, Channel as ChannelSchema

router = APIRouter()

@router.post("/", response_model=ChannelSchema)
async def create_channel(channel: ChannelCreate, db: AsyncSession = Depends(get_db)):
    db_channel = Channel(**channel.dict())
    db.add(db_channel)
    await db.commit()
    await db.refresh(db_channel)
    return db_channel

@router.get("/", response_model=List[ChannelSchema])
async def read_channels(topic_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Channel)
    if topic_id:
        query = query.where(Channel.topic_id == topic_id)
    result = await db.execute(query)
    return result.scalars().all()

@router.delete("/{channel_id}")
async def delete_channel(channel_id: int, db: AsyncSession = Depends(get_db)):
    db_channel = await db.get(Channel, channel_id)
    if not db_channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    await db.delete(db_channel)
    await db.commit()
    return {"status": "ok"}
