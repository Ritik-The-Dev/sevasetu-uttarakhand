// DEMO assistant engine — deterministic, rule-based. It is NOT a live LLM.
// It mimics the planned pipeline: language detection → intent → clarification →
// catalogue retrieval → structured response. All recommendations come from the
// sample catalogue in src/data/services.ts.
import { getService, searchServices, SERVICES, type Service } from "@/data/services";

export type DetectedLanguage = "hi" | "hinglish" | "en";
export type ReplyLang = "hi" | "en";
export type FollowUp = { intent: string; label: string };

export type AssistantResponse = {
  detected_language: DetectedLanguage;
  reply_language: ReplyLang;
  intent: string;
  response_text: string;
  clarification_required: boolean;
  follow_up_questions: FollowUp[];
  recommended_services: string[];
  source_references: string[];
  confidence: number;
  next_actions: string[];
  topic: string | null;
  /** Service the conversation is currently about, so follow-ups keep context. */
  service_id: string | null;
};

export type ConversationContext = { topic: string | null; serviceId?: string | null };

const HINGLISH =
  /\b(mujhe|mujhko|hai|hain|chahiye|kaise|kya|banana|banwana|mere|mera|meri|liye|nahi|nahin|kisan|yojana|batao|bataiye|karna|kare|sarkari|praman|patra|padhai|bachche|pitaji|madad|kaun|kab|kahan)\b/i;

export function detectLanguage(text: string): DetectedLanguage {
  if (/[\u0900-\u097F]/.test(text)) return "hi";
  if (HINGLISH.test(text)) return "hinglish";
  return "en";
}

const has = (text: string, re: RegExp) => re.test(text.toLowerCase());

const P = {
  sensitive: /\b\d{4}\s?\d{4}\s?\d{4}\b|\botp\b|password|पासवर्ड|ओटीपी|\bcvv\b|\bpin\b/,
  dontKnow: /पता नहीं|नहीं पता|मालूम नहीं|nahi pata|pata nahi|not sure|don'?t know|no idea|जानकारी नहीं/,
  greet: /^(hi|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|प्रणाम)\b/,
  thanks: /धन्यवाद|शुक्रिया|थैंक|thank|thanks|thx/,
  identity:
    /तुम कौन|आप कौन|क्या तुम (एi|ai)|are you (an )?(ai|bot|robot|human)|who are you|what are you|क्या यह सरकारी|is this (an )?official|official website|government website|सरकारी वेबसाइट|क्या यह सरकार की वेबसाइट/,
  serviceList:
    /कौन सी सेवा|कौनसी सेवा|सेवाओं की सूची|list of services|which services|क्या क्या सेवा|all services|सारी सेवाएं/,
  income: /income|आय|इनकम|\baay\b|kamai|कमाई/,
  caste: /caste|jati|jaati|जाति|\bobc\b|\bsc\b|\bst\b/,
  domicile: /domicile|niwas|nivas|निवास|residence|sthayi|स्थायी/,
  birth: /birth|janm|janam|जन्म/,
  ration: /ration|राशन/,
  pension: /pension|पेंशन|old age|वृद्धा|बुढ़ापा|bujurg|बुजुर्ग|senior|वृद्धावस्था/,
  health: /ayushman|आयुष्मान|hospital|अस्पताल|ilaj|इलाज|health|स्वास्थ्य|treatment|bimar|बीमार/,
  scholarship: /scholarship|chhatravritti|छात्रवृत्ति|वजीफा|wazifa/,
  pmkisan: /pm.?kisan|सम्मान निधि|samman nidhi|किसान सम्मान/,
  equipment: /equipment|upkaran|उपकरण|tractor|ट्रैक्टर|yantra|यंत्र|machine|मशीन/,
  job: /\bjob|naukri|नौकरी|rozgar|रोज़गार|रोजगार|employment|berozgar|बेरोज/,
  women: /pregnan|garbh|गर्भ|maternity|मातृत्व|prasav|प्रसव|delivery/,
  farmer: /kisan|किसान|farmer|farm|farming|kheti|खेती|krishi|कृषि|agricultur/,
  education: /padhai|पढ़ाई|पढाई|education|शिक्षा|school|स्कूल|college|कॉलेज|student|छात्र|study/,
  certificate: /certificate|सर्टिफिकेट|praman|प्रमाण/,
  help: /madad|मदद|sahayata|सहायता|help|support|assistance|परिवार|family/,
  scheme: /yojana|योजना|scheme/,
};

