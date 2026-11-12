import { createFileRoute, Link, Outlet, useMatches, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Clock, Flame, RotateCcw, Search } from "lucide-react";
import {
  CATEGORIES,
  DEPARTMENTS,
  SERVICES,
  getService,
  searchServices,
  type Category,
} from "@/data/services";
import { usePrefs } from "@/lib/prefs";
import { KEYS, useStored } from "@/lib/storage";
import { ServiceCard } from "@/components/seva/ServiceCard";
import { Button } from "@/components/ui/button";

export type ServicesSearch = { category?: Category; q?: string };

export const Route = createFileRoute("/services")({
  validateSearch: (s: Record<string, unknown>): ServicesSearch => {
    const out: ServicesSearch = {};
    if (typeof s["q"] === "string" && s["q"].trim()) out.q = s["q"];
    if (typeof s["category"] === "string" && CATEGORIES.some((c) => c.id === s["category"])) {
      out.category = s["category"] as Category;
    }
    return out;
  },
  head: () => ({
    meta: [
      { title: "Explore services — SevaSetu Uttarakhand" },
      {
        name: "description",
        content: "Search sample government services by need, category or department.",
      },
      { property: "og:title", content: "Explore services — SevaSetu" },
      {
        property: "og:description",
        content: "Find certificates, schemes and support in simple language.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Services,
});

function Services() {
  const matches = useMatches();
  if (matches.some((m) => m.routeId === "/services/$id")) return <Outlet />;
  return <ServiceList />;
}

function ServiceList() {
  const { t, lang } = usePrefs();
  const search = Route.useSearch();
  const nav = useNavigate();
  const [q, setQ] = useState(search.q ?? "");
  const [cat, setCat] = useState<string>(search.category ?? "all");
  const [dept, setDept] = useState("all");
  const [sort, setSort] = useState("relevance");
  const [recent] = useStored<string[]>(KEYS.recent, []);

  useEffect(() => {
    setCat(search.category ?? "all");
  }, [search.category]);

  useEffect(() => {
    if (search.q !== undefined) setQ(search.q);
  }, [search.q]);

  const list = useMemo(() => {
    let r = searchServices(q).filter(
      (s) => (cat === "all" || s.category === cat) && (dept === "all" || s.department === dept),
    );
    if (sort === "name") r = [...r].sort((a, b) => a.name[lang].localeCompare(b.name[lang]));
    if (sort === "popular") {
      r = [...r].sort((a, b) => Number(Boolean(b.popular)) - Number(Boolean(a.popular)));
    }
    return r;
  }, [q, cat, dept, sort, lang]);

  const recentServices = recent.map(getService).filter((s): s is NonNullable<typeof s> => !!s);
  const popularServices = SERVICES.filter((s) => s.popular).slice(0, 6);
  const hasFilters = q.trim() !== "" || cat !== "all" || dept !== "all";

  function changeCategory(value: string) {
    setCat(value);
    const next: ServicesSearch = { ...search };
    if (value === "all") delete next.category;
    else next.category = value as Category;
    nav({ to: "/services", search: next, replace: true });
  }

  function resetFilters() {
    setQ("");
    setCat("all");
    setDept("all");
    setSort("relevance");
    nav({ to: "/services", search: {}, replace: true });
  }

  const sel = "h-11 rounded-xl border bg-card px-3 text-sm";
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-secondary">
          {t("सेवा निर्देशिका", "Service directory")}
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-primary sm:text-4xl">
          {t("सेवाएं खोजें", "Explore services")}
        </h1>
        <p className="mt-2 text-muted-foreground">
          {t(
            "अपनी जरूरत अपने शब्दों में लिखें — जैसे “खेती के लिए मदद”। सेवा का सटीक नाम याद होना जरूरी नहीं।",
            "Describe your need in your own words — e.g. “help for farming”. You don't need to know the exact service name.",
          )}
        </p>
      </div>

      <div className="mt-6 rounded-2xl border bg-card p-4 shadow-card">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto]">
          <label className="relative">
            <span className="sr-only">{t("खोजें", "Search")}</span>
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("सेवा, योजना या जरूरत खोजें…", "Search a service, scheme or need…")}
              className="h-11 w-full rounded-xl border bg-background pl-9 pr-3"
            />
          </label>
          <select
            aria-label={t("विभाग", "Department")}
            value={dept}
            onChange={(e) => setDept(e.target.value)}
            className={sel}
          >
            <option value="all">{t("सभी विभाग", "All departments")}</option>
            {DEPARTMENTS.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name[lang]}
              </option>
            ))}
          </select>
          <select
            aria-label={t("क्रम", "Sort")}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={sel}
          >
            <option value="relevance">{t("प्रासंगिकता", "Relevance")}</option>
            <option value="popular">{t("लोकप्रिय पहले", "Popular first")}</option>
            <option value="name">{t("नाम", "Name")}</option>
          </select>
        </div>

        <div
          className="mt-4 flex gap-2 overflow-x-auto pb-1"
          role="group"
          aria-label={t("श्रेणी", "Category")}
        >
          <button
            onClick={() => changeCategory("all")}
            aria-pressed={cat === "all"}
            className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
              cat === "all"
                ? "border-primary bg-primary text-primary-foreground"
                : "bg-background hover:border-secondary/60"
            }`}
          >
            {t("सभी श्रेणियां", "All categories")}
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              onClick={() => changeCategory(c.id)}
              aria-pressed={cat === c.id}
              className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                cat === c.id
                  ? "border-secondary bg-secondary text-secondary-foreground"
                  : "bg-background hover:border-secondary/60"
              }`}
            >
              {c.label[lang]}
            </button>
          ))}
        </div>
      </div>

      {!q && cat === "all" && (
        <section className="mt-8" aria-labelledby="popular-heading">
          <h2
            id="popular-heading"
            className="flex items-center gap-2 text-sm font-bold text-primary"
          >
            <Flame className="h-4 w-4 text-saffron" /> {t("लोकप्रिय सेवाएं", "Popular services")}
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {popularServices.map((s) => (
              <Link
                key={s.id}
                to="/services/$id"
                params={{ id: s.id }}
                className="rounded-full border bg-card px-3 py-1.5 text-sm hover:border-secondary"
              >
                {s.name[lang]}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {list.length} {t("सेवाएं मिलीं", "services found")}
          {hasFilters && (
            <button onClick={resetFilters} className="ml-2 text-secondary underline">
              {t("फ़िल्टर हटाएं", "Clear filters")}
            </button>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {t("सभी सेवाएं नमूना जानकारी हैं।", "All services are sample information.")}
        </p>
      </div>

      {list.length ? (
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <ServiceCard key={s.id} s={s} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed bg-card p-10 text-center">
          <p className="font-semibold text-primary">
            {t("कोई सेवा नहीं मिली।", "No services found.")}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {t(
              "दूसरे शब्दों में खोजें, फ़िल्टर हटाएं, या AI सहायक से अपनी जरूरत बताएं।",
              "Try different words, clear the filters, or describe your need to the AI assistant.",
            )}
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            <Button variant="outline" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" /> {t("फ़िल्टर हटाएं", "Clear filters")}
            </Button>
            <Button asChild>
              <Link to="/assistant" search={{}}>
                {t("AI से पूछें", "Ask the assistant")}
              </Link>
            </Button>
          </div>
        </div>
      )}

      {recentServices.length > 0 && (
        <section className="mt-12 border-t pt-8" aria-labelledby="recent-heading">
          <h2
            id="recent-heading"
            className="flex items-center gap-2 text-sm font-bold text-primary"
          >
            <Clock className="h-4 w-4 text-secondary" /> {t("हाल में देखी गई", "Recently viewed")}
          </h2>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recentServices.slice(0, 3).map((s) => (
              <ServiceCard key={s.id} s={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
