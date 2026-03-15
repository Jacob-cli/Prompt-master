// ============================================================
//  MASTER PROMPT ENGINE — AI Influencer / Image Replication
//  Architecture: Scene-world separation for LoRA fidelity
//  Text-to-image: full clone protocol
//  LoRA mode: scene-only, zero subject description
// ============================================================

export const LORA_TRIGGER = “skyeewmn”;

export const MODELS = [
{
id: “zimage_turbo”,
label: “Z-Image Turbo”,
color: “#b8ff47”,
settings: “guidance_scale: 0.0 | steps: 9 | 1024x1024 | no negative prompt”,
supportsNegative: false,
},
{
id: “zimage_base”,
label: “Z-Image Base”,
color: “#47b8ff”,
settings: “guidance_scale: 3.5-7 | steps: 20-30 | positive + negative”,
supportsNegative: true,
},
{
id: “nano_banana”,
label: “Nano Banana Pro”,
color: “#ffaa47”,
settings: “prompt pair | image editing friendly”,
supportsNegative: true,
},
{
id: “wan22”,
label: “Wan 2.2”,
color: “#b847ff”,
settings: “guidance_scale: 3.5 | steps: 20 | positive + negative”,
supportsNegative: true,
},
{
id: “qwen”,
label: “Qwen Image”,
color: “#ff47aa”,
settings: “cfg: 5-7 | positive + negative”,
supportsNegative: true,
},
];

export const AI_MODELS = {
anthropic: [
{ id: “claude-sonnet-4-20250514”, label: “Claude Sonnet 4.6 (recommended)” },
{ id: “claude-haiku-4-5-20251001”, label: “Claude Haiku 4.5 (fastest/cheapest)” },
{ id: “claude-opus-4-5-20251101”, label: “Claude Opus 4.5 (most detailed)” },
],
openai: [
{ id: “gpt-4o”, label: “GPT-4o (recommended)” },
{ id: “gpt-4o-mini”, label: “GPT-4o Mini (cheaper)” },
{ id: “gpt-4-turbo”, label: “GPT-4 Turbo” },
],
gemini: [
{ id: “gemini-1.5-flash”, label: “Gemini 1.5 Flash (free tier)” },
{ id: “gemini-1.5-pro”, label: “Gemini 1.5 Pro” },
{ id: “gemini-2.0-flash”, label: “Gemini 2.0 Flash” },
],
};

export const PROVIDERS = [
{
id: “anthropic”,
label: “Anthropic (Claude)”,
keyPlaceholder: “sk-ant-…”,
keyLink: “https://console.anthropic.com/api-keys”,
freeCredits: “$5 on signup”,
},
{
id: “openai”,
label: “OpenAI (GPT-4o)”,
keyPlaceholder: “sk-…”,
keyLink: “https://platform.openai.com/api-keys”,
freeCredits: “$5 trial on signup”,
},
{
id: “gemini”,
label: “Google (Gemini)”,
keyPlaceholder: “AIza…”,
keyLink: “https://aistudio.google.com/app/apikey”,
freeCredits: “Free tier available”,
},
];

// ============================================================
//  SYSTEM PROMPT
//  The LLM must think like a Director of Photography,
//  not a caption writer. Physical, measurable, cinematic.
// ============================================================