// Questions a citizen can ask about a specific service.
const DET = {
  documents: /दस्तावेज|दस्तावेज़|कागज|कागज़|document|paper|kagaz|dastavez/,
  fees: /शुल्क|फीस|fees?|charge|cost|kitna paisa|पैसे लग|कितना खर्च|खर्चा|मुफ्त|free/,
  time: /कितना समय|कितने दिन|समय लगेगा|कब तक|processing|kitne din|kitna time|how long|days|timeline/,
  eligibility: /पात्रता|पात्र|eligible|eligibility|yogyata|शर्त|condition|कौन आवेदन/,
  status: /स्थिति|status|track|कहाँ तक|कहा तक|आवेदन कहाँ/,
  apply:
    /कैसे आवेदन|आवेदन कैसे|आवेदन करना|कैसे बनवा|कैसे बनेगा|कैसे बनता|प्रक्रिया|process|how to apply|how do i apply|steps|apply kaise/,
  office:
    /कहाँ जाना|कहां जाना|कहाँ से|कहां से|where (do|to|can)|office|कार्यालय|CSC|तहसील|tehsil|portal|पोर्टल|\blink\b|लिंक/,
  overview: /और जानकारी|पूरी जानकारी|विवरण|details|बारे में|about|explain/,
};

type DetailKind = keyof typeof DET;

function detailIntent(text: string): DetailKind | null {
  const order: DetailKind[] = [
    "documents",
    "fees",
    "time",
    "eligibility",
    "status",
    "apply",
    "office",
    "overview",
  ];
  for (const k of order) if (DET[k].test(text)) return k;
  return null;
}

// Services that are commonly asked for but are NOT in the sample catalogue.
// We answer honestly instead of inventing procedures, fees or links.
const ABSENT: { re: RegExp; hi: string; en: string }[] = [
  { re: /passport|पासपोर्ट/, hi: "पासपोर्ट", en: "a passport" },
  {
    re: /driving|ड्राइविंग|licence|license|लाइसेंस/,
    hi: "ड्राइविंग लाइसेंस",
    en: "a driving licence",
  },
  {
    re: /death certificate|mrtyu praman|मृत्यु प्रमाण|मौत का प्रमाण/,
    hi: "मृत्यु प्रमाण पत्र",
    en: "a death certificate",
  },
  { re: /marriage|vivah|विवाह|शादी/, hi: "विवाह प्रमाण पत्र", en: "a marriage certificate" },
  {
    re: /khatauni|खतौनी|khasra|खसरा|land record|भूमि अभिलेख|नक्शा|जमीन का कागज/,
    hi: "भूमि / खसरा-खतौनी रिकॉर्ड",
    en: "land records",
  },
  { re: /फसल बीमा|fasal bima|crop insurance/, hi: "फसल बीमा", en: "crop insurance" },
  { re: /aadhaar|आधार कार्ड/, hi: "आधार कार्ड सेवा", en: "Aadhaar services" },
  { re: /awas yojana|आवास योजना|pmay|housing/, hi: "आवास योजना", en: "housing schemes" },
  { re: /ujjwala|उज्ज्वला|गैस कनेक्शन/, hi: "उज्ज्वला गैस कनेक्शन", en: "a Ujjwala gas connection" },
  {
    re: /mgnrega|मनरेगा|रोजगार गारंटी|job card/,
    hi: "मनरेगा / रोजगार गारंटी",
    en: "MGNREGA / employment guarantee",
  },
  { re: /widow|विधवा/, hi: "विधवा पेंशन", en: "widow pension" },
  { re: /बिजली|bijli|electricity/, hi: "बिजली सेवा", en: "electricity services" },
  { re: /पेयजल|पानी की|water supply|जल योजना/, hi: "पेयजल सेवा", en: "water supply services" },
];

const SERVICE_MATCHERS: { id: string; re: RegExp }[] = [
  { id: "pm-kisan", re: P.pmkisan },
  { id: "farm-equipment-subsidy", re: P.equipment },
  { id: "income-certificate", re: P.income },
  { id: "caste-certificate", re: P.caste },
  { id: "domicile-certificate", re: P.domicile },
  { id: "birth-certificate", re: P.birth },
  { id: "ration-card", re: P.ration },
  { id: "old-age-pension", re: P.pension },
  { id: "ayushman-card", re: P.health },
  { id: "maternity-support", re: P.women },
  { id: "scholarship", re: P.scholarship },
  { id: "employment-registration", re: P.job },
];

function matchService(text: string): string | null {
  for (const m of SERVICE_MATCHERS) if (m.re.test(text) && getService(m.id)) return m.id;
  return null;
}

const L = (lang: ReplyLang, hi: string, en: string) => (lang === "hi" ? hi : en);
const fu = (lang: ReplyLang, intent: string, hi: string, en: string): FollowUp => ({
  intent,
  label: L(lang, hi, en),
});

const SOURCE = "SevaSetu sample catalogue (demo data — not officially verified)";

