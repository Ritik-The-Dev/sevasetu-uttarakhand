import type { Bi, Service } from "@/data/services";

export type Outcome = "eligible" | "more-info" | "ineligible";
export type EligibilityResult = {
  outcome: Outcome;
  satisfied: Bi[];
  notSatisfied: Bi[];
  missing: Bi[];
  verify: Bi[];
};

/** Deterministic rule engine. The assistant never decides eligibility — only these rules do. */
export function evaluateEligibility(service: Service, answers: Record<string, string>): EligibilityResult {
  const r: EligibilityResult = { outcome: "eligible", satisfied: [], notSatisfied: [], missing: [], verify: [] };
  for (const rule of service.rules) {
    const a = answers[rule.questionId];
    if (!a || a === "unknown") r.missing.push(rule.label);
    else if (rule.pass.includes(a)) r.satisfied.push(rule.label);
    else r.notSatisfied.push(rule.label);
    if (rule.verifyNote) r.verify.push(rule.verifyNote);
  }
  r.outcome = r.notSatisfied.length ? "ineligible" : r.missing.length ? "more-info" : "eligible";
  return r;
}

export function readinessPercent(total: number, available: number) {
  return total === 0 ? 0 : Math.round((available / total) * 100);
}
