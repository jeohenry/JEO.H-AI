// src/modules/FaceDetection.tsx 

import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import PageWrapper from '@/components/PageWrapper';
import { motion } from 'framer-motion';
import { slideUp } from '@/config/animations';

const FaceDetection = () => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
    }
  };

  const detectFace = async () => {
    if (!image) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', image);

    try {
      const res = await axios.post('http://localhost:8000/api/face-detection/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(res.data);
    } catch (err) {
      console.error('Face detection error:', err);
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
        className="max-w-3xl mx-auto space-y-6 p-6"
      >
        <h2 className="text-2xl font-bold text-indigo-700 text-center">🧠 Face Detection AI</h2>

        <div className="flex flex-col sm:flex-row gap-6 items-center justify-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="text-sm"
          />

          <Button onClick={detectFace} disabled={loading || !image}>
            {loading ? <Loader2 className="animate-spin" /> : 'Detect Face'}
          </Button>
        </div>

        {preview && (
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Preview"
              className="w-72 h-auto rounded-xl shadow-lg mt-4"
            />
          </div>
        )}

        {result && (
          <Card className="shadow-md bg-white">
            <CardContent className="p-4 space-y-4">
              <h3 className="text-xl font-semibold text-green-700">🎯 Detected Faces:</h3>
              {result.faces.map((face: any, idx: number) => (
                <div key={idx} className="p-4 bg-gray-100 rounded-xl border">
                  <p><strong>Age:</strong> {face.age}</p>
                  <p><strong>Gender:</strong> {face.gender}</p>
                  <p><strong>Emotion:</strong> {face.emotion}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default FaceDetection;








