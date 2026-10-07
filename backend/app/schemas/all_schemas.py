from datetime import datetime
from typing import Any, Dict, List, Literal, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator

# ---------------------------------------------------------------------------
# Base Schema Configuration
# ---------------------------------------------------------------------------
class ORMBase(BaseModel):
    """Base schema enabling automatic serialization from SQLAlchemy ORM models."""
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)


# ---------------------------------------------------------------------------
# Transcript Schemas
# ---------------------------------------------------------------------------
class TranscriptSegmentBase(ORMBase):
    speaker: str = Field(..., min_length=1, max_length=100, description="Name or identifier of the speaker")
    start_time: float = Field(..., ge=0.0, description="Start timestamp in seconds")
    end_time: float = Field(..., ge=0.0, description="End timestamp in seconds")
    text: str = Field(..., min_length=1, description="Transcript speech content")
    sentiment: Optional[str] = Field(default="neutral", description="Sentiment of this segment (positive/neutral/negative)")
    is_bookmarked: bool = Field(default=False, description="Flag for user-saved highlight")
    order_index: int = Field(default=0, ge=0, description="Sequential ordering index")

    @field_validator("end_time")
    @classmethod
    def validate_end_time(cls, v: float, info) -> float:
        start_time = info.data.get("start_time")
        if start_time is not None and v < start_time:
            raise ValueError("end_time cannot precede start_time")
        return round(v, 2)

    @field_validator("start_time")
    @classmethod
    def round_start_time(cls, v: float) -> float:
        return round(v, 2)


class TranscriptSegmentCreate(TranscriptSegmentBase):
    meeting_id: Optional[int] = Field(default=None, description="Meeting ID (optional if injected via path param)")


class TranscriptSegmentUpdate(ORMBase):
    speaker: Optional[str] = Field(default=None, min_length=1, max_length=100)
    text: Optional[str] = Field(default=None, min_length=1)
    sentiment: Optional[str] = None
    is_bookmarked: Optional[bool] = None


