import { createFileRoute, Outlet, useMatches } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { CATEGORIES, DEPARTMENTS, searchServices } from "@/data/services";
import { usePrefs } from "@/lib/prefs";
import { ServiceCard } from "@/components/seva/ServiceCard";

export const Route = createFileRoute("/services")({
  head: () => ({ meta: [
    { title: "Explore services — SevaSetu Uttarakhand" }, { name: "description", content: "Search sample government services by need, category or department." },
    { property: "og:title", content: "Explore services — SevaSetu" }, { property: "og:description", content: "Find certificates, schemes and support in simple language." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }),
  component: Services,
});

function Services() {
  const matches = useMatches();
  if (matches.some((m) => m.routeId === "/services/$id")) return <Outlet />;
  return <ServiceList />;
}

function ServiceList() {
  const { t, lang } = usePrefs();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [dept, setDept] = useState("all");
  const [sort, setSort] = useState("relevance");
  const list = useMemo(() => {
    let r = searchServices(q).filter((s) => (cat === "all" || s.category === cat) && (dept === "all" || s.department === dept));
    if (sort === "name") r = [...r].sort((a, b) => a.name[lang].localeCompare(b.name[lang]));
    return r;
  }, [q, cat, dept, sort, lang]);
  const sel = "h-11 rounded-xl border bg-card px-3 text-sm";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <h1 className="text-3xl font-extrabold text-primary">{t("सेवाएं खोजें", "Explore services")}</h1>
      <p className="mt-1 text-muted-foreground">{t("अपनी जरूरत अपने शब्दों में लिखें — जैसे “खेती के लिए मदद”।", "Describe your need in your own words — e.g. “help for farming”.")}</p>
      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
        <label className="relative"><span className="sr-only">{t("खोजें", "Search")}</span><Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" /><input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("सेवा, योजना या जरूरत खोजें…", "Search a service, scheme or need…")} className="h-11 w-full rounded-xl border bg-card pl-9 pr-3" /></label>
        <select aria-label={t("श्रेणी", "Category")} value={cat} onChange={(e) => setCat(e.target.value)} className={sel}><option value="all">{t("सभी श्रेणियां", "All categories")}</option>{CATEGORIES.map((c) => <option key={c.id} value={c.id}>{c.label[lang]}</option>)}</select>
        <select aria-label={t("विभाग", "Department")} value={dept} onChange={(e) => setDept(e.target.value)} className={sel}><option value="all">{t("सभी विभाग", "All departments")}</option>{DEPARTMENTS.map((d) => <option key={d.id} value={d.id}>{d.name[lang]}</option>)}</select>
        <select aria-label={t("क्रम", "Sort")} value={sort} onChange={(e) => setSort(e.target.value)} className={sel}><option value="relevance">{t("प्रासंगिकता", "Relevance")}</option><option value="name">{t("नाम", "Name")}</option></select>
      </div>
      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">{list.length} {t("सेवाएं मिलीं", "services found")}</p>
      {list.length ? <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map((s) => <ServiceCard key={s.id} s={s} />)}</div>
        : <div className="mt-6 rounded-2xl border border-dashed p-10 text-center text-muted-foreground">{t("कोई सेवा नहीं मिली। दूसरे शब्दों में खोजें या AI सहायक से पूछें।", "No services found. Try other words or ask the assistant.")}</div>}
    </div>
  );
}
