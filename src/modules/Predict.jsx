// src/modules/Predict.jsx
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function Predict() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000';
      const response = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ context: input }), // updated to match backend
      });
      const data = await response.json();
      setResult(data.prediction);
    } catch (error) {
      setResult('Error predicting. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">Prediction Engine</h2>
      <Card>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Ask and get the best and most accurate predictions on sport,forex trade etc and even more..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full"
          />
          <Button onClick={handlePredict} disabled={loading} className="w-full">
            {loading ? 'Predicting...' : 'Predict'}
          </Button>
          {result && (
            <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-800">
              <h4 className="font-semibold mb-2">Prediction:</h4>
              <p>{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
