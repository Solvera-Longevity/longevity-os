import { BiomarkerCard } from "./BiomarkerCard";
import { LabResult, BiomarkerId } from "@/utils/mockData";
import RANGES from "@/data/ranges.json";

interface DashboardGridProps {
    data: LabResult;
}

export function DashboardGrid({ data }: DashboardGridProps) {
    // Map markers to ranges by ID
    const markers = Object.entries(data.markers).map(([key, value]) => {
        const def = RANGES.find(r => r.id === key);
        return {
            key,
            value,
            def
        };
    }).filter(m => m.def); // Only show known markers

    // Group by category
    const categories: Record<string, typeof markers> = {};
    markers.forEach(m => {
        const cat = m.def?.category || "Other";
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
                                label={item.def!.label}
                                value={item.value as number}
                                unit={item.def!.unit}
                                thresholds={item.def!.thresholds}
                                category={category}
                                sliderConfig={(item.def as any).slider}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
