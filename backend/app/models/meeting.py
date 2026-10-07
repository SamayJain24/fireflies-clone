from datetime import datetime, timezone
from typing import TYPE_CHECKING, List, Optional
from sqlalchemy import DateTime, Float, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.transcript import TranscriptSegment
    from backend.app.models.action_item import ActionItem, AISummary
    from backend.app.models.bonus import SmartTag, QAChatHistory

class Meeting(Base, TimestampMixin):
    """
    Core Meeting entity representing a recorded, transcribed session.
    """
    __tablename__ = "meetings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    date: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    duration: Mapped[float] = mapped_column(Float, default=0.0, nullable=False)  # Duration in seconds
    audio_url: Mapped[Optional[str]] = mapped_column(String(512), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="completed", nullable=False)  # processing | completed | failed
    sentiment: Mapped[Optional[str]] = mapped_column(String(50), default="neutral", nullable=True)
    speakers: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    transcripts: Mapped[List["TranscriptSegment"]] = relationship(
        "TranscriptSegment",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="TranscriptSegment.start_time",
    )
    action_items: Mapped[List["ActionItem"]] = relationship(
        "ActionItem",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="ActionItem.id",
    )
    summary: Mapped[Optional["AISummary"]] = relationship(
        "AISummary",
        back_populates="meeting",
        uselist=False,
        cascade="all, delete-orphan",
    )
    smart_tags: Mapped[List["SmartTag"]] = relationship(
        "SmartTag",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="SmartTag.id",
    )
    qa_chat_history: Mapped[List["QAChatHistory"]] = relationship(
        "QAChatHistory",
        back_populates="meeting",
        cascade="all, delete-orphan",
        order_by="QAChatHistory.created_at",
    )