function base(
  dl: DetectedLanguage,
  rl: ReplyLang,
  intent: string,
  text: string,
  extra: Partial<AssistantResponse> = {},
): AssistantResponse {
  return {
    detected_language: dl,
    reply_language: rl,
    intent,
    response_text: text,
    clarification_required: false,
    follow_up_questions: [],
    recommended_services: [],
    source_references: [],
    confidence: 0.8,
    next_actions: [],
    topic: null,
    service_id: null,
    ...extra,
  };
}

function recommend(
  dl: DetectedLanguage,
  rl: ReplyLang,
  intent: string,
  ids: string[],
  intro: { hi: string; en: string },
  extra: Partial<AssistantResponse> = {},
) {
  const names = ids
    .map((id) => getService(id))
    .filter(Boolean)
    .map((s) => `• ${rl === "hi" ? s!.name.hi : s!.name.en}`)
    .join("\n");
  const text = `${L(rl, intro.hi, intro.en)}\n\n${names}\n\n${L(
    rl,
    "हर सेवा पर पात्रता जांच, दस्तावेज सूची और आवेदन मार्गदर्शिका देख सकते हैं। ध्यान दें: यह नमूना जानकारी है — अंतिम जानकारी आधिकारिक कार्यालय से पुष्टि करें।",
    "Each service has an eligibility check, document checklist and application guide. Note: this is sample information — confirm details with the official office.",
  )}`;
  return base(dl, rl, intent, text, {
    recommended_services: ids,
    source_references: [SOURCE],
    confidence: 0.85,
    next_actions: ["check_eligibility", "view_checklist", "view_guide"],
    service_id: ids.length === 1 ? ids[0]! : null,
    ...extra,
  });
}

/** Follow-up chips offered after a service has been identified. */
function detailChips(rl: ReplyLang): FollowUp[] {
  return [
    fu(rl, "detail:documents", "कौन से दस्तावेज चाहिए?", "Which documents do I need?"),
    fu(rl, "detail:eligibility", "पात्रता क्या है?", "What is the eligibility?"),
    fu(rl, "detail:apply", "आवेदन कैसे करें?", "How do I apply?"),
    fu(rl, "detail:fees", "शुल्क कितना है?", "What is the fee?"),
  ];
}

function serviceChips(rl: ReplyLang, ids: string[]): FollowUp[] {
  return ids.flatMap((id) => {
    const s = getService(id);
    return s ? [fu(rl, `service:${id}`, s.name.hi, s.name.en)] : [];
  });
}

