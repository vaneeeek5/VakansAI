from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from typing import List

from ..database import get_db
from ..models import Setting
from ..schemas import SettingBase, Setting as SettingSchema

router = APIRouter()

@router.get("/", response_model=List[SettingSchema])
async def read_settings(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Setting))
    return result.scalars().all()

@router.post("/")
async def update_setting(setting: SettingBase, db: AsyncSession = Depends(get_db)):
    db_setting = await db.execute(select(Setting).where(Setting.key == setting.key))
    db_setting = db_setting.scalar_one_or_none()
    if db_setting:
        db_setting.value = setting.value
    else:
        db_setting = Setting(key=setting.key, value=setting.value)
        db.add(db_setting)
    await db.commit()
    await db.refresh(db_setting)
    return db_setting
