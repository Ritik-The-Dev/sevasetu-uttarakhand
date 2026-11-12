import { FlaskConical, ShieldCheck } from "lucide-react";
import { usePrefs } from "@/lib/prefs";
import { cn } from "@/lib/utils";

export function DemoBadge({ className }: { className?: string }) {
  const { t } = usePrefs();
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full border border-saffron/60 bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground", className)}>
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> {t("डेमो मोड", "DEMO MODE")}
    </span>
  );
}

export function VerificationBadge({ status }: { status: "verified" | "demo" }) {
  const { t } = usePrefs();
  if (status === "verified")
    return <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-0.5 text-xs font-semibold text-success"><ShieldCheck className="h-3.5 w-3.5" /> {t("सत्यापित", "Verified")}</span>;
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-saffron/60 bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-foreground">
      <FlaskConical className="h-3.5 w-3.5" aria-hidden="true" /> {t("नमूना जानकारी · असत्यापित", "Sample data · Not verified")}
    </span>
  );
}

export function DemoNotice() {
  const { t } = usePrefs();
  return (
    <div role="note" className="no-print border-b border-saffron/40 bg-accent text-accent-foreground">
      <p className="mx-auto max-w-7xl px-4 py-1.5 text-center text-xs sm:text-sm">
        <strong>{t("डेमो मोड:", "Demo mode:")}</strong>{" "}
        {t(
          "सेवा जानकारी नमूना है और सहायक नियम-आधारित डेमो है (लाइव AI या सरकारी सिस्टम से जुड़ा नहीं)। आधिकारिक जानकारी संबंधित विभाग से पुष्टि करें।",
          "Service information is sample data and the assistant is a rule-based demo (not live AI or connected to government systems). Confirm details with the official department.",
        )}
      </p>
    </div>
  );
}
