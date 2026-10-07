from typing import TYPE_CHECKING, Optional
from sqlalchemy import Boolean, Float, ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.app.models.base import Base, TimestampMixin

if TYPE_CHECKING:
    from backend.app.models.meeting import Meeting

class TranscriptSegment(Base, TimestampMixin):
    """
    Individual timestamped transcript segment tied to a speaker.
    Enables bidirectional audio scrubbing and synchronized highlight playback.
    """
    __tablename__ = "transcript_segments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True, index=True)
    meeting_id: Mapped[int] = mapped_column(
        Integer,
        ForeignKey("meetings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    speaker: Mapped[str] = mapped_column(String(100), nullable=False, index=True)
    start_time: Mapped[float] = mapped_column(Float, nullable=False, index=True)  # In seconds
    end_time: Mapped[float] = mapped_column(Float, nullable=False)  # In seconds
    text: Mapped[str] = mapped_column(Text, nullable=False)
    sentiment: Mapped[Optional[str]] = mapped_column(String(30), default="neutral", nullable=True)
    is_bookmarked: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    order_index: Mapped[int] = mapped_column(Integer, default=0, nullable=False)

    # Relationships
    meeting: Mapped["Meeting"] = relationship("Meeting", back_populates="transcripts")
