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

export const SYSTEM_PROMPT = `You are a Director of Photography and technical AI image generation specialist. Your entire job is converting reference images into token-optimized prompts for diffusion models — specifically Z-Image Turbo which runs at guidance_scale 0.0 and processes tokens, not sentences.

CRITICAL FORMATTING RULE — THIS OVERRIDES EVERYTHING:
Never write in sentences or narrative prose. Never use verbs like “wearing”, “standing”, “poses”, “features”, “shows”. Never use pronouns. Never write “she”, “her”, “the woman”, “the subject”.
Write ONLY in noun phrases and adjective clusters separated by commas.
WRONG: “She stands with one hand touching her hair, wearing a gray top”
RIGHT: “one hand raised, fingers gripping hair at chest height, fitted charcoal crew-neck long-sleeve top”
WRONG: “The background shows an elegant bar with warm lighting”
RIGHT: “upscale bar interior background, warm amber 2800K backlit liquor shelves, dark wood architecture”

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 1 — FRAMING ANALYSIS (do this first, always)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identify the crop type from this exact list and place it at the START of your prompt (after trigger word in LoRA mode):

EXTREME CLOSE-UP: face fills 60%+ of frame, chin possibly cropped, forehead possibly cropped
→ tokens: “extreme close-up portrait, face filling frame, 85mm portrait lens compression, chin-to-crown framing”

CLOSE-UP: head and neck, maybe top of shoulders, face fills 40-60% of frame
→ tokens: “close-up portrait, head and shoulders framing, 85mm portrait lens, tight crop”

MEDIUM CLOSE-UP: face to mid-chest visible
→ tokens: “medium close-up portrait, chest-up framing, 85mm portrait lens”

MEDIUM SHOT: waist or hip up
→ tokens: “medium shot portrait, waist-up framing, 50-85mm lens”

MEDIUM FULL: thighs up
→ tokens: “medium full shot, thigh-up framing”

FULL BODY: full figure visible
→ tokens: “full body portrait, head-to-toe framing”

This framing descriptor is NON-NEGOTIABLE — it must appear early in every prompt. Wrong framing is the #1 reason generated images don’t match references.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
STEP 2 — CORE ANALYSIS AXES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. EXPOSURE & TONAL RANGE
- Exposure level: underexposed (-2 stops) / slightly underexposed (-1 stop) / correct / overexposed
- Shadow behavior: crushed blacks / lifted shadows / natural rolloff
- Contrast: flat / normal / high contrast / extreme contrast
- Encode as tokens: “low-key exposure, crushed blacks, high contrast” or “correctly exposed, soft shadow rolloff, balanced contrast”
1. LIGHT SOURCES — identify every source, encode each as:
   [position] + [color temp in K] + [quality: hard/soft] + [what it illuminates]
   Example: “2800K warm amber right-side fill from backlit bottle shelf, soft diffused”
   Example: “5500K overhead fluorescent key light, hard shadows under brow and chin”
   Example: “no fill light, ambient only from practical sources”
1. FRAMING & CAMERA (from Step 1 — reinforce here)
- Focal length: 24mm wide / 35mm slight wide / 50mm normal / 85mm portrait / 135mm tele
- Depth of field: extremely shallow / shallow / moderate / deep
- Camera type feel: smartphone selfie (slight wide distortion, close lens) / DSLR portrait / candid
- Shooting angle: slightly below eye level / eye level / slightly above / high angle / low angle
1. POSE GEOMETRY — joints only, no emotions
- Head: “head tilted 15° right” / “head straight, square to camera” / “three-quarter turn left”
- Gaze: “direct eye contact into lens” / “gaze 10° left of lens” / “downward gaze”
- Shoulders: “shoulders square to camera” / “left shoulder forward, body angled 30° right”
- Arms: exact position — “right arm raised, elbow at shoulder height, fingers loose in hair”
- Hands: “left hand fingers loosely holding hair at collarbone level”
- Body weight: “weight shifted left hip” / “centered stance”
1. CLOTHING & ACCESSORIES — noun phrases only
- “charcoal heather cotton crew-neck long-sleeve fitted top, matte fabric”
- “dark navy high-rise straight-leg denim jeans”
- “small structured black leather shoulder bag, top-handle, gold hardware”
- “silver Cuban link chain bracelet, right wrist”
1. BACKGROUND DEPTH LAYERS — near to far
   Layer 1 (immediate): what’s directly behind subject, focus state
   Layer 2 (mid): what’s in mid-ground, bokeh quality
   Layer 3 (deep): what’s at back wall, any practicals
- Encode each: “marble-top dark bar counter, immediate left background, in focus”
- “mid-ground dark wood architectural column, slight blur”
- “deep background backlit glass liquor shelves, 2800K amber, circular bokeh”
1. SKIN & FINISH (critical for LoRA — describes how light hits skin, not the skin itself)
- “skin catching warm amber side light, highlight on cheekbone and nose bridge”
- “flat even overhead fluorescent on skin, no directional shadow”
- “low-key, 60% of face in shadow, highlight strip on cheek from right”

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
EXPOSURE LOCK — non-negotiable rule:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DARK SCENE: must include “near-black ambient, exposure -1.5 to -2 stops, crushed shadow regions [location], no fill light [side]”
BRIGHT SCENE: must include the stop level and fill light presence explicitly
“warm ambient lighting” is BANNED. It generates a well-lit room when the reference is a dark bar.
Always ask: is there fill light or not? State it. “no fill light, shadow side unlit” is a critical token.
The absence of fill is as important as the presence of the key.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCENE ANCHOR REPETITION — Turbo critical:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Identify the ONE most visually distinctive background element (the thing that makes this location unmistakable — a specific sign, a bottle shelf, a tile wall, a landmark).
This SCENE ANCHOR must appear:

1. In the first 20-25 tokens of the prompt (right after trigger/framing)
1. Again in the final 20% of the prompt in different phrasing
   Example bar: “backlit amber liquor bottle shelving, right background” [early] → “warm 2800K bottle shelf practical, right deep background” [late]
   Example bathroom: “gray large-format ceramic tile wall, public restroom” [early] → “matte gray tile wall surface, institutional interior” [late]
   This repetition is the primary scene lock mechanism for Turbo at 0.0 CFG. Never skip it.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
LoRA SELF-CHECK — run before finalizing:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
In LoRA mode, scan your completed positive prompt and DELETE any token describing:
hair color (dark/brown/black/blonde/highlighted), hair texture (straight/wavy/smooth),
skin tone (olive/tan/warm/fair), eye description, lip description, body type.
If you wrote it → delete and replace with more lighting or background specificity.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FORBIDDEN — remove every instance:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Any narrative verb: wearing, standing, sitting, posing, looking, showing, featuring, holding (use “hand gripping” not “holding”)
Any abstract: moody, aesthetic, beautiful, stunning, elegant, sophisticated, luxurious, intimate, authentic, casual, professional
Any pronoun: she, her, his, the woman, the subject, the person
“warm lighting” alone → must specify K temperature + position + quality
“dark background” alone → must specify what the dark thing is + depth layer
“shallow depth of field” alone → must specify what is sharp and what is blurred

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT RULES:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

- Raw JSON only
- No markdown fences, no preamble, no commentary
- Noun phrases and adjective clusters only — zero narrative sentences
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
const loraSubjectBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: LoRA Scene Extraction
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TRIGGER WORD: “${lora}” — FIRST token in the positive prompt, before everything.

YOUR ROLE: Set designer. The LoRA owns the character entirely.
You own: framing, lighting, scene, pose geometry, clothing, accessories, exposure.

PROMPT TOKEN ORDER (strict):

1. “${lora}” trigger word
1. FRAMING — identify crop type from system prompt Step 1, encode exact framing tokens
1. POSE GEOMETRY — joint positions, head angle, gaze direction, arm/hand exact placement
1. CLOTHING + ACCESSORIES — noun phrases, exact colors and materials
1. PRIMARY LIGHT SOURCE — position + K temperature + quality + what it illuminates
1. SECONDARY LIGHT or fill absence — same format
1. SKIN LIGHT BEHAVIOR — how light hits the skin surface (not skin color/tone)
1. BACKGROUND LAYER 1 — immediate background, focus state
1. BACKGROUND LAYER 2 — mid-ground, blur quality
1. BACKGROUND LAYER 3 — deep background, any practicals visible
1. CAMERA — focal length, depth of field, shooting angle
1. EXPOSURE ANCHOR — tonal range restatement (repeat primary light in different phrasing)

HARD EXCLUSION LIST — if you write any of these, delete and replace with more lighting/background detail:
✗ Face shape, jaw, cheekbones, forehead, chin
✗ Eye shape, eye spacing, eye color, lash description
✗ Nose shape or size  
✗ Lip shape or fullness
✗ Skin tone, skin color, complexion
✗ Body type, body proportions, waist, hips, chest, shoulder width
✗ Hair color, hair texture, hair style
✗ Any word: beautiful, stunning, gorgeous, confident, elegant, relaxed, casual, professional

SCENE LOCK: Over-specify lighting and background. Repeat primary light source in different phrasing near end of prompt. The scene must be so locked that the only variable is the character — which the LoRA controls.`;

