export const LORA_TRIGGER = "skyeewmn";

export const MODELS = [
  { id: "zimage_turbo", label: "Z-Image Turbo", color: "#b8ff47", settings: "guidance_scale: 0.0 | steps: 9 | 1024x1024 | no negative prompt", supportsNegative: false },
  { id: "zimage_base", label: "Z-Image Base", color: "#47b8ff", settings: "guidance_scale: 3.5-7 | steps: 20-30 | positive + negative", supportsNegative: true },
  { id: "nano_banana", label: "Nano Banana Pro", color: "#ffaa47", settings: "prompt pair | image editing friendly", supportsNegative: true },
  { id: "wan22", label: "Wan 2.2", color: "#b847ff", settings: "guidance_scale: 3.5 | steps: 20 | positive + negative", supportsNegative: true },
  { id: "qwen", label: "Qwen Image", color: "#ff47aa", settings: "cfg: 5-7 | positive + negative", supportsNegative: true },
];

export const AI_MODELS = {
  anthropic: [
    { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4.6 (recommended)" },
    { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (fastest/cheapest)" },
    { id: "claude-opus-4-5-20251101", label: "Claude Opus 4.5 (most detailed)" },
  ],
  openai: [
    { id: "gpt-4o", label: "GPT-4o (recommended)" },
    { id: "gpt-4o-mini", label: "GPT-4o Mini (cheaper)" },
    { id: "gpt-4-turbo", label: "GPT-4 Turbo" },
  ],
  gemini: [
    { id: "gemini-1.5-flash", label: "Gemini 1.5 Flash (free tier)" },
    { id: "gemini-1.5-pro", label: "Gemini 1.5 Pro" },
    { id: "gemini-2.0-flash", label: "Gemini 2.0 Flash" },
  ],
};

export const PROVIDERS = [
  { id: "anthropic", label: "Anthropic (Claude)", keyPlaceholder: "sk-ant-...", keyLink: "https://console.anthropic.com/api-keys", freeCredits: "$5 on signup" },
  { id: "openai", label: "OpenAI (GPT-4o)", keyPlaceholder: "sk-...", keyLink: "https://platform.openai.com/api-keys", freeCredits: "$5 trial on signup" },
  { id: "gemini", label: "Google (Gemini)", keyPlaceholder: "AIza...", keyLink: "https://aistudio.google.com/app/apikey", freeCredits: "Free tier available" },
];

export const SYSTEM_PROMPT = `You are an expert visual analysis specialist and AI image generation prompt engineer.

Analyze the reference image internally with careful attention to composition, subject pose, gesture, outfit, accessories, background, lighting direction and quality, shadows, surface materials, color temperature, camera feel, and overall photographic style.

Prompt writing rules:
- Use only physically observable details.
- Prefer concrete language over hype words.
- Respect the requested mode and model format exactly.
- In LoRA mode, do not describe identity-defining facial structure, body type, or complexion. Let the LoRA control those.
- In exact mode, include appearance details that are visible and relevant.
- Keep prompts production-ready and easy to paste into image tools.
- Never include explanations, markdown fences, or extra commentary.
- If the target format requires JSON, return valid raw JSON only.`;

export function buildUserPrompt(mode, modelId, loraWord) {
  const lora = loraWord || LORA_TRIGGER;
  const model = MODELS.find((m) => m.id === modelId) || MODELS[0];
  const isLora = mode === "lora";

  const subjectBlock = isLora
    ? `MODE: LoRA Swap\nUse the trigger word \"${lora}\" at the start of the positive prompt. Preserve scene, lighting, pose, clothing, accessories, framing, and mood from the reference while replacing only the subject identity. Do not describe face shape, lip shape, nose shape, attractiveness, body type, or complexion.`
    : `MODE: Exact Clone\nReplicate the visible subject details faithfully, including visible skin tone, skin finish as affected by light, makeup, hair, outfit, accessories, pose, environment, and camera feel.`;

  if (modelId === "zimage_turbo") {
    return `${subjectBlock}

TARGET MODEL: ${model.label}
Return exactly one plain-text field in this JSON shape:
{"positive":"..."}

Requirements for the positive prompt:
- natural flowing prompt paragraph
- positive instructions only
- no negative prompt
- 100 to 220 words
- optimized for Z-Image Turbo guidance scale 0.0
- keep pose and environment geometry clear for image-to-image and control guidance

Return raw JSON only.`;
  }

  if (modelId === "nano_banana") {
    return `${subjectBlock}

TARGET MODEL: ${model.label}
Return exactly this JSON shape:
{"positive":"...","negative":"..."}

Requirements:
- positive: compact but descriptive production-ready prompt built for image editing and prompt understanding
- negative: concise quality-control exclusions relevant to the scene
- both fields must be plain strings
- no markdown, no notes, no extra keys

Return raw JSON only.`;
  }

  return `${subjectBlock}

TARGET MODEL: ${model.label}
Return exactly this JSON shape:
{"positive":"...","negative":"..."}

Requirements:
- positive: one optimized prompt paragraph tailored to ${model.label}
- negative: one concise negative prompt string tuned for ${model.label}
- preserve the reference scene faithfully
- include lighting direction, background layout, pose geometry, outfit, and camera feel
- keep the positive prompt dense and usable
- keep the negative prompt practical and not overly long
${modelId === "wan22" ? "- include subtle motion or energy cues only if the original scene visually suggests them\n" : ""}
Return raw JSON only.`;
}
