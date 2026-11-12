import { describe, expect, it } from "vitest";
import { detectLanguage, respond } from "./assistant";
import { evaluateEligibility, readinessPercent } from "./eligibility";
import { getService, SERVICES } from "@/data/services";

const ui = { uiLang: "hi" as const };
const uiEn = { uiLang: "en" as const };

describe("language detection", () => {
  it("detects Hindi, Hinglish and English", () => {
    expect(detectLanguage("मुझे आय प्रमाण पत्र बनवाना है")).toBe("hi");
    expect(detectLanguage("Mujhe income certificate banana hai")).toBe("hinglish");
    expect(detectLanguage("I want to apply for an income certificate")).toBe("en");
  });
});

describe("assistant", () => {
  it("treats all three income requests as the same service", () => {
    for (const q of [
      "मुझे आय प्रमाण पत्र बनवाना है",
      "Mujhe income certificate banana hai",
      "I want to apply for an income certificate",
    ]) {
      expect(respond(q, { topic: null }, ui).recommended_services).toEqual(["income-certificate"]);
    }
  });

  it("replies in the language the citizen used", () => {
    const hi = respond("मुझे आय प्रमाण पत्र चाहिए", { topic: null }, ui);
    const en = respond("I need an income certificate", { topic: null }, ui);
    const hinglishEn = respond("Mujhe income certificate chahiye", { topic: null }, uiEn);
    expect(hi.reply_language).toBe("hi");
    expect(en.reply_language).toBe("en");
    expect(hinglishEn.reply_language).toBe("en");
  });

  it("asks a clarification for a vague certificate request", () => {
    const r = respond("मुझे एक सर्टिफिकेट चाहिए", { topic: null }, ui);
    expect(r.clarification_required).toBe(true);
    expect(r.topic).toBe("certificate");
    expect(r.follow_up_questions.length).toBeGreaterThan(2);
  });

  it("keeps context: farmer follow-up after certificate", () => {
    const r = respond(
      "मेरे पिताजी किसान हैं और सरकारी योजना के लिए चाहिए",
      { topic: "certificate" },
      ui,
    );
    expect(r.recommended_services).toContain("income-certificate");
  });

  it("honours a tapped follow-up intent without re-classifying", () => {
    const r = respond(
      "मुझे नहीं पता",
      { topic: "certificate" },
      { ...ui, forcedIntent: "service:scholarship" },
    );
    expect(r.recommended_services).toEqual(["scholarship"]);
    expect(r.intent).toBe("find_service");
  });

  it("recognises a plain English farming request", () => {
    const r = respond("I need help for my farm", { topic: null }, uiEn);
    expect(r.intent).toBe("clarify_farmer");
    expect(r.topic).toBe("farmer");
    expect(r.reply_language).toBe("en");
  });

  it("handles the education follow-up path", () => {
    const clarify = respond("मेरे बच्चे की पढ़ाई के लिए योजना है?", { topic: null }, ui);
    expect(clarify.topic).toBe("education");
    const postMatric = respond("11वीं में पढ़ता है", { topic: "education" }, ui);
    expect(postMatric.recommended_services).toContain("scholarship");
  });

  it("refuses OTP / Aadhaar numbers", () => {
    expect(respond("my otp is 1234", { topic: null }, ui).intent).toBe("safety_warning");
    expect(respond("1234 5678 9012", { topic: null }, ui).intent).toBe("safety_warning");
    expect(respond("मेरा पासवर्ड भेज दो", { topic: null }, ui).intent).toBe("safety_warning");
  });

  it("is honest when the catalogue has no verified match", () => {
    const r = respond(
      "बीज और खाद सहायता",
      { topic: "farmer" },
      { ...ui, forcedIntent: "farmer_seeds" },
    );
    expect(r.intent).toBe("no_catalogue_match");
    expect(r.response_text).toMatch(/नहीं गढ़ूंगा|कैटलॉग/);
    expect(r.recommended_services).toEqual([]);
  });

  it("only ever recommends real catalogue IDs and labels sample sources", () => {
    const messages = [
      "मुझे एक सर्टिफिकेट चाहिए",
      "किसानों के लिए योजना",
      "I need a health card",
      "pension chahiye",
      "मुझे समझ नहीं आया",
    ];
    for (const q of messages) {
      const r = respond(q, { topic: null }, ui);
      for (const id of r.recommended_services) expect(getService(id)).toBeDefined();
      if (r.source_references.length) {
        expect(r.source_references[0]).toMatch(/sample catalogue/i);
      }
      expect(r.confidence).toBeGreaterThanOrEqual(0);
      expect(r.confidence).toBeLessThanOrEqual(1);
    }
  });
});

describe("eligibility & catalogue honesty", () => {
  it("no sample service claims verified fees, timelines or official links", () => {
    for (const s of SERVICES) {
      if (s.verificationStatus === "demo") {
        expect(s.fees).toBeNull();
        expect(s.processingTime).toBeNull();
        expect(s.officialSourceUrl).toBeNull();
        expect(s.lastVerifiedAt).toBeNull();
      }
    }
  });

  it("returns the three outcomes", () => {
    const s = getService("income-certificate")!;
    expect(evaluateEligibility(s, { resident: "yes", incomeProof: "yes" }).outcome).toBe(
      "eligible",
    );
    expect(evaluateEligibility(s, { resident: "yes", incomeProof: "unknown" }).outcome).toBe(
      "more-info",
    );
    expect(evaluateEligibility(s, { resident: "no", incomeProof: "yes" }).outcome).toBe(
      "ineligible",
    );
  });

  it("keeps verification notes separate from pass/fail results", () => {
    const s = getService("income-certificate")!;
    const r = evaluateEligibility(s, { resident: "yes", incomeProof: "yes" });
    expect(r.verify.length).toBeGreaterThan(0);
    expect(r.satisfied.length).toBe(2);
  });

  it("readiness is 60% for 3 of 5", () => expect(readinessPercent(5, 3)).toBe(60));
  it("readiness is 0% for an empty checklist", () => expect(readinessPercent(5, 0)).toBe(0));
});
