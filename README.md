# Fireflies.ai Clone — AI Meeting Intelligence Platform

> An end-to-end, full-stack meeting recording, transcription, AI summarization, and interactive transcript review platform inspired by **Fireflies.ai**. Built with **Next.js 14**, **Tailwind CSS**, **FastAPI**, **SQLAlchemy 2.0**, and **SQLite**.

---

## ⚡ Core Features

### 1. 🎙️ Interactive Transcript & Bidirectional Audio Sync
* **Click-to-Seek**: Clicking any transcript segment instantly scrubs the media player to that exact start timestamp and triggers synchronized playback.
* **Playback Highlighting & Auto-Scroll**: As audio plays, the custom `useTranscriptSync` hook identifies the active segment, applies an indigo glow with an animated indicator, and smoothly centers it in view.
* **Inline Transcript Search**: Real-time keyword search dynamically highlights text matches with amber `<mark>` badges.
* **Speaker Isolation Filter**: One-click speaker filters isolate dialogue for specific participants.

### 2. 🤖 AI Summary & Meeting Insights
* **Executive Overview**: High-level synthesis of meeting discussions.
* **Key Takeaways & Decisions**: Bulleted summaries with dedicated icons.
* **Sentiment Breakdown**: Real-time positive, neutral, and negative sentiment distribution bars.
* **Smart Topic Trackers & Tags**: Categorized badges with jump-to-timestamp links.

### 3. ✅ Action Items Management
* **Task Checklist**: Lists extracted action items with assignees, priority indicators, and audio timestamps.
* **Real-time Persistence**: Interactive checkboxes optimistically update the UI and synchronize changes to the SQLite database via `PATCH /api/v1/action-items/:id`.

### 4. 📊 Speaker Talk-Time Analytics
* Calculates exact speaking duration, talk-time percentage, and segment counts per participant.
* Color-coded participant avatars with initials and visual progress distribution bars.

### 5. 🗂️ Meetings Library & Dashboard
* Complete card overview of past meetings with title, duration, date, and participant chips.
* **Search, Filter & Sort**: Live debounced search, status filter (`completed`, `processing`, `failed`), and sorting (`Newest`, `Oldest`, `Duration`, `Title A-Z`).
* **Full CRUD Operations**: Modal for creating new meetings, inline title editing in detail view, and cascading meeting deletion.

### 6. 📱 Responsive 3-Panel Layout
* **Desktop**: Full 3-column split view (Filter Sidebar, Player & Transcript, AI Summary & Action Items).
* **Mobile / Tablet**: Collapsible sidebars with a segmented switcher between **Transcript** and **AI Insights & Tasks**, ensuring zero layout overflow.

---

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React Icons |
| **Backend** | FastAPI (Python 3.10+), Pydantic v2, Uvicorn (ASGI) |
| **Database & ORM** | SQLite, SQLAlchemy 2.0 (Cascading relationships, Selectinload) |
| **Deployment** | Vercel (Frontend), Render (Backend) |

---

## 📂 Project Directory Structure

