import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  Baby,
  BadgeCheck,
  Briefcase,
  CheckCircle2,
  FileCheck2,
  FileText,
  GraduationCap,
  HeartHandshake,
  Languages,
  ListChecks,
  MessageCircle,
  MessageSquareText,
  Mic,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Sprout,
  Stethoscope,
  Volume2,
  Wheat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES, type Category } from "@/data/services";
import { usePrefs } from "@/lib/prefs";
import { ServiceCard } from "@/components/seva/ServiceCard";
import { DemoBadge } from "@/components/seva/DemoBadge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SevaSetu Uttarakhand — सरकारी सेवाएं, अब आपकी भाषा में" },
      {
        name: "description",
        content:
          "Ask in Hindi, Hinglish or English by voice or text to find government services, documents and preliminary eligibility (prototype).",
      },
      { property: "og:title", content: "SevaSetu Uttarakhand" },
      {
        property: "og:description",
        content: "Hindi-first, voice-first citizen service navigator prototype.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const EXAMPLES = [
  "मुझे आय प्रमाण पत्र बनवाना है।",
  "किसानों के लिए सरकारी योजनाएं बताइए।",
  "जाति प्रमाण पत्र कैसे बनता है?",
  "छात्रवृत्ति के लिए कैसे आवेदन करें?",
  "मेरे परिवार को सरकारी सहायता चाहिए।",
];

const GROUPS: {
  icon: typeof Sprout;
  category: Category;
  hi: string;
  en: string;
  dhi: string;
  den: string;
}[] = [
  {
    icon: Sprout,
    category: "agriculture",
    hi: "किसान",
    en: "Farmers",
    dhi: "खेती सहायता, भूमि और किसान योजनाएं।",
    den: "Farming support, land and farmer schemes.",
  },
  {
    icon: GraduationCap,
    category: "education",
    hi: "विद्यार्थी",
    en: "Students",
    dhi: "छात्रवृत्ति, प्रमाण पत्र और शिक्षा सहायता।",
    den: "Scholarships, certificates and education support.",
  },
  {
    icon: Baby,
    category: "women",
    hi: "महिलाएं और परिवार",
    en: "Women & families",
    dhi: "मातृत्व सहायता और परिवार कल्याण।",
    den: "Maternity support and family welfare.",
  },
  {
    icon: HeartHandshake,
    category: "welfare",
    hi: "वरिष्ठ नागरिक",
    en: "Senior citizens",
    dhi: "पेंशन और सामाजिक सुरक्षा।",
    den: "Pensions and social security.",
  },
  {
    icon: Briefcase,
    category: "employment",
    hi: "नौकरी खोजने वाले",
    en: "Job seekers",
    dhi: "रोज़गार पंजीकरण और अवसर।",
    den: "Employment registration and opportunities.",
  },
  {
    icon: Wheat,
    category: "assistance",
    hi: "खाद्य सहायता",
    en: "Food support",
    dhi: "राशन कार्ड और खाद्य सुरक्षा।",
    den: "Ration cards and food security.",
  },
  {
    icon: Stethoscope,
    category: "healthcare",
    hi: "स्वास्थ्य सहायता",
    en: "Health support",
    dhi: "स्वास्थ्य बीमा और इलाज सहायता।",
    den: "Health cover and treatment support.",
  },
  {
    icon: FileText,
    category: "certificates",
    hi: "प्रमाण पत्र",
    en: "Certificates",
    dhi: "आय, जाति, निवास और जन्म प्रमाण।",
    den: "Income, caste, domicile and birth proof.",
  },
];

