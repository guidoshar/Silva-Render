import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { text } = await req.json();
    if (!text) {
      return NextResponse.json({ error: "text is required" }, { status: 400 });
    }

    const endpoint = process.env.AZURE_TTS_ENDPOINT!; // https://xxx.openai.azure.com
    const deployment = process.env.AZURE_TTS_DEPLOYMENT || process.env.AZURE_OPENAI_DEPLOYMENT!; // gpt-4o-mini-tts (TTS专用部署)
    const key = process.env.AZURE_TTS_KEY!;
    const apiVersion = process.env.AZURE_TTS_API_VERSION!; // 2025-03-01-preview

    const url = `${endpoint}/openai/deployments/${deployment}/audio/speech?api-version=${apiVersion}`;

    const ttsRes = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // ⚠️ 关键修正点在这里
        "Authorization": `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: deployment,
        input: text,
        voice: "glimmer",
      }),
    });

    if (!ttsRes.ok) {
      let errorMessage = "Azure TTS failed";
      try {
        const errText = await ttsRes.text();
        if (errText) {
          try {
            const errJson = JSON.parse(errText);
            errorMessage = errJson.error?.message || errJson.error || errText;
          } catch {
            errorMessage = errText;
          }
        }
      } catch {
        errorMessage = `HTTP ${ttsRes.status}: ${ttsRes.statusText}`;
      }
      console.error("Azure TTS failed:", errorMessage);
      return NextResponse.json({ error: errorMessage, status: ttsRes.status }, { status: ttsRes.status });
    }

    const audioBuffer = await ttsRes.arrayBuffer();

    return new Response(audioBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("TTS API error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

