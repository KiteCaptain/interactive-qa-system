from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.utils import get_openapi

from app.config import get_settings
from app.database import create_db_and_tables
from app.routers import conversations

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan handler.
    Creates database tables on startup.
    """
    # Startup: Create database tables
    create_db_and_tables()
    print("Database tables created")
    yield
    # Shutdown: Cleanup if needed
    print("Shutting down ...")


# OpenAPI Tags metadata for documentation organization
tags_metadata = [
    {
        "name": "Root",
        "description": "Root endpoints for API information and discovery.",
    },
    {
        "name": "Health",
        "description": "Health check endpoints for monitoring and deployment platforms.",
    },
    {
        "name": "Conversations",
        "description": "Manage conversations - create, read, update, and delete chat sessions.",
    },
    {
        "name": "Messages",
        "description": "Manage messages within conversations - add and retrieve chat messages.",
    },
]


# Initialize FastAPI application
app = FastAPI(
    title="Cloud Advisor API",
    version=settings.app_version,
    description="""
This API provides persistent storage for conversations and messages in the Cloud Advisor application - an AI-powered assistant for Google Cloud Platform and Google Workspace guidance.

## Features

- **Conversation Management**: Full CRUD operations for chat sessions
- **Message Storage**: Persistent storage of user questions and AI responses  
- **Auto-generated Titles**: Conversation titles are automatically created from the first message
- **Pagination Support**: Efficient listing with skip/limit parameters
- **RESTful Design**: Clean, predictable API structure

## Quick Start

### List all conversations
```
GET /api/conversations
```

### Create a new conversation
```
POST /api/conversations
{"title": "Cloud Migration Help"}
```

### Add messages to a conversation  
```
POST /api/conversations/{id}/messages
[
  {"role": "user", "content": "How do I migrate to GCP?"},
  {"role": "assistant", "content": "Here's a step-by-step guide..."}
]
```
    """,
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_tags=tags_metadata,
    contact={
        "name": "Cloud Advisor Support",
        "url": "https://github.com/kitecaptain/interactive-qa-system/issues",
    },
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conversations.router)


@app.get("/",
    tags=["Root"],
    summary="API Information",
    response_description="Basic API information and available endpoints",
)
def root():
    """
    Get API information and available endpoints.
    
    Returns basic information about the Cloud Advisor API including:
    - API name and version
    - Links to documentation
    - Health check endpoint
    """
    return {
        "name": settings.app_name,
        "version": settings.app_version,
        "description": "Cloud Advisor API - Backend for the Interactive Q&A System",
        "docs": "/docs",
        "redoc": "/redoc",
        "health": "/health",
        "api": {
            "conversations": "/api/conversations",
        },
    }


@app.get("/health",
    tags=["Health"],
    summary="Health Check",
    response_description="Service health status",
)
def health_check():
    """
    Use this endpoint to verify the API is running and responsive.
    """
    return {
        "status": "healthy",
        "service": settings.app_name,
        "version": settings.app_version,
    }
