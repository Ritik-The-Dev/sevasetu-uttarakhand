import { describe, expect, it } from "vitest";
import { detectLanguage, respond } from "./assistant";
import { evaluateEligibility, readinessPercent } from "./eligibility";
import { getService, SERVICES } from "@/data/services";

const ui = { uiLang: "hi" as const };

describe("language detection", () => {
  it("detects Hindi, Hinglish and English", () => {
    expect(detectLanguage("मुझे आय प्रमाण पत्र बनवाना है")).toBe("hi");
    expect(detectLanguage("Mujhe income certificate banana hai")).toBe("hinglish");
    expect(detectLanguage("I want to apply for an income certificate")).toBe("en");
  });
});

describe("assistant", () => {
  it("treats all three income requests as the same service", () => {
    for (const q of ["मुझे आय प्रमाण पत्र बनवाना है", "Mujhe income certificate banana hai", "I want to apply for an income certificate"]) {
      expect(respond(q, { topic: null }, ui).recommended_services).toEqual(["income-certificate"]);
    }
  });
  it("asks a clarification for a vague certificate request", () => {
    const r = respond("मुझे एक सर्टिफिकेट चाहिए", { topic: null }, ui);
    expect(r.clarification_required).toBe(true);
    expect(r.topic).toBe("certificate");
  });
  it("keeps context: farmer follow-up after certificate", () => {
    const r = respond("मेरे पिताजी किसान हैं और सरकारी योजना के लिए चाहिए", { topic: "certificate" }, ui);
    expect(r.recommended_services).toContain("income-certificate");
  });
  it("refuses OTP / Aadhaar numbers", () => {
    expect(respond("my otp is 1234", { topic: null }, ui).intent).toBe("safety_warning");
  });
});

describe("eligibility & catalogue honesty", () => {
  it("no sample service claims verified fees or official links", () => {
    for (const s of SERVICES) if (s.verificationStatus === "demo") {
      expect(s.fees).toBeNull();
      expect(s.officialSourceUrl).toBeNull();
    }
  });
  it("returns the three outcomes", () => {
    const s = getService("income-certificate")!;
    expect(evaluateEligibility(s, { resident: "yes", incomeProof: "yes" }).outcome).toBe("eligible");
    expect(evaluateEligibility(s, { resident: "yes", incomeProof: "unknown" }).outcome).toBe("more-info");
    expect(evaluateEligibility(s, { resident: "no", incomeProof: "yes" }).outcome).toBe("ineligible");
  });
  it("readiness is 60% for 3 of 5", () => expect(readinessPercent(5, 3)).toBe(60));
});