/** Answer a detail question about a specific service, grounded in catalogue data. */
function detail(which: DetailKind, s: Service, dl: DetectedLanguage, rl: ReplyLang) {
  const name = s.name[rl];
  let text: string;
  let next: string[] = [];

  switch (which) {
    case "documents": {
      const lines = s.documents
        .map(
          (d) =>
            `• ${d.name[rl]}${d.mandatory ? L(rl, " (आवश्यक)", " (required)") : L(rl, " (वैकल्पिक)", " (optional)")}`,
        )
        .join("\n");
      text = L(
        rl,
        `${name} के लिए ये दस्तावेज चाहिए:\n\n${lines}\n\nयह नमूना सूची है — अंतिम सूची आधिकारिक कार्यालय से पुष्टि करें। दस्तावेज टैब में आप जो दस्तावेज आपके पास हैं उन्हें चिह्नित करके तैयारी का प्रतिशत देख सकते हैं।`,
        `Documents needed for ${name}:\n\n${lines}\n\nThis is a sample list — confirm the final list with the official office. In the Documents tab you can tick what you already have and see your readiness percentage.`,
      );
      next = ["view_checklist"];
      break;
    }
    case "fees": {
      text = s.fees
        ? L(rl, `${name} का शुल्क: ${s.fees.hi}`, `Fee for ${name}: ${s.fees.en}`)
        : L(
            rl,
            `इस सेवा का शुल्क हमारे सत्यापित डेटा में उपलब्ध नहीं है, इसलिए मैं कोई राशि नहीं बताऊंगा। शुल्क की पुष्टि अपने जन सेवा केंद्र (CSC), तहसील कार्यालय या आधिकारिक पोर्टल से करें।`,
            `The fee for this service is not available in our verified data, so I won't state an amount. Please confirm the fee at a Common Service Centre (CSC), tehsil office or the official portal.`,
          );
      break;
    }
    case "time": {
      text = s.processingTime
        ? L(
            rl,
            `${name} के लिए अनुमानित समय: ${s.processingTime.hi}`,
            `Estimated time for ${name}: ${s.processingTime.en}`,
          )
        : L(
            rl,
            `इस सेवा का प्रसंस्करण समय हमारे सत्यापित डेटा में उपलब्ध नहीं है, इसलिए मैं कोई अनुमान नहीं दूंगा। संबंधित कार्यालय या आधिकारिक पोर्टल से समय की पुष्टि करें।`,
            `The processing time for this service is not in our verified data, so I won't guess. Please confirm the timeline with the relevant office or official portal.`,
          );
      break;
    }
    case "eligibility": {
      const lines = s.rules.map((r) => `• ${r.label[rl]}`).join("\n");
      text = L(
        rl,
        `${name} के लिए सामान्य शर्तें:\n\n${lines}\n\n"मेरी पात्रता जांचें" से प्रारंभिक जांच कर सकते हैं। अंतिम पात्रता संबंधित सरकारी विभाग तय करेगा।`,
        `General conditions for ${name}:\n\n${lines}\n\nYou can run a preliminary check with "Check eligibility". The final eligibility is decided by the relevant government department.`,
      );
      next = ["check_eligibility"];
      break;
    }
    case "apply": {
      const lines = s.steps.map((st, i) => `${i + 1}. ${st.title[rl]}`).join("\n");
      text = L(
        rl,
        `${name} के लिए आवेदन के चरण:\n\n${lines}\n\nSevaSetu कोई आवेदन जमा नहीं करता। अंतिम आवेदन CSC, तहसील कार्यालय या आधिकारिक पोर्टल से ही करें।`,
        `Steps to apply for ${name}:\n\n${lines}\n\nSevaSetu never submits applications. Submit the final application through a CSC, tehsil office or the official portal.`,
      );
      next = ["view_guide"];
      break;
    }
    case "office": {
      text = s.officialSourceUrl
        ? L(
            rl,
            `${name} के लिए आधिकारिक लिंक: ${s.officialSourceUrl} (अंतिम सत्यापन: ${s.lastVerifiedAt ?? "-"})`,
            `Official link for ${name}: ${s.officialSourceUrl} (last verified: ${s.lastVerifiedAt ?? "-"})`,
          )
        : L(
            rl,
            `इस सेवा का आधिकारिक लिंक सत्यापित नहीं है, इसलिए मैं कोई लिंक नहीं दूंगा। आवेदन के लिए अपने नज़दीकी जन सेवा केंद्र (CSC) जाएं, संबंधित तहसील कार्यालय से पूछें, या उत्तराखंड सरकार के आधिकारिक पोर्टल की पुष्टि सरकारी वेबसाइट से करें।`,
            `No official link is verified for this service, so I won't invent one. Visit your nearest Common Service Centre (CSC), ask the relevant tehsil office, or confirm the Uttarakhand Government portal on an official website.`,
          );
      break;
    }
    case "status": {
      text = L(
        rl,
        `SevaSetu किसी सरकारी सिस्टम से नहीं जुड़ा है, इसलिए मैं आवेदन की स्थिति नहीं देख सकता। अपना आवेदन नंबर और पावती संभालकर रखें, और स्थिति की जानकारी संबंधित आधिकारिक पोर्टल, CSC या तहसील कार्यालय से लें।`,
        `SevaSetu is not connected to any government system, so I cannot look up an application status. Keep your application number and receipt safe, and check status through the relevant official portal, CSC or tehsil office.`,
      );
      break;
    }
    default: {
      text = `${s.description[rl]}\n\n${L(rl, "उद्देश्य:", "Purpose:")} ${s.purpose[rl]}\n\n${L(rl, "कौन आवेदन कर सकता है:", "Who can apply:")} ${s.whoCanApply[rl]}`;
      break;
    }
  }

  return base(dl, rl, `answer_${which}`, text, {
    recommended_services: [s.id],
    source_references: [SOURCE],
    confidence: 0.9,
    next_actions: next,
    topic: s.category,
    service_id: s.id,
    follow_up_questions: detailChips(rl).filter((f) => f.intent !== `detail:${which}`),
  });
}

const SERVICE_INTENTS: Record<string, string> = {
  income: "income-certificate",
  caste: "caste-certificate",
  domicile: "domicile-certificate",
  birth: "birth-certificate",
  ration: "ration-card",
  pension: "old-age-pension",
  health: "ayushman-card",
  scholarship: "scholarship",
  pmkisan: "pm-kisan",
  equipment: "farm-equipment-subsidy",
  job: "employment-registration",
  women: "maternity-support",
};

/** Respond to a citizen message. `forcedIntent` comes from tapping a suggested reply. */
export function respond(
  text: string,
  ctx: ConversationContext,
  opts: {
    replyOverride?: ReplyLang | undefined;
    forcedIntent?: string | undefined;
    uiLang: ReplyLang;
  },
): AssistantResponse {
  const dl = detectLanguage(text);
  const rl: ReplyLang =
    opts.replyOverride ?? (dl === "hi" ? "hi" : dl === "en" ? "en" : opts.uiLang);
  const intent = opts.forcedIntent ?? classify(text, ctx);
  return handle(intent, dl, rl, ctx);
}

