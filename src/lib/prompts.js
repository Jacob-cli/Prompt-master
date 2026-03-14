// ─────────────────────────────────────────────────────────────────────────────
// SKYE PROMPT ENGINE — Baked-in Prompt Engineering Knowledge
// This file contains all the model-specific rules acquired through testing.
// It never disappears — it's part of the app, not dependent on any chat session.
// ─────────────────────────────────────────────────────────────────────────────

export const LORA_TRIGGER = "skyeewmn";

export const MODELS = [
  {
    id: "zimage_turbo",
    label: "Z-Image Turbo",
    color: "#b8ff47",
    settings: "guidance_scale: 0.0 · steps: 9 · 1024×1024 · NO negative prompt",
    description: "Camera-first sentence style. All constraints go POSITIVE only.",
  },
  {
    id: "zimage_base",
    label: "Z-Image Base",
    color: "#47b8ff",
    settings: "guidance_scale: 3.5–7 · steps: 20–30 · supports negative prompt",
    description: "Sentence style, slightly longer ok, supports negative.",
  },
  {
    id: "nano_banana",
    label: "Nano Banana Pro",
    color: "#ffaa47",
    settings: "JSON weighted tags format",
    description: "Structured JSON with weighted tag strings. Negative field supported.",
  },
  {
    id: "wan22",
    label: "Wan 2.2",
    color: "#b847ff",
    settings: "guidance_scale: 3.5 · steps: 20 · motion-aware",
    description: "Natural language, motion descriptors supported.",
  },
  {
    id: "qwen",
    label: "Qwen Image",
    color: "#ff47aa",
    settings: "cfg: 5–7 · vision-language natural prompt",
    description: "Detailed descriptive natural language.",
  },
];

export const AI_MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4.6 (recommended)" },
  { id: "claude-opus-4-5-20251101", label: "Claude Opus 4.5 (most detailed)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (fastest)" },
];

// ─── SYSTEM PROMPT (baked-in expertise) ──────────────────────────────────────
export const SYSTEM_PROMPT = `You are an expert AI image analyst and prompt engineer with deep specialization in Z-Image Turbo, Z-Image Base, Nano Banana Pro, Wan 2.2, and Qwen Image diffusion models.

You have mastered these critical rules through extensive testing:

Z-IMAGE TURBO RULES (most important):
- guidance_scale MUST be 0.0 — this model is distilled and does NOT support CFG
- This means NO negative prompts — they are completely ignored
- ALL constraints must go in the POSITIVE prompt (e.g. instead of neg: "blurry", write pos: "ultra-sharp tack-focused")
- Optimal length: 80–220 words — long AND precise, not poetic
- Structure MUST be camera-first: shot type → camera angle → lighting → background → subject → outfit → expression → quality locks
- Natural sentence style — NOT tag-stuffed keywords
- Lighting descriptions must be hyper-specific: not "nice light" but "soft diffused natural daylight from left side creating gentle shadow on right cheekbone with specular highlight on nose bridge"
- Skin finish must be explicit: dewy/glowy/matte/glass-skin — diffusion models do not infer this
- Steps: 9 (= 8 forward passes), resolution: 1024×1024

Z-IMAGE BASE: Similar sentence style, can be slightly longer, guidance_scale 3.5–7, supports negative prompt field.

NANO BANANA PRO: Outputs structured JSON object with weighted tag strings. Uses colon-weight syntax like "golden tan glowing skin:1.3". Always include a "negative" field. LoRA trigger gets ":1.4" weight.

WAN 2.2: Natural language, motion-aware. Can include motion descriptors. guidance_scale 3.5.

QWEN IMAGE: Detailed descriptive natural language. Most verbose is fine. cfg 5–7.

LORA SWAP MODE RULES:
- LoRA trigger word goes at the VERY START of the prompt
- The LoRA character (skyeewmn) REPLACES the subject identity only
- Everything else is preserved EXACTLY: scene, lighting, background, composition, outfit, accessories, makeup style, skin finish, expression mood, color grade
- Makeup details transfer TO the LoRA character (e.g. if ref has glass-skin glow + nude lip gloss → skyeewmn has those applied)
- Do NOT describe the original subject's face, ethnicity, or features
- Character drift protection: do not add physical descriptors that aren't in the reference scene

OUTPUT: Return ONLY raw JSON. No markdown fences. No preamble. Pure JSON object.`;

