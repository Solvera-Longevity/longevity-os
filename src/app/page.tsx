"use client";

import { useState } from "react";
import { UploadWidget } from "@/components/dashboard/UploadWidget";
import { BiologicalAgeMeter } from "@/components/dashboard/BiologicalAgeMeter";
import { DashboardGrid } from "@/components/dashboard/DashboardGrid";
import { getLatestResult, LabResult } from "@/utils/mockData";
import { calculatePhenoAge, PhenoAgeInputs } from "@/utils/phenoAge"; // Ensure this is exported
import Papa from "papaparse"; // Import parser
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { AIRecommendations } from "@/components/dashboard/AIRecommendations";
import mockRanges from "@/data/ranges.json";

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
    // "hs_CRP" -> "hscrp"
    if (n.includes("crp") || n.includes("creactive")) return "crp";
    // Albumin
    if (n.includes("albumin")) return "albumin";
    // Creatinine
    if (n.includes("creatinine")) return "creatinine";
    // ALP
    if (n.includes("alp") || n.includes("alkaline") || n.includes("phosphatase")) return "alp";
    // WBC
    if (n.includes("wbc") || n.includes("whiteblood") || n.includes("leukocyte")) return "wbc";
    // MCV
    if (n.includes("mcv") || n.includes("corp")) return "mcv";
    // RDW
    if (n.includes("rdw") || n.includes("distribution")) return "rdw";
    // Lymphocytes - check percent first
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

    Papa.parse(file, {
      header: true, // Auto-detect headers
      dynamicTyping: true, // Auto-convert numbers
      skipEmptyLines: true,
      complete: (results) => {
        const markers: Record<string, number> = {};
        let age = 45;
        let patientName = "Guest User";
        let gender = "Unknown";

        const data = results.data as any[];
        if (!data || data.length === 0) {
          setIsAnalyzing(false);
          return;
        }

        // Strategy 1: Check if "Wide" format (Horizontal - like johnny_optimal.csv)
        // Look at keys of first row. Do they look like markers?
        const firstRow = data[0];
        const keys = Object.keys(firstRow);
        const markerKeys = keys.filter(k => mapKeyToId(k) !== null);

        if (markerKeys.length > 3) {
          // It's a Wide format
          // Use the first data row (assuming single patient)
          const row = firstRow;

          // Name extraction (basic heuristics)
          const nameKey = keys.find(k => /name|patient|client/i.test(k));
          if (nameKey && typeof row[nameKey] === 'string') {
            // Replace underscores with spaces if common CSV format (e.g. John_Optimal)
            patientName = row[nameKey].replace(/_/g, " ");
          }

          // Gender extraction
          const genderKey = keys.find(k => /gender|sex/i.test(k));
          if (genderKey && typeof row[genderKey] === 'string') {
            gender = row[genderKey];
          }

          keys.forEach(k => {
            const id = mapKeyToId(k);
            const val = row[k];
            if (id && typeof val === 'number') {
              if (id === "age") age = val;
              else markers[id] = val;
            }
          });
        } else {
          // Strategy 2: It's likely "Vertical" format (Marker, Value)
          data.forEach(row => {
            // Try to find a numeric value in the row
            const values = Object.values(row);
            const numberVal = values.find(v => typeof v === 'number') as number | undefined;
            const stringKeys = Object.values(row).filter(v => typeof v === 'string') as string[];

            if (numberVal !== undefined && stringKeys.length > 0) {
              // Assume the string is the marker name (try all strings in row)
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
          date: new Date().toISOString().split('T')[0],
          markers,
          phenoAgeInputs: inputs,
          calculatedPhenoAge: phenoAge,
          patientName,
          gender
        };

        setTimeout(() => {
          setData(newResult);
          setIsAnalyzing(false);
        }, 1000);
      }
    });
  };

  // Helper to find outliers for AI
  const getOutliers = (markers: Record<string, number | undefined>) => {
    return Object.entries(markers).map(([key, value]) => {
      const range = (mockRanges as any[]).find(r => r.id === key);
      if (!range || value === undefined) return null;

      const v = value as number;
      let status = "green";

      // Helper to check range match
      const matches = (threshold: { min?: number, max?: number } | undefined, val: number, isRed: boolean) => {
        if (!threshold) return false;

        if (isRed) {
          if (threshold.max !== undefined && val <= threshold.max) return true;
          if (threshold.min !== undefined && val >= threshold.min) return true;
          return false;
        }
        // For Green/Normal (Inner range)
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
        // double check if it actually matches green
        if (range.thresholds.green.min !== undefined && v >= range.thresholds.green.min &&
          range.thresholds.green.max !== undefined && v <= range.thresholds.green.max) {
          status = "green";
        } else {
          // If not captured by red or green, likely yellow outlier?
          status = "yellow";
        }
      }

      if (status === "green") return null;
      return { label: range.label, value: v, unit: range.unit, status };
    }).filter(Boolean) as any[];
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-serif text-foreground mb-2">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your latest biomarkers and biological age.</p>
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
            <h2 className="text-2xl font-serif mb-4 text-gold-500">Welcome to Solvera</h2>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              Begin your longevity journey by uploading your latest blood panel.
              Our AI-driven system will analyze your biomarkers, calculate your Phenotypic Age,
              and provide actionable protocols to optimize your lifespan.
            </p>
            <div className="flex items-center gap-2 text-sm text-gold-500/80">
              <span>Powered by Advanced Algorithms</span>
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
              AI Analysis & Protocol Summary
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
