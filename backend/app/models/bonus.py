from typing import TYPE_CHECKING, Any, Dict, List, Optional
from sqlalchemy import Float, ForeignKey, Integer, String, Text, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.meeting import Meeting

class SmartTag(Base, TimestampMixin):
    """
    Bonus Feature: Smart AI-generated tags categorized by topic,
    pain-points, metrics, or feature requests with audio jump anchors.
    """
    __tablename__ = "smart_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    tag_name: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(50), default="topic", nullable=False)  # topic | metric | objection | feature
    timestamp: Mapped[Optional[float]] = mapped_column(Float, nullable=True)  # Jump point in audio playback
    color: Mapped[str] = mapped_column(String(30), default="#6366F1", nullable=False)  # Hex badge color

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="smart_tags")

class QAChatHistory(Base, TimestampMixin):
    """
    Bonus Feature: 'Ask Fred' style conversational Q&A agent history
    specifically contextualized on the meeting's transcript and summary.
    """
    __tablename__ = "qa_chat_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    question: Mapped[str] = mapped_column(Text, nullable=False)
    answer: Mapped[str] = mapped_column(Text, nullable=False)
    cited_timestamps: Mapped[List[Dict[str, Any]]] = mapped_column(JSON, default=list, nullable=False)

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="qa_chat_history")
