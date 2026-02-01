"use client";

import { UploadCloud, Loader2 } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface UploadWidgetProps {
    onUpload: (file: File) => void;
    isAnalyzing: boolean;
}

export function UploadWidget({ onUpload, isAnalyzing }: UploadWidgetProps) {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onUpload(e.target.files[0]);
        }
    };

    return (
        <div className="relative h-full">
            <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
                disabled={isAnalyzing}
            />
            <div
                className={cn(
                    "border border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center h-full transition-all hover:bg-white/5 hover:border-gold-500/50",
                    isAnalyzing && "opacity-50"
                )}
            >
                {isAnalyzing ? (
                    <>
                        <Loader2 className="h-10 w-10 text-gold-500 animate-spin mb-4" />
                        <p className="text-sm font-medium text-gold-500">Analyzing Lab Data...</p>
                    </>
                ) : (
                    <>
                        <div className="h-12 w-12 rounded-full bg-gold-500/10 flex items-center justify-center mb-4 text-gold-500">
                            <UploadCloud className="h-6 w-6" />
                        </div>
                        <h4 className="font-serif text-lg text-foreground mb-1">Upload Lab Report</h4>
                        <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                            Drag & drop your PDF or CSV file here to analyze.
                        </p>
                    </>
                )}
            </div>
        </div>
    );
}
