import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, Minus, CheckCircle, AlertTriangle, AlertCircle, ChevronDown, ChevronUp, Pill, BookOpen, ShieldAlert } from "lucide-react";
import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface Thresholds {
    green: { min?: number; max?: number };
    yellow: { min?: number; max?: number };
    red: { min?: number; max?: number };
}

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

interface BiomarkerCardProps {
    label: string;
    value: number;
    unit: string;
    thresholds: Thresholds;
    category?: string;
    sliderConfig?: { min?: number; max?: number };
}

export function BiomarkerCard({ label, value, unit, thresholds, category, sliderConfig }: BiomarkerCardProps) {
    const [protocol, setProtocol] = useState<ProtocolMatch | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const [loadingProtocol, setLoadingProtocol] = useState(false);

    // Determine status
    let status: "green" | "yellow" | "red" = "green";
    const inRange = (val: number, range?: { min?: number; max?: number }) => {
        if (!range) return false;
        const { min, max } = range;
        if (min !== undefined && val < min) return false;
        if (max !== undefined && val > max) return false;
        return true;
    };
    if (inRange(value, thresholds.green)) status = "green";
    else if (inRange(value, thresholds.yellow)) status = "yellow";
    else status = "red";

    // Fetch protocol if out of RANGE (yellow OR red)
    useEffect(() => {
        if (status !== "green" && !protocol && !loadingProtocol) {
            setLoadingProtocol(true);
            fetch('/api/protocols', { method: 'POST', body: JSON.stringify({ marker: label }) })
                .then(res => res.json())
                .then(data => {
                    if (data.protocol) {
                        setProtocol(data.protocol);
                    } else {
                        // Fallback if no specific protocol found
                        setProtocol({
                            condition: "Observation",
                            peptide: "Monitor & Consult",
                            mechanism: "Value is outside optimal range. No specific protocol indexed.",
                            dosing: { dose: "N/A", frequency: "N/A", route: "N/A", duration: "N/A" },
                            safety: { cautions: "Consult clinician.", source: "" },
                            source: "General"
                        });
                    }
                    setLoadingProtocol(false);
                })
                .catch(() => {
                    // Start fallback on error too
                    setProtocol({
                        condition: "Observation",
                        peptide: "Monitor & Consult",
                        mechanism: "Value is outside optimal range. No specific protocol indexed.",
                        dosing: { dose: "N/A", frequency: "N/A", route: "N/A", duration: "N/A" },
                        safety: { cautions: "Consult clinician.", source: "" },
                        source: "General"
                    });
                    setLoadingProtocol(false);
                });
        }
    }, [status, label, protocol, loadingProtocol]);

    // Range Visualization Logic
    // We need a display range. 
    // Heuristic: Start at 0 (or lower bound of red). End at 3x upper bound of green OR 1.2x of value (whichever is larger)
    // MANUAL OVERRIDE: Check sliderConfig first
    const safeMin = thresholds.green.min ?? 0;
    const safeMax = thresholds.green.max ?? 100;
    // ensure displayMax covers the value comfortably OR uses manual max
    const displayMax = sliderConfig?.max ?? Math.max(safeMax * 3, value * 1.2);
    const percentage = Math.min(100, Math.max(0, (value / displayMax) * 100));

    // Status Styles for dot and text
    const statusBg = status === "green" ? "bg-green-500" : status === "yellow" ? "bg-yellow-500" : "bg-red-500";
    const statusColor = status === "green" ? "text-green-500" : status === "yellow" ? "text-yellow-500" : "text-red-500";

    const statusStyles = {
        green: "border-green-500/30",
        yellow: "border-yellow-500/50",
        red: "border-red-500/50",
    };

    const isOptimal = status === "green";

    // Parse label for separation (e.g. "C-Reactive Protein (hs-CRP)")
    const labelMatch = label.match(/^(.*?)\s*(\(.*\))$/);
    const mainLabel = labelMatch ? labelMatch[1] : label;
    const subLabel = labelMatch ? labelMatch[2] : null;

    return (
        <div className={cn("rounded-xl border transition-all overflow-hidden flex flex-col hover:shadow-lg hover:border-opacity-100 bg-card", statusStyles[status])}>
            <div className="p-5 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1 h-[4rem]">
                    <div className="group-hover:text-gold-500 transition-colors max-w-[65%] flex flex-col justify-start h-full">
                        <h3 className="text-sm font-medium text-foreground leading-tight line-clamp-2">{mainLabel}</h3>
                        {subLabel && <span className="text-xs text-muted-foreground font-normal block mt-0.5 truncate">{subLabel}</span>}
                    </div>
                    {/* Status Text (Top Right) */}
                    <span className={cn("text-[10px] uppercase font-bold tracking-wider whitespace-nowrap ml-2 mt-1", statusColor)}>
                        {status === "green" ? "Optimal" : status === "yellow" ? "Outside Range" : "Critical"}
                    </span>
                </div>

                <div className="mt-1 mb-4">
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold font-serif text-foreground">{value}</span>
                        <span className="text-xs text-muted-foreground">{unit}</span>
                    </div>
                    {/* Target Range Display */}
                    <div className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                        Target: <span className="text-foreground/80">{safeMin} – {safeMax}</span>
                    </div>
                </div>

                {/* Range Slider Visual */}
                <div className="mt-auto pt-4 relative pb-6">
                    <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden relative">
                        {/* Removed Green Zone Background as requested */}
                    </div>
                    {/* The Marker */}
                    <div
                        className={cn("absolute top-[16px] -mt-1 h-3 w-3 rounded-full border-2 border-card shadow-sm transform -translate-x-1/2 flex items-center justify-center", statusBg)}
                        style={{ left: `${percentage}%` }}
                    >
                        {/* Floating Value Label */}
                        <span className="absolute -top-6 text-[10px] font-bold text-foreground bg-card border border-white/10 px-1 py-0.5 rounded shadow-sm whitespace-nowrap">
                            {value}
                        </span>
                    </div>

                    {/* Range Labels - Just 0 and Max, no middle, no optimal labels under slider */}
                    <div className="flex justify-between text-[10px] text-muted-foreground mt-2 font-mono relative h-4">
                        <span>0</span>
                        <span>{displayMax.toFixed(0)}</span>
                    </div>
                </div>

                {/* Footer Actions (Always Render for Uniformity) */}
                <div className="flex justify-end mt-2 pt-2 border-t border-dashed border-white/5 h-[40px] items-center">
                    {!isOptimal ? (
                        protocol ? (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsExpanded(!isExpanded);
                                }}
                                className="text-gold-500 hover:text-gold-400 text-xs flex items-center gap-1 transition-colors font-medium border border-gold-500/20 px-2 py-1 rounded hover:bg-gold-500/10"
                            >
                                {isExpanded ? "Hide Protocol" : "View Protocol"}
                                {isExpanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                            </button>
                        ) : (
                            // Loading State
                            <span className="text-[10px] text-muted-foreground animate-pulse">Checking protocol...</span>
                        )
                    ) : (
                        // Ghost button for spacing (Optimal cards)
                        <div className="text-xs flex items-center gap-1 font-medium border border-transparent px-2 py-1 opacity-0 pointer-events-none">
                            View Protocol
                        </div>
                    )}
                </div>
            </div>

            {/* Protocol Expandable Section */}
            {isExpanded && protocol && (
                <div className="bg-zinc-900/80 border-t border-gold-500/20 p-5 space-y-4 animate-in slide-in-from-top-2 duration-300 backdrop-blur-sm text-left">
                    {/* Recommendation */}
                    <div>
                        <div className="flex items-center gap-2 text-gold-500 mb-2">
                            <Pill className="h-3.5 w-3.5" />
                            <span className="text-xs font-bold uppercase tracking-wide">Recommendation</span>
                        </div>
                        <p className="text-sm font-semibold text-foreground mb-1">{protocol.peptide}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{protocol.mechanism}</p>
                    </div>

                    {/* Standard Dosing - Only show if valid */}
                    {protocol.dosing && protocol.dosing.dose !== "N/A" && (
                        <div className="bg-black/40 rounded border border-white/5 p-3">
                            <span className="text-[10px] uppercase tracking-wider text-muted-foreground block mb-2">Standard Protocol</span>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <span className="text-zinc-500 block">Dosage</span>
                                    <span className="text-zinc-300">{protocol.dosing.dose}</span>
                                </div>
                                <div>
                                    <span className="text-zinc-500 block">Frequency</span>
                                    <span className="text-zinc-300">{protocol.dosing.frequency}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Source */}
                    {protocol.safety?.source && (
                        <a href={protocol.safety.source} target="_blank" rel="noopener noreferrer" className="text-[10px] text-zinc-500 hover:text-gold-500 flex items-center gap-1 transition-colors mt-2">
                            <BookOpen className="h-3 w-3" />
                            Source Reference
                        </a>
                    )}
                </div>
            )}
        </div>
    );
}
