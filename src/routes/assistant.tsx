import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  AlertCircle,
  History,
  Mic,
  MicOff,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Send,
  Square,
  Trash2,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { getService } from "@/data/services";
import { respond, type AssistantResponse, type ReplyLang } from "@/lib/assistant";
import { usePrefs } from "@/lib/prefs";
import { isSynthesisSupported, pauseSpeech, resumeSpeech, speak, stopSpeech } from "@/lib/speech";
import { KEYS, readStored, useStored } from "@/lib/storage";
import { DemoBadge } from "@/components/seva/DemoBadge";
import { ServiceIcon } from "@/components/seva/ServiceIcon";
import { useVoiceInput, voiceErrorText } from "@/components/seva/useVoiceInput";

type Msg = {
  id: string;
  role: "user" | "assistant";
  text: string;
  at: number;
  data?: AssistantResponse;
};
type Convo = { id: string; title: string; topic: string | null; messages: Msg[] };
type Failed = { convoId: string; text: string; forcedIntent?: string | undefined };

export type AssistantSearch = { q?: string; voice?: boolean; conversation?: string };

export const Route = createFileRoute("/assistant")({
  validateSearch: (s: Record<string, unknown>): AssistantSearch => {
    const out: AssistantSearch = {};
    if (typeof s["q"] === "string" && s["q"].trim()) out.q = s["q"];
    if (s["voice"] === true || s["voice"] === "true") out.voice = true;
    if (typeof s["conversation"] === "string" && s["conversation"])
      out.conversation = s["conversation"];
    return out;
  },
  head: () => ({
    meta: [
      { title: "AI Assistant (demo) — SevaSetu Uttarakhand" },
      {
        name: "description",
        content: "Hindi-first, voice-enabled assistant demo for finding government services.",
      },
      { property: "og:title", content: "SevaSetu Assistant (demo)" },
      {
        property: "og:description",
        content: "Ask by voice or text in Hindi, Hinglish or English.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Assistant,
});

const uid = () => Math.random().toString(36).slice(2, 10);

const SUGGESTIONS = [
  "मुझे एक सर्टिफिकेट चाहिए।",
  "Mujhe income certificate banana hai",
  "मेरे बच्चे की पढ़ाई के लिए कोई योजना है?",
  "I need help for my farm",
];

const LANG_LABEL: Record<string, { hi: string; en: string }> = {
  hi: { hi: "हिन्दी", en: "Hindi" },
  hinglish: { hi: "हिंग्लिश", en: "Hinglish" },
  en: { hi: "अंग्रेज़ी", en: "English" },
};

function Assistant() {
  const { q, voice, conversation } = Route.useSearch();
  const { t, lang } = usePrefs();
  const [convos, setConvos] = useStored<Convo[]>(KEYS.conversations, []);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [reply, setReply] = useState<"auto" | ReplyLang>("auto");
  const [speaking, setSpeaking] = useState<{ id: string; paused: boolean } | null>(null);
  const [failed, setFailed] = useState<Failed | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [synthesis, setSynthesis] = useState(false);
  const [voiceLangs, setVoiceLangs] = useState<string[]>([]);
  const listRef = useRef<HTMLDivElement>(null);
  const active = convos.find((c) => c.id === activeId) ?? null;
  const v = useVoiceInput((text) => setInput(text));
  const started = useRef(false);

  useEffect(() => {
    if (!active?.messages.length && !typing) return;
    const el = listRef.current;
    el?.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
  }, [active?.messages.length, typing]);

  useEffect(
    () => () => {
      stopSpeech();
    },
    [],
  );

  useEffect(() => {
    setSynthesis(isSynthesisSupported());
    if (!isSynthesisSupported()) return;
    const load = () => setVoiceLangs(window.speechSynthesis.getVoices().map((v) => v.lang));
    load();
    window.speechSynthesis.addEventListener("voiceschanged", load);
    return () => window.speechSynthesis.removeEventListener("voiceschanged", load);
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    if (conversation) {
      const stored = readStored<Convo[]>(KEYS.conversations, []);
      if (stored.some((c) => c.id === conversation)) {
        setActiveId(conversation);
        return;
      }
    }
    if (q) {
      send(q);
      return;
    }
    if (voice) v.toggle(lang === "en" ? "en-IN" : "hi-IN");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function runAssistant(convo: Convo, text: string, forcedIntent?: string) {
    setTyping(true);
    setFailed(null);
    window.setTimeout(() => {
      try {
        const data = respond(
          text,
          { topic: convo.topic },
          {
            uiLang: lang,
            forcedIntent,
            replyOverride: reply === "auto" ? undefined : reply,
          },
        );
        const msg: Msg = {
          id: uid(),
          role: "assistant",
          text: data.response_text,
          at: Date.now(),
          data,
        };
        setConvos((cs) =>
          cs.map((c) =>
            c.id === convo.id
              ? { ...c, topic: data.topic ?? c.topic, messages: [...c.messages, msg] }
              : c,
          ),
        );
      } catch (error) {
        console.error(error);
        setFailed({ convoId: convo.id, text, forcedIntent });
      } finally {
        setTyping(false);
      }
    }, 650);
  }

  function send(text: string, forcedIntent?: string) {
    const clean = text.trim();
    if (!clean || typing) return;
    let convo = active;
    if (!convo) {
      convo = { id: uid(), title: clean.slice(0, 40), topic: null, messages: [] };
    }
    const userMsg: Msg = { id: uid(), role: "user", text: clean, at: Date.now() };
    const withUser: Convo = {
      ...convo,
      title: convo.messages.length ? convo.title : clean.slice(0, 40),
      messages: [...convo.messages, userMsg],
    };
    setConvos((cs) => [withUser, ...cs.filter((c) => c.id !== withUser.id)]);
    setActiveId(withUser.id);
    setInput("");
    setFailed(null);
    runAssistant(withUser, clean, forcedIntent);
  }

  function retry() {
    if (!failed) return;
    const convo = convos.find((c) => c.id === failed.convoId);
    if (!convo) {
      setFailed(null);
      return;
    }
    runAssistant(convo, failed.text, failed.forcedIntent);
  }

  function startNew() {
    setActiveId(null);
    setInput("");
    setFailed(null);
    setHistoryOpen(false);
  }

  function deleteConversation(id: string) {
    setConvos((cs) => cs.filter((c) => c.id !== id));
    if (activeId === id) setActiveId(null);
    if (failed?.convoId === id) setFailed(null);
  }

  function doSpeak(m: Msg) {
    const ok = speak(m.text, m.data?.reply_language ?? "hi", () => setSpeaking(null));
    if (ok) setSpeaking({ id: m.id, paused: false });
  }

  const recogLang: "hi-IN" | "en-IN" =
    reply === "en" || (reply === "auto" && lang === "en") ? "en-IN" : "hi-IN";

  function historyList(onPick: () => void) {
    return (
      <ul className="mt-3 flex-1 space-y-1 overflow-y-auto">
        {convos.map((c) => (
          <li key={c.id} className="group flex items-center gap-1">
            <button
              onClick={() => {
                setActiveId(c.id);
                setFailed(null);
                onPick();
              }}
              className={`min-w-0 flex-1 truncate rounded-lg px-3 py-2 text-left text-sm ${
                c.id === activeId ? "bg-navy-soft font-semibold text-primary" : "hover:bg-muted"
              }`}
            >
              {c.title}
            </button>
            <button
              aria-label={t("बातचीत हटाएं", "Delete conversation")}
              onClick={() => deleteConversation(c.id)}
              className="p-1 text-muted-foreground opacity-0 transition group-hover:opacity-100 focus:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
        {!convos.length && (
          <li className="px-3 text-xs text-muted-foreground">
            {t("बातचीत इसी डिवाइस पर सहेजी जाती है।", "Chats are saved on this device only.")}
          </li>
        )}
      </ul>
    );
  }

  return (
    <div className="mx-auto grid h-[calc(100dvh-6rem)] max-w-7xl md:grid-cols-[270px_1fr]">
      <aside
        className="hidden min-h-0 flex-col border-r p-3 md:flex"
        aria-label={t("बातचीत इतिहास", "Conversation history")}
      >
        <Button variant="outline" onClick={startNew}>
          <Plus className="h-4 w-4" /> {t("नई बातचीत", "New chat")}
        </Button>
        {historyList(() => {})}
        <p className="mt-3 rounded-lg bg-muted p-2 text-[11px] text-muted-foreground">
          {t(
            "यह नियम-आधारित डेमो है। लाइव AI या सरकारी सिस्टम से कोई कनेक्शन नहीं।",
            "This is a rule-based demo. There is no live AI or government-system connection.",
          )}
        </p>
      </aside>

      <section className="flex min-h-0 flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2 sm:px-4">
          <Sheet open={historyOpen} onOpenChange={setHistoryOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                aria-label={t("बातचीत इतिहास", "Chat history")}
              >
                <History className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex w-80 flex-col">
              <SheetTitle>{t("बातचीत इतिहास", "Conversation history")}</SheetTitle>
              <Button variant="outline" className="mt-3" onClick={startNew}>
                <Plus className="h-4 w-4" /> {t("नई बातचीत", "New chat")}
              </Button>
              {historyList(() => setHistoryOpen(false))}
            </SheetContent>
          </Sheet>

          <div className="flex items-center gap-2">
            <h1 className="font-bold text-primary">{t("SevaSetu सहायक", "SevaSetu Assistant")}</h1>
            <DemoBadge />
          </div>
          <span className="hidden text-xs text-muted-foreground lg:inline">
            {t("नियम-आधारित डेमो, लाइव AI नहीं", "Rule-based demo, not live AI")}
          </span>

          <label className="ml-auto flex items-center gap-1 text-sm">
            {t("जवाब की भाषा", "Reply in")}
            <select
              value={reply}
              onChange={(e) => setReply(e.target.value as "auto" | ReplyLang)}
              className="rounded-md border bg-card px-2 py-1"
            >
              <option value="auto">{t("स्वतः", "Auto")}</option>
              <option value="hi">हिन्दी</option>
              <option value="en">English</option>
            </select>
          </label>
          {active && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => deleteConversation(active.id)}
              aria-label={t("यह बातचीत हटाएं", "Delete this conversation")}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
          {active && (
            <Button
              size="sm"
              variant="ghost"
              onClick={startNew}
              aria-label={t("नई बातचीत", "New chat")}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div ref={listRef} className="flex-1 space-y-4 overflow-y-auto px-4 py-6" aria-live="polite">
          {!active && (
            <div className="mx-auto max-w-xl text-center">
              <p className="text-2xl font-bold text-primary">
                {t(
                  "नमस्ते! आपको किस सेवा की जानकारी चाहिए?",
                  "Hello! Which service do you need help with?",
                )}
              </p>
              <p className="mt-2 text-muted-foreground">
                {t(
                  "बोलें या लिखें — हिंदी, हिंग्लिश या अंग्रेज़ी में। सटीक नाम याद होना जरूरी नहीं।",
                  "Speak or type — in Hindi, Hinglish or English. You don't need the exact name.",
                )}
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-secondary"
                  >
                    {s}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-xs text-muted-foreground">
                {t(
                  "🔒 आधार नंबर, OTP, पासवर्ड या बैंक विवरण कभी साझा न करें।",
                  "🔒 Never share Aadhaar numbers, OTPs, passwords or bank details.",
                )}
              </p>
            </div>
          )}

          {active?.messages.map((m, idx) =>
            m.role === "user" ? (
              <div
                key={m.id}
                className="ml-auto max-w-[85%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-lg text-primary-foreground"
              >
                {m.text}
                <div className="mt-1 text-right text-[10px] opacity-70">
                  {new Date(m.at).toLocaleTimeString()}
                </div>
              </div>
            ) : (
              <div key={m.id} className="max-w-[92%]">
                <p className="whitespace-pre-line text-lg">{m.text}</p>
                {m.data && (
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    {t("पहचानी भाषा", "Detected")}:{" "}
                    {LANG_LABEL[m.data.detected_language]?.[lang] ?? m.data.detected_language} ·{" "}
                    {t("विश्वास", "confidence")}: {Math.round(m.data.confidence * 100)}% ·{" "}
                    {new Date(m.at).toLocaleTimeString()} · {t("डेमो उत्तर", "simulated response")}
                  </p>
                )}

                {!!m.data?.recommended_services.length && (
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {m.data.recommended_services.map((id) => {
                      const s = getService(id);
                      if (!s) return null;
                      return (
                        <div key={id} className="rounded-xl border bg-card p-3 shadow-card">
                          <div className="flex items-start gap-2">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-soft text-primary">
                              <ServiceIcon name={s.icon} className="h-4 w-4" />
                            </span>
                            <div className="min-w-0">
                              <p className="font-semibold">{s.name[lang]}</p>
                              <p className="text-[11px] text-accent-foreground">
                                {t("नमूना जानकारी", "Sample data")}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs font-semibold">
                            <Link
                              to="/services/$id"
                              params={{ id }}
                              className="text-secondary underline"
                            >
                              {t("विवरण", "Overview")}
                            </Link>
                            <Link
                              to="/services/$id"
                              params={{ id }}
                              hash="eligibility"
                              className="text-secondary underline"
                            >
                              {t("पात्रता", "Eligibility")}
                            </Link>
                            <Link
                              to="/services/$id"
                              params={{ id }}
                              hash="documents"
                              className="text-secondary underline"
                            >
                              {t("दस्तावेज", "Documents")}
                            </Link>
                            <Link
                              to="/services/$id"
                              params={{ id }}
                              hash="guide"
                              className="text-secondary underline"
                            >
                              {t("आवेदन गाइड", "Guide")}
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {idx === active.messages.length - 1 && !!m.data?.follow_up_questions.length && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {m.data.follow_up_questions.map((f) => (
                      <button
                        key={f.intent + f.label}
                        onClick={() => send(f.label, f.intent)}
                        className="rounded-full border border-secondary/60 bg-card px-3 py-1.5 text-sm text-secondary hover:bg-secondary hover:text-secondary-foreground"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}

                {synthesis && (
                  <div className="mt-2 flex gap-1">
                    {speaking?.id !== m.id ? (
                      <Button size="sm" variant="ghost" onClick={() => doSpeak(m)}>
                        <Volume2 className="h-4 w-4" /> {t("सुनें", "Listen")}
                      </Button>
                    ) : (
                      <>
                        {speaking.paused ? (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              resumeSpeech();
                              setSpeaking({ ...speaking, paused: false });
                            }}
                          >
                            <Play className="h-4 w-4" /> {t("जारी", "Resume")}
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              pauseSpeech();
                              setSpeaking({ ...speaking, paused: true });
                            }}
                          >
                            <Pause className="h-4 w-4" /> {t("रोकें", "Pause")}
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            stopSpeech();
                            setSpeaking(null);
                          }}
                        >
                          <Square className="h-4 w-4" /> {t("बंद", "Stop")}
                        </Button>
                      </>
                    )}
                  </div>
                )}
              </div>
            ),
          )}

          {failed && (
            <div
              role="alert"
              className="max-w-[92%] rounded-xl border border-destructive/40 bg-destructive/5 p-3"
            >
              <p className="flex items-center gap-2 font-semibold text-destructive">
                <AlertCircle className="h-4 w-4" />
                {t("जवाब तैयार नहीं हो सका।", "The response could not be prepared.")}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(
                  "यह डेमो अभी आपका सवाल संसाधित नहीं कर सका। फिर कोशिश करें या सेवा निर्देशिका देखें।",
                  "This demo could not process your question. Try again or browse the service directory.",
                )}
              </p>
              <div className="mt-2 flex gap-2">
                <Button size="sm" onClick={retry}>
                  <RotateCcw className="h-4 w-4" /> {t("फिर कोशिश करें", "Try again")}
                </Button>
                <Button size="sm" variant="outline" asChild>
                  <Link to="/services">{t("सेवाएं देखें", "Browse services")}</Link>
                </Button>
              </div>
            </div>
          )}

          {typing && (
            <p className="text-muted-foreground" role="status">
              {t("सहायक सोच रहा है…", "Assistant is thinking…")}
            </p>
          )}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            send(input);
          }}
          className="border-t p-3"
        >
          {!v.supported && (
            <p className="mb-2 text-sm text-muted-foreground">
              {t(
                "आपका ब्राउज़र आवाज़ पहचान का समर्थन नहीं करता (Chrome/Edge आज़माएं)। आप टाइप कर सकते हैं।",
                "Your browser doesn't support speech recognition (try Chrome/Edge). You can type instead.",
              )}
            </p>
          )}
          {v.error && voiceErrorText(v.error, t) && (
            <p className="mb-2 text-sm text-destructive" role="alert">
              {voiceErrorText(v.error, t)}
            </p>
          )}
          {v.listening && (
            <p className="mb-2 text-sm font-semibold text-destructive" role="status">
              {t("सुन रहा हूँ… बोलिए", "Listening… speak now")}
            </p>
          )}
          {synthesis &&
            voiceLangs.length > 0 &&
            !voiceLangs.some((l) => l.startsWith("hi")) &&
            !voiceLangs.some((l) => l.startsWith("en")) && (
              <p className="mb-2 text-[11px] text-muted-foreground">
                {t(
                  "इस डिवाइस पर उपयुक्त आवाज़ नहीं मिली — जवाब लिखित रूप में उपलब्ध हैं।",
                  "No suitable device voice was found — answers remain available as text.",
                )}
              </p>
            )}
          <div className="flex items-end gap-2">
            <Button
              type="button"
              size="icon"
              variant={v.listening ? "destructive" : "secondary"}
              className={`h-12 w-12 shrink-0 rounded-full ${v.listening ? "recording" : ""}`}
              disabled={!v.supported}
              onClick={() => v.toggle(recogLang)}
              aria-label={v.listening ? t("सुनना बंद करें", "Stop listening") : t("बोलकर पूछें", "Speak")}
            >
              {v.listening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
            </Button>
            <label htmlFor="chat-in" className="sr-only">
              {t("संदेश", "Message")}
            </label>
            <textarea
              id="chat-in"
              rows={1}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  send(input);
                }
              }}
              placeholder="आपको किस सरकारी सेवा की जानकारी चाहिए?"
              className="min-h-12 flex-1 resize-none rounded-2xl border bg-card px-4 py-3 text-lg outline-none"
            />
            <Button
              type="submit"
              size="icon"
              className="h-12 w-12 shrink-0 rounded-full"
              disabled={!input.trim() || typing}
              aria-label={t("भेजें", "Send")}
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {v.listening
              ? t(
                  "पहचाना गया वाक्य भेजने से पहले संपादित कर सकते हैं।",
                  "You can edit the recognised sentence before sending.",
                )
              : t(
                  "आधार नंबर, OTP या पासवर्ड कभी साझा न करें।",
                  "Never share Aadhaar numbers, OTPs or passwords.",
                )}
          </p>
        </form>
      </section>
    </div>
  );
}
