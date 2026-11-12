// Thin wrappers over the browser Web Speech APIs. Kept separate so they can later be
// replaced by dedicated Indian-language speech services.

type SR = {
  lang: string; interimResults: boolean; continuous: boolean;
  onresult: ((e: any) => void) | null; onerror: ((e: any) => void) | null; onend: (() => void) | null;
  start: () => void; stop: () => void; abort: () => void;
};

export function getRecognitionCtor(): (new () => SR) | null {
  if (typeof window === "undefined") return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}
export const isRecognitionSupported = () => !!getRecognitionCtor();
export const isSynthesisSupported = () => typeof window !== "undefined" && "speechSynthesis" in window;

export type RecognitionHandle = { stop: () => void };

export function startRecognition(opts: {
  lang: string;
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (code: string) => void;
  onEnd: () => void;
}): RecognitionHandle | null {
  const Ctor = getRecognitionCtor();
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = opts.lang;
  rec.interimResults = true;
  rec.continuous = false;
  let finalText = "";
  rec.onresult = (e: any) => {
    let interim = "";
    for (let i = e.resultIndex; i < e.results.length; i++) {
      const r = e.results[i];
      if (r.isFinal) finalText += r[0].transcript;
      else interim += r[0].transcript;
    }
    opts.onInterim((finalText + interim).trim());
  };
  rec.onerror = (e: any) => opts.onError(e?.error ?? "unknown");
  rec.onend = () => { if (finalText.trim()) opts.onFinal(finalText.trim()); opts.onEnd(); };
  try { rec.start(); } catch { opts.onError("start-failed"); return null; }
  return { stop: () => rec.stop() };
}

function pickVoice(lang: "hi" | "en") {
  const voices = window.speechSynthesis.getVoices();
  if (lang === "hi") return voices.find((v) => v.lang === "hi-IN") ?? voices.find((v) => v.lang.startsWith("hi"));
  return voices.find((v) => v.lang === "en-IN") ?? voices.find((v) => v.lang.startsWith("en"));
}
export function hasVoiceFor(lang: "hi" | "en") {
  return isSynthesisSupported() && !!pickVoice(lang);
}

export function speak(text: string, lang: "hi" | "en", onEnd?: () => void) {
  if (!isSynthesisSupported()) return false;
  const s = window.speechSynthesis;
  s.cancel();
  const u = new SpeechSynthesisUtterance(text.replace(/[*_#>]/g, ""));
  u.lang = lang === "hi" ? "hi-IN" : "en-IN";
  const v = pickVoice(lang);
  if (v) u.voice = v;
  u.rate = 0.95;
  u.onend = () => onEnd?.();
  u.onerror = () => onEnd?.();
  s.speak(u);
  return true;
}
export const pauseSpeech = () => isSynthesisSupported() && window.speechSynthesis.pause();
export const resumeSpeech = () => isSynthesisSupported() && window.speechSynthesis.resume();
export const stopSpeech = () => isSynthesisSupported() && window.speechSynthesis.cancel();