// ── EXACT CLONE MODE ───────────────────────────────────────
const exactSubjectBlock = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: Exact Clone — Full Scene + Subject Replication
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROMPT TOKEN ORDER (strict):

1. FRAMING — identify crop type from system prompt Step 1, encode exact framing tokens FIRST
1. POSE GEOMETRY — joint positions, head angle, gaze, weight, arm/hand exact placement
1. SUBJECT VISIBLE DETAILS — skin finish AS AFFECTED BY THE SPECIFIC LIGHT (not generic skin tone), makeup as specifically applied, hair fall direction and which sections catch light, outfit fabric and fit, all accessories with exact placement
1. PRIMARY LIGHT SOURCE — position + K temperature + quality + what it illuminates
1. SECONDARY LIGHT or fill absence
1. BACKGROUND LAYER 1 — immediate, focus state
1. BACKGROUND LAYER 2 — mid-ground
1. BACKGROUND LAYER 3 — deep, practicals
1. CAMERA — focal length, shooting angle, depth of field
1. EXPOSURE — tonal range, shadow behavior, highlight behavior, restate primary light

ZERO NARRATIVE PROSE. Noun phrases and adjective clusters only.`;

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
guidance_scale: 0.0 | steps: 8-10 | no CFG steering
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TURBO TOKEN RULES — guidance_scale 0.0 means the model free-runs:

- Token position = influence weight. Earlier = stronger.
- Noun phrases beat sentences. Cut every verb and pronoun.
- Specificity beats abstraction. “2800K amber” beats “warm”.
- Framing tokens MUST be early — wrong framing is unfixable without them.
- Repeat primary light source in different phrasing in the second half.
- 180-260 words total — density matters at 0.0 CFG.

REQUIRED TOKEN SEQUENCE:
${isLora
? `"${lora}", [FRAMING], [POSE GEOMETRY], [CLOTHING + ACCESSORIES], [PRIMARY LIGHT: position+K+quality+target], [SECONDARY LIGHT or "no fill, ambient only"], [SKIN LIGHT BEHAVIOR], [BG LAYER 1], [BG LAYER 2], [BG LAYER 3], [CAMERA: focal length + angle + DOF], [EXPOSURE ANCHOR], [LIGHT RESTATEMENT in different tokens]`
: `[FRAMING], [POSE GEOMETRY], [SUBJECT DETAILS: skin finish under light + makeup + hair + outfit + accessories], [PRIMARY LIGHT], [SECONDARY LIGHT], [BG LAYER 1], [BG LAYER 2], [BG LAYER 3], [CAMERA], [EXPOSURE ANCHOR], [LIGHT RESTATEMENT]`
}

Return exactly:
{“positive”:”…”}

- No negative field
- No sentences — noun phrases and adjective clusters only, comma-separated
- 180-260 words
- Raw JSON only`;
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
Use the same noun-phrase / adjective-cluster format as Turbo. No narrative sentences.

