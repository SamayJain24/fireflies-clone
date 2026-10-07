'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search, Filter, Clock, Calendar, Users, ChevronRight, Plus, Mic,
  AlertCircle, RefreshCw, ArrowUpDown, Trash2, X, UploadCloud
} from 'lucide-react';
import { getMeetings, createMeeting, deleteMeeting } from '@/lib/api';
import { formatDuration, formatRelativeDate, speakerColor, speakerInitials } from '@/lib/utils';
import type { Meeting } from '@/types/meeting';

const STATUS_BADGE: Record<string, string> = {
  completed: 'bg-emerald-400/10 text-emerald-400 ring-1 ring-emerald-400/20',
  processing: 'bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20',
  failed: 'bg-red-400/10 text-red-400 ring-1 ring-red-400/20',
};

type SortOption = 'newest' | 'oldest' | 'duration_desc' | 'duration_asc' | 'title_asc';

function MeetingCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-800 bg-[#141720] p-5">
      <div className="flex items-start gap-4">
        <div className="h-10 w-10 shrink-0 rounded-xl bg-slate-800" />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="h-4 w-48 rounded bg-slate-800" />
            <div className="h-4 w-16 rounded-full bg-slate-800" />
          </div>
          <div className="flex gap-4">
            <div className="h-3 w-20 rounded bg-slate-800/80" />
            <div className="h-3 w-16 rounded bg-slate-800/80" />
            <div className="h-3 w-24 rounded bg-slate-800/80" />
          </div>
          <div className="h-3 w-full rounded bg-slate-800/60" />
          <div className="flex items-center justify-between pt-1">
            <div className="flex -space-x-1.5">
              <div className="h-6 w-6 rounded-full bg-slate-800" />
              <div className="h-6 w-6 rounded-full bg-slate-800" />
              <div className="h-6 w-6 rounded-full bg-slate-800" />
            </div>
            <div className="h-4 w-4 rounded bg-slate-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

function MeetingCard({
  meeting,
  onDelete,
}: {
  meeting: Meeting;
  onDelete: (id: number) => void;
}) {
  const speakers = meeting.speakers || [];

  return (
    <Link
      href={`/meetings/${meeting.id}`}
      className="group relative block rounded-xl border border-slate-800 bg-[#141720] p-5 transition-all duration-200 hover:border-indigo-500/40 hover:bg-[#181D2A] hover:shadow-lg hover:shadow-indigo-900/20"
    >
      <div className="flex items-start gap-4">
        {/* Recording Icon */}
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-500/10 ring-1 ring-indigo-500/20">
          <Mic className="h-4 w-4 text-indigo-400" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          {/* Title row */}
          <div className="flex items-center justify-between gap-3">
            <h3 className="truncate text-[15px] font-semibold text-slate-100 group-hover:text-indigo-300 transition-colors">
              {meeting.title}
            </h3>
            <div className="flex items-center gap-2">
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  STATUS_BADGE[meeting.status] || STATUS_BADGE.completed
                }`}
              >
                {meeting.status}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (confirm(`Are you sure you want to delete "${meeting.title}"?`)) {
                    onDelete(meeting.id);
                  }
                }}
                className="rounded-lg p-1 text-slate-500 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 hover:text-red-400 transition-all"
                title="Delete meeting"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatRelativeDate(meeting.date)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(meeting.duration)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {speakers.length} participants
            </span>
          </div>

          {/* Description */}
          {meeting.description && (
            <p className="mt-2 line-clamp-2 text-xs text-slate-500 leading-relaxed">
              {meeting.description}
            </p>
          )}

          {/* Speakers + CTA */}
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex -space-x-1.5">
                {speakers.slice(0, 4).map((sp) => (
                  <div
                    key={sp}
                    title={sp}
                    className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold text-white ring-2 ring-[#141720]"
                    style={{ backgroundColor: speakerColor(sp) }}
                  >
                    {speakerInitials(sp)}
                  </div>
                ))}
                {speakers.length > 4 && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-700 text-[9px] font-medium text-slate-300 ring-2 ring-[#141720]">
                    +{speakers.length - 4}
                  </div>
                )}
              </div>
              <span className="text-[11px] text-slate-600">
                {speakers.slice(0, 2).join(', ')}
                {speakers.length > 2 ? ` +${speakers.length - 2}` : ''}
              </span>
            </div>
            <ChevronRight className="h-4 w-4 text-slate-600 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-400" />
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function MeetingList() {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // New Meeting Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newSpeakers, setNewSpeakers] = useState('Sarah Connor, John Smith');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMeetingsData = useCallback(async (searchQuery?: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getMeetings(searchQuery || undefined, undefined, 1, 50);
      setMeetings(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to connect to the backend server';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch with debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMeetingsData(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, fetchMeetingsData]);

  // Handle meeting deletion
  const handleDeleteMeeting = useCallback(async (id: number) => {
    try {
      await deleteMeeting(id);
      setMeetings((prev) => prev.filter((m) => m.id !== id));
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to delete meeting');
    }
  }, []);

  // Handle new meeting creation
  const handleCreateMeeting = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const speakersArray = newSpeakers
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = await createMeeting({
        title: newTitle.trim(),
        description: newDescription.trim() || undefined,
        speakers: speakersArray.length > 0 ? speakersArray : ['Participant 1'],
        duration: 180.0,
        status: 'completed',
        sentiment: 'positive',
      });

      setMeetings((prev) => [created, ...prev]);
      setIsModalOpen(false);
      setNewTitle('');
      setNewDescription('');
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to create meeting');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter and Sort mechanisms
  const processedMeetings = useMemo(() => {
    const filtered = meetings.filter((m) => {
      if (filterStatus === 'all') return true;
      return m.status === filterStatus;
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'oldest') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'duration_desc') {
        return b.duration - a.duration;
      }
      if (sortBy === 'duration_asc') {
        return a.duration - b.duration;
      }
      if (sortBy === 'title_asc') {
        return a.title.localeCompare(b.title);
      }
      return 0;
    });
  }, [meetings, filterStatus, sortBy]);

  return (
    <div className="h-full px-6 py-6">
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Meetings</h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {isLoading ? (
              'Loading meetings…'
            ) : (
              `${processedMeetings.length} recording${processedMeetings.length !== 1 ? 's' : ''} found`
            )}
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 active:bg-indigo-700 transition-colors shadow-lg shadow-indigo-600/25"
        >
          <Plus className="h-4 w-4" />
          New Meeting
        </button>
      </div>

      {/* Search + Filters + Sort */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            id="search-meetings"
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search meetings or speakers…"
            className="w-full rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-9 pr-4 text-sm text-slate-200 placeholder-slate-500 outline-none transition-colors focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/50"
          />
        </div>

        {/* Filter by Status */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <select
            id="filter-status"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="appearance-none rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-8 pr-8 text-sm text-slate-300 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="processing">Processing</option>
            <option value="failed">Failed</option>
          </select>
        </div>

        {/* Sort Mechanism */}
        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500" />
          <select
            id="sort-meetings"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none rounded-xl border border-slate-700 bg-slate-800/60 py-2.5 pl-8 pr-8 text-sm text-slate-300 outline-none cursor-pointer focus:border-indigo-500"
          >
            <option value="newest">Sort: Newest Date</option>
            <option value="oldest">Sort: Oldest Date</option>
            <option value="duration_desc">Sort: Longest Duration</option>
            <option value="duration_asc">Sort: Shortest Duration</option>
            <option value="title_asc">Sort: Title (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && !isLoading && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
            <div>
              <p className="font-semibold">Unable to fetch meetings</p>
              <p className="text-xs text-red-400/80">{error}</p>
            </div>
          </div>
          <button
            onClick={() => fetchMeetingsData(search)}
            className="flex items-center gap-1.5 rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-200 hover:bg-red-500/30 transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          <MeetingCardSkeleton />
          <MeetingCardSkeleton />
          <MeetingCardSkeleton />
        </div>
      )}

      {/* Real Meeting Cards */}
      {!isLoading && processedMeetings.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-1 lg:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
          {processedMeetings.map((m) => (
            <MeetingCard
              key={m.id}
              meeting={m}
              onDelete={handleDeleteMeeting}
            />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && processedMeetings.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
            <Mic className="h-7 w-7 text-slate-600" />
          </div>
          <h3 className="text-base font-semibold text-slate-400">No meetings found</h3>
          <p className="mt-1 text-sm text-slate-600">Try adjusting your search or filters</p>
        </div>
      )}

      {/* New Meeting Creation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700 bg-[#141720] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <h2 className="text-lg font-bold text-slate-100">Upload & Create Meeting</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-800 hover:text-slate-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateMeeting} className="mt-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Meeting Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Q4 Strategy Review"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Description / Agenda
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief meeting notes or context..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Participants (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera, David Kim, Samantha Chen"
                  value={newSpeakers}
                  onChange={(e) => setNewSpeakers(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl border border-slate-700 px-4 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !newTitle.trim()}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500 disabled:opacity-50 transition-colors shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting ? 'Creating…' : 'Create Meeting'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
