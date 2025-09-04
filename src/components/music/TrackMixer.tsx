//src/components/music/TrackMixer.tsx

import React from 'react';
import { Button } from '@/components/ui/button';

const TrackMixer = ({ audioUrl }: { audioUrl: string }) => {
  const handleMixTrack = async () => {
    const res = await fetch('/api/music/mix', { method: 'POST' });
    // show waveform + update UI with new mixed track
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-600">AI will blend the voice with beats and harmonies.</p>
      <Button onClick={handleMixTrack}>Mix Track</Button>
    </div>
  );
};

export default TrackMixer;