function classify(text: string, ctx: ConversationContext): string {
  const t = text.toLowerCase();
  if (has(t, P.sensitive)) return "sensitive";
  if (has(t, P.identity)) return "identity";
  if (has(t, P.thanks) && t.trim().split(/\s+/).length <= 4) return "thanks";

  const matched = matchService(t);
  const which = detailIntent(t);
  if (matched) return which ? `service:${matched}#${which}` : `service:${matched}`;

  const absentIdx = ABSENT.findIndex((a) => a.re.test(t));
  if (absentIdx >= 0) return `absent:${absentIdx}`;

  if (which && ctx.serviceId) return `detail:${which}`;
  if (which) return "detail_clarify";

  // Context-aware follow-ups
  if (
    (ctx.topic === "certificate" || ctx.topic === "certificates") &&
    (has(t, P.farmer) || has(t, P.scheme))
  )
    return "certificate_for_farmer_scheme";
  if (ctx.topic === "education") {
    if (/(1[12]|11th|12th|college|कॉलेज|graduation|स्नातक|university)/i.test(t))
      return "edu_post_matric";
    if (/(class|कक्षा|primary|प्राथमिक|[1-9]\b|10)/i.test(t)) return "edu_school";
  }
  if (has(t, P.dontKnow))
    return ctx.topic === "farmer"
      ? "farmer_unknown"
      : ctx.topic === "certificate"
        ? "certificate_unknown"
        : "general_menu";
  for (const k of Object.keys(SERVICE_INTENTS) as (keyof typeof P)[]) {
    if (has(t, P[k])) return `service:${SERVICE_INTENTS[k]}`;
  }
  if (has(t, P.farmer)) return "farmer_clarify";
  if (has(t, P.education)) return "education_clarify";
  if (has(t, P.certificate)) return "certificate_clarify";
  if (has(t, P.help) || has(t, P.scheme)) return "general_menu";
  if (has(t.trim(), P.greet)) return "greeting";
  if (has(t, P.serviceList)) return "service_list";

  // Free-text retrieval: let the catalogue answer "whatever I ask" where it can.
  const found = searchServices(text);
  if (found.length) return `search:${found.slice(0, 3).map((s) => s.id).join(",")}`;
  return "fallback";
}

