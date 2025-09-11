// src/modules/MusicAI.tsx
import React, { useState } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { slideUp } from '@/config/animations';

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

const MusicAI = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [previewURL, setPreviewURL] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      setPreviewURL(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const analyzeMusic = async () => {
    if (!audioFile) return;
    setLoading(true);

    const formData = new FormData();
    formData.append('file', audioFile);

    try {
      const res = await axios.post(`${API_BASE}/music/analyze/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      console.error('Music analysis failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
        className="w-full max-w-3xl mx-auto p-4 sm:p-6 lg:p-10 space-y-6"
      >
        <h2 className="text-2xl sm:text-3xl font-bold text-center text-indigo-600 dark:text-indigo-400">
          🎶 Music AI Analyzer
        </h2>

        <Card className="shadow-md border border-gray-200 dark:border-gray-700">
          <CardContent className="p-4 space-y-4">
            <input
              type="file"
              accept="audio/*"
              onChange={handleAudioChange}
              className="w-full text-sm text-gray-700 dark:text-gray-200"
            />
            {previewURL && (
              <audio controls src={previewURL} className="w-full mt-2 rounded shadow" />
            )}
            <Button
              onClick={analyzeMusic}
              disabled={!audioFile || loading}
              className="w-full"
            >
              {loading ? <Loader2 className="animate-spin" /> : 'Analyze Music'}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <Card className="shadow-lg bg-blue-50 dark:bg-gray-800 border border-blue-200 dark:border-gray-700">
            <CardContent className="p-4 space-y-2">
              <h3 className="text-lg sm:text-xl font-semibold text-blue-700 dark:text-blue-400">
                🎧 Music Analysis Result
              </h3>
              <p><strong>🎵 Genre:</strong> {result.genre}</p>
              <p><strong>😌 Mood:</strong> {result.mood}</p>
              <p>
                <strong>🎶 Suggested Playlist:</strong>{" "}
                {Array.isArray(result.suggestions) ? result.suggestions.join(', ') : 'N/A'}
              </p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default MusicAI;