from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.app.core.database import get_db
from backend.app.crud.crud_meeting import (
    create_meeting,
    delete_meeting,
    get_meeting_by_id,
    get_meetings,
    update_meeting,
)
from backend.app.schemas.all_schemas import (
    MeetingCreate,
    MeetingDetailResponse,
    MeetingResponse,
    MeetingUpdate,
)

router = APIRouter(
    prefix="/meetings",
    tags=["Meetings"],
)


@router.get(
    "/",
    response_model=List[MeetingResponse],
    summary="List all meetings with pagination and search",
)
def read_meetings(
    skip: int = Query(0, ge=0, description="Offset for pagination"),
    limit: int = Query(50, ge=1, le=100, description="Number of meetings to return"),
    search: Optional[str] = Query(None, description="Search keyword in meeting title or description"),
    speaker: Optional[str] = Query(None, description="Filter meetings by participating speaker"),
    db: Session = Depends(get_db),
) -> List[MeetingResponse]:
    """
    Retrieve meetings sorted by date descending with optional text search and speaker filter.
    """
    return get_meetings(db=db, skip=skip, limit=limit, search=search, speaker=speaker)


@router.post(
    "/",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Create a new meeting",
)
def create_new_meeting(
    meeting_in: MeetingCreate,
    db: Session = Depends(get_db),
) -> MeetingResponse:
    """
    Register and store a new meeting entry.
    """
    return create_meeting(db=db, meeting_in=meeting_in)


@router.get(
    "/{meeting_id}",
    response_model=MeetingDetailResponse,
    summary="Get single meeting with all transcripts and AI insights",
)
def read_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
) -> MeetingDetailResponse:
    """
    Fetch comprehensive meeting payload including transcript segments,
    AI summary, action items, smart tags, and conversational history.
    """
    meeting = get_meeting_by_id(db=db, meeting_id=meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found",
        )
    return meeting


@router.patch(
    "/{meeting_id}",
    response_model=MeetingResponse,
    summary="Update meeting details",
)
def update_existing_meeting(
    meeting_id: int,
    meeting_in: MeetingUpdate,
    db: Session = Depends(get_db),
) -> MeetingResponse:
    """
    Update meeting metadata (title, description, status, sentiment, etc.).
    """
    meeting = get_meeting_by_id(db=db, meeting_id=meeting_id)
    if not meeting:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found",
        )
    return update_meeting(db=db, db_meeting=meeting, meeting_in=meeting_in)


@router.delete(
    "/{meeting_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete a meeting and all associated records",
)
def remove_meeting(
    meeting_id: int,
    db: Session = Depends(get_db),
) -> None:
    """
    Delete a meeting by ID with cascading removal of transcripts,
    summaries, action items, and tags.
    """
    deleted = delete_meeting(db=db, meeting_id=meeting_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Meeting with ID {meeting_id} not found",
        )
    return None
