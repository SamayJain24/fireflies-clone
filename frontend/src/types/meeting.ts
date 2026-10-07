export interface TranscriptSegment {
  id: number;
  speaker: string;
  start_time: number;
  end_time: number;
  text: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  is_bookmarked: boolean;
  order_index: number;
}

export interface ActionItem {
  id: number;
  task: string;
  assignee: string | null;
  due_date: string | null;
  is_completed: boolean;
  priority: 'low' | 'medium' | 'high';
  transcript_timestamp: number | null;
}

export interface AISummary {
  id: number;
  overview: string;
  key_points: string[];
  decisions: string[];
  sentiment_breakdown: { positive: number; neutral: number; negative: number };
  topics: string[];
}

export interface SmartTag {
  id: number;
  tag_name: string;
  category: string;
  timestamp: number | null;
  color: string;
}

export interface Meeting {
  id: number;
  title: string;
  description: string | null;
  date: string;
  duration: number;
  audio_url: string | null;
  status: 'processing' | 'completed' | 'failed';
  sentiment: string | null;
  speakers: string[];
  created_at: string;
  updated_at: string;
}

export interface MeetingDetail extends Meeting {
  transcripts: TranscriptSegment[];
  action_items: ActionItem[];
  summary: AISummary | null;
  smart_tags: SmartTag[];
}

export type SpeakerStat = {
  speaker: string;
  duration_seconds: number;
  percentage: number;
  segment_count: number;
};
