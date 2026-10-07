from datetime import datetime
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import Boolean, DateTime, Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.meeting import Meeting

class ActionItem(Base, TimestampMixin):
    """
    Action items extracted by AI or added manually from meeting discussions.
    """
    __tablename__ = "action_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    task: Mapped[str] = mapped_column(Text, nullable=False)
    assignee: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    due_date: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_completed: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    priority: Mapped[str] = mapped_column(String(20), default="medium", nullable=False)  # low | medium | high
    transcript_timestamp: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Jump point in audio

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="action_items")

class AISummary(Base, TimestampMixin):
    """
    Consolidated AI meeting analysis including executive overview,
    bulleted takeaways, decisions made, and sentiment metrics.
    """
    __tablename__ = "ai_summaries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    overview: Mapped[str] = mapped_column(Text, nullable=False)
    key_points: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    decisions: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)
    sentiment_breakdown: Mapped[Dict[str, Any]] = mapped_column(JSON, default=dict, nullable=False)
    topics: Mapped[List[str]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="summary")
