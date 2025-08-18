import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic, StopCircle, Volume2, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import PageWrapper from "@/components/PageWrapper";

export default function UnifiedVoice({ userId }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [previewText, setPreviewText] = useState("Hello, this is a preview!");
  const [savedVoiceText, setSavedVoiceText] = useState("Hi, this is my saved voice!");
  const [mimicText, setMimicText] = useState("This is my custom mimic voice text!");
  const [playingUrl, setPlayingUrl] = useState(null);
  const [progress, setProgress] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [listening, setListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [responseText, setResponseText] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const audioRef = useRef(null);
  const BASE_URL = "http://localhost:8000";

  // ---------------- Fetch Voices ----------------
  useEffect(() => {
    axios.get(`${BASE_URL}/voices/`)
      .then(res => setVoices(res.data.voices || res.data || []))
      .catch(err => console.error(err));
  }, []);

  // ---------------- Audio Playback Helpers ----------------
  const playAudioBlob = (blob) => {
    if (audioRef.current) {
      audioRef.current.pause();
      URL.revokeObjectURL(audioRef.current.src);
    }
    const url = URL.createObjectURL(blob);
    const audio = new Audio(url);
    audioRef.current = audio;
    setPlayingUrl(url);
    setIsPlaying(true);

    audio.addEventListener("timeupdate", () => setProgress(audio.currentTime / audio.duration));
    audio.addEventListener("ended", () => {
      setIsPlaying(false);
      setProgress(0);
      URL.revokeObjectURL(url);
      setPlayingUrl(null);
    });

    audio.play();
    return url;
  };

  const downloadAudioBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  // ---------------- Voice Actions ----------------
  const saveVoice = () => {
    if (!selectedVoice) return;
    axios.post(`${BASE_URL}/choose-voice/`, { user_id: userId, voice_id: selectedVoice })
      .then(() => alert("Voice saved!"))
      .catch(err => console.error(err));
  };

  const handlePreview = async (voice_id, download = false) => {
    try {
      const response = await axios.get(`${BASE_URL}/voice-preview-tts/`, {
        params: { voice_id, text: previewText },
        responseType: "blob"
      });
      if (download) downloadAudioBlob(response.data, `preview_${voice_id}.mp3`);
      else playAudioBlob(response.data);
    } catch (err) {
      console.error(err);
      alert("Preview failed.");
    }
  };

  const handleSavedVoice = async (download = false) => {
    try {
      const response = await axios.get(`${BASE_URL}/play-saved-voice/`, {
        params: { user_id: userId, text: savedVoiceText },
        responseType: "blob"
      });
      if (download) downloadAudioBlob(response.data, `${userId}_saved_voice.mp3`);
      else playAudioBlob(response.data);
    } catch (err) {
      console.error(err);
      alert("Failed to play saved voice.");
    }
  };

  const handleSpeakDirect = async (text) => {
    try {
      const response = await axios.get(`${BASE_URL}/speak/`, {
        params: { user_id: userId, text },
        responseType: "blob"
      });
      playAudioBlob(response.data);
    } catch (err) {
      console.error(err);
      alert("Direct speak failed.");
    }
  };

  const handleMimic = async () => {
    try {
      const response = await axios.post(`${BASE_URL}/voice-mimic/`, { text: mimicText }, { responseType: "blob" });
      downloadAudioBlob(response.data, "voice_mimic.mp3");
    } catch (err) {
      console.error(err);
      alert("Voice mimic generation failed.");
    }
  };

  // ---------------- Speech Recognition ----------------
  const recognition = typeof window !== "undefined" &&
    new (window.SpeechRecognition || window.webkitSpeechRecognition)();

  const startListening = () => {
    setTranscript("");
    setListening(true);
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;

    recognition.onresult = (event) => {
      const transcriptParts = [];
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        transcriptParts.push(event.results[i][0].transcript);
      }
      setTranscript(transcriptParts.join(" "));
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
      const response = await axios.post(`${BASE_URL}/voice-text/`, { text: transcript });
      const answer = response.data.response;
      setResponseText(answer);

      const audio = await axios.post(`${BASE_URL}/voice-mimic/`, { text: answer }, { responseType: "blob" });
      setAudioUrl(URL.createObjectURL(audio.data));
    } catch (err) {
      setResponseText("Error processing voice.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageWrapper>
      <motion.div className="max-w-3xl mx-auto p-6" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <Card className="shadow-lg border bg-gradient-to-tr from-blue-50 to-indigo-100">
          <CardContent className="space-y-6 p-6">

            {/* Voice Assistant Section */}
            <div className="flex items-center gap-2 mb-2">
              <Mic className="text-blue-600" />
              <h2 className="text-2xl font-bold">🎙️ JEO.H Voice Assistant</h2>
            </div>
            <div className="flex gap-4 flex-wrap">
              {!listening ? (
                <Button onClick={startListening} className="bg-blue-600 text-white"><Mic className="mr-2" /> Start Listening</Button>
              ) : (
                <Button onClick={stopListening} variant="destructive"><StopCircle className="mr-2" /> Stop</Button>
              )}
              <Button onClick={handleSubmitVoice} disabled={loading || !transcript}>
                {loading ? <Loader2 className="animate-spin h-5 w-5 mr-2" /> : <Volume2 className="mr-2" />}
                Submit Voice
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">🗣️ Your Input</h3>
                <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">{transcript || "Waiting for input..."}</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-700 mb-1">🤖 AI Response</h3>
                <p className="bg-white p-3 rounded shadow text-gray-800 min-h-[48px]">{responseText || "Awaiting AI response..."}</p>
              </div>
              {audioUrl && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-1">🔊 Audio Response</h3>
                  <audio controls src={audioUrl} className="w-full mt-2 rounded" />
                </div>
              )}
            </div>

            {/* Voice Manager Section */}
            <hr className="my-6" />
            <h2>🎤 Voice Manager</h2>
            <textarea value={previewText} onChange={(e) => setPreviewText(e.target.value)} rows={2} placeholder="Type something to preview..." className="w-full mb-2" />
            <ul className="list-none p-0">
              {voices.map((v) => (
                <li key={v.voice_id} style={{
                  display: "flex", alignItems: "center", gap: "10px", marginBottom: "5px",
                  backgroundColor: selectedVoice === v.voice_id ? "#e0f7fa" : "transparent",
                  padding: "5px", borderRadius: "5px"
                }}>
                  <span style={{ flex: 1 }}>{v.name}</span>
                  <button disabled={isPlaying} onClick={() => handlePreview(v.voice_id)}>▶ Preview</button>
                  <button disabled={isPlaying} onClick={() => handlePreview(v.voice_id, true)}>⬇ Download</button>
                  <input type="radio" name="selectedVoice" value={v.voice_id} onChange={() => setSelectedVoice(v.voice_id)} checked={selectedVoice === v.voice_id} />
                </li>
              ))}
            </ul>
            <Button onClick={saveVoice} disabled={!selectedVoice} className="mt-2">💾 Save Selected Voice</Button>

            {/* Playback Progress */}
            {isPlaying && (
              <div className="mt-2 h-2 bg-gray-300 rounded">
                <div className="h-2 bg-blue-400 rounded" style={{ width: `${progress * 100}%` }} />
              </div>
            )}

            {/* Saved Voice Section */}
            <hr className="my-6" />
            <h3>🟢 Test My Saved Voice</h3>
            <textarea value={savedVoiceText} onChange={(e) => setSavedVoiceText(e.target.value)} rows={2} placeholder="Type something to test your saved voice..." className="w-full mb-2" />
            <Button disabled={isPlaying} onClick={() => handleSavedVoice(false)}>▶ Play My Saved Voice</Button>
            <Button disabled={isPlaying} onClick={() => handleSavedVoice(true)}>⬇ Download My Saved Voice</Button>

            {/* Voice Mimic & Direct Speak */}
            <hr className="my-6" />
            <h3>🎭 Voice Mimic & Direct Speak</h3>
            <textarea value={mimicText} onChange={(e) => setMimicText(e.target.value)} rows={2} placeholder="Type text for voice mimic..." className="w-full mb-2" />
            <Button disabled={isPlaying} onClick={handleMimic}>⬇ Generate & Download Voice Mimic</Button>
            <Button disabled={isPlaying} onClick={() => handleSpeakDirect(mimicText)}>▶ Speak Directly</Button>

          </CardContent>
        </Card>
      </motion.div>
    </PageWrapper>
  );
}













