import { PhenoAgeInputs } from "./phenoAge";

/**
 * Common Types
 */

export type BiomarkerId = "glucose" | "hba1c" | "crp" | "albumin" | "creatinine" | "alp" | "wbc" | "mcv" | "rdw" | "lymphocytes_percent" | "vit_d" | "vit_b12";

export interface LabResult {
    id: string; // Unique ID for the report
    date: string; // ISO Date "2024-01-15"
    markers: Partial<Record<BiomarkerId, number>>;
    phenoAgeInputs?: PhenoAgeInputs;
    calculatedPhenoAge?: number;
    patientName?: string;
    gender?: string;
}

export const MOCK_HISTORY: LabResult[] = [
    {
        id: "report-2023-01",
        date: "2023-01-12",
        markers: {
            glucose: 98,
            hba1c: 5.8,
            crp: 2.5,
            albumin: 4.2,
            creatinine: 0.9,
            alp: 70,
            wbc: 6.5,
            mcv: 90,
            rdw: 13.5,
            lymphocytes_percent: 30,
            vit_d: 35,
            vit_b12: 400
        },
        phenoAgeInputs: {
            albumin: 4.2,
            creatinine: 0.9,
            glucose: 98,
            crp: 2.5,
            lymphocyte_percent: 30,
            mcv: 90,
            rdw: 13.5,
            alp: 70,
            wbc: 6.5,
            age: 44 // Age at test
        },
        calculatedPhenoAge: 46.5
    },
    {
        id: "report-2023-07",
        date: "2023-07-20",
        markers: {
            glucose: 95,
            hba1c: 5.7,
            crp: 1.8,
            albumin: 4.3,
            creatinine: 0.9,
            alp: 68,
            wbc: 6.2,
            mcv: 89,
            rdw: 13.2,
            lymphocytes_percent: 32,
            vit_d: 45,
            vit_b12: 450
        },
        phenoAgeInputs: {
            albumin: 4.3,
            creatinine: 0.9,
            glucose: 95,
            crp: 1.8,
            lymphocyte_percent: 32,
            mcv: 89,
            rdw: 13.2,
            alp: 68,
            wbc: 6.2,
            age: 44 // Age at test
        },
        calculatedPhenoAge: 43.1
    },
    {
        id: "report-2024-01",
        date: "2024-01-15",
        markers: {
            glucose: 92,
            hba1c: 5.5,
            crp: 0.9,
            albumin: 4.5,
            creatinine: 0.85,
            alp: 65,
            wbc: 5.8,
            mcv: 88,
            rdw: 12.8,
            lymphocytes_percent: 35,
            vit_d: 60,
            vit_b12: 550
        },
        phenoAgeInputs: {
            albumin: 4.5,
            creatinine: 0.85,
            glucose: 92,
            crp: 0.9,
            lymphocyte_percent: 35,
            mcv: 88,
            rdw: 12.8,
            alp: 65,
            wbc: 5.8,
            age: 45 // Age at test
        },
        calculatedPhenoAge: 38.2
    }
];

export function getLatestResult(): LabResult {
    return MOCK_HISTORY[MOCK_HISTORY.length - 1];
}
