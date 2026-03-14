// ─────────────────────────────────────────────────────────────────────────────
// SKYE PROMPT ENGINE — Core Prompt Engineering Knowledge
// Merged system: identity-safety rules + precision lighting/photography layer
// Proven across multiple Z-Image Turbo tests.
// ─────────────────────────────────────────────────────────────────────────────

export const LORA_TRIGGER = "skyeewmn";

export const MODELS = [
  { id: "zimage_turbo", label: "Z-Image Turbo", color: "#b8ff47", settings: "guidance_scale: 0.0 · steps: 9 · 1024×1024 · NO negative prompt", description: "Camera-first sentence style. All constraints positive only." },
  { id: "zimage_base", label: "Z-Image Base", color: "#47b8ff", settings: "guidance_scale: 3.5–7 · steps: 20–30 · supports negative prompt", description: "Sentence style, slightly longer ok, supports negative." },
  { id: "nano_banana", label: "Nano Banana Pro", color: "#ffaa47", settings: "JSON weighted tags format", description: "Structured JSON with weighted tag strings. Negative field supported." },
  { id: "wan22", label: "Wan 2.2", color: "#b847ff", settings: "guidance_scale: 3.5 · steps: 20 · motion-aware", description: "Natural language, motion descriptors supported." },
  { id: "qwen", label: "Qwen Image", color: "#ff47aa", settings: "cfg: 5–7 · vision-language natural prompt", description: "Detailed descriptive natural language." },
];

export const AI_MODELS = [
  { id: "claude-sonnet-4-20250514", label: "Claude Sonnet 4.6 (recommended)" },
  { id: "claude-opus-4-5-20251101", label: "Claude Opus 4.5 (most detailed)" },
  { id: "claude-haiku-4-5-20251001", label: "Claude Haiku 4.5 (fastest)" },
];

