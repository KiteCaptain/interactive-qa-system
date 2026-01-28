from datetime import datetime
from typing import Optional, List
from sqlmodel import SQLModel, Field, Relationship
from pydantic import ConfigDict, field_validator
import uuid


def generate_uuid() -> str:
    """Generate a unique identifier for conversations."""
    return str(uuid.uuid4())

# Message Models
class MessageBase(SQLModel):
    """Base schema for message data."""
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "role": "user",
            "content": "How do I migrate my application to Google Cloud?"
        }
    })
    
    role: str = Field(
        ...,
        description="Message sender role. Must be 'user' for user messages or 'assistant' for AI responses.",
    )
    content: str = Field(
        ...,
        description="The message content text.",
        min_length=1,
    )
    
    @field_validator('role')
    @classmethod
    def validate_role(cls, v: str) -> str:
        if v not in ('user', 'assistant'):
            raise ValueError("role must be 'user' or 'assistant'")
        return v


class Message(MessageBase, table=True):
    """Database model for chat messages."""
    __tablename__ = "messages"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    conversation_id: str = Field(
        foreign_key="conversations.id",
        index=True,
        description="UUID of the parent conversation",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the message was created",
    )
    
    conversation: Optional["Conversation"] = Relationship(back_populates="messages")


class MessageCreate(MessageBase):
    """
    Schema for creating a new message.
    
    Used when adding messages to a conversation via POST request.
    """
    pass


class MessageRead(MessageBase):
    """
    Schema for reading a message.
    
    Includes the database-generated ID and creation timestamp.
    """
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": 1,
            "role": "user",
            "content": "How do I migrate my application to Google Cloud?",
            "created_at": "2024-01-15T10:30:00"
        }
    })
    
    id: int = Field(description="Unique message ID")
    created_at: datetime = Field(description="Timestamp when the message was created")


# Conversation Models
class ConversationBase(SQLModel):
    """Base schema for conversation data."""
    title: Optional[str] = Field(
        default=None,
        description="Conversation title. Auto-generated from first message if not provided.",
        max_length=100,
    )


class Conversation(ConversationBase, table=True):
    """Database model for conversations."""
    __tablename__ = "conversations"
    
    id: str = Field(
        default_factory=generate_uuid,
        primary_key=True,
        description="Unique conversation UUID",
    )
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the conversation was created",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when the conversation was last updated",
    )
    
    messages: List[Message] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan", "order_by": "Message.created_at"}
    )


class ConversationCreate(ConversationBase):
    """
    Schema for creating a new conversation.
    
    The title is optional - if not provided, it will be auto-generated
    from the first user message.
    """
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "title": "Cloud Migration Help"
        }
    })


class ConversationRead(ConversationBase):
    """
    Schema for reading a conversation (without messages).
    
    Used in list responses where messages are not needed.
    """
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Cloud Migration Help",
            "created_at": "2024-01-15T10:30:00",
            "updated_at": "2024-01-15T10:35:00"
        }
    })
    
    id: str = Field(description="Unique conversation UUID")
    created_at: datetime = Field(description="Timestamp when the conversation was created")
    updated_at: datetime = Field(description="Timestamp when the conversation was last updated")


class ConversationReadWithMessages(ConversationRead):
    """
    Schema for reading a conversation with all its messages.
    
    Used when retrieving a single conversation with full chat history.
    """
    model_config = ConfigDict(json_schema_extra={
        "example": {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "title": "Cloud Migration Help",
            "created_at": "2024-01-15T10:30:00",
            "updated_at": "2024-01-15T10:35:00",
            "messages": [
                {
                    "id": 1,
                    "role": "user",
                    "content": "How do I migrate to GCP?",
                    "created_at": "2024-01-15T10:30:00"
                },
                {
                    "id": 2,
                    "role": "assistant",
                    "content": "Here's a comprehensive guide for migrating to Google Cloud Platform...",
                    "created_at": "2024-01-15T10:30:05"
                }
            ]
        }
    })
    
    messages: List[MessageRead] = Field(
        default=[],
        description="List of messages in this conversation, ordered chronologically",
    )
