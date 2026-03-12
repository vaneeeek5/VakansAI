from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import get_db
from ..models import Topic
from ..schemas import TopicCreate, Topic as TopicSchema

router = APIRouter()

@router.post("/", response_model=TopicSchema)
async def create_topic(topic: TopicCreate, db: AsyncSession = Depends(get_db)):
    db_topic = Topic(**topic.dict())
    db.add(db_topic)
    await db.commit()
    await db.refresh(db_topic)
    return db_topic

@router.get("/", response_model=List[TopicSchema])
async def read_topics(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Topic))
    return result.scalars().all()

@router.get("/{topic_id}", response_model=TopicSchema)
async def read_topic(topic_id: int, db: AsyncSession = Depends(get_db)):
    db_topic = await db.get(Topic, topic_id)
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    return db_topic

@router.put("/{topic_id}", response_model=TopicSchema)
async def update_topic(topic_id: int, topic: TopicCreate, db: AsyncSession = Depends(get_db)):
    db_topic = await db.get(Topic, topic_id)
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    for key, value in topic.dict().items():
        setattr(db_topic, key, value)
    await db.commit()
    await db.refresh(db_topic)
    return db_topic

@router.delete("/{topic_id}")
async def delete_topic(topic_id: int, db: AsyncSession = Depends(get_db)):
    db_topic = await db.get(Topic, topic_id)
    if not db_topic:
        raise HTTPException(status_code=404, detail="Topic not found")
    await db.delete(db_topic)
    await db.commit()
    return {"status": "ok"}
