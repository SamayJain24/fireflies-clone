# Fireflies.ai Clone - Project Plan

## Overview
This document outlines the end-to-end roadmap for building a full-stack Fireflies.ai clone. The system features an AI-powered meeting recording, transcription, summarization, and interactive transcript review platform.

---

## Phase 1: Setup & Documentation
- [ ] Initialize repository structure with separate `/frontend` and `/backend` directories.
- [ ] Configure FastAPI backend with Python virtual environment (`venv`), SQLite database, and CORS middleware for frontend communication.
- [ ] Set up Next.js (TypeScript, App Router, Tailwind CSS, Lucide React icons).
- [ ] Establish environment variable configurations (`.env.example` for both services).
- [ ] Create documentation baseline (`project_plan.md` and `architecture.md`).

---

## Phase 2: Database Schema & API Design
- [ ] **Data Modeling (SQLAlchemy / SQLite)**:
  - `Meeting`: Title, date, duration, status, audio URL, overall summary, sentiment, timestamps.
  - `TranscriptSegment`: Meeting ID, speaker name/label, start time, end time, text, sentiment, bookmark status.
  - `ActionItem`: Meeting ID, task description, assignee, due date, completion status.
  - `Topic`: Meeting ID, topic label, timestamp occurrences.
- [ ] **Pydantic Schemas**:
  - Request validation and response schemas for meetings, transcript segments, action items, and analytics.
- [ ] **REST API Specification**:
  - `GET /api/v1/meetings`: List all meetings with pagination, search, and filtering.
  - `POST /api/v1/meetings`: Create/upload a new meeting.
  - `GET /api/v1/meetings/{id}`: Detailed meeting payload (metadata, summary, action items).
  - `GET /api/v1/meetings/{id}/transcript`: Segments with timestamps and speakers.
  - `PATCH /api/v1/action-items/{id}`: Toggle completion status or edit assignee.
  - `POST /api/v1/meetings/{id}/seed`: Populate pre-processed demo meeting data.

---

## Phase 3: Backend CRUD & Business Logic
- [ ] Implement modular layered architecture:
  - **Routers**: Routing, query parsing, status codes, OpenAPI docs.
  - **Services**: Business logic, transcript search, speaker talk-time aggregation, audio file handling.
  - **Models & Schemas**: Separation between persistent entities and serialization schemas.
  - **Dependencies**: Database session management (`get_db`), error handlers.
- [ ] Build seed script with realistic multi-speaker meeting fixtures, timestamps, bulleted summaries, action items, and audio clips.

---

## Phase 4: Frontend UI & Interactive Transcript
- [ ] **Design System & Shell**:
  - Modern, dark-mode-first aesthetic inspired by Fireflies.ai (deep slate surfaces, indigo/violet accents, crisp typography).
  - Navigation sidebar: Meetings list, analytics, search, settings.
- [ ] **Meeting Library**:
  - Meeting cards with duration, date, speaker chips, key action items preview, and status badges.
- [ ] **Interactive Player & Transcript View**:
  - Audio playback bar with play/pause, scrub, playback speed (0.75x - 2x), and volume.
  - Two-way transcript sync:
    - Audio playback automatically scrolls to and highlights the active transcript segment.
    - Clicking any word or timestamp jumps audio playback to that exact second.
  - Speaker filtering and inline transcript search with highlight matches.
- [ ] **AI Insights & Summary Panel**:
  - Executive Overview tab.
  - Action Items checklist with real-time toggle.
  - Key Topics / Keywords chips with click-to-timestamp navigation.
  - Speaker talk-time analytics (percentage bar / metrics).

---

## Phase 5: Integration & Polish
- [ ] Connect Next.js client with FastAPI backend using typed API services.
- [ ] Add loading skeletons, optimistic updates for action items, and error toasts.
- [ ] Audio sync fine-tuning (smooth auto-scroll with user-override handling).
- [ ] End-to-end verification and testing of complete meeting workflow.
