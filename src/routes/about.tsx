import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Accessibility,
  ArrowRight,
  Database,
  Languages,
  Lock,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePrefs } from "@/lib/prefs";
import { DemoBadge } from "@/components/seva/DemoBadge";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About & disclaimer — SevaSetu Uttarakhand" },
      {
        name: "description",
        content:
          "About the SevaSetu prototype, its data sources, limitations and privacy approach.",
      },
      { property: "og:title", content: "About SevaSetu" },
      {
        property: "og:description",
        content: "Prototype for PRAYAS 2026 – ITDA Uttarakhand Hackathon.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: About,
});

function About() {
  const { t } = usePrefs();

  const honesty = [
    t(
      "यह PRAYAS 2026 – ITDA उत्तराखंड हैकाथॉन के लिए एक प्रोटोटाइप है, आधिकारिक सरकारी वेबसाइट नहीं।",
      "This is a prototype for PRAYAS 2026 – ITDA Uttarakhand Hackathon, not an official government website.",
    ),
    t(
      "सभी सेवा जानकारी नमूना है और सत्यापित नहीं है। शुल्क, समय और आधिकारिक लिंक तभी दिखाए जाएंगे जब सत्यापित हों।",
      "All service information is sample data and unverified. Fees, timelines and official links are only shown once verified.",
    ),
    t(
      "सहायक एक नियम-आधारित डेमो है — यह लाइव AI या किसी सरकारी डेटाबेस से जुड़ा नहीं है और कोई आवेदन जमा नहीं करता।",
      "The assistant is a rule-based demo — not connected to live AI or any government database, and it never submits applications.",
    ),
    t(
      "पात्रता परिणाम प्रारंभिक हैं; अंतिम निर्णय संबंधित विभाग का होता है।",
      "Eligibility results are preliminary; the department makes the final decision.",
    ),
    t(
      "आवाज़ सुविधा आपके ब्राउज़र की Web Speech तकनीक से चलती है, जहाँ उपलब्ध हो।",
      "Voice features use your browser's Web Speech technology, where available.",
    ),
    t(
      "SevaSetu अपुणि सरकार और CM हेल्पलाइन जैसे प्लेटफॉर्म का पूरक है, उनका विकल्प नहीं।",
      "SevaSetu complements platforms such as Apuni Sarkar and CM Helpline; it does not replace them.",
    ),
  ];

  const capabilities = [
    [
      t("हिंदी-प्रथम सहायक", "Hindi-first assistant"),
      t("हिंदी, हिंग्लिश और अंग्रेज़ी में बातचीत।", "Conversation in Hindi, Hinglish and English."),
    ],
    [
      t("आवाज़ इनपुट और आउटपुट", "Voice input & output"),
      t("ब्राउज़र समर्थन होने पर बोलें और सुनें।", "Speak and listen where the browser supports it."),
    ],
    [
      t("सेवा खोज", "Service discovery"),
      t("जरूरत, श्रेणी और विभाग से खोज।", "Search by need, category and department."),
    ],
    [
      t("पात्रता जांच", "Eligibility check"),
      t("सेवा-विशिष्ट प्रश्न और निश्चित नियम।", "Service-specific questions and fixed rules."),
    ],
    [
      t("दस्तावेज तैयारी", "Document readiness"),
      t("इंटरैक्टिव सूची, प्रगति और प्रिंट।", "Interactive checklist, progress and print."),
    ],
    [
      t("आवेदन गाइड", "Application guide"),
      t("चरण-दर-चरण मार्गदर्शन, आधिकारिक माध्यम तक।", "Step-by-step guidance to official channels."),
    ],
  ];

  return (
    <div>
      <section className="hills-bg border-b">
        <div className="mx-auto max-w-4xl px-4 py-12">
          <DemoBadge />
          <h1 className="mt-4 text-3xl font-extrabold text-primary sm:text-4xl">
            {t("परिचय और अस्वीकरण", "About & disclaimer")}
          </h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            {t(
              "सेवासेतु उत्तराखंड एक हिंदी-प्रथम, आवाज़-सक्षम नागरिक सेवा नेविगेटर है। इसका उद्देश्य सरकारी सेवाओं को उन नागरिकों के लिए सुलभ बनाना है जो सरकारी शब्दावली, पोर्टल या पात्रता नियमों से परिचित नहीं हैं।",
              "SevaSetu Uttarakhand is a Hindi-first, voice-enabled citizen service navigator. It aims to make government services accessible to citizens who are not familiar with official terminology, portals or eligibility rules.",
            )}
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button asChild>
              <Link to="/assistant" search={{}}>
                {t("सहायक आज़माएं", "Try the assistant")} <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/how-it-works">{t("कैसे काम करता है", "How it works")}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-10">
        <h2 className="flex items-center gap-2 text-2xl font-extrabold text-primary">
          <ShieldCheck className="h-6 w-6 text-secondary" />
          {t("ईमानदारी और सीमाएं", "Honesty & limitations")}
        </h2>
        <ul className="mt-5 space-y-3">
          {honesty.map((x) => (
            <li key={x} className="rounded-xl border bg-card p-4 text-sm">
              {x}
            </li>
          ))}
        </ul>
      </section>

      <section className="border-y bg-card py-10">
        <div className="mx-auto max-w-4xl px-4">
          <h2 className="flex items-center gap-2 text-2xl font-extrabold text-primary">
            <Sparkles className="h-6 w-6 text-secondary" />
            {t("प्रोटोटाइप में क्या शामिल है", "What this prototype includes")}
          </h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {capabilities.map(([a, b]) => (
              <div key={a} className="rounded-xl border bg-background p-4">
                <p className="font-semibold text-primary">{a}</p>
                <p className="mt-1 text-sm text-muted-foreground">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-4xl gap-6 px-4 py-10 md:grid-cols-3">
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <Lock className="h-5 w-5 text-secondary" />
          <h2 className="mt-3 font-bold text-primary">{t("गोपनीयता", "Privacy")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "कोई लॉगिन आवश्यक नहीं। सहेजी सेवाएं, बातचीत और दस्तावेज सूचियां केवल इस ब्राउज़र में रहती हैं। आधार नंबर, OTP या पासवर्ड कभी न मांगें और न सहेजें।",
              "No login required. Saved services, conversations and checklists stay in this browser only. Aadhaar numbers, OTPs and passwords are never requested or stored.",
            )}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <Accessibility className="h-5 w-5 text-secondary" />
          <h2 className="mt-3 font-bold text-primary">{t("सुगम्यता", "Accessibility")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "बड़ा टेक्स्ट, हाई कॉन्ट्रास्ट, सरल भाषा, कीबोर्ड नेविगेशन, स्पष्ट फोकस, स्क्रीन-रीडर लेबल, आवाज़ इनपुट और आवाज़ आउटपुट।",
              "Large text, high contrast, simple language, keyboard navigation, visible focus, screen-reader labels, voice input and voice output.",
            )}
          </p>
        </div>
        <div className="rounded-2xl border bg-card p-5 shadow-card">
          <Languages className="h-5 w-5 text-secondary" />
          <h2 className="mt-3 font-bold text-primary">{t("भाषाएं", "Languages")}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "हिंदी, हिंग्लिश और अंग्रेज़ी समर्थित हैं। गढ़वाली और कुमाऊँनी भविष्य की योजना हैं — गुणवत्ता सत्यापन के बाद ही जोड़ी जाएंगी।",
              "Hindi, Hinglish and English are supported. Garhwali and Kumaoni are planned and will be added only after quality validation.",
            )}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 pb-12">
        <div className="rounded-2xl border bg-card p-6 shadow-card">
          <h2 className="flex items-center gap-2 text-xl font-bold text-primary">
            <Database className="h-5 w-5 text-secondary" />
            {t("तकनीकी आधार", "Technical foundation")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t(
              "React, TypeScript, Vite, Tailwind CSS और shadcn/ui आधारित इंटरफ़ेस; नमूना सेवा कैटलॉग; नियम-आधारित सहायक इंजन; ब्राउज़र Web Speech API; और स्थानीय डिवाइस भंडारण। उत्पादन संस्करण में Supabase PostgreSQL, Row Level Security, Edge Functions और सुरक्षित बहुभाषी LLM जोड़े जा सकते हैं।",
              "React, TypeScript, Vite, Tailwind CSS and shadcn/ui interface; sample service catalogue; rule-based assistant engine; browser Web Speech API; and local device storage. A production version can add Supabase PostgreSQL, Row Level Security, Edge Functions and a secure multilingual LLM.",
            )}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {t(
              "डेटा स्कीमा में विभाग, सेवाएं, आवश्यक दस्तावेज, बातचीत, संदेश, उपयोगकर्ता प्रोफ़ाइल और सहेजी चेकलिस्ट शामिल हैं — निजी जानकारी केवल तब जब वास्तव में आवश्यक हो।",
              "The data model covers departments, services, required documents, conversations, messages, user profiles and saved checklists — personal information only where genuinely necessary.",
            )}
          </p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          {t(
            "© PRAYAS 2026 – ITDA उत्तराखंड हैकाथॉन प्रोटोटाइप। आधिकारिक सरकारी जानकारी के लिए संबंधित विभाग से संपर्क करें।",
            "© PRAYAS 2026 – ITDA Uttarakhand Hackathon prototype. For official government information, contact the relevant department.",
          )}
        </p>
      </section>
    </div>
  );
}
