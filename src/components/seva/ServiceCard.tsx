import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { getCategory, getDept, type Service } from "@/data/services";
import { usePrefs } from "@/lib/prefs";
import { ServiceIcon } from "./ServiceIcon";

export function ServiceCard({ s }: { s: Service }) {
  const { lang, t, simple } = usePrefs();
  return (
    <article className="group flex flex-col rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-secondary/50">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy-soft text-primary">
          <ServiceIcon name={s.icon} className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <h3 className="font-bold leading-snug">{lang === "hi" ? s.name.hi : s.name.en}</h3>
          <p className="text-xs text-muted-foreground">{lang === "hi" ? s.name.en : s.name.hi}</p>
        </div>
      </div>
      {!simple && (
        <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">{s.description[lang]}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5 text-[11px]">
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
          {getCategory(s.category)?.label[lang]}
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
          {getDept(s.department)?.name[lang]}
        </span>
        {s.verificationStatus === "demo" && (
          <span className="rounded-full bg-accent px-2 py-0.5 font-semibold text-accent-foreground">
            {t("नमूना", "Sample")}
          </span>
        )}
      </div>
      <Link
        to="/services/$id"
        params={{ id: s.id }}
        className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline"
        aria-label={`${t("विवरण देखें", "View details")}: ${s.name[lang]}`}
      >
        {t("विवरण देखें", "View details")}{" "}
        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
      </Link>
    </article>
  );
}
