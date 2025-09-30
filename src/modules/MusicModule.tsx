// src/modules/MusicModule.tsx

import React, { useState, useEffect, DragEvent } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Music, Wand2, UploadCloud } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import ExportButtonGroup from '@/components/music/ExportButtonGroup';
import MusicVisualizer from '@/components/music/MusicVisualizer';
import TrackMixer from '@/components/music/TrackMixer';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import API from '@/api'; // 🔗 use your centralized API instance

const MusicModule = () => {
  const [query, setQuery] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [voiceId, setVoiceId] = useState('default');
  const [voices, setVoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [mixing, setMixing] = useState(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    API.get('/music/voices')
      .then(res => setVoices(res.data.voices || []))
      .catch(() => setVoices([]));
  }, []);

  const handleGenerateLyrics = async () => {
    if (!query) return;
    setLoading(true);
    setLyrics('');
    try {
      const res = await API.post('/music/lyrics', { prompt: query });
      setLyrics(res.data.lyrics);
    } catch {
      setLyrics('Error generating lyrics.');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceGeneration = async () => {
    if (!lyrics || !voiceId) return;
    setLoading(true);
    try {
      const res = await API.post('/music/voice', { text: lyrics, voice_id: voiceId });
      setVoiceUrl(res.data.voice_url);
    } catch {
      setVoiceUrl('');
    } finally {
      setLoading(false);
    }
  };

  // Handle drag & drop upload
  const handleDrop = async (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file) return;

    if (file.type.startsWith("text/")) {
      const text = await file.text();
      setLyrics(text);
    } else if (file.type.startsWith("audio/")) {
      const url = URL.createObjectURL(file);
      setVoiceUrl(url);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-10"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-2">
            <Music className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-2xl sm:text-3xl font-bold dark:text-white">
              🎼 JEO.H Advanced Music AI
            </h2>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Main Card */}
        <Card className="shadow-xl border bg-gradient-to-br from-indigo-100 to-pink-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="space-y-6 p-4 sm:p-6">
            <Tabs defaultValue="lyrics">
              <TabsList className="flex flex-wrap gap-2">
                <TabsTrigger value="lyrics">📝 Lyrics</TabsTrigger>
                <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
                <TabsTrigger value="preview">🎧 Visualizer</TabsTrigger>
                <TabsTrigger value="mix">🎚️ Mixer</TabsTrigger>
              </TabsList>

              {/* Lyrics Tab */}
              <TabsContent value="lyrics" className="space-y-4">
                {/* Drag & Drop Zone */}
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer 
                              transition-colors ${
                                dragging
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-gray-800"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                >
                  <UploadCloud className="mx-auto h-8 w-8 text-indigo-500" />
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                    Drag & drop a <strong>lyrics text file</strong> or <strong>audio file</strong> here
                  </p>
                </div>

                <Textarea
                  placeholder="Describe a vibe, story or theme..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px] w-full 
                             bg-white text-black placeholder-gray-500
                             dark:bg-gray-900 dark:text-white dark:placeholder-gray-400"
                />
                <Button onClick={handleGenerateLyrics} disabled={loading} className="w-full sm:w-auto">
                  {loading ? <Loader2 className="animate-spin" /> : 'Generate Lyrics'}
                </Button>

                {lyrics && (
                  <>
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      className="mt-4 w-full bg-white text-black dark:bg-gray-900 dark:text-white"
                    />
                    <Button onClick={handleGenerateLyrics} variant="ghost" className="mt-2">
                      <Wand2 className="mr-2 h-4 w-4" /> Regenerate Lyrics
                    </Button>
                  </>
                )}
              </TabsContent>

              {/* Voice Tab */}
              <TabsContent value="voice">
                <div className="space-y-4">
                  <select
                    value={voiceId}
                    onChange={(e) => setVoiceId(e.target.value)}
                    className="w-full border p-2 rounded bg-white text-black dark:bg-gray-900 dark:text-white"
                  >
                    {voices.map((v, idx) => (
                      <option key={idx} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                  <Button onClick={handleVoiceGeneration} disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" /> : 'Generate Voice'}
                  </Button>

                  {voiceUrl && (
                    <div className="mt-4 space-y-2">
                      <audio controls src={voiceUrl} className="rounded w-full" />
                      <ExportButtonGroup voiceUrl={voiceUrl} lyrics={lyrics} />
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* Preview Tab */}
              <TabsContent value="preview">
                {voiceUrl ? (
                  <MusicVisualizer audioSrc={voiceUrl} />
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Generate or upload a voice/audio file to preview waveform
                  </p>
                )}
              </TabsContent>

              {/* Mixer Tab */}
              <TabsContent value="mix">
                <TrackMixer audioUrl={voiceUrl} isMixing={mixing} setMixing={setMixing} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default MusicModule;