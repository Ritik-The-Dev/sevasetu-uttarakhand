# SevaSetu Uttarakhand

**सरकारी सेवाएं, अब आपकी भाषा में।**  
A Hindi-first, voice-enabled citizen service navigator prototype built for **PRAYAS 2026 – ITDA Uttarakhand Hackathon**.

> **Important:** This is a hackathon prototype, not an official government website. All service information is **sample demo data** and is not officially verified. The assistant is a **rule-based demo**, not a live AI or government integration. SevaSetu never submits applications and never asks for Aadhaar numbers, OTPs, passwords or bank details.

---

## What it does

SevaSetu helps a citizen describe a need in their own words — Hindi, Hinglish or English — and then:

1. Detects the language and intent.
2. Asks simple clarifying questions when the request is incomplete.
3. Suggests relevant services **only from the local sample catalogue**.
4. Shows a preliminary eligibility check using fixed rules.
5. Builds a document-readiness checklist with saved progress.
6. Walks through a step-by-step application guide.
7. Points to official channels (CSC, tehsil office, official portal) instead of inventing links.

The experience includes real browser speech recognition and speech synthesis where the
browser supports it (typically Chrome/Edge), with a text fallback everywhere.

---

## Feature tour

| Area                   | What is included                                                                                                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Landing page**       | Hero, voice entry point, example requests, popular services, how it works, AI assistance, voice accessibility, citizen groups, trust section, final CTA                              |
| **Service discovery**  | Need-based keyword search, category and department filters, sorting, popular/recent services, shareable category URLs, empty state and reset                                         |
| **Service detail**     | Bilingual service overview, FAQs, fees/timeline honesty handling, official-channel guidance, deep-linkable tabs for eligibility, documents and guide                                 |
| **AI assistant**       | Rule-based multilingual replies, context retention, clarification options, structured service cards, mobile history sheet, retry/error state, voice input/output and safety warnings |
| **Eligibility check**  | Service-specific questions, three outcomes (eligible / more information / ineligible), satisfied and missing conditions, verification notes and next steps                           |
| **Document checklist** | Mandatory/optional documents, progress percentage, “mark all”, clear, print, and device-local persistence                                                                            |
| **Application guide**  | Seven-step visual guide, per-step completion, progress bar, official-channel warning, print support                                                                                  |
| **Dashboard**          | Saved services, recently viewed services, resumable conversations, saved checklist progress, language/accessibility settings and demo reset                                          |
| **Accessibility**      | Large text, high contrast, simple language mode, skip link, keyboard focus, ARIA labels/status regions, reduced-motion support and print styles                                      |
| **Static pages**       | “How it works” pipeline and safety limits; “About & disclaimer” with privacy, limitations and production roadmap                                                                     |

---

## Quick start

Requirements: **Node.js 20+** and npm.

```sh
npm install
npm run dev
```

Open the URL printed by Vite (usually `http://localhost:8080`).

```sh
npm test          # run the test suite
npx tsc --noEmit  # type-check
npm run build     # production build
npm run lint      # ESLint + Prettier
```

---

## 60-second demo script

1. Open the home page and tap the mic (or type **“मुझे एक सर्टिफिकेट चाहिए।”**).
2. The assistant asks which certificate; choose **आय प्रमाण पत्र**.
3. Open the suggested service card.
4. Go to **पात्रता** and answer the two questions.
5. Review the preliminary result and suggested next steps.
6. Open **दस्तावेज** and tick the documents you have — progress is saved on the device.
7. Open **आवेदन गाइड** and mark steps complete.
8. Open **डैशबोर्ड** to see the saved service, checklist progress and resumable conversation.
9. Switch to **EN** in the header to show bilingual UI, or use the accessibility menu for large text / high contrast.

The dashboard also has **“इस डिवाइस का डेमो डेटा साफ़ करें”** so the demo can be reset before a presentation.

---

## Honest demo rules

These rules are implemented in code and enforced by tests:

- Fees, processing times, official links and `lastVerifiedAt` are **`null`** for every sample service.
- The UI explicitly labels sample data as **नमूना जानकारी / Sample data** and the global banner states that this is a demo.
- If no verified official service link exists, the UI shows **CSC / tehsil / official portal guidance** and says that no link is shown.
- The assistant only recommends IDs present in `src/data/services.ts`; it never invents a scheme or service.
- Eligibility is decided by the deterministic rule engine in `src/lib/eligibility.ts` — never by the assistant.
- A preliminary eligibility result is clearly separated from official approval.
- The assistant refuses to accept OTPs, Aadhaar numbers, passwords and bank credentials, and warns the citizen.
- No claim is made that an application was submitted or that a government database was accessed.

---

## Architecture

