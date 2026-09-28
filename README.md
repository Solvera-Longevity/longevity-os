# Solvera Longevity OS

An executive clinical intelligence platform and longevity concierge dashboard. Solvera transforms raw laboratory biomarker panels into phenotypic biological age assessments (Levine model) and pairs out-of-range clinical endpoints with evidence-based therapeutic protocols and lifestyle interventions.

---

## Stakeholder Context & Scope (Proof of Concept)

> **Important Architecture & Compliance Note:**  
> This repository represents a focused **Proof of Concept (PoC)** developed for stakeholder demonstration.  
> - **HIPAA / PHI Boundary**: Direct parsing of unstructured PDF lab reports (e.g. OCR/unredacted electronic health document ingestion) was intentionally omitted from this milestone. Ingestion of raw medical PDFs introduces Protected Health Information (PHI) handling subject to strict **HIPAA compliance**, Business Associate Agreements (BAAs), and end-to-end data encryption requirements. Data ingestion is designed around structured, de-identified CSV panels (`patient_optimal.csv`, `patient_risk.csv`), ensuring zero PHI exposure during technical demonstrations.
> - **Functional Scope & Architectural Previews**: The primary dashboard (`/`) and clinical formulary (`/protocols`) contain the fully operational algorithmic engine—Levine biological age computation, biomarker classification, deterministic protocol matching, and AI clinical synthesis. Ancillary sections (`/reports`, `/settings`, `/timeline`) serve as interactive architectural previews to illustrate prospective clinic workflows (EHR synchronization, de-identified report archives, and practitioner settings) without requiring mock database backends.

---

## Core Capabilities

- **Levine Phenotypic Aging Engine**: Implements the validated Levine et al. (2018) epigenetic/phenotypic biomarker mortality and aging algorithm, normalizing clinical laboratory units across Albumin, Creatinine, Fasting Glucose, hs-CRP, Lymphocyte %, MCV, RDW, Alkaline Phosphatase, and WBC.
- **Dynamic Biomarker Classification**: Maps individual patient markers against optimal functional reference intervals with responsive visual threshold bars and state indicators.
- **Protocol Matching Engine**: Deterministic indexing pipeline cross-referencing out-of-range biomarkers with peer-reviewed clinical trial literature and mechanism-of-action data.
- **Clinician Custom Protocol Authoring**: Enables physicians and clinic directors to curate, save, and catalog bespoke therapeutic interventions and custom compound formulations alongside standard peer-reviewed protocols.
- **Clinical Decision Support (LLM-Assisted)**: Synthesizes multiple marker interactions into cohesive clinical summaries powered by modern AI SDK abstractions with built in resilience and offline fallback handling.
- **Longitudinal Trend Analytics**: Recharts driven historical tracking visualizing biological vs. chronological aging velocity over time.

---

## Clinician Formulary & Custom Protocol Authoring

A core requirement for functional medicine practitioners and longevity clinicians is the ability to integrate clinic-specific protocols (e.g. customized peptide stacks, targeted nutraceutical dosing, or proprietary lifestyle therapies) directly into patient care plans.

In Solvera, practitioners can manage their intervention formulary via the **Protocols** hub (`/protocols`):
- **Peer-Reviewed Reference Library**: Browse established longevity compounds (e.g. Thymosin Alpha-1, Berberine HCL, BPC-157, TUDCA) indexed by biological target, therapeutic class, mechanism of action, and lifestyle synergy.
- **Custom Protocol Authoring Modal**: Click **"+ Add Custom Protocol"** on `/protocols` to register proprietary interventions directly into the clinic's local formulary. Clinicians specify the compound name, target biomarker, therapeutic class, mechanism of action, evidence grade, and complementary lifestyle synergies.
- **Immediate Clinical Availability**: Custom protocols immediately badge with `Clinician Custom` and become available within the practitioner's active intervention catalog.

---

## Tech Stack & Architecture

- **Framework**: Next.js 16 (App Router, React 19, Turbopack)
- **Language**: TypeScript 5 (Strict Mode)
- **Styling**: Tailwind CSS v4 with bespoke luxury/clinical palette tokens
- **Data Parsing**: PapaParse (structured CSV intake)
- **Data Visualization**: Recharts
- **Icons & Typography**: Lucide React, Space Grotesk & JetBrains Mono

---

## Getting Started

### Prerequisites

- Node.js 18.17+ or 20+
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Solvera-Longevity/longevity-os.git
cd longevity-os

# Install dependencies
npm install
```

### Environment Configuration

Copy the example environment configuration:

```bash
cp .env.local.example .env.local
```

Add your Gemini API key if you wish to run live LLM protocol synthesis:

```env
GOOGLE_GENERATIVE_AI_API_KEY=your_key_here
```

*(Note: The system contains full offline clinical fallback mocks; an API key is not required to run and test the complete application interface and calculations).*

### Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

---

## Testing Sample Patients

Sample datasets are included in the repository root for validation:

1. **`sample_data/patient_optimal.csv`**: Healthy longevity baseline demonstrating optimal range thresholds and low biological age.
2. **`sample_data/patient_risk.csv`**: Demonstrates elevated inflammatory and glycemic markers, triggering accelerated biological age alerts and automated protocol lookup.
