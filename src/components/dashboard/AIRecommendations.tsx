"use client";

import { useState, useEffect } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown"; // Verify if I need to install this or just render text.
// Use simple rendering for now to avoid extra dependencies if possible, or just text.
// The prompt asks for markdown list. simpler to just render with simple paragraph splitting or install react-markdown.
// I'll stick to simple split or assume simple text for MVP. behavior.

interface Marker {
    label: string;
    value: number;
    unit: string;
    status: "yellow" | "red";
}

interface AIRecommendationsProps {
    markers: Marker[];
}

export function AIRecommendations({ markers }: AIRecommendationsProps) {
    const [recommendations, setRecommendations] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!recommendations) {
            setLoading(true);
            fetch('/api/recommendations', {
                method: 'POST',
                body: JSON.stringify({ markers }), // matches API expectation
            })
                .then(async res => {
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.details || data.error || "API Error");
                    return data;
                })
                .then(data => {
                    setRecommendations(data.text);
                    setLoading(false);
                })
                .catch(err => {
                    console.error(err);
                    setRecommendations(`**Error**: ${err.message}`);
                    setLoading(false);
                });
        }
    }, [markers, recommendations]);

    // Removed early return to allow "Nominal" success message


    return (
        <div className="bg-card border border-gold-500/30 rounded-2xl p-6 h-full relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Sparkles className="h-24 w-24 text-gold-500" />
            </div>

            <h3 className="font-serif text-lg mb-4 text-gold-500 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                AI Protocol
            </h3>

            {loading ? (
                <div className="flex flex-col items-center justify-center h-32 text-muted-foreground gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-gold-500" />
                    <span className="text-xs">Generating personal protocol...</span>
                </div>
            ) : (
                <div className="text-sm text-muted-foreground break-words space-y-3 overflow-y-auto custom-scrollbar pr-2" style={{ maxHeight: 'calc(100% - 3rem)' }}>
                    <ReactMarkdown
                        components={{
                            strong: ({ node, ...props }) => <span className="font-semibold text-foreground" {...props} />, // Inline, standard color
                            ul: ({ node, ...props }) => <ul className="pl-5 list-disc space-y-1 marker:text-gold-500" {...props} />,
                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                            p: ({ node, ...props }) => <p className="leading-relaxed mb-2" {...props} />
                        }}
                    >
                        {recommendations}
                    </ReactMarkdown>
                </div>
            )}
        </div>
    );
}
