import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Types
export interface ProtocolMatch {
    condition: string;
    peptide: string;
    mechanism: string;
    lifestyle?: string;
    dosing?: {
        dose: string;
        frequency: string;
        route: string;
        duration: string;
    };
    safety?: {
        cautions: string;
        source: string;
    };
    source: string;
}

interface SymptomRow {
    Biomarker: string;
    Condition: string;
    Peptide: string;
    Mechanism: string;
    Lifestyle_Lever?: string;
}

interface TrialRow {
    "Peptide / Compound": string;
    "Dose (as reported)": string;
    "Schedule / duration (as reported)": string;
    "Route": string;
    "Key notes / cautions": string;
    "Source (URL)": string;
}

export class ProtocolEngine {
    private symptomMap: SymptomRow[] = [];
    private trials: TrialRow[] = [];
    private initialized = false;

    constructor() { }

    async init() {
        if (this.initialized) return;

        try {
            // Load Symptoms
            const symptomPath = path.join(process.cwd(), 'src/data/symptoms_solutions.csv');
            const symptomCsv = fs.readFileSync(symptomPath, 'utf8');
            this.symptomMap = Papa.parse<SymptomRow>(symptomCsv, { header: true, skipEmptyLines: true }).data;

            // Load Trials
            const trialPath = path.join(process.cwd(), 'src/data/clinical_trials.csv');
            const trialCsv = fs.readFileSync(trialPath, 'utf8');
            this.trials = Papa.parse<TrialRow>(trialCsv, { header: true, skipEmptyLines: true }).data;

            this.initialized = true;
        } catch (error) {
            console.error("Failed to initialize Protocol Engine:", error);
        }
    }

    getProtocol(markerLabel: string): ProtocolMatch | null {
        if (!this.initialized) return null;

        // Normalize: remove non-alphanumeric, lowercase
        const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
        const target = normalize(markerLabel);

        // Fuzzy match marker name in Symptom Map
        const match = this.symptomMap.find(s => {
            const dbMarker = normalize(s.Biomarker);
            return dbMarker.includes(target) || target.includes(dbMarker);
        });

        if (!match) return null;

        // Find dosing for the peptide
        const trial = this.trials.find(t =>
            normalize(t["Peptide / Compound"]).includes(normalize(match.Peptide))
        );

        return {
            condition: match.Condition,
            peptide: match.Peptide,
            mechanism: match.Mechanism,
            lifestyle: match.Lifestyle_Lever,
            dosing: {
                dose: trial ? trial["Dose (as reported)"] : "Dose varies by indication.",
                frequency: trial ? trial["Schedule / duration (as reported)"] : "As directed by clinician.",
                route: trial ? trial.Route : "SC/Oral",
                duration: trial ? trial["Schedule / duration (as reported)"] : "See protocol"
            },
            safety: {
                cautions: trial ? trial["Key notes / cautions"] : "Consult a physician before use. Research compound.",
                source: trial ? trial["Source (URL)"] : ""
            },
            source: trial ? "Clinical Trial / Non-FDA" : "General Recommendation"
        };
    }
}

export const protocolEngine = new ProtocolEngine();
