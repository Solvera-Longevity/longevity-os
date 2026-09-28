import { generateText } from 'ai';
import { google } from '@ai-sdk/google';
import { protocolEngine } from "@/utils/protocolEngine";

interface RecommendationMarker {
    label: string;
    value: number;
    unit: string;
    status: "green" | "yellow" | "red";
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const markers: RecommendationMarker[] = body?.markers;

        if (!Array.isArray(markers)) {
            return Response.json({ error: "Invalid or missing markers payload" }, { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;

        // Ensure engine is initialized
        await protocolEngine.init();

        // Build context from Protocol Engine for non-nominal markers
        let protocolContext = "Match the following clinical protocols if applicable:\n";
        const isNominal = markers.length === 0;

        if (!isNominal) {
            markers.forEach((m) => {
                if (m.status === "red" || m.status === "yellow") {
                    const p = protocolEngine.getProtocol(m.label);
                    if (p) {
                        protocolContext += `- For ${m.label} (${m.value} ${m.unit}): Consider ${p.peptide}. Mechanism: ${p.mechanism}. Dosing: ${p.dosing?.dose || "See clinician"}. Safety: ${p.safety?.cautions || "None listed"}.\n`;
                    }
                }
            });
        }

        // Development/offline fallback when API key is not configured
        if (!apiKey) {
            await new Promise(r => setTimeout(r, 600));
            if (isNominal) {
                return Response.json({
                    text: "**Biomarkers Optimal**\n\nAll tested biomarkers are within target longevity reference ranges. Maintain existing diet, resistance training, and recovery protocols."
                });
            }
            const mockResponse = `Based on your biomarker results:
1. **Targeted Interventions**: ${protocolContext.includes("Thymosin") ? "Immunomodulatory protocols indicated for elevated systemic inflammation." : "Protocol review indicated for out-of-range markers."}
2. **Foundational Levers**: Prioritize circadian sleep alignment, zone-2 cardiovascular training, and anti-inflammatory nutrition.`;
            return Response.json({ text: mockResponse });
        }

        const systemPrompt = isNominal
            ? 'You are an evidence-based clinical longevity specialist. The patient blood panel is fully optimal. Deliver a concise, professional summary note.'
            : 'You are an evidence-based functional longevity clinician. Use the provided protocol data to evaluate out-of-range biomarkers and explain the physiological mechanisms. When compounds are outside the indexed protocols, recommend actionable lifestyle interventions.';

        const userPrompt = isNominal
            ? "The user's biomarkers are all optimal. Write a concise, encouraging clinical summary (maximum 2 sentences) on their health status."
            : `User Biomarkers (Out of Range):
${JSON.stringify(markers, null, 2)}

Available Clinical Protocols (Reference Only):
${protocolContext}

Instructions:
1. Provide a concise clinical summary of the recommended protocols based on the out-of-range markers.
2. Explain the physiological rationale and synergy across markers (e.g. chronic inflammation and metabolic sensitivity).
3. Reference specific mechanisms or dosing guidelines where present in context.
4. Format with clean Markdown paragraphs and **bold** key terms.
5. Do not include meta commentary or preamble.`;

        const { text } = await generateText({
            model: google('models/gemini-2.0-flash'),
            system: systemPrompt,
            prompt: userPrompt,
        });

        return Response.json({ text });

    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "Internal server error";
        console.error("Recommendations API error:", error);
        return Response.json({
            error: 'Failed to generate recommendations',
            details: errorMessage
        }, { status: 500 });
    }
}