function handle(intent: string, dl: DetectedLanguage, rl: ReplyLang, ctx: ConversationContext) {
  if (intent.startsWith("service:")) {
    const [id = "", which] = intent.slice(8).split("#");
    const s = getService(id);
    if (!s) return fallback(rl, dl);
    if (which && which in DET) return detail(which as DetailKind, s, dl, rl);
    return recommend(
      dl,
      rl,
      "find_service",
      [id],
      {
        hi: `आपके लिए यह सेवा उपयुक्त लगती है: ${s.name.hi}।`,
        en: `This service looks relevant to you: ${s.name.en}.`,
      },
      { topic: s.category, service_id: id, follow_up_questions: detailChips(rl) },
    );
  }
  if (intent.startsWith("detail:")) {
    const s = ctx.serviceId ? getService(ctx.serviceId) : undefined;
    if (s) return detail(intent.slice(7) as DetailKind, s, dl, rl);
    return detailWithoutService(dl, rl);
  }
  if (intent === "detail_clarify") return detailWithoutService(dl, rl);
  if (intent.startsWith("absent:")) {
    const a = ABSENT[Number(intent.slice(7))];
    if (!a) return fallback(rl, dl);
    return base(
      dl,
      rl,
      "no_catalogue_match",
      L(
        rl,
        `${a.hi} की जानकारी हमारे सत्यापित नमूना कैटलॉग में उपलब्ध नहीं है। मैं कोई प्रक्रिया, शुल्क या लिंक नहीं गढ़ूंगा। कृपया संबंधित विभाग, जन सेवा केंद्र (CSC) या तहसील कार्यालय से पुष्टि करें।`,
        `${a.en[0]!.toUpperCase()}${a.en.slice(1)} is not in our verified sample catalogue. I won't invent a procedure, fee or link. Please confirm with the relevant department, a Common Service Centre (CSC) or tehsil office.`,
      ),
      {
        confidence: 0.35,
        source_references: [SOURCE],
        follow_up_questions: menu(rl),
      },
    );
  }
  if (intent.startsWith("search:")) {
    const ids = intent
      .slice(7)
      .split(",")
      .filter((id) => getService(id));
    if (!ids.length) return fallback(rl, dl);
    return recommend(
      dl,
      rl,
      "search_catalogue",
      ids,
      {
        hi: "आपके सवाल से मिलती-जुलती ये सेवाएं हमारे नमूना कैटलॉग में हैं:",
        en: "These services from our sample catalogue look related to your question:",
      },
      { confidence: 0.55, clarification_required: ids.length > 1 },
    );
  }
  switch (intent) {
    case "sensitive":
      return base(
        dl,
        rl,
        "safety_warning",
        L(
          rl,
          "⚠️ कृपया अपना आधार नंबर, OTP, पासवर्ड या बैंक विवरण यहाँ साझा न करें। SevaSetu को इनकी कभी आवश्यकता नहीं होती। आप बताएं कि आपको किस सेवा की जानकारी चाहिए।",
          "⚠️ Please never share your Aadhaar number, OTP, password or bank credentials here. SevaSetu never needs them. Tell me which service you need help with.",
        ),
        { confidence: 1 },
      );
    case "identity":
      return base(
        dl,
        rl,
        "about_assistant",
        L(
          rl,
          "मैं SevaSetu सहायक हूँ — PRAYAS 2026 हैकाथॉन के लिए एक नियम-आधारित डेमो (लाइव AI नहीं)। मैं नमूना सेवा कैटलॉग से जानकारी देता हूँ और किसी सरकारी सिस्टम से जुड़ा नहीं हूँ। यह सरकारी वेबसाइट नहीं है; अंतिम जानकारी विभाग से पुष्टि करें।",
          "I'm the SevaSetu assistant — a rule-based demo for the PRAYAS 2026 hackathon (not live AI). I answer from a sample service catalogue and am not connected to any government system. This is not a government website; confirm final details with the department.",
        ),
        { confidence: 0.9, follow_up_questions: menu(rl) },
      );
    case "thanks":
      return base(
        dl,
        rl,
        "thanks",
        L(
          rl,
          "खुशी हुई कि मदद कर सका। 🙏 कुछ और पूछना हो तो बताइए — या सहेजी सेवा और दस्तावेज सूची डैशबोर्ड में देख सकते हैं।",
          "Glad I could help. 🙏 Ask me anything else — or find your saved services and checklists in the dashboard.",
        ),
        { confidence: 0.9 },
      );
    case "service_list":
      return base(
        dl,
        rl,
        "list_services",
        L(
          rl,
          "नमूना कैटलॉग में इन श्रेणियों की सेवाएं हैं: प्रमाण पत्र, कृषि, शिक्षा, स्वास्थ्य, समाज कल्याण, रोज़गार, महिला एवं बाल विकास, राजस्व और नागरिक सहायता। नीचे से कोई सेवा चुनें, या अपनी जरूरत अपने शब्दों में बताएं।",
          "The sample catalogue covers: certificates, agriculture, education, healthcare, social welfare, employment, women & child development, revenue and citizen assistance. Pick a service below, or describe your need in your own words.",
        ),
        {
          confidence: 0.8,
          follow_up_questions: serviceChips(
            rl,
            SERVICES.filter((s) => s.popular)
              .slice(0, 6)
              .map((s) => s.id),
          ),
        },
      );
    case "greeting":
      return base(
        dl,
        rl,
        "greeting",
        L(
          rl,
          "नमस्ते! मैं SevaSetu सहायक हूँ। अपनी जरूरत अपने शब्दों में बताइए — जैसे “मुझे आय प्रमाण पत्र चाहिए”।",
          "Hello! I'm the SevaSetu assistant. Tell me what you need in your own words — e.g. “I need an income certificate”.",
        ),
        { follow_up_questions: menu(rl), clarification_required: true },
      );
    case "certificate_clarify":
      return base(
        dl,
        rl,
        "clarify_certificate",
        L(
          rl,
          "बिल्कुल! मैं आपकी मदद कर सकता हूँ। आपको यह सर्टिफिकेट किस काम के लिए चाहिए, या कौन-सा सर्टिफिकेट चाहिए?",
          "Of course! I can help. Which certificate do you need, or what do you need it for?",
        ),
        {
          clarification_required: true,
          topic: "certificate",
          confidence: 0.6,
          follow_up_questions: [
            fu(rl, "service:income-certificate", "आय प्रमाण पत्र", "Income certificate"),
            fu(rl, "service:caste-certificate", "जाति प्रमाण पत्र", "Caste certificate"),
            fu(rl, "service:domicile-certificate", "निवास प्रमाण पत्र", "Domicile certificate"),
            fu(rl, "service:birth-certificate", "जन्म प्रमाण पत्र", "Birth certificate"),
            fu(rl, "certificate_unknown", "मुझे नहीं पता, मुझे मदद चाहिए", "I don't know, I need help"),
          ],
        },
      );
    case "certificate_unknown":
      return base(
        dl,
        rl,
        "clarify_certificate_purpose",
        L(
          rl,
          "कोई बात नहीं। बताइए, यह किस काम के लिए चाहिए?",
          "No problem. What do you need it for?",
        ),
        {
          clarification_required: true,
          topic: "certificate",
          confidence: 0.5,
          follow_up_questions: [
            fu(
              rl,
              "certificate_for_farmer_scheme",
              "किसान/सरकारी योजना के लिए",
              "For a farmer / government scheme",
            ),
            fu(rl, "edu_post_matric", "छात्रवृत्ति या प्रवेश के लिए", "For scholarship or admission"),
            fu(rl, "service:employment-registration", "नौकरी के लिए", "For a job"),
            fu(
              rl,
              "service:birth-certificate",
              "बच्चे के स्कूल प्रवेश के लिए",
              "For a child's school admission",
            ),
          ],
        },
      );
    case "certificate_for_farmer_scheme":
      return recommend(
        dl,
        rl,
        "certificate_for_scheme",
        ["income-certificate", "domicile-certificate", "pm-kisan"],
        {
          hi: "समझ गया — आपके पिताजी किसान हैं और प्रमाण पत्र किसी सरकारी योजना के लिए चाहिए। कई योजनाओं में सामान्यतः आय और निवास प्रमाण पत्र मांगे जाते हैं। ये सेवाएं उपयोगी हो सकती हैं:",
          en: "Understood — your father is a farmer and the certificate is for a government scheme. Many schemes commonly ask for income and domicile certificates. These may help:",
        },
        {
          topic: "farmer",
          follow_up_questions: [
            fu(
              rl,
              "service:farm-equipment-subsidy",
              "क्या उन्हें कृषि उपकरण सहायता चाहिए?",
              "Do they need farm equipment support?",
            ),
            fu(
              rl,
              "service:old-age-pension",
              "क्या उनकी उम्र 60 से अधिक है? (पेंशन)",
              "Are they over 60? (pension)",
            ),
            fu(rl, "service:ayushman-card", "इलाज/स्वास्थ्य सहायता", "Health/treatment support"),
          ],
        },
      );
    case "farmer_clarify":
      return base(
        dl,
        rl,
        "clarify_farmer",
        L(
          rl,
          "मैं किसान परिवारों के लिए उपयुक्त सरकारी योजनाओं की जानकारी खोजने में मदद कर सकता हूँ। क्या आप बता सकते हैं कि किस तरह की सहायता चाहिए?",
          "I can help find government schemes for farmer families. What kind of help is needed?",
        ),
        {
          clarification_required: true,
          topic: "farmer",
          confidence: 0.6,
          follow_up_questions: [
            fu(rl, "service:pm-kisan", "खेती के लिए आर्थिक सहायता", "Financial support for farming"),
            fu(rl, "farmer_seeds", "बीज और खाद से संबंधित सहायता", "Seeds and fertiliser support"),
            fu(
              rl,
              "service:farm-equipment-subsidy",
              "कृषि उपकरणों पर सब्सिडी",
              "Subsidy on farm equipment",
            ),
            fu(rl, "farmer_pension", "किसान पेंशन या अन्य सहायता", "Farmer pension or other support"),
            fu(rl, "farmer_unknown", "मुझे जानकारी नहीं है", "I'm not sure"),
          ],
        },
      );
    case "farmer_seeds":
      return base(
        dl,
        rl,
        "no_catalogue_match",
        L(
          rl,
          "बीज और खाद सहायता की कोई सत्यापित जानकारी अभी हमारे नमूना कैटलॉग में नहीं है। मैं कोई योजना या शर्त नहीं गढ़ूंगा। कृपया अपने ब्लॉक/जिला कृषि कार्यालय या नजदीकी जन सेवा केंद्र (CSC) से संपर्क करें।",
          "Our sample catalogue has no verified information on seed and fertiliser support yet. I won't make up a scheme or its conditions. Please contact your block/district agriculture office or nearest Common Service Centre (CSC).",
        ),
        {
          confidence: 0.4,
          topic: "farmer",
          source_references: [SOURCE],
          follow_up_questions: [
            fu(rl, "service:pm-kisan", "आर्थिक सहायता योजना देखें", "See financial support scheme"),
            fu(rl, "service:farm-equipment-subsidy", "उपकरण सब्सिडी देखें", "See equipment subsidy"),
          ],
        },
      );
    case "farmer_pension":
      return recommend(
        dl,
        rl,
        "farmer_pension",
        ["old-age-pension", "pm-kisan"],
        {
          hi: "किसानों के लिए अलग पेंशन योजना की जानकारी हमारे कैटलॉग में सत्यापित नहीं है। ये संबंधित सेवाएं उपलब्ध हैं:",
          en: "A dedicated farmer pension is not verified in our catalogue. These related services are available:",
        },
        { topic: "farmer", confidence: 0.6 },
      );
    case "farmer_unknown":
      return recommend(
        dl,
        rl,
        "farmer_overview",
        ["pm-kisan", "farm-equipment-subsidy", "income-certificate"],
        {
          hi: "कोई बात नहीं। किसान परिवारों के लिए ये आम सेवाएं हैं — आप पात्रता जांच से शुरू कर सकते हैं:",
          en: "No problem. These are common services for farmer families — you can start with an eligibility check:",
        },
        { topic: "farmer", confidence: 0.6 },
      );
    case "education_clarify":
      return base(
        dl,
        rl,
        "clarify_education",
        L(
          rl,
          "मैं पढ़ाई से जुड़ी योजनाएं खोजने में मदद करूँगा। बच्चा किस कक्षा में पढ़ता है?",
          "I'll help find education schemes. Which class is the child studying in?",
        ),
        {
          clarification_required: true,
          topic: "education",
          confidence: 0.6,
          follow_up_questions: [
            fu(rl, "edu_school", "कक्षा 1 से 10", "Class 1 to 10"),
            fu(rl, "edu_post_matric", "कक्षा 11–12 या कॉलेज", "Class 11–12 or college"),
            fu(rl, "general_menu", "पता नहीं", "Not sure"),
          ],
        },
      );
    case "edu_post_matric":
      return recommend(
        dl,
        rl,
        "education_post_matric",
        ["scholarship", "income-certificate", "caste-certificate"],
        {
          hi: "कक्षा 10 के बाद की पढ़ाई के लिए छात्रवृत्ति उपयोगी हो सकती है। इसके लिए अक्सर आय और (यदि लागू हो) जाति प्रमाण पत्र चाहिए होते हैं:",
          en: "For studies after Class 10, a scholarship may help. It often needs income and (if applicable) caste certificates:",
        },
        { topic: "education" },
      );
    case "edu_school":
      return recommend(
        dl,
        rl,
        "education_school",
        ["income-certificate", "caste-certificate"],
        {
          hi: "कक्षा 1–10 की छात्रवृत्ति योजनाओं की सत्यापित जानकारी अभी हमारे कैटलॉग में नहीं है — कृपया स्कूल या शिक्षा विभाग से पूछें। ऐसी योजनाओं में अक्सर ये प्रमाण पत्र काम आते हैं:",
          en: "Verified info on Class 1–10 scholarships isn't in our catalogue yet — please ask the school or Education Department. These certificates are often useful:",
        },
        { topic: "education", confidence: 0.55 },
      );
    case "general_menu":
      return base(
        dl,
        rl,
        "clarify_general",
        L(
          rl,
          "मैं मदद के लिए तैयार हूँ। किस तरह की सहायता चाहिए?",
          "Happy to help. What kind of support do you need?",
        ),
        { clarification_required: true, follow_up_questions: menu(rl), confidence: 0.5 },
      );
    default:
      return fallback(rl, dl);
  }
}

