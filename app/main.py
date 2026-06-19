import logging
from contextlib import asynccontextmanager
from datetime import datetime, timezone
from pathlib import Path

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pymongo.errors import DuplicateKeyError, ServerSelectionTimeoutError

from app.database import close_database, get_database
from app.models import RegistrationCreate, RegistrationResponse

logger = logging.getLogger(__name__)
STATIC_DIR = Path(__file__).parent / "static"


@asynccontextmanager
async def lifespan(app: FastAPI):
    try:
        db = get_database()
        await db.hajj_registrations.create_index("cnic", unique=True)
        await db.hajj_registrations.create_index("mobile")
        logger.info("Connected to MongoDB.")
    except ServerSelectionTimeoutError:
        logger.warning(
            "MongoDB is not reachable. The form will load, but submissions will fail until MongoDB is running."
        )
    yield
    await close_database()


app = FastAPI(
    title="Hana Travels – Hajj 2027 Pre-Registration",
    lifespan=lifespan,
)

app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/")
async def serve_form():
    return FileResponse(STATIC_DIR / "index.html")


@app.post("/api/register", response_model=RegistrationResponse)
async def register_user(payload: RegistrationCreate):
    db = get_database()
    now = datetime.now(timezone.utc)

    document = {
        **payload.model_dump(),
        "date_of_birth": payload.date_of_birth.isoformat(),
        "created_at": now,
        "status": "pending",
    }

    try:
        result = await db.hajj_registrations.insert_one(document)
    except ServerSelectionTimeoutError:
        raise HTTPException(
            status_code=503,
            detail="Database is temporarily unavailable. Please try again shortly.",
        )
    except DuplicateKeyError:
        raise HTTPException(
            status_code=409,
            detail="A registration with this CNIC already exists.",
        )

    return RegistrationResponse(
        id=str(result.inserted_id),
        message="Your pre-registration has been received. We will complete your official registration and send the receipt to your WhatsApp.",
        created_at=now,
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
