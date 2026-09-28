import { cn } from "@/lib/utils";
import { User, Activity, TrendingDown, TrendingUp } from "lucide-react";

interface BiologicalAgeMeterProps {
    chronologicalAge: number;
    biologicalAge: number;
    name?: string;
    gender?: string;
}

export function BiologicalAgeMeter({ chronologicalAge, biologicalAge, name = "Clinical Patient", gender = "Male" }: BiologicalAgeMeterProps) {
    const ageDiff = chronologicalAge - biologicalAge;
    const isAgingWell = ageDiff >= 0;
    const yearsDelta = Math.abs(ageDiff).toFixed(1);

    return (
        <section aria-label="Biological Age Assessment Hero" className="relative overflow-hidden rounded-2xl border border-brand-500/25 bg-gradient-to-br from-[#121624] via-[#0d101a] to-[#090b10] p-6 md:p-8 shadow-2xl">
            {/* Ambient Background Glows */}
            <div className="pointer-events-none absolute -top-24 -left-20 h-64 w-64 rounded-full bg-brand-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-20 h-64 w-64 rounded-full bg-accent-500/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                {/* Patient Profile Cardlet */}
                <div className="flex items-center gap-4 min-w-[240px]">
                    <div className="relative h-14 w-14 rounded-2xl bg-gradient-to-br from-brand-500/20 to-accent-500/20 border border-brand-500/30 flex items-center justify-center text-brand-400 shadow-inner">
                        <User className="h-7 w-7" />
                        <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-green-500 ring-4 ring-[#0d101a]" title="Active Record" />
                    </div>
                    <div>
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-400 block font-mono">
                            Verified Clinical Panel
                        </span>
                        <h2 className="text-2xl font-serif text-foreground leading-tight mt-0.5">{name}</h2>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider font-mono mt-0.5">
                            {gender} • Record ID #8492
                        </p>
                    </div>
                </div>

                {/* Primary Metric Displays */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 lg:gap-10 items-center justify-items-center sm:justify-items-stretch">
                    {/* Chronological Age */}
                    <div className="text-center sm:text-left bg-white/[0.02] sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold block mb-1.5">
                            Chronological
                        </span>
                        <div className="flex items-baseline justify-center sm:justify-start gap-1.5">
                            <span className="text-4xl md:text-5xl font-display font-bold tracking-tight text-muted-foreground/80">
                                {chronologicalAge}
                            </span>
                            <span className="text-sm font-mono text-muted-foreground/60">yrs</span>
                        </div>
                    </div>

                    {/* Biological Age Hero Highlight */}
                    <div className="text-center bg-brand-500/[0.08] border border-brand-500/30 px-6 py-4 rounded-2xl w-full sm:w-auto relative shadow-lg">
                        <span className="text-xs uppercase tracking-[0.18em] text-brand-400 font-semibold block mb-1">
                            Biological Age
                        </span>
                        <div className="flex items-baseline justify-center gap-1.5">
                            <span className="text-5xl md:text-6xl font-display font-extrabold tracking-tight text-white drop-shadow-[0_0_20px_rgba(115,84,196,0.5)]">
                                {biologicalAge}
                            </span>
                            <span className="text-sm font-mono text-brand-300 font-semibold">yrs</span>
                        </div>
                    </div>

                    {/* Aging Pace Badge */}
                    <div className="text-center sm:text-right bg-white/[0.02] sm:bg-transparent p-4 sm:p-0 rounded-xl sm:rounded-none w-full sm:w-auto">
                        <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground font-semibold block mb-2">
                            Aging Velocity
                        </span>
                        <div className="flex flex-col items-center sm:items-end">
                            <div className={cn(
                                "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold font-mono tracking-wide border shadow-sm",
                                isAgingWell 
                                    ? "text-green-400 border-green-500/30 bg-green-500/10" 
                                    : "text-red-400 border-red-500/30 bg-red-500/10"
                            )}>
                                {isAgingWell ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
                                <span>{isAgingWell ? `Slowed (-${yearsDelta} yrs)` : `Accelerated (+${yearsDelta} yrs)`}</span>
                            </div>
                            <span className="text-[11px] text-muted-foreground mt-1.5 font-medium flex items-center gap-1">
                                <Activity className="h-3 w-3 text-accent-400" /> vs chronological baseline
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