function detailWithoutService(dl: DetectedLanguage, rl: ReplyLang): AssistantResponse {
  const popular = SERVICES.filter((x) => x.popular)
    .slice(0, 4)
    .map((x) => x.id);
  return base(
    dl,
    rl,
    "detail_clarify",
    L(
      rl,
      "आप किस सेवा के बारे में पूछ रहे हैं? सेवा चुनें, फिर मैं दस्तावेज, पात्रता, शुल्क और आवेदन के बारे में बता सकता हूँ।",
      "Which service are you asking about? Pick one and I can explain documents, eligibility, fees and how to apply.",
    ),
    {
      clarification_required: true,
      confidence: 0.5,
      follow_up_questions: serviceChips(rl, popular),
    },
  );
}

function fallback(rl: ReplyLang, dl: DetectedLanguage): AssistantResponse {
  return base(
    dl,
    rl,
    "fallback",
    L(
      rl,
      "माफ़ कीजिए, मैं आपकी जरूरत ठीक से नहीं समझ पाया। मैं केवल नमूना सेवा कैटलॉग की जानकारी दे सकता हूँ — आप अपनी जरूरत दूसरे शब्दों में बता सकते हैं, या नीचे से कोई विकल्प चुन सकते हैं। जैसे: “मुझे आय प्रमाण पत्र चाहिए” या “किसान के लिए योजना बताइए”।",
      "Sorry, I couldn't understand your need clearly. I can only answer from the sample service catalogue — try rephrasing, or pick an option below. For example: “I need an income certificate” or “show farmer schemes”.",
    ),
    { clarification_required: true, follow_up_questions: menu(rl), confidence: 0.3 },
  );
}

function menu(rl: ReplyLang): FollowUp[] {
  return [
    fu(rl, "certificate_clarify", "प्रमाण पत्र", "Certificates"),
    fu(rl, "farmer_clarify", "किसान सहायता", "Farmer support"),
    fu(rl, "education_clarify", "पढ़ाई / छात्रवृत्ति", "Education / scholarship"),
    fu(rl, "service:old-age-pension", "पेंशन", "Pension"),
    fu(rl, "service:ayushman-card", "स्वास्थ्य", "Health"),
    fu(rl, "service:employment-registration", "रोज़गार", "Employment"),
  ];
}
