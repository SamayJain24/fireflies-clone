'use client';

import MeetingDetailView from '@/components/meeting/MeetingDetailView';

interface Props {
  params: { id: string };
}

export default function MeetingPage({ params }: Props) {
  return (
    <div className="h-full">
      <MeetingDetailView meetingId={params.id} />
    </div>
  );
}
