from typing import List, Optional
from sqlalchemy import or_, select, cast, String
from sqlalchemy.orm import Session, selectinload

from backend.app.models.meeting import Meeting
from backend.app.schemas.all_schemas import MeetingCreate, MeetingUpdate

def get_meetings(
    db: Session,
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    speaker: Optional[str] = None,
) -> List[Meeting]:
    """
    Retrieve paginated list of meetings with optional text search and speaker filter.
    Ordered by date descending.
    """
    query = select(Meeting)

    # Search filter across title and description
    if search:
        search_filter = f"%{search.strip()}%"
        query = query.where(
            or_(
                Meeting.title.ilike(search_filter),
                Meeting.description.ilike(search_filter),
            )
        )

    # Filter meetings by participant speaker
    if speaker:
        speaker_filter = f"%{speaker.strip()}%"
        query = query.where(cast(Meeting.speakers, String).ilike(speaker_filter))

    query = query.order_by(Meeting.date.desc()).offset(skip).limit(limit)
    return list(db.scalars(query).all())


def get_meeting_by_id(db: Session, meeting_id: int) -> Optional[Meeting]:
    """
    Retrieve a single meeting by ID with all related entities eagerly loaded:
    transcripts, action items, AI summary, smart tags, and QA chat history.
    """
    query = (
        select(Meeting)
        .options(
            selectinload(Meeting.transcripts),
            selectinload(Meeting.action_items),
            selectinload(Meeting.summary),
            selectinload(Meeting.smart_tags),
            selectinload(Meeting.qa_chat_history),
        )
        .where(Meeting.id == meeting_id)
    )
    return db.scalars(query).first()


def create_meeting(db: Session, meeting_in: MeetingCreate) -> Meeting:
    """
    Persist a new meeting entity in the database.
    """
    meeting_data = meeting_in.model_dump()
    db_meeting = Meeting(**meeting_data)
    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


def update_meeting(
    db: Session,
    db_meeting: Meeting,
    meeting_in: MeetingUpdate,
) -> Meeting:
    """
    Update attributes of an existing meeting.
    """
    update_data = meeting_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_meeting, field, value)

    db.add(db_meeting)
    db.commit()
    db.refresh(db_meeting)
    return db_meeting


def delete_meeting(db: Session, meeting_id: int) -> bool:
    """
    Delete a meeting and cascade delete all associated records.
    Returns True if deleted, False if meeting was not found.
    """
    db_meeting = db.scalars(select(Meeting).where(Meeting.id == meeting_id)).first()
    if not db_meeting:
        return False

    db.delete(db_meeting)
    db.commit()
    return True
