import type { Meeting, MeetingDetail, ActionItem } from '@/types/meeting';

const RAW_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const CLEAN_API_URL = RAW_API_URL.replace(/\/+$/, '');
export const API_BASE_URL = CLEAN_API_URL.endsWith('/api/v1')
  ? CLEAN_API_URL
  : `${CLEAN_API_URL}/api/v1`;

export interface CreateMeetingInput {
  title: string;
  description?: string | null;
  duration?: number;
  speakers?: string[];
  audio_url?: string | null;
  status?: 'completed' | 'processing' | 'failed';
  sentiment?: string | null;
}

/**
 * Generic API helper to standardize fetch requests, headers, and error handling.
 */
async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  });

  if (!response.ok) {
    let errorDetail = response.statusText;
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || JSON.stringify(errorJson);
    } catch {
      // fallback to statusText or generic message
    }
    throw new Error(`API Error [${response.status}]: ${errorDetail}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json();
}

/**
 * Fetch list of meetings with optional search keywords, speaker filters, and pagination.
 */
export async function getMeetings(
  search?: string,
  speaker?: string,
  page: number = 1,
  limit: number = 50
): Promise<Meeting[]> {
  const queryParams = new URLSearchParams();

  if (search && search.trim()) {
    queryParams.set('search', search.trim());
  }

  if (speaker && speaker.trim()) {
    queryParams.set('speaker', speaker.trim());
  }

  const skip = Math.max(0, (page - 1) * limit);
  queryParams.set('skip', skip.toString());
  queryParams.set('limit', limit.toString());

  const queryString = queryParams.toString();
  return apiFetch<Meeting[]>(`/meetings/${queryString ? `?${queryString}` : ''}`);
}

/**
 * Fetch a single meeting with all transcripts, AI summaries, action items, and tags by ID.
 */
export async function getMeetingById(id: number | string): Promise<MeetingDetail> {
  return apiFetch<MeetingDetail>(`/meetings/${id}`);
}

/**
 * Create a new meeting (upload simulation or manual creation).
 */
export async function createMeeting(data: CreateMeetingInput): Promise<Meeting> {
  return apiFetch<Meeting>('/meetings/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

/**
 * Update an existing meeting's metadata (e.g. title, description, status).
 */
export async function updateMeeting(
  id: number | string,
  data: Partial<CreateMeetingInput>
): Promise<Meeting> {
  return apiFetch<Meeting>(`/meetings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

/**
 * Delete a meeting and all associated entities (transcripts, summaries, action items).
 */
export async function deleteMeeting(id: number | string): Promise<void> {
  return apiFetch<void>(`/meetings/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Update completion status (or details) of an action item.
 */
export async function updateActionItem(
  actionItemId: number | string,
  isCompleted: boolean
): Promise<ActionItem> {
  return apiFetch<ActionItem>(`/action-items/${actionItemId}`, {
    method: 'PATCH',
    body: JSON.stringify({ is_completed: isCompleted }),
  });
}