export const SYSTEM_PROMPT = `You are a Director of Photography and technical AI image generation specialist. Your entire job is converting reference images into prompts that achieve maximum scene fidelity when fed into diffusion models.

You do not write captions. You do not describe what you “see” at a semantic level. You extract technical photographic and cinematographic data from the image and encode it into prompt language that diffusion models respond to.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CORE ANALYSIS AXES — extract all of these from every image:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXPOSURE & TONAL RANGE
- Overall exposure level: underexposed / correctly exposed / overexposed
- Shadow behavior: crushed blacks / lifted shadows / natural rolloff
- Highlight behavior: blown / controlled / soft rolloff
- Contrast ratio: flat / normal / high contrast / extreme contrast
- Where is the darkest area? Where is the brightest?
1. LIGHT SOURCES — identify every source
- Position: front / side / above / behind / below / practical
- Direction: key light angle (clock position relative to subject)
- Color temperature: warm (2700-3200K) / neutral (5000K) / cool (6500K+)
- Quality: hard (sharp shadows) / soft (diffused edges) / mixed
- Intensity: dominant / fill / accent / rim
- Type: natural / artificial / practical (visible in frame)
- What does it illuminate specifically?
1. SUBJECT POSE GEOMETRY
- Head angle: straight-on / turned left / turned right / tilted / slight angle
- Gaze direction: directly into lens / slightly off-axis / downward / upward
- Shoulder orientation: square to camera / angled
- Arm positions: exact description (e.g., “right arm raised, hand gripping hair at shoulder level”)
- Hand positions: where are they, what are they doing
- Weight distribution: centered / shifted to one hip
- Body framing: how much of the body is in frame
1. CLOTHING & ACCESSORIES
- Garment type and exact color (not “grey top” — “charcoal heather crew-neck long-sleeve fitted top”)
- Fabric behavior under the lighting: matte / slight sheen / texture visible
- Fit: fitted / relaxed / oversized
- Bottom wear: exact color, rise, fit
- Accessories: every visible item, material, placement, which wrist/side/hand
1. HAIR BEHAVIOR
- Fall direction and volume
- Which side has more volume
- Any sections catching light (highlights activated by the scene lighting)
- Texture: smooth / wavy / textured
1. BACKGROUND & DEPTH LAYERS
- Layer 1 (closest to subject): what is it, how in/out of focus
- Layer 2 (mid): what is it, focus quality
- Layer 3 (deepest): what is it, any practical lights visible
- Bokeh quality: smooth / busy / circular highlights
- Any visible architectural elements: ceiling, beams, windows, walls
1. CAMERA FEEL
- Focal length impression: wide (feels like 24-35mm) / normal (50mm) / portrait tele (85-135mm)
- Depth of field: shallow / moderate / deep
- Lens rendering: clinical / cinematic / slightly soft
- Subject-to-background separation: high / medium / low
- Any visible sensor noise or grain

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LANGUAGE RULES — enforced on every output:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FORBIDDEN vague words — replace every instance:
“moody” → describe the actual lighting ratio and shadow depth
“aesthetic” → describe the color temperature and tonal range
“beautiful” / “stunning” / “gorgeous” → remove entirely
“dark atmosphere” → “near-black ambient, crushed shadows below mid-tone”
“warm lighting” → “2700K practical bar lighting, warm amber cast on right side”
“dark bar” → “low-key interior, ambient exposure at -2 stops, backlit liquor shelf as sole warm practical light source”
“confident pose” → describe the actual body geometry

REQUIRED replacements:
Every lighting description must include: source position + color temperature + quality + what it hits
Every background description must include: focus state + depth layer position + what practicals are visible
Every pose description must include: joint positions, not emotional interpretations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Return raw JSON only
- No markdown fences
- No preamble or explanation
- No commentary after the JSON
- Exact schema as specified in the user prompt`;

// ============================================================
//  SUBJECT BLOCK BUILDER
//  LoRA mode: world-only, zero identity
//  Exact mode: full clone with subject
// ============================================================

