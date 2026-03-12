from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from typing import List

from ..database import get_db
from ..models import Log, Vacancy, Topic
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/stats")
async def get_stats(db: AsyncSession = Depends(get_db)):
    # Simple stats for now
    total_vacancies = await db.execute(select(func.count(Vacancy.id)))
    today = datetime.utcnow().date()
    today_vacancies = await db.execute(select(func.count(Vacancy.id)).where(Vacancy.created_at >= today))
    
    return {
        "total_vacancies": total_vacancies.scalar(),
        "today_vacancies": today_vacancies.scalar(),
    }

@router.get("/logs")
async def get_logs(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Log).order_by(Log.created_at.desc()).limit(50))
    return result.scalars().all()
