import { Link } from "@tanstack/react-router";
import { usePrefs } from "@/lib/prefs";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { t } = usePrefs();
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5"><Logo /><span className="text-lg font-extrabold">SevaSetu Uttarakhand</span></div>
          <p className="mt-3 max-w-md text-sm opacity-80">{t("सरकारी सेवाएं, अब आपकी भाषा में। SevaSetu अपुणि सरकार और CM हेल्पलाइन जैसे आधिकारिक प्लेटफॉर्म का पूरक है — उनका विकल्प नहीं।", "Government services, made simple. SevaSetu complements official platforms such as Apuni Sarkar and CM Helpline — it does not replace them.")}</p>
          <p className="mt-3 text-xs opacity-70">{t("PRAYAS 2026 – ITDA उत्तराखंड हैकाथॉन के लिए प्रोटोटाइप। यह कोई आधिकारिक सरकारी वेबसाइट नहीं है।", "Prototype for PRAYAS 2026 – ITDA Uttarakhand Hackathon. This is not an official government website.")}</p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">{t("खोजें", "Explore")}</h2>
          <ul className="space-y-2 text-sm opacity-85">
            <li><Link to="/services">{t("सेवाएं", "Services")}</Link></li>
            <li><Link to="/assistant">{t("AI सहायक", "AI Assistant")}</Link></li>
            <li><Link to="/dashboard">{t("डैशबोर्ड", "Dashboard")}</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">{t("जानकारी", "About")}</h2>
          <ul className="space-y-2 text-sm opacity-85">
            <li><Link to="/how-it-works">{t("कैसे काम करता है", "How it works")}</Link></li>
            <li><Link to="/about">{t("परिचय और अस्वीकरण", "About & disclaimer")}</Link></li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
