import { TimelineChart } from "@/components/dashboard/TimelineChart";

export default function TimelinePage() {
    return (
        <div className="space-y-8 max-w-7xl mx-auto">
            <div>
                <h1 className="text-3xl font-serif text-foreground mb-2">Timeline</h1>
                <p className="text-muted-foreground">Track your progress and biological age trends over time.</p>
            </div>

            <TimelineChart />

            {/* List of past reports */}
            <div className="grid gap-4 mt-8">
                <h2 className="text-xl font-serif text-gold-500">Past Reports</h2>
                {/* List mocked here or reuse a component */}
                <div className="p-4 bg-card border border-border rounded-lg flex justify-between items-center bg-white/5">
                    <div>
                        <p className="font-medium">January 15, 2024</p>
                        <p className="text-xs text-muted-foreground">Comprehensive Panel</p>
                    </div>
                    <div className="text-right">
                        <p className="font-serif font-bold text-gold-500">38.2 Years</p>
                        <p className="text-xs text-muted-foreground">Biological Age</p>
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-medium">July 20, 2023</p>
                        <p className="text-xs text-muted-foreground">Comprehensive Panel</p>
                    </div>
                    <div className="text-right">
                        <p className="font-serif font-bold text-muted-foreground">43.1 Years</p>
                        <p className="text-xs text-muted-foreground">Biological Age</p>
                    </div>
                </div>
                <div className="p-4 bg-card border border-border rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-medium">January 12, 2023</p>
                        <p className="text-xs text-muted-foreground">Comprehensive Panel</p>
                    </div>
                    <div className="text-right">
                        <p className="font-serif font-bold text-red-500">46.5 Years</p>
                        <p className="text-xs text-muted-foreground">Biological Age</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
