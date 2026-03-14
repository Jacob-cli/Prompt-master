import { SYSTEM_PROMPT, buildUserPrompt } from "../../../lib/prompts";

// ─── PROVIDER CONFIGS ─────────────────────────────────────────────────────────
const PROVIDERS = {
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    buildHeaders: (key) => ({
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    }),
    buildBody: (model, systemPrompt, userPrompt, imageBase64, mediaType) => JSON.stringify({
      model: model || "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: systemPrompt,
      messages: [{
        role: "user",
        content: [
          { type: "image", source: { type: "base64", media_type: mediaType, data: imageBase64 } },
          { type: "text", text: userPrompt }
        ]
      }]
    }),
    extractText: (data) => {
      if (!Array.isArray(data.content)) return "";
      return data.content.filter(b => b?.type === "text").map(b => b.text || "").join("\n").trim();
    }
  },

  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    buildHeaders: (key) => ({
      "Content-Type": "application/json",
      "Authorization": `Bearer ${key}`,
    }),
    buildBody: (model, systemPrompt, userPrompt, imageBase64, mediaType) => JSON.stringify({
      model: model || "gpt-4o",
      max_tokens: 2000,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: [
            { type: "image_url", image_url: { url: `data:${mediaType};base64,${imageBase64}`, detail: "high" } },
            { type: "text", text: userPrompt }
          ]
        }
      ]
    }),
    extractText: (data) => data?.choices?.[0]?.message?.content?.trim() || ""
  },

  gemini: {
    url: (model, key) => `https://generativelanguage.googleapis.com/v1beta/models/${model || "gemini-1.5-flash"}:generateContent?key=${key}`,
    buildHeaders: () => ({ "Content-Type": "application/json" }),
    buildBody: (model, systemPrompt, userPrompt, imageBase64, mediaType) => JSON.stringify({
      system_instruction: { parts: [{ text: systemPrompt }] },
      contents: [{
        parts: [
          { inline_data: { mime_type: mediaType, data: imageBase64 } },
          { text: userPrompt }
        ]
      }],
      generationConfig: { maxOutputTokens: 2000 }
    }),
    extractText: (data) => data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || ""
  }
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { imageBase64, mediaType, mode, modelId, loraWord, apiKey, aiModel, provider = "anthropic" } = body;

    if (!apiKey) return Response.json({ error: "API key required" }, { status: 400 });
    if (!imageBase64) return Response.json({ error: "Image required" }, { status: 400 });

    const userPrompt = buildUserPrompt(mode, modelId, loraWord);
    const providerConfig = PROVIDERS[provider] || PROVIDERS.anthropic;

    const url = typeof providerConfig.url === "function"
      ? providerConfig.url(aiModel, apiKey)
      : providerConfig.url;

    const response = await fetch(url, {
      method: "POST",
      headers: providerConfig.buildHeaders(apiKey),
      body: providerConfig.buildBody(aiModel, SYSTEM_PROMPT, userPrompt, imageBase64, mediaType),
    });

    const responseText = await response.text();
    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      console.error("Provider returned non-JSON:", responseText.slice(0, 300));
      return Response.json({ error: "Provider returned invalid response", raw: responseText.slice(0, 300) }, { status: 500 });
    }

    if (!response.ok) {
      const errMsg = data?.error?.message || data?.error?.errors?.[0]?.message || `API error ${response.status}`;
      return Response.json({ error: errMsg }, { status: response.status });
    }

    const rawText = providerConfig.extractText(data);
    console.log("RAW AI TEXT (first 300):", rawText.slice(0, 300));

    if (!rawText) {
      return Response.json({ error: "AI returned empty response. Try again." }, { status: 500 });
    }

    // The prompt is plain text — just return it directly
    // No JSON parsing needed since our system prompt outputs a single text prompt
    return Response.json({
      result: {
        prompt: rawText,
        analysis: null // analysis dropdown removed in favor of plain text output
      }
    });

  } catch (err) {
    console.error("Route error:", err);
    return Response.json({ error: err?.message || "Unknown server error" }, { status: 500 });
  }
}
