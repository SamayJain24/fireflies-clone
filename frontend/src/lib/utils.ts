export function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m ${s.toString().padStart(2, '0')}s`;
}

export function formatTimestamp(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatRelativeDate(dateStr: string): string {
  const now = Date.now();
  const d = new Date(dateStr).getTime();
  const diff = Math.round((now - d) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff < 7) return `${diff} days ago`;
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function speakerColor(speaker: string): string {
  const palette = [
    '#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B',
    '#3B82F6', '#EF4444', '#14B8A6', '#F97316', '#84CC16',
  ];
  let hash = 0;
  for (let i = 0; i < speaker.length; i++) hash = speaker.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length];
}

export function speakerInitials(name: string): string {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
}

export function priorityColor(priority: string): string {
  return { high: 'text-red-400', medium: 'text-amber-400', low: 'text-slate-400' }[priority] ?? 'text-slate-400';
}

export function sentimentColor(sentiment: string): string {
  return { positive: 'text-emerald-400', negative: 'text-red-400', neutral: 'text-slate-400' }[sentiment] ?? 'text-slate-400';
}

export function computeSpeakerStats(transcripts: { speaker: string; start_time: number; end_time: number }[] = []) {
  const totals: Record<string, { duration: number; count: number }> = {};
  let totalDuration = 0;

  for (const seg of transcripts) {
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
