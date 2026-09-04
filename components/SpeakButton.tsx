"use client";

import { useEffect, useRef, useState } from "react";

interface SpeakButtonProps {
  text: string;
  className?: string;
}

function pickGermanVoice(voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null {
  const de = voices.find(
    (v) => v.lang.toLowerCase().replace("_", "-") === "de-de" && v.localService
  );
  if (de) return de;
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith("de")) ?? null
  );
}

export function SpeakButton({ text, className = "" }: SpeakButtonProps) {
  const [supported, setSupported] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    setSupported(true);
    const load = () => {
      voiceRef.current = pickGermanVoice(window.speechSynthesis.getVoices());
    };
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", load);
      window.speechSynthesis.cancel();
    };
  }, []);

  if (!supported) return null;

  const speak = () => {
    const synth = window.speechSynthesis;
    synth.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = "de-DE";
    if (voiceRef.current) utter.voice = voiceRef.current;
    utter.rate = 0.9;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    setSpeaking(true);
    synth.speak(utter);
  };

  return (
    <button
      onClick={speak}
      title="Hear pronunciation"
      aria-label={`Hear pronunciation of ${text}`}
      className={`inline-flex items-center justify-center rounded-full p-2 transition hover:bg-gray-100 dark:hover:bg-gray-800 ${className}`}
    >
      {speaking ? (
        <svg
          className="h-5 w-5 animate-pulse text-blue-600 dark:text-blue-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12z" />
        </svg>
      ) : (
        <svg
          className="h-5 w-5 text-gray-500 dark:text-gray-400"
          viewBox="0 0 24 24"
          fill="currentColor"
          aria-hidden
        >
          <path d="M3 10v4h4l5 5V5L7 10H3zm13.5 2a4.5 4.5 0 0 0-2.5-4.03v8.05A4.5 4.5 0 0 0 16.5 12zM14 3.23v2.06a7 7 0 0 1 0 13.42v2.06a9 9 0 0 0 0-17.54z" />
        </svg>
      )}
    </button>
  );
}