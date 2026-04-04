import { useEffect, useRef, useState } from 'react';
import { GlitchText } from './GlitchText';

export const LoadingScreen = () => {
  const canvasRef = useRef(null);
  const [msgIdx, setMsgIdx] = useState(0);
  const messages = ["INITIALIZING SYSTEMS...", "LOADING ASSETS...", "ESTABLISHING CONNECTION...", "GENESIS ONLINE"];

  useEffect(() => {
    const interval = setInterval(() => {
      setMsgIdx(prev => Math.min(prev + 1, messages.length - 1));
    }, 800);
    return () => clearInterval(interval);
  }, [messages.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const chars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const fontSize = 10;
    const columns = canvas.width / fontSize;
    const drops = Array(Math.floor(columns)).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#00F5FF';
      ctx.font = fontSize + 'px monospace';

      for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const intervalId = setInterval(draw, 33);
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-cp-black flex flex-col items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-20 pointer-events-none" />
      <div className="z-10 flex flex-col items-center gap-8">
        <h1 className="font-orbitron font-bold text-6xl text-cp-cyan tracking-[0.3em]">
          <GlitchText text="GENESIS" />
        </h1>
        <div className="h-6">
          <p className="font-mono text-cp-magenta tracking-widest text-sm animate-pulse">
            {messages[msgIdx]}
          </p>
        </div>
      </div>
    </div>
  );
};
