import { BiomarkerCard } from "./BiomarkerCard";
import { LabResult } from "@/utils/mockData";
import RANGES from "@/data/ranges.json";

interface DashboardGridProps {
    data: LabResult;
}

interface BiomarkerDefinition {
    id: string;
    label: string;
    unit: string;
    category: string;
    slider?: { min?: number; max?: number };
    thresholds: {
        green: { min?: number; max?: number };
        yellow: { min?: number; max?: number };
        red: { min?: number; max?: number };
    };
}

const rangeDefinitions = RANGES as BiomarkerDefinition[];

export function DashboardGrid({ data }: DashboardGridProps) {
    const markers = Object.entries(data.markers).flatMap(([key, value]) => {
        const def = rangeDefinitions.find(r => r.id === key);
        if (!def || typeof value !== "number") return [];
        return [{ key, value, def }];
    });

    // Group by category
    const categories: Record<string, typeof markers> = {};
    markers.forEach(m => {
        const cat = m.def.category || "Other";
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(m);
    });

    return (
        <div className="space-y-8">
            {Object.entries(categories).map(([category, items]) => (
                <div key={category}>
                    <h3 className="text-lg font-serif text-gold-500 mb-4 border-b border-gold-500/20 pb-2 inline-block">
                        {category}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-start">
                        {items.map((item) => (
                            <BiomarkerCard
                                key={item.key}
                                label={item.def.label}
                                value={item.value as number}
                                unit={item.def.unit}
                                thresholds={item.def.thresholds}
                                sliderConfig={item.def.slider}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
