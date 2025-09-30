import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";
import API from "@/api"; // 🔗 use the configured axios instance

export default function Predict() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!input.trim()) return;
    setLoading(true);
    setResult("");

    try {
      const response = await API.post("/predict/", {
        context: input,
        user_id: "system", // ✅ default user, can be dynamic
        provider: "auto",
        model_name: "auto",
        language: "en",
      });

      setResult(response.data.answer);
    } catch (error) {
      if (error.response) {
        setResult(
          `❌ Error: ${
            error.response.data?.detail || "Failed to generate prediction."
          }`
        );
      } else {
        setResult("❌ Network error while predicting.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto w-full">
      <h2 className="text-2xl font-bold mb-4 text-center text-blue-700">
        🔮 AI Prediction Engine
      </h2>

      <Card className="shadow-lg">
        <CardContent className="space-y-4 p-4">
          <Textarea
            placeholder="⚡ Ask about sports, forex trades, or anything you want predicted..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full min-h-[120px] 
                       text-black placeholder-gray-500
                       dark:text-white dark:placeholder-gray-400
                       bg-white dark:bg-gray-900
                       focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <Button
            onClick={handlePredict}
            disabled={loading}
            className="w-full flex items-center justify-center"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" /> Predicting...
              </>
            ) : (
              "🚀 Predict"
            )}
          </Button>

          {result && (
            <div
              className="mt-4 p-4 border rounded-lg shadow-sm 
                            bg-gray-50 dark:bg-gray-800 text-sm md:text-base"
            >
              <h4 className="font-semibold mb-2 text-blue-600 dark:text-blue-300">
                📊 Prediction:
              </h4>
              <p>{result}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}