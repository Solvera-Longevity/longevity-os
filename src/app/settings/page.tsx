import { Shield, Sliders, Key, Check } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-accent-400 bg-accent-500/10 px-2 py-0.5 rounded-full border border-accent-500/20">
                        Preferences & Integrations
                    </span>
                </div>
                <h1 className="text-3xl font-serif text-foreground">Platform Settings</h1>
                <p className="text-sm text-muted-foreground mt-1">
                    Manage clinical algorithm parameters, HIPAA privacy flags, and external AI synthesis models.
                </p>
            </div>

            {/* Section 1: Algorithmic Tuning */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400">
                        <Sliders className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-serif text-foreground">PhenoAge Calibration</h2>
                        <p className="text-xs text-muted-foreground">Adjust baseline population cohort offsets for the Levine (2018) hazard regression model.</p>
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                            <span className="font-medium text-foreground block">Reference Cohort Intercept</span>
                            <span className="text-xs text-muted-foreground">Default NHANES III calibrated offset (-14.12)</span>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs text-brand-400">
                            -14.12 (Active)
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                            <span className="font-medium text-foreground block">Safety Hard Deck</span>
                            <span className="text-xs text-muted-foreground">Clamp minimum biological floor to prevent negative age output on hyper-optimized panels</span>
                        </div>
                        <span className="px-3 py-1 rounded-lg bg-zinc-900 border border-white/10 font-mono text-xs text-green-400 flex items-center gap-1.5">
                            <Check className="h-3.5 w-3.5" /> Enforced (18 yrs)
                        </span>
                    </div>
                </div>
            </div>

            {/* Section 2: Privacy & HIPAA Safeguards */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-accent-500/10 border border-accent-500/20 flex items-center justify-center text-accent-400">
                        <Shield className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-serif text-foreground">HIPAA & Research Safeguards</h2>
                        <p className="text-xs text-muted-foreground">Data sanitization and local computation security controls.</p>
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                            <span className="font-medium text-foreground block">Client-Side Intake Processing</span>
                            <span className="text-xs text-muted-foreground">Direct CSV parsing runs entirely within browser memory; zero server persistence of raw files</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-xs">
                            Active
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                            <span className="font-medium text-foreground block">PHI Sanitization on AI Route</span>
                            <span className="text-xs text-muted-foreground">Stripping MRN, DOB, and patient full name before dispatching biomarker arrays to LLM</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 font-mono text-xs">
                            Enforced
                        </span>
                    </div>
                </div>
            </div>

            {/* Section 3: AI Inference Engine */}
            <div className="rounded-2xl border border-border bg-card p-6 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                    <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                        <Key className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-lg font-serif text-foreground">Clinical Decision Support Model</h2>
                        <p className="text-xs text-muted-foreground">Configure the active large language model for multi-marker protocol reasoning.</p>
                    </div>
                </div>

                <div className="space-y-4 text-sm">
                    <div className="flex items-center justify-between py-2 border-b border-white/5">
                        <div>
                            <span className="font-medium text-foreground block">Active Model</span>
                            <span className="text-xs text-muted-foreground">Google AI SDK • Fast clinical synthesis tier</span>
                        </div>
                        <span className="font-mono text-xs text-foreground px-3 py-1 bg-zinc-900 border border-white/10 rounded-lg">
                            gemini-2.0-flash
                        </span>
                    </div>

                    <div className="flex items-center justify-between py-2">
                        <div>
                            <span className="font-medium text-foreground block">Offline Resilience</span>
                            <span className="text-xs text-muted-foreground">Automatic graceful fallback to local clinical trial monographs when offline</span>
                        </div>
                        <span className="px-3 py-1 rounded-full bg-accent-500/10 border border-accent-500/20 text-accent-400 font-mono text-xs">
                            Standby Mocks Ready
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
