from pydantic import BaseModel
from typing import Optional, List
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

class TopicBase(BaseModel):
    name: str
    emoji: Optional[str] = None
    description: Optional[str] = None
    keywords: Optional[List[str]] = []
    minus_words: Optional[List[str]] = []
    ai_description: Optional[str] = None

class TopicCreate(TopicBase):
    pass

class Topic(TopicBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class ChannelBase(BaseModel):
    title: Optional[str] = None
    username: Optional[str] = None
    link: Optional[str] = None
    topic_id: int
    members_count: Optional[int] = 0
    is_joined: bool = False

class ChannelCreate(ChannelBase):
    pass

class Channel(ChannelBase):
    id: int
    added_at: datetime

    class Config:
        from_attributes = True

class LogSchema(BaseModel):
    id: int
    level: str
    message: str
    created_at: datetime

    class Config:
        from_attributes = True
