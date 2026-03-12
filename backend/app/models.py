from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, BigInteger, Text, ARRAY, UniqueConstraint
from sqlalchemy.orm import relationship
from .database import Base

class Setting(Base):
    __tablename__ = "settings"
    id = Column(Integer, primary_key=True)
    key = Column(String, unique=True, nullable=False)
    value = Column(Text)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Topic(Base):
    __tablename__ = "topics"
    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    emoji = Column(String)
    description = Column(Text)
    keywords = Column(ARRAY(String))
    minus_words = Column(ARRAY(String))
    ai_description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    channels = relationship("Channel", back_populates="topic")
    vacancies = relationship("Vacancy", back_populates="topic")
    subscribers = relationship("Subscriber", secondary="subscriber_topics", back_populates="topics")

class Channel(Base):
    __tablename__ = "channels"
    id = Column(BigInteger, primary_key=True)
    title = Column(String)
    username = Column(String)
    link = Column(String)
    topic_id = Column(Integer, ForeignKey("topics.id"))
    members_count = Column(Integer)
    is_joined = Column(Boolean, default=False)
    added_at = Column(DateTime, default=datetime.utcnow)
    
    topic = relationship("Topic", back_populates="channels")
    vacancies = relationship("Vacancy", back_populates="channel")

class TgAccount(Base):
    __tablename__ = "tg_accounts"
    id = Column(Integer, primary_key=True)
    api_id = Column(Integer)
    api_hash = Column(String)
    phone = Column(String)
    session_string = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

class Vacancy(Base):
    __tablename__ = "vacancies"
    id = Column(Integer, primary_key=True)
    message_id = Column(BigInteger)
    channel_id = Column(BigInteger, ForeignKey("channels.id"))
    topic_id = Column(Integer, ForeignKey("topics.id"))
    text = Column(Text)
    author = Column(String)
    message_link = Column(String)
    ai_reason = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    channel = relationship("Channel", back_populates="vacancies")
    topic = relationship("Topic", back_populates="vacancies")
    
    __table_args__ = (UniqueConstraint('message_id', 'channel_id', name='_msg_channel_uc'),)

class Subscriber(Base):
    __tablename__ = "subscribers"
    id = Column(Integer, primary_key=True)
    telegram_id = Column(BigInteger, unique=True, nullable=False)
    username = Column(String)
    first_name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    topics = relationship("Topic", secondary="subscriber_topics", back_populates="subscribers")

class SubscriberTopic(Base):
    __tablename__ = "subscriber_topics"
    subscriber_id = Column(Integer, ForeignKey("subscribers.id"), primary_key=True)
    topic_id = Column(Integer, ForeignKey("topics.id"), primary_key=True)

class Log(Base):
    __tablename__ = "logs"
    id = Column(Integer, primary_key=True)
    level = Column(String) # info/warning/error
    message = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
