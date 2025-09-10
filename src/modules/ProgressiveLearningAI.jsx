//src/modules/ProgressiveLearningAI.jsx


import React, { useState, useEffect } from 'react';
import axios from '@/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, BrainCircuit, Trash2, Edit, Save, Upload, Download } from 'lucide-react';
import { saveAs } from 'file-saver';
import { trainAI, queryAI } from "@/api";

const ProgressiveLearningAI = () => {
  const [askInput, setAskInput] = useState('');
  const [response, setResponse] = useState('');
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [trainingList, setTrainingList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  const fetchTrainings = async () => {
    const res = await axios.get('/progressive-ai/trainings');
    setTrainingList(res.data);
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  const handleAsk = async () => {
    if (!askInput.trim()) return;
    setLoadingAsk(true);
    try {
      const res = await axios.post('/progressive-ai/query', {
        input: askInput,
      });
      setResponse(res.data?.response || 'No response.');
    } catch {
      setResponse('Ask failed.');
    } finally {
      setLoadingAsk(false);
    }
  };

  const handleDelete = async (id) => {
    await axios.delete(`/progressive-ai/train/${id}`);
    fetchTrainings();
  };

  const handleEdit = (id, text) => {
    setEditId(id);
    setEditText(text);
  };

  const handleSaveEdit = async (id) => {
    await axios.put(`/progressive-ai/train/${id}`, { text: editText });
    setEditId(null);
    setEditText('');
    fetchTrainings();
  };

  const handleExport = async () => {
    const res = await axios.get('/progressive-ai/export');
    const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: 'application/json' });
    saveAs(blob, 'progressive_ai_memory.json');
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    await axios.post('/progressive-ai/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    fetchTrainings();
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 space-y-8">
      <h2 className="text-2xl font-bold text-center">🧠 Progressive Learning AI</h2>

      {/* Export/Import Buttons */}
      <div className="flex justify-between gap-4">
        <Button onClick={handleExport}>
          <Download className="mr-2" /> Export Memory
        </Button>
        <label className="cursor-pointer">
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
          <Button><Upload className="mr-2" /> Import Memory</Button>
        </label>
      </div>

      {/* Display Trained Data */}
      <Card className="bg-gray-50">
        <CardContent className="space-y-2 max-h-60 overflow-y-auto">
          <h3 className="text-lg font-semibold">📜 Trained Memory</h3>
          {trainingList.map((item) => (
            <div key={item.id} className="p-2 border-b flex justify-between items-center">
              {editId === item.id ? (
                <div className="flex-1 mr-2">
                  <Input
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    className="text-sm"
                  />
                </div>
              ) : (
                <span className="text-sm flex-1">{item.text}</span>
              )}
              <div className="flex space-x-2">
                {editId === item.id ? (
                  <Button size="sm" onClick={() => handleSaveEdit(item.id)}>
                    <Save size={16} />
                  </Button>
                ) : (
                  <Button size="sm" onClick={() => handleEdit(item.id, item.text)}>
                    <Edit size={16} />
                  </Button>
                )}
                <Button size="sm" variant="destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 size={16} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ask AI Section */}
      <Card>
        <CardContent className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold">❓ Ask the AI</h3>
          <Input
            placeholder="Example: What is the capital of Kenya?"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
          />
          <Button onClick={handleAsk} disabled={loadingAsk || !askInput.trim()}>
            {loadingAsk ? <Loader2 className="animate-spin mr-2" /> : <BrainCircuit className="mr-2" />}
            Ask
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card className="bg-gray-100">
          <CardContent className="mt-4 text-s