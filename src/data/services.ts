// SAMPLE CATALOGUE — demonstration data only. Nothing here is officially verified.
// Fees, processing times and official links are intentionally left null until verified
// against an official Uttarakhand / Government of India source.

export type Bi = { hi: string; en: string };
export type VerificationStatus = "verified" | "demo";

export type Category =
  | "certificates" | "agriculture" | "education" | "healthcare" | "welfare"
  | "employment" | "women" | "revenue" | "assistance" | "other";

export const CATEGORIES: { id: Category; label: Bi }[] = [
  { id: "certificates", label: { hi: "प्रमाण पत्र", en: "Certificates" } },
  { id: "agriculture", label: { hi: "कृषि", en: "Agriculture" } },
  { id: "education", label: { hi: "शिक्षा", en: "Education" } },
  { id: "healthcare", label: { hi: "स्वास्थ्य", en: "Healthcare" } },
  { id: "welfare", label: { hi: "समाज कल्याण", en: "Social Welfare" } },
  { id: "employment", label: { hi: "रोज़गार", en: "Employment" } },
  { id: "women", label: { hi: "महिला एवं बाल विकास", en: "Women & Child Development" } },
  { id: "revenue", label: { hi: "राजस्व सेवाएं", en: "Revenue Services" } },
  { id: "assistance", label: { hi: "नागरिक सहायता", en: "Citizen Assistance" } },
  { id: "other", label: { hi: "अन्य सेवाएं", en: "Other Services" } },
];

export const DEPARTMENTS: { id: string; name: Bi }[] = [
  { id: "revenue", name: { hi: "राजस्व विभाग", en: "Revenue Department" } },
  { id: "agriculture", name: { hi: "कृषि विभाग", en: "Agriculture Department" } },
  { id: "social-welfare", name: { hi: "समाज कल्याण विभाग", en: "Social Welfare Department" } },
  { id: "education", name: { hi: "शिक्षा विभाग", en: "Education Department" } },
  { id: "health", name: { hi: "स्वास्थ्य विभाग", en: "Health Department" } },
  { id: "food", name: { hi: "खाद्य एवं नागरिक आपूर्ति विभाग", en: "Food & Civil Supplies Department" } },
  { id: "employment", name: { hi: "सेवायोजन विभाग", en: "Employment Department" } },
  { id: "wcd", name: { hi: "महिला सशक्तिकरण एवं बाल विकास विभाग", en: "Women Empowerment & Child Development Dept." } },
  { id: "local-bodies", name: { hi: "स्थानीय निकाय / पंचायत", en: "Local Bodies / Panchayat" } },
];

export const DISTRICTS = [
  "Almora", "Bageshwar", "Chamoli", "Champawat", "Dehradun", "Haridwar", "Nainital",
  "Pauri Garhwal", "Pithoragarh", "Rudraprayag", "Tehri Garhwal", "Udham Singh Nagar", "Uttarkashi",
];

export type QuestionOption = { value: string; label: Bi };
export type EligibilityQuestion = { id: string; text: Bi; help?: Bi; options: QuestionOption[] };
/** A rule passes when the answer is in `pass`. Answer "unknown" = missing info. */
export type EligibilityRule = { questionId: string; pass: string[]; label: Bi; verifyNote?: Bi };
export type DocumentReq = { id: string; name: Bi; description: Bi; mandatory: boolean };
export type Step = { title: Bi; description: Bi };
export type Faq = { q: Bi; a: Bi };

export type Service = {
  id: string;
  name: Bi;
  department: string;
  category: Category;
  icon: string;
  description: Bi;
  purpose: Bi;
  whoCanApply: Bi;
  keywords: string[];
  questions: EligibilityQuestion[];
  rules: EligibilityRule[];
  documents: DocumentReq[];
  steps: Step[];
  faqs: Faq[];
  fees: Bi | null;
  processingTime: Bi | null;
  officialSourceUrl: string | null;
  verificationStatus: VerificationStatus;
  lastVerifiedAt: string | null;
  popular?: boolean;
};

const YES_NO: QuestionOption[] = [
  { value: "yes", label: { hi: "हाँ", en: "Yes" } },
  { value: "no", label: { hi: "नहीं", en: "No" } },
  { value: "unknown", label: { hi: "पता नहीं", en: "Not sure" } },
];
const yn = (id: string, hi: string, en: string, help?: Bi): EligibilityQuestion => ({ id, text: { hi, en }, help, options: YES_NO });

