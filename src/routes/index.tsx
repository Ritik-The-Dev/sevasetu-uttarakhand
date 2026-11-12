import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Mic, Send, MessageSquareText, ListChecks, ShieldCheck, Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SERVICES } from "@/data/services";
import { usePrefs } from "@/lib/prefs";
import { ServiceCard } from "@/components/seva/ServiceCard";
import { DemoBadge } from "@/components/seva/DemoBadge";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "SevaSetu Uttarakhand — सरकारी सेवाएं, अब आपकी भाषा में" },
    { name: "description", content: "Ask in Hindi, Hinglish or English by voice or text to find government services, documents and preliminary eligibility (prototype)." },
    { property: "og:title", content: "SevaSetu Uttarakhand" },
    { property: "og:description", content: "Hindi-first, voice-first citizen service navigator prototype." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

const EXAMPLES = ["मुझे आय प्रमाण पत्र बनवाना है।", "किसानों के लिए सरकारी योजनाएं बताइए।", "जाति प्रमाण पत्र कैसे बनता है?", "छात्रवृत्ति के लिए कैसे आवेदन करें?", "मेरे परिवार को सरकारी सहायता चाहिए।"];

function Index() {
  const { t, lang } = usePrefs();
  const [q, setQ] = useState("");
  const nav = useNavigate();
  const go = (text: string, voice = false) => nav({ to: "/assistant", search: { q: text || undefined, voice: voice || undefined } });
  const features = [
    { icon: Languages, hi: "हिंदी-प्रथम", en: "Hindi-first", dhi: "हिंदी, हिंग्लिश या अंग्रेज़ी में पूछें।", den: "Ask in Hindi, Hinglish or English." },
    { icon: Mic, hi: "आवाज़ से उपयोग", en: "Voice-first", dhi: "बोलकर पूछें, जवाब सुनें (जहाँ ब्राउज़र समर्थन करे)।", den: "Speak and listen (where the browser supports it)." },
    { icon: MessageSquareText, hi: "संदर्भ समझने वाली मदद", en: "Context-aware help", dhi: "अधूरे सवाल पर सहायक प्रश्न पूछता है।", den: "Asks follow-ups for incomplete requests." },
    { icon: ListChecks, hi: "दस्तावेज तैयारी", en: "Document readiness", dhi: "आवेदन से पहले जानें क्या चाहिए।", den: "Know what you need before applying." },
    { icon: ShieldCheck, hi: "ईमानदार जानकारी", en: "Honest information", dhi: "नमूना और सत्यापित जानकारी अलग दिखती है।", den: "Sample vs verified data is always labelled." },
  ];
  return (
    <div>
      <section className="hills-bg">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 lg:grid-cols-[1.2fr_1fr] lg:py-20">
          <div>
            <DemoBadge />
            <h1 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight text-primary sm:text-5xl" lang="hi">सरकारी सेवाएं, अब आपकी भाषा में।</h1>
            <p className="mt-2 text-xl font-semibold text-secondary">Government Services, Without the Confusion.</p>
            <p className="mt-4 max-w-xl text-muted-foreground">{t("सरकारी योजनाओं और सेवाओं की जानकारी अब आसान हिंदी में। अपनी जरूरत बताएं और सही सेवा, पात्रता और जरूरी दस्तावेजों की जानकारी पाएं।", "Information on government schemes and services in simple language. Describe your need and find the right service, eligibility and required documents.")}</p>
            <form onSubmit={(e) => { e.preventDefault(); go(q); }} className="mt-6 flex items-center gap-2 rounded-2xl border bg-card p-2 shadow-card">
              <Button type="button" size="icon" variant="secondary" className="h-12 w-12 shrink-0 rounded-xl" aria-label={t("बोलकर पूछें", "Ask by voice")} onClick={() => go("", true)}><Mic className="h-5 w-5" /></Button>
              <label htmlFor="hero-q" className="sr-only">{t("आपका सवाल", "Your question")}</label>
              <input id="hero-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="आपको किस सरकारी सेवा की जानकारी चाहिए?" className="h-12 min-w-0 flex-1 bg-transparent px-2 text-base outline-none" />
              <Button type="submit" size="icon" className="h-12 w-12 shrink-0 rounded-xl" aria-label={t("भेजें", "Send")}><Send className="h-5 w-5" /></Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">{t("🎤 माइक दबाएं और हिंदी में बोलें।", "🎤 Tap the mic and speak in Hindi.")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {EXAMPLES.map((e) => <button key={e} onClick={() => go(e)} className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-secondary">{e}</button>)}
            </div>
            <div className="mt-6 flex gap-3">
              <Button asChild size="lg"><Link to="/assistant" search={{}}>{t("AI से पूछें", "Ask AI")}</Link></Button>
              <Button asChild size="lg" variant="outline"><Link to="/services">{t("सेवाएं देखें", "Browse services")}</Link></Button>
            </div>
          </div>
          <div className="hidden rounded-3xl border bg-card p-5 shadow-card lg:block" aria-hidden="true">
            <div className="mb-4 flex items-center justify-between"><span className="font-bold text-primary">SevaSetu सहायक</span><DemoBadge /></div>
            <div className="space-y-3 text-sm">
              <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">मुझे एक सर्टिफिकेट चाहिए।</div>
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2">बिल्कुल! आपको यह सर्टिफिकेट किस काम के लिए चाहिए?</div>
              <div className="flex flex-wrap gap-1.5">{["आय प्रमाण पत्र", "जाति प्रमाण पत्र", "निवास प्रमाण पत्र"].map((x) => <span key={x} className="rounded-full border border-secondary/50 px-2.5 py-1 text-xs text-secondary">{x}</span>)}</div>
              <div className="ml-auto w-fit rounded-2xl rounded-br-sm bg-primary px-4 py-2 text-primary-foreground">मेरे पिताजी किसान हैं।</div>
              <div className="w-fit max-w-[85%] rounded-2xl rounded-bl-sm bg-muted px-4 py-2">समझ गया — ये सेवाएं उपयोगी हो सकती हैं…</div>
            </div>
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-14">
        <h2 className="text-2xl font-extrabold text-primary">{t("लोकप्रिय सरकारी सेवाएं", "Popular government services")}</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{SERVICES.filter((s) => s.popular).map((s) => <ServiceCard key={s.id} s={s} />)}</div>
      </section>
      <section className="bg-card py-14">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-2xl font-extrabold text-primary">{t("SevaSetu क्यों?", "Why SevaSetu?")}</h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {features.map((f) => <div key={f.en} className="rounded-2xl border p-5"><f.icon className="h-6 w-6 text-secondary" /><h3 className="mt-3 font-bold">{lang === "hi" ? f.hi : f.en}</h3><p className="mt-1 text-sm text-muted-foreground">{lang === "hi" ? f.dhi : f.den}</p></div>)}
          </div>
        </div>
      </section>
    </div>
  );
}
