import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { protocolEngine } from "@/utils/protocolEngine";

export async function POST(req: Request) {
    try {
        const { markers } = await req.json();

        if (!markers) {
            return new Response("No markers provided", { status: 400 });
        }

        const apiKey = process.env.OPENAI_API_KEY;

        // Ensure engine is initialized
        await protocolEngine.init();

        // 1. Build Context from Protocol Engine
        let protocolContext = "Match the following clinical protocols if applicable:\n";

        // If markers are empty (Nominal), we skip protocol lookup context
        const isNominal = markers.length === 0;

        if (!isNominal) {
            markers.forEach((m: any) => {
                if (m.status === "red" || m.status === "yellow") {
                    const p = protocolEngine.getProtocol(m.label);
                    if (p) {
                        protocolContext += `- For ${m.label} (${m.value} ${m.unit}): Consider ${p.peptide}. Mechanism: ${p.mechanism}. Dosing: ${p.dosing?.dose || "See clinician"}. Safety: ${p.safety?.cautions || "None listed"}.\n`;
                    }
                }
            });
        }

        // MOCK RESPONSE IF NO KEY
        if (!apiKey) {
            await new Promise(r => setTimeout(r, 1500));
            if (isNominal) {
                return new Response(JSON.stringify({ text: "**Excellent Work!**\n\nYour biomarkers are all within the optimal range. Keep up your current protocol of sleep, nutrition, and exercise. No interventions needed." }), { status: 200 });
            }
            const mockResponse = `Based on your results:
1. **Thymosin Alpha-1**: ${protocolContext.includes("Thymosin") ? "As indicated for inflammation." : "Recommended for immune modulation."}
2. **Lifestyle**: Optimized sleep and cold exposure.`;
            return new Response(JSON.stringify({ text: mockResponse }), { status: 200 });
        }

        const systemPrompt = isNominal
            ? 'You are a supportive longevity coach. The user has perfect bloodwork. Congratulate them.'
            : 'You are a high-end functional medicine expert. You are a clinical assistant. Use the provided protocol data to explain the rationale for the suggested peptide. If the marker is not in the protocol files, suggest lifestyle levers like sleep and diet.';

        const userPrompt = isNominal
            ? "The user's biomarkers are all optimal. Write a short, encouraging summary (2 sentences mass) congratulating them on their health."
            : `User Biomarkers (Out of Range):
      ${JSON.stringify(markers, null, 2)}
      
      Available Clinical Protocols (Reference Only):
      ${protocolContext}
      
      Instructions:
      1. Provide a **Concise Summary** of the recommended clinical protocols (Peptides/Drugs) based on the out-of-range markers.
      2. Do NOT just list them. Explain how they synergize (e.g. "To address inflammation and metabolic stress...").
      3. Include specific dosing or mechanisms found in the provided context.
      4. Format as a clean Markdown list or short paragraphs with **Bold Terms**.
      5. Output ONLY the markdown text.`;

        const { text } = await generateText({
            model: openai('gpt-4o'),
            system: systemPrompt,
            prompt: userPrompt,
        });

        return new Response(JSON.stringify({ text }), { status: 200 });

    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to generate recommendations' }), { status: 500 });
    }
}


