import { FileText, Download, Clock, ShieldCheck, ArrowUpRight } from "lucide-react";
import Link from "next/link";

const ARCHIVED_REPORTS = [
    {
        id: "rep-2024-01-15",
        title: "Comprehensive Longevity & Epigenetic Biomarker Panel",
        provider: "Quest Diagnostics / Solvera Concierge",
        date: "2024-01-15",
        biologicalAge: 38.2,
        chronologicalAge: 45,
        status: "Clinically Verified",
        biomarkersTested: 12,
        outliers: 0,
    },
    {
        id: "rep-2023-07-20",
        title: "Mid-Year Metabolic & Inflammation Follow-Up",
        provider: "LabCorp Executive Health",
        date: "2023-07-20",
        biologicalAge: 43.1,
        chronologicalAge: 44,
        status: "Archived",
        biomarkersTested: 12,
        outliers: 2,
    },
    {
        id: "rep-2023-01-12",
        title: "Baseline Clinical Longevity Intake Panel",
        provider: "LabCorp Clinical Laboratory",
        date: "2023-01-12",
        biologicalAge: 46.5,
        chronologicalAge: 44,
        status: "Archived",
        biomarkersTested: 12,
        outliers: 4,
    },
];

export default function ReportsPage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full border border-accent-500/20">
                            Clinical Records
                        </span>
                    </div>
                    <h1 className="text-3xl font-serif text-foreground">Diagnostic Lab Reports</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                        Historical laboratory documentation and normalized clinical panels indexed for biological age tracking.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-500 hover:bg-brand-400 text-white transition-colors shadow-sm"
                    >
                        <span>Upload New Report</span>
                        <ArrowUpRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Compliance Banner */}
            <div className="rounded-xl border border-accent-500/20 bg-accent-500/5 p-4 flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-accent-400 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">De-Identified Clinical Storage: </span>
                    All biomarker records are stripped of direct patient identifiers prior to client-side phenotypic calculation, ensuring compliance with research safeguards and PHI protection protocols.
                </div>
            </div>

            {/* Reports List */}
            <div className="grid gap-4">
                {ARCHIVED_REPORTS.map((report) => {
                    const ageDelta = report.chronologicalAge - report.biologicalAge;
                    const isFavorable = ageDelta >= 0;

                    return (
                        <div
                            key={report.id}
                            className="group rounded-2xl border border-border bg-card p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:border-brand-500/40 hover:bg-[#121624]/60"
                        >
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 group-hover:scale-105 transition-transform shrink-0">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-serif text-lg text-foreground group-hover:text-brand-300 transition-colors">
                                            {report.title}
                                        </h3>
                                        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-white/10 text-muted-foreground">
                                            {report.status}
                                        </span>
                                    </div>
                                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground font-mono">
                                        <span>{report.provider}</span>
                                        <span>•</span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" /> {report.date}
                                        </span>
                                        <span>•</span>
                                        <span>{report.biomarkersTested} Biomarkers</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-white/5">
                                <div className="text-right">
                                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-0.5">
                                        Calculated PhenoAge
                                    </span>
                                    <div className="flex items-baseline gap-1 justify-end">
                                        <span className="text-2xl font-display font-bold text-foreground">
                                            {report.biologicalAge}
                                        </span>
                                        <span className="text-xs font-mono text-muted-foreground">yrs</span>
                                    </div>
                                    <span className={`text-[10px] font-mono ${isFavorable ? "text-green-400" : "text-red-400"}`}>
                                        {isFavorable ? `-${ageDelta.toFixed(1)} yrs pace` : `+${Math.abs(ageDelta).toFixed(1)} yrs pace`}
                                    </span>
                                </div>

                                <button
                                    type="button"
                                    className="p-2.5 rounded-xl border border-border text-muted-foreground hover:text-foreground hover:border-brand-500/30 hover:bg-brand-500/10 transition-colors"
                                    title="Download Structured Panel"
                                >
                                    <Download className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