export function buildUserPrompt(mode, modelId, loraWord) {
const lora = loraWord || LORA_TRIGGER;
const model = MODELS.find((m) => m.id === modelId) || MODELS[0];
const isLora = mode === “lora”;

// ── LoRA MODE ──────────────────────────────────────────────
// The prompt describes the WORLD only.
// The LoRA owns the character entirely.
// Zero subject appearance. Zero identity bleed.
const loraSubjectBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: LoRA Scene Extraction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRIGGER WORD: “${lora}” — this goes FIRST in the positive prompt, before everything else.

YOUR ROLE: You are a SET DESIGNER, not a casting director.
The LoRA controls 100% of character identity: face, body type, proportions, skin, hair.
You control 100% of everything else: the world she stands in.

WHAT TO EXTRACT FROM THE REFERENCE IMAGE:
You are extracting the scene, not the person in it.

Extract and encode precisely:

1. The lighting setup — every source, direction, temperature, quality, intensity
1. The background environment — depth layers, architecture, what’s in focus
1. The camera configuration — focal length feel, depth of field, framing
1. The pose geometry — body angles, joint positions, arm/hand placement (geometry only, not appearance)
1. The clothing and accessories — these will transfer to the LoRA character
1. The exposure and tonal range — how the scene is lit overall

DO NOT DESCRIBE ANY OF THE FOLLOWING — the LoRA owns these:
✗ Face shape, jaw, cheekbones, forehead, chin
✗ Eye shape, eye spacing, eye color, lashes
✗ Nose shape or size
✗ Lip shape or fullness
✗ Skin tone, complexion, skin finish
✗ Body type, body proportions, waist, hips, chest, shoulders
✗ Hair color, hair texture, hair style
✗ Any attractiveness descriptor
✗ Any identity-adjacent physical descriptor

If you catch yourself writing any of the above, delete it and replace it with more lighting or background detail instead.

SCENE LOCK STRATEGY:
Because the LoRA will try to pull the image toward its training distribution, the prompt must over-specify the scene parameters to resist that pull. Be more specific about lighting and background than you think necessary. Repeat critical lighting tokens in different positions in the prompt. The scene must be locked so tightly that the only variable the model has freedom on is the character’s identity — which the LoRA controls.`;

// ── EXACT CLONE MODE ───────────────────────────────────────
// Full subject + scene. Every visible detail locked.
const exactSubjectBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: Exact Clone — Full Scene + Subject Replication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Extract and encode everything visible. No detail is too small.
Order your prompt elements by visual dominance — what the eye sees first gets written first.

Extract in this order:

1. Subject: every visible detail — skin tone as affected by the specific light, makeup as applied (not generic), hair fall and lighting behavior, outfit fabric and fit, all accessories
1. Pose geometry: exact joint positions, head angle, gaze, weight distribution
1. Lighting: every source, full cinematographic breakdown
1. Background: every depth layer, focus state, practicals
1. Camera: focal length feel, depth of field, lens rendering
1. Exposure: tonal range, shadow behavior, highlight behavior`;

const subjectBlock = isLora ? loraSubjectBlock : exactSubjectBlock;

// ── NEGATIVE PROMPT BODY PROTECTION (LoRA only) ───────────
// Protects the LoRA character’s body type from reference drift
const loraBodyProtectionNegative = isLora
? `thin body, slim body, petite frame, skinny, lean figure, narrow hips, small waist, underweight, fragile build, willowy, slight build, reference subject body, changed body type, different proportions, `
: ``;

// ============================================================
//  PER-MODEL PROMPT BUILDERS
// ============================================================

// ── Z-IMAGE TURBO ──────────────────────────────────────────
// guidance_scale: 0.0 — model free-runs, early token position
// and token density matter more than sentence structure.
// Front-load the most visually dominant elements.
// Repeat critical scene anchors for weight.
if (modelId === “zimage_turbo”) {
return `${subjectBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET MODEL: Z-Image Turbo
guidance_scale: 0.0 | steps: 9 | 1024x1024
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TURBO-SPECIFIC PROMPT ENGINEERING RULES:
At guidance_scale 0.0 the model free-runs — it is not steered by the prompt in the traditional CFG sense. Instead it responds to:

- TOKEN POSITION: Elements described early in the prompt have more influence. Put the most important visual elements first.
- TOKEN DENSITY: Specific, concrete tokens outperform abstract ones. “2700K amber bar backlight” beats “warm lighting”.
- REPETITION FOR WEIGHT: Repeat the single most critical scene element in two different positions and phrasings. For dark moody scenes, anchor the exposure twice. For bright outdoor scenes, anchor the light source twice.
- AVOID ABSTRACTION: Every abstract word costs you a concrete anchor. Cut all filler.

PROMPT STRUCTURE FOR TURBO (write in this order):
${isLora
? `[TRIGGER WORD] [pose geometry + clothing + accessories] [primary light source with full technical description] [secondary/fill light or absence of fill] [background depth layer 1] [background depth layer 2] [camera feel + depth of field] [exposure anchor — restate the tonal range] [scene atmosphere anchor — restate lighting quality]`
: `[subject description — most visually dominant features first] [pose geometry] [primary light source + direction + temperature + quality] [secondary light or fill] [background layer 1] [background layer 2] [camera feel] [exposure and tonal notes] [scene atmosphere restatement]`
}

Return exactly one field:
{“positive”:”…”}

Requirements:

- 180 to 260 words — Turbo needs density
- No negative prompt field
- No hype words — cinematographic language only
- Repeat the primary light source description in a different phrasing somewhere in the second half of the prompt
- Return raw JSON only`;
  }
  
  // ── Z-IMAGE BASE ───────────────────────────────────────────
  // guidance_scale: 3.5-7, responds well to structured prompts
  // Positive and negative both matter here
  if (modelId === “zimage_base”) {
  return `${subjectBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET MODEL: Z-Image Base
guidance_scale: 3.5-7 | steps: 20-30
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Z-Image Base responds well to structured, dense positive prompts and targeted negative prompts.
The model follows CFG guidance meaningfully — both prompts have real weight.

POSITIVE: Write in this structure:
${isLora
? `[TRIGGER WORD] [pose and clothing] [lighting — full technical breakdown, primary then secondary] [background with depth layers] [camera configuration] [exposure and tonal anchors]`
: `[subject — skin finish under light, makeup, hair behavior, outfit, accessories] [pose geometry] [lighting full breakdown] [background layers] [camera] [tonal range]`
}

NEGATIVE: Target specifically:
${isLora
? `- ${loraBodyProtectionNegative}wrong lighting direction, overexposed, flat lighting, wrong background, different scene, different environment, different location`
: `- wrong lighting, flat lighting, overexposed, underexposed, wrong background, bad anatomy, distorted`
}

Return exactly:
{“positive”:”…”,“negative”:”…”}

Requirements:

- positive: 150-220 words, cinematographic language, structured as above
- negative: 30-60 words, specific to what could go wrong in this scene
- Return raw JSON only`;
  }
  
  // ── NANO BANANA PRO ────────────────────────────────────────
  // Prompt-pair model, image editing friendly
  // Positive and negative work as a matched editing pair
  if (modelId === “nano_banana”) {
  return `${subjectBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET MODEL: Nano Banana Pro
Prompt pair | image editing optimized
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Nano Banana is image-editing friendly — prompts function as an editing instruction pair.
Think of positive as “bring toward this” and negative as “push away from this.”
Be more compact than other models — clarity over density.

POSITIVE: Compact but precise.
${isLora
? `Start with trigger word. Then: scene environment + lighting setup + pose geometry + clothing. Keep it dense and specific but not overwhelming.`
: `Most dominant visual elements first. Lighting setup. Background. Camera feel. Tonal range.`
}

NEGATIVE: Actively protect the scene.
${isLora
? `${loraBodyProtectionNegative}wrong lighting, wrong location, wrong background, identity drift, different character`
: `wrong lighting, wrong scene, overexposed, underexposed, flat, bad anatomy`
}

Return exactly:
{“positive”:”…”,“negative”:”…”}

Requirements:

- positive: 80-140 words — compact but specific
- negative: 20-40 words — targeted exclusions
- Return raw JSON only`;
  }
  
  // ── WAN 2.2 ────────────────────────────────────────────────
  // guidance_scale: 3.5, video-adjacent model
  // Responds to motion energy cues if scene suggests them
  if (modelId === “wan22”) {
  return `${subjectBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET MODEL: Wan 2.2
guidance_scale: 3.5 | steps: 20
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Wan 2.2 is a video-adjacent model. It responds well to:

- Temporal and spatial anchoring (where things are in space)
- Subtle motion energy in the scene (if the reference suggests any — hair movement, fabric weight, etc.)
- Clear depth and spatial relationships

Only add motion cues if the reference image visually implies them (e.g., hair caught mid-movement, fabric with kinetic drape). If the scene is static, do not add motion.

POSITIVE: Spatial and temporal structure.
${isLora
? `[TRIGGER WORD] [pose with spatial anchor — where the subject stands in the frame] [clothing with fabric weight description] [lighting — spatial origin, direction, temperature, quality] [background spatial layers from near to far] [camera configuration] [any motion energy cues if present in reference] [tonal anchors]`
: `[subject spatial positioning] [pose geometry] [outfit with fabric behavior] [lighting spatial breakdown] [background near-to-far] [camera] [motion energy if present] [tonal range]`
}

NEGATIVE: Protect spatial integrity.
${isLora
? `${loraBodyProtectionNegative}static where motion implied, blurred subject, wrong depth, wrong spatial relationship`
: `wrong spatial layout, flat depth, distorted geometry, wrong lighting direction`
}

Return exactly:
{“positive”:”…”,“negative”:”…”}

Requirements:

- positive: 140-200 words
- negative: 25-50 words
- Add motion energy cues only if clearly present in the reference
- Return raw JSON only`;
  }
  
  // ── QWEN IMAGE ─────────────────────────────────────────────
  // cfg: 5-7, strong prompt adherence, tolerates detail well
  if (modelId === “qwen”) {
  return `${subjectBlock}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
TARGET MODEL: Qwen Image
cfg: 5-7 | positive + negative
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Qwen Image has strong prompt adherence at cfg 5-7. It can handle high token detail and will attempt to follow everything you specify. Use this — be exhaustive.

POSITIVE: Maximum technical detail. Qwen will follow it.
${isLora
? `[TRIGGER WORD] [full pose geometry — every joint, every hand position] [clothing — fabric type, exact color, fit, behavior under light] [accessories — every item, exact placement, material] [primary light source — full cinematographic breakdown] [secondary sources or fill absence] [background — every depth layer, every visible architectural element, focus state] [camera — focal length, depth of field, lens rendering] [exposure — tonal range, shadow and highlight behavior] [scene restatement]`
: `[subject full description — skin finish under specific light, makeup visible, hair exact behavior] [pose — every joint] [clothing and accessories] [lighting full breakdown] [background all layers] [camera full] [exposure full] [scene atmosphere]`
}

NEGATIVE: Exhaustive exclusions.
${isLora
? `${loraBodyProtectionNegative}wrong lighting color, wrong lighting direction, incorrect background, wrong environment, wrong clothing, missing accessories, flat lighting, overexposed, underexposed, blurry background when sharp in reference, sharp background when blurry in reference`
: `wrong lighting, wrong scene, overexposed, underexposed, incorrect clothing, wrong background, bad anatomy, distorted limbs, extra limbs`
}

Return exactly:
{“positive”:”…”,“negative”:”…”}

Requirements:

- positive: 200-300 words — Qwen can handle it and will use it
- negative: 50-80 words — be specific to what could go wrong in this exact scene
- Return raw JSON only`;
  }
  
  // Fallback — should not reach here with valid modelId
  return `${subjectBlock}

Analyze the reference image fully using the analysis axes provided in the system prompt.
Return: {“positive”:”…”,“negative”:”…”}
Return raw JSON only.`;
}

