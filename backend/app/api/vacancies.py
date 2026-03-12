from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List
import csv
import io
from fastapi.responses import StreamingResponse

from ..database import get_db
from ..models import Vacancy
from ..schemas import VacancySchema

router = APIRouter()

@router.get("/", response_model=List[VacancySchema])
async def read_vacancies(topic_id: int = None, channel_id: int = None, db: AsyncSession = Depends(get_db)):
    query = select(Vacancy)
    if topic_id:
        query = query.where(Vacancy.topic_id == topic_id)
    if channel_id:
        query = query.where(Vacancy.channel_id == channel_id)
    result = await db.execute(query.order_by(Vacancy.created_at.desc()))
    return result.scalars().all()

@router.get("/export")
async def export_vacancies(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Vacancy).order_by(Vacancy.created_at.desc()))
    vacancies = result.scalars().all()
    
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["ID", "Message ID", "Channel ID", "Topic ID", "Text", "Author", "Link", "AI Reason", "Created At"])
    for v in vacancies:
        writer.writerow([v.id, v.message_id, v.channel_id, v.topic_id, v.text, v.author, v.message_link, v.ai_reason, v.created_at])
    
    output.seek(0)
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=vacancies.csv"})
