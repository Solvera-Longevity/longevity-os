"use client";

import { useState, useEffect } from "react";
import { ClipboardCheck, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface OutlierMarker {
    label: string;
    value: number;
    unit: string;
    status: "yellow" | "red";
}

interface AIRecommendationsProps {
    markers: OutlierMarker[];
}

export function AIRecommendations({ markers }: AIRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        let isMounted = true;

        async function fetchRecommendations() {
            setLoading(true);
            try {
                const res = await fetch("/api/recommendations", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markers }),
                });
                const data = await res.json();
                if (!res.ok) {
                    throw new Error(data.details || data.error || "Failed to fetch recommendations");
                }
                if (isMounted) {
                    setRecommendations(data.text);
                }
            } catch (err: unknown) {
                const message = err instanceof Error ? err.message : "An unexpected error occurred";
                if (isMounted) {
                    setRecommendations(`**Notice**: Unable to generate protocol synthesis (${message}). Please consult clinical staff.`);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        }

        fetchRecommendations();

        return () => {
            isMounted = false;
        };
    }, [markers]);

    return (
        <div className="bg-card border border-border rounded-2xl p-6 h-full relative overflow-hidden">
            <h3 className="font-serif text-lg mb-4 text-brand-400 flex items-center gap-2">
                <ClipboardCheck className="h-4 w-4 text-accent-400" />
                Clinical Protocol Summary
            </h3>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-brand-400" />
                    <span className="text-xs">Synthesizing personalized protocol...</span>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground break-words space-y-3 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: "calc(100% - 3rem)" }}>
                    <ReactMarkdown
                        components={{
                            h3: ({ ...props }) => <h4 className="text-xs font-semibold uppercase tracking-wider text-brand-400 mt-3 mb-1 border-b border-white/5 pb-1" {...props} />,
                            strong: ({ ...props }) => <span className="font-semibold text-foreground" {...props} />,
                            ul: ({ ...props }) => <ul className="pl-5 list-disc space-y-1.5 marker:text-brand-400 my-2" {...props} />,
                            li: ({ ...props }) => <li className="pl-1 leading-relaxed" {...props} />,
                            p: ({ ...props }) => <p className="leading-relaxed mb-2" {...props} />,
                            code: ({ ...props }) => <code className="px-1.5 py-0.5 rounded bg-zinc-900 border border-white/10 font-mono text-xs text-accent-300" {...props} />
                        }}
                    >
                        {recommendations}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
}
