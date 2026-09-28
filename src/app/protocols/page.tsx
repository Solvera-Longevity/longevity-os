"use client";

import { useState } from "react";
import { Activity, ShieldAlert, BookOpen, ArrowRight, Plus, Check, Stethoscope } from "lucide-react";
import Link from "next/link";

interface ProtocolEntry {
    name: string;
    targetMarker: string;
    class: string;
    mechanism: string;
    status: string;
    evidenceScore: string;
    lifestyleSynergy: string;
    isCustom?: boolean;
}

const DEFAULT_PROTOCOLS: ProtocolEntry[] = [
    {
        name: "Thymosin Alpha-1 (Thymalfasin)",
        targetMarker: "hs-CRP / Systemic Inflammation",
        class: "Immunomodulating Peptide",
        mechanism: "Augments T-cell function and attenuates pro-inflammatory cytokines including IL-6 and TNF-alpha.",
        status: "Non-FDA / Clinical Trial Phase II-III",
        evidenceScore: "Moderate (BMJ 2024; NCT02867267)",
        lifestyleSynergy: "Cryotherapy (11°C, 3min), Circadian sleep stabilization",
    },
    {
        name: "Berberine HCL (AMPK Activator)",
        targetMarker: "Fasting Glucose & HbA1c",
        class: "Metabolic Botanical Alkaloid",
        mechanism: "Upregulates AMPK phosphorylation, mimicking fasting physiology to improve insulin receptor sensitivity.",
        status: "Dietary Supplement / Functional Medicine",
        evidenceScore: "Strong (Meta-analyses)",
        lifestyleSynergy: "Zone 2 Low-Intensity Cardiovascular Conditioning (45min)",
    },
    {
        name: "BPC-157 (Body Protection Compound)",
        targetMarker: "WBC / Tissue Healing",
        class: "Pentadecapeptide",
        mechanism: "Promotes VEGFR2 expression, accelerates cellular proliferation, and downregulates systemic inflammatory cascades.",
        status: "Investigational Research Compound",
        evidenceScore: "Preclinical / Emerging Clinical",
        lifestyleSynergy: "Deep sleep optimization (>7.5 hours per night)",
    },
    {
        name: "TUDCA (Tauroursodeoxycholic Acid)",
        targetMarker: "Alkaline Phosphatase (ALP) / Hepatic Stress",
        class: "Hydrophilic Bile Salt & Chaperone",
        mechanism: "Reduces endoplasmic reticulum (ER) stress within hepatocytes and supports biliary clearance.",
        status: "Nutraceutical / Prescription in select jurisdictions",
        evidenceScore: "Moderate",
        lifestyleSynergy: "Alcohol cessation, intermittent fasting",
    },
    {
        name: "Vitamin D3 + K2 (MK-7)",
        targetMarker: "25-OH Vitamin D Deficiency",
        class: "Secosteroid & Fat-Soluble Vitamin",
        mechanism: "Modulates gene transcription across 1,000+ longevity pathways and prevents vascular calcification.",
        status: "Clinical Standard of Care",
        evidenceScore: "Very High",
        lifestyleSynergy: "Direct morning sunlight exposure (20min)",
    },
];

