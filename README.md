# 🌿 Smriti (स्मृती / स्मृति) — Healthcare Continuity Platform for India

> *"Your health, remembered."*  
> *"तुमचे आरोग्य, कायम स्मरणात."*  
> *"आपकी सेहत, हमेशा याद।"*

Smriti is a patient-owned healthcare continuity platform that unifies medical records across all hospitals and clinics into one simple timeline, explains lab reports in plain language (English, Hindi, and Marathi), and allows patients to share a consented, time-limited summary with any doctor or emergency responder.

Smriti complements India's **ABHA / ABDM** digital identity layer by providing a friendly, accessible, multilingual, and patient-centered experience for patients of all ages.

---

## 📁 Project Folder Structure

```
smriti---healthcare-continuity-platform/
├── client/                              # React 19 + Vite + Tailwind CSS Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx               # Header with language switcher, font size (A-/A/A+), ABHA badge & SOS
│   │   │   ├── SimpleModeHome.jsx       # Senior-friendly 4-card home layout (Upload, Timeline, SOS, Voice)
│   │   │   ├── TimelineView.jsx         # Unified chronological timeline with sticky month milestones & filters
│   │   │   ├── RecordCard.jsx           # Expandable record card with hospital badges & abnormal flags
│   │   │   ├── ExplainModal.jsx         # AI Report Simplifier (Verification step + Multilingual explanation + Read Aloud)
│   │   │   ├── TrendCharts.jsx          # Interactive biomarker progression graphs (HbA1c, FBS, Hemoglobin)
│   │   │   ├── DoctorShareModal.jsx     # Consented time-limited sharing links (1h, 24h, 7d) & instant revocation
│   │   │   ├── EmergencyCardModal.jsx   # Wallet card preview with emergency QR code
│   │   │   ├── VoiceAssistantModal.jsx  # Multilingual voice assistant (Speech recognition & TTS)
│   │   │   └── DuplicateWarningModal.jsx # Real-time duplicate detection warning
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx            # Detailed medical dashboard with recent entries, meds, and trends
│   │   │   ├── UploadPage.jsx           # Drag-and-drop document uploader with duplicate check & demo presets
│   │   │   ├── MedicinesPage.jsx        # Currently active prescriptions, dosage schedules & reminders
│   │   │   ├── AccessLogPage.jsx        # DPDP/ABDM-aligned transparent access log ("Who accessed my data")
│   │   │   ├── DoctorSummaryView.jsx    # Public unauthenticated portal for visiting doctors with clinical note entry
│   │   │   └── EmergencyPublicView.jsx  # Public read-only triage card for emergency responders via QR scan
│   │   ├── context/
│   │   │   └── AuthContext.jsx          # Authentication, language, font size, and simple mode state
│   │   ├── i18n/
│   │   │   ├── index.js                 # i18next configuration
│   │   │   └── locales/
│   │   │       ├── en.json              # English localization
│   │   │       ├── hi.json              # Hindi (हिंदी) localization
│   │   │       └── mr.json              # Marathi (मराठी) localization
│   │   ├── services/
│   │   │   └── api.js                   # Centralized API service
│   │   ├── App.jsx                      # App root router and modal orchestrator
│   │   ├── index.css                    # Tailwind CSS directives & Google Devanagari typography
│   │   └── main.jsx
│   ├── tailwind.config.js
│   ├── vite.config.js                   # Configured with proxy to port 5000
│   └── package.json
│
├── server/                              # Node.js + Express Backend
│   ├── config/
│   │   └── database.js                  # SQLite database engine (better-sqlite3) with WAL mode
│   ├── controllers/
│   │   ├── authController.js            # Authentication, health profile, and delete-my-data
│   │   ├── recordsController.js         # Unified timeline, duplicate detection, and biomarker trends
│   │   ├── aiController.js              # AI simplifier with user verification, multilingual text & voice guardrails
│   │   ├── shareController.js           # Consented time-limited doctor links and server-side expiry
│   │   ├── emergencyController.js       # Life-saving emergency triage data and QR management
│   │   ├── medicinesController.js       # Prescriptions and daily medication reminders
│   │   └── accessLogController.js       # Transparent audit log
│   ├── routes/                          # Express API route modules
│   ├── middleware/
│   │   ├── authMiddleware.js            # JWT verification and public route exemptions
│   │   └── uploadMiddleware.js          # Multer storage and SHA-256 file hashing for duplicate detection
│   ├── seed/
│   │   └── seedData.js                  # Preloaded demo patient Mrs. Sunita Sharma (62 yrs, Maharashtra)
│   ├── uploads/                         # Stored medical documents (.gitignored)
│   ├── data/                            # SQLite database storage (smriti.db, .gitignored)
│   ├── index.js                         # Server entry point (port 5000)
│   └── package.json
│
├── .env.example                         # Environment variables template
├── .gitignore                           # Ignores node_modules, .env, and uploads
├── README.md                            # Setup and architecture documentation
└── package.json                         # Root runner orchestrating concurrent frontend & backend execution
```

