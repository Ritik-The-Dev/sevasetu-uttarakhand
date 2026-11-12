// DEMO assistant engine — deterministic, rule-based. It is NOT a live LLM.
// It mimics the planned pipeline: language detection → intent → clarification →
// catalogue retrieval → structured response. All recommendations come from the
// sample catalogue in src/data/services.ts.
import { getService } from "@/data/services";

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
};

export type ConversationContext = { topic: string | null };

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
  income: /income|आय|इनकम|\baay\b|kamai|कमाई/,
  caste: /caste|jati|jaati|जाति|\bobc\b|\bsc\b|\bst\b/,
  domicile: /domicile|niwas|nivas|निवास|residence|sthayi|स्थायी/,
  birth: /birth|janm|janam|जन्म/,
  ration: /ration|राशन/,
  pension: /pension|पेंशन|old age|वृद्धा|बुढ़ापा|bujurg|बुजुर्ग|senior/,
  health: /ayushman|आयुष्मान|hospital|अस्पताल|ilaj|इलाज|health|स्वास्थ्य|treatment|bimar|बीमार/,
  scholarship: /scholarship|chhatravritti|छात्रवृत्ति|वजीफा/,
  pmkisan: /pm.?kisan|सम्मान निधि|samman nidhi/,
  equipment: /equipment|upkaran|उपकरण|tractor|ट्रैक्टर|yantra|यंत्र|machine/,
  job: /\bjob|naukri|नौकरी|rozgar|रोज़गार|रोजगार|employment|berozgar|बेरोज/,
  women: /pregnan|garbh|गर्भ|maternity|मातृत्व|prasav|प्रसव/,
  farmer: /kisan|किसान|farmer|farm|farming|kheti|खेती|krishi|कृषि|agricultur/,
  education: /padhai|पढ़ाई|पढाई|education|शिक्षा|school|स्कूल|college|कॉलेज|student|छात्र|study/,
  certificate: /certificate|सर्टिफिकेट|praman|प्रमाण/,
  help: /madad|मदद|sahayata|सहायता|help|support|assistance|परिवार|family/,
  scheme: /yojana|योजना|scheme/,
};

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
  const text = `${L(rl, intro.hi, intro.en)}\n\n${names}\n\n${L(rl, "हर सेवा पर पात्रता जांच, दस्तावेज सूची और आवेदन मार्गदर्शिका देख सकते हैं। ध्यान दें: यह नमूना जानकारी है — अंतिम जानकारी आधिकारिक कार्यालय से पुष्टि करें।", "Each service has an eligibility check, document checklist and application guide. Note: this is sample information — confirm details with the official office.")}`;
  return base(dl, rl, intent, text, {
    recommended_services: ids,
    source_references: [SOURCE],
    confidence: 0.85,
    next_actions: ["check_eligibility", "view_checklist", "view_guide"],
    ...extra,
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
  return handle(intent, dl, rl);
}

function classify(text: string, ctx: ConversationContext): string {
  const t = text.toLowerCase();
  if (has(t, P.sensitive)) return "sensitive";
  // Context-aware follow-ups
  if (ctx.topic === "certificate" && (has(t, P.farmer) || has(t, P.scheme)))
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
  return "fallback";
}

function handle(intent: string, dl: DetectedLanguage, rl: ReplyLang): AssistantResponse {
  if (intent.startsWith("service:")) {
    const id = intent.slice(8);
    const s = getService(id)!;
    return recommend(
      dl,
      rl,
      "find_service",
      [id],
      {
        hi: `आपके लिए यह सेवा उपयुक्त लगती है: ${s.name.hi}।`,
        en: `This service looks relevant to you: ${s.name.en}.`,
      },
      { topic: s.category },
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
      return base(
        dl,
        rl,
        "fallback",
        L(
          rl,
          "माफ़ कीजिए, मैं आपकी जरूरत ठीक से नहीं समझ पाया। क्या आप थोड़ा और बता सकते हैं, या नीचे से कोई विकल्प चुन सकते हैं?",
          "Sorry, I couldn't understand your need clearly. Could you tell me a bit more, or pick an option below?",
        ),
        { clarification_required: true, follow_up_questions: menu(rl), confidence: 0.3 },
      );
  }
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
