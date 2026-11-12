import { createFileRoute } from "@tanstack/react-router";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/about")({
  head: () => ({ meta: [{ title: "About & disclaimer — SevaSetu Uttarakhand" }, { name: "description", content: "About the SevaSetu prototype, its data sources and limitations." }, { property: "og:title", content: "About SevaSetu" }, { property: "og:description", content: "Prototype for PRAYAS 2026 – ITDA Uttarakhand Hackathon." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => {
    const { t } = usePrefs();
    const items = [
      t("यह PRAYAS 2026 – ITDA उत्तराखंड हैकाथॉन के लिए एक प्रोटोटाइप है, आधिकारिक सरकारी वेबसाइट नहीं।", "This is a prototype for PRAYAS 2026 – ITDA Uttarakhand Hackathon, not an official government website."),
      t("सभी सेवा जानकारी नमूना है और सत्यापित नहीं है। शुल्क, समय और आधिकारिक लिंक तभी दिखाए जाएंगे जब सत्यापित हों।", "All service information is sample data and unverified. Fees, timelines and official links are only shown once verified."),
      t("सहायक एक नियम-आधारित डेमो है — यह लाइव AI या किसी सरकारी डेटाबेस से जुड़ा नहीं है और कोई आवेदन जमा नहीं करता।", "The assistant is a rule-based demo — not connected to live AI or any government database, and it never submits applications."),
      t("पात्रता परिणाम प्रारंभिक हैं; अंतिम निर्णय संबंधित विभाग का होता है।", "Eligibility results are preliminary; the department makes the final decision."),
      t("आवाज़ सुविधा आपके ब्राउज़र की Web Speech तकनीक से चलती है, जहाँ उपलब्ध हो।", "Voice features use your browser's Web Speech technology, where available."),
      t("SevaSetu अपुणि सरकार और CM हेल्पलाइन जैसे प्लेटफॉर्म का पूरक है।", "SevaSetu complements platforms such as Apuni Sarkar and CM Helpline."),
    ];
    return <div className="mx-auto max-w-3xl px-4 py-10"><h1 className="text-3xl font-extrabold text-primary">{t("परिचय और अस्वीकरण", "About & disclaimer")}</h1><ul className="mt-6 space-y-3">{items.map((x, i) => <li key={i} className="rounded-xl border bg-card p-4">{x}</li>)}</ul></div>;
  },
});