---

## 🚀 Quick Start (One Command)

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or newer; tested on Node v24)
- npm (v9 or newer)

### 1. Install Dependencies
Run the setup script from the root directory:
```bash
npm run setup
```
*(Or install manually: `npm install && npm --prefix server install && npm --prefix client install`)*

### 2. Configure Environment
Copy `.env.example` to `server/.env` (default settings work out of the box with zero external configuration):
```bash
cp .env.example server/.env
```

### 3. Start the Entire Application
Start both the Express backend (`http://localhost:5000`) and the Vite React frontend (`http://localhost:3000`) with a single command:
```bash
npm run dev
```

Open your browser to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 👩‍⚕️ Preloaded Demo Profile (Mrs. Sunita Sharma)

The database automatically seeds a complete 2-year realistic medical journey for hackathon evaluation:
- **Patient:** Mrs. Sunita Sharma, 62 years old, from Maharashtra.
- **ABHA ID:** `91-4523-8812-7019` (Linked Badge)
- **Default Language:** Marathi (मराठी) — toggleable instantly to Hindi (हिंदी) or English.
- **Hospitals Spanned (3):**
  1. *K.E.M. Hospital, Parel, Mumbai* (OPD consultation, surgeries, maintenance prescriptions)
  2. *Lilavati Hospital & Research Centre, Bandra* (Quarterly metabolic panels, HbA1c & fasting sugar)
  3. *Ruby Hall Clinic, Pune* (Bilateral knee joint X-ray and senior vaccinations)
- **Active Medications:** Metformin 500mg, Telmisartan 40mg, Calcium + Vitamin D3.
- **Allergies:** Penicillin (Severe rash & swelling), Sulfa Drugs.
- **Biomarker Progression:** HbA1c trajectory tracking recovery from `8.4%` (High) down to `6.8%` (Optimal Target).

---

## 🎯 3-Minute Demo Script Walkthrough

1. **Simple Mode in Marathi (15s):**
   - App opens in Marathi with large, senior-friendly cards: *रिपोर्ट अपलोड करा*, *माझे रिपोर्ट*, *आपत्कालीन कार्ड*, *आवाजाने विचारा*.
   - Tap **"A+"** text size button to view high-contrast senior typography.
2. **Unified Timeline Across 3 Hospitals (30s):**
   - Click *माझे रिपोर्ट आणि इतिहास*.
   - View 9 records chronologically merged from K.E.M. Hospital, Lilavati Hospital, and Ruby Hall Clinic.
   - Filter chips allow filtering by *Lab Reports*, *Prescriptions*, or *Scans*.
3. **Upload & Duplicate Detection Warning (20s):**
   - Tap *रिपोर्ट अपलोड करा*. Click the demo preset button **"⚠️ Duplicate Test Record"** and tap *Save*.
   - The app detects matching metadata (Hospital, Date, Category) and displays the duplicate warning modal.
4. **AI Report Simplifier (40s):**
   - On any lab report card (e.g., Lilavati Hospital), tap **"सोप्या भाषेत समजून घ्या (Explain Report)"**.
   - **Step 1 (Verification):** User reviews and corrects extracted values (HbA1c, FBS, Hemoglobin).
   - **Step 2 (Explanation):** View the plain-language explanation in Marathi/Hindi/English with abnormal flags and mandatory disclaimer.
   - Tap **"मराठीत ऐका"** for voice audio synthesis.
5. **Biomarker Trends (20s):**
   - View the interactive SVG line graph showing HbA1c and Hemoglobin improvement over 14 months within the shaded normal zone.
6. **Consented Doctor Sharing (30s):**
   - Tap **"डॉक्टरांशी शेअर करा"**. Choose 24-hour expiry and generate a doctor link.
   - Open the link in a new tab: doctor views the one-page summary and can add a clinical consultation note.
   - Back in patient view, click **"Revoke Access"** to immediately terminate doctor access.
7. **Emergency QR Card (15s):**
   - Tap the red **"SOS / आपत्कालीन कार्ड"** button to view the wallet card and QR code.
   - First responders scanning the QR access the life-saving triage card without logging in.
8. **Access Log (10s):**
   - Open **"कोणी पाहिले (Access Log)"** to inspect the transparent log of every doctor link and emergency QR scan.

---

## 🛠️ Tech Stack & Implementation Details

- **Frontend:** React 19, Tailwind CSS v3, Vite, Lucide Icons, i18next & react-i18next.
- **Backend:** Node.js, Express, better-sqlite3, Multer (with SHA-256 hashing), JSON Web Tokens (JWT), bcryptjs.
- **Database:** SQLite (zero-config, high-performance WAL mode, stored in `server/data/smriti.db`).
- **Safety Guardrails:** Disclaimers on all AI outputs; strict unauthenticated bounds on doctor summary expiration; transparent access auditing.