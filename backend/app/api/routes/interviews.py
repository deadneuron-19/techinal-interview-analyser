import uuid
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.interview import InterviewRepository
from app.schemas.interview import InterviewCreate, InterviewResponse
from app.services.interview import (
    InterviewNotFoundError,
    InterviewService,
    InvalidInterviewStateError,
)

router = APIRouter(prefix="/api/v1/interviews", tags=["interviews"])


def get_interview_service(
    db: Annotated[Session, Depends(get_db)],
) -> InterviewService:
    return InterviewService(InterviewRepository(db))


InterviewServiceDep = Annotated[InterviewService, Depends(get_interview_service)]


@router.post(
    "",
    response_model=InterviewResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_interview(
    payload: InterviewCreate,
    service: InterviewServiceDep,
) -> InterviewResponse:
    return service.create_interview(payload)


@router.get("", response_model=list[InterviewResponse])
def list_interviews(
    service: InterviewServiceDep,
) -> list[InterviewResponse]:
    return service.list_interviews()


@router.get("/{interview_id}", response_model=InterviewResponse)
def get_interview(
    interview_id: uuid.UUID,
    service: InterviewServiceDep,
) -> InterviewResponse:
    try:
        return service.get_interview(interview_id)
    except InterviewNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc


@router.post("/{interview_id}/start", response_model=InterviewResponse)
def start_interview(
    interview_id: uuid.UUID,
    service: InterviewServiceDep,
) -> InterviewResponse:
    try:
        return service.start_interview(interview_id)
    except InterviewNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except InvalidInterviewStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc


@router.post("/{interview_id}/end", response_model=InterviewResponse)
def end_interview(
    interview_id: uuid.UUID,
    service: InterviewServiceDep,
) -> InterviewResponse:
    try:
        return service.end_interview(interview_id)
    except InterviewNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(exc),
        ) from exc
    except InvalidInterviewStateError as exc:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=str(exc),
        ) from exc
