import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageBase64, mediaType, mode, modelId, loraWord, apiKey, aiModel } = body;

    if (!apiKey) {
      return Response.json({ error: "API key required" }, { status: 400 });
    }
    if (!imageBase64) {
      return Response.json({ error: "Image required" }, { status: 400 });
    }

    const userPrompt = buildUserPrompt(mode, modelId, loraWord);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: aiModel || "claude-sonnet-4-20250514",
        max_tokens: 1500,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image",
                source: {
                  type: "base64",
                  media_type: mediaType,
                  data: imageBase64,
                },
              },
              { type: "text", text: userPrompt },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      return Response.json(
        { error: err?.error?.message || `Anthropic API error ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    const rawText = data.content.map((b) => b.text || "").join("");
    const clean = rawText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(clean);
    } catch {
      return Response.json({ error: "Failed to parse AI response. Try again." }, { status: 500 });
    }

    return Response.json({ result: parsed });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
