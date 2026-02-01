"use client";

import { LabResult, MOCK_HISTORY, BiomarkerId } from "@/utils/mockData";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { useState } from "react";
import RANGES from "@/data/ranges.json";

export function TimelineChart() {
    const [selectedMetric, setSelectedMetric] = useState<string>("phenoAge");

    // Format data for Recharts
    const data = MOCK_HISTORY.map(report => ({
        date: report.date,
        phenoAge: report.calculatedPhenoAge,
        chronologicalAge: report.phenoAgeInputs?.age,
        ...report.markers
    }));

    const metrics = [
        { id: "phenoAge", label: "Biological Age" },
        ...RANGES.map(r => ({ id: r.id, label: r.label }))
    ];

    const currentMetricDef = RANGES.find(r => r.id === selectedMetric);

    return (
        <div className="bg-card border border-border rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-serif">Historical Trends</h3>
                <select
                    value={selectedMetric}
                    onChange={(e) => setSelectedMetric(e.target.value)}
                    className="bg-black/20 border border-border rounded px-3 py-1 text-sm text-foreground focus:border-gold-500 outline-none"
                >
                    <option value="phenoAge">Biological Age</option>
                    {metrics.filter(m => m.id !== "phenoAge").map(m => (
                        <option key={m.id} value={m.id}>{m.label}</option>
                    ))}
                </select>
            </div>

            <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="date" stroke="#666" fontSize={12} tickFormatter={(val) => new Date(val).toLocaleDateString()} />
                        <YAxis stroke="#666" fontSize={12} domain={['auto', 'auto']} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#171717', borderColor: '#333', color: '#fff' }}
                            itemStyle={{ color: '#fff' }}
                            labelStyle={{ color: '#888' }}
                        />
                        <Legend />

                        {/* Contextual Lines based on selection */}
                        {selectedMetric === "phenoAge" ? (
                            <>
                                <Line type="monotone" dataKey="phenoAge" stroke="#D4AF37" strokeWidth={3} name="Biological Age" dot={{ r: 5, fill: "#D4AF37" }} />
                                <Line type="monotone" dataKey="chronologicalAge" stroke="#666" strokeDasharray="5 5" name="Chronological Age" />
                            </>
                        ) : (
                            <Line
                                type="monotone"
                                dataKey={selectedMetric}
                                stroke="#D4AF37"
                                strokeWidth={3}
                                name={metrics.find(m => m.id === selectedMetric)?.label}
                                dot={{ r: 5, fill: "#D4AF37" }}
                            />
                        )}

                        {/* If simple metric and has ranges, maybe show reference lines? 
                Recharts ReferenceLine is good but ranges might vary. 
                Keeping it simple for MVP.
            */}
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {currentMetricDef && (
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground justify-center">
                    <span>Optimal: {currentMetricDef.thresholds.green.min || 0} - {currentMetricDef.thresholds.green.max || "?"} {currentMetricDef.unit}</span>
                </div>
            )}
        </div>
    );
}