export default function ProtocolsPage() {
    const [protocols, setProtocols] = useState<ProtocolEntry[]>(DEFAULT_PROTOCOLS);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [name, setName] = useState("");
    const [targetMarker, setTargetMarker] = useState("");
    const [compoundClass, setCompoundClass] = useState("");
    const [mechanism, setMechanism] = useState("");
    const [lifestyleSynergy, setLifestyleSynergy] = useState("");

    const handleCreateProtocol = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !targetMarker || !mechanism) return;

        const newProtocol: ProtocolEntry = {
            name,
            targetMarker,
            class: compoundClass || "Physician Formulation",
            mechanism,
            status: "Physician Authored / Custom",
            evidenceScore: "Clinician Direct Entry",
            lifestyleSynergy: lifestyleSynergy || "Customized per patient plan",
            isCustom: true,
        };

        setProtocols([newProtocol, ...protocols]);
        setIsModalOpen(false);
        setName("");
        setTargetMarker("");
        setCompoundClass("");
        setMechanism("");
        setLifestyleSynergy("");
    };

    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-brand-400 bg-brand-500/10 px-2 py-0.5 rounded-full border border-brand-500/20">
                            Clinical Formulary & Protocol Engine
                        </span>
                    </div>
                    <h1 className="text-3xl font-serif text-foreground">Therapeutic Protocol Index</h1>
                    <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
                        Evidence-graded therapeutic peptides, small molecules, and clinician-authored protocols mapped to specific out-of-range biomarkers.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Custom Protocol</span>
                    </button>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-border hover:border-brand-500/30 bg-card hover:bg-brand-500/10 text-foreground transition-colors shadow-sm"
                    >
                        <span>Match Current Panel</span>
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                </div>
            </div>

            {/* Disclaimer */}
            <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 flex items-start gap-3">
                <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0 mt-0.5" />
                <div className="text-xs leading-relaxed text-muted-foreground">
                    <span className="font-semibold text-foreground">Physician Formulary & Educational Reference: </span>
                    Clinicians may curate private treatment protocols or utilize indexed peer-reviewed clinical trial monographs. All interventions require individualized clinical evaluation.
                </div>
            </div>

            {/* Protocols Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {protocols.map((protocol) => (
                    <div
                        key={protocol.name}
                        className={`rounded-2xl border p-6 flex flex-col justify-between transition-all shadow-sm ${
                            protocol.isCustom 
                                ? "border-brand-500/40 bg-brand-500/[0.04]" 
                                : "border-border bg-card hover:border-brand-500/40 hover:bg-[#121624]/60"
                        }`}
                    >
                        <div>
                            <div className="flex items-start justify-between gap-4 mb-3">
                                <div>
                                    <div className="flex items-center gap-1.5 text-xs font-mono text-accent-400 mb-1">
                                        <Activity className="h-3.5 w-3.5" />
                                        <span>Indication: {protocol.targetMarker}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-serif text-xl text-foreground font-semibold">
                                            {protocol.name}
                                        </h3>
                                        {protocol.isCustom && (
                                            <span className="text-[10px] font-mono text-brand-300 bg-brand-500/20 border border-brand-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                                                <Stethoscope className="h-3 w-3" /> Doctor Formulation
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-xs text-muted-foreground font-mono">
                                        {protocol.class}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono uppercase px-2.5 py-1 rounded-full border border-brand-500/30 text-brand-400 bg-brand-500/10 shrink-0">
                                    {protocol.status.split("/")[0].trim()}
                                </span>
                            </div>

                            <div className="space-y-3 my-4 text-xs">
                                <div>
                                    <span className="text-muted-foreground block mb-0.5 font-medium">Mechanism of Action</span>
                                    <p className="text-foreground/90 leading-relaxed">{protocol.mechanism}</p>
                                </div>
                                <div>
                                    <span className="text-muted-foreground block mb-0.5 font-medium">Synergistic Lifestyle Lever</span>
                                    <p className="text-brand-300 leading-relaxed font-mono">{protocol.lifestyleSynergy}</p>
                                </div>
                            </div>
                        </div>

                        <div className="border-t border-white/5 pt-4 mt-2 flex items-center justify-between text-xs text-muted-foreground font-mono">
                            <span className="flex items-center gap-1">
                                <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                                <span>Evidence: {protocol.evidenceScore}</span>
                            </span>
                            <span className="text-brand-400 hover:text-brand-300 cursor-pointer transition-colors">
                                View Monograph →
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Custom Protocol Entry Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-[#11141c] border border-border rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
                        <div className="flex items-center justify-between border-b border-white/5 pb-3">
                            <div className="flex items-center gap-2">
                                <Stethoscope className="h-5 w-5 text-brand-400" />
                                <h3 className="font-serif text-lg text-foreground">Add Custom Physician Protocol</h3>
                            </div>
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="text-xs text-muted-foreground hover:text-foreground font-mono"
                            >
                                ✕
                            </button>
                        </div>

                        <form onSubmit={handleCreateProtocol} className="space-y-4 text-xs">
                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Compound or Intervention Name</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Rapamycin (Sirolimus)"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-foreground focus:border-brand-500 outline-none"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-muted-foreground mb-1 font-medium">Target Biomarker</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Fasting Insulin / mTOR"
                                        value={targetMarker}
                                        onChange={(e) => setTargetMarker(e.target.value)}
                                        className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-foreground focus:border-brand-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-muted-foreground mb-1 font-medium">Class / Category</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Autophagy Enhancer"
                                        value={compoundClass}
                                        onChange={(e) => setCompoundClass(e.target.value)}
                                        className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-foreground focus:border-brand-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Clinical Mechanism & Dosing Guidance</label>
                                <textarea
                                    required
                                    rows={3}
                                    placeholder="Describe biochemical pathway, dosing schedule, and monitoring parameters..."
                                    value={mechanism}
                                    onChange={(e) => setMechanism(e.target.value)}
                                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-foreground focus:border-brand-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-muted-foreground mb-1 font-medium">Synergistic Lifestyle Lever</label>
                                <input
                                    type="text"
                                    placeholder="e.g. 16:8 Time-Restricted Feeding"
                                    value={lifestyleSynergy}
                                    onChange={(e) => setLifestyleSynergy(e.target.value)}
                                    className="w-full bg-zinc-900 border border-border rounded-lg px-3 py-2 text-foreground focus:border-brand-500 outline-none"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-3 border-t border-white/5">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-4 py-2 rounded-lg border border-border text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors flex items-center gap-1.5"
                                >
                                    <Check className="h-4 w-4" />
                                    <span>Save to Formulary</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
