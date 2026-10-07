# Architecture & Directory Structure

## System Architecture Overview

The system is designed as a decoupled full-stack application:
- **Frontend**: Next.js 14+ (App Router, TypeScript, Tailwind CSS, Lucide Icons)
- **Backend**: FastAPI (Python 3.10+, SQLAlchemy 2.0, Pydantic v2, SQLite)
- **Storage**: Local SQLite database with file storage for meeting audio artifacts

```
+-------------------------------------------------------------+
|                     Next.js (Frontend)                      |
|  - Dashboard & Meeting List                                 |
|  - Interactive Transcript Player (Bidirectional Audio Sync) |
|  - AI Summary, Action Items & Speaker Analytics             |
+------------------------------+------------------------------+
                               | REST APIs (JSON / CORS)
+------------------------------v------------------------------+
|                     FastAPI (Backend)                       |
|  [ Routers ]   -> API endpoints, HTTP contracts             |
|  [ Services ]  -> Business logic & analytics calculations   |
|  [ Schemas ]   -> Pydantic models for validation            |
|  [ Models ]    -> SQLAlchemy ORM models                     |
+------------------------------+------------------------------+
                               | SQLite Driver
+------------------------------v------------------------------+
|                      SQLite Database                        |
|  - meetings, transcript_segments, action_items, topics      |
+-------------------------------------------------------------+
```

---

## Directory Structure

```
OA/
├── docs/
│   ├── project_plan.md           # Development phases & milestones
│   └── architecture.md           # System architecture & folder layout
│
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py               # FastAPI application entrypoint & middleware
│   │   ├── deps.py               # Dependency injection (e.g., db session)
│   │   │
│   │   ├── core/                 # App configuration & database engine
│   │   │   ├── __init__.py
│   │   │   ├── config.py         # App settings via Pydantic BaseSettings
│   │   │   └── database.py       # SQLAlchemy engine & sessionmaker
│   │   │
│   │   ├── models/               # SQLAlchemy ORM models (Persistence)
│   │   │   ├── __init__.py
│   │   │   ├── base.py           # Base model with common columns
│   │   │   ├── meeting.py        # Meeting entity
│   │   │   ├── transcript.py     # TranscriptSegment entity
│   │   │   └── action_item.py    # ActionItem entity
│   │   │
│   │   ├── schemas/              # Pydantic v2 schemas (Validation / DTO)
│   │   │   ├── __init__.py
│   │   │   ├── common.py         # Standard response wrappers & pagination
│   │   │   ├── meeting.py        # MeetingCreate, MeetingUpdate, MeetingResponse
│   │   │   ├── transcript.py     # SegmentCreate, SegmentResponse
│   │   │   └── action_item.py    # ActionItemCreate, ActionItemResponse
│   │   │
│   │   ├── services/             # Business logic layer
│   │   │   ├── __init__.py
│   │   │   ├── meeting_service.py    # Meeting queries, creation, stats
│   │   │   ├── transcript_service.py # Segment retrieval, keyword search
│   │   │   ├── action_item_service.py# Action item status toggling & assignment
│   │   │   └── analytics_service.py  # Talk time & sentiment computation
│   │   │
│   │   ├── routers/              # API Route Controllers
│   │   │   ├── __init__.py
│   │   │   ├── api_v1.py         # Router aggregation (/api/v1 prefix)
│   │   │   ├── meetings.py       # Meeting endpoints
│   │   │   ├── transcripts.py    # Transcript endpoints
│   │   │   └── action_items.py   # Action item endpoints
│   │   │
│   │   └── seeds/                # Seed script for realistic demo data
│   │       ├── __init__.py
│   │       └── seed_data.py      # Preloaded sample meetings & transcripts
│   │
│   ├── tests/                    # Backend unit & integration tests
│   ├── requirements.txt          # Python dependencies
│   ├── .env.example              # Environment variables template
│   └── run.py                    # Uvicorn execution helper
│
└── frontend/
    ├── src/
    │   ├── app/                  # Next.js App Router pages
    │   │   ├── layout.tsx        # Global layout & metadata
    │   │   ├── page.tsx          # Dashboard / Meetings library
    │   │   ├── meetings/
    │   │   │   └── [id]/
    │   │   │       └── page.tsx  # Interactive Meeting & Transcript view
    │   │   └── globals.css       # Global styles & Tailwind configuration
    │   │
    │   ├── components/           # UI Components
    │   │   ├── layout/           # Sidebar, Navbar, Header
    │   │   │   ├── Sidebar.tsx
    │   │   │   └── Header.tsx
    │   │   ├── meeting/          # Meeting specific components
    │   │   │   ├── MeetingCard.tsx
    │   │   │   ├── MeetingList.tsx
    │   │   │   └── NewMeetingModal.tsx
    │   │   ├── transcript/       # Interactive Transcript components
    │   │   │   ├── TranscriptViewer.tsx
    │   │   │   ├── TranscriptSegmentItem.tsx
    │   │   │   ├── TranscriptSearch.tsx
    │   │   │   └── SpeakerFilter.tsx
    │   │   ├── player/           # Media player components
    │   │   │   ├── AudioPlayer.tsx
    │   │   │   └── ProgressBar.tsx
    │   │   ├── summary/          # AI Insights & Action Items
    │   │   │   ├── SummaryTab.tsx
    │   │   │   ├── ActionItemsList.tsx
    │   │   │   └── SpeakerStats.tsx
    │   │   └── ui/               # Reusable primitives (buttons, badges, modals)
    │   │       ├── Button.tsx
    │   │       ├── Badge.tsx
    │   │       └── Input.tsx
    │   │
    │   ├── hooks/                # Custom React Hooks
    │   │   ├── useAudioPlayer.ts # Web Audio / HTML5 audio controller
    │   │   └── useTranscriptSync.ts # Syncs playback time with transcript lines
    │   │
    │   ├── lib/                  # Utilities & API client
    │   │   ├── api.ts            # Typed Axios / Fetch client
    │   │   ├── utils.ts          # Formatting helpers (timestamps, durations)
    │   │   └── constants.ts      # App constants
    │   │
    │   └── types/                # TypeScript interfaces
    │       ├── meeting.ts
    │       ├── transcript.ts
    │       └── actionItem.ts
    │
    ├── public/                   # Static assets & demo audio files
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── .env.example
```

---

## Architectural Principles

1. **Separation of Concerns**:
   - Routers only handle HTTP-level details (parameters, status codes).
   - Services execute business rules, validation, and database operations.
   - Schemas enforce strict input/output data contracts.
   - Models represent the persistent database entities.
2. **Modular Extensibility**:
   - New capabilities (e.g., real-time transcription via WebSockets or Whisper integration) can be added as isolated services without refactoring controllers.
3. **Bi-directional Transcript Synchronization**:
   - Audio playback position continuously drives active segment highlighting in the transcript viewer.
   - User interactions (clicking timestamps, words, or speaker bubbles) instantly seek the audio player to the corresponding offset.
