# Smriti: Healthcare Continuity Platform, Product Requirements Document

*Hackathon Software Track 2 | Version 1.1 | October 2026 | Project name: Smriti | Tagline: Your health, remembered.*

## 1. Overview

**One-line summary:** Smriti (Hindi and Marathi for "memory") is a patient-owned platform that brings medical records from every hospital and clinic into one simple timeline, explains reports in the patient's own language, and lets patients share a time-limited summary with any doctor.

**Positioning:** India's ABHA/ABDM system already provides a health ID and consent-based record linking. Smriti complements it. ABHA is the identity layer; Smriti is the friendly, patient-facing layer on top: understandable, multilingual and easy to share.

## 2. Problem Statement

Patients' medical records are fragmented across hospitals and clinics, which makes it hard to maintain a complete medical history. Consequences:

- Doctors see only a partial history and may repeat tests or miss allergies and past conditions.
- Patients cannot read or understand their own reports, especially in English-heavy medical language.
- In emergencies, critical information (allergies, medicines, blood group) is not available quickly.
- Elderly and non-English-speaking users are poorly served by existing apps.

## 3. Goals and Non-Goals

### Goals

1. Give every patient one unified, searchable medical history across providers.
2. Make reports understandable through AI explanations in English, Hindi and Marathi.
3. Make sharing with doctors fast, consented, time-limited and revocable.
4. Provide instant emergency information without login.
5. Be usable by all ages through a simple layout, big text, and voice support.
6. Deliver a working, polished end-to-end demo within hackathon time.

### Non-Goals (for this version)

- Replacing ABHA/ABDM or claiming to be the national record system.
- Real ABDM API integration (mocked in the prototype).
- Appointment booking, teleconsultation, pharmacy or payments.
- Diagnosis, treatment advice or any clinical decision-making by AI.
- Hospital-side EMR integration.

## 4. Target Users

| Persona | Description | Key need |
|---|---|---|
| **Patient (primary)** | Any age; includes elderly and Hindi/Marathi speakers with low tech comfort | Keep all records in one place and understand them |
| **Caregiver / family member** | Manages a parent's or child's records | Access records on behalf of someone else (stretch) |
| **Doctor** | Sees the patient for a short consult | A one-page summary instead of dozens of PDFs |
| **Emergency responder** | Paramedic or ER staff with no login | Allergies, medicines and blood group in seconds |

### Example scenario (used in the demo)

Mrs. Sharma, 62, from Maharashtra, has diabetes. She has records from three hospitals over two years. She opens Smriti in Marathi, sees her full history in one timeline, taps a lab report to get a simple Marathi explanation with abnormal values flagged, and shares a 24-hour summary link with a new doctor.

## 5. Competitive Context and Differentiation

| Existing solution | What it does well | Gap Smriti addresses |
|---|---|---|
| ABHA / ABDM | National health ID, cross-provider linking, consent framework | Records stay with providers; not a patient-friendly reading and understanding layer |
| Eka Care | Patient records app, ABHA creation, multilingual | Verify: plain-language explanation and trend features |
| Practo | Doctor discovery, booking, consultations | Centred on booking rather than the patient's own continuous history |
| Apollo 24/7 | Consultations, diagnostics, pharmacy | Tied to the Apollo ecosystem; commerce-first |

**Our differentiators** (proposed, not claims that no one else has them):

- AI report simplifier in Hindi and Marathi (hero feature)
- Unified cross-hospital timeline in a simple, all-age layout
- Trend charts across reports
- Emergency QR with no login
- 24-hour doctor summary link
- Visible "who accessed my data" log
- Multilingual voice assistant

*Note: competitor features marked "Verify" must be checked before the pitch.*

## 6. Scope and Prioritisation

### P0: Must have (MVP)

1. Registration and login
2. Dashboard
3. Upload medical records with metadata and duplicate detection
4. Unified medical timeline
5. Prescriptions and medicines
6. Health profile (allergies, conditions, blood group)
7. AI report simplifier
8. Doctor sharing with expiry and revocation
9. Emergency QR
10. Access log and consent screen
11. Multilingual UI (English, Hindi, Marathi)
12. Simple, all-age layout and Simple Mode

### P1: Should have

13. Trend charts across reports
14. Medicine and follow-up reminders
15. Search and filters (advanced)

### P2: Stretch

