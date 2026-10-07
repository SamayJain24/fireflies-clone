'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX, SkipBack, SkipForward,
  Bookmark, Search, CheckCircle2, Circle, Clock, User,
  Zap, BarChart2, ListChecks, FileText, Tag, Star, AlertCircle, RefreshCw,
  Edit3, Check, Trash2, X
} from 'lucide-react';
import type { MeetingDetail, TranscriptSegment, ActionItem } from '@/types/meeting';
import {
  formatTimestamp, formatDuration, formatDate,
  speakerColor, speakerInitials, priorityColor, computeSpeakerStats
} from '@/lib/utils';
import { getMeetingById, updateActionItem, updateMeeting, deleteMeeting } from '@/lib/api';
import { useTranscriptSync } from '@/hooks/useTranscriptSync';

// ─── AUDIO PLAYER ────────────────────────────────────────────────────────────
interface PlayerProps {
  duration: number;
  currentTime: number;
  isPlaying: boolean;
  onSeek: (t: number) => void;
  onTogglePlay: () => void;
}

function AudioPlayer({ duration, currentTime, isPlaying, onSeek, onTogglePlay }: PlayerProps) {
  const [speed, setSpeed] = useState(1);
  const [muted, setMuted] = useState(false);
  const speeds = [0.75, 1, 1.25, 1.5, 2];

  const pct = duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0;

  function handleBarClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    onSeek(ratio * duration);
  }

  function nextSpeed() {
    const idx = speeds.indexOf(speed);
    setSpeed(speeds[(idx + 1) % speeds.length]);
  }

  return (
    <div className="border-t border-slate-800 bg-[#0F1117] px-6 py-3">
      {/* Seek bar */}
      <div
        className="group mb-3 h-1.5 w-full cursor-pointer rounded-full bg-slate-700 hover:h-2 transition-all"
        onClick={handleBarClick}
        role="slider"
        aria-label="Seek"
        aria-valuenow={currentTime}
        aria-valuemin={0}
        aria-valuemax={duration}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') onSeek(Math.min(duration, currentTime + 5));
          if (e.key === 'ArrowLeft') onSeek(Math.max(0, currentTime - 5));
        }}
      >
        <div
          className="h-full rounded-full progress-fill transition-all"
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        {/* Left: time */}
        <span className="w-24 text-xs tabular-nums text-slate-500">
          {formatTimestamp(currentTime)} / {formatTimestamp(duration)}
        </span>

        {/* Center: controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onSeek(Math.max(0, currentTime - 10))}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Back 10s"
          >
            <SkipBack className="h-4 w-4" />
          </button>

          <button
            id="btn-toggle-play"
            onClick={onTogglePlay}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white" />}
          </button>

          <button
            onClick={() => onSeek(Math.min(duration, currentTime + 10))}
            className="text-slate-500 hover:text-slate-300 transition-colors"
            title="Forward 10s"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>

        {/* Right: speed + volume */}
        <div className="flex items-center gap-3 w-24 justify-end">
          <button
            onClick={nextSpeed}
            className="rounded-md bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-400 hover:bg-slate-700 hover:text-slate-200 transition-colors"
          >
            {speed}×
          </button>
          <button onClick={() => setMuted(!muted)} className="text-slate-500 hover:text-slate-300 transition-colors">
            {muted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── TRANSCRIPT SEGMENT ───────────────────────────────────────────────────────
function SegmentItem({
  segment, isActive, searchQuery, onClick
}: {
  segment: TranscriptSegment;
  isActive: boolean;
  searchQuery: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const color = speakerColor(segment.speaker);

  useEffect(() => {
    if (isActive && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isActive]);

  function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} className="rounded bg-amber-400/20 text-amber-300 px-0.5">{part}</mark>
        : part
    );
  }

  return (
    <div
      ref={ref}
      id={`segment-${segment.id}`}
      onClick={onClick}
      className={`group flex cursor-pointer gap-3 rounded-xl px-4 py-3 transition-all duration-200 ${
        isActive
          ? 'segment-active border border-indigo-500/30 bg-indigo-500/10'
          : 'border border-transparent hover:border-slate-700/50 hover:bg-slate-800/40'
      }`}
    >
      {/* Speaker Avatar */}
      <div className="mt-0.5 flex shrink-0 flex-col items-center gap-1.5">
        <div
          className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
          style={{ backgroundColor: color }}
        >
          {speakerInitials(segment.speaker)}
        </div>
        {isActive && <div className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="text-xs font-semibold" style={{ color }}>
            {segment.speaker}
          </span>
          <span className="text-[11px] tabular-nums text-slate-600">
            {formatTimestamp(segment.start_time)}
          </span>
          {segment.is_bookmarked && (
            <Bookmark className="ml-auto h-3 w-3 text-amber-400 fill-amber-400" />
          )}
        </div>
        <p className={`text-sm leading-relaxed ${isActive ? 'text-slate-200' : 'text-slate-400'}`}>
          {highlightText(segment.text, searchQuery)}
        </p>
      </div>
    </div>
  );
}

// ─── AI SUMMARY PANEL ─────────────────────────────────────────────────────────
type SummaryTab = 'summary' | 'actions' | 'speakers' | 'topics';

function SummaryPanel({
  meeting,
  actionStates,
  updatingActionIds,
  onToggleAction,
  onJumpTo,
}: {
  meeting: MeetingDetail;
  actionStates: Record<number, boolean>;
  updatingActionIds: Set<number>;
  onToggleAction: (id: number) => void;
  onJumpTo: (t: number) => void;
}) {
  const [tab, setTab] = useState<SummaryTab>('summary');
  const speakerStats = useMemo(() => computeSpeakerStats(meeting.transcripts || []), [meeting.transcripts]);

  const TABS: { id: SummaryTab; label: string; icon: React.ElementType }[] = [
    { id: 'summary', label: 'AI Summary', icon: FileText },
    { id: 'actions', label: 'Action Items', icon: ListChecks },
    { id: 'speakers', label: 'Speakers', icon: BarChart2 },
    { id: 'topics', label: 'Topics', icon: Tag },
  ];

  const totalCount = meeting.action_items?.length || 0;
  const completedCount = useMemo(() => {
    if (!meeting.action_items) return 0;
    return meeting.action_items.filter((item) => actionStates[item.id] ?? item.is_completed).length;
  }, [meeting.action_items, actionStates]);

  return (
    <div className="flex h-full flex-col">
      {/* Tab bar */}
      <div className="flex shrink-0 border-b border-slate-800 px-4">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            id={`tab-${id}`}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition-colors ${
              tab === id
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
            {id === 'actions' && totalCount > 0 && (
              <span className={`rounded-full px-1.5 text-[10px] ${
                completedCount === totalCount ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
              }`}>
                {completedCount}/{totalCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* ── SUMMARY TAB ── */}
        {tab === 'summary' && meeting.summary && (
          <div className="space-y-5">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Zap className="h-3.5 w-3.5 text-indigo-400" />
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">AI Overview</span>
              </div>
              <p className="text-sm leading-relaxed text-slate-400">
                {meeting.summary.overview}
              </p>
            </div>

            {meeting.summary.key_points?.length > 0 && (
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Key Takeaways</h4>
                <ul className="space-y-2">
                  {meeting.summary.key_points.map((kp, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-400">
                      <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-400" />
                      <span className="leading-relaxed">{kp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {meeting.summary.decisions?.length > 0 && (
              <div>
                <h4 className="mb-2.5 text-xs font-semibold uppercase tracking-wider text-slate-500">Decisions Made</h4>
                <ul className="space-y-2">
                  {meeting.summary.decisions.map((d, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-400">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                      <span className="leading-relaxed">{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sentiment breakdown */}
            {meeting.summary.sentiment_breakdown && (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Sentiment Breakdown</h4>
                <div className="space-y-2">
                  {[
                    { label: 'Positive', key: 'positive', color: 'bg-emerald-500' },
                    { label: 'Neutral', key: 'neutral', color: 'bg-slate-500' },
                    { label: 'Negative', key: 'negative', color: 'bg-red-500' },
                  ].map(({ label, key, color }) => {
                    const pct = meeting.summary!.sentiment_breakdown[key as keyof typeof meeting.summary.sentiment_breakdown] || 0;
                    return (
                      <div key={key} className="flex items-center gap-2.5">
                        <span className="w-14 text-right text-xs text-slate-500">{label}</span>
                        <div className="flex-1 rounded-full bg-slate-800 h-1.5">
                          <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="w-8 text-xs tabular-nums text-slate-500">{pct}%</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ACTIONS TAB ── */}
        {tab === 'actions' && (
          <div className="space-y-1">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs text-slate-500">{completedCount} of {totalCount} completed</span>
              <div className="h-1 flex-1 mx-3 rounded-full bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-500 transition-all"
                  style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
                />
              </div>
            </div>

            {meeting.action_items?.length ? (
              meeting.action_items.map((item) => {
                const done = actionStates[item.id] ?? item.is_completed;
                const isUpdating = updatingActionIds.has(item.id);

                return (
                  <div
                    key={item.id}
                    className={`group flex gap-3 rounded-xl border p-3 transition-all ${
                      done ? 'border-slate-800/50 bg-slate-900/30 opacity-60' : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
                    }`}
                  >
                    <button
                      id={`action-${item.id}`}
                      onClick={() => onToggleAction(item.id)}
                      disabled={isUpdating}
                      title={done ? 'Mark as incomplete' : 'Mark as completed'}
                      className="mt-0.5 shrink-0 transition-transform hover:scale-110 disabled:opacity-50"
                    >
                      {done ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-600 group-hover:text-slate-400" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm leading-snug ${done ? 'line-through text-slate-600' : 'text-slate-300'}`}>
                        {item.task}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
                        {item.assignee && (
                          <span className="flex items-center gap-1 text-slate-500">
                            <User className="h-3 w-3" /> {item.assignee}
                          </span>
                        )}
                        <span className={`font-medium capitalize ${priorityColor(item.priority)}`}>
                          {item.priority}
                        </span>
                        {item.transcript_timestamp !== null && (
                          <button
                            onClick={() => onJumpTo(item.transcript_timestamp!)}
                            className="flex items-center gap-1 text-indigo-500 hover:text-indigo-400 transition-colors"
                          >
                            <Clock className="h-3 w-3" />
                            {formatTimestamp(item.transcript_timestamp)}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="py-8 text-center text-xs text-slate-600">No action items recorded for this meeting.</p>
            )}
          </div>
        )}

        {/* ── SPEAKERS TAB ── */}
        {tab === 'speakers' && (
          <div className="space-y-3">
            {speakerStats.map((stat) => {
              const color = speakerColor(stat.speaker);
              return (
                <div key={stat.speaker} className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
                  <div className="mb-2 flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-[11px] font-bold text-white"
                      style={{ backgroundColor: color }}
                    >
                      {speakerInitials(stat.speaker)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{stat.speaker}</p>
                      <p className="text-[11px] text-slate-500">{stat.segment_count} segments</p>
                    </div>
                    <span className="text-sm font-semibold text-slate-300 tabular-nums">
                      {stat.percentage}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-slate-800">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${stat.percentage}%`, backgroundColor: color }}
                    />
                  </div>
                  <p className="mt-1.5 text-right text-[11px] text-slate-600">
                    {formatDuration(stat.duration_seconds)}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* ── TOPICS TAB ── */}
        {tab === 'topics' && (
          <div className="space-y-4">
            {meeting.summary?.topics?.length ? (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Key Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.summary.topics.map((topic) => (
                    <span
                      key={topic}
                      className="rounded-full bg-indigo-500/10 px-3 py-1.5 text-xs font-medium text-indigo-400 ring-1 ring-indigo-500/20"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}

            {meeting.smart_tags?.length ? (
              <div>
                <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Smart Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {meeting.smart_tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => tag.timestamp !== null && onJumpTo(tag.timestamp)}
                      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all hover:opacity-80"
                      style={{
                        backgroundColor: `${tag.color}18`,
                        color: tag.color,
                        boxShadow: `0 0 0 1px ${tag.color}30`
                      }}
                    >
                      <Tag className="h-3 w-3" />
                      {tag.tag_name}
                      {tag.timestamp !== null && (
                        <span className="ml-1 opacity-60">{formatTimestamp(tag.timestamp)}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── MAIN MEETING DETAIL VIEW ─────────────────────────────────────────────────
interface MeetingDetailViewProps {
  meetingId?: number | string;
  initialMeeting?: MeetingDetail | null;
  meeting?: MeetingDetail | null;
}

export default function MeetingDetailView({
  meetingId,
  initialMeeting,
  meeting: propMeeting,
}: MeetingDetailViewProps) {
  const params = useParams();

  // Resolve ID from prop or URL route
  const targetId = useMemo(() => {
    if (meetingId !== undefined) return Number(meetingId);
    if (propMeeting?.id !== undefined) return Number(propMeeting.id);
    if (initialMeeting?.id !== undefined) return Number(initialMeeting.id);
    if (params?.id) return Number(params.id);
    return 1;
  }, [meetingId, propMeeting, initialMeeting, params]);

  const router = useRouter();
  const [meeting, setMeeting] = useState<MeetingDetail | null>(
    () => initialMeeting || propMeeting || null
  );
  const [isLoading, setIsLoading] = useState<boolean>(() => !meeting);
  const [error, setError] = useState<string | null>(null);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editedTitle, setEditedTitle] = useState('');

  // Update editedTitle when meeting loads
  useEffect(() => {
    if (meeting?.title) {
      setEditedTitle(meeting.title);
    }
  }, [meeting?.title]);

  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [actionStates, setActionStates] = useState<Record<number, boolean>>({});
  const [updatingActionIds, setUpdatingActionIds] = useState<Set<number>>(new Set());
  const [transcriptSearch, setTranscriptSearch] = useState('');
  const [activeSpeaker, setActiveSpeaker] = useState<string | null>(null);
  const [mobileTab, setMobileTab] = useState<'transcript' | 'summary'>('transcript');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sync action states when meeting loads or changes
  useEffect(() => {
    if (meeting?.action_items) {
      setActionStates(
        Object.fromEntries(meeting.action_items.map((a) => [a.id, a.is_completed]))
      );
    }
  }, [meeting]);

  const handleSaveTitle = async () => {
    if (!meeting || !editedTitle.trim()) return;
    const prevTitle = meeting.title;
    const newTitle = editedTitle.trim();
    setMeeting((prev) => (prev ? { ...prev, title: newTitle } : null));
    setIsEditingTitle(false);
    try {
      await updateMeeting(meeting.id, { title: newTitle });
    } catch (err) {
      console.error('Failed to update meeting title:', err);
      setMeeting((prev) => (prev ? { ...prev, title: prevTitle } : null));
    }
  };

  const handleDeleteCurrentMeeting = async () => {
    if (!meeting) return;
    if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
      try {
        await deleteMeeting(meeting.id);
        router.push('/');
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete meeting');
      }
    }
  };

  // Fetch meeting data from backend
  const fetchMeetingData = useCallback(async (id: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeetingById(id);
      setMeeting(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to fetch meeting data';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (targetId) {
      fetchMeetingData(targetId);
    }
  }, [targetId, fetchMeetingData]);

  // Two-way synchronization via custom hook
  const { activeSegment } = useTranscriptSync(meeting?.transcripts || [], currentTime);

  // Audio Playback simulation interval
  const duration = meeting?.duration || 0;
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((t) => {
          const next = t + 0.25;
          if (next >= duration) {
            setIsPlaying(false);
            return duration;
          }
          return next;
        });
      }, 250);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPlaying, duration]);

  const handleSeek = useCallback((t: number) => setCurrentTime(t), []);

  const handleSegmentClick = useCallback((seg: TranscriptSegment) => {
    setCurrentTime(seg.start_time);
    setIsPlaying(true);
  }, []);

  // Wire up Action Item checkbox to updateActionItem() with optimistic UI
  const handleToggleAction = useCallback(async (id: number) => {
    const currentStatus = actionStates[id] ?? false;
    const nextStatus = !currentStatus;

    // Optimistically update checkbox state
    setActionStates((prev) => ({ ...prev, [id]: nextStatus }));
    setUpdatingActionIds((prev) => new Set(prev).add(id));

    try {
      await updateActionItem(id, nextStatus);
    } catch (err) {
      console.error('Failed to update action item on backend:', err);
      // Revert optimistic update on failure
      setActionStates((prev) => ({ ...prev, [id]: currentStatus }));
    } finally {
      setUpdatingActionIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }, [actionStates]);

  const transcripts = meeting?.transcripts || [];

  const filteredSegments = useMemo(() => {
    return transcripts.filter((seg) => {
      const matchSearch =
        !transcriptSearch.trim() ||
        seg.text.toLowerCase().includes(transcriptSearch.toLowerCase()) ||
        seg.speaker.toLowerCase().includes(transcriptSearch.toLowerCase());
      const matchSpeaker = !activeSpeaker || seg.speaker === activeSpeaker;
      return matchSearch && matchSpeaker;
    });
  }, [transcripts, transcriptSearch, activeSpeaker]);

  const uniqueSpeakers = useMemo(
    () => Array.from(new Set(transcripts.map((s) => s.speaker))),
    [transcripts]
  );

  // Loading skeleton screen
  if (isLoading && !meeting) {
    return (
      <div className="flex h-full flex-col animate-pulse">
        <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-800 bg-[#0F1117] px-6">
          <div className="h-4 w-16 rounded bg-slate-800" />
          <div className="h-4 w-48 rounded bg-slate-800" />
        </header>
        <div className="flex flex-1 min-h-0">
          <aside className="hidden w-52 shrink-0 border-r border-slate-800 bg-[#0A0C14] p-4 lg:flex flex-col gap-4">
            <div className="h-8 w-full rounded bg-slate-800" />
            <div className="h-24 w-full rounded bg-slate-800/60" />
            <div className="h-32 w-full rounded bg-slate-800/40" />
          </aside>
          <div className="flex-1 p-6 space-y-4">
            <div className="h-48 w-full rounded-2xl bg-slate-900" />
            <div className="h-12 w-full rounded-xl bg-slate-800/50" />
            <div className="space-y-3">
              <div className="h-16 w-full rounded-xl bg-slate-800/40" />
              <div className="h-16 w-full rounded-xl bg-slate-800/40" />
              <div className="h-16 w-full rounded-xl bg-slate-800/40" />
            </div>
          </div>
          <aside className="hidden w-80 shrink-0 border-l border-slate-800 bg-[#0A0C14] p-4 xl:flex flex-col gap-4">
            <div className="h-10 w-full rounded bg-slate-800" />
            <div className="h-40 w-full rounded bg-slate-800/60" />
          </aside>
        </div>
      </div>
    );
  }

  // Error state screen
  if (error && !meeting) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400 ring-1 ring-red-500/20">
          <AlertCircle className="h-7 w-7" />
        </div>
        <h2 className="text-lg font-bold text-slate-100">Meeting Not Found or Unavailable</h2>
        <p className="mt-1 max-w-md text-sm text-slate-500">{error}</p>
        <div className="mt-6 flex gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Meetings
          </Link>
          <button
            onClick={() => fetchMeetingData(targetId)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-600/20"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      </div>
    );
  }

  if (!meeting) return null;

  return (
    <div className="flex h-full flex-col">
      {/* ── TOP BAR ── */}
      <header className="flex shrink-0 items-center gap-4 border-b border-slate-800 bg-[#0F1117] px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="h-4 w-px bg-slate-800" />
        <div className="min-w-0 flex-1">
          {isEditingTitle ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveTitle();
                  if (e.key === 'Escape') setIsEditingTitle(false);
                }}
                className="w-full max-w-md rounded-lg border border-indigo-500 bg-slate-800 px-2.5 py-1 text-sm font-semibold text-slate-100 outline-none"
                autoFocus
              />
              <button
                onClick={handleSaveTitle}
                className="rounded-lg bg-indigo-600 p-1 text-white hover:bg-indigo-500"
                title="Save Title"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsEditingTitle(false)}
                className="rounded-lg p-1 text-slate-400 hover:text-slate-200"
                title="Cancel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="group/title flex items-center gap-2">
              <h1 className="truncate text-base font-semibold text-slate-100">{meeting.title}</h1>
              <button
                onClick={() => setIsEditingTitle(true)}
                className="opacity-0 group-hover/title:opacity-100 rounded p-1 text-slate-500 hover:text-indigo-400 transition-opacity"
                title="Edit title"
              >
                <Edit3 className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
          <p className="mt-0.5 flex items-center gap-3 text-xs text-slate-500">
            <span>{formatDate(meeting.date)}</span>
            <span>·</span>
            <span>{formatDuration(meeting.duration)}</span>
            <span>·</span>
            <span>{(meeting.speakers || []).length} participants</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Transcript search — top bar */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
            <input
              id="search-transcript"
              type="text"
              value={transcriptSearch}
              onChange={(e) => setTranscriptSearch(e.target.value)}
              placeholder="Search transcript…"
              className="w-52 rounded-xl border border-slate-700 bg-slate-800/60 py-1.5 pl-8 pr-3 text-xs text-slate-300 placeholder-slate-500 outline-none focus:border-indigo-500"
            />
          </div>
          <button
            onClick={handleDeleteCurrentMeeting}
            className="flex items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/20 transition-colors"
            title="Delete this meeting"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </header>

      {/* ── BODY: LEFT PANEL + TRANSCRIPT + SIDEBAR ── */}
      <div className="flex min-h-0 flex-1">

        {/* LEFT: Smart Search / Filters */}
        <aside className="hidden w-52 shrink-0 flex-col border-r border-slate-800 bg-[#0A0C14] lg:flex">
          <div className="flex-1 overflow-y-auto p-4">
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2">
              <Search className="h-3.5 w-3.5 shrink-0 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-400">Smart Search</span>
            </div>

            {/* AI Filter chips */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">AI Filters</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  { label: 'Questions', count: 8, color: 'text-violet-400 bg-violet-400/10 ring-violet-400/20' },
                  { label: 'Dates', count: 3, color: 'text-yellow-400 bg-yellow-400/10 ring-yellow-400/20' },
                  { label: 'Metrics', count: 5, color: 'text-blue-400 bg-blue-400/10 ring-blue-400/20' },
                  { label: 'Tasks', count: meeting.action_items?.length || 0, color: 'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20' },
                ].map(({ label, count, color }) => (
                  <button key={label} className={`rounded-lg px-2 py-1.5 text-[11px] font-medium ring-1 transition-opacity hover:opacity-80 ${color}`}>
                    {label} · {count}
                  </button>
                ))}
              </div>
            </div>

            {/* Sentiment */}
            {meeting.summary?.sentiment_breakdown && (
              <div className="mb-5">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Sentiment</p>
                <div className="space-y-1">
                  {[
                    { label: 'Positive', key: 'positive', color: 'text-emerald-400 bg-emerald-400/10 ring-emerald-400/20' },
                    { label: 'Neutral', key: 'neutral', color: 'text-slate-400 bg-slate-700 ring-slate-600' },
                    { label: 'Negative', key: 'negative', color: 'text-red-400 bg-red-400/10 ring-red-400/20' },
                  ].map(({ label, key, color }) => (
                    <button key={key} className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[11px] font-medium ring-1 transition-opacity hover:opacity-80 ${color}`}>
                      <span>{label}</span>
                      <span>{meeting.summary!.sentiment_breakdown[key as 'positive'|'neutral'|'negative'] || 0}%</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Speakers */}
            <div className="mb-5">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Speakers</p>
              <div className="space-y-1">
                <button
                  onClick={() => setActiveSpeaker(null)}
                  className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-colors ${
                    !activeSpeaker ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  All speakers
                </button>
                {uniqueSpeakers.map((sp) => (
                  <button
                    key={sp}
                    onClick={() => setActiveSpeaker(activeSpeaker === sp ? null : sp)}
                    className={`flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] transition-colors ${
                      activeSpeaker === sp ? 'bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <div
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ backgroundColor: speakerColor(sp) }}
                    />
                    <span className="truncate">{sp}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Smart tags */}
            {meeting.smart_tags?.length ? (
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-600">Topic Trackers</p>
                <div className="flex flex-wrap gap-1.5">
                  {meeting.smart_tags.map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => tag.timestamp !== null && handleSeek(tag.timestamp)}
                      className="rounded-full px-2 py-1 text-[10px] font-medium transition-opacity hover:opacity-80"
                      style={{ backgroundColor: `${tag.color}18`, color: tag.color, boxShadow: `0 0 0 1px ${tag.color}30` }}
                    >
                      {tag.tag_name}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </aside>

        {/* CENTER: Video placeholder + Transcript */}
        <div className="flex min-w-0 flex-1 flex-col">
          {/* Video Placeholder */}
          <div className="shrink-0 bg-black flex items-center justify-center" style={{ aspectRatio: '16/9', maxHeight: '260px' }}>
            <div className="flex flex-col items-center gap-3 text-slate-700">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 ring-1 ring-slate-800">
                <Play className="h-7 w-7 translate-x-0.5 fill-slate-600 text-slate-600" />
              </div>
              <p className="text-xs font-medium">Audio Recording</p>
              <p className="text-[11px] text-slate-800">Click a transcript segment to start playback</p>
            </div>
          </div>

          {/* Audio Player */}
          <AudioPlayer
            duration={meeting.duration}
            currentTime={currentTime}
            isPlaying={isPlaying}
            onSeek={handleSeek}
            onTogglePlay={() => setIsPlaying((p) => !p)}
          />

          {/* Mobile Tab Switcher (< xl) */}
          <div className="flex shrink-0 border-t border-slate-800 bg-[#0A0C14] px-4 py-2 xl:hidden">
            <div className="flex w-full rounded-xl bg-slate-900 p-1">
              <button
                onClick={() => setMobileTab('transcript')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  mobileTab === 'transcript'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Transcript ({filteredSegments.length})
              </button>
              <button
                onClick={() => setMobileTab('summary')}
                className={`flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all ${
                  mobileTab === 'summary'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Insights & Tasks ({meeting.action_items?.length || 0})
              </button>
            </div>
          </div>

          {/* Mobile view of AI Summary Panel (< xl) */}
          <div className={`min-h-0 flex-1 flex-col xl:hidden ${mobileTab === 'summary' ? 'flex' : 'hidden'}`}>
            <SummaryPanel
              meeting={meeting}
              actionStates={actionStates}
              updatingActionIds={updatingActionIds}
              onToggleAction={handleToggleAction}
              onJumpTo={handleSeek}
            />
          </div>

          {/* Transcript Panel (Always on desktop xl+, or when mobileTab is 'transcript' on < xl) */}
          <div className={`min-h-0 flex-1 flex-col border-t border-slate-800 ${
            mobileTab === 'transcript' ? 'flex' : 'hidden xl:flex'
          }`}>
            {/* Transcript Header */}
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4 py-3">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-300">Transcript</span>
                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-500">
                  {filteredSegments.length} segments
                </span>
              </div>
              {/* Mobile search */}
              <div className="relative sm:hidden">
                <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={transcriptSearch}
                  onChange={(e) => setTranscriptSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-36 rounded-lg border border-slate-700 bg-slate-800 py-1.5 pl-7 pr-2 text-xs text-slate-300 placeholder-slate-500 outline-none"
                />
              </div>
              {activeSegment && (
                <span className="hidden items-center gap-1.5 text-[11px] text-indigo-400 sm:flex">
                  <div className="h-1.5 w-1.5 animate-pulse rounded-full bg-indigo-400" />
                  {activeSegment.speaker}
                </span>
              )}
            </div>

            {/* Segments list */}
            <div className="flex-1 overflow-y-auto space-y-0.5 px-2 py-2">
              {filteredSegments.length > 0 ? (
                filteredSegments.map((seg) => (
                  <SegmentItem
                    key={seg.id}
                    segment={seg}
                    isActive={activeSegment?.id === seg.id}
                    searchQuery={transcriptSearch}
                    onClick={() => handleSegmentClick(seg)}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <Search className="mb-2 h-8 w-8 text-slate-700" />
                  <p className="text-sm text-slate-600">No segments match your search</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT: AI Summary Panel */}
        <aside className="hidden w-80 shrink-0 border-l border-slate-800 bg-[#0A0C14] xl:flex xl:flex-col">
          <SummaryPanel
            meeting={meeting}
            actionStates={actionStates}
            updatingActionIds={updatingActionIds}
            onToggleAction={handleToggleAction}
            onJumpTo={handleSeek}
          />
        </aside>
      </div>
    </div>
  );
}
