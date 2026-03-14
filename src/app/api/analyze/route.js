import { SYSTEM_PROMPT, buildUserPrompt } from "../../../lib/prompts";

function extractJson(text) {
  if (!text || typeof text !== "string") {
    throw new Error("AI returned empty text");
  }

  let cleaned = text.trim();

  // Remove markdown fences
  cleaned = cleaned.replace(/^```json\s*/i, "");
  cleaned = cleaned.replace(/^```\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  // Try direct parse
  try {
    return JSON.parse(cleaned);
  } catch {}

  // Try extracting JSON from surrounding text
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const maybeJson = cleaned.slice(firstBrace, lastBrace + 1);
    return JSON.parse(maybeJson);
  }

  throw new Error("No valid JSON found in AI response");
}

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
              {
                type: "text",
                text: `${userPrompt}

Return ONLY one valid JSON object.
Do not use markdown.
Do not wrap the answer in triple backticks.
Do not add any explanation before or after the JSON.`,
              },
            ],
          },
        ],
      }),
    });

    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Anthropic returned non-JSON:", responseText);
      return Response.json(
        { error: "Anthropic returned invalid response", raw: responseText },
        { status: 500 }
      );
    }

    if (!response.ok) {
      console.error("Anthropic API error:", data);
      return Response.json(
        { error: data?.error?.message || `Anthropic API error ${response.status}` },
        { status: response.status }
      );
    }

    const rawText = Array.isArray(data.content)
      ? data.content
          .filter((block) => block?.type === "text")
          .map((block) => block.text || "")
          .join("\n")
          .trim()
      : "";

    console.log("RAW AI TEXT:", rawText);

    let parsed;
    try {
      parsed = extractJson(rawText);
    } catch (parseError) {
      console.error("Parse error:", parseError);

      return Response.json(
        {
          error: "Failed to parse AI response. Try again.",
          raw: rawText,
        },
        { status: 500 }
      );
    }

    return Response.json({ result: parsed });
  } catch (err) {
    console.error("Route error:", err);

    return Response.json(
      { error: err?.message || "Unknown server error" },
      { status: 500 }
    );
  }
}