```text
OA/
├── docs/
│   ├── project_plan.md           # Development phases & roadmap
│   └── architecture.md           # Layered system architecture specification
│
├── backend/
│   ├── app/
│   │   ├── core/
│   │   │   └── database.py       # SQLAlchemy engine & session factory
│   │   ├── crud/
│   │   │   ├── crud_meeting.py   # Meeting queries, filtering & cascade delete
│   │   │   └── crud_action_item.py # Action item toggle & updates
│   │   ├── models/
│   │   │   ├── base.py           # SQLAlchemy declarative base with timestamps
│   │   │   ├── meeting.py        # Meeting model
│   │   │   ├── transcript.py     # TranscriptSegment model
│   │   │   ├── action_item.py    # ActionItem & AISummary models
│   │   │   └── bonus.py          # SmartTag & QAChatHistory models
│   │   ├── routers/
│   │   │   ├── meetings.py       # /api/v1/meetings endpoints
│   │   │   └── action_items.py   # /api/v1/action-items endpoints
│   │   ├── schemas/
│   │   │   └── all_schemas.py    # Pydantic v2 validation models & DTOs
│   │   ├── seeds/
│   │   │   └── seed_data.py      # Multi-speaker demo meeting fixtures
│   │   └── main.py               # FastAPI entrypoint & CORS configuration
│   ├── tests/
│   │   └── test_api_crud.py      # Automated CRUD test runner
│   └── requirements.txt          # Python dependencies
│
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── layout.tsx        # Global dark layout with sidebar shell
    │   │   ├── page.tsx          # Dashboard page
    │   │   ├── globals.css       # Custom styles & progress bar utilities
    │   │   └── meetings/
    │   │       └── [id]/
    │   │           └── page.tsx  # Dynamic meeting detail route
    │   ├── components/
    │   │   ├── layout/
    │   │   │   └── Sidebar.tsx   # Left navigation bar
    │   │   └── meeting/
    │   │       ├── MeetingList.tsx       # Meeting cards, filters & creation modal
    │   │       └── MeetingDetailView.tsx # 3-panel audio player & transcript view
    │   ├── hooks/
    │   │   └── useTranscriptSync.ts      # Real-time audio sync hook
    │   ├── lib/
    │   │   ├── api.ts            # Typed REST API client
    │   │   └── utils.ts          # Formatting & speaker analytics helpers
    │   └── types/
    │       └── meeting.ts        # TypeScript data contracts
    ├── package.json
    ├── tailwind.config.ts
    └── .env.example
```

---

## 🚀 Local Setup Instructions

### Prerequisites
* **Node.js** (v18.17+ or v20+)
* **Python** (v3.10+)
* **Git**

---

### Step 1: Clone the Repository
```bash
git clone <your-repo-url>
cd OA
```

---

### Step 2: Backend Setup (FastAPI & SQLite)

1. Open a terminal and navigate to the project root:
   ```bash
   cd OA
   ```

2. (Optional) Create and activate a Python virtual environment:
   * **Windows:**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   * **macOS / Linux:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```

4. Seed the SQLite database with multi-speaker meeting demo data:
   ```bash
   python -m backend.app.seeds.seed_data
   ```

5. Start the FastAPI development server:
   ```bash
   python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   * API will be live at: `http://localhost:8000`
   * Interactive Swagger docs: `http://localhost:8000/docs`

---

### Step 3: Frontend Setup (Next.js 14)

1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd OA/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Defaults to `NEXT_PUBLIC_API_URL=http://localhost:8000`)*

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```
   * Frontend will be live at: `http://localhost:3000`

---

## 🧪 Testing CRUD Endpoints

You can run the automated backend test runner to verify all 6 CRUD operations:
```bash
python backend/tests/test_api_crud.py
```

Expected output:
```text
1. GET meetings: 3 meetings found [PASS]
2. POST meeting created ID: 4, Title: QA Test Meeting [PASS]
3. PATCH meeting updated Title: QA Test Meeting (Edited) [PASS]
4. GET meeting by ID: 4 confirmed [PASS]
5. PATCH action item 1 is_completed: True [PASS]
6. DELETE meeting 4 status: 204 [PASS]

ALL CRUD API TESTS PASSED!
```

---

## 📡 REST API Specification

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/meetings/` | List all meetings (supports `search`, `speaker`, `skip`, `limit`) |
| `POST` | `/api/v1/meetings/` | Create a new meeting |
| `GET` | `/api/v1/meetings/{id}` | Retrieve single meeting with transcripts, summary & actions |
| `PATCH` | `/api/v1/meetings/{id}` | Update meeting details (e.g. title, description, status) |
| `DELETE` | `/api/v1/meetings/{id}` | Delete meeting with cascade deletion of related records |
| `PATCH` | `/api/v1/action-items/{id}` | Toggle completion status (`is_completed`) of an action item |
| `GET` | `/health` | Service health status check |
