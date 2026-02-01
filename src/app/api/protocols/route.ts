import { protocolEngine } from "@/utils/protocolEngine";

export async function POST(req: Request) {
    try {
        const { marker } = await req.json();

        if (!marker) return new Response("Missing marker", { status: 400 });

        await protocolEngine.init();
        const protocol = protocolEngine.getProtocol(marker);

        return new Response(JSON.stringify({ protocol }), { status: 200 });
    } catch (error) {
        console.error("Protocol API Error:", error);
        return new Response("Internal Error", { status: 500 });
    }
}
