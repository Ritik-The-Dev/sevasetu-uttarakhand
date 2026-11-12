import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  Bookmark,
  Clock,
  ListChecks,
  MessageSquareText,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { getService } from "@/data/services";
import { readinessPercent } from "@/lib/eligibility";
import { usePrefs } from "@/lib/prefs";
import { clearStoredData, KEYS, readStored, useStored } from "@/lib/storage";
import { ServiceCard } from "@/components/seva/ServiceCard";
import { A11yPanel, LangToggle } from "@/components/seva/A11yMenu";

type ChecklistRow = { id: string; pct: number; have: number; total: number };

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "My dashboard — SevaSetu Uttarakhand" },
      {
        name: "description",
        content: "Your recent and saved services, checklists and chats, stored on this device.",
      },
      { property: "og:title", content: "My dashboard — SevaSetu" },
      { property: "og:description", content: "Saved services and checklists." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, lang } = usePrefs();
  const [recent] = useStored<string[]>(KEYS.recent, []);
  const [saved] = useStored<string[]>(KEYS.saved, []);
  const [convos] = useStored<{ id: string; title: string }[]>(KEYS.conversations, []);
  const [checklists, setChecklists] = useState<ChecklistRow[]>([]);

  useEffect(() => {
    const ids = new Set(saved);
    const prefix = "sevasetu.checklist.";
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(prefix)) ids.add(key.slice(prefix.length));
    }
    const rows = [...ids].flatMap((id) => {
      const s = getService(id);
      if (!s) return [];
      const have = readStored<string[]>(KEYS.checklist(id), []);
      return [
        {
          id,
          have: have.length,
          total: s.documents.length,
          pct: readinessPercent(s.documents.length, have.length),
        },
      ];
    });
    setChecklists(rows);
  }, [saved]);

  const list = (ids: string[]) =>
    ids.map(getService).filter((s): s is NonNullable<typeof s> => !!s);
  const savedServices = list(saved);
  const recentServices = list(recent);
  const startedChecklists = checklists.filter((c) => c.have > 0);

  const Empty = ({ text }: { text: string }) => (
    <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">
      {text}
    </p>
  );

  const stats = [
    { icon: Bookmark, value: saved.length, hi: "सहेजी सेवाएं", en: "Saved services" },
    { icon: Clock, value: recent.length, hi: "हाल में देखी", en: "Recently viewed" },
    { icon: MessageSquareText, value: convos.length, hi: "बातचीत", en: "Conversations" },
    {
      icon: ListChecks,
      value: startedChecklists.length,
      hi: "शुरू की सूचियां",
      en: "Checklists started",
    },
  ];

  function resetDemo() {
    if (
      !window.confirm(t("इस डिवाइस से सभी सहेजा डेटा हटाएं?", "Clear all saved data from this device?"))
    )
      return;
    clearStoredData();
    window.location.reload();
  }

  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <div className="hills-bg rounded-3xl bg-primary p-8 text-primary-foreground">
        <h1 className="text-3xl font-extrabold">{t("नमस्ते! 🙏", "Welcome! 🙏")}</h1>
        <p className="mt-2 max-w-2xl opacity-85">
          {t(
            "बिना लॉगिन के उपयोग करें — आपकी जानकारी केवल इसी डिवाइस पर सहेजी जाती है।",
            "No login needed — your data is saved only on this device.",
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button asChild variant="secondary">
            <Link to="/assistant" search={{}}>
              <Sparkles className="h-4 w-4" /> {t("सहायक से पूछें", "Ask the assistant")}
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="border-primary-foreground/40 bg-transparent text-primary-foreground hover:bg-primary-foreground/10"
          >
            <Link to="/services">{t("सेवाएं देखें", "Explore services")}</Link>
          </Button>
        </div>
      </div>

      <section aria-label={t("आपकी गतिविधि", "Your activity")}>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.en} className="rounded-2xl border bg-card p-5 shadow-card">
              <s.icon className="h-5 w-5 text-secondary" />
              <p className="mt-3 text-2xl font-extrabold text-primary">{s.value}</p>
              <p className="text-sm text-muted-foreground">{lang === "hi" ? s.hi : s.en}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-bold text-primary">{t("सहेजी गई सेवाएं", "Saved services")}</h2>
          <Link
            to="/services"
            className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
          >
            {t("और खोजें", "Find more")} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {savedServices.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {savedServices.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <Empty text={t("अभी कोई सेवा सहेजी नहीं गई।", "No saved services yet.")} />
        )}
      </section>

      <section>
        <h2 className="mb-4 text-xl font-bold text-primary">
          {t("दस्तावेज तैयारी (सहेजी सूचियां)", "Document readiness (saved checklists)")}
        </h2>
        {checklists.length ? (
          <div className="grid gap-4 md:grid-cols-2">
            {checklists.map((c) => {
              const s = getService(c.id);
              if (!s) return null;
              return (
                <div key={c.id} className="rounded-2xl border bg-card p-5 shadow-card">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-primary">{s.name[lang]}</h3>
                      <p className="text-xs text-muted-foreground">
                        {c.have} / {c.total} {t("दस्तावेज उपलब्ध", "documents available")}
                      </p>
                    </div>
                    <span className="text-lg font-extrabold text-secondary">{c.pct}%</span>
                  </div>
                  <Progress
                    value={c.pct}
                    className="mt-3"
                    aria-label={t("दस्तावेज तैयारी", "Document readiness")}
                  />
                  <Link
                    to="/services/$id"
                    params={{ id: c.id }}
                    hash="documents"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
                  >
                    {t("सूची फिर खोलें", "Reopen checklist")} <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <Empty
            text={t(
              "किसी सेवा की दस्तावेज सूची खोलकर दस्तावेज चिह्नित करें — प्रगति यहाँ दिखेगी।",
              "Open a service document checklist and mark documents — progress will appear here.",
            )}
          />
        )}
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
          <h2 className="text-xl font-bold text-primary">{t("हाल में देखी गई", "Recently viewed")}</h2>
        </div>
        {recentServices.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentServices.map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        ) : (
          <Empty text={t("अभी कुछ नहीं देखा।", "Nothing viewed yet.")} />
        )}
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-bold text-primary">
            {t("हाल की बातचीत", "Recent conversations")}
          </h2>
          {convos.length ? (
            <ul className="space-y-1 text-sm">
              {convos.slice(0, 6).map((c) => (
                <li key={c.id}>
                  <Link
                    to="/assistant"
                    search={{ conversation: c.id }}
                    className="flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-muted"
                  >
                    <MessageSquareText className="h-4 w-4 shrink-0 text-secondary" />
                    <span className="truncate">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">
              {t("कोई बातचीत नहीं।", "No conversations.")}
            </p>
          )}
        </section>

        <section className="rounded-2xl border bg-card p-5">
          <h2 className="mb-3 font-bold text-primary">
            {t("भाषा और सुगम्यता", "Language & accessibility")}
          </h2>
          <div className="mb-4">
            <LangToggle />
          </div>
          <A11yPanel />
        </section>
      </div>

      <section className="rounded-2xl border border-dashed bg-card p-5">
        <h2 className="font-bold text-primary">{t("डेमो डेटा", "Demo data")}</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {t(
            "सभी सहेजी गई जानकारी इस ब्राउज़र में है। प्रस्तुति से पहले डेमो रीसेट करें।",
            "All saved information lives in this browser. Reset the demo before a presentation.",
          )}
        </p>
        <Button variant="outline" className="mt-3" onClick={resetDemo}>
          <RotateCcw className="h-4 w-4" />{" "}
          {t("इस डिवाइस का डेमो डेटा साफ़ करें", "Clear this device's demo data")}
        </Button>
      </section>
    </div>
  );
}