// ─── BUILD USER PROMPT ────────────────────────────────────────────────────────
export function buildUserPrompt(mode, modelId, loraWord) {
  const lora = loraWord || LORA_TRIGGER;

  const outputSchema = getOutputSchema(modelId);

  if (mode === "lora") {
    return `Analyze this reference image. I want to REPLACE THE SUBJECT with my LoRA character (trigger: "${lora}") while keeping EVERYTHING ELSE identical — scene, lighting, background, composition, outfit, accessories, makeup, skin finish, expression mood, color grade, aura, ambiance.

Extract every visual element:
- Exact shot type and camera angle/framing
- Lighting: direction, color temperature, quality (hard/soft), shadow placement, specular highlights, any rim light or backlight
- Background: what it is, how defocused, any readable elements
- Outfit: every garment, color, material, fit
- Accessories: jewelry, earrings, anything worn
- Makeup/skin: lip shade and finish (gloss/matte), skin finish (dewy/glassy/matte/glow level), highlight placement, lash style, brow character, any special glow effects
- Expression and body language
- Color grade and overall mood/aura
- Any special effects, lens quality, depth of field

Then output this JSON (raw only, no fences):
${outputSchema}

RULES:
- For the prompt field: start with "${lora}," then camera/shot, then lighting, then describe outfit/accessories ON ${lora}, then makeup/skin applied TO ${lora}, then background/scene, then quality locks
- Do NOT describe the original subject's face or identity
- Prompt must be 100–220 words for Z-Image Turbo
- ALL positive constraints only for Z-Image Turbo (no negative)`;
  }

  return `Analyze this reference image with forensic precision. Generate an EXACT REPLICATION prompt optimized for ${getModelLabel(modelId)}.

Extract every visual element:
- Shot type (close-up, medium, full-body, etc.) and exact camera angle/framing
- Lighting: direction, color temperature, quality (hard/soft/diffused), shadow placement, specular highlights, catchlights
- Background: full description, bokeh level, readable environmental elements
- Subject: skin tone (precise warm/cool/neutral, depth), hair (color, texture, style, finish), eye color and size, facial structure, expression
- Makeup: lip color and finish (gloss/matte/stained), skin finish (dewy/glassy/matte/oily/glowing), highlight placement, lash style, brow thickness/arch, blush, contour, any special effects
- Outfit: every garment, exact colors, materials, fit
- Accessories: earrings style/size/material, any other jewelry
- Color grade: warm/cool/neutral, contrast level, any film style
- Overall vibe and aura

Then output this JSON (raw only, no fences):
${outputSchema}

RULES:
- Prompt must be 100–220 words for Z-Image Turbo
- ALL positive constraints only (no negative prompt field for Turbo)
- Be ultra-specific: not "nice lighting" but exact direction, quality, color temperature`;
}

function getModelLabel(modelId) {
  return MODELS.find(m => m.id === modelId)?.label || modelId;
}

function getOutputSchema(modelId) {
  const isNanoBanana = modelId === "nano_banana";

  const promptField = isNanoBanana
    ? `"prompt": { "subject": "", "skin": "", "hair": "", "face": "", "outfit": "", "lighting": "", "background": "", "style": "", "negative": "" }`
    : `"prompt": ""`;

  return `{
  "analysis": {
    "shot_type": "",
    "camera_angle": "",
    "lighting": "",
    "background": "",
    "subject_or_scene": "",
    "outfit_accessories": "",
    "makeup_skin": "",
    "color_grade_mood": "",
    "overall_vibe": ""
  },
  ${promptField},
  "settings": ""
}`;
}