// ============================================================
//  WORKFLOW NOTES (for developer reference)
//  Not used in prompt generation — documentation only
// ============================================================

/*
AI INFLUENCER WORKFLOW — ARCHITECTURE NOTES

PROBLEM: Three nodes competing to define the subject’s body:

1. Prompt → describes a body that may not match LoRA character
1. ControlNet (DWPose/Depth) → imposes reference subject’s skeleton/proportions
1. LoRA → tries to impose character’s real body type
   Result: LoRA loses, character gets reshaped to match reference.

SOLUTION ARCHITECTURE:

LoRA (weight 0.8-1.0)     → owns: face, body, identity — 100%
Prompt (LoRA mode)         → owns: scene, lighting, environment — 100%, zero body description
ControlNet (weight 0.3-0.5) → owns: loose pose guidance only — NOT body proportions

KEY FIXES:

1. Drop ControlNet weight from ~0.8 to 0.3-0.5
   At high weight, ControlNet overrides LoRA body type.
   At 0.3-0.5 it guides pose loosely without forcing proportions.
1. Use DWPose only if you manually edit the skeleton first
   The extracted skeleton has the reference subject’s proportions.
   Either edit joint distances to match your character, or
   switch to Depth map (more forgiving of proportion mismatch).
1. Consider IP-Adapter for scene aesthetic instead of ControlNet for scene
   IP-Adapter can carry lighting/color/mood from reference without
   encoding pose or body geometry. Use it alongside ControlNet (not instead of).
1. Negative prompt body protection
   Always include in LoRA mode negatives:
   “thin, slim, petite, skinny, lean, narrow hips, changed proportions”
   This tells the model to not shrink your character toward the reference person.
1. LoRA prompt must have zero subject appearance description
   Any physical description of the reference subject = instruction to drift.
   The LoRA is the only casting director. The prompt is the set designer.

RECOMMENDED NODE ORDER (ComfyUI):
Load Image (reference) → ControlNet Preprocessor (Depth, not DWPose unless skeleton-edited)
→ ControlNet Apply (weight 0.35) → KSampler
Load LoRA (weight 0.85) → CLIP Text Encode (scene-only prompt from this engine)
→ KSampler → VAE Decode → Preview

PHASE 2 ADDITIONS (after prompt + LoRA are dialed):

- IP-Adapter: feed reference image for scene/lighting transfer
- Face Detailer: post-process for LoRA character sharpness
- Inpainting: outfit swaps (mask body only, preserve face + background)
- Multi-angle: same scene prompt + different pose references
  */