```
src/
  routes/                 TanStack Router pages
    index.tsx             Landing page
    assistant.tsx         Voice/text assistant demo
    services.tsx          Search + filters + recently viewed
    services.$id.tsx      Overview / eligibility / checklist / guide tabs
    dashboard.tsx         Saved data and progress
    how-it-works.tsx      Pipeline, voice mechanics and safety limits
    about.tsx             Disclaimer, privacy, limitations and roadmap
  data/services.ts        Sample catalogue, eligibility questions, documents, steps, FAQs
  lib/assistant.ts        Deterministic multilingual assistant engine
  lib/eligibility.ts      Rule-based eligibility evaluation
  lib/speech.ts           Web Speech API wrappers
  lib/storage.ts          Device-local storage helpers
  lib/prefs.tsx           Language, text size, contrast, simple-language preferences
  components/seva/        Header, footer, cards, voice hook, accessibility controls
  components/ui/          shadcn/ui primitives
  styles.css              Tailwind theme, high contrast, reduced motion, print styles
```

### Assistant pipeline (demo implementation)

```
message → language detection → intent classification
        → clarification or catalogue retrieval
        → structured response (language, intent, services, source, confidence, actions)
```

The same structure is designed to accept a live multilingual LLM later. In this demo the
engine is deterministic and makes **no external AI calls**.

### Persistence

All demo data is stored in the browser under `sevasetu.*` keys:

| Key                       | Contents                                        |
| ------------------------- | ----------------------------------------------- |
| `sevasetu.conversations`  | Conversations and simulated assistant responses |
| `sevasetu.saved`          | Saved service IDs                               |
| `sevasetu.recent`         | Recently viewed service IDs                     |
| `sevasetu.checklist.<id>` | Available document IDs for a service            |
| `sevasetu.guide.<id>`     | Completed guide-step indices                    |
| `sevasetu.prefs`          | Language and accessibility preferences          |

No account or server is required. Data never leaves the device in this prototype.

---

## Voice support

- **Input:** `SpeechRecognition` / `webkitSpeechRecognition`, preferring `hi-IN`, with `en-IN` when the reply language is English.
- The recognised sentence is placed in the input so the citizen can **edit it before sending**.
- **Output:** `speechSynthesis` with Hindi/English voice selection, plus pause, resume and stop controls.
- Unsupported browsers still get a fully usable text experience; the UI explains the limitation.
- The page respects `prefers-reduced-motion`.

---

## Testing

```sh
npm test
```

Current coverage includes:

- Catalogue integrity: unique IDs, bilingual content, coherent eligibility rules, required documents, five+ guide steps.
- Honesty checks: no demo service claims verified fees, timelines or official links.
- Search across Hindi, Hinglish and English, including ranking and no-match behaviour.
- Assistant language detection, reply language, context retention, forced follow-up intents, education/farmer paths and safety refusals.
- All three eligibility outcomes and checklist readiness percentages.
- Route matching for the home page.

`npx tsc --noEmit` and `npm run build` are expected to pass alongside the tests.

---

## Production roadmap

This prototype intentionally stops short of pretending to be production infrastructure.

1. **Verified data**
   - Replace the sample catalogue with a reviewed dataset.
   - Record source URL, verification date and reviewer for every service.
   - Keep fees/timelines/official links hidden until verified.
2. **Supabase backend**
   - PostgreSQL tables for departments, services, eligibility questions/rules, required documents, conversations, messages, saved services and checklists.
   - Row Level Security so users can only access their own conversations and saved data.
   - Edge Functions for server-side LLM calls and rate limiting.
   - Authentication only where necessary; anonymous exploration remains available.
3. **Live multilingual AI**
   - Replace the rule-based demo only after adding grounded retrieval, structured output validation, moderation and a strict “no invented schemes/links” policy.
   - Keep eligibility calculations deterministic and separate from the LLM.
4. **More languages**
   - Add Garhwali and Kumaoni only after community review and quality validation.
5. **Field validation**
   - Test with CSC operators, ASHA/Anganwadi workers, senior citizens and low-literacy users.
   - Validate keyboard, screen-reader, voice and low-bandwidth behaviour on real devices.
6. **Accessibility audit**
   - Run Lighthouse/axe checks, keyboard-only walkthroughs and screen-reader testing before any public pilot.

---

## Known limitations

- Service data is sample data and may be incomplete or out of date.
- No live AI, no government API, no application submission.
- Local browser storage means data is per-device; clearing browser data removes it.
- Speech recognition and synthesis depend on browser support, permissions and installed voices.
- The dashboard reset is intentionally destructive for demo purposes.
- Garhwali and Kumaoni are not included yet.

---

## Credits

Built as a prototype for **PRAYAS 2026 – ITDA Uttarakhand Hackathon**.  
Interface: React, TypeScript, Vite, TanStack Router/Start, Tailwind CSS and shadcn/ui.  
This project was initially scaffolded with [Lovable](https://lovable.dev).
