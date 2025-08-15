import React, { useState } from 'react';
import axios from 'axios';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { slideUp } from '@/config/animations';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Button
} from '@/components/ui/button';
import {
  Textarea
} from '@/components/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select';

const ContentCreator = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState('blog');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8000/content-creator', {
        prompt,
        content_type: contentType,
      });
      setResult(response.data.content);
    } catch (err) {
      setResult('❌ Error generating content.');
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
        className="max-w-3xl mx-auto p-6 space-y-6"
      >
        <Card className="shadow-md">
          <CardContent className="space-y-4">
            <h2 className="text-2xl font-bold text-center text-indigo-700">
              ✨ AI Content Creator
            </h2>

            <Select onValueChange={setContentType} defaultValue="blog">
              <SelectTrigger>
                <SelectValue placeholder="Select content type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="blog">📝 Blog Post</SelectItem>
                <SelectItem value="ad">📢 Advertisement</SelectItem>
                <SelectItem value="story">📚 Short Story</SelectItem>
                <SelectItem value="script">🎬 Script</SelectItem>
                <SelectItem value="caption">📸 Caption</SelectItem>
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Enter your idea or prompt here..."
              rows={5}
              className="w-full"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <div className="flex justify-end">
              <Button onClick={handleGenerate} disabled={loading || !prompt}>
                {loading ? 'Generating...' : 'Generate Content'}
              </Button>
            </div>

            {result && (
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <h4 className="font-semibold mb-2 text-green-700">Generated Content:</h4>
                <p className="whitespace-pre-wrap">{result}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default ContentCreator;




