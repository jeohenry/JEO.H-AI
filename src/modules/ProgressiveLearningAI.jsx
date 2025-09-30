// src/modules/ProgressiveLearningAI.jsx
import React, { useState, useEffect } from "react";
import API from "@/api"; // ✅ unified: always use your configured API instance
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Loader2,
  BrainCircuit,
  Trash2,
  Edit,
  Save,
  Upload,
  Download,
} from "lucide-react";
import { saveAs } from "file-saver";

const ProgressiveLearningAI = () => {
  const [askInput, setAskInput] = useState("");
  const [response, setResponse] = useState("");
  const [loadingAsk, setLoadingAsk] = useState(false);
  const [trainingList, setTrainingList] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editResponse, setEditResponse] = useState("");

  /* ───────── 📜 Fetch Training History ───────── */
  const fetchTrainings = async () => {
    try {
      const res = await API.get("/ai/history");
      setTrainingList(res.data);
    } catch (err) {
      console.error("❌ Failed to fetch trainings:", err);
    }
  };

  useEffect(() => {
    fetchTrainings();
  }, []);

  /* ───────── ❓ Ask AI ───────── */
  const handleAsk = async () => {
    if (!askInput.trim()) return;
    setLoadingAsk(true);
    try {
      const res = await API.post("/ai/query", { prompt: askInput });
      setResponse(res.data?.response || "No response.");
    } catch (err) {
      setResponse("❌ Failed to query AI.");
    } finally {
      setLoadingAsk(false);
    }
  };

  /* ───────── 🗑️ Delete Training ───────── */
  const handleDelete = async (id) => {
    try {
      await API.delete(`/ai/delete/${id}`);
      fetchTrainings();
    } catch (err) {
      console.error("❌ Failed to delete training:", err);
    }
  };

  /* ───────── ✏️ Edit Training ───────── */
  const handleEdit = (item) => {
    setEditId(item.id);
    setEditPrompt(item.prompt || item.input_text);
    setEditResponse(item.response || item.output_text);
  };

  const handleSaveEdit = async (id) => {
    try {
      await API.put(`/ai/train/${id}`, {
        input: editPrompt,
        output: editResponse,
      });
      setEditId(null);
      setEditPrompt("");
      setEditResponse("");
      fetchTrainings();
    } catch (err) {
      console.error("❌ Failed to save edit:", err);
    }
  };

  /* ───────── ⬇️ Export ───────── */
  const handleExport = async () => {
    try {
      const res = await API.get("/ai/export");
      const blob = new Blob([JSON.stringify(res.data, null, 2)], {
        type: "application/json",
      });
      saveAs(blob, "progressive_ai_memory.json");
    } catch (err) {
      console.error("❌ Failed to export memory:", err);
    }
  };

  /* ───────── ⬆️ Import ───────── */
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      await API.post("/ai/import", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchTrainings();
    } catch (err) {
      console.error("❌ Failed to import memory:", err);
    }
  };

  /* ───────── UI ───────── */
  return (
    <div className="max-w-4xl mx-auto mt-10 p-4 md:p-6 space-y-8">
      <h2 className="text-2xl font-bold text-center">
        🧠 Progressive Learning AI
      </h2>

      {/* Export/Import */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <Button onClick={handleExport} className="w-full md:w-auto">
          <Download className="mr-2" /> Export Memory
        </Button>
        <label className="cursor-pointer w-full md:w-auto">
          <input
            type="file"
            accept="application/json"
            className="hidden"
            onChange={handleImport}
          />
          <Button className="w-full md:w-auto">
            <Upload className="mr-2" /> Import Memory
          </Button>
        </label>
      </div>

      {/* Memory List */}
      <Card className="bg-white shadow-md">
        <CardContent className="space-y-2 max-h-80 overflow-y-auto">
          <h3 className="text-lg font-semibold">📜 Trained Memory</h3>
          {trainingList.map((item) => (
            <div
              key={item.id}
              className="p-3 border rounded-md flex flex-col md:flex-row md:items-center md:justify-between bg-gray-50"
            >
              {editId === item.id ? (
                <div className="flex flex-col gap-2 w-full">
                  <Input
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    className="text-sm bg-white text-black"
                    placeholder="Edit prompt..."
                  />
                  <Textarea
                    value={editResponse}
                    onChange={(e) => setEditResponse(e.target.value)}
                    className="text-sm bg-white text-black"
                    placeholder="Edit response..."
                  />
                  <Button
                    size="sm"
                    onClick={() => handleSaveEdit(item.id)}
                    className="mt-2"
                  >
                    <Save size={16} className="mr-1" /> Save
                  </Button>
                </div>
              ) : (
                <div className="flex-1">
                  <p className="text-sm font-semibold text-gray-800">
                    Q: {item.prompt || item.input_text}
                  </p>
                  <p className="text-sm text-gray-600">
                    A: {item.response || item.output_text}
                  </p>
                </div>
              )}

              {editId !== item.id && (
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Button
                    size="sm"
                    onClick={() => handleEdit(item)}
                    variant="outline"
                  >
                    <Edit size={16} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Ask AI */}
      <Card>
        <CardContent className="space-y-4 mt-4">
          <h3 className="text-lg font-semibold">❓ Ask the AI</h3>
          <Input
            placeholder="Example: What is the capital of Kenya?"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            className="bg-white text-black"
          />
          <Button
            onClick={handleAsk}
            disabled={loadingAsk || !askInput.trim()}
            className="w-full md:w-auto"
          >
            {loadingAsk ? (
              <Loader2 className="animate-spin mr-2" />
            ) : (
              <BrainCircuit className="mr-2" />
            )}
            Ask
          </Button>
        </CardContent>
      </Card>

      {response && (
        <Card className="bg-gray-100">
          <CardContent className="mt-4 text-sm text-gray-800 whitespace-pre-wrap">
            {response}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressiveLearningAI;