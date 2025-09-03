//src/pages/HealthAI.tsx

import React, { useState } from 'react';
import axios from 'axios';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import PageWrapper from '../components/PageWrapper';
import { motion } from 'framer-motion';
import { slideUp } from '../config/animations';

const HealthAI = () => {
  const [symptoms, setSymptoms] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [healthAdvice, setHealthAdvice] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingAdvice, setLoadingAdvice] = useState(false);

  const handleDiagnose = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setDiagnosis('');
    setPrescription('');
    try {
      const res = await axios.post('http://localhost:8000/api/health/', { symptoms });
      setDiagnosis(res.data.diagnosis);
      setPrescription(res.data.prescription);
    } catch (error) {
      setDiagnosis('❌ Error analyzing symptoms.');
      setPrescription('');
    } finally {
      setLoading(false);
    }
  };

  const handleAdvice = async () => {
    if (!symptoms.trim()) return;
    setLoadingAdvice(true);
    setHealthAdvice('');
    try {
      const res = await axios.post('http://localhost:8000/api/health-diagnosis/', { symptoms });
      setHealthAdvice(res.data.health_advice);
    } catch (error) {
      setHealthAdvice('❌ Error retrieving AI health advice.');
    } finally {
      setLoadingAdvice(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="p-6 w-full max-w-3xl mx-auto space-y-6"
        variants={slideUp}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        <Card className="shadow-lg">
          <CardContent className="space-y-5 p-6">
            <h2 className="text-2xl font-bold text-center text-blue-700">
              🩺 AI Health Diagnosis & Prescription
            </h2>

            <Textarea
              placeholder="📝 Describe your symptoms in detail..."
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              className="min-h-[120px] focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex flex-col md:flex-row gap-2 pt-2">
              <Button onClick={handleDiagnose} disabled={loading} className="w-full">
                {loading ? <Loader2 className="animate-spin w-4 h-4" /> : '🧬 Get Diagnosis & Prescription'}
              </Button>
              <Button onClick={handleAdvice} disabled={loadingAdvice} className="w-full">
                {loadingAdvice ? <Loader2 className="animate-spin w-4 h-4" /> : '🤖 Get AI Health Advice'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {(diagnosis || prescription) && (
          <Card className="bg-green-50 shadow-md border-green-200">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xl font-semibold text-green-800">📋 Diagnosis</h3>
              <p>{diagnosis}</p>
              <h3 className="text-xl font-semibold text-blue-800">💊 Prescription</h3>
              <p>{prescription}</p>
            </CardContent>
          </Card>
        )}

        {healthAdvice && (
          <Card className="bg-yellow-50 shadow-md border-yellow-200">
            <CardContent className="p-5 space-y-3">
              <h3 className="text-xl font-semibold text-yellow-800">💡 AI Health Advice</h3>
              <p>{healthAdvice}</p>
            </CardContent>
          </Card>
        )}
      </motion.div>
    </PageWrapper>
  );
};

export default HealthAI;