const residentQ = yn("resident", "क्या आप उत्तराखंड के निवासी हैं?", "Are you a resident of Uttarakhand?");
const residentRule: EligibilityRule = { questionId: "resident", pass: ["yes"], label: { hi: "उत्तराखंड का निवासी", en: "Resident of Uttarakhand" } };

const idDoc: DocumentReq = { id: "id", name: { hi: "पहचान प्रमाण", en: "Identity proof" }, description: { hi: "जैसे आधार कार्ड, मतदाता पहचान पत्र आदि (किसी को अपना आधार नंबर चैट में न बताएं)।", en: "e.g. Aadhaar card, voter ID. Never share your Aadhaar number in chat." }, mandatory: true };
const addrDoc: DocumentReq = { id: "address", name: { hi: "पते का प्रमाण", en: "Address proof" }, description: { hi: "जैसे राशन कार्ड, बिजली बिल या अन्य मान्य दस्तावेज।", en: "e.g. ration card, electricity bill or another accepted document." }, mandatory: true };
const photoDoc: DocumentReq = { id: "photo", name: { hi: "पासपोर्ट साइज फोटो", en: "Passport-size photograph" }, description: { hi: "हाल ही की फोटो।", en: "A recent photograph." }, mandatory: false };
const bankDoc: DocumentReq = { id: "bank", name: { hi: "बैंक खाते का विवरण", en: "Bank account details" }, description: { hi: "पासबुक की प्रति। OTP या पासवर्ड कभी साझा न करें।", en: "Copy of passbook. Never share OTPs or passwords." }, mandatory: true };
const otherDoc: DocumentReq = { id: "other", name: { hi: "विभाग द्वारा मांगे गए अन्य दस्तावेज", en: "Other documents required by the official process" }, description: { hi: "अंतिम सूची संबंधित कार्यालय/पोर्टल से पुष्टि करें।", en: "Confirm the final list with the office or official portal." }, mandatory: false };

const certSteps = (hi: string, en: string): Step[] => [
  { title: { hi: "सेवा की पहचान करें", en: "Identify the service" }, description: { hi: `सुनिश्चित करें कि आपको ${hi} ही चाहिए।`, en: `Confirm that ${en} is what you need.` } },
  { title: { hi: "पात्रता की जांच करें", en: "Check eligibility" }, description: { hi: "SevaSetu की प्रारंभिक पात्रता जांच का उपयोग करें।", en: "Use SevaSetu's preliminary eligibility check." } },
  { title: { hi: "जरूरी दस्तावेज तैयार करें", en: "Prepare documents" }, description: { hi: "दस्तावेज सूची से सभी कागजात इकट्ठा करें।", en: "Gather everything on the document checklist." } },
  { title: { hi: "आधिकारिक माध्यम पर जाएं", en: "Go to the official channel" }, description: { hi: "आधिकारिक पोर्टल, जन सेवा केंद्र (CSC) या तहसील कार्यालय से संपर्क करें।", en: "Use the official portal, a Common Service Centre (CSC) or the tehsil office." } },
  { title: { hi: "आवेदन प्रक्रिया पूरी करें", en: "Complete the application" }, description: { hi: "फॉर्म भरें और दस्तावेज जमा करें। SevaSetu आवेदन जमा नहीं करता।", en: "Fill the form and submit documents. SevaSetu does not submit applications." } },
  { title: { hi: "आवेदन संख्या सुरक्षित रखें", en: "Save your application number" }, description: { hi: "रसीद या आवेदन संख्या लिखकर रखें।", en: "Note down the receipt or application number." } },
  { title: { hi: "स्थिति जांचें", en: "Track the status" }, description: { hi: "उपलब्ध आधिकारिक माध्यम से आवेदन की स्थिति जांचें।", en: "Check status through the available official channel." } },
];

const certFaq: Faq[] = [
  { q: { hi: "क्या SevaSetu से आवेदन जमा हो जाता है?", en: "Does SevaSetu submit my application?" }, a: { hi: "नहीं। SevaSetu केवल जानकारी और मार्गदर्शन देता है। आवेदन आधिकारिक माध्यम से ही करें।", en: "No. SevaSetu only provides guidance. Apply through official channels." } },
  { q: { hi: "शुल्क कितना है?", en: "What is the fee?" }, a: { hi: "शुल्क की जानकारी अभी सत्यापित नहीं है। कृपया आधिकारिक कार्यालय से पुष्टि करें।", en: "Fee information is not yet verified. Please confirm with the official office." } },
];

