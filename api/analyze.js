export const config = { runtime: 'edge' };

const SYSTEM_PROMPT = `You are SKYE PROMPT ENGINE — an expert AI image analyst and prompt engineer specializing in diffusion model prompting.

## Z-Image Turbo Rules
- NO negative prompts. guidance_scale=0.0. Distilled model ignores CFG entirely.
- ALL constraints go in POSITIVE prompt. Instead of neg "blurry" write pos "ultra-sharp focus, tack-sharp eyes"
- CAMERA-FIRST order: shot type → camera angle → lighting → background → subject → outfit → expression → quality locks
- Natural sentence style, NOT keyword tag-stuffing
- 100–220 words optimal. Long + precise = great. Vague = bad.
- Settings: guidance_scale: 0.0 | steps: 9 | 1024×1024

## Z-Image Base Rules
- Supports negative prompts (CFG 3.5–7, steps 20–30)
- Sentence style, slightly longer and more descriptive ok
- Output separate negative_prompt field

## Nano Banana Pro Rules  
- JSON weighted tag format with colon-weight syntax: "dewy skin:1.3"
- Subject field first, lora trigger word:1.4 first in subject if lora mode
- Include "negative" key

## Wan 2.2 Rules
- Natural language, motion-aware. Add movement descriptors.
- Supports negative prompts. Steps 20, CFG 3.5.

## Qwen Image Rules
- Highly descriptive natural language. Scene-setting style. CFG 5–7.

## Forensic Image Analysis — Extract ALL of:
Shot type, camera angle, lighting direction+quality+color temperature+shadow+highlights+catchlights, background environment+blur level, skin tone+finish (dewy/glassy/matte/glowing)+texture+glow, hair color+style+texture+product, eye color+lash density+brow shape+liner, lip shade+finish+fullness, makeup details (highlight on cupid's bow/nose/cheekbones, blush, contour), outfit every garment+color+cut+material, accessories type+metal+size, expression exact mood, body language, color grade warm/cool/contrast, overall vibe.

## LoRA Swap Rules
- LoRA trigger word FIRST before everything else
- Replace subject identity with LoRA character entirely
- PRESERVE: lighting, background, composition, outfit, accessories, makeup STYLE, skin FINISH, expression MOOD, color grade, aura
- Apply makeup/skin finish TO lora character (e.g. "skyeewmn has glass-skin dewy glow, wears nude-mauve lip gloss")
- NO original subject face descriptors. No character drift.

Output ONLY raw JSON. No markdown. No fences. No explanation. Pure JSON only.`;

const buildUserPrompt = (model, mode, lora) => {
  const l = lora || 'skyeewmn';
  const loraNote = mode === 'lora' ? `Mode: LORA SWAP. LoRA trigger: "${l}". Place "${l}" first in prompt. Preserve scene/outfit/makeup style, replace subject identity.` : 'Mode: EXACT CLONE. Replicate every detail precisely.';

  const analysisFields = mode === 'lora'
    ? `"shot":"","angle":"","lighting":"","background":"","outfit":"","makeup_skin":"","expression":"","color_grade":"","vibe":""`
    : `"shot":"","angle":"","lighting":"","background":"","subject_appearance":"","outfit":"","makeup_skin":"","expression":"","color_grade":"","vibe":""`;

  const schemas = {
    'zimage-turbo': `{"analysis":{${analysisFields}},"prompt":"[100-220 word sentence-style positive-only camera-first prompt]","settings":"guidance_scale: 0.0 | steps: 9 | 1024x1024 | NO negative prompt"}`,
    'zimage-base': `{"analysis":{${analysisFields}},"prompt":"[sentence-style prompt]","negative_prompt":"[unwanted elements]","settings":"guidance_scale: 3.5-7 | steps: 20-30"}`,
    'nano-banana': `{"analysis":{${analysisFields}},"prompt":{"subject":"${mode==='lora'?l+':1.4, ':''}...","skin":"...","hair":"...","face":"...","outfit":"...","lighting":"...","background":"...","style":"photorealistic:1.3, ultra-detailed","negative":"blurry, artifacts, watermark, extra limbs"},"settings":"Nano Banana Pro weighted JSON"}`,
    'wan': `{"analysis":{${analysisFields}},"prompt":"[natural language motion-aware prompt${mode==='lora'?' starting with '+l:''}]","negative_prompt":"[unwanted elements]","settings":"guidance_scale: 3.5 | steps: 20"}`,
    'qwen': `{"analysis":{${analysisFields}},"prompt":"[highly descriptive natural language${mode==='lora'?' starting with '+l:''}]","settings":"cfg: 5-7"}`,
  };

  return `Analyze this reference image. ${loraNote}
Generate a prompt optimized for: ${model.toUpperCase()}.
Output exactly this JSON structure (fill all fields):
${schemas[model] || schemas['zimage-turbo']}`;
};

export default async function handler(req) {
  if (req.method !== 'POST') return new Response('POST only', { status: 405 });

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return new Response(JSON.stringify({ error: 'ANTHROPIC_API_KEY environment variable not set in Vercel.' }), { status: 500, headers: {'Content-Type':'application/json'} });

  let body;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: 'Invalid request body' }), { status: 400, headers: {'Content-Type':'application/json'} }); }

  const { base64, mediaType, model, mode, lora, claudeModel } = body;
  if (!base64 || !mediaType || !model || !mode) {
    return new Response(JSON.stringify({ error: 'Missing: base64, mediaType, model, mode' }), { status: 400, headers: {'Content-Type':'application/json'} });
  }

  try {
    const resp = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: claudeModel || 'claude-sonnet-4-20250514',
        max_tokens: 1200,
        system: SYSTEM_PROMPT,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: buildUserPrompt(model, mode, lora) }
          ]
        }]
      })
    });

    if (!resp.ok) {
      const e = await resp.json().catch(() => ({}));
      return new Response(JSON.stringify({ error: e?.error?.message || `API error ${resp.status}` }), { status: resp.status, headers: {'Content-Type':'application/json'} });
    }

    const data = await resp.json();
    const raw = data.content.map(b => b.text || '').join('').replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);
    return new Response(JSON.stringify({ result: parsed }), { status: 200, headers: {'Content-Type':'application/json'} });

  } catch(err) {
    return new Response(JSON.stringify({ error: 'Analysis failed: ' + err.message }), { status: 500, headers: {'Content-Type':'application/json'} });
  }
}
