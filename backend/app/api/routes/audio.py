import uuid
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.interview import InterviewAudio
from app.repositories.interview import InterviewRepository

router = APIRouter(prefix="/api/v1/interviews", tags=["interview-audio"])

UPLOAD_DIR = Path(__file__).resolve().parents[3] / "storage" / "audio"
ALLOWED_AUDIO_TYPES = {"audio/webm", "audio/wav", "audio/x-wav", "audio/mpeg", "audio/mp4", "audio/ogg", "audio/opus"}
MAX_AUDIO_SIZE = 50 * 1024 * 1024


@router.post("/{interview_id}/audio", status_code=status.HTTP_201_CREATED)
async def upload_interview_audio(
    interview_id: uuid.UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    if InterviewRepository(db).get_by_id(interview_id) is None:
        raise HTTPException(status_code=404, detail="Interview not found.")
    if file.content_type not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported audio format.")
    if db.query(InterviewAudio).filter_by(interview_id=interview_id).first() is not None:
        raise HTTPException(status_code=409, detail="Audio already exists for this interview.")

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)
    stored_filename = f"{uuid.uuid4()}.audio"
    destination = UPLOAD_DIR / stored_filename
    size = 0
    try:
        with destination.open("wb") as output:
            while chunk := await file.read(1024 * 1024):
                size += len(chunk)
                if size > MAX_AUDIO_SIZE:
                    raise HTTPException(status_code=413, detail="Audio file is too large.")
                output.write(chunk)
    except Exception:
        destination.unlink(missing_ok=True)
        raise
    finally:
        await file.close()

    audio = InterviewAudio(
        interview_id=interview_id,
        original_filename=file.filename,
        stored_filename=stored_filename,
        content_type=file.content_type or "application/octet-stream",
        file_size=size,
    )
    db.add(audio)
    db.flush()
    return {
        "id": str(audio.id),
        "interview_id": str(audio.interview_id),
        "original_filename": audio.original_filename,
        "content_type": audio.content_type,
        "file_size": audio.file_size,
        "created_at": audio.created_at,
    }


@router.get("/{interview_id}/audio")
def get_interview_audio_metadata(interview_id: uuid.UUID, db: Session = Depends(get_db)):
    audio = db.query(InterviewAudio).filter_by(interview_id=interview_id).first()
    if audio is None:
        raise HTTPException(status_code=404, detail="Audio not found for this interview.")
    return {
        "id": str(audio.id),
        "interview_id": str(audio.interview_id),
        "original_filename": audio.original_filename,
        "content_type": audio.content_type,
        "file_size": audio.file_size,
        "created_at": audio.created_at,
    }