const demo = { fees: null, processingTime: null, officialSourceUrl: null, verificationStatus: "demo" as const, lastVerifiedAt: null };

export const SERVICES: Service[] = [
  {
    id: "income-certificate", icon: "IndianRupee", category: "certificates", department: "revenue", popular: true,
    name: { hi: "आय प्रमाण पत्र", en: "Income Certificate" },
    description: { hi: "परिवार की वार्षिक आय का प्रमाण, जो कई योजनाओं और छात्रवृत्तियों में काम आता है।", en: "Proof of annual family income, used for many schemes and scholarships." },
    purpose: { hi: "सरकारी योजनाओं, छात्रवृत्ति और रियायतों के लिए आय दिखाना।", en: "To show income for government schemes, scholarships and concessions." },
    whoCanApply: { hi: "सामान्यतः राज्य का कोई भी निवासी (अंतिम शर्तें विभाग तय करता है)।", en: "Generally any resident of the state (final conditions set by the department)." },
    keywords: ["income", "aay", "aay praman", "आय", "इनकम", "salary", "kamai", "कमाई", "certificate"],
    questions: [residentQ, yn("incomeProof", "क्या आपके पास आय से संबंधित कोई सहायक दस्तावेज है?", "Do you have any supporting income document?", { hi: "जैसे वेतन पर्ची, कृषि आय का विवरण, या स्व-घोषणा।", en: "e.g. salary slip, farm income details or self-declaration." })],
    rules: [residentRule, { questionId: "incomeProof", pass: ["yes"], label: { hi: "आय से संबंधित सहायक दस्तावेज", en: "Supporting income document" }, verifyNote: { hi: "आय का सत्यापन राजस्व अधिकारी करेंगे।", en: "Income is verified by revenue officials." } }],
    documents: [idDoc, addrDoc, { id: "income", name: { hi: "आय से संबंधित सहायक दस्तावेज", en: "Income-related supporting documents" }, description: { hi: "वेतन पर्ची, कृषि आय विवरण या स्व-घोषणा पत्र।", en: "Salary slip, farm income details or self-declaration." }, mandatory: true }, photoDoc, otherDoc],
    steps: certSteps("आय प्रमाण पत्र", "an income certificate"), faqs: certFaq, ...demo,
  },
  {
    id: "caste-certificate", icon: "Users", category: "certificates", department: "revenue", popular: true,
    name: { hi: "जाति प्रमाण पत्र", en: "Caste Certificate" },
    description: { hi: "अनुसूचित जाति/जनजाति/अन्य पिछड़ा वर्ग से संबंधित होने का प्रमाण।", en: "Proof of belonging to SC/ST/OBC categories." },
    purpose: { hi: "आरक्षण, छात्रवृत्ति और योजनाओं का लाभ लेने के लिए।", en: "For reservation, scholarships and scheme benefits." },
    whoCanApply: { hi: "अधिसूचित जाति/वर्ग से संबंधित राज्य निवासी।", en: "State residents belonging to a notified caste/category." },
    keywords: ["caste", "jati", "jaati", "जाति", "sc", "st", "obc", "category", "आरक्षण"],
    questions: [residentQ, yn("notified", "क्या आपका परिवार किसी अधिसूचित जाति/वर्ग (SC/ST/OBC) से है?", "Does your family belong to a notified category (SC/ST/OBC)?"), yn("familyProof", "क्या परिवार के किसी सदस्य का पुराना जाति प्रमाण पत्र या रिकॉर्ड है?", "Does a family member have an earlier caste certificate or record?")],
    rules: [residentRule, { questionId: "notified", pass: ["yes"], label: { hi: "अधिसूचित जाति/वर्ग से संबंधित", en: "Belongs to a notified category" } }, { questionId: "familyProof", pass: ["yes"], label: { hi: "परिवार का जाति रिकॉर्ड", en: "Family caste record" }, verifyNote: { hi: "रिकॉर्ड न होने पर स्थानीय जांच हो सकती है।", en: "Without a record, a local enquiry may be needed." } }],
    documents: [idDoc, addrDoc, { id: "family", name: { hi: "परिवार का जाति प्रमाण/रिकॉर्ड", en: "Family caste proof / record" }, description: { hi: "पिता या परिवार के सदस्य का प्रमाण पत्र, यदि उपलब्ध हो।", en: "Certificate of father or a family member, if available." }, mandatory: false }, photoDoc, otherDoc],
    steps: certSteps("जाति प्रमाण पत्र", "a caste certificate"), faqs: certFaq, ...demo,
  },
  {
    id: "domicile-certificate", icon: "Home", category: "certificates", department: "revenue", popular: true,
    name: { hi: "स्थायी निवास प्रमाण पत्र", en: "Domicile / Residence Certificate" },
    description: { hi: "यह प्रमाणित करता है कि आप उत्तराखंड के स्थायी निवासी हैं।", en: "Certifies that you are a permanent resident of Uttarakhand." },
    purpose: { hi: "राज्य की नौकरियों, प्रवेश और योजनाओं के लिए।", en: "For state jobs, admissions and schemes." },
    whoCanApply: { hi: "विभाग द्वारा निर्धारित अवधि से राज्य में रहने वाले व्यक्ति।", en: "People living in the state for the period set by the department." },
    keywords: ["domicile", "residence", "niwas", "nivas", "निवास", "मूल निवास", "sthayi", "स्थायी", "resident"],
    questions: [residentQ, yn("longStay", "क्या आपका परिवार लंबे समय से उत्तराखंड में रह रहा है?", "Has your family lived in Uttarakhand for a long time?", { hi: "आवश्यक अवधि विभाग से पुष्टि करें।", en: "Confirm the required duration with the department." })],
    rules: [residentRule, { questionId: "longStay", pass: ["yes"], label: { hi: "राज्य में निवास अवधि", en: "Duration of residence in the state" }, verifyNote: { hi: "सटीक अवधि की शर्त सत्यापित नहीं है।", en: "The exact duration requirement is not verified." } }],
    documents: [idDoc, addrDoc, { id: "residence", name: { hi: "निवास अवधि का प्रमाण", en: "Proof of residence duration" }, description: { hi: "जैसे पुराने भूमि/मकान रिकॉर्ड, स्कूल रिकॉर्ड।", en: "e.g. old land/house records, school records." }, mandatory: true }, photoDoc, otherDoc],
    steps: certSteps("स्थायी निवास प्रमाण पत्र", "a domicile certificate"), faqs: certFaq, ...demo,
  },
  {
    id: "birth-certificate", icon: "Baby", category: "certificates", department: "local-bodies",
    name: { hi: "जन्म प्रमाण पत्र", en: "Birth Certificate" },
    description: { hi: "जन्म का आधिकारिक पंजीकरण प्रमाण।", en: "Official proof of birth registration." },
    purpose: { hi: "स्कूल प्रवेश, पहचान दस्तावेज और योजनाओं के लिए।", en: "For school admission, identity documents and schemes." },
    whoCanApply: { hi: "बच्चे के माता-पिता या अभिभावक।", en: "Parents or guardian of the child." },
    keywords: ["birth", "janm", "janam", "जन्म", "baby", "bachcha", "बच्चा", "newborn"],
    questions: [yn("bornInState", "क्या जन्म उत्तराखंड में हुआ था?", "Did the birth take place in Uttarakhand?"), yn("hospitalRecord", "क्या अस्पताल का डिस्चार्ज या जन्म रिकॉर्ड उपलब्ध है?", "Is a hospital discharge or birth record available?")],
    rules: [{ questionId: "bornInState", pass: ["yes"], label: { hi: "जन्म उत्तराखंड में", en: "Birth in Uttarakhand" }, verifyNote: { hi: "जन्म जहाँ हुआ, वहीं पंजीकरण होता है।", en: "Registration happens where the birth occurred." } }, { questionId: "hospitalRecord", pass: ["yes"], label: { hi: "जन्म का रिकॉर्ड", en: "Birth record" } }],
    documents: [{ id: "hospital", name: { hi: "अस्पताल डिस्चार्ज/जन्म रिकॉर्ड", en: "Hospital discharge / birth record" }, description: { hi: "जन्म स्थान का प्रमाण।", en: "Proof of place of birth." }, mandatory: true }, { ...idDoc, name: { hi: "माता-पिता का पहचान प्रमाण", en: "Parents' identity proof" } }, addrDoc, otherDoc],
    steps: certSteps("जन्म प्रमाण पत्र", "a birth certificate"), faqs: certFaq, ...demo,
  },
  {
    id: "pm-kisan", icon: "Sprout", category: "agriculture", department: "agriculture", popular: true,
    name: { hi: "पीएम-किसान सम्मान निधि", en: "PM-KISAN Samman Nidhi" },
    description: { hi: "पात्र किसान परिवारों को आय सहायता देने वाली केंद्र सरकार की योजना।", en: "Central government scheme providing income support to eligible farmer families." },
    purpose: { hi: "खेती से जुड़े खर्चों में किसान परिवारों की सहायता।", en: "To support farmer families with farming expenses." },
    whoCanApply: { hi: "खेती योग्य भूमि वाले किसान परिवार (कुछ श्रेणियां बाहर हैं)।", en: "Farmer families with cultivable land (some categories excluded)." },
    keywords: ["kisan", "किसान", "farmer", "kheti", "खेती", "pm kisan", "agriculture", "krishi", "कृषि", "aarthik", "आर्थिक"],
    questions: [yn("ownsLand", "क्या परिवार के नाम पर खेती योग्य भूमि है?", "Does the family own cultivable land in its name?"), yn("taxpayer", "क्या परिवार में कोई आयकर दाता या सरकारी कर्मचारी है?", "Is anyone in the family an income-tax payer or government employee?", { hi: "ऐसी श्रेणियां आमतौर पर बाहर रखी जाती हैं — आधिकारिक दिशानिर्देश देखें।", en: "Such categories are usually excluded — check official guidelines." }), yn("bankLinked", "क्या आपका बैंक खाता चालू है?", "Do you have an active bank account?")],
    rules: [{ questionId: "ownsLand", pass: ["yes"], label: { hi: "खेती योग्य भूमि का स्वामित्व", en: "Owns cultivable land" } }, { questionId: "taxpayer", pass: ["no"], label: { hi: "बहिष्कृत श्रेणी में नहीं", en: "Not in an excluded category" } }, { questionId: "bankLinked", pass: ["yes"], label: { hi: "सक्रिय बैंक खाता", en: "Active bank account" } }],
    documents: [idDoc, { id: "land", name: { hi: "भूमि रिकॉर्ड (खतौनी)", en: "Land records (Khatauni)" }, description: { hi: "भूमि स्वामित्व का प्रमाण।", en: "Proof of land ownership." }, mandatory: true }, bankDoc, otherDoc],
    steps: certSteps("यह योजना", "this scheme"), faqs: certFaq, ...demo,
  },
  {
    id: "farm-equipment-subsidy", icon: "Tractor", category: "agriculture", department: "agriculture",
    name: { hi: "कृषि उपकरण सब्सिडी (नमूना)", en: "Farm Equipment Subsidy (sample)" },
    description: { hi: "कृषि यंत्रों की खरीद पर सहायता से संबंधित योजनाओं का नमूना विवरण।", en: "Sample entry for schemes that support purchase of farm machinery." },
    purpose: { hi: "खेती के उपकरण खरीदने में आर्थिक सहायता।", en: "Financial help to buy farm equipment." },
    whoCanApply: { hi: "पंजीकृत किसान — सटीक योजना और शर्तें कृषि विभाग से पुष्टि करें।", en: "Registered farmers — confirm the exact scheme and conditions with the Agriculture Department." },
    keywords: ["upkaran", "उपकरण", "tractor", "ट्रैक्टर", "machine", "yantra", "यंत्र", "subsidy", "सब्सिडी", "equipment"],
    questions: [yn("farmer", "क्या आप पंजीकृत किसान हैं?", "Are you a registered farmer?"), residentQ],
    rules: [{ questionId: "farmer", pass: ["yes"], label: { hi: "पंजीकृत किसान", en: "Registered farmer" } }, residentRule],
    documents: [idDoc, { id: "land", name: { hi: "भूमि रिकॉर्ड", en: "Land records" }, description: { hi: "भूमि स्वामित्व का प्रमाण।", en: "Proof of land ownership." }, mandatory: true }, bankDoc, { id: "quote", name: { hi: "उपकरण का कोटेशन", en: "Equipment quotation" }, description: { hi: "यदि विभाग मांगे।", en: "If requested by the department." }, mandatory: false }, otherDoc],
    steps: certSteps("यह सहायता", "this support"), faqs: certFaq, ...demo,
  },
  {
    id: "scholarship", icon: "GraduationCap", category: "education", department: "social-welfare", popular: true,
    name: { hi: "छात्रवृत्ति (पोस्ट-मैट्रिक)", en: "Post-Matric Scholarship" },
    description: { hi: "कक्षा 10 के बाद पढ़ रहे पात्र विद्यार्थियों के लिए छात्रवृत्ति।", en: "Scholarship for eligible students studying after Class 10." },
    purpose: { hi: "उच्च शिक्षा का खर्च कम करना।", en: "To reduce the cost of higher education." },
    whoCanApply: { hi: "मान्यता प्राप्त संस्थान में पढ़ने वाले पात्र श्रेणी के विद्यार्थी।", en: "Students of eligible categories in recognised institutions." },
    keywords: ["scholarship", "chhatravritti", "छात्रवृत्ति", "padhai", "पढ़ाई", "student", "college", "school", "education", "shiksha", "शिक्षा", "bachche"],
    questions: [yn("postMatric", "क्या विद्यार्थी कक्षा 10 के बाद (11वीं, 12वीं, कॉलेज) पढ़ रहा है?", "Is the student studying after Class 10 (11th, 12th, college)?"), yn("recognised", "क्या संस्थान मान्यता प्राप्त है?", "Is the institution recognised?"), yn("incomeCert", "क्या परिवार का आय प्रमाण पत्र उपलब्ध है?", "Is a family income certificate available?", { hi: "आय सीमा सत्यापित नहीं है।", en: "The income limit is not verified." })],
    rules: [{ questionId: "postMatric", pass: ["yes"], label: { hi: "पोस्ट-मैट्रिक स्तर", en: "Post-matric level" } }, { questionId: "recognised", pass: ["yes"], label: { hi: "मान्यता प्राप्त संस्थान", en: "Recognised institution" } }, { questionId: "incomeCert", pass: ["yes"], label: { hi: "आय प्रमाण पत्र", en: "Income certificate" }, verifyNote: { hi: "आय सीमा विभाग द्वारा जांची जाएगी।", en: "The income limit will be checked by the department." } }],
    documents: [idDoc, { id: "marksheet", name: { hi: "पिछली कक्षा की मार्कशीट", en: "Previous marksheet" }, description: { hi: "अंतिम परीक्षा की अंकतालिका।", en: "Marksheet of last exam." }, mandatory: true }, { id: "income", name: { hi: "आय प्रमाण पत्र", en: "Income certificate" }, description: { hi: "परिवार की आय का प्रमाण।", en: "Proof of family income." }, mandatory: true }, { id: "admission", name: { hi: "प्रवेश/फीस रसीद", en: "Admission / fee receipt" }, description: { hi: "वर्तमान संस्थान से।", en: "From current institution." }, mandatory: true }, bankDoc, otherDoc],
    steps: certSteps("छात्रवृत्ति", "the scholarship"), faqs: certFaq, ...demo,
  },
  {
    id: "old-age-pension", icon: "HeartHandshake", category: "welfare", department: "social-welfare", popular: true,
    name: { hi: "वृद्धावस्था पेंशन", en: "Old Age Pension" },
    description: { hi: "पात्र वरिष्ठ नागरिकों के लिए मासिक पेंशन सहायता।", en: "Monthly pension support for eligible senior citizens." },
    purpose: { hi: "बुजुर्गों को आर्थिक सुरक्षा।", en: "Financial security for the elderly." },
    whoCanApply: { hi: "निर्धारित आयु और आय शर्तें पूरी करने वाले वरिष्ठ नागरिक।", en: "Senior citizens meeting the set age and income conditions." },
    keywords: ["pension", "पेंशन", "old", "budhapa", "बुढ़ापा", "वृद्धा", "senior", "bujurg", "बुजुर्ग", "elderly"],
    questions: [residentQ, yn("age60", "क्या आवेदक की आयु 60 वर्ष या उससे अधिक है?", "Is the applicant aged 60 or above?", { hi: "आयु सीमा का नमूना — आधिकारिक रूप से पुष्टि करें।", en: "Sample age threshold — confirm officially." }), yn("otherPension", "क्या आवेदक को पहले से कोई सरकारी पेंशन मिल रही है?", "Does the applicant already receive a government pension?")],
    rules: [residentRule, { questionId: "age60", pass: ["yes"], label: { hi: "आयु शर्त", en: "Age condition" } }, { questionId: "otherPension", pass: ["no"], label: { hi: "अन्य सरकारी पेंशन नहीं", en: "No other government pension" } }],
    documents: [idDoc, { id: "age", name: { hi: "आयु प्रमाण", en: "Age proof" }, description: { hi: "जन्म तिथि दर्शाने वाला दस्तावेज।", en: "Document showing date of birth." }, mandatory: true }, { id: "income", name: { hi: "आय प्रमाण पत्र", en: "Income certificate" }, description: { hi: "यदि विभाग मांगे।", en: "If required by the department." }, mandatory: true }, bankDoc, photoDoc, otherDoc],
    steps: certSteps("पेंशन", "the pension"), faqs: certFaq, ...demo,
  },
  {
    id: "ayushman-card", icon: "Stethoscope", category: "healthcare", department: "health",
    name: { hi: "आयुष्मान / स्वास्थ्य बीमा कार्ड", en: "Ayushman Health Card" },
    description: { hi: "सूचीबद्ध अस्पतालों में इलाज के लिए स्वास्थ्य सुरक्षा कार्ड।", en: "Health coverage card for treatment at empanelled hospitals." },
    purpose: { hi: "इलाज का खर्च कम करना।", en: "To reduce treatment costs." },
    whoCanApply: { hi: "योजना की सूची/शर्तों में शामिल परिवार।", en: "Families covered under the scheme's lists/conditions." },
    keywords: ["ayushman", "आयुष्मान", "health", "swasthya", "स्वास्थ्य", "hospital", "अस्पताल", "ilaj", "इलाज", "bimar", "बीमार", "treatment"],
    questions: [residentQ, yn("rationCard", "क्या परिवार का राशन कार्ड है?", "Does the family have a ration card?")],
    rules: [residentRule, { questionId: "rationCard", pass: ["yes"], label: { hi: "परिवार का राशन कार्ड", en: "Family ration card" }, verifyNote: { hi: "परिवार की पात्रता सूची से जांची जाएगी।", en: "Family eligibility is checked against official lists." } }],
    documents: [idDoc, { id: "ration", name: { hi: "राशन कार्ड", en: "Ration card" }, description: { hi: "परिवार का विवरण।", en: "Family details." }, mandatory: true }, otherDoc],
    steps: certSteps("स्वास्थ्य कार्ड", "the health card"), faqs: certFaq, ...demo,
  },
  {
    id: "ration-card", icon: "Wheat", category: "assistance", department: "food",
    name: { hi: "राशन कार्ड", en: "Ration Card" },
    description: { hi: "रियायती दर पर खाद्यान्न प्राप्त करने के लिए परिवार कार्ड।", en: "Family card for subsidised food grains." },
    purpose: { hi: "खाद्य सुरक्षा और पहचान।", en: "Food security and identification." },
    whoCanApply: { hi: "राज्य के परिवार, श्रेणी शर्तों के अनुसार।", en: "State households, according to category conditions." },
    keywords: ["ration", "राशन", "anaj", "अनाज", "food", "khadya", "खाद्य", "gehu", "chawal"],
    questions: [residentQ, yn("noCard", "क्या परिवार के पास पहले से कोई राशन कार्ड नहीं है?", "Is it true that the family has no existing ration card?")],
    rules: [residentRule, { questionId: "noCard", pass: ["yes"], label: { hi: "कोई मौजूदा कार्ड नहीं", en: "No existing card" } }],
    documents: [idDoc, addrDoc, { id: "family", name: { hi: "परिवार के सदस्यों का विवरण", en: "Family member details" }, description: { hi: "सभी सदस्यों के पहचान दस्तावेज।", en: "Identity documents of all members." }, mandatory: true }, photoDoc, otherDoc],
    steps: certSteps("राशन कार्ड", "a ration card"), faqs: certFaq, ...demo,
  },
  {
    id: "employment-registration", icon: "Briefcase", category: "employment", department: "employment",
    name: { hi: "सेवायोजन (रोज़गार) पंजीकरण", en: "Employment Exchange Registration" },
    description: { hi: "नौकरी के अवसरों की जानकारी के लिए रोजगार कार्यालय में पंजीकरण।", en: "Registration with the employment office for job opportunities." },
    purpose: { hi: "रोज़गार के अवसरों और मेलों की जानकारी।", en: "Information on job openings and job fairs." },
    whoCanApply: { hi: "रोज़गार खोज रहे राज्य के निवासी।", en: "State residents seeking employment." },
    keywords: ["job", "naukri", "नौकरी", "rozgar", "रोज़गार", "रोजगार", "employment", "kaam", "काम", "berozgar"],
    questions: [residentQ, yn("age18", "क्या आपकी आयु 18 वर्ष या अधिक है?", "Are you 18 or older?")],
    rules: [residentRule, { questionId: "age18", pass: ["yes"], label: { hi: "न्यूनतम आयु", en: "Minimum age" } }],
    documents: [idDoc, addrDoc, { id: "edu", name: { hi: "शैक्षिक प्रमाण पत्र", en: "Educational certificates" }, description: { hi: "सभी योग्यता प्रमाण।", en: "All qualification certificates." }, mandatory: true }, photoDoc, otherDoc],
    steps: certSteps("पंजीकरण", "the registration"), faqs: certFaq, ...demo,
  },
  {
    id: "maternity-support", icon: "HeartPulse", category: "women", department: "wcd",
    name: { hi: "मातृत्व सहायता योजना (PMMVY)", en: "Maternity Benefit (PMMVY)" },
    description: { hi: "गर्भवती और स्तनपान कराने वाली पात्र महिलाओं के लिए सहायता।", en: "Support for eligible pregnant and lactating women." },
    purpose: { hi: "मां और बच्चे के पोषण व स्वास्थ्य के लिए।", en: "For nutrition and health of mother and child." },
    whoCanApply: { hi: "योजना शर्तें पूरी करने वाली गर्भवती महिलाएं।", en: "Pregnant women meeting scheme conditions." },
    keywords: ["pregnant", "garbhvati", "गर्भवती", "mahila", "महिला", "women", "maternity", "matritva", "मातृत्व", "anganwadi", "आंगनवाड़ी"],
    questions: [yn("pregnant", "क्या आवेदक गर्भवती है या हाल ही में प्रसव हुआ है?", "Is the applicant pregnant or recently delivered?"), yn("anganwadi", "क्या आंगनवाड़ी/स्वास्थ्य केंद्र में पंजीकरण हुआ है?", "Is she registered at an Anganwadi/health centre?")],
    rules: [{ questionId: "pregnant", pass: ["yes"], label: { hi: "गर्भावस्था/प्रसव", en: "Pregnancy/delivery" } }, { questionId: "anganwadi", pass: ["yes"], label: { hi: "आंगनवाड़ी पंजीकरण", en: "Anganwadi registration" } }],
    documents: [idDoc, { id: "mcp", name: { hi: "मातृ-शिशु सुरक्षा (MCP) कार्ड", en: "Mother & Child Protection (MCP) card" }, description: { hi: "स्वास्थ्य केंद्र से।", en: "From the health centre." }, mandatory: true }, bankDoc, otherDoc],
    steps: certSteps("मातृत्व सहायता", "maternity support"), faqs: certFaq, ...demo,
  },
];

export const getService = (id: string) => SERVICES.find((s) => s.id === id);
export const getDept = (id: string) => DEPARTMENTS.find((d) => d.id === id);
export const getCategory = (id: string) => CATEGORIES.find((c) => c.id === id);

/** Simple keyword retrieval over the catalogue (stand-in for DB full-text search). */
export function searchServices(query: string): Service[] {
  const q = query.toLowerCase().trim();
  if (!q) return SERVICES;
  const tokens = q.split(/[\s,.?!।]+/).filter((t) => t.length > 1);
  const scored = SERVICES.map((s) => {
    const hay = [s.name.hi, s.name.en, s.description.hi, s.description.en, getDept(s.department)?.name.en ?? "", getDept(s.department)?.name.hi ?? "", ...s.keywords].join(" ").toLowerCase();
    let score = 0;
    if (hay.includes(q)) score += 5;
    for (const t of tokens) if (hay.includes(t)) score += 1;
    for (const k of s.keywords) if (q.includes(k.toLowerCase())) score += 2;
    return { s, score };
  }).filter((x) => x.score > 0);
  return scored.sort((a, b) => b.score - a.score).map((x) => x.s);
}
