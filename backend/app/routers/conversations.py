from datetime import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from app.database import get_session
from app.models import (
    Conversation,
    ConversationCreate,
    ConversationRead,
    ConversationReadWithMessages,
    Message,
    MessageCreate,
    MessageRead,
)

router = APIRouter(prefix="/api/conversations", tags=["Conversations"])


# Conversation Endpoints
@router.get("",
    response_model=List[ConversationRead],
    summary="List all conversations",
    response_description="List of conversations ordered by most recently updated",
)
def list_conversations(
    skip: int = Query(0, ge=0, description="Number of conversations to skip for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Maximum number of conversations to return"),
    session: Session = Depends(get_session),
):
    """
    Retrieve all conversations with pagination support.
    
    Returns conversations ordered by most recently updated first.
    Use `skip` and `limit` for pagination.
    
    **Example Response:**
    ```json
    [
      {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "title": "Cloud Migration Help",
        "created_at": "2024-01-15T10:30:00",
        "updated_at": "2024-01-15T10:35:00"
      }
    ]
    ```
    """
    statement = (
        select(Conversation)
        .order_by(Conversation.updated_at.desc())
        .offset(skip)
        .limit(limit)
    )
    conversations = session.exec(statement).all()
    return conversations


@router.post("",
    response_model=ConversationRead,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new conversation",
    response_description="The newly created conversation",
)
def create_conversation(
    conversation: ConversationCreate,
    session: Session = Depends(get_session),
):
    """
    Create a new conversation session.
    
    The title is optional - if not provided, it will be auto-generated 
    from the first user message when messages are added.
    
    **Request Body:**
    ```json
    {
      "title": "Cloud Migration Help"  // optional
    }
    ```
    """
    db_conversation = Conversation.model_validate(conversation)
    session.add(db_conversation)
    session.commit()
    session.refresh(db_conversation)
    return db_conversation


@router.get("/{conversation_id}",
    response_model=ConversationReadWithMessages,
    summary="Get conversation with messages",
    response_description="Conversation details including all messages",
)
def get_conversation(
    conversation_id: str,
    session: Session = Depends(get_session),
):
    """
    Retrieve a specific conversation by ID with all its messages.
    
    Returns the full conversation including metadata and all messages
    in chronological order.
    
    **Path Parameters:**
    - `conversation_id`: UUID of the conversation
    
    **Example Response:**
    ```json
    {
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
          "content": "Here's a guide for migrating to Google Cloud...",
          "created_at": "2024-01-15T10:30:05"
        }
      ]
    }
    ```
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with id '{conversation_id}' not found",
        )
    return conversation


@router.delete("/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a conversation",
    response_description="No content - conversation deleted successfully",
)
def delete_conversation(
    conversation_id: str,
    session: Session = Depends(get_session),
):
    """
    Delete a conversation and all its associated messages.
    
    This action is permanent and cannot be undone.
    All messages within the conversation will also be deleted.
    
    **Path Parameters:**
    - `conversation_id`: UUID of the conversation to delete
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with id '{conversation_id}' not found",
        )
    session.delete(conversation)
    session.commit()
    return None


@router.patch("/{conversation_id}",
    response_model=ConversationRead,
    summary="Update conversation title",
    response_description="The updated conversation",
)
def update_conversation(
    conversation_id: str,
    conversation_update: ConversationCreate,
    session: Session = Depends(get_session),
):
    """
    Update a conversation's title.
    
    **Path Parameters:**
    - `conversation_id`: UUID of the conversation to update
    
    **Request Body:**
    ```json
    {
      "title": "New Conversation Title"
    }
    ```
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with id '{conversation_id}' not found",
        )
    
    if conversation_update.title is not None:
        conversation.title = conversation_update.title
    conversation.updated_at = datetime.utcnow()
    
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    return conversation


@router.post("/{conversation_id}/messages",
    response_model=List[MessageRead],
    status_code=status.HTTP_201_CREATED,
    tags=["Messages"],
    summary="Add messages to conversation",
    response_description="List of created messages",
)
def add_messages(
    conversation_id: str,
    messages: List[MessageCreate],
    session: Session = Depends(get_session),
):
    """
    Add one or more messages to a conversation.
    
    Typically used to save a user message and assistant response pair together.
    If the conversation has no title, one will be auto-generated from the 
    first user message (truncated to 50 characters).
    
    **Path Parameters:**
    - `conversation_id`: UUID of the conversation
    
    **Request Body:**
    ```json
    [
      {
        "role": "user",
        "content": "How do I set up Cloud Storage?"
      },
      {
        "role": "assistant",
        "content": "To set up Google Cloud Storage, follow these steps..."
      }
    ]
    ```
    
    **Notes:**
    - Role must be either "user" or "assistant"
    - Messages are stored in the order provided
    - Conversation's `updated_at` timestamp is automatically updated
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with id '{conversation_id}' not found",
        )
    
    # Create message objects
    db_messages = []
    for msg in messages:
        db_message = Message(
            conversation_id=conversation_id,
            role=msg.role,
            content=msg.content,
        )
        session.add(db_message)
        db_messages.append(db_message)
    
    # Update conversation timestamp
    conversation.updated_at = datetime.utcnow()
    
    # Auto-generate title from first user message if not set
    if not conversation.title:
        user_messages = [m for m in messages if m.role == "user"]
        if user_messages:
            first_message = user_messages[0].content
            # Truncate to first 50 characters for title
            conversation.title = first_message[:50] + ("..." if len(first_message) > 50 else "")
    
    session.add(conversation)
    session.commit()
    
    # Refresh all messages to get their IDs
    for msg in db_messages:
        session.refresh(msg)
    
    return db_messages


@router.get("/{conversation_id}/messages",
    response_model=List[MessageRead],
    tags=["Messages"],
    summary="Get all messages in a conversation",
    response_description="List of messages in chronological order",
)
def get_messages(
    conversation_id: str,
    session: Session = Depends(get_session),
):
    """
    Retrieve all messages for a specific conversation.
    
    Returns messages in chronological order (oldest first).
    
    **Path Parameters:**
    - `conversation_id`: UUID of the conversation
    
    **Example Response:**
    ```json
    [
      {
        "id": 1,
        "role": "user",
        "content": "What is Google Cloud Storage?",
        "created_at": "2024-01-15T10:30:00"
      },
      {
        "id": 2,
        "role": "assistant",
        "content": "Google Cloud Storage is an object storage service...",
        "created_at": "2024-01-15T10:30:05"
      }
    ]
    ```
    """
    conversation = session.get(Conversation, conversation_id)
    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Conversation with id '{conversation_id}' not found",
        )
    
    statement = (
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    )
    messages = session.exec(statement).all()
    return messages
