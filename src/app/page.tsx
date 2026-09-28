"use client";

import { useState, useSyncExternalStore } from "react";
import { UploadWidget } from "@/components/dashboard/UploadWidget";
import { BiologicalAgeMeter } from "@/components/dashboard/BiologicalAgeMeter";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { LabResult, getLatestResult } from "@/utils/mockData";
import { calculatePhenoAge, PhenoAgeInputs } from "@/utils/phenoAge";
import Papa from "papaparse";
import { ArrowRight, UploadCloud, RefreshCw } from "lucide-react";
import Link from "next/link";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import mockRanges from "@/data/ranges.json";

interface RangeDefinition {
  id: string;
  label: string;
  unit: string;
  category: string;
  slider?: { min?: number; max?: number };
  thresholds: {
    green: { min?: number; max?: number };
    yellow: { min?: number; max?: number };
    red: { min?: number; max?: number };
  };
}

interface OutlierResult {
  label: string;
  value: number;
  unit: string;
  status: "yellow" | "red";
}

const ranges = mockRanges as RangeDefinition[];
const SESSION_STORAGE_KEY = "solvera_active_lab_result";

function subscribeToSession(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("solvera-panel-change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("solvera-panel-change", callback);
  };
}

function getSessionSnapshot(): string {
  try {
    return sessionStorage.getItem(SESSION_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function getSessionServerSnapshot(): string {
  return "";
}

export default function Home() {
  const sessionDataRaw = useSyncExternalStore(
    subscribeToSession,
    getSessionSnapshot,
    getSessionServerSnapshot
  );

  const [uploadedData, setUploadedData] = useState<LabResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploadingNew, setIsUploadingNew] = useState(false);

  // Compute active data: local uploaded state > synchronized session storage > default baseline
  const data: LabResult = uploadedData || (() => {
    if (sessionDataRaw) {
      try {
        const parsed = JSON.parse(sessionDataRaw);
        if (parsed?.id) return parsed;
      } catch {
        // ignore parse error
      }
    }
    return getLatestResult();
  })();

  const updateActiveData = (result: LabResult | null) => {
    setUploadedData(result);
    try {
      if (result) {
        sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(result));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
      }
      window.dispatchEvent(new Event("solvera-panel-change"));
    } catch (err) {
      console.warn("Unable to persist to sessionStorage:", err);
    }
  };

  // Normalize key helper
  const normalizeKey = (k: string) => k.toLowerCase().replace(/[^a-z0-9]/g, "");

  // ID MAPPING HELPER - Returns known ID or null
  const mapKeyToId = (key: string): string | null => {
    const n = normalizeKey(key);

    if (n.includes("hba1c")) return "hba1c";
    if (n.includes("glucose")) return "glucose";
    if (n.includes("crp") || n.includes("creactive")) return "crp";
    if (n.includes("albumin")) return "albumin";
    if (n.includes("creatinine")) return "creatinine";
    if (n.includes("alp") || n.includes("alkaline") || n.includes("phosphatase")) return "alp";
    if (n.includes("wbc") || n.includes("whiteblood") || n.includes("leukocyte")) return "wbc";
    if (n.includes("mcv") || n.includes("corp")) return "mcv";
    if (n.includes("rdw") || n.includes("distribution")) return "rdw";
    if (n.includes("lymph") && (n.includes("percent") || n.includes("pct") || n.includes("%"))) return "lymphocytes_percent";

    // Vitamins
    if (n.includes("vit") && n.includes("d")) return "vit_d";
    if (n.includes("vit") && n.includes("12")) return "vit_b12";

    // Age
    if (n === "age" || n === "chronologicalage") return "age";

    return null;
  };

  const handleUpload = (file: File) => {
    setIsAnalyzing(true);

    Papa.parse<Record<string, unknown>>(file, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        const markers: Record<string, number> = {};
        let age = 45;
        let patientName = "Clinical Patient";
        let gender = "Unspecified";

        const rows = results.data;
        if (!rows || rows.length === 0) {
          setIsAnalyzing(false);
          return;
        }

        const firstRow = rows[0];
        const keys = Object.keys(firstRow);
        const markerKeys = keys.filter(k => mapKeyToId(k) !== null);

        if (markerKeys.length > 3) {
          const row = firstRow;

          const nameKey = keys.find(k => /name|patient|client/i.test(k));
          if (nameKey && typeof row[nameKey] === "string") {
            patientName = (row[nameKey] as string).replace(/_/g, " ");
          }

          const genderKey = keys.find(k => /gender|sex/i.test(k));
          if (genderKey && typeof row[genderKey] === "string") {
            gender = row[genderKey] as string;
          }

          keys.forEach(k => {
            const id = mapKeyToId(k);
            const val = row[k];
            if (id && typeof val === "number") {
              if (id === "age") age = val;
              else markers[id] = val;
            }
          });
        } else {
          rows.forEach(row => {
            const values = Object.values(row);
            const numberVal = values.find((v): v is number => typeof v === "number");
            const stringKeys = values.filter((v): v is string => typeof v === "string");

            if (numberVal !== undefined && stringKeys.length > 0) {
              for (const s of stringKeys) {
                const id = mapKeyToId(s);
                if (id) {
                  if (id === "age") age = numberVal;
                  else markers[id] = numberVal;
                  break;
                }
              }
            }
          });
        }

        const inputs: PhenoAgeInputs = {
          albumin: markers.albumin || 4.5,
          creatinine: markers.creatinine || 1.0,
          glucose: markers.glucose || 90,
          crp: markers.crp || 0.5,
          lymphocyte_percent: markers.lymphocytes_percent || 30,
          mcv: markers.mcv || 85,
          rdw: markers.rdw || 13,
          alp: markers.alp || 70,
          wbc: markers.wbc || 6.0,
          age: age
        };

        const phenoAge = calculatePhenoAge(inputs);

        const newResult: LabResult = {
          id: `upload-${Date.now()}`,
          date: new Date().toISOString().split("T")[0],
          markers,
          phenoAgeInputs: inputs,
          calculatedPhenoAge: phenoAge,
          patientName,
          gender
        };

        setTimeout(() => {
          updateActiveData(newResult);
          setIsAnalyzing(false);
          setIsUploadingNew(false);
        }, 600);
      }
    });
  };

  const getOutliers = (markers: Record<string, number | undefined>): OutlierResult[] => {
    return Object.entries(markers)
      .map(([key, value]) => {
        const range = ranges.find(r => r.id === key);
        if (!range || typeof value !== "number") return null;

        const v = value;
        let status: "green" | "yellow" | "red" = "green";

        const matches = (threshold: { min?: number; max?: number } | undefined, val: number, isRed: boolean) => {
          if (!threshold) return false;
          if (isRed) {
            if (threshold.max !== undefined && val <= threshold.max) return true;
            if (threshold.min !== undefined && val >= threshold.min) return true;
            return false;
          }
          if (threshold.min !== undefined && val < threshold.min) return false;
          if (threshold.max !== undefined && val > threshold.max) return false;
          return true;
        };

        if (matches(range.thresholds.red, v, true)) {
          status = "red";
        } else if (matches(range.thresholds.yellow, v, true)) {
          if (range.thresholds.yellow.min !== undefined && v >= range.thresholds.yellow.min &&
            range.thresholds.yellow.max !== undefined && v <= range.thresholds.yellow.max) {
            status = "yellow";
          }
        }

        if (status === "green") {
          if (range.thresholds.green.min !== undefined && v >= range.thresholds.green.min &&
            range.thresholds.green.max !== undefined && v <= range.thresholds.green.max) {
            status = "green";
          } else {
            status = "yellow";
          }
        }

        if (status === "green") return null;
        return { label: range.label, value: v, unit: range.unit, status };
      })
      .filter((item): item is OutlierResult => item !== null);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-1">Biomarker Assessment</h1>
          <p className="text-sm text-muted-foreground">Comprehensive longevity profile, biological age calculation, and targeted clinical interventions.</p>
        </div>
        {data && !isUploadingNew && (
          <div className="flex items-center gap-3">
            <div className="text-xs text-muted-foreground bg-card border border-border px-3 py-1.5 rounded-lg font-mono">
              Report: <span className="text-foreground font-semibold">{data.date}</span>
            </div>
            <button
              onClick={() => setIsUploadingNew(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border hover:border-brand-500/30 bg-card hover:bg-brand-500/10 text-muted-foreground hover:text-foreground transition-colors"
            >
              <UploadCloud className="h-3.5 w-3.5 text-brand-400" />
              <span>Upload Different Panel</span>
            </button>
          </div>
        )}
      </div>

      {(!data || isUploadingNew) ? (
        <div className="space-y-4">
          {data && isUploadingNew && (
            <div className="flex justify-end">
              <button
                onClick={() => setIsUploadingNew(false)}
                className="text-xs text-muted-foreground hover:text-foreground font-mono underline"
              >
                ← Return to active panel ({data.patientName})
              </button>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <div className="bg-card p-8 rounded-2xl border border-border flex flex-col justify-between">
              <div>
                <h2 className="text-2xl font-serif mb-4 text-brand-400">Solvera Longevity OS</h2>
                <p className="text-muted-foreground mb-6 leading-relaxed text-sm">
                  Upload standardized laboratory biomarker data to compute phenotypic age using the validated Levine model,
                  identify out-of-range clinical endpoints, and surface evidence-based therapeutic options.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                <RefreshCw className="h-3.5 w-3.5 text-accent-400" />
                <span>Levine Phenotypic Aging Engine • Structured CSV Intake</span>
              </div>
            </div>
            <div className="h-64">
              <UploadWidget onUpload={handleUpload} isAnalyzing={isAnalyzing} />
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="mb-8">
            <BiologicalAgeMeter
              chronologicalAge={data.phenoAgeInputs?.age || 0}
              biologicalAge={data.calculatedPhenoAge || 0}
              name={data.patientName}
              gender={data.gender}
            />
            <div className="flex justify-end mt-4">
              <Link href="/timeline" className="text-sm font-medium text-brand-400 hover:text-brand-300 flex items-center gap-2 transition-colors">
                View Historical Trends <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <DashboardGrid data={data} />

          <div className="mt-12 mb-20">
            <h2 className="text-2xl font-serif text-brand-400 mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-500"></span>
              Clinical Decision Support
            </h2>
            <div className="h-96">
              <AIRecommendations markers={getOutliers(data.markers)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