16. Multilingual voice assistant
17. Family profiles
18. Allergy and interaction warning on new prescriptions
19. PDF export of full history
20. PWA / offline support, dark mode, vaccination tracker

## 7. Functional Requirements

### 7.1 Registration and Login (P0)

- Sign up with name, phone or email, and password; login with the same credentials.
- Optional ABHA ID field (14 digits). Prototype accepts the number and shows a "linked" badge without a real API call.
- Language selection on first screen.

**Acceptance criteria:** A new user can register and reach the dashboard in under 60 seconds. Passwords are hashed. Sessions use JWT.

### 7.2 Dashboard (P0)

- Overview of the 5 most recent timeline entries with a "View full history" button.
- Active medicines, allergies, upcoming reminders and quick actions (Upload, Share, Emergency Card).

### 7.3 Upload Medical Records (P0)

- Accept PDF and JPG.
- Required metadata: date, hospital or clinic, doctor name, category (Lab report, Prescription, Scan, Discharge summary, Vaccination, Other).
- **Duplicate detection:** warn if the file hash matches, or if date + hospital + category match an existing record. User can cancel or upload anyway.

**Acceptance criteria:** A first record can be uploaded in 3 taps or fewer from Simple Mode. Duplicate warning appears before saving.

### 7.4 Unified Medical Timeline (P0, core feature)

One page showing the patient's full history from the earliest record to today, across all hospitals.

- Vertical timeline, newest first, with an oldest-first toggle.
- Grouped by year and month with sticky headers.
- Each card shows: date, hospital and doctor, category icon and label, a one-line plain-language summary in the user's language, a colour-coded hospital tag, and a warning badge for abnormal values.
- Tap to expand: full details, original file preview, "Explain this report" and "Share this" buttons.
- Filter chips: All, Reports, Prescriptions, Scans, Vaccinations, Visits; plus hospital and date-range filters.
- Search works in English, Hindi and Marathi.
- "Key moments" markers for surgeries, new diagnoses and admissions.
- Summary strip at top, for example "24 records, 3 hospitals, 2 years".
- Simple Mode: larger cards, fewer details, "Read aloud" on each entry.
- Empty state with a friendly message and a big "Upload your first record" button.
- Doctors see the same timeline, limited to records the patient shared.

**Acceptance criteria:** Records from at least 3 hospitals display merged in one chronological view. Filters and search return results in under 1 second on demo data.

### 7.5 Prescriptions and Medicines (P0)

- Save medicines with name, dose, frequency, start date and duration.
- "Currently taking" list derived from active prescriptions.

### 7.6 Health Profile (P0)

- Blood group, allergies, chronic conditions, emergency contact.
- Allergies shown prominently with warning styling and an icon (not colour alone).

### 7.7 AI Report Simplifier (P0, hero feature)

- "Explain this report" button on any uploaded lab report.
- Extract test names, values, units and reference ranges (OCR or vision-capable LLM).
- Show a verification screen where the user can correct extracted values before saving.
- Output a plain-language explanation in the selected language (English, Hindi or Marathi).
- Flag each value as Low, Normal or High using colour **and** icon or text.
- Mandatory disclaimer on every explanation: "This explains your report in simple words. It is not a diagnosis. Please consult your doctor."

**Acceptance criteria:** A sample lab report produces a correct, readable explanation with abnormal values flagged in under 15 seconds. The disclaimer is always visible. The AI never suggests treatment or a diagnosis.

### 7.8 Trend Charts (P1)

- Line chart of a chosen value (blood sugar, HbA1c, hemoglobin, cholesterol, BP) across multiple reports.
- Normal range shaded; hover or tap shows the date and value.

### 7.9 Doctor Sharing (P0)

- Patient selects which records to share, chooses an expiry (1 hour, 24 hours or 7 days), and generates a link, QR code and optional OTP.
- Consent screen shows exactly what will be shared and for how long.
- Doctor opens the link (no account needed) and sees a one-page summary: profile, allergies, current medicines, key conditions, recent reports, trends, and access to original files.
- Doctor can add a visit note (optional).
- Patient can revoke access at any time; the link stops working immediately.
- Link expires automatically, enforced server-side.

**Acceptance criteria:** An expired or revoked link returns an "access ended" page. Only selected records are visible.

### 7.10 Emergency QR (P0)

- Patient chooses which fields appear: name, age, blood group, allergies, current medicines, major conditions, emergency contact.
- Generates a printable, downloadable QR. Scanning opens a read-only, mobile-friendly page with no login.
- Patient can disable the QR at any time.

