// /src/components/music/MusicVisualizer.tsx
import React, { useEffect, useRef, useState } from "react";

const MusicVisualizer = ({ audioRef }: { audioRef: React.RefObject<HTMLAudioElement> }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [analyzer, setAnalyzer] = useState<AnalyserNode | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    const audioCtx = new AudioContext();
    const source = audioCtx.createMediaElementSource(audioRef.current);
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 128;

    source.connect(analyser);
    analyser.connect(audioCtx.destination);
    setAnalyzer(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const render = () => {
      requestAnimationFrame(render);
      analyser.getByteFrequencyData(dataArray);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const barWidth = (canvas.width / bufferLength) * 1.5;
      let x = 0;
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = dataArray[i] * 1.2;
        const hue = (i * 360) / bufferLength;
        ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth + 1;
      }
    };

    render();
  }, [audioRef]);

  return <canvas ref={canvasRef} className="w-full h-24 rounded bg-black shadow-inner" />;
};

export default MusicVisualizer;