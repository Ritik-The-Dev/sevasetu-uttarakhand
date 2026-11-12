import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Database,
  FileCheck2,
  Languages,
  ListChecks,
  MessageCircle,
  Search,
  ShieldAlert,
  Sparkles,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/lib/prefs";
import { DemoBadge } from "@/components/seva/DemoBadge";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({
    meta: [
      { title: "How it works — SevaSetu Uttarakhand" },
      {
        name: "description",
        content:
          "From a spoken question to the right service: language detection, clarification, catalogue retrieval, eligibility rules and guidance.",
      },
      { property: "og:title", content: "How SevaSetu works" },
      { property: "og:description", content: "The citizen journey, step by step." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: HowItWorks,
});

function HowItWorks() {
  const { t, lang } = usePrefs();

  const journey = [
    {
      icon: MessageCircle,
      hi: "अपनी जरूरत बताएं",
      en: "Describe your need",
      dhi: "बोलकर या लिखकर, अपनी भाषा में। सरकारी शब्दों की जरूरत नहीं।",
      den: "By voice or text, in your language. No official terms needed.",
    },
    {
      icon: Languages,
      hi: "भाषा और इरादा पहचान",
      en: "Language & intent",
      dhi: "सहायक हिंदी, हिंग्लिश और अंग्रेज़ी पहचानता है और जरूरत समझता है।",
      den: "The assistant detects Hindi, Hinglish and English and understands the need.",
    },
    {
      icon: Sparkles,
      hi: "स्पष्टीकरण प्रश्न",
      en: "Clarifying questions",
      dhi: "अधूरे सवाल पर सरल विकल्पों के साथ प्रश्न पूछता है।",
      den: "For incomplete requests, it asks simple questions with options.",
    },
    {
      icon: Search,
      hi: "सेवा खोज",
      en: "Service retrieval",
      dhi: "केवल नमूना कैटलॉग से सेवाएं सुझाता है — कोई योजना नहीं गढ़ता।",
      den: "Suggests services only from the sample catalogue — never invents schemes.",
    },
    {
      icon: ListChecks,
      hi: "पात्रता नियम",
      en: "Eligibility rules",
      dhi: "निश्चित नियम प्रारंभिक पात्रता बताते हैं, AI नहीं।",
      den: "Fixed rules give preliminary eligibility — not the AI.",
    },
    {
      icon: FileCheck2,
      hi: "दस्तावेज और गाइड",
      en: "Documents & guide",
      dhi: "सूची तैयार करें और चरण-दर-चरण आवेदन मार्गदर्शन पाएं।",
      den: "Prepare the checklist and follow the step-by-step application guide.",
    },
    {
      icon: CheckCircle2,
      hi: "आधिकारिक आवेदन",
      en: "Apply officially",
      dhi: "CSC, तहसील या आधिकारिक पोर्टल से आवेदन करें।",
      den: "Apply via a CSC, tehsil office or the official portal.",
    },
  ];

  const pipeline = [
    [
      t("भाषा पहचान", "Language detection"),
      t("देवनागरी, हिंग्लिश संकेत और अंग्रेज़ी शब्द।", "Devanagari, Hinglish cues and English words."),
    ],
    [
      t("इरादा और संदर्भ", "Intent & context"),
      t("पिछली बातचीत का विषय याद रखा जाता है।", "The topic from earlier turns is retained."),
    ],
    [
      t("कैटलॉग पुनर्प्राप्ति", "Catalogue retrieval"),
      t("कीवर्ड और संरचित खोज से सेवा रिकॉर्ड।", "Service records via keyword and structured search."),
    ],
    [
      t("नियम-आधारित पात्रता", "Rule-based eligibility"),
      t("सेवा-विशिष्ट प्रश्न और निश्चित शर्तें।", "Service-specific questions and fixed conditions."),
    ],
    [
      t("संरचित उत्तर", "Structured response"),
      t(
        "भाषा, इरादा, सेवाएं, स्रोत और अगले कदम।",
        "Language, intent, services, sources and next actions.",
      ),
    ],
  ];

  const never = [
    t(
      "कोई सरकारी सेवा, योजना, शुल्क या पात्रता नियम गढ़ना।",
      "Invent a government service, scheme, fee or eligibility rule.",
    ),
    t("नकली आधिकारिक लिंक बनाना।", "Create fake official links."),
    t("सरकारी डेटाबेस तक पहुँच होने का दावा करना।", "Claim access to government databases."),
    t("आवेदन जमा होने का दावा करना।", "Claim that an application was submitted."),
    t(
      "प्रारंभिक पात्रता को आधिकारिक स्वीकृति बताना।",
      "Present preliminary eligibility as official approval.",
    ),
    t(
      "आधार नंबर, OTP, पासवर्ड या बैंक विवरण मांगना।",
      "Ask for Aadhaar numbers, OTPs, passwords or bank details.",
    ),
  ];

  return (
    <div>
      <section className="hills-bg border-b">
        <div className="mx-auto max-w-5xl px-4 py-12">
          <DemoBadge />
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            {t("SevaSetu कैसे काम करता है", "How SevaSetu works")}
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {t(
              "सेवासेतु नागरिक की बात को सरल, संरचित और ईमानदार मार्गदर्शन में बदलता है। यह प्रोटोटाइप नियम-आधारित डेमो का उपयोग करता है, लाइव AI या सरकारी डेटाबेस से जुड़ा नहीं है।",
              "SevaSetu turns a citizen's words into simple, structured and honest guidance. This prototype uses a rule-based demo and is not connected to live AI or government databases.",
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/assistant" search={{}}>
                {t("सहायक आज़माएं", "Try the assistant")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/services">{t("सेवाएं देखें", "Browse services")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-10">
        <h2 className="text-2xl font-extrabold text-primary">
          {t("नागरिक यात्रा", "The citizen journey")}
        </h2>
        <ol className="mt-6 space-y-4">
          {journey.map((step, i) => (
            <li key={step.en} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">
                {i + 1}
              </span>
              <div>
                <h3 className="flex items-center gap-2 font-bold">
                  <step.icon className="h-4 w-4 text-secondary" />
                  {lang === "hi" ? step.hi : step.en}
                </h3>
                <p className="mt-1 text-muted-foreground">{lang === "hi" ? step.dhi : step.den}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-y bg-card py-10">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-primary">
            <Database className="h-6 w-6 text-secondary" />
            {t("अंदर क्या होता है", "Under the hood")}
          </h2>
          <p className="mt-2 max-w-3xl text-muted-foreground">
            {t(
              "योजना की गई पाइपलाइन स्पष्ट है — हर चरण का एक ही काम है। इस डेमो में नियम-आधारित इंजन उसी संरचना का अनुकरण करता है।",
              "The intended pipeline is explicit — each stage has one job. In this demo, a rule-based engine follows the same structure.",
            )}
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {pipeline.map(([a, b], i) => (
              <div key={a} className="rounded-xl border bg-background p-4">
                <span className="text-xs font-bold text-muted-foreground">0{i + 1}</span>
                <p className="mt-1 font-semibold text-primary">{a}</p>
                <p className="mt-1 text-xs text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
          <p className="mt-4 rounded-xl bg-accent p-3 text-sm text-accent-foreground">
            {t(
              "आगे लाइव बहुभाषी LLM और सत्यापित सरकारी डेटाबेस जोड़ा जा सकता है। इस डेमो में कोई लाइव AI कॉल नहीं होती।",
              "A live multilingual LLM and verified government database can be added later. This demo makes no live AI calls.",
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-5xl gap-6 px-4 py-10 md:grid-cols-2">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
            <Volume2 className="h-5 w-5 text-secondary" />{" "}
            {t("आवाज़ कैसे काम करती है", "How voice works")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              {t(
                "• माइक दबाने पर ब्राउज़र अनुमति मांगता है।",
                "• Tapping the mic asks the browser for permission.",
              )}
            </li>
            <li>
              {t(
                "• Web Speech API हिंदी (hi-IN) या अंग्रेज़ी (en-IN) पहचानता है।",
                "• The Web Speech API recognises Hindi (hi-IN) or English (en-IN).",
              )}
            </li>
            <li>
              {t(
                "• पहचाना गया वाक्य भेजने से पहले संपादित किया जा सकता है।",
                "• The recognised sentence can be edited before sending.",
              )}
            </li>
            <li>
              {t(
                "• SpeechSynthesis उपलब्ध आवाज़ में जवाब पढ़ता है — रोकें/जारी/बंद नियंत्रण के साथ।",
                "• SpeechSynthesis reads answers in an available voice, with pause/resume/stop.",
              )}
            </li>
            <li>
              {t(
                "• समर्थन न होने पर टेक्स्ट इनपुट हमेशा उपलब्ध रहता है।",
                "• If unsupported, text input always remains available.",
              )}
            </li>
          </ul>
        </div>
        <div className="rounded-2xl border border-destructive/30 bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
            <ShieldAlert className="h-5 w-5 text-destructive" />{" "}
            {t("सहायक कभी नहीं करेगा", "What the assistant never does")}
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {never.map((x) => (
              <li key={x} className="flex gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-destructive" />
                {x}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 pb-12">
        <div className="rounded-3xl bg-primary p-8 text-primary-foreground">
          <h2 className="text-2xl font-extrabold">
            {t("60-सेकंड डेमो यात्रा", "The 60-second demo journey")}
          </h2>
          <ol className="mt-4 grid gap-2 text-sm opacity-90 sm:grid-cols-2">
            {[
              t(
                "1. होम पर माइक दबाएं या “मुझे एक सर्टिफिकेट चाहिए” लिखें।",
                "1. Tap the mic or type “मुझे एक सर्टिफिकेट चाहिए”.",
              ),
              t(
                "2. सहायक पूछेगा कि सर्टिफिकेट किस काम के लिए चाहिए।",
                "2. The assistant asks what the certificate is for.",
              ),
              t("3. “मेरे पिताजी किसान हैं” चुनें या बोलें।", "3. Choose or say “my father is a farmer”."),
              t(
                "4. सुझाई गई सेवा खोलें और पात्रता जांचें।",
                "4. Open a suggested service and check eligibility.",
              ),
              t(
                "5. दस्तावेज सूची में उपलब्ध दस्तावेज चिह्नित करें।",
                "5. Mark available documents in the checklist.",
              ),
              t(
                "6. आवेदन गाइड के चरण पूरे करें और आधिकारिक माध्यम देखें।",
                "6. Complete guide steps and review official channels.",
              ),
            ].map((x) => (
              <li
                key={x}
                className="rounded-lg border border-primary-foreground/20 bg-primary-foreground/5 px-3 py-2"
              >
                {x}
              </li>
            ))}
          </ol>
          <Button asChild variant="secondary" className="mt-5">
            <Link to="/assistant" search={{ q: "मुझे एक सर्टिफिकेट चाहिए।" }}>
              {t("डेमो शुरू करें", "Start the demo")} <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