class TranscriptSegmentResponse(TranscriptSegmentBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime


class TranscriptBulkCreate(ORMBase):
    segments: List[TranscriptSegmentCreate] = Field(..., min_length=1)


# ---------------------------------------------------------------------------
# Action Item Schemas
# ---------------------------------------------------------------------------
PriorityLevel = Literal["low", "medium", "high"]

class ActionItemBase(ORMBase):
    task: str = Field(..., min_length=1, description="Action item description")
    assignee: Optional[str] = Field(default=None, max_length=100, description="Person responsible")
    due_date: Optional[datetime] = Field(default=None, description="Due date timestamp")
    is_completed: bool = Field(default=False, description="Completion toggle state")
    priority: PriorityLevel = Field(default="medium", description="Priority level")
    transcript_timestamp: Optional[float] = Field(default=None, ge=0.0, description="Audio timestamp offset")


class ActionItemCreate(ActionItemBase):
    meeting_id: Optional[int] = Field(default=None, description="Meeting ID")


class ActionItemUpdate(ORMBase):
    task: Optional[str] = Field(default=None, min_length=1)
    assignee: Optional[str] = Field(default=None, max_length=100)
    due_date: Optional[datetime] = None
    is_completed: Optional[bool] = None
    priority: Optional[PriorityLevel] = None
    transcript_timestamp: Optional[float] = None


class ActionItemResponse(ActionItemBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# AI Summary Schemas
# ---------------------------------------------------------------------------
class AISummaryBase(ORMBase):
    overview: str = Field(..., min_length=1, description="High-level meeting overview")
    key_points: List[str] = Field(default_factory=list, description="Bulleted key takeaways")
    decisions: List[str] = Field(default_factory=list, description="Explicit decisions reached")
    sentiment_breakdown: Dict[str, Any] = Field(
        default_factory=lambda: {"positive": 0, "neutral": 100, "negative": 0},
        description="Sentiment distribution percentages",
    )
    topics: List[str] = Field(default_factory=list, description="High-level discussion themes")


class AISummaryCreate(AISummaryBase):
    meeting_id: Optional[int] = Field(default=None, description="Meeting ID")


class AISummaryUpdate(ORMBase):
    overview: Optional[str] = Field(default=None, min_length=1)
    key_points: Optional[List[str]] = None
    decisions: Optional[List[str]] = None
    sentiment_breakdown: Optional[Dict[str, Any]] = None
    topics: Optional[List[str]] = None


class AISummaryResponse(AISummaryBase):
    id: int
    meeting_id: int
    created_at: datetime
    updated_at: datetime


# ---------------------------------------------------------------------------
# Bonus Features: SmartTag & QA Chat Schemas
# ---------------------------------------------------------------------------
class SmartTagBase(ORMBase):
    tag_name: str = Field(..., min_length=1, max_length=100, description="Tag label")
    category: str = Field(default="topic", max_length=50, description="Tag category (e.g. topic, metric, urgency)")
    timestamp: Optional[float] = Field(default=None, ge=0.0, description="Jump point in audio")
    color: str = Field(default="#6366F1", max_length=30, description="Hex color badge string")

    @field_validator("color")
    @classmethod
    def validate_hex_color(cls, v: str) -> str:
        if not v.startswith("#") or len(v) not in (4, 7, 9):
            return "#6366F1"
        return v


class SmartTagCreate(SmartTagBase):
    meeting_id: Optional[int] = Field(default=None, description="Meeting ID")


class SmartTagResponse(SmartTagBase):
    id: int
    meeting_id: int
    created_at: datetime


class QAChatRequest(BaseModel):
    question: str = Field(..., min_length=2, max_length=2000, description="User question about the meeting")


class QAChatResponse(BaseModel):
    question: str
    answer: str
    cited_timestamps: List[Dict[str, Any]] = Field(default_factory=list, description="Segments cited in the answer")


class QAChatHistoryItemResponse(ORMBase):
    id: int
    meeting_id: int
    question: str
    answer: str
    cited_timestamps: List[Dict[str, Any]]
    created_at: datetime


# ---------------------------------------------------------------------------
# Meeting Schemas
# ---------------------------------------------------------------------------
MeetingStatus = Literal["processing", "completed", "failed"]

class MeetingBase(ORMBase):
    title: str = Field(..., min_length=1, max_length=255, description="Meeting title")
    description: Optional[str] = Field(default=None, description="Optional meeting agenda or notes")
    date: datetime = Field(default_factory=datetime.utcnow, description="Meeting date/time")
    duration: float = Field(default=0.0, ge=0.0, description="Total meeting audio duration in seconds")
    audio_url: Optional[str] = Field(default=None, max_length=512, description="Static or hosted audio URL")
    status: MeetingStatus = Field(default="completed", description="Processing state")
    sentiment: Optional[str] = Field(default="neutral", max_length=50, description="Overall meeting sentiment")
    speakers: List[str] = Field(default_factory=list, description="List of participant names")


class MeetingCreate(MeetingBase):
    pass


class MeetingUpdate(ORMBase):
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    description: Optional[str] = None
    date: Optional[datetime] = None
    duration: Optional[float] = Field(default=None, ge=0.0)
    audio_url: Optional[str] = Field(default=None, max_length=512)
    status: Optional[MeetingStatus] = None
    sentiment: Optional[str] = None
    speakers: Optional[List[str]] = None


class MeetingResponse(MeetingBase):
    id: int
    created_at: datetime
    updated_at: datetime


class MeetingDetailResponse(MeetingResponse):
    """
    Complete meeting entity including transcripts, summary,
    action items, smart tags, and conversational history.
    """
    summary: Optional[AISummaryResponse] = None
    action_items: List[ActionItemResponse] = Field(default_factory=list)
    transcripts: List[TranscriptSegmentResponse] = Field(default_factory=list)
    smart_tags: List[SmartTagResponse] = Field(default_factory=list)
    qa_chat_history: List[QAChatHistoryItemResponse] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Analytics Schemas
# ---------------------------------------------------------------------------
class SpeakerTalkTime(BaseModel):
    speaker: str
    duration_seconds: float
    percentage: float
    segment_count: int


class MeetingAnalyticsResponse(BaseModel):
    meeting_id: int
    total_duration_seconds: float
    total_words: int
    speakers_stats: List[SpeakerTalkTime]
    action_items_count: int
    completed_action_items_count: int
    overall_sentiment: str