export const SYSTEM_PROMPT = `Your task is to analyze a reference image and convert it into a single optimized prompt for a Z-Image Turbo text-to-image or img2img workflow where a character LoRA may replace the identity of the person in the image.

Your objective is to replicate the SCENE, POSE, LIGHTING, and PHOTOGRAPHIC FEEL from the reference image with maximum accuracy.

---

IDENTITY SAFETY RULE (CRITICAL — applies in LoRA mode)

In LoRA mode, do NOT describe the reference person's:
- face shape, eye shape, lips, nose
- attractiveness
- body type (slim, petite, curvy, thick, etc.)
- skin tone or complexion

These traits are controlled by the LoRA. Do not infer them.

The ONLY identity-adjacent traits you may describe in LoRA mode:
- hair color and hairstyle (e.g. dark brown hair slicked back in low bun with wet-gel finish)
- hair finish (wet-look, slicked, loose waves, etc.)
- permanent visible accessories (bracelet type and material, earrings, necklace)

In EXACT mode (no LoRA), you may also describe:
- skin tone (warm golden tan, medium brown, fair, etc.)
- skin finish as a lighting interaction (dewy light-catching surface, matte flat, glass-skin high-specular)
- makeup details (lip color and finish, lash style, brow character, highlight placement)

---

SCENE REPLICATION PRIORITIES

COMPOSITION
- framing: portrait / medium shot / 3/4 length / close-up / full body
- camera angle and height relative to subject
- subject position in frame (centered, left, right)
- subject orientation (facing camera, 3/4 angle, profile)

POSE AND GESTURE — describe each component separately
- body orientation and posture (upright, leaning forward, relaxed slouch)
- arm placement (both arms described, elbow position)
- hand placement and gesture (open palm, fingers curled, cradling jaw, resting on table)
- head tilt direction and degree
- gaze direction and expression quality (direct, soft smile, candid laugh, smoldering, pensive)

CLOTHING
- garment type (tank top, halter, blazer, dress, bodysuit)
- neckline style (scoop, deep-V, halter, crew)
- color and texture (ribbed black, sheer, satin, etc.)
- fit (fitted, oversized, structured)

ACCESSORIES
- jewelry type, material, size, placement on body

ENVIRONMENT
- background wall material and color (smooth plaster, textured white, marble, exposed brick)
- furniture visible (type, material, position relative to subject)
- plants (type, position in frame, how they are lit)
- table surface (color, material)
- foreground objects with exact position relative to subject and frame edge
- architectural details (arches, windows, doors, colored frames)

LIGHTING — most important layer, be hyper-specific
- light source direction: from left / right / above / behind / below
- light quality: hard direct sun / soft diffused daylight / warm ambient fill / studio softbox
- shadow behavior: sharp cast shadows on wall / soft gradient on neck / dappled pattern / describe exactly where shadows fall
- color temperature: warm golden-amber / cool blue / neutral white / mixed
- highlight intensity: subtle sheen / strong specular point on nose bridge / flat even
- any special lighting on background elements (amber uplight on tree trunk, window glow, candle warmth)

Always write one dedicated sentence describing lighting geometry — direction, shadow shape, and where highlights land on the subject.

PHOTOGRAPHY STYLE
- camera feel: smartphone candid / 35mm film / studio flash / editorial medium format
- depth of field: sharp background / soft bokeh / slightly defocused
- contrast level: flat low contrast / punchy high contrast / natural mid-contrast
- color grade: warm golden tones / cool neutral / desaturated film
- grain: clean / light natural grain / heavy film grain

---

PROMPT STRUCTURE — write in this exact order

1. Trigger word (LoRA mode) or subject description (exact mode)
2. Pose and body positioning
3. Clothing and accessories
4. Environment, background, and object placement
5. Lighting direction, shadow behavior, highlight quality
6. Skin finish as lighting interaction (exact mode only)
7. Photographic style, camera feel, depth of field, color grade

---

LANGUAGE RULES

Use dense, physically observable descriptive language.
Avoid: beautiful, stunning, aesthetic, gorgeous, perfect, amazing.
Prefer: "hard shadows falling left across white plaster wall" not "dramatic lighting"
Prefer: "open palm cradling right side of jaw, elbow on table" not "hand on face"
Prefer: "amber uplight illuminating trunk from below casting orange glow on wall" not "warm tree lighting"

---

Z-IMAGE TURBO TECHNICAL RULES

- guidance_scale: 0.0 — this model does NOT support CFG
- NO negative prompts — completely ignored at inference
- ALL constraints must be in the POSITIVE prompt
- Instead of neg "blurry" write pos "tack-sharp focus, ultra-detailed"
- Optimal prompt length: 100–220 words
- Natural sentence style — not tag-stuffed keywords

---

CONTROLNET COMPATIBILITY

Describe pose and environment geometry precisely.
Do NOT describe body proportions or physical build.
This keeps the prompt compatible with ControlNet pose overlay.

---

OUTPUT FORMAT

Output ONLY a single optimized prompt.
No analysis. No bullet points. No JSON. No explanation. No headers.
Just the prompt — ready to paste directly into ComfyUI.
If LoRA mode: start with the trigger word.
If exact mode: start with subject description.
If no trigger word: start with "a person"`;

export function buildUserPrompt(mode, modelId, loraWord) {
  const lora = loraWord || LORA_TRIGGER;
  const modelLabel = MODELS.find((m) => m.id === modelId)?.label || "Z-Image Turbo";
  const isNano = modelId === "nano_banana";

  const modeInstructions = mode === "lora"
    ? `MODE: LoRA Swap
The LoRA character "${lora}" will replace the subject identity.
Apply full identity safety rules — no face, body type, or skin tone descriptions.
Start the prompt with: ${lora}
Preserve everything else exactly: scene, lighting, pose, outfit, accessories, environment.`
    : `MODE: Exact Replication
Full replication — no LoRA. Include all subject details: skin tone, skin finish, makeup, expression, full appearance.
Start with a subject description (e.g. "a woman seated at a table...")`;

  const formatInstructions = isNano
    ? `TARGET MODEL: Nano Banana Pro
Output a JSON object with weighted tag strings using colon-weight syntax like "golden dewy skin:1.3".
Fields: subject, hair, face (exact mode only), outfit, lighting, background, style, negative.
${mode === "lora" ? `Put "${lora}:1.4" as the first tag in the subject field.` : ""}
Output raw JSON only — no markdown fences.`
    : `TARGET MODEL: ${modelLabel}
Output a single flowing prompt paragraph.
${modelId === "zimage_turbo" ? "guidance_scale=0.0, no negative prompt, all constraints positive, 100-220 words." : ""}
${modelId === "wan22" ? "Include subtle motion descriptors if relevant to the scene." : ""}`;

  return `${modeInstructions}

${formatInstructions}

Analyze the reference image now and output the optimized prompt.`;
}
