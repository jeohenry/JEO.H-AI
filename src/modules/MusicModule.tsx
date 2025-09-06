// src/modules/MusicModule.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Music, Wand2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { motion } from 'framer-motion';
import PageWrapper from '@/components/PageWrapper';
import ExportButtonGroup from '@/components/music/ExportButtonGroup';
import MusicVisualizer from '@/components/music/MusicVisualizer';
import TrackMixer from '@/components/music/TrackMixer';
import ThemeSwitcher from '@/components/ThemeSwitcher';

const MusicModule = () => {
  const [query, setQuery] = useState('');
  const [lyrics, setLyrics] = useState('');
  const [voiceUrl, setVoiceUrl] = useState('');
  const [voiceId, setVoiceId] = useState('default');
  const [voices, setVoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mixing, setMixing] = useState(false);

  useEffect(() => {
    axios.get('/api/music/voices').then(res => setVoices(res.data.voices || []));
  }, []);

  const handleGenerateLyrics = async () => {
    if (!query) return;
    setLoading(true);
    setLyrics('');
    try {
      const res = await axios.post('/api/music/lyrics', { prompt: query });
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
      const res = await axios.post('/api/music/voice', { text: lyrics, voice_id: voiceId });
      setVoiceUrl(res.data.voice_url);
    } catch {
      setVoiceUrl('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="max-w-6xl mx-auto p-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        {/* Header with Theme Switcher */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Music className="text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-3xl font-bold dark:text-white">
              🎼 JEO.H Advanced Music AI
            </h2>
          </div>
          <ThemeSwitcher />
        </div>

        {/* Card with dark/light background */}
        <Card className="shadow-xl border bg-gradient-to-br from-indigo-100 to-pink-50 dark:from-gray-900 dark:to-gray-800">
          <CardContent className="space-y-6 p-6">
            <Tabs defaultValue="lyrics">
              <TabsList>
                <TabsTrigger value="lyrics">📝 Lyrics</TabsTrigger>
                <TabsTrigger value="voice">🎤 Voice</TabsTrigger>
                <TabsTrigger value="preview">🎧 Visualizer</TabsTrigger>
                <TabsTrigger value="mix">🎚️ Mixer</TabsTrigger>
              </TabsList>

              {/* Lyrics Tab */}
              <TabsContent value="lyrics">
                <Textarea
                  placeholder="Describe a vibe, story or theme..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="min-h-[120px] dark:bg-gray-900 dark:text-gray-100"
                />
                <Button onClick={handleGenerateLyrics} disabled={loading} className="mt-4">
                  {loading ? <Loader2 className="animate-spin" /> : 'Generate Lyrics'}
                </Button>

                {lyrics && (
                  <>
                    <Textarea
                      value={lyrics}
                      onChange={(e) => setLyrics(e.target.value)}
                      className="mt-4 bg-white dark:bg-gray-900 dark:text-gray-100"
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
                    className="w-full border p-2 rounded dark:bg-gray-900 dark:text-gray-100"
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
                    Generate a voice to preview waveform
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