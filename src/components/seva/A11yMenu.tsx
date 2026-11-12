import { Accessibility } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { usePrefs } from "@/lib/prefs";

export function A11yPanel() {
  const p = usePrefs();
  const rows: { id: "largeText" | "highContrast" | "simple"; hi: string; en: string; dhi: string; den: string }[] = [
    { id: "largeText", hi: "बड़ा टेक्स्ट", en: "Large text", dhi: "पढ़ने में आसानी", den: "Easier reading" },
    { id: "highContrast", hi: "हाई कॉन्ट्रास्ट", en: "High contrast", dhi: "गहरे रंग, स्पष्ट किनारे", den: "Stronger colours and borders" },
    { id: "simple", hi: "सरल भाषा मोड", en: "Simple language mode", dhi: "कम जानकारी, छोटे वाक्य", den: "Less detail, shorter text" },
  ];
  return (
    <div className="space-y-4">
      {rows.map((r) => (
        <div key={r.id} className="flex items-center justify-between gap-4">
          <Label htmlFor={`a11y-${r.id}`} className="flex flex-col items-start gap-0.5">
            <span className="font-semibold">{p.t(r.hi, r.en)}</span>
            <span className="text-xs font-normal text-muted-foreground">{p.t(r.dhi, r.den)}</span>
          </Label>
          <Switch id={`a11y-${r.id}`} checked={p[r.id]} onCheckedChange={(v) => p.set({ [r.id]: v })} />
        </div>
      ))}
      <p className="text-xs text-muted-foreground">{p.t("गढ़वाली और कुमाऊँनी भाषा भविष्य में जोड़ी जाएंगी — गुणवत्ता जांच के बाद ही।", "Garhwali and Kumaoni are planned — only after quality is validated.")}</p>
    </div>
  );
}

export function A11yMenu() {
  const { t } = usePrefs();
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t("सुगम्यता सेटिंग्स", "Accessibility settings")}><Accessibility className="h-5 w-5" /></Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80"><A11yPanel /></PopoverContent>
    </Popover>
  );
}

export function LangToggle() {
  const { lang, set } = usePrefs();
  return (
    <div role="group" aria-label="Language / भाषा" className="inline-flex rounded-full border bg-card p-0.5 text-sm">
      {(["hi", "en"] as const).map((l) => (
        <button key={l} onClick={() => set({ lang: l })} aria-pressed={lang === l}
          className={`rounded-full px-3 py-1 font-medium transition-colors ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"}`}>
          {l === "hi" ? "हिं" : "EN"}
        </button>
      ))}
    </div>
  );
}
