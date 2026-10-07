import { useMemo } from 'react';
import type { TranscriptSegment } from '@/types/meeting';

/**
 * Custom hook to synchronize audio playback currentTime with transcript segments.
 * Identifies the current active segment with accurate boundaries and fallbacks.
 */
export function useTranscriptSync(
  transcripts: TranscriptSegment[] = [],
  currentTime: number = 0
) {
  const activeSegment = useMemo(() => {
    if (!transcripts || transcripts.length === 0) return null;

    // 1. Precise match: currentTime is within [start_time, end_time]
    const exactMatch = transcripts.find(
      (s) => currentTime >= s.start_time && currentTime <= s.end_time
    );
    if (exactMatch) return exactMatch;

    // 2. Fallback: closest segment that started before or at currentTime
    return transcripts.reduce<TranscriptSegment | null>((closest, seg) => {
      if (seg.start_time > currentTime) return closest;
      if (!closest || seg.start_time > closest.start_time) return seg;
      return closest;
    }, null);
  }, [transcripts, currentTime]);

  const activeSegmentIndex = useMemo(() => {
    if (!activeSegment || !transcripts) return -1;
    return transcripts.findIndex((s) => s.id === activeSegment.id);
  }, [transcripts, activeSegment]);

  return {
    activeSegment,
    activeSegmentIndex,
  };
}

export default useTranscriptSync;
