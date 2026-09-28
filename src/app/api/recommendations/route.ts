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
                    text: `### Clinical Overview
Your tested biomarker panel is completely nominal, demonstrating optimal baseline cellular health and low cardiovascular-metabolic risk.

### Foundational Longevity Levers
- **Metabolic Maintenance**: Continue zone-2 endurance conditioning (3–4 sessions weekly) to sustain glycemic insulin sensitivity.
- **Sleep & Recovery**: Target 7.5–8.5 hours with consistent sleep/wake timing to preserve low baseline systemic inflammation.
- **Micronutrient Sufficiency**: Maintain regular dietary polyphenols and balanced omega-3 fatty acid intake.`
                });
            }

            // Build dynamic protocol summaries for each flagged marker
            const protocolSummaries: string[] = [];
            const lifestyleSummaries: string[] = [];

            markers.forEach((m) => {
                if (m.status === "red" || m.status === "yellow") {
                    const p = protocolEngine.getProtocol(m.label);
                    if (p) {
                        protocolSummaries.push(
                            `- **${p.peptide}** (${p.condition} — flagged by ${m.label} at ${m.value} ${m.unit}):\n  ${p.mechanism} Standard study dosing reference: \`${p.dosing?.dose || "Clinician guided"}\` (${p.dosing?.frequency || "as directed"}).`
                        );
                        if (p.lifestyle) {
                            lifestyleSummaries.push(`- **${m.label} Support**: ${p.lifestyle}`);
                        }
                    }
                }
            });

            const fallbackText = `### Clinical Assessment & Synergy
Out-of-range biomarkers indicate elevated systemic stress across inflammatory and metabolic pathways. Interventions should prioritize cellular repair, endothelial stabilization, and mitochondrial support.

### Recommended Targeted Protocols
${protocolSummaries.length > 0 ? protocolSummaries.join("\n\n") : "- **Clinical Evaluation**: Detailed physician review recommended for out-of-range clinical endpoints."}

### Synergistic Lifestyle Interventions
${lifestyleSummaries.length > 0 ? lifestyleSummaries.join("\n") : "- Prioritize circadian alignment, zone-2 cardiovascular training, and anti-inflammatory whole-food nutrition."}`;

            return Response.json({ text: fallbackText });
        }

        const systemPrompt = isNominal
            ? 'You are an evidence-based clinical longevity specialist. The patient blood panel is fully optimal. Deliver a structured clinical summary with foundational health levers.'
            : 'You are an evidence-based functional longevity clinician. Analyze out-of-range laboratory biomarkers and synthesize actionable, brief summaries for each recommended therapeutic protocol, including mechanisms of action and synergistic lifestyle levers.';

        const userPrompt = isNominal
            ? "The user's biomarkers are all optimal. Write a clean clinical summary congratulating them, followed by 3 bulleted foundational longevity levers to maintain their longevity baseline."
            : `User Biomarkers (Out of Range):
${JSON.stringify(markers, null, 2)}

Available Clinical Protocols (Reference Only):
${protocolContext}

Instructions:
1. Start with a short **Clinical Assessment & Synergy** paragraph explaining how the out-of-range markers relate physiologically.
2. Under a **Recommended Targeted Protocols** section, provide a concise 2-3 sentence summary for EACH suggested protocol/compound (bold name, target biomarker, mechanism of action, and dosing context if available).
3. Under a **Synergistic Lifestyle Interventions** section, list specific non-pharmacological levers (e.g. zone 2 exercise, cold plunge, sleep targets, nutrition).
4. Format using clean Markdown headers (###), bold terms, and structured bullet points.
5. Do not include introductory preamble or generic meta-disclaimers.`;

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