function Index() {
  const { t, lang } = usePrefs();
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const go = (text: string, voice = false) => {
    const search: { q?: string; voice?: boolean } = {};
    if (text.trim()) search.q = text;
    if (voice) search.voice = true;
    nav({ to: "/assistant", search });
  };

  const features = [
    {
      icon: Languages,
      hi: "हिंदी-प्रथम",
      en: "Hindi-first",
      dhi: "हिंदी, हिंग्लिश या अंग्रेज़ी में पूछें।",
      den: "Ask in Hindi, Hinglish or English.",
    },
    {
      icon: Mic,
      hi: "आवाज़ से उपयोग",
      en: "Voice-first",
      dhi: "बोलकर पूछें, जवाब सुनें (जहाँ ब्राउज़र समर्थन करे)।",
      den: "Speak and listen (where the browser supports it).",
    },
    {
      icon: MessageSquareText,
      hi: "संदर्भ समझने वाली मदद",
      en: "Context-aware help",
      dhi: "अधूरे सवाल पर सहायक प्रश्न पूछता है।",
      den: "Asks follow-ups for incomplete requests.",
    },
    {
      icon: ListChecks,
      hi: "दस्तावेज तैयारी",
      en: "Document readiness",
      dhi: "आवेदन से पहले जानें क्या चाहिए।",
      den: "Know what you need before applying.",
    },
    {
      icon: ShieldCheck,
      hi: "ईमानदार जानकारी",
      en: "Honest information",
      dhi: "नमूना और सत्यापित जानकारी अलग दिखती है।",
      den: "Sample vs verified data is always labelled.",
    },
    {
      icon: BadgeCheck,
      hi: "सुगम्य डिज़ाइन",
      en: "Accessible by design",
      dhi: "बड़ा टेक्स्ट, हाई कॉन्ट्रास्ट और कीबोर्ड सहायता।",
      den: "Large text, high contrast and keyboard support.",
    },
  ];

  const how = [
    {
      icon: MessageCircle,
      hi: "अपनी जरूरत बताएं",
      en: "Describe your need",
      dhi: "बोलें या लिखें — सरकारी शब्दों की जरूरत नहीं।",
      den: "Speak or type — no need to know official terms.",
    },
    {
      icon: Sparkles,
      hi: "सहायक समझता है",
      en: "The assistant understands",
      dhi: "भाषा, इरादा और अधूरी जानकारी पहचानता है।",
      den: "Detects language, intent and missing details.",
    },
    {
      icon: FileCheck2,
      hi: "सही सेवा और दस्तावेज",
      en: "Right service & documents",
      dhi: "पात्रता, दस्तावेज और आवेदन कदम देखें।",
      den: "See eligibility, documents and application steps.",
    },
    {
      icon: CheckCircle2,
      hi: "आधिकारिक रूप से आवेदन",
      en: "Apply officially",
      dhi: "CSC, तहसील या आधिकारिक पोर्टल से आवेदन करें।",
      den: "Apply via CSC, tehsil or the official portal.",
    },
  ];

  return (
    <div>
      <section className="hills-bg overflow-hidden">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.15fr_1fr] lg:py-20">
          <div>
            <DemoBadge />
            <h1
              className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl"
              lang="hi"
            >
              सरकारी सेवाएं, अब आपकी भाषा में।
            </h1>
            <p className="mt-2 text-xl font-semibold text-secondary">
              Government Services, Without the Confusion.
            </p>
            <p className="mt-4 max-w-xl text-muted-foreground">
              {t(
                "सरकारी योजनाओं और सेवाओं की जानकारी अब आसान हिंदी में। अपनी जरूरत बताएं और सही सेवा, पात्रता और जरूरी दस्तावेजों की जानकारी पाएं।",
                "Information on government schemes and services in simple language. Describe your need and find the right service, eligibility and required documents.",
              )}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                go(q);
              }}
              className="mt-6 flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-card"
            >
              <Button
                type="button"
                size="icon"
                variant="secondary"
                className="h-12 w-12 shrink-0 rounded-xl"
                aria-label={t("बोलकर पूछें", "Ask by voice")}
                onClick={() => go("", true)}
              >
                <Mic className="h-5 w-5" />
              </Button>
              <label htmlFor="hero-q" className="sr-only">
                {t("आपका सवाल", "Your question")}
              </label>
              <input
                id="hero-q"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="आपको किस सरकारी सेवा की जानकारी चाहिए?"
                className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base outline-none"
              />
              <Button
                type="submit"
                size="icon"
                className="h-12 w-12 shrink-0 rounded-xl"
                aria-label={t("भेजें", "Send")}
              >
                <Send className="h-5 w-5" />
              </Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">
              {t("🎤 माइक दबाएं और हिंदी में बोलें।", "🎤 Tap the mic and speak in Hindi.")}
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <button
                  key={e}
                  onClick={() => go(e)}
                  className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-secondary"
                >
                  {e}
                </button>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link to="/assistant" search={{}}>
                  {t("AI से पूछें", "Ask AI")}
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/services">{t("सेवाएं देखें", "Browse services")}</Link>
              </Button>
            </div>

            <dl className="mt-8 flex flex-wrap gap-x-8 gap-y-3 text-sm">
              <div>
                <dt className="text-muted-foreground">{t("इनपुट भाषाएं", "Input languages")}</dt>
                <dd className="font-bold text-primary">हिन्दी · Hinglish · English</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("कवरेज", "Coverage")}</dt>
                <dd className="font-bold text-primary">
                  {t("उत्तराखंड के 13 जिले", "All 13 Uttarakhand districts")}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">{t("लॉगिन", "Login")}</dt>
                <dd className="font-bold text-primary">{t("जरूरी नहीं", "Not required")}</dd>
              </div>
            </dl>
          </div>

          <div
            className="hidden rounded-3xl border bg-card p-5 shadow-card lg:block"
            aria-hidden="true"
          >
            <div className="mb-4 flex items-center justify-between">
              <span className="font-bold text-primary">SevaSetu सहायक</span>
              <DemoBadge />
            </div>
            <div className="space-y-3 text-sm">
              <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
                मुझे एक सर्टिफिकेट चाहिए।
              </div>
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2">
                बिल्कुल! आपको यह सर्टिफिकेट किस काम के लिए चाहिए?
              </div>
              <div className="flex flex-wrap gap-1.5">
                {["आय प्रमाण पत्र", "जाति प्रमाण पत्र", "निवास प्रमाण पत्र"].map((x) => (
                  <span
                    key={x}
                    className="rounded-full border border-secondary/50 px-2.5 py-1 text-xs text-secondary"
                  >
                    {x}
                  </span>
                ))}
              </div>
              <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">
                मेरे पिताजी किसान हैं।
              </div>
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2">
                समझ गया — ये सेवाएं उपयोगी हो सकती हैं…
              </div>
              <div className="rounded-xl border bg-background p-3">
                <p className="font-semibold text-primary">आय प्रमाण पत्र</p>
                <p className="mt-0.5 text-xs text-muted-foreground">राजस्व विभाग · नमूना जानकारी</p>
                <p className="mt-2 text-xs font-semibold text-secondary">
                  विवरण, पात्रता और दस्तावेज →
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-xl bg-navy-soft px-3 py-2 text-[11px] text-muted-foreground">
              भाषा: हिन्दी · इरादा: प्रमाण पत्र · स्रोत: नमूना कैटलॉग
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
              {t("लोकप्रिय सेवाएं", "Popular services")}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
              {t("सबसे ज़्यादा खोजी जाने वाली सेवाएं", "Most searched services")}
            </h2>
          </div>
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
          >
            {t("सभी सेवाएं देखें", "See all services")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.filter((s) => s.popular).map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      </section>

      <section className="border-y bg-card py-14">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {t("कैसे काम करता है", "How it works")}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
            {t("चार सरल कदमों में सही सेवा तक", "From your words to the right service, in four steps")}
          </h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-4">
            {how.map((h, i) => (
              <li key={h.en} className="rounded-2xl border bg-background p-5">
                <div className="flex items-center justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-soft text-primary">
                    <h.icon className="h-5 w-5" />
                  </span>
                  <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                </div>
                <h3 className="mt-4 font-bold text-primary">{lang === "hi" ? h.hi : h.en}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "hi" ? h.dhi : h.den}
                </p>
              </li>
            ))}
          </ol>
          <div className="mt-6">
            <Button asChild variant="outline">
              <Link to="/how-it-works">
                {t("पूरी प्रक्रिया समझें", "See the full process")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {t("AI-संचालित सहायता", "AI-powered assistance")}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
            {t("सवाल अधूरा हो, तो भी सहायक समझता है", "Incomplete questions are still understood")}
          </h2>
          <p className="mt-3 text-muted-foreground">
            {t(
              "आपको सरकारी सेवा का सटीक नाम याद रखने की जरूरत नहीं। सहायक भाषा, इरादा और जरूरत पहचानकर सरल प्रश्न पूछता है, फिर नमूना सेवा कैटलॉग से प्रासंगिक विकल्प दिखाता है।",
              "You don't need to remember the exact name of a government service. The assistant detects language and intent, asks simple follow-ups, then shows relevant options from the sample catalogue.",
            )}
          </p>
          <ul className="mt-5 space-y-3 text-sm">
            {[
              [
                t(
                  "हिंदी, हिंग्लिश और अंग्रेज़ी एक साथ",
                  "Hindi, Hinglish and English in one conversation",
                ),
              ],
              [
                t(
                  "संदर्भ बना रहता है — बातचीत बीच में नहीं टूटती",
                  "Context is kept across follow-up questions",
                ),
              ],
              [
                t(
                  "सुझाव केवल कैटलॉग से — कोई योजना गढ़ी नहीं जाती",
                  "Suggestions come only from the catalogue — no invented schemes",
                ),
              ],
              [
                t(
                  "संरचित उत्तर: भाषा, इरादा, सेवाएं, स्रोत और अगले कदम",
                  "Structured responses: language, intent, services, sources and next actions",
                ),
              ],
            ].map(([x]) => (
              <li key={x} className="flex gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-secondary" />
                <span>{x}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-2">
            {[
              "मुझे एक सर्टिफिकेट चाहिए।",
              "Mujhe income certificate banana hai",
              "मेरे बच्चे की पढ़ाई के लिए योजना?",
            ].map((x) => (
              <button
                key={x}
                onClick={() => go(x)}
                className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-secondary"
              >
                {x}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border bg-card p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-primary">
              {t("संरचित उत्तर का उदाहरण", "Example structured response")}
            </span>
            <DemoBadge />
          </div>
          <dl className="mt-4 grid grid-cols-2 gap-2 text-xs">
            {[
              ["detected_language", "hi"],
              ["intent", "clarify_certificate"],
              ["clarification_required", "true"],
              ["confidence", "0.60"],
            ].map(([k, v]) => (
              <div key={k} className="rounded-lg bg-muted px-2.5 py-2">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-mono font-semibold text-primary">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-3 rounded-xl border p-3 text-sm">
            <p className="font-semibold text-primary">{t("response_text", "response_text")}</p>
            <p className="mt-1 text-muted-foreground">
              बिल्कुल! आपको यह सर्टिफिकेट किस काम के लिए चाहिए?
            </p>
          </div>
          <div className="mt-3">
            <p className="text-xs font-semibold text-muted-foreground">follow_up_questions</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {["आय प्रमाण पत्र", "जाति प्रमाण पत्र", "निवास प्रमाण पत्र", "मुझे नहीं पता"].map((x) => (
                <span
                  key={x}
                  className="rounded-full border border-secondary/50 px-2.5 py-1 text-xs text-secondary"
                >
                  {x}
                </span>
              ))}
            </div>
          </div>
          <p className="mt-4 text-[11px] text-muted-foreground">
            {t(
              "यह उदाहरण नियम-आधारित डेमो का है, लाइव AI का नहीं।",
              "This example comes from the rule-based demo, not live AI.",
            )}
          </p>
        </div>
      </section>

      <section className="bg-primary py-14 text-primary-foreground">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 lg:grid-cols-[1fr_auto]">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-saffron">
              {t("आवाज़ से उपयोग", "Voice-first access")}
            </p>
            <h2 className="mt-2 text-2xl font-extrabold sm:text-3xl">
              {t("बोलिए — टाइप करना जरूरी नहीं", "Just speak — typing is optional")}
            </h2>
            <p className="mt-3 max-w-2xl opacity-85">
              {t(
                "माइक दबाएं, हिंदी में अपनी जरूरत बोलें, और पहचाने गए वाक्य को भेजने से पहले संपादित करें। जवाब को हिंदी या अंग्रेज़ी आवाज़ में सुनें।",
                "Tap the mic, speak your need in Hindi, and edit the recognised sentence before sending. Listen to answers in a Hindi or English voice.",
              )}
            </p>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                [
                  t("1. माइक दबाएं", "1. Tap the mic"),
                  t("ब्राउज़र अनुमति मांगेगा।", "Your browser asks for permission."),
                ],
                [
                  t("2. अपनी भाषा में बोलें", "2. Speak in your language"),
                  t("हिंदी, हिंग्लिश या अंग्रेज़ी।", "Hindi, Hinglish or English."),
                ],
                [
                  t("3. जवाब सुनें", "3. Hear the answer"),
                  t("रोकें, जारी रखें या बंद करें।", "Pause, resume or stop."),
                ],
              ].map(([a, b]) => (
                <div
                  key={a}
                  className="rounded-xl border border-primary-foreground/20 bg-primary-foreground/5 p-4"
                >
                  <p className="font-semibold">{a}</p>
                  <p className="mt-1 text-sm opacity-75">{b}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs opacity-65">
              {t(
                "Web Speech API समर्थित ब्राउज़र (जैसे Chrome/Edge) में उपलब्ध। अन्य ब्राउज़र में टाइप करके उपयोग करें।",
                "Available in Web Speech API browsers such as Chrome/Edge. Elsewhere, use the text input.",
              )}
            </p>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Link
              to="/assistant"
              search={{ voice: true }}
              aria-label={t("आवाज़ सहायक आज़माएं", "Try the voice assistant")}
              className="flex h-32 w-32 items-center justify-center rounded-full bg-secondary text-secondary-foreground shadow-card transition hover:scale-105"
            >
              <Mic className="h-14 w-14" />
            </Link>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold">
              <Volume2 className="h-4 w-4" /> {t("आवाज़ सहायक आज़माएं", "Try the voice assistant")}
            </span>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          {t("हर नागरिक के लिए", "For every citizen")}
        </p>
        <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
          {t("अपने समूह के लिए सेवाएं खोजें", "Find services for your situation")}
        </h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {GROUPS.map((g) => (
            <Link
              key={g.en}
              to="/services"
              search={{ category: g.category }}
              className="group rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-secondary/50"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-soft text-primary">
                <g.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-bold text-primary">{lang === "hi" ? g.hi : g.en}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{lang === "hi" ? g.dhi : g.den}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary">
                {t("देखें", "Explore")}{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-card py-14">
        <div className="mx-auto max-w-7xl px-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
            {t("क्यों सेवासेतु", "Why SevaSetu")}
          </p>
          <h2 className="mt-2 text-2xl font-extrabold text-primary sm:text-3xl">
            {t("भरोसेमंद, सुगम्य और ईमानदार सहायता", "Trustworthy, accessible and honest help")}
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.en} className="rounded-2xl border p-5">
                <f.icon className="h-6 w-6 text-secondary" />
                <h3 className="mt-3 font-bold">{lang === "hi" ? f.hi : f.en}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {lang === "hi" ? f.dhi : f.den}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14">
        <div className="hills-bg rounded-3xl border bg-card p-8 text-center shadow-card sm:p-12">
          <h2 className="text-2xl font-extrabold text-primary sm:text-3xl">
            {t("अपनी जरूरत अपने शब्दों में बताइए", "Tell us what you need, in your own words")}
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            {t(
              "सरकारी विभाग, योजना या फॉर्म का नाम याद नहीं? कोई बात नहीं। सेवासेतु आपकी बात समझकर रास्ता दिखाएगा।",
              "Don't remember the department, scheme or form name? That's fine. SevaSetu will understand your need and show the way.",
            )}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link to="/assistant" search={{}}>
                <MessageCircle className="h-5 w-5" />{" "}
                {t("AI सहायक से बात करें", "Talk to the assistant")}
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/services">
                <Search className="h-5 w-5" /> {t("सेवाएं खोजें", "Search services")}
              </Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            {t(
              "यह PRAYAS 2026 हैकाथॉन के लिए एक प्रोटोटाइप है, आधिकारिक सरकारी वेबसाइट नहीं।",
              "This is a prototype for the PRAYAS 2026 hackathon, not an official government website.",
            )}
          </p>
        </div>
      </section>
    </div>
  );
}
