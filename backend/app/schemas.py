from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class TgAccountBase(BaseModel):
    api_id: int
    api_hash: str
    phone: str
    is_active: bool = True

class TgAccountCreate(TgAccountBase):
    pass

class TgAccount(TgAccountBase):
    id: int
    created_at: datetime
    session_string: Optional[str] = None

    class Config:
        from_attributes = True

class SettingBase(BaseModel):
    key: str
    value: str

class Setting(SettingBase):
    updated_at: datetime

    class Config:
        from_attributes = True

class VacancySchema(BaseModel):
    id: int
    message_id: int
    channel_id: int
    topic_id: int
    text: str
    author: Optional[str] = None
    message_link: str
    ai_reason: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