**Acceptance criteria:** Scanning the QR on a phone shows the card in under 3 seconds.

### 7.11 Privacy, Consent and Access Log (P0)

- Log every access: who or which link, when, what was viewed.
- Visible "Who accessed my data" screen for the patient.
- Delete-my-data option in settings.

### 7.12 Multilingual Interface (P0)

- Full UI in English, Hindi and Marathi with a language switcher on every page.
- AI explanations, read-aloud and voice assistant respect the selected language.

### 7.13 Simple, All-Age Layout (P0)

- Large text, tap targets of at least 48px, high contrast, icons with text labels.
- Font-size toggle (A-, A, A+).
- **Simple Mode:** home screen with four big buttons: Upload, My Reports, Emergency Card, Ask Assistant.
- Plain language; no medical jargon in the UI.
- Keyboard navigation, proper labels and screen-reader support.

### 7.14 Reminders (P1)

- Set reminders for medicines, appointments and follow-up visits.
- Shown in-app, with browser notification if permitted.

### 7.15 Multilingual Voice Assistant (P2)

- Mic button on every page; speech-to-text and text-to-speech using browser APIs plus an LLM.
- Supported commands: explain my latest report, what medicines do I take today, show my allergies, open my emergency card, read this aloud.
- Reads and explains the user's own data only. Never diagnoses. Ends medical explanations with a "please consult your doctor" line.
- Marathi voice quality must be tested early; fall back to text if quality is poor.

## 8. AI Requirements and Guardrails

| Use of AI | Purpose | Guardrail |
|---|---|---|
| Report extraction (OCR / vision) | Pull test names and values from uploads | User verifies and corrects values before saving |
| Plain-language explanation | Explain results in English, Hindi, Marathi | Disclaimer always shown; no diagnosis or treatment advice |
| Timeline one-line summaries | Quick summary per record | Generated from verified data only |
| Voice assistant | Hands-free help | Own-data only; refuses diagnosis; "consult your doctor" line |
| Duplicate detection | Warn on repeated uploads | File hash and metadata matching (rule-based, not AI) |

**General rules:** API keys are stored in environment variables. Only the minimum necessary data is sent to the AI service. AI outputs are labelled as AI-generated. The team should state clearly in the pitch that AI explains and does not diagnose.

## 9. Security, Privacy and Compliance

- Hashed passwords, input validation, HTTPS-ready configuration.
- Role-based access: doctors and public viewers see only shared data.
- Share links use long random tokens, with expiry enforced on the server.
- Uploaded files are not publicly accessible; access is through authorised, expiring URLs only.
- Every access is logged and visible to the patient.
- Consent is explicit, informed and revocable.
- Prototype uses demo data only, with a visible note saying so.
- **Compliance note:** health data is sensitive personal data. A production version would need review against India's Digital Personal Data Protection Act, 2023 and ABDM health data management policies. This should be verified with a legal expert and is out of scope for the prototype.

## 10. Non-Functional Requirements

| Area | Requirement |
|---|---|
| Performance | Pages load in under 3 seconds on a typical mobile connection; AI explanation under 15 seconds |
| Usability | New user uploads a first report in 3 taps or fewer |
| Accessibility | WCAG-aligned contrast, labels, keyboard and screen-reader support |
| Responsiveness | Mobile-first; works from 360px wide to desktop |
| Reliability | Graceful errors; empty states for all lists |
| Maintainability | Clean, commented code a student team can extend |

## 11. Technical Architecture

- **Frontend:** React, Tailwind CSS, i18next for English, Hindi and Marathi.
- **Backend:** Node.js (Express) or Python (FastAPI), REST API, JWT authentication.
- **Database:** PostgreSQL or MongoDB (SQLite acceptable for the prototype).
- **File storage:** local or cloud object storage with signed, expiring URLs.
- **AI services:** LLM API (vision-capable for report extraction) and browser speech APIs.
- **Integrations:** ABHA mocked; no real ABDM calls in the prototype.

### Core data model

- **User:** id, name, contact, password hash, language, ABHA ID (optional), settings
- **HealthProfile:** user id, blood group, allergies, conditions, emergency contact
- **Record:** id, user id, date, hospital, doctor, category, file reference, file hash, AI summary, key-moment flag
- **LabValue:** record id, test name, value, unit, reference range, flag (low, normal, high)
- **Medicine:** user id, name, dose, frequency, start, end, source record
- **Reminder:** user id, type, text, schedule
- **ShareLink:** id, user id, record ids, token, OTP, expires at, revoked flag
- **EmergencyCard:** user id, visible fields, token, enabled flag
- **AccessLog:** id, user id, accessor or link, timestamp, action, records viewed

