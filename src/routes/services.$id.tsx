import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Bookmark, Check, ExternalLink, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getDept, getService, type Service } from "@/data/services";
import { evaluateEligibility, readinessPercent } from "@/lib/eligibility";
import { usePrefs } from "@/lib/prefs";
import { KEYS, pushRecent, useStored } from "@/lib/storage";
import { VerificationBadge } from "@/components/seva/DemoBadge";
import { ServiceIcon } from "@/components/seva/ServiceIcon";

type TabId = "overview" | "eligibility" | "documents" | "guide";
const TABS: TabId[] = ["overview", "eligibility", "documents", "guide"];

export const Route = createFileRoute("/services/$id")({
  loader: ({ params }) => {
    const s = getService(params.id);
    if (!s) throw notFound();
    return { id: s.id, name: s.name.en };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — SevaSetu Uttarakhand` },
          {
            name: "description",
            content: `Sample guide, eligibility check and document checklist for ${loaderData.name}.`,
          },
          { property: "og:title", content: `${loaderData.name} — SevaSetu` },
          {
            property: "og:description",
            content: "Eligibility, documents and application steps (sample data).",
          },
          { property: "og:type", content: "article" },
          { name: "twitter:card", content: "summary" },
        ]
      : [{ title: "Unavailable" }, { name: "robots", content: "noindex" }],
  }),
  component: Detail,
});

function Detail() {
  const { id } = Route.useLoaderData();
  const s = getService(id)!;
  const { lang, t } = usePrefs();
  const [saved, setSaved] = useStored<string[]>(KEYS.saved, []);
  const [tab, setTab] = useState<TabId>("overview");
  const isSaved = saved.includes(id);

  useEffect(() => {
    pushRecent(id);
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "") as TabId;
      if (TABS.includes(hash)) setTab(hash);
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, [id]);

  function changeTab(next: string) {
    if (!TABS.includes(next as TabId)) return;
    const tabId = next as TabId;
    setTab(tabId);
    window.history.replaceState(null, "", `#${tabId}`);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <Link to="/services" className="text-sm text-secondary hover:underline">
        ← {t("सभी सेवाएं", "All services")}
      </Link>
      <div className="mt-4 flex flex-wrap items-start gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-navy-soft text-primary">
          <ServiceIcon name={s.icon} className="h-7 w-7" />
        </div>
        <div className="flex-1">
          <h1 className="text-3xl font-extrabold text-primary">{s.name[lang]}</h1>
          <p className="text-muted-foreground">
            {lang === "hi" ? s.name.en : s.name.hi} · {getDept(s.department)?.name[lang]}
          </p>
          <div className="mt-2">
            <VerificationBadge status={s.verificationStatus} />
          </div>
        </div>
        <Button
          variant="outline"
          onClick={() => setSaved(isSaved ? saved.filter((x) => x !== id) : [...saved, id])}
          aria-pressed={isSaved}
        >
          <Bookmark className="h-4 w-4" /> {isSaved ? t("सहेजा गया", "Saved") : t("सहेजें", "Save")}
        </Button>
      </div>

      <div className="no-print mt-5 flex flex-wrap gap-3">
        <Button onClick={() => changeTab("eligibility")}>
          {t("मेरी पात्रता जांचें", "Check eligibility")}
        </Button>
        <Button variant="secondary" onClick={() => changeTab("documents")}>
          {t("दस्तावेजों की सूची देखें", "View document checklist")}
        </Button>
        <Button variant="outline" onClick={() => changeTab("guide")}>
          {t("आवेदन गाइड", "Application guide")}
        </Button>
      </div>

      <Tabs value={tab} onValueChange={changeTab} className="mt-6">
        <TabsList className="no-print flex h-auto flex-wrap">
          <TabsTrigger value="overview">{t("जानकारी", "Overview")}</TabsTrigger>
          <TabsTrigger value="eligibility">{t("पात्रता", "Eligibility")}</TabsTrigger>
          <TabsTrigger value="documents">{t("दस्तावेज", "Documents")}</TabsTrigger>
          <TabsTrigger value="guide">{t("आवेदन गाइड", "Application guide")}</TabsTrigger>
        </TabsList>
        <TabsContent value="overview">
          <Overview s={s} />
        </TabsContent>
        <TabsContent value="eligibility">
          <Eligibility s={s} onDocs={() => changeTab("documents")} />
        </TabsContent>
        <TabsContent value="documents">
          <Checklist s={s} onGuide={() => changeTab("guide")} />
        </TabsContent>
        <TabsContent value="guide">
          <Guide s={s} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

const Box = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section className="rounded-2xl border bg-card p-5 shadow-card">
    <h2 className="mb-2 font-bold text-primary">{title}</h2>
    {children}
  </section>
);

function NotVerified() {
  const { t } = usePrefs();
  return (
    <p className="text-sm text-muted-foreground">
      {t(
        "सत्यापित नहीं — कृपया आधिकारिक कार्यालय से पुष्टि करें।",
        "Not verified — please confirm with the official office.",
      )}
    </p>
  );
}

function OfficialChannels() {
  const { t } = usePrefs();
  return (
    <div className="rounded-xl border border-dashed bg-background p-3 text-sm">
      <p className="font-semibold text-primary">{t("कहाँ से आवेदन करें?", "Where can I apply?")}</p>
      <ul className="mt-2 space-y-1 text-muted-foreground">
        <li>
          {t(
            "• अपने नज़दीकी जन सेवा केंद्र (CSC) पर जाकर सहायता लें।",
            "• Visit your nearest Common Service Centre (CSC) for assistance.",
          )}
        </li>
        <li>
          {t(
            "• संबंधित तहसील कार्यालय / विभाग से आवेदन प्रक्रिया पूछें।",
            "• Ask the relevant tehsil office / department about the application process.",
          )}
        </li>
        <li>
          {t(
            "• उत्तराखंड सरकार के आधिकारिक पोर्टल की पुष्टि सरकारी वेबसाइट से करें।",
            "• Confirm the Uttarakhand Government official portal from a government website.",
          )}
        </li>
      </ul>
      <p className="mt-2 text-xs text-muted-foreground">
        {t(
          "इस डेमो में किसी सेवा का आधिकारिक लिंक सत्यापित नहीं है, इसलिए कोई लिंक नहीं दिखाया गया है।",
          "No service-specific official link is verified in this demo, so none is shown.",
        )}
      </p>
    </div>
  );
}

function Overview({ s }: { s: Service }) {
  const { lang, t } = usePrefs();
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Box title={t("सेवा परिचय", "Overview")}>
        <p>{s.description[lang]}</p>
      </Box>
      <Box title={t("उद्देश्य", "Purpose")}>
        <p>{s.purpose[lang]}</p>
      </Box>
      <Box title={t("कौन आवेदन कर सकता है?", "Who can apply?")}>
        <p>{s.whoCanApply[lang]}</p>
        <ul className="mt-2 list-disc pl-5 text-sm">
          {s.rules.map((r, i) => (
            <li key={i}>{r.label[lang]}</li>
          ))}
        </ul>
      </Box>
      <Box title={t("शुल्क और समय", "Fees & processing time")}>
        {s.fees || s.processingTime ? (
          <div className="space-y-1">
            {s.fees && <p>{s.fees[lang]}</p>}
            {s.processingTime && <p>{s.processingTime[lang]}</p>}
          </div>
        ) : (
          <NotVerified />
        )}
      </Box>
      <div className="md:col-span-2">
        <Box title={t("आधिकारिक आवेदन लिंक", "Official application link")}>
          {s.officialSourceUrl ? (
            <div className="space-y-2">
              <a
                className="inline-flex items-center gap-1 text-secondary underline"
                href={s.officialSourceUrl}
                target="_blank"
                rel="noreferrer"
              >
                {s.officialSourceUrl} <ExternalLink className="h-4 w-4" />
              </a>
              <p className="text-xs text-muted-foreground">
                {t("अंतिम सत्यापन:", "Last verified:")}{" "}
                {s.lastVerifiedAt ?? t("उपलब्ध नहीं", "not available")}
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                {t(
                  "इस डेमो में इस सेवा का आधिकारिक लिंक सत्यापित नहीं है। नीचे दिए माध्यमों से आवेदन की जानकारी लें।",
                  "No official service link is verified in this demo. Use the channels below to get application details.",
                )}
              </p>
              <OfficialChannels />
            </div>
          )}
        </Box>
      </div>
      <Box title={t("स्रोत जानकारी", "Source information")}>
        <p className="text-sm">
          {t("SevaSetu नमूना कैटलॉग", "SevaSetu sample catalogue")} ·{" "}
          {t("अंतिम सत्यापन:", "Last verified:")} {s.lastVerifiedAt ?? t("कभी नहीं", "never")}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          {t(
            "शुल्क, प्रसंस्करण समय और आधिकारिक लिंक केवल सत्यापित होने पर दिखाए जाते हैं।",
            "Fees, processing time and official links are shown only when verified.",
          )}
        </p>
      </Box>
      <div className="md:col-span-2">
        <Box title={t("अक्सर पूछे जाने वाले प्रश्न", "FAQs")}>
          {s.faqs.map((f, i) => (
            <details key={i} className="border-t py-2 first:border-0">
              <summary className="cursor-pointer font-medium">{f.q[lang]}</summary>
              <p className="mt-1 text-sm text-muted-foreground">{f.a[lang]}</p>
            </details>
          ))}
        </Box>
      </div>
    </div>
  );
}

function Eligibility({ s, onDocs }: { s: Service; onDocs: () => void }) {
  const { lang, t } = usePrefs();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [i, setI] = useState(0);
  const done = i >= s.questions.length;
  const q = s.questions[i];

  if (!done && q) {
    return (
      <Box title={`${t("प्रश्न", "Question")} ${i + 1} / ${s.questions.length}`}>
        <Progress value={(i / s.questions.length) * 100} className="mb-4" />
        <p className="text-lg font-semibold">{q.text[lang]}</p>
        {q.help && <p className="mt-1 text-sm text-muted-foreground">{q.help[lang]}</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          {q.options.map((o) => (
            <Button
              key={o.value}
              size="lg"
              variant={
                o.value === "unknown"
                  ? "outline"
                  : answers[q.id] === o.value
                    ? "secondary"
                    : "default"
              }
              onClick={() => {
                setAnswers({ ...answers, [q.id]: o.value });
                setI(i + 1);
              }}
            >
              {o.label[lang]}
            </Button>
          ))}
        </div>
        {i > 0 && (
          <button className="mt-4 text-sm text-secondary underline" onClick={() => setI(i - 1)}>
            {t("पिछला प्रश्न", "Previous question")}
          </button>
        )}
        <p className="mt-4 text-xs text-muted-foreground">
          {t(
            "यह केवल प्रारंभिक जांच है। अंतिम निर्णय संबंधित विभाग करेगा।",
            "This is only a preliminary check. The department makes the final decision.",
          )}
        </p>
      </Box>
    );
  }
  if (!done) return null;

  const r = evaluateEligibility(s, answers);
  const head = {
    eligible: [
      t("प्रारंभिक रूप से पात्र प्रतीत होते हैं", "Appears eligible"),
      "bg-success/10 text-success",
    ],
    "more-info": [
      t("और जानकारी आवश्यक है", "More information required"),
      "bg-accent text-accent-foreground",
    ],
    ineligible: [
      t("उपलब्ध मानदंडों के अनुसार अपात्र प्रतीत होते हैं", "Appears ineligible under available criteria"),
      "bg-destructive/10 text-destructive",
    ],
  }[r.outcome];

  const nextSteps =
    r.outcome === "eligible"
      ? [
          {
            hi: "दस्तावेज सूची देखें और उपलब्ध दस्तावेज चिह्नित करें।",
            en: "Open the document checklist and mark the documents you have.",
          },
          { hi: "आवेदन गाइड के चरणों का पालन करें।", en: "Follow the steps in the application guide." },
          {
            hi: "आधिकारिक माध्यम (CSC/तहसील/पोर्टल) से आवेदन करें।",
            en: "Apply through an official channel (CSC/tehsil/portal).",
          },
        ]
      : r.outcome === "more-info"
        ? [
            {
              hi: "अधूरी जानकारी वाले प्रश्नों के उत्तर फिर से दें।",
              en: "Answer the missing questions again.",
            },
            {
              hi: "दस्तावेज सूची देखें — कुछ जवाब दस्तावेजों से स्पष्ट हो सकते हैं।",
              en: "Check the document list — some answers may become clear from documents.",
            },
            {
              hi: "संबंधित कार्यालय से शर्तों की पुष्टि करें।",
              en: "Confirm the conditions with the relevant office.",
            },
          ]
        : [
            { hi: "पूरी न हुई शर्तों को ध्यान से पढ़ें।", en: "Read the conditions that were not met." },
            {
              hi: "यदि स्थिति बदलती है तो जांच फिर से करें।",
              en: "Re-run the check if your situation changes.",
            },
            {
              hi: "वैकल्पिक योजना या सहायता के लिए AI सहायक से पूछें।",
              en: "Ask the AI assistant about alternative schemes or support.",
            },
          ];

  const L = ({ title, items }: { title: string; items: { hi: string; en: string }[] }) =>
    items.length ? (
      <div>
        <h3 className="font-semibold">{title}</h3>
        <ul className="list-disc pl-5 text-sm">
          {items.map((x, k) => (
            <li key={k}>{x[lang]}</li>
          ))}
        </ul>
      </div>
    ) : null;

  return (
    <Box title={t("परिणाम", "Result")}>
      <p className={`rounded-xl px-4 py-3 text-lg font-bold ${head[1]}`} role="status">
        {head[0]}
      </p>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <L title={t("पूरी शर्तें", "Conditions satisfied")} items={r.satisfied} />
        <L title={t("पूरी नहीं हुई शर्तें", "Conditions not satisfied")} items={r.notSatisfied} />
        <L title={t("अधूरी जानकारी", "Missing information")} items={r.missing} />
        <L title={t("अतिरिक्त सत्यापन", "Additional verification")} items={r.verify} />
      </div>
      <div className="mt-4 rounded-xl border bg-background p-3">
        <h3 className="font-semibold text-primary">
          {t("सुझाए गए अगले कदम", "Suggested next steps")}
        </h3>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
          {nextSteps.map((x, k) => (
            <li key={k}>{x[lang]}</li>
          ))}
        </ol>
      </div>
      <p className="mt-4 rounded-xl border border-saffron/50 bg-accent p-3 text-sm text-accent-foreground">
        {t(
          "यह प्रारंभिक जानकारी है। अंतिम पात्रता संबंधित सरकारी विभाग द्वारा निर्धारित की जाएगी।",
          "This is preliminary information. The final eligibility will be determined by the relevant government department.",
        )}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button onClick={onDocs}>{t("अगला: दस्तावेज सूची", "Next: document checklist")}</Button>
        <Button
          variant="outline"
          onClick={() => {
            setAnswers({});
            setI(0);
          }}
        >
          {t("फिर से जांचें", "Start again")}
        </Button>
        <Button variant="ghost" asChild>
          <Link to="/assistant" search={{}}>
            {t("सहायक से पूछें", "Ask the assistant")}
          </Link>
        </Button>
      </div>
    </Box>
  );
}

function Checklist({ s, onGuide }: { s: Service; onGuide: () => void }) {
  const { lang, t } = usePrefs();
  const [have, setHave] = useStored<string[]>(KEYS.checklist(s.id), []);
  const pct = readinessPercent(s.documents.length, have.length);
  const missing = s.documents.filter((d) => !have.includes(d.id));
  return (
    <Box title={t("दस्तावेज तैयारी", "Document readiness")}>
      <p className="font-semibold" aria-live="polite">
        {t(
          `आपकी दस्तावेज तैयारी ${pct}% पूरी हो गई है।`,
          `Your document readiness is ${pct}% complete.`,
        )}
      </p>
      <Progress
        value={pct}
        className="my-3"
        aria-label={t("दस्तावेज तैयारी प्रतिशत", "Document readiness percentage")}
      />
      <p className="text-xs text-muted-foreground">
        {t(
          "यह केवल सूची की प्रगति है, पात्रता या आवेदन स्वीकृति नहीं। नमूना सूची — आधिकारिक रूप से पुष्टि करें।",
          "Checklist progress only — not eligibility or approval. Sample list — confirm officially.",
        )}
      </p>
      <ul className="mt-4 space-y-2">
        {s.documents.map((d) => {
          const on = have.includes(d.id);
          return (
            <li key={d.id}>
              <label
                className={`flex cursor-pointer gap-3 rounded-xl border p-3 ${on ? "border-success/50 bg-success/5" : ""}`}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-5 w-5 accent-[var(--color-secondary)]"
                  checked={on}
                  onChange={() => setHave(on ? have.filter((x) => x !== d.id) : [...have, d.id])}
                />
                <span>
                  <span className="font-semibold">{d.name[lang]}</span>{" "}
                  {d.mandatory && (
                    <span className="text-xs text-destructive">*{t("आवश्यक", "required")}</span>
                  )}
                  <span className="block text-sm text-muted-foreground">{d.description[lang]}</span>
                  <span
                    className={`text-xs font-semibold ${on ? "text-success" : "text-muted-foreground"}`}
                  >
                    {on ? t("उपलब्ध", "Available") : t("अभी नहीं", "Missing")}
                  </span>
                </span>
              </label>
            </li>
          );
        })}
      </ul>
      {missing.length > 0 && (
        <p className="mt-3 text-sm">
          <strong>{t("बाकी:", "Still missing:")}</strong>{" "}
          {missing.map((d) => d.name[lang]).join(", ")}
        </p>
      )}
      {missing.length === 0 && (
        <p className="mt-3 flex items-center gap-1 text-sm font-semibold text-success">
          <Check className="h-4 w-4" />{" "}
          {t("सूची के सभी दस्तावेज चिह्नित हैं।", "All checklist documents are marked available.")}
        </p>
      )}
      <div className="no-print mt-4 flex flex-wrap gap-2">
        <Button onClick={onGuide}>{t("अगला: आवेदन गाइड", "Next: application guide")}</Button>
        <Button variant="outline" onClick={() => setHave(s.documents.map((d) => d.id))}>
          {t("सभी उपलब्ध चिह्नित करें", "Mark all available")}
        </Button>
        <Button variant="outline" onClick={() => setHave([])}>
          {t("साफ़ करें", "Clear")}
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          <Printer className="h-4 w-4" /> {t("प्रिंट करें", "Print")}
        </Button>
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        {t("यह सूची इस डिवाइस पर सहेजी जाती है।", "This checklist is saved on this device only.")}
      </p>
    </Box>
  );
}

function Guide({ s }: { s: Service }) {
  const { lang, t } = usePrefs();
  const [done, setDone] = useStored<number[]>(KEYS.guide(s.id), []);
  const pct = readinessPercent(s.steps.length, done.length);
  return (
    <Box title={t("चरण-दर-चरण आवेदन गाइड", "Step-by-step application guide")}>
      <div className="mb-4 rounded-xl bg-navy-soft p-3">
        <p className="text-sm font-semibold text-primary">
          {t(
            `${done.length} / ${s.steps.length} चरण पूरे — ${pct}%`,
            `${done.length} / ${s.steps.length} steps complete — ${pct}%`,
          )}
        </p>
        <Progress value={pct} className="mt-2" aria-label={t("गाइड प्रगति", "Guide progress")} />
      </div>
      <ol className="space-y-3">
        {s.steps.map((st, i) => {
          const on = done.includes(i);
          return (
            <li
              key={i}
              className={`flex gap-3 rounded-xl border p-4 ${on ? "border-success/40 bg-success/5" : ""}`}
            >
              <button
                aria-label={t("पूरा चिह्नित करें", "Mark complete")}
                aria-pressed={on}
                onClick={() => setDone(on ? done.filter((x) => x !== i) : [...done, i])}
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-bold ${
                  on
                    ? "border-success bg-success text-success-foreground"
                    : "border-primary text-primary"
                }`}
              >
                {on ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              <div className="min-w-0">
                <h3 className="font-semibold">{st.title[lang]}</h3>
                <p className="text-sm text-muted-foreground">{st.description[lang]}</p>
                {i === 3 && s.officialSourceUrl && (
                  <a
                    href={s.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 inline-flex items-center gap-1 text-sm font-semibold text-secondary underline"
                  >
                    {t("आधिकारिक लिंक खोलें", "Open official link")}{" "}
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                )}
                {i === 3 && !s.officialSourceUrl && (
                  <p className="mt-1 text-xs text-accent-foreground">
                    {t(
                      "आधिकारिक लिंक सत्यापित नहीं — इसलिए नहीं दिखाया गया। CSC या तहसील कार्यालय से संपर्क करें।",
                      "Official link not verified — so none is shown. Contact a CSC or tehsil office.",
                    )}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={() => setDone(s.steps.map((_, i) => i))}>
          {t("सभी चरण पूरे चिह्नित करें", "Mark all steps complete")}
        </Button>
        <Button variant="ghost" onClick={() => setDone([])}>
          {t("रीसेट करें", "Reset")}
        </Button>
      </div>
      <p className="mt-4 flex items-start gap-2 rounded-xl bg-accent p-3 text-xs text-accent-foreground">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
        {t(
          "SevaSetu कोई आवेदन जमा नहीं करता और किसी सरकारी डेटाबेस से नहीं जुड़ा है। अंतिम आवेदन आधिकारिक माध्यम से ही करें।",
          "SevaSetu never submits applications and is not connected to any government database. Always apply through an official channel.",
        )}
      </p>
    </Box>
  );
}
