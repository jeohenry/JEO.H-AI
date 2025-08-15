import React, { useState } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Volume2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/PageWrapper";

const VoiceAssistant = () => {
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const recognition =
    typeof window !== "undefined" &&
    new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  const startListening = () => {
    setTranscript("");
    setListening(true);
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event: any) => {
  try {
    const transcriptParts = [];
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      transcriptParts.push(event.results[i][0].transcript);
    }
    const fullTranscript = transcriptParts.join(' ');
    setTranscript(fullTranscript);
  } catch (error) {
    console.error("Speech recognition error:", error);
  }
};
    recognition.onend = () => setListening(false);
    recognition.start();
  };

  const stopListening = () => recognition.stop();

  const handleSubmitVoice = async () => {
    if (!transcript) return;
    setLoading(true);
    setResponseText("");
    setAudioUrl("");

    try {
      const response = await axios.post("http://localhost:8000/api/voice-text/", {
        text: transcript,
      });

      const answer = response.data.response;
      setResponseText(answer);

      const audio = await axios.post(
        "http://localhost:8000/api/voice-mimic/",
        { text: answer },
        { responseType: "blob" }
      );

      const url = URL.createObjectURL(audio.data);
      setAudioUrl(url);
    } catch (error) {
      setResponseText("Error processing voice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div
        className="max-w-3xl mx-auto p-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <Card className="shadow-lg border bg-gradient-to-tr from-blue-50 to-indigo-100">
          <CardContent className="space-y-6 p-6">
            <div className="flex items-center gap-2 mb-2">
              <Mic className="text-blue-600" />
              <h2 className="text-2xl font-bold">🎙️ JEO.H Voice Assistant</h2>
            </div>

            <div className="flex gap-4 flex-wrap">
              {!listening ? (
                <Button onClick={startListening} className="bg-blue-600 text-white">
                  <Mic className="mr-2" /> Start Listening
                </Button>
              ) : (
                <Button onClick={stopListening} variant="destructive">
                  <StopCircle className="mr-2" /> Stop
                </Button>
              )}

              <Button onClick={handleSubmitVoice} disabled={loading || !transcript}>
                {loading ? (
                  <Loader2 className="animate-spin h-5 w-5 mr-2" />
                ) : (
                  <Volume2 className="mr-2" />
                )}
                Submit Voice
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">🗣️ Your Input</h3>
                <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">
                  {transcript || "Waiting for input..."}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-gray-700 mb-1">🤖 AI Response</h3>
                <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">
                  {responseText || "Awaiting AI response..."}
                </p>
              </div>

              {audioUrl && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">🔊 Audio Response</h3>
                  <audio controls src={audioUrl} className="w-full mt-2 rounded" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
};

export default VoiceAssistant;