## 12. Key User Flows

1. **Onboard:** choose language, register, optionally link ABHA, reach the dashboard.
2. **Upload:** tap Upload, pick a file, fill metadata, get a duplicate warning if relevant, save, see it on the timeline.
3. **Understand a report:** open a lab report, tap Explain, verify extracted values, read or listen to the explanation in the chosen language.
4. **Share with a doctor:** tap Share, select records, choose expiry, confirm consent, send link or QR, doctor views the summary, link expires or patient revokes.
5. **Emergency:** patient configures the card, prints the QR, a responder scans it and sees the card with no login.
6. **Review privacy:** open the access log to see who viewed what and when.

## 13. Screen List

Landing page, Sign up and Login, Language selector, Dashboard, Simple Mode home, Upload record, Unified timeline, Report detail with AI explanation, Trends, Medicines and reminders, Health profile, Share with doctor, Doctor view (public link), Emergency card (public QR page), Access log, Settings (language, font size, privacy, delete data).

## 14. Success Metrics

**Hackathon metrics**

- End-to-end demo runs in under 3 minutes with no failures.
- All P0 features working; at least two P1 or P2 features shown.
- Clear differentiation from ABHA and existing apps in the pitch.

**Product metrics (post-launch targets, to be validated)**

- Time to first uploaded record
- Share of users who use the AI explanation at least once
- Share of sessions in Hindi or Marathi
- Number of doctor links created and opened
- Emergency cards created per active user

## 15. Demo Plan

**Preloaded data:** one 62-year-old patient from Maharashtra; 3 hospitals; 8 to 10 records over 2 years; 3 HbA1c and 3 hemoglobin readings showing a trend; 2 prescriptions; 3 current medicines; 1 allergy (for example Penicillin); a ready doctor link and emergency QR.

**Demo script (about 3 minutes)**

1. Open Smriti in Marathi and show Simple Mode (15 seconds).
2. Show the unified timeline merging 3 hospitals (30 seconds).
3. Upload a lab report, then show the duplicate warning (20 seconds).
4. Tap Explain and show the Marathi explanation with flagged values (40 seconds).
5. Show the trend chart across 3 reports (20 seconds).
6. Generate the 24-hour doctor link and open it as the doctor (30 seconds).
7. Scan the emergency QR on a phone (15 seconds).
8. Show the access log (10 seconds).

## 16. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| AI misreads a report or gives a wrong explanation | Misleading the patient | User verification step, disclaimer, no diagnosis, demo on tested sample reports |
| Marathi voice or AI quality is weak | Weaker demo | Test early; fall back to text; prioritise Hindi and English if needed |
| Scope too large for hackathon time | Unfinished demo | Strict P0, P1, P2 order; build the demo path first |
| Competitor claims challenged by judges | Credibility | Verify all "Verify" cells; position as complementing ABHA |
| Privacy concerns with sensitive data | Trust | Consent, expiry, access log, demo data only, clear prototype notice |
| AI API failure during the live demo | Demo breaks | Cache sample explanations; keep an offline fallback |

## 17. Milestones and Team Split

| Phase | Work | Priority |
|---|---|---|
| 1 | Project setup, auth, dashboard, database | P0 |
| 2 | Upload, duplicate detection, unified timeline, profile, medicines | P0 |
| 3 | AI report simplifier with verification step | P0 |
| 4 | Doctor sharing, expiry, revocation, access log, emergency QR | P0 |
| 5 | Multilingual UI, Simple Mode, accessibility pass | P0 |
| 6 | Trend charts, search and filters, reminders | P1 |
| 7 | Voice assistant and other stretch items | P2 |
| 8 | Seed data, demo rehearsal, pitch deck | P0 |

**Suggested roles:** frontend and UX, backend and database, AI and report processing, and one person for demo data, testing and the pitch.

## 18. Open Questions

- Which hosting and AI API will the team use, and are there cost or rate limits during the hackathon?
- Which sample lab reports will be used for the demo, and are they anonymised?
- Does the hackathon require specific tech, deployment or submission formats?
- How much of the competitor comparison needs to be verified before the pitch?
