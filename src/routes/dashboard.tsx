import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { getService } from "@/data/services";
import { usePrefs } from "@/lib/prefs";
import { KEYS, useStored } from "@/lib/storage";
import { ServiceCard } from "@/components/seva/ServiceCard";
import { A11yPanel, LangToggle } from "@/components/seva/A11yMenu";

export const Route = createFileRoute("/dashboard")({
  head: () => ({ meta: [{ title: "My dashboard — SevaSetu Uttarakhand" }, { name: "description", content: "Your recent and saved services, checklists and chats, stored on this device." }, { property: "og:title", content: "My dashboard — SevaSetu" }, { property: "og:description", content: "Saved services and checklists." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { t } = usePrefs();
  const [recent] = useStored<string[]>(KEYS.recent, []);
  const [saved] = useStored<string[]>(KEYS.saved, []);
  const [convos] = useStored<{ id: string; title: string }[]>(KEYS.conversations, []);
  const list = (ids: string[]) => ids.map(getService).filter((s): s is NonNullable<typeof s> => !!s);
  const Empty = ({ text }: { text: string }) => <p className="rounded-2xl border border-dashed p-6 text-center text-sm text-muted-foreground">{text}</p>;
  return (
    <div className="mx-auto max-w-7xl space-y-10 px-4 py-10">
      <div className="rounded-3xl bg-primary p-8 text-primary-foreground"><h1 className="text-3xl font-extrabold">{t("नमस्ते! 🙏", "Welcome! 🙏")}</h1><p className="mt-2 opacity-85">{t("बिना लॉगिन के उपयोग करें — आपकी जानकारी केवल इसी डिवाइस पर सहेजी जाती है।", "No login needed — your data is saved only on this device.")}</p>
        <div className="mt-4 flex gap-2"><Button asChild variant="secondary"><Link to="/assistant" search={{}}>{t("सहायक से पूछें", "Ask the assistant")}</Link></Button><Button asChild variant="outline" className="bg-transparent text-primary-foreground"><Link to="/services">{t("सेवाएं देखें", "Explore services")}</Link></Button></div></div>
      <section><h2 className="mb-4 text-xl font-bold text-primary">{t("सहेजी गई सेवाएं", "Saved services")}</h2>{saved.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list(saved).map((s) => <ServiceCard key={s.id} s={s} />)}</div> : <Empty text={t("अभी कोई सेवा सहेजी नहीं गई।", "No saved services yet.")} />}</section>
      <section><h2 className="mb-4 text-xl font-bold text-primary">{t("हाल में देखी गई", "Recently viewed")}</h2>{recent.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list(recent).map((s) => <ServiceCard key={s.id} s={s} />)}</div> : <Empty text={t("अभी कुछ नहीं देखा।", "Nothing viewed yet.")} />}</section>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-3 font-bold text-primary">{t("हाल की बातचीत", "Recent conversations")}</h2>{convos.length ? <ul className="space-y-1 text-sm">{convos.slice(0, 6).map((c) => <li key={c.id}>• {c.title}</li>)}</ul> : <p className="text-sm text-muted-foreground">{t("कोई बातचीत नहीं।", "No conversations.")}</p>}</section>
        <section className="rounded-2xl border bg-card p-5"><h2 className="mb-3 font-bold text-primary">{t("भाषा और सुगम्यता", "Language & accessibility")}</h2><div className="mb-4"><LangToggle /></div><A11yPanel /></section>
      </div>
    </div>
  );
}
