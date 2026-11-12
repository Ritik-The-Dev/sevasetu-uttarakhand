import { describe, expect, it } from "vitest";
import {
  CATEGORIES,
  DEPARTMENTS,
  DISTRICTS,
  SERVICES,
  getDept,
  getService,
  searchServices,
  type Bi,
} from "./services";

const bilingual = (s: string, where: string) => {
  expect(s.trim(), where).not.toBe("");
};

const checkBi = (b: Bi, where: string) => {
  bilingual(b.hi, `${where}.hi`);
  bilingual(b.en, `${where}.en`);
};

describe("sample catalogue integrity", () => {
  it("has unique service IDs and known departments/categories", () => {
    const ids = SERVICES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
    const categoryIds = new Set(CATEGORIES.map((c) => c.id));
    const departmentIds = new Set(DEPARTMENTS.map((d) => d.id));
    for (const s of SERVICES) {
      expect(categoryIds.has(s.category), s.id).toBe(true);
      expect(departmentIds.has(s.department), s.id).toBe(true);
      expect(getDept(s.department)).toBeDefined();
    }
  });

  it("covers all 13 Uttarakhand districts", () => {
    expect(DISTRICTS).toHaveLength(13);
    expect(new Set(DISTRICTS).size).toBe(13);
  });

  it("has bilingual, non-empty core content for every service", () => {
    for (const s of SERVICES) {
      checkBi(s.name, `${s.id}.name`);
      checkBi(s.description, `${s.id}.description`);
      checkBi(s.purpose, `${s.id}.purpose`);
      checkBi(s.whoCanApply, `${s.id}.whoCanApply`);
      expect(s.keywords.length, `${s.id}.keywords`).toBeGreaterThan(0);
      expect(s.faqs.length, `${s.id}.faqs`).toBeGreaterThan(0);
      for (const f of s.faqs) {
        checkBi(f.q, `${s.id}.faq.q`);
        checkBi(f.a, `${s.id}.faq.a`);
      }
    }
  });

  it("has a coherent eligibility model for every service", () => {
    for (const s of SERVICES) {
      expect(s.questions.length, `${s.id}.questions`).toBeGreaterThan(0);
      expect(s.rules.length, `${s.id}.rules`).toBeGreaterThan(0);
      const questionIds = new Set(s.questions.map((q) => q.id));
      for (const r of s.rules) {
        expect(questionIds.has(r.questionId), `${s.id} rule -> ${r.questionId}`).toBe(true);
        expect(r.pass.length, `${s.id} rule pass`).toBeGreaterThan(0);
        checkBi(r.label, `${s.id}.rule.label`);
        if (r.verifyNote) checkBi(r.verifyNote, `${s.id}.rule.verifyNote`);
      }
      for (const q of s.questions) {
        expect(q.options.length, `${s.id}.${q.id}`).toBeGreaterThan(1);
        const values = q.options.map((o) => o.value);
        expect(new Set(values).size, `${s.id}.${q.id} options`).toBe(values.length);
        for (const o of q.options) checkBi(o.label, `${s.id}.${q.id}.option`);
      }
    }
  });

  it("has a document checklist and 5+ application steps for every service", () => {
    for (const s of SERVICES) {
      expect(s.documents.length, `${s.id}.documents`).toBeGreaterThan(0);
      expect(
        s.documents.some((d) => d.mandatory),
        `${s.id} needs at least one mandatory document`,
      ).toBe(true);
      const documentIds = s.documents.map((d) => d.id);
      expect(new Set(documentIds).size, `${s.id} document IDs`).toBe(documentIds.length);
      for (const d of s.documents) {
        checkBi(d.name, `${s.id}.doc.name`);
        checkBi(d.description, `${s.id}.doc.description`);
      }
      expect(s.steps.length, `${s.id}.steps`).toBeGreaterThanOrEqual(5);
      for (const st of s.steps) {
        checkBi(st.title, `${s.id}.step.title`);
        checkBi(st.description, `${s.id}.step.description`);
      }
    }
  });

  it("never presents unverified fee, timeline or official link data", () => {
    for (const s of SERVICES) {
      if (s.verificationStatus === "demo") {
        expect(s.fees, `${s.id}.fees`).toBeNull();
        expect(s.processingTime, `${s.id}.processingTime`).toBeNull();
        expect(s.officialSourceUrl, `${s.id}.officialSourceUrl`).toBeNull();
        expect(s.lastVerifiedAt, `${s.id}.lastVerifiedAt`).toBeNull();
      }
    }
  });
});

describe("service search", () => {
  it("returns all services for an empty query", () => {
    expect(searchServices("")).toHaveLength(SERVICES.length);
    expect(searchServices("   ")).toHaveLength(SERVICES.length);
  });

  it("finds services by Hindi, Hinglish and English need words", () => {
    expect(searchServices("kheti").map((s) => s.id)).toContain("pm-kisan");
    expect(searchServices("किसान").map((s) => s.id)).toContain("pm-kisan");
    expect(searchServices("farmer").map((s) => s.id)).toContain("pm-kisan");
    expect(searchServices("पढ़ाई").map((s) => s.id)).toContain("scholarship");
    expect(searchServices("scholarship").map((s) => s.id)).toContain("scholarship");
    expect(searchServices("pension").map((s) => s.id)).toContain("old-age-pension");
    expect(searchServices("आय").map((s) => s.id)).toContain("income-certificate");
  });

  it("ranks exact service-name matches at the top", () => {
    expect(searchServices("आय प्रमाण पत्र")[0]?.id).toBe("income-certificate");
    expect(searchServices("PM-KISAN")[0]?.id).toBe("pm-kisan");
  });

  it("returns an empty list instead of inventing matches", () => {
    expect(searchServices("zzzz-not-a-service")).toEqual([]);
    expect(searchServices("अज्ञातनाम")).toEqual([]);
  });
});
