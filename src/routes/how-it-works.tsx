import { createFileRoute } from "@tanstack/react-router";
import { usePrefs } from "@/lib/prefs";

export const Route = createFileRoute("/how-it-works")({
  head: () => ({ meta: [{ title: "How it works — SevaSetu Uttarakhand" }, { name: "description", content: "From your question to the right service: language detection, clarification, retrieval and guidance." }, { property: "og:title", content: "How SevaSetu works" }, { property: "og:description", content: "The citizen journey, step by step." }, { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" }] }),
  component: () => {
    const { t } = usePrefs();
    const steps = [
      [t("अपनी जरूरत बताएं", "Describe your need"), t("बोलकर या लिखकर, अपनी भाषा में।", "By voice or text, in your language.")],
      [t("भाषा और इरादा पहचान", "Language & intent"), t("सहायक भाषा और जरूरत पहचानता है।", "The assistant detects language and intent.")],
      [t("स्पष्टीकरण प्रश्न", "Clarifying questions"), t("अधूरे सवाल पर सरल प्रश्न पूछता है।", "Asks simple questions if the request is incomplete.")],
      [t("सेवा खोज", "Service retrieval"), t("केवल कैटलॉग से सेवाएं सुझाता है — कुछ नहीं गढ़ता।", "Suggests services only from the catalogue — never invents.")],
      [t("पात्रता नियम", "Eligibility rules"), t("निश्चित नियम प्रारंभिक पात्रता बताते हैं, AI नहीं।", "Fixed rules give preliminary eligibility, not AI.")],
      [t("दस्तावेज और गाइड", "Documents & guide"), t("सूची तैयार करें और आधिकारिक माध्यम से आवेदन करें।", "Prepare documents and apply via official channels.")],
    ];
    return <div className="mx-auto max-w-4xl px-4 py-10"><h1 className="text-3xl font-extrabold text-primary">{t("SevaSetu कैसे काम करता है", "How SevaSetu works")}</h1>
      <ol className="mt-8 space-y-4">{steps.map(([a, b], i) => <li key={i} className="flex gap-4 rounded-2xl border bg-card p-5 shadow-card"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary font-bold text-secondary-foreground">{i + 1}</span><div><h2 className="font-bold">{a}</h2><p className="text-muted-foreground">{b}</p></div></li>)}</ol>
      <p className="mt-6 rounded-xl bg-accent p-4 text-sm text-accent-foreground">{t("इस प्रोटोटाइप में सहायक नियम-आधारित डेमो है। लाइव भाषा मॉडल और डेटाबेस अगले चरण में जोड़े जा सकते हैं।", "In this prototype the assistant is a rule-based demo. A live language model and database can be added in a later phase.")}</p></div>;
  },
});
