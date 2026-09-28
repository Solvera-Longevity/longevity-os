"use client";

import { useState } from "react";
import { UploadWidget } from "@/components/dashboard/UploadWidget";
import { BiologicalAgeMeter } from "@/components/dashboard/BiologicalAgeMeter";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { LabResult } from "@/utils/mockData";
import { calculatePhenoAge, PhenoAgeInputs } from "@/utils/phenoAge";
import Papa from "papaparse";
import { ArrowRight } from "lucide-react";
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

export default function Home() {
  const [data, setData] = useState<LabResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

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
          setData(newResult);
          setIsAnalyzing(false);
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
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Biomarker Assessment</h1>
          <p className="text-muted-foreground">Comprehensive longevity profile, biological age calculation, and targeted clinical interventions.</p>
        </div>
        {data && (
          <div className="text-sm text-muted-foreground">
            Report Date: <span className="font-mono text-foreground">{data.date}</span>
          </div>
        )}
      </div>

      {!data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-card p-8 rounded-2xl border border-border">
            <h2 className="text-2xl font-serif mb-4 text-gold-500">Solvera Longevity OS</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Upload standardized laboratory biomarker data to compute phenotypic age using the validated Levine model,
              identify out-of-range clinical endpoints, and surface evidence-based therapeutic options.
            </p>
            <div className="flex items-center gap-2 text-sm text-gold-500/80">
              <span>Levine Phenotypic Aging Engine • Structured CSV Intake</span>
            </div>
          </div>
          <div className="h-64">
            <UploadWidget onUpload={handleUpload} isAnalyzing={isAnalyzing} />
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
              <Link href="/timeline" className="text-sm font-medium text-gold-500 hover:text-gold-400 flex items-center gap-2 transition-colors">
                View Historical Trends <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <DashboardGrid data={data} />

          <div className="mt-12 mb-20">
            <h2 className="text-2xl font-serif text-gold-500 mb-6 flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-gold-500"></span>
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