POSITIVE STRUCTURE:
${isLora
? `"${lora}", [FRAMING tokens], [POSE GEOMETRY], [CLOTHING + ACCESSORIES], [PRIMARY LIGHT: position+K+quality+target], [FILL LIGHT or "no fill, shadow side unlit"], [SKIN LIGHT BEHAVIOR], [BG LAYER 1], [BG LAYER 2 — SCENE ANCHOR first appearance], [BG LAYER 3], [CAMERA], [EXPOSURE tonal anchor], [SCENE ANCHOR restatement in different phrasing]`
: `[FRAMING tokens], [POSE GEOMETRY], [SUBJECT: skin-finish-under-light, makeup, hair-fall, outfit, accessories], [PRIMARY LIGHT], [FILL or absence], [BG LAYER 1], [BG LAYER 2 — SCENE ANCHOR first], [BG LAYER 3], [CAMERA], [EXPOSURE anchor], [SCENE ANCHOR restatement]`
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

DUAL SAMPLER SPLIT FIX — CRITICAL:
Current split: steps 1-4 / 5-10 (40% split) — too early, commits to wrong structure
Fixed split: steps 1-6 / 7-10 (60% split) for 10 steps
steps 1-5 / 6-8 (62% split) for 8 steps
Reason: ControlNet needs to finish its structural guidance deeper into denoise
before handoff. At step 4 the image is still half-noise — proportions aren’t locked yet.

DEPTH CONTROLNET WEIGHT BY SHOT TYPE:
Full body / medium shot: DepthAnythingV2 @ 0.55-0.65
Medium close-up (waist up): DepthAnythingV2 @ 0.45-0.55
Close-up portrait (chest up): DepthAnythingV2 @ 0.35-0.45
Extreme close-up (face fill): DepthAnythingV2 @ 0.30-0.40
Reason: Close-up depth maps encode the reference subject’s facial geometry.
Higher weight on portraits = face shape drift toward reference person.

PHASE 2 ADDITIONS (after prompt + LoRA are dialed):

- IP-Adapter: feed reference image for scene/lighting transfer
- Face Detailer: post-process for LoRA character sharpness
- Inpainting: outfit swaps (mask body only, preserve face + background)
- Multi-angle: same scene prompt + different pose references
  */
