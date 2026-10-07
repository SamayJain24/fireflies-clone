import os
import sys
from datetime import datetime, timedelta, timezone

# Ensure project root is in sys.path
current_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.abspath(os.path.join(current_dir, "..", "..", ".."))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from backend.app.core.database import SessionLocal, init_db
from backend.app.models.meeting import Meeting
from backend.app.models.transcript import TranscriptSegment
from backend.app.models.action_item import ActionItem, AISummary
from backend.app.models.bonus import SmartTag, QAChatHistory


def run_seed() -> None:
    """
    Seed database with 3 realistic engineering meetings containing
    transcripts, AI summaries, action items, smart tags, and QA history.
    """
    print("Initializing database tables...")
    init_db()

    db = SessionLocal()
    try:
        # Check if meetings already exist to prevent redundant duplicates
        existing_count = db.query(Meeting).count()
        if existing_count > 0:
            print(f"Database already contains {existing_count} meetings. Purging old seed data...")
            db.query(Meeting).delete()
            db.commit()

        now = datetime.now(timezone.utc)

        # =========================================================================
        # Meeting 1: SDE Assignment Planning
        # =========================================================================
        print("Creating Meeting 1: SDE Assignment Planning...")
        meeting1 = Meeting(
            title="SDE Assignment Planning",
            description="Technical architecture alignment, schema design, and bidirectional transcript sync for Fireflies.ai clone.",
            date=now - timedelta(days=2),
            duration=240.0,
            audio_url="/audio/sde_planning.mp3",
            status="completed",
            sentiment="positive",
            speakers=["Alex Rivera", "Samantha Chen", "David Kim"],
        )
        db.add(meeting1)
        db.flush()

        meeting1_transcripts = [
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Alex Rivera",
                start_time=0.0,
                end_time=14.8,
                text="Hey team, welcome to our planning session for the Fireflies.ai clone assignment. Let's align on technical choices and milestones.",
                sentiment="neutral",
                is_bookmarked=False,
                order_index=0,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Samantha Chen",
                start_time=15.2,
                end_time=31.5,
                text="Thanks Alex. I reviewed the spec. For the frontend, Next.js 14 with TypeScript and Tailwind CSS gives us clean component architecture and responsive audio sync.",
                sentiment="positive",
                is_bookmarked=True,
                order_index=1,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="David Kim",
                start_time=32.0,
                end_time=54.6,
                text="Agreed. On the backend, FastAPI with SQLAlchemy and SQLite is ideal. SQLite handles concurrent reads gracefully, and FastAPI automatically generates our OpenAPI spec.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=2,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Alex Rivera",
                start_time=55.0,
                end_time=77.8,
                text="Great. One critical requirement is bidirectional sync: clicking a transcript timestamp must jump playback, and playing audio must highlight the current active segment.",
                sentiment="neutral",
                is_bookmarked=True,
                order_index=3,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Samantha Chen",
                start_time=78.2,
                end_time=101.4,
                text="I will implement a custom hook useTranscriptSync that listens to audioRef.currentTime and auto-scrolls the active bubble into view smoothly.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=4,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="David Kim",
                start_time=101.8,
                end_time=127.3,
                text="For the database schema, I've mapped meetings, transcripts, action_items, ai_summaries, and bonus tables like smart_tags and qa_chat.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=5,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Alex Rivera",
                start_time=127.8,
                end_time=161.5,
                text="Make sure we include speaker analytics to show talk-time percentages. That's a standout Fireflies feature reviewers look for.",
                sentiment="neutral",
                is_bookmarked=False,
                order_index=6,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Samantha Chen",
                start_time=162.0,
                end_time=197.8,
                text="I'll also add interactive checkboxes for action items so users can mark tasks done with instant feedback.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=7,
            ),
            TranscriptSegment(
                meeting_id=meeting1.id,
                speaker="Alex Rivera",
                start_time=198.2,
                end_time=238.5,
                text="Awesome. Let's aim to have the full stack integrated by Friday afternoon. Thanks everyone, let's build this!",
                sentiment="positive",
                is_bookmarked=True,
                order_index=8,
            ),
        ]
        db.add_all(meeting1_transcripts)

        meeting1_summary = AISummary(
            meeting_id=meeting1.id,
            overview="The engineering team aligned on architecture for the Fireflies.ai clone. Next.js 14, FastAPI, and SQLite were chosen. Core development priorities include bidirectional audio-transcript sync, interactive action item management, and speaker talk-time distribution.",
            key_points=[
                "Selected Next.js 14 App Router, TypeScript, and Tailwind CSS for modern client performance.",
                "FastAPI with SQLite chosen for fast development, type safety, and automatic OpenAPI docs.",
                "Designed custom useTranscriptSync hook for seamless audio scrub and auto-scroll highlighting.",
                "Incorporated speaker analytics and conversational Q&A as key differentiator features.",
            ],
            decisions=[
                "Use SQLAlchemy 2.0 with cascade delete relationships for data consistency.",
                "Adopt dark-mode-first aesthetic inspired by Fireflies.ai.",
                "Target Friday afternoon for end-to-end integration demo.",
            ],
            sentiment_breakdown={"positive": 75, "neutral": 20, "negative": 5},
            topics=["System Architecture", "Bidirectional Sync", "Database Schema", "Speaker Analytics"],
        )
        db.add(meeting1_summary)

        meeting1_actions = [
            ActionItem(
                meeting_id=meeting1.id,
                task="Implement useTranscriptSync hook for bidirectional audio-transcript synchronization",
                assignee="Samantha Chen",
                due_date=now + timedelta(days=2),
                is_completed=False,
                priority="high",
                transcript_timestamp=78.2,
            ),
            ActionItem(
                meeting_id=meeting1.id,
                task="Finalize SQLite schema with cascading deletes for transcripts and summaries",
                assignee="David Kim",
                due_date=now + timedelta(days=1),
                is_completed=True,
                priority="high",
                transcript_timestamp=101.8,
            ),
            ActionItem(
                meeting_id=meeting1.id,
                task="Calculate speaker talk-time distribution and sentiment metrics",
                assignee="Alex Rivera",
                due_date=now + timedelta(days=3),
                is_completed=False,
                priority="medium",
                transcript_timestamp=127.8,
            ),
        ]
        db.add_all(meeting1_actions)

        meeting1_tags = [
            SmartTag(meeting_id=meeting1.id, tag_name="Tech Stack", category="topic", timestamp=15.2, color="#6366F1"),
            SmartTag(meeting_id=meeting1.id, tag_name="Audio Sync", category="feature", timestamp=55.0, color="#10B981"),
            SmartTag(meeting_id=meeting1.id, tag_name="Friday Deadline", category="urgency", timestamp=198.2, color="#F59E0B"),
        ]
        db.add_all(meeting1_tags)

        meeting1_qa = [
            QAChatHistory(
                meeting_id=meeting1.id,
                question="What tech stack did the team pick for the frontend and backend?",
                answer="The team selected Next.js 14 with TypeScript and Tailwind CSS for the frontend, and FastAPI with SQLAlchemy 2.0 and SQLite for the backend.",
                cited_timestamps=[
                    {"time": 15.2, "speaker": "Samantha Chen", "quote": "Next.js 14 with TypeScript and Tailwind CSS"},
                    {"time": 32.0, "speaker": "David Kim", "quote": "FastAPI with SQLAlchemy and SQLite is ideal"},
                ],
            ),
            QAChatHistory(
                meeting_id=meeting1.id,
                question="Who is responsible for the transcript synchronization?",
                answer="Samantha Chen is assigned to build the custom useTranscriptSync hook to handle audio scrubbing and automatic scroll highlighting.",
                cited_timestamps=[
                    {"time": 78.2, "speaker": "Samantha Chen", "quote": "I will implement a custom hook useTranscriptSync"},
                ],
            ),
        ]
        db.add_all(meeting1_qa)

        # =========================================================================
        # Meeting 2: Sprint Retrospective
        # =========================================================================
        print("Creating Meeting 2: Sprint Retrospective...")
        meeting2 = Meeting(
            title="Sprint Retrospective",
            description="Review of Sprint 24 achievements, code review bottlenecks, and test pipeline optimizations.",
            date=now - timedelta(days=5),
            duration=215.0,
            audio_url="/audio/sprint_retro.mp3",
            status="completed",
            sentiment="positive",
            speakers=["Elena Rostova", "Marcus Vance", "Priya Patel"],
        )
        db.add(meeting2)
        db.flush()

        meeting2_transcripts = [
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Elena Rostova",
                start_time=0.0,
                end_time=16.4,
                text="Welcome everyone to our Sprint 24 Retro. Overall we shipped 92% of committed story points, which is a solid improvement.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=0,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Marcus Vance",
                start_time=17.0,
                end_time=38.2,
                text="The highlight was definitely the migration to async database sessions and automated lint checks. It caught several edge cases before staging.",
                sentiment="positive",
                is_bookmarked=True,
                order_index=1,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Priya Patel",
                start_time=38.8,
                end_time=62.5,
                text="On the improvement side, PR reviews took an average of 18 hours to get first feedback. That caused a bottleneck near the end of the sprint.",
                sentiment="negative",
                is_bookmarked=False,
                order_index=2,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Elena Rostova",
                start_time=63.0,
                end_time=86.1,
                text="That's a valid callout. What if we establish a daily 30-minute review block right after standup so engineers can unblock peers?",
                sentiment="neutral",
                is_bookmarked=False,
                order_index=3,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Marcus Vance",
                start_time=86.8,
                end_time=111.3,
                text="I like that. Also, our GitHub Actions pipeline runs all end-to-end tests sequentially. If we shard them across 3 runners, CI time drops by 60%.",
                sentiment="positive",
                is_bookmarked=True,
                order_index=4,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Priya Patel",
                start_time=112.0,
                end_time=139.7,
                text="I can volunteer to configure parallel test matrices in GitHub Actions. We should also enforce 24-hour SLA on open PRs.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=5,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Elena Rostova",
                start_time=140.2,
                end_time=168.4,
                text="Great commitment Priya. Let's make sure we document this in our team engineering handbook so everyone stays aligned.",
                sentiment="neutral",
                is_bookmarked=False,
                order_index=6,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Marcus Vance",
                start_time=169.0,
                end_time=192.5,
                text="Kudos to the entire frontend squad for squashing audio buffering glitches on Safari. The user feedback has been great.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=7,
            ),
            TranscriptSegment(
                meeting_id=meeting2.id,
                speaker="Elena Rostova",
                start_time=193.0,
                end_time=214.2,
                text="Fantastic work team. Let's carry this momentum into Sprint 25. Meeting adjourned!",
                sentiment="positive",
                is_bookmarked=False,
                order_index=8,
            ),
        ]
        db.add_all(meeting2_transcripts)

        meeting2_summary = AISummary(
            meeting_id=meeting2.id,
            overview="Sprint 24 Retro highlighted a 92% story point completion rate and successful async DB refactor. The primary friction point was PR turnaround time, which the team resolved by introducing daily review blocks and parallelized CI testing.",
            key_points=[
                "Achieved 92% velocity commitment in Sprint 24.",
                "PR review turnaround averaged 18 hours, slowing downstream release flow.",
                "Agreed to parallelize CI test suites across multiple GitHub runners to reduce cycle time by 60%.",
                "Recognized frontend team for resolving Safari audio buffering defects.",
            ],
            decisions=[
                "Institute a 30-minute daily team PR review window immediately after morning standup.",
                "Adopt a 24-hour service level objective for all initial PR feedback.",
            ],
            sentiment_breakdown={"positive": 70, "neutral": 20, "negative": 10},
            topics=["Sprint Velocity", "Code Review Bottlenecks", "CI Pipeline Optimization", "Audio Playback"],
        )
        db.add(meeting2_summary)

        meeting2_actions = [
            ActionItem(
                meeting_id=meeting2.id,
                task="Configure parallel GitHub Actions test matrix across 3 runners",
                assignee="Priya Patel",
                due_date=now + timedelta(days=3),
                is_completed=False,
                priority="high",
                transcript_timestamp=112.0,
            ),
            ActionItem(
                meeting_id=meeting2.id,
                task="Schedule daily 30-minute post-standup PR review blocks on team calendar",
                assignee="Elena Rostova",
                due_date=now + timedelta(days=1),
                is_completed=True,
                priority="medium",
                transcript_timestamp=63.0,
            ),
            ActionItem(
                meeting_id=meeting2.id,
                task="Update engineering handbook with PR review SLA guidelines",
                assignee="Marcus Vance",
                due_date=now + timedelta(days=4),
                is_completed=False,
                priority="low",
                transcript_timestamp=140.2,
            ),
        ]
        db.add_all(meeting2_actions)

        meeting2_tags = [
            SmartTag(meeting_id=meeting2.id, tag_name="CI/CD Speed", category="metric", timestamp=86.8, color="#10B981"),
            SmartTag(meeting_id=meeting2.id, tag_name="PR SLA", category="process", timestamp=38.8, color="#EF4444"),
            SmartTag(meeting_id=meeting2.id, tag_name="Safari Fix", category="feature", timestamp=169.0, color="#6366F1"),
        ]
        db.add_all(meeting2_tags)

        meeting2_qa = [
            QAChatHistory(
                meeting_id=meeting2.id,
                question="What step was taken to address slow code reviews?",
                answer="The team decided to establish a dedicated 30-minute PR review block right after standup and set a 24-hour turnaround target.",
                cited_timestamps=[
                    {"time": 63.0, "speaker": "Elena Rostova", "quote": "daily 30-minute review block right after standup"},
                ],
            ),
        ]
        db.add_all(meeting2_qa)

        # =========================================================================
        # Meeting 3: Client Demo
        # =========================================================================
        print("Creating Meeting 3: Client Demo...")
        meeting3 = Meeting(
            title="Client Demo - Enterprise AI Meeting Assistant",
            description="Demonstration of meeting transcription, action item extraction, speaker analytics, and SOC2 compliance for prospective enterprise client.",
            date=now - timedelta(days=7),
            duration=265.0,
            audio_url="/audio/client_demo.mp3",
            status="completed",
            sentiment="positive",
            speakers=["Jordan Lee", "Rachel Adams", "Carlos Mendez"],
        )
        db.add(meeting3)
        db.flush()

        meeting3_transcripts = [
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Jordan Lee",
                start_time=0.0,
                end_time=18.5,
                text="Hi Rachel and Carlos, thank you for joining today. We're excited to demonstrate our AI meeting intelligence platform and show how it saves leadership 5+ hours weekly.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=0,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Rachel Adams",
                start_time=19.0,
                end_time=39.4,
                text="Hi Jordan. Our executive team attends 20 to 30 meetings per week. What we need most is accurate automated summaries and reliable action item tracking.",
                sentiment="neutral",
                is_bookmarked=True,
                order_index=1,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Jordan Lee",
                start_time=40.0,
                end_time=72.0,
                text="That's our exact core strength. As you see on the screen, our AI parses the recording into timestamped speaker bubbles, generates an executive summary, and extracts action items with assignees.",
                sentiment="positive",
                is_bookmarked=False,
                order_index=2,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Carlos Mendez",
                start_time=72.5,
                end_time=98.6,
                text="How does the interactive transcript work when a user wants to verify what was spoken without listening to the whole hour?",
                sentiment="neutral",
                is_bookmarked=False,
                order_index=3,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Jordan Lee",
                start_time=99.2,
                end_time=132.8,
                text="You can search any keyword like 'pricing' or click directly on any sentence. The audio scrubbing is completely bidirectional and jumps instantly to that exact moment.",
                sentiment="positive",
                is_bookmarked=True,
                order_index=4,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Rachel Adams",
                start_time=133.5,
                end_time=164.2,
                text="That's impressive. What about data security? Our legal counsel requires SOC2 Type II compliance and zero data retention for training.",
                sentiment="neutral",
                is_bookmarked=False,
                order_index=5,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Jordan Lee",
                start_time=164.8,
                end_time=201.0,
                text="We are SOC2 Type II certified. All audio and transcripts are encrypted at rest with AES-256 and customer data is strictly isolated with zero model retraining.",
                sentiment="positive",
                is_bookmarked=True,
                order_index=6,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Carlos Mendez",
                start_time=201.5,
                end_time=228.4,
                text="That satisfies our security criteria. We'd like to initiate a 14-day proof of concept with our 50-person engineering department.",
                sentiment="positive",
                is_bookmarked=True,
                order_index=7,
            ),
            TranscriptSegment(
                meeting_id=meeting3.id,
                speaker="Jordan Lee",
                start_time=229.0,
                end_time=264.5,
                text="Fantastic. I'll send over the enterprise POC agreement and security whitepaper by end of day today. Thank you Rachel and Carlos!",
                sentiment="positive",
                is_bookmarked=False,
                order_index=8,
            ),
        ]
        db.add_all(meeting3_transcripts)

        meeting3_summary = AISummary(
            meeting_id=meeting3.id,
            overview="Successful enterprise demonstration with prospective client representatives Rachel Adams and Carlos Mendez. Showcased bidirectional transcript scrubbing, action item extraction, and SOC2 enterprise security posture, resulting in approval for a 14-day 50-seat pilot.",
            key_points=[
                "Client pain point: Executive team overwhelmed with 20-30 weekly meetings needing automated takeaway synthesis.",
                "Showcased bidirectional audio scrubbing and keyword search within transcript view.",
                "Confirmed SOC2 Type II certification, AES-256 encryption, and zero model training on customer transcripts.",
                "Client agreed to launch a 14-day pilot with their 50-person engineering department.",
            ],
            decisions=[
                "Launch 14-day pilot program for 50 engineering seats.",
                "Provide SOC2 Type II audit report and security whitepaper alongside standard contract.",
            ],
            sentiment_breakdown={"positive": 85, "neutral": 15, "negative": 0},
            topics=["Enterprise Demo", "Bidirectional Scrubbing", "SOC2 Compliance", "Pilot Agreement"],
        )
        db.add(meeting3_summary)

        meeting3_actions = [
            ActionItem(
                meeting_id=meeting3.id,
                task="Send Enterprise POC agreement and SOC2 compliance whitepaper",
                assignee="Jordan Lee",
                due_date=now + timedelta(days=1),
                is_completed=False,
                priority="high",
                transcript_timestamp=229.0,
            ),
            ActionItem(
                meeting_id=meeting3.id,
                task="Prepare sandbox onboarding workspace for 50 pilot engineering users",
                assignee="Jordan Lee",
                due_date=now + timedelta(days=2),
                is_completed=False,
                priority="high",
                transcript_timestamp=201.5,
            ),
            ActionItem(
                meeting_id=meeting3.id,
                task="Schedule mid-pilot check-in call with Rachel Adams and Carlos Mendez",
                assignee="Jordan Lee",
                due_date=now + timedelta(days=7),
                is_completed=False,
                priority="medium",
                transcript_timestamp=229.0,
            ),
        ]
        db.add_all(meeting3_actions)

        meeting3_tags = [
            SmartTag(meeting_id=meeting3.id, tag_name="Enterprise Pilot", category="metric", timestamp=201.5, color="#10B981"),
            SmartTag(meeting_id=meeting3.id, tag_name="SOC2 Security", category="topic", timestamp=164.8, color="#6366F1"),
            SmartTag(meeting_id=meeting3.id, tag_name="Executive Time-Save", category="feature", timestamp=19.0, color="#F59E0B"),
        ]
        db.add_all(meeting3_tags)

        meeting3_qa = [
            QAChatHistory(
                meeting_id=meeting3.id,
                question="What security compliance standards does the platform adhere to?",
                answer="The platform is SOC2 Type II certified, features AES-256 encryption at rest, and guarantees zero training on customer data.",
                cited_timestamps=[
                    {"time": 164.8, "speaker": "Jordan Lee", "quote": "We are SOC2 Type II certified. All audio and transcripts are encrypted at rest with AES-256"},
                ],
            ),
            QAChatHistory(
                meeting_id=meeting3.id,
                question="What was the outcome of the client demonstration?",
                answer="The client agreed to initiate a 14-day proof of concept for their 50-person engineering team.",
                cited_timestamps=[
                    {"time": 201.5, "speaker": "Carlos Mendez", "quote": "We'd like to initiate a 14-day proof of concept with our 50-person engineering department"},
                ],
            ),
        ]
        db.add_all(meeting3_qa)

        db.commit()
        print("Successfully seeded 3 meetings with complete transcripts, summaries, action items, tags, and QA history!")

    except Exception as e:
        db.rollback()
        print(f"Error during database seeding: {e}")
        raise e
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()
