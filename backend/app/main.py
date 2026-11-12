
from fastapi import FastAPI
from app.api.routes import router
app = FastAPI(
    title="GreenWardrobe API",
    description="AI-powered garment environmental analysis",
    version="1.0.0"
)
app.include_router(
    router,
    prefix="/api/v1",
    tags=["Garment Upload"]
)

@app.get("/")
def home():
    return {
        "message": "Welcome to GreenWardrobe API",
        "status": "running"
    }

@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "service": "GreenWardrobe Backend"
    }
