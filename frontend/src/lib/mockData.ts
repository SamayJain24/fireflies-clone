import type { MeetingDetail, Meeting, SpeakerStat } from '@/types/meeting';

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 1,
    title: 'SDE Assignment Planning',
    description: 'Technical architecture alignment, schema design, and bidirectional transcript sync for Fireflies.ai clone.',
    date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 240,
    audio_url: null,
    status: 'completed',
    sentiment: 'positive',
    speakers: ['Alex Rivera', 'Samantha Chen', 'David Kim'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 2,
    title: 'Sprint Retrospective',
    description: 'Review of Sprint 24 achievements, code review bottlenecks, and test pipeline optimizations.',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 215,
    audio_url: null,
    status: 'completed',
    sentiment: 'positive',
    speakers: ['Elena Rostova', 'Marcus Vance', 'Priya Patel'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 3,
    title: 'Client Demo – Enterprise AI Meeting Assistant',
    description: 'Demonstration of meeting transcription, action item extraction, speaker analytics, and SOC2 compliance for prospective enterprise client.',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 265,
    audio_url: null,
    status: 'completed',
    sentiment: 'positive',
    speakers: ['Jordan Lee', 'Rachel Adams', 'Carlos Mendez'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const MOCK_MEETING_DETAILS: Record<number, MeetingDetail> = {
  1: {
    ...MOCK_MEETINGS[0],
    transcripts: [
      { id: 1, speaker: 'Alex Rivera', start_time: 0, end_time: 14.8, text: "Hey team, welcome to our planning session for the Fireflies.ai clone assignment. Let's align on technical choices and milestones.", sentiment: 'neutral', is_bookmarked: false, order_index: 0 },
      { id: 2, speaker: 'Samantha Chen', start_time: 15.2, end_time: 31.5, text: "Thanks Alex. I reviewed the spec. For the frontend, Next.js 14 with TypeScript and Tailwind CSS gives us clean component architecture and responsive audio sync.", sentiment: 'positive', is_bookmarked: true, order_index: 1 },
      { id: 3, speaker: 'David Kim', start_time: 32, end_time: 54.6, text: "Agreed. On the backend, FastAPI with SQLAlchemy and SQLite is ideal. SQLite handles concurrent reads gracefully, and FastAPI automatically generates our OpenAPI spec.", sentiment: 'positive', is_bookmarked: false, order_index: 2 },
      { id: 4, speaker: 'Alex Rivera', start_time: 55, end_time: 77.8, text: "Great. One critical requirement is bidirectional sync: clicking a transcript timestamp must jump playback, and playing audio must highlight the current active segment.", sentiment: 'neutral', is_bookmarked: true, order_index: 3 },
      { id: 5, speaker: 'Samantha Chen', start_time: 78.2, end_time: 101.4, text: "I will implement a custom hook useTranscriptSync that listens to audioRef.currentTime and auto-scrolls the active bubble into view smoothly.", sentiment: 'positive', is_bookmarked: false, order_index: 4 },
      { id: 6, speaker: 'David Kim', start_time: 101.8, end_time: 127.3, text: "For the database schema, I've mapped meetings, transcripts, action_items, ai_summaries, and bonus tables like smart_tags and qa_chat.", sentiment: 'positive', is_bookmarked: false, order_index: 5 },
      { id: 7, speaker: 'Alex Rivera', start_time: 127.8, end_time: 161.5, text: "Make sure we include speaker analytics to show talk-time percentages. That's a standout Fireflies feature reviewers look for.", sentiment: 'neutral', is_bookmarked: false, order_index: 6 },
      { id: 8, speaker: 'Samantha Chen', start_time: 162, end_time: 197.8, text: "I'll also add interactive checkboxes for action items so users can mark tasks done with instant feedback.", sentiment: 'positive', is_bookmarked: false, order_index: 7 },
      { id: 9, speaker: 'Alex Rivera', start_time: 198.2, end_time: 238.5, text: "Awesome. Let's aim to have the full stack integrated by Friday afternoon. Thanks everyone, let's build this!", sentiment: 'positive', is_bookmarked: true, order_index: 8 },
    ],
    action_items: [
      { id: 1, task: 'Implement useTranscriptSync hook for bidirectional audio-transcript synchronization', assignee: 'Samantha Chen', due_date: null, is_completed: false, priority: 'high', transcript_timestamp: 78.2 },
      { id: 2, task: 'Finalize SQLite schema with cascading deletes for transcripts and summaries', assignee: 'David Kim', due_date: null, is_completed: true, priority: 'high', transcript_timestamp: 101.8 },
      { id: 3, task: 'Calculate speaker talk-time distribution and sentiment metrics', assignee: 'Alex Rivera', due_date: null, is_completed: false, priority: 'medium', transcript_timestamp: 127.8 },
    ],
    summary: {
      id: 1,
      overview: "The engineering team aligned on architecture for the Fireflies.ai clone. Next.js 14, FastAPI, and SQLite were chosen. Core development priorities include bidirectional audio-transcript sync, interactive action item management, and speaker talk-time distribution.",
      key_points: [
        "Selected Next.js 14 App Router, TypeScript, and Tailwind CSS for modern client performance.",
        "FastAPI with SQLite chosen for fast development, type safety, and automatic OpenAPI docs.",
        "Designed custom useTranscriptSync hook for seamless audio scrub and auto-scroll highlighting.",
        "Incorporated speaker analytics and conversational Q&A as key differentiator features.",
      ],
      decisions: [
        "Use SQLAlchemy 2.0 with cascade delete relationships for data consistency.",
        "Adopt dark-mode-first aesthetic inspired by Fireflies.ai.",
        "Target Friday afternoon for end-to-end integration demo.",
      ],
      sentiment_breakdown: { positive: 75, neutral: 20, negative: 5 },
      topics: ['System Architecture', 'Bidirectional Sync', 'Database Schema', 'Speaker Analytics'],
    },
    smart_tags: [
      { id: 1, tag_name: 'Tech Stack', category: 'topic', timestamp: 15.2, color: '#6366F1' },
      { id: 2, tag_name: 'Audio Sync', category: 'feature', timestamp: 55.0, color: '#10B981' },
      { id: 3, tag_name: 'Friday Deadline', category: 'urgency', timestamp: 198.2, color: '#F59E0B' },
    ],
  },
  2: {
    ...MOCK_MEETINGS[1],
    transcripts: [
      { id: 10, speaker: 'Elena Rostova', start_time: 0, end_time: 16.4, text: "Welcome everyone to our Sprint 24 Retro. Overall we shipped 92% of committed story points, which is a solid improvement.", sentiment: 'positive', is_bookmarked: false, order_index: 0 },
      { id: 11, speaker: 'Marcus Vance', start_time: 17, end_time: 38.2, text: "The highlight was definitely the migration to async database sessions and automated lint checks. It caught several edge cases before staging.", sentiment: 'positive', is_bookmarked: true, order_index: 1 },
      { id: 12, speaker: 'Priya Patel', start_time: 38.8, end_time: 62.5, text: "On the improvement side, PR reviews took an average of 18 hours to get first feedback. That caused a bottleneck near the end of the sprint.", sentiment: 'negative', is_bookmarked: false, order_index: 2 },
      { id: 13, speaker: 'Elena Rostova', start_time: 63, end_time: 86.1, text: "That's a valid callout. What if we establish a daily 30-minute review block right after standup so engineers can unblock peers?", sentiment: 'neutral', is_bookmarked: false, order_index: 3 },
      { id: 14, speaker: 'Marcus Vance', start_time: 86.8, end_time: 111.3, text: "I like that. Also, our GitHub Actions pipeline runs all end-to-end tests sequentially. If we shard them across 3 runners, CI time drops by 60%.", sentiment: 'positive', is_bookmarked: true, order_index: 4 },
      { id: 15, speaker: 'Priya Patel', start_time: 112, end_time: 139.7, text: "I can volunteer to configure parallel test matrices in GitHub Actions. We should also enforce 24-hour SLA on open PRs.", sentiment: 'positive', is_bookmarked: false, order_index: 5 },
      { id: 16, speaker: 'Elena Rostova', start_time: 140.2, end_time: 168.4, text: "Great commitment Priya. Let's make sure we document this in our team engineering handbook so everyone stays aligned.", sentiment: 'neutral', is_bookmarked: false, order_index: 6 },
      { id: 17, speaker: 'Marcus Vance', start_time: 169, end_time: 192.5, text: "Kudos to the entire frontend squad for squashing audio buffering glitches on Safari. The user feedback has been great.", sentiment: 'positive', is_bookmarked: false, order_index: 7 },
      { id: 18, speaker: 'Elena Rostova', start_time: 193, end_time: 214.2, text: "Fantastic work team. Let's carry this momentum into Sprint 25. Meeting adjourned!", sentiment: 'positive', is_bookmarked: false, order_index: 8 },
    ],
    action_items: [
      { id: 4, task: 'Configure parallel GitHub Actions test matrix across 3 runners', assignee: 'Priya Patel', due_date: null, is_completed: false, priority: 'high', transcript_timestamp: 112 },
      { id: 5, task: 'Schedule daily 30-minute post-standup PR review blocks on team calendar', assignee: 'Elena Rostova', due_date: null, is_completed: true, priority: 'medium', transcript_timestamp: 63 },
      { id: 6, task: 'Update engineering handbook with PR review SLA guidelines', assignee: 'Marcus Vance', due_date: null, is_completed: false, priority: 'low', transcript_timestamp: 140.2 },
    ],
    summary: {
      id: 2,
      overview: "Sprint 24 Retro highlighted a 92% story point completion rate and successful async DB refactor. The primary friction point was PR turnaround time, which the team resolved by introducing daily review blocks and parallelized CI testing.",
      key_points: [
        "Achieved 92% velocity commitment in Sprint 24.",
        "PR review turnaround averaged 18 hours, slowing downstream release flow.",
        "Agreed to parallelize CI test suites across multiple GitHub runners to reduce cycle time by 60%.",
        "Recognized frontend team for resolving Safari audio buffering defects.",
      ],
      decisions: [
        "Institute a 30-minute daily team PR review window immediately after morning standup.",
        "Adopt a 24-hour service level objective for all initial PR feedback.",
      ],
      sentiment_breakdown: { positive: 70, neutral: 20, negative: 10 },
      topics: ['Sprint Velocity', 'Code Review Bottlenecks', 'CI Pipeline Optimization', 'Audio Playback'],
    },
    smart_tags: [
      { id: 4, tag_name: 'CI/CD Speed', category: 'metric', timestamp: 86.8, color: '#10B981' },
      { id: 5, tag_name: 'PR SLA', category: 'process', timestamp: 38.8, color: '#EF4444' },
      { id: 6, tag_name: 'Safari Fix', category: 'feature', timestamp: 169.0, color: '#6366F1' },
    ],
  },
  3: {
    ...MOCK_MEETINGS[2],
    transcripts: [
      { id: 19, speaker: 'Jordan Lee', start_time: 0, end_time: 18.5, text: "Hi Rachel and Carlos, thank you for joining today. We're excited to demonstrate our AI meeting intelligence platform and show how it saves leadership 5+ hours weekly.", sentiment: 'positive', is_bookmarked: false, order_index: 0 },
      { id: 20, speaker: 'Rachel Adams', start_time: 19, end_time: 39.4, text: "Hi Jordan. Our executive team attends 20 to 30 meetings per week. What we need most is accurate automated summaries and reliable action item tracking.", sentiment: 'neutral', is_bookmarked: true, order_index: 1 },
      { id: 21, speaker: 'Jordan Lee', start_time: 40, end_time: 72, text: "That's our exact core strength. As you see on the screen, our AI parses the recording into timestamped speaker bubbles, generates an executive summary, and extracts action items with assignees.", sentiment: 'positive', is_bookmarked: false, order_index: 2 },
      { id: 22, speaker: 'Carlos Mendez', start_time: 72.5, end_time: 98.6, text: "How does the interactive transcript work when a user wants to verify what was spoken without listening to the whole hour?", sentiment: 'neutral', is_bookmarked: false, order_index: 3 },
      { id: 23, speaker: 'Jordan Lee', start_time: 99.2, end_time: 132.8, text: "You can search any keyword like 'pricing' or click directly on any sentence. The audio scrubbing is completely bidirectional and jumps instantly to that exact moment.", sentiment: 'positive', is_bookmarked: true, order_index: 4 },
      { id: 24, speaker: 'Rachel Adams', start_time: 133.5, end_time: 164.2, text: "That's impressive. What about data security? Our legal counsel requires SOC2 Type II compliance and zero data retention for training.", sentiment: 'neutral', is_bookmarked: false, order_index: 5 },
      { id: 25, speaker: 'Jordan Lee', start_time: 164.8, end_time: 201, text: "We are SOC2 Type II certified. All audio and transcripts are encrypted at rest with AES-256 and customer data is strictly isolated with zero model retraining.", sentiment: 'positive', is_bookmarked: true, order_index: 6 },
      { id: 26, speaker: 'Carlos Mendez', start_time: 201.5, end_time: 228.4, text: "That satisfies our security criteria. We'd like to initiate a 14-day proof of concept with our 50-person engineering department.", sentiment: 'positive', is_bookmarked: true, order_index: 7 },
      { id: 27, speaker: 'Jordan Lee', start_time: 229, end_time: 264.5, text: "Fantastic. I'll send over the enterprise POC agreement and security whitepaper by end of day today. Thank you Rachel and Carlos!", sentiment: 'positive', is_bookmarked: false, order_index: 8 },
    ],
    action_items: [
      { id: 7, task: 'Send Enterprise POC agreement and SOC2 compliance whitepaper', assignee: 'Jordan Lee', due_date: null, is_completed: false, priority: 'high', transcript_timestamp: 229 },
      { id: 8, task: 'Prepare sandbox onboarding workspace for 50 pilot engineering users', assignee: 'Jordan Lee', due_date: null, is_completed: false, priority: 'high', transcript_timestamp: 201.5 },
      { id: 9, task: 'Schedule mid-pilot check-in call with Rachel Adams and Carlos Mendez', assignee: 'Jordan Lee', due_date: null, is_completed: false, priority: 'medium', transcript_timestamp: 229 },
    ],
    summary: {
      id: 3,
      overview: "Successful enterprise demonstration with prospective client representatives Rachel Adams and Carlos Mendez. Showcased bidirectional transcript scrubbing, action item extraction, and SOC2 enterprise security posture, resulting in approval for a 14-day 50-seat pilot.",
      key_points: [
        "Client pain point: Executive team overwhelmed with 20-30 weekly meetings needing automated takeaway synthesis.",
        "Showcased bidirectional audio scrubbing and keyword search within transcript view.",
        "Confirmed SOC2 Type II certification, AES-256 encryption, and zero model training on customer transcripts.",
        "Client agreed to launch a 14-day pilot with their 50-person engineering department.",
      ],
      decisions: [
        "Launch 14-day pilot program for 50 engineering seats.",
        "Provide SOC2 Type II audit report and security whitepaper alongside standard contract.",
      ],
      sentiment_breakdown: { positive: 85, neutral: 15, negative: 0 },
      topics: ['Enterprise Demo', 'Bidirectional Scrubbing', 'SOC2 Compliance', 'Pilot Agreement'],
    },
    smart_tags: [
      { id: 7, tag_name: 'Enterprise Pilot', category: 'metric', timestamp: 201.5, color: '#10B981' },
      { id: 8, tag_name: 'SOC2 Security', category: 'topic', timestamp: 164.8, color: '#6366F1' },
      { id: 9, tag_name: 'Executive Time-Save', category: 'feature', timestamp: 19.0, color: '#F59E0B' },
    ],
  },
};

export function computeSpeakerStats(meeting: MeetingDetail): SpeakerStat[] {
  const totals: Record<string, { duration: number; count: number }> = {};
  let totalDuration = 0;

  for (const seg of meeting.transcripts) {
    const dur = seg.end_time - seg.start_time;
    if (!totals[seg.speaker]) totals[seg.speaker] = { duration: 0, count: 0 };
    totals[seg.speaker].duration += dur;
    totals[seg.speaker].count += 1;
    totalDuration += dur;
  }

  return Object.entries(totals).map(([speaker, { duration, count }]) => ({
    speaker,
    duration_seconds: Math.round(duration),
    percentage: totalDuration > 0 ? Math.round((duration / totalDuration) * 100) : 0,
    segment_count: count,
  })).sort((a, b) => b.percentage - a.percentage);
}
