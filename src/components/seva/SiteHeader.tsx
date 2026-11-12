import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { usePrefs } from "@/lib/prefs";
import { Logo } from "./Logo";
import { A11yMenu, LangToggle } from "./A11yMenu";

export function SiteHeader() {
  const { t } = usePrefs();
  const [open, setOpen] = useState(false);
  const links = [
    { to: "/", label: t("होम", "Home") },
    { to: "/services", label: t("सेवाएं देखें", "Explore Services") },
    { to: "/assistant", label: t("AI सहायक", "AI Assistant") },
    { to: "/how-it-works", label: t("कैसे काम करता है", "How It Works") },
    { to: "/about", label: t("परिचय", "About") },
    { to: "/dashboard", label: t("मेरा डैशबोर्ड", "My Dashboard") },
  ] as const;
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:rounded focus:bg-card focus:px-3 focus:py-2"
      >
        {t("मुख्य सामग्री पर जाएं", "Skip to content")}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo />
          <span className="leading-tight">
            <span className="block font-extrabold tracking-tight text-primary">SevaSetu</span>
            <span className="block text-[11px] font-medium text-muted-foreground">
              Uttarakhand · सेवासेतु
            </span>
          </span>
        </Link>
        <nav aria-label="Main" className="ml-6 hidden items-center gap-1 lg:flex">
          {links.slice(0, 5).map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground data-[status=active]:font-semibold data-[status=active]:text-primary"
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1.5">
          <LangToggle />
          <A11yMenu />
          <Button asChild className="hidden sm:inline-flex">
            <Link to="/dashboard">{t("शुरू करें", "Get Started")}</Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label={t("मेनू", "Menu")}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="mb-4">SevaSetu</SheetTitle>
              <nav className="flex flex-col gap-1">
                {links.map((l) => (
                  <Link
                    key={l.to}
                    to={l.to}
                    onClick={() => setOpen(false)}
                    activeOptions={{ exact: l.to === "/" }}
                    className="rounded-md px-3 py-3 text-base font-medium hover:bg-muted data-[status=active]:bg-navy-soft data-[status=active]:text-primary"
                  >
                    {l.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
