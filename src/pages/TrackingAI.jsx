//src/pages/TrackingAI.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2, LocateFixed } from 'lucide-react';

const TrackingAI = () => {
  const [target, setTarget] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    if (!target) return;
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/tracking/query', { target });
      setStatus(res.data.status);
    } catch (err) {
      console.error(err);
      setStatus('❌ Error tracking the target.');
    }
    setLoading(false);
  };

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">📍 Tracking AI</h2>
      <Card>
        <CardContent className="space-y-4 mt-4">
          <Input
            placeholder="Enter what to track (e.g., John Doe, Shipment A123)"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
          />
          <Button onClick={handleTrack} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <><LocateFixed className="mr-2" /> Track</>}
          </Button>
        </CardContent>
      </Card>

      {status && (
        <Card className="mt-4">
          <CardContent>
            <p><strong>Status:</strong> {status}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TrackingAI;
