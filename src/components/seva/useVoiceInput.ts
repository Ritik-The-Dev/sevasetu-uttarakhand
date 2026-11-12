import { useEffect, useRef, useState } from "react";
import { isRecognitionSupported, startRecognition, type RecognitionHandle } from "@/lib/speech";

export function useVoiceInput(onText: (t: string, final: boolean) => void) {
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const ref = useRef<RecognitionHandle | null>(null);
  useEffect(() => setSupported(isRecognitionSupported()), []);
  useEffect(() => () => ref.current?.stop(), []);
  const toggle = (lang: "hi-IN" | "en-IN") => {
    if (listening) {
      ref.current?.stop();
      return;
    }
    setError(null);
    const h = startRecognition({
      lang,
      onInterim: (t) => onText(t, false),
      onFinal: (t) => onText(t, true),
      onError: (code) => setError(code),
      onEnd: () => {
        setListening(false);
        ref.current = null;
      },
    });
    if (!h) {
      setSupported(false);
      return;
    }
    ref.current = h;
    setListening(true);
  };
  return { listening, error, supported, toggle };
}

export function voiceErrorText(code: string, t: (hi: string, en: string) => string) {
  if (code === "not-allowed" || code === "service-not-allowed")
    return t(
      "माइक्रोफ़ोन की अनुमति नहीं मिली। ब्राउज़र सेटिंग में अनुमति दें या टाइप करें।",
      "Microphone permission was denied. Allow it in browser settings, or type instead.",
    );
  if (code === "no-speech")
    return t("कोई आवाज़ नहीं सुनाई दी। फिर से कोशिश करें।", "No speech was heard. Please try again.");
  if (code === "network")
    return t(
      "आवाज़ पहचान के लिए इंटरनेट चाहिए। आप टाइप कर सकते हैं।",
      "Speech recognition needs a network connection. You can type instead.",
    );
  if (code === "aborted") return "";
  return t(
    "आवाज़ पहचान में समस्या हुई। आप टाइप कर सकते हैं।",
    "Speech recognition failed. You can type instead.",
  );
}
