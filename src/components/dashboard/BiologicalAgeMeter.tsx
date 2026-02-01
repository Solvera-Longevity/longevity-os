import { cn } from "@/lib/utils";
import { User, Activity } from "lucide-react";

interface BiologicalAgeMeterProps {
    chronologicalAge: number;
    biologicalAge: number;
    name?: string;
    gender?: string;
}

export function BiologicalAgeMeter({ chronologicalAge, biologicalAge, name = "Johnny Optimal", gender = "Male" }: BiologicalAgeMeterProps) {
    const ageDiff = chronologicalAge - biologicalAge;
    const isAgingWell = ageDiff >= 0;
    const yearsDelta = Math.abs(ageDiff).toFixed(1);

    return (
        <div className="rounded-xl border border-white/5 bg-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
            {/* Patient Info */}
            <div className="flex items-center gap-4 min-w-[200px]">
                <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-muted-foreground">
                    <User className="h-6 w-6" />
                </div>
                <div>
                    <h3 className="text-xl font-serif text-foreground leading-none mb-1">{name}</h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">{gender} • ID #8492</p>
                </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-12 bg-white/10" />

            {/* Chronological */}
            <div className="text-center">
                <span className="text-md uppercase tracking-wider text-gold-500 block mb-1">Chronological</span>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold font-serif text-muted-foreground/70">{chronologicalAge}</span>
                    <span className="text-sm text-muted-foreground">yrs</span>
                </div>
            </div>

            {/* Biological */}
            <div className="text-center">
                <span className="text-md uppercase tracking-wider text-gold-500 block mb-1">Biological Age</span>
                <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold font-serif text-white shadow-gold-glow">{biologicalAge}</span>
                    <span className="text-sm text-muted-foreground">yrs</span>
                </div>
            </div>

            {/* Vertical Divider */}
            <div className="hidden md:block w-px h-12 bg-white/10" />

            {/* Performance / Rate */}
            <div className="text-center min-w-[150px]">
                <span className="text-md uppercase tracking-wider text-gold-500 block mb-1">Aging Pace</span>
                <div className="flex flex-col items-center">
                    <span className={cn("text-sm font-medium px-2 py-0.5 rounded-full border mb-1", isAgingWell ? "text-green-500 border-green-500/20 bg-green-500/5" : "text-red-500 border-red-500/20 bg-red-500/5")}>
                        {isAgingWell ? "Slow (-" + yearsDelta + ")" : "Accelerated (+" + yearsDelta + ")"}
                    </span>
                </div>
            </div>
        </div>
    );
}
