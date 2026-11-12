import { Link } from "@tanstack/react-router";
import { usePrefs } from "@/lib/prefs";
import { Logo } from "./Logo";

export function SiteFooter() {
  const { t } = usePrefs();
  return (
    <footer className="border-t bg-primary text-primary-foreground">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5">
            <Logo />
            <span className="text-lg font-extrabold">SevaSetu Uttarakhand</span>
          </div>
          <p className="mt-3 max-w-md text-sm opacity-80">
            {t(
              "सरकारी सेवाएं, अब आपकी भाषा में। SevaSetu अपुणि सरकार और CM हेल्पलाइन जैसे आधिकारिक प्लेटफॉर्म का पूरक है — उनका विकल्प नहीं।",
              "Government services, made simple. SevaSetu complements official platforms such as Apuni Sarkar and CM Helpline — it does not replace them.",
            )}
          </p>
          <p className="mt-3 text-xs opacity-70">
            {t(
              "PRAYAS 2026 – ITDA उत्तराखंड हैकाथॉन के लिए प्रोटोटाइप। यह कोई आधिकारिक सरकारी वेबसाइट नहीं है।",
              "Prototype for PRAYAS 2026 – ITDA Uttarakhand Hackathon. This is not an official government website.",
            )}
          </p>
          <p className="mt-4 inline-flex rounded-full border border-primary-foreground/25 px-3 py-1 text-xs opacity-80">
            {t("डेमो मोड · नमूना सेवा डेटा", "Demo mode · sample service data")}
          </p>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">{t("खोजें", "Explore")}</h2>
          <ul className="space-y-2 text-sm opacity-85">
            <li>
              <Link to="/services" className="hover:underline">
                {t("सेवाएं", "Services")}
              </Link>
            </li>
            <li>
              <Link to="/assistant" search={{}} className="hover:underline">
                {t("AI सहायक", "AI Assistant")}
              </Link>
            </li>
            <li>
              <Link to="/assistant" search={{ voice: true }} className="hover:underline">
                {t("आवाज़ सहायक", "Voice assistant")}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:underline">
                {t("डैशबोर्ड", "Dashboard")}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="mb-3 text-sm font-bold">{t("जानकारी", "About")}</h2>
          <ul className="space-y-2 text-sm opacity-85">
            <li>
              <Link to="/how-it-works" className="hover:underline">
                {t("कैसे काम करता है", "How it works")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t("परिचय और अस्वीकरण", "About & disclaimer")}
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:underline">
                {t("गोपनीयता और सीमाएं", "Privacy & limitations")}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-primary-foreground/15">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs opacity-65">
          {t(
            "सहायक नियम-आधारित डेमो है। शुल्क, समय और आधिकारिक लिंक केवल सत्यापित होने पर दिखाए जाते हैं। अंतिम जानकारी संबंधित विभाग से पुष्टि करें।",
            "The assistant is a rule-based demo. Fees, timelines and official links are shown only when verified. Confirm final details with the relevant department.",
          )}
        </p>
      </div>
    </footer>
  );
}
