"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { MODELS, AI_MODELS, PROVIDERS, LORA_TRIGGER } from "@/lib/prompts";

const C = {
  bg: "#080808", surface: "#0f0f0f", card: "#121212", border: "#1c1c1c",
  accent: "#b8ff47", accentDim: "rgba(184,255,71,0.08)",
  text: "#e0e0e0", muted: "#555", sub: "#888",
};

const S = {
  input: { width:"100%", background:"#0a0a0a", border:`1px solid ${C.border}`, color:C.text, padding:"9px 12px", borderRadius:8, fontFamily:"'Space Mono',monospace", fontSize:12, outline:"none", boxSizing:"border-box" },
  select: { width:"100%", background:"#0a0a0a", border:`1px solid ${C.border}`, color:C.text, padding:"9px 12px", borderRadius:8, fontFamily:"'Space Mono',monospace", fontSize:12, outline:"none", cursor:"pointer" },
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:12 },
  ch: { padding:"10px 14px", borderBottom:`1px solid ${C.border}`, fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", display:"flex", justifyContent:"space-between", alignItems:"center" },
  label: { display:"block", fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 },
  mono: { fontFamily:"'Space Mono',monospace" },
};

// ââ REAL MODEL LOGOS (official brand images via CDN) ââââââââââââââââââââââââââ
// Z-Image = Tongyi/Alibaba Cloud logo
// Nano Banana Pro = Google Gemini 3.0 Pro Image (WaveSpeed codename) = Google logo
// Wan 2.2 = Wan Video by Alibaba = Alibaba/Tongyi logo
// Qwen Image = Qwen by Alibaba = Qwen logo
const MODEL_LOGOS = {
  zimage_turbo: (
    <img src="https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/assets/logo.png"
      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
      style={{ width:22, height:22, borderRadius:4, objectFit:"contain" }} alt="Z-Image" />
  ),
  zimage_base: (
    <img src="https://huggingface.co/Tongyi-MAI/Z-Image-Turbo/resolve/main/assets/logo.png"
      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
      style={{ width:22, height:22, borderRadius:4, objectFit:"contain" }} alt="Z-Image" />
  ),
  nano_banana: (
    <img src="https://www.gstatic.com/lamda/images/gemini_sparkle_v002_d4735304ff6292a690345.svg"
      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
      style={{ width:22, height:22, objectFit:"contain" }} alt="Gemini" />
  ),
  wan22: (
    <img src="https://avatars.githubusercontent.com/u/165069895?s=48&v=4"
      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
      style={{ width:22, height:22, borderRadius:4, objectFit:"contain" }} alt="Wan" />
  ),
  qwen: (
    <img src="https://qianwen-res.oss-cn-beijing.aliyuncs.com/logo/qwen.png"
      onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
      style={{ width:22, height:22, borderRadius:4, objectFit:"contain" }} alt="Qwen" />
  ),
};

// Fallback colored letter badges if logos fail to load
const MODEL_FALLBACK = {
  zimage_turbo: { letter:"Z", color:"#b8ff47" },
  zimage_base:  { letter:"Z", color:"#47b8ff" },
  nano_banana:  { letter:"G", color:"#4285f4" },
  wan22:        { letter:"W", color:"#b847ff" },
  qwen:         { letter:"Q", color:"#ff47aa" },
};

function ModelLogo({ modelId, size=22 }) {
  const fb = MODEL_FALLBACK[modelId] || { letter:"?", color:C.muted };
  return (
    <span style={{ position:"relative", display:"inline-flex", width:size, height:size, flexShrink:0 }}>
      {MODEL_LOGOS[modelId] && (
        <span style={{ position:"absolute", inset:0, display:"flex" }}>
          {MODEL_LOGOS[modelId]}
        </span>
      )}
      {/* fallback â hidden unless img errors */}
      <span style={{ display:"none", width:size, height:size, borderRadius:4, background:`${fb.color}20`, alignItems:"center", justifyContent:"center", fontFamily:"'Space Mono',monospace", fontWeight:700, fontSize:size*0.55, color:fb.color }}>
        {fb.letter}
      </span>
    </span>
  );
}

// ââ SVG ICONS âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
const Eye = ({ color=C.muted, size=15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const EyeOff = ({ color=C.muted, size=15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const SearchIcon = ({ color="#000", size=15 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);
const RefreshIcon = ({ color="#aaa", size=12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
  </svg>
);
const CopyIcon = ({ color="#000", size=12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>
);
const CheckIcon = ({ color=C.accent, size=12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);
const XIcon = ({ color="#555", size=13 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);
const ChevDown = ({ color=C.muted, size=12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);
const ChevRight = ({ color=C.muted, size=11 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

// ââ SMALL COMPONENTS ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function EyeToggle({ visible, onToggle }) {
  return (
    <button onClick={onToggle} style={{ padding:"0 11px", borderRadius:7, background: visible ? C.accentDim : "#0d0d0d", border:`1px solid ${visible ? C.accent : C.border}`, cursor:"pointer", display:"flex", alignItems:"center", height:36, minWidth:36, transition:"all 0.15s" }}>
      {visible ? <Eye color={C.accent}/> : <EyeOff color={C.muted}/>}
    </button>
  );
}

function CopyBtn({ text, small }) {
  const [done, setDone] = useState(false);
  const go = () => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }); };
  return (
    <button onClick={go} style={{ padding: small ? "5px 10px" : "8px 16px", borderRadius:7, background: done ? C.accentDim : C.accent, color: done ? C.accent : "#000", border: done ? `1px solid ${C.accent}` : "none", fontFamily:"'Space Mono',monospace", fontSize: small ? 10 : 11, fontWeight:700, cursor:"pointer", transition:"all 0.12s", display:"inline-flex", alignItems:"center", gap:5 }}>
      {done ? <><CheckIcon color={C.accent}/> COPIED</> : <><CopyIcon color={small ? C.accent : "#000"}/> COPY</>}
    </button>
  );
}

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"6px 14px", borderRadius:7, fontFamily:"'Space Mono',monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.05em", border:`1px solid ${active ? C.accent : C.border}`, background: active ? C.accent : "transparent", color: active ? "#000" : C.muted, cursor:"pointer", transition:"all 0.12s", whiteSpace:"nowrap" }}>
      {label}
    </button>
  );
}

function ModeBtn({ label, desc, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"10px 12px", borderRadius:9, textAlign:"left", border:`1px solid ${active ? C.accent : C.border}`, background: active ? C.accentDim : "#0d0d0d", cursor:"pointer", flex:1, transition:"all 0.12s" }}>
      <div style={{ ...S.mono, fontSize:11, color: active ? C.accent : C.sub }}>{label}</div>
      <div style={{ ...S.mono, fontSize:9, color:C.muted, marginTop:2 }}>{desc}</div>
    </button>
  );
}

function ModelPill({ model, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"6px 12px", borderRadius:999, border:`1px solid ${active ? model.color : C.border}`, background: active ? `${model.color}15` : "transparent", color: active ? model.color : C.muted, fontFamily:"'Space Mono',monospace", fontSize:11, cursor:"pointer", transition:"all 0.12s", whiteSpace:"nowrap", display:"inline-flex", alignItems:"center", gap:6 }}>
      <ModelLogo modelId={model.id} size={16}/>
      {model.label}
    </button>
  );
}

// ââ DROP ZONE âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
function DropZone({ imageData, onFile, onClear }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const drop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
  return (
    <div>
      <div onClick={() => ref.current?.click()} onDragOver={e => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={drop}
        style={{ border:`2px dashed ${drag ? C.accent : imageData ? "#2a3800" : "#222"}`, borderRadius:12, background: drag ? C.accentDim : imageData ? "#0a1200" : "#0d0d0d", cursor:"pointer", transition:"all 0.15s", overflow:"hidden", minHeight: imageData ? "auto" : 160, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        {imageData ? (
          <>
            <img src={imageData.dataUrl} alt="" style={{ width:"100%", display:"block", maxHeight:240, objectFit:"cover", borderRadius:10 }} />
            <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.85)", borderRadius:5, padding:"2px 8px", ...S.mono, fontSize:10, color:C.accent, display:"flex", alignItems:"center", gap:4 }}>
              <CheckIcon color={C.accent} size={10}/> LOADED
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"24px 16px" }}>
            {/* Upload illustration */}
            <svg width="72" height="72" viewBox="0 0 72 72" fill="none" style={{ display:"block", margin:"0 auto 12px" }}>
              <rect x="6" y="20" width="60" height="42" rx="8" fill="#151515" stroke="#262626" strokeWidth="1.5"/>
              <circle cx="36" cy="41" r="13" fill="#111" stroke="#2a2a2a" strokeWidth="1.5"/>
              <circle cx="36" cy="41" r="8" fill="#151515" stroke={C.accent} strokeWidth="1.5" opacity="0.5"/>
              <circle cx="36" cy="41" r="3.5" fill={C.accent} opacity="0.4"/>
              <rect x="12" y="12" width="14" height="9" rx="3" fill="#1e1e1e" stroke="#2a2a2a" strokeWidth="1"/>
              <circle cx="57" cy="25" r="3" fill={C.accent} opacity="0.7"/>
              {/* upload arrow */}
              <line x1="36" y1="4" x2="36" y2="12" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round"/>
              <polyline points="30,9 36,3 42,9" stroke={C.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            </svg>
            <div style={{ ...S.mono, fontSize:11, color:"#666" }}>Drop image or tap to upload</div>
            <div style={{ ...S.mono, fontSize:10, color:"#333", marginTop:4 }}>JPG / PNG / WEBP</div>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={e => e.target.files[0] && onFile(e.target.files[0])} />
      {imageData && (
        <button onClick={onClear} style={{ marginTop:6, background:"none", border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, padding:"3px 10px", ...S.mono, fontSize:10, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:5 }}>
          <XIcon color={C.muted} size={11}/> Remove
        </button>
      )}
    </div>
  );
}

// ââ SINGLE PROMPT OUTPUT BOX ââââââââââââââââââââââââââââââââââââââââââââââââââ
function PromptBox({ entry, onRemove }) {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const model = MODELS.find(m => m.id === entry.modelId) || MODELS[0];
  const wc = entry.prompt ? entry.prompt.trim().split(/\s+/).filter(Boolean).length : 0;
  const wOk = wc >= 80 && wc <= 250;

  return (
    <div style={{ background:"#090d00", border:`1px solid #1e2800`, borderRadius:12, marginBottom:12, overflow:"hidden" }}>
      {/* Header */}
      <div style={{ padding:"9px 14px", background:"#0a0f00", borderBottom:"1px solid #1e2800", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap" }}>
        <ModelLogo modelId={entry.modelId} size={18}/>
        <span style={{ ...S.mono, fontSize:10, color:model.color }}>{model.label}</span>
        <span style={{ ...S.mono, fontSize:9, color: wOk ? C.accent : "#ff8844", border:"1px solid currentColor", padding:"1px 5px", borderRadius:3 }}>
          {wc}w {wOk ? "OK" : wc < 80 ? "SHORT" : "LONG"}
        </span>
        <span style={{ ...S.mono, fontSize:9, color:C.muted, border:`1px solid ${C.border}`, padding:"1px 5px", borderRadius:3, textTransform:"uppercase" }}>
          {entry.mode}
        </span>
        <span style={{ ...S.mono, fontSize:9, color:"#555" }}>#{entry.index}</span>
        <div style={{ marginLeft:"auto", display:"flex", gap:6, alignItems:"center" }}>
          {entry.analysis && (
            <button onClick={() => setShowAnalysis(!showAnalysis)} style={{ ...S.mono, fontSize:9, color:C.muted, background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"3px 8px", cursor:"pointer", display:"flex", alignItems:"center", gap:4 }}>
              ANALYSIS <ChevDown color={C.muted} size={10}/>
            </button>
          )}
          <button onClick={onRemove} style={{ background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"3px 7px", cursor:"pointer", display:"flex", alignItems:"center" }}>
            <XIcon color="#555" size={11}/>
          </button>
        </div>
      </div>

      {/* Analysis dropdown */}
      {showAnalysis && entry.analysis && (
        <div style={{ padding:"12px 14px", background:"#050800", borderBottom:"1px solid #1a2200", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"8px 14px" }}>
          {Object.entries(entry.analysis).filter(([,v]) => v).map(([k,v]) => (
            <div key={k}>
              <div style={{ ...S.mono, fontSize:9, color:"#3a4a00", textTransform:"uppercase", marginBottom:2 }}>{k.replace(/_/g," ")}</div>
              <div style={{ ...S.mono, fontSize:10, color:"#778844", lineHeight:1.5 }}>{v}</div>
            </div>
          ))}
        </div>
      )}

      {/* Prompt text */}
      <div style={{ padding:14, ...S.mono, fontSize:12, lineHeight:1.9, color:"#ccc", whiteSpace:"pre-wrap", wordBreak:"break-word" }}>
        {entry.prompt}
      </div>

      {/* Footer with settings + copy */}
      <div style={{ padding:"9px 14px", background:"#0a0f00", borderTop:"1px solid #1e2800", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ ...S.mono, fontSize:9, color:"#2a3a00" }}>{model.settings}</span>
        <CopyBtn text={entry.prompt}/>
      </div>
    </div>
  );
}

function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = e => res({ base64: e.target.result.split(",")[1], mediaType: file.type, dataUrl: e.target.result, name: file.name });
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

// ââ MAIN ââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
export default function Home() {
  const [tab, setTab] = useState("single");
  const [provider, setProvider] = useState("anthropic");
  const [apiKeys, setApiKeys] = useState({ anthropic:"", openai:"", gemini:"" });
  const [keyVisible, setKeyVisible] = useState(false);
  const [aiModel, setAiModel] = useState("claude-sonnet-4-20250514");
  const [targetModel, setTargetModel] = useState("zimage_turbo");
  const [mode, setMode] = useState("exact");
  const [loraWord, setLoraWord] = useState(LORA_TRIGGER);

  // Single tab
  const [singleImg, setSingleImg] = useState(null);
  const [outputs, setOutputs] = useState([]); // array of output boxes, stacked
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState("");
  const outputCounter = useRef(0);

  // Batch
  const [batchImgs, setBatchImgs] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState("");

  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try {
      const keys = JSON.parse(localStorage.getItem("skye_keys") || "{}");
      const lora = localStorage.getItem("skye_lora") || LORA_TRIGGER;
      const prov = localStorage.getItem("skye_provider") || "anthropic";
      const sv = JSON.parse(localStorage.getItem("skye_saved") || "[]");
      if (Object.keys(keys).length) setApiKeys(prev => ({ ...prev, ...keys }));
      setLoraWord(lora); setProvider(prov); setSaved(sv);
      const models = AI_MODELS[prov]; if (models) setAiModel(models[0].id);
    } catch {}
  }, []);

  const persistKeys = u => { setApiKeys(u); localStorage.setItem("skye_keys", JSON.stringify(u)); };
  const persistLora = l => { setLoraWord(l); localStorage.setItem("skye_lora", l); };
  const persistProvider = p => {
    setProvider(p); localStorage.setItem("skye_provider", p);
    const m = AI_MODELS[p]; if (m) setAiModel(m[0].id);
  };

  const activeModel = MODELS.find(m => m.id === targetModel) || MODELS[0];
  const currentKey = apiKeys[provider] || "";
  const providerInfo = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  const callAnalyze = useCallback(async imgData => {
    if (!currentKey.trim()) throw new Error("Enter your API key above.");
    const res = await fetch("/api/analyze", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ imageBase64: imgData.base64, mediaType: imgData.mediaType, mode, modelId: targetModel, loraWord, apiKey: currentKey.trim(), aiModel, provider }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
    const prompt = data.result?.prompt || data.result || "";
    return { prompt: typeof prompt === "string" ? prompt : JSON.stringify(prompt, null, 2), analysis: data.result?.analysis || null };
  }, [currentKey, mode, targetModel, loraWord, aiModel, provider]);

  // Analyze & Generate â adds a NEW box each time, image stays loaded
  const runSingle = async () => {
    if (!singleImg) return;
    setSingleLoading(true); setSingleError("");
    outputCounter.current += 1;
    const idx = outputCounter.current;
    // Add loading placeholder
    setOutputs(prev => [{ id: idx, index: idx, loading: true, modelId: targetModel, mode }, ...prev]);
    try {
      const { prompt, analysis } = await callAnalyze(singleImg);
      setOutputs(prev => prev.map(o => o.id === idx ? { ...o, loading: false, prompt, analysis } : o));
    } catch (err) {
      setSingleError(err.message);
      setOutputs(prev => prev.filter(o => o.id !== idx));
    } finally { setSingleLoading(false); }
  };

  const removeOutput = id => setOutputs(prev => prev.filter(o => o.id !== id));
  const clearOutputs = () => setOutputs([]);

  const saveOutput = entry => {
    const e = { id: Date.now(), model: MODELS.find(m => m.id === entry.modelId)?.label || entry.modelId, modelId: entry.modelId, mode: entry.mode, prompt: entry.prompt, thumb: singleImg?.dataUrl, provider };
    const u = [e, ...saved]; setSaved(u); localStorage.setItem("skye_saved", JSON.stringify(u));
  };

  const handleBatchFiles = async files => {
    const arr = Array.from(files).slice(0, 10);
    const loaded = await Promise.all(arr.map(readFile));
    setBatchImgs(loaded); setBatchResults([]);
  };

  const runBatch = async () => {
    if (!batchImgs.length) return;
    setBatchLoading(true); setBatchResults([]); setBatchProgress(0);
    const results = [];
    for (let i = 0; i < batchImgs.length; i++) {
      setBatchStatus(`Analyzing ${i+1} of ${batchImgs.length}...`);
      setBatchProgress(Math.round(i / batchImgs.length * 100));
      try {
        const { prompt, analysis } = await callAnalyze(batchImgs[i]);
        results.push({ img: batchImgs[i], prompt, analysis, index: i+1, error: null });
      } catch (err) {
        results.push({ img: batchImgs[i], prompt: null, analysis: null, index: i+1, error: err.message });
      }
      setBatchResults([...results]);
      if (i < batchImgs.length - 1) await new Promise(r => setTimeout(r, 700));
    }
    setBatchProgress(100); setBatchStatus(`Done  ${results.filter(r=>!r.error).length}/${batchImgs.length} succeeded`);
    setBatchLoading(false);
  };

  // Config bar (shown on single + batch tabs)
  const configBar = (
    <div style={{ borderBottom:`1px solid ${C.border}`, padding:"10px 16px", display:"flex", gap:10, flexWrap:"wrap", alignItems:"flex-end", background:C.surface }}>
      <div style={{ minWidth:150, flex:"1 1 150px" }}>
        <span style={S.label}>Provider</span>
        <select value={provider} onChange={e => persistProvider(e.target.value)} style={S.select}>
          {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      <div style={{ minWidth:200, flex:"2 1 200px" }}>
        <span style={S.label}>API Key ({providerInfo.freeCredits})</span>
        <div style={{ display:"flex", gap:6 }}>
          <input type={keyVisible ? "text" : "password"} value={currentKey} onChange={e => persistKeys({ ...apiKeys, [provider]: e.target.value })} placeholder={providerInfo.keyPlaceholder} style={{ ...S.input, flex:1 }} />
          <EyeToggle visible={keyVisible} onToggle={() => setKeyVisible(!keyVisible)}/>
        </div>
      </div>
      <div style={{ minWidth:170, flex:"1 1 170px" }}>
        <span style={S.label}>Analysis Model</span>
        <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={S.select}>
          {(AI_MODELS[provider] || []).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
      <div style={{ flex:"1 1 200px" }}>
        <span style={S.label}>Mode</span>
        <div style={{ display:"flex", gap:6 }}>
          <ModeBtn label="\uD83C\uDFAF Exact Clone" desc="full replication" active={mode==="exact"} onClick={() => setMode("exact")}/>
          <ModeBtn label="\u2728 LoRA Swap" desc={`${loraWord} replaces subject`} active={mode==="lora"} onClick={() => setMode("lora")}/>
        </div>
      </div>
      <div style={{ flex:"2 1 260px" }}>
        <span style={S.label}>Optimize for</span>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {MODELS.map(m => <ModelPill key={m.id} model={m} active={targetModel===m.id} onClick={() => setTargetModel(m.id)}/>)}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'DM Sans',sans-serif" }}>
      {/* HEADER */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,8,8,0.96)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"10px 16px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", gap:10, flexWrap:"wrap" }}>
          <div style={{ flexShrink:0 }}>
            <div style={{ ...S.mono, fontSize:13, fontWeight:700, color:C.accent, letterSpacing:"0.1em" }}>SKYE PROMPT ENGINE</div>
            <div style={{ ...S.mono, fontSize:9, color:C.muted, marginTop:1 }}>AI IMAGE TO PERFECT PROMPT</div>
          </div>
          <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
            {["single","batch","saved","settings"].map(t => (
              <NavTab key={t} label={t==="saved" ? `Saved${saved.length > 0 ? ` (${saved.length})` : ""}` : t} active={tab===t} onClick={() => setTab(t)}/>
            ))}
          </div>
        </div>
      </div>

      {(tab==="single"||tab==="batch") && configBar}

      {/* SINGLE TAB */}
      {tab === "single" && (
        <div style={{ display:"grid", gridTemplateColumns:"minmax(260px,320px) 1fr", maxWidth:1280, margin:"0 auto", padding:"16px", gap:16, alignItems:"start" }}>
          {/* Left panel */}
          <div>
            <div style={S.card}>
              <div style={S.ch}><span>Reference Image</span></div>
              <div style={{ padding:12 }}>
                <DropZone imageData={singleImg}
                  onFile={async f => { const d = await readFile(f); setSingleImg(d); setSingleError(""); }}
                  onClear={() => { setSingleImg(null); setOutputs([]); setSingleError(""); outputCounter.current = 0; }}
                />
              </div>
            </div>

            {mode === "lora" && (
              <div style={S.card}>
                <div style={S.ch}>LoRA Settings</div>
                <div style={{ padding:12 }}>
                  <div style={{ marginBottom:10 }}>
                    <span style={S.label}>Trigger Word</span>
                    <input type="text" value={loraWord} onChange={e => persistLora(e.target.value)} style={S.input}/>
                  </div>
                  <div style={{ background:"#0a1200", border:"1px solid #2a3800", borderRadius:8, padding:"9px 12px", ...S.mono, fontSize:10, color:"#7a9a40", lineHeight:1.8 }}>
                    <strong style={{ color:C.accent }}>{loraWord}</strong> replaces subject only<br/>
                    Scene, lighting, outfit, pose preserved<br/>
                    Drift protection: ON
                  </div>
                </div>
              </div>
            )}

            {/* Active model strip */}
            <div style={{ background:"#090d00", border:"1px solid #1e2800", borderRadius:10, padding:"9px 12px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
              <ModelLogo modelId={activeModel.id} size={20}/>
              <div>
                <div style={{ ...S.mono, fontSize:11, color:activeModel.color }}>{activeModel.label}</div>
                <div style={{ ...S.mono, fontSize:9, color:C.muted, marginTop:1 }}>{activeModel.settings}</div>
              </div>
            </div>

            {/* Analyze button â runs on loaded image each click */}
            <button onClick={runSingle} disabled={!singleImg || singleLoading}
              style={{ width:"100%", padding:13, background: (!singleImg||singleLoading) ? "#1a1a1a" : C.accent, color: (!singleImg||singleLoading) ? C.muted : "#000", border:"none", borderRadius:10, ...S.mono, fontSize:13, fontWeight:700, cursor: singleImg&&!singleLoading ? "pointer" : "not-allowed", letterSpacing:"0.06em", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <SearchIcon color={(!singleImg||singleLoading) ? C.muted : "#000"} size={15}/>
              {singleLoading ? "ANALYZING..." : "ANALYZE AND GENERATE"}
            </button>

            {singleError && (
              <div style={{ marginTop:8, background:"#1a0000", border:"1px solid #440000", borderRadius:8, padding:10, ...S.mono, fontSize:11, color:"#ff6666", lineHeight:1.6 }}>{singleError}</div>
            )}
          </div>

          {/* Right panel â stacked output boxes */}
          <div>
            {outputs.length > 0 && (
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                <span style={{ ...S.mono, fontSize:10, color:C.muted }}>{outputs.length} output{outputs.length!==1?"s":""}</span>
                <button onClick={clearOutputs} style={{ ...S.mono, fontSize:10, color:"#ff6666", background:"none", border:"1px solid #330000", borderRadius:5, padding:"3px 10px", cursor:"pointer" }}>
                  Clear All
                </button>
              </div>
            )}

            {outputs.length === 0 && !singleLoading && (
              <div style={{ textAlign:"center", padding:"80px 20px", color:C.muted }}>
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none" style={{ display:"block", margin:"0 auto 14px" }}>
                  <rect x="4" y="14" width="56" height="40" rx="8" fill="#141414" stroke="#222" strokeWidth="1.5"/>
                  <circle cx="32" cy="34" r="12" fill="#111" stroke="#2a2a2a" strokeWidth="1.5"/>
                  <circle cx="32" cy="34" r="7" fill="#161616" stroke={C.accent} strokeWidth="1.2" opacity="0.35"/>
                  <circle cx="32" cy="34" r="3" fill={C.accent} opacity="0.25"/>
                  <rect x="10" y="7" width="14" height="8" rx="3" fill="#1e1e1e"/>
                  <circle cx="51" cy="19" r="2.5" fill={C.accent} opacity="0.5"/>
                </svg>
                <div style={{ ...S.mono, fontSize:11, color:"#444" }}>Upload a reference image then hit Analyze</div>
                <div style={{ ...S.mono, fontSize:10, color:"#252525", marginTop:8, lineHeight:1.9 }}>
                  Each click generates a new output box<br/>
                  Switch models between runs to compare<br/>
                  Image stays loaded until you remove it
                </div>
              </div>
            )}

            {outputs.map(entry => (
              entry.loading ? (
                <div key={entry.id} style={{ background:"#090d00", border:"1px solid #1e2800", borderRadius:12, padding:16, marginBottom:12, display:"flex", gap:10, alignItems:"center" }}>
                  <ModelLogo modelId={entry.modelId} size={18}/>
                  <div style={{ display:"flex", gap:5 }}>
                    {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.accent, animation:`dot 1.2s ${i*0.2}s infinite` }}/>)}
                  </div>
                  <span style={{ ...S.mono, fontSize:11, color:C.muted }}>Analyzing...</span>
                </div>
              ) : (
                <PromptBox key={entry.id} entry={entry} onRemove={() => removeOutput(entry.id)}/>
              )
            ))}
          </div>
        </div>
      )}

      {/* BATCH TAB */}
      {tab === "batch" && (
        <div style={{ display:"grid", gridTemplateColumns:"minmax(260px,300px) 1fr", maxWidth:1280, margin:"0 auto", padding:16, gap:16, alignItems:"start" }}>
          <div>
            <div style={S.card}>
              <div style={S.ch}>Upload Images (max 10)</div>
              <div style={{ padding:12 }}>
                <div onClick={() => document.getElementById("file-batch")?.click()} onDragOver={e => e.preventDefault()} onDrop={async e => { e.preventDefault(); await handleBatchFiles(e.dataTransfer.files); }}
                  style={{ border:"2px dashed #222", borderRadius:10, background:"#0d0d0d", cursor:"pointer", minHeight:110, display:"flex", alignItems:"center", justifyContent:"center", padding:14, textAlign:"center" }}>
                  <div>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{ display:"block", margin:"0 auto 8px" }}>
                      <rect x="2" y="16" width="32" height="24" rx="5" fill="#111" stroke="#2a2a2a" strokeWidth="1.2"/>
                      <rect x="8" y="10" width="32" height="24" rx="5" fill="#151515" stroke="#242424" strokeWidth="1.2"/>
                      <rect x="14" y="4" width="32" height="24" rx="5" fill="#1a1a1a" stroke="#2e2e2e" strokeWidth="1.2"/>
                      <circle cx="30" cy="16" r="4" fill="#111" stroke={C.accent} strokeWidth="1" opacity="0.4"/>
                      <polyline points="16,25 22,19 27,24 33,17 44,25" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4"/>
                    </svg>
                    <div style={{ ...S.mono, fontSize:11, color:"#555" }}>Drop up to 10 images</div>
                  </div>
                </div>
                <input type="file" id="file-batch" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleBatchFiles(e.target.files)}/>
                {batchImgs.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginTop:10 }}>
                    {batchImgs.map((img, i) => {
                      const res = batchResults[i];
                      return (
                        <div key={i} style={{ position:"relative", borderRadius:6, overflow:"hidden", aspectRatio:"1", border:`1px solid ${C.border}` }}>
                          <img src={img.dataUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                          <div style={{ position:"absolute", top:2, left:2, background:"rgba(0,0,0,0.85)", borderRadius:3, ...S.mono, fontSize:8, color:C.accent, padding:"1px 4px" }}>{i+1}</div>
                          {res && <div style={{ position:"absolute", bottom:3, right:3 }}>{res.error ? <XIcon color="#ff5555" size={11}/> : <CheckIcon color={C.accent} size={11}/>}</div>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div style={{ background:"#090d00", border:"1px solid #1e2800", borderRadius:10, padding:"9px 12px", marginBottom:12, display:"flex", alignItems:"center", gap:10 }}>
              <ModelLogo modelId={activeModel.id} size={20}/>
              <div>
                <div style={{ ...S.mono, fontSize:11, color:activeModel.color }}>{activeModel.label}</div>
                <div style={{ ...S.mono, fontSize:9, color:C.muted, marginTop:1 }}>{activeModel.settings}</div>
              </div>
            </div>
            <button onClick={runBatch} disabled={batchImgs.length===0||batchLoading}
              style={{ width:"100%", padding:13, background: batchImgs.length===0||batchLoading ? "#1a1a1a" : C.accent, color: batchImgs.length===0||batchLoading ? C.muted : "#000", border:"none", borderRadius:10, ...S.mono, fontSize:13, fontWeight:700, cursor: batchImgs.length>0&&!batchLoading ? "pointer" : "not-allowed", letterSpacing:"0.06em", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <SearchIcon color={batchImgs.length===0||batchLoading ? C.muted : "#000"} size={15}/>
              {batchLoading ? batchStatus : `ANALYZE ALL (${batchImgs.length})`}
            </button>
            {batchLoading && <div style={{ marginTop:8, height:4, background:"#111", borderRadius:4, overflow:"hidden" }}><div style={{ height:"100%", background:C.accent, borderRadius:4, width:`${batchProgress}%`, transition:"width 0.3s" }}/></div>}
            {!batchLoading && batchStatus && <div style={{ marginTop:8, ...S.mono, fontSize:10, color:C.accent, textAlign:"center" }}>{batchStatus}</div>}
          </div>
          <div>
            {batchResults.length === 0 && !batchLoading && (
              <div style={{ textAlign:"center", padding:"80px 20px", color:C.muted }}>
                <div style={{ ...S.mono, fontSize:12, color:"#444" }}>Upload images then Analyze All</div>
                <div style={{ ...S.mono, fontSize:10, color:"#252525", marginTop:8, lineHeight:1.8 }}>One prompt per image, same model, copy on each</div>
              </div>
            )}
            {batchResults.map(item => (
              <div key={item.index} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ ...S.mono, fontSize:11, color:"#000", background: item.error ? "#ff5555" : C.accent, padding:"3px 10px", borderRadius:5, fontWeight:700 }}>IMAGE {item.index}</span>
                  <img src={item.img.dataUrl} alt="" style={{ width:32, height:32, objectFit:"cover", borderRadius:5, border:`1px solid ${C.border}` }}/>
                </div>
                {item.error ? (
                  <div style={{ background:"#1a0000", border:"1px solid #440000", borderRadius:8, padding:10, ...S.mono, fontSize:11, color:"#ff6666" }}>{item.error}</div>
                ) : (
                  <PromptBox entry={{ ...item, id: item.index, modelId: targetModel, mode }} onRemove={() => {}}/>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SAVED TAB */}
      {tab === "saved" && (
        <div style={{ maxWidth:820, margin:"0 auto", padding:20 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ ...S.mono, fontSize:11, color:C.muted, textTransform:"uppercase" }}>{saved.length} saved</span>
            {saved.length > 0 && <button onClick={() => { if (confirm("Clear all?")) { setSaved([]); localStorage.removeItem("skye_saved"); }}} style={{ ...S.mono, fontSize:10, color:C.muted, background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"4px 10px", cursor:"pointer" }}>Clear All</button>}
          </div>
          {saved.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", ...S.mono, fontSize:12, color:"#333" }}>No saved prompts yet.</div>
          ) : saved.map(p => {
            const m = MODELS.find(x => x.label === p.model);
            return (
              <div key={p.id} style={{ ...S.card, display:"flex", gap:12, padding:14, marginBottom:10 }}>
                {p.thumb && <img src={p.thumb} alt="" style={{ width:56, height:56, objectFit:"cover", borderRadius:7, flexShrink:0, border:`1px solid ${C.border}` }}/>}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
                    {p.modelId && <ModelLogo modelId={p.modelId} size={16}/>}
                    <span style={{ ...S.mono, fontSize:9, color: m?.color||"#fff", border:"1px solid currentColor", padding:"1px 6px", borderRadius:3 }}>{p.model}</span>
                    <span style={{ ...S.mono, fontSize:9, color: p.mode==="lora" ? C.accent : "#47b8ff", border:"1px solid currentColor", padding:"1px 6px", borderRadius:3 }}>{p.mode?.toUpperCase()}</span>
                    <button onClick={() => { const u = saved.filter(x => x.id !== p.id); setSaved(u); localStorage.setItem("skye_saved", JSON.stringify(u)); }} style={{ marginLeft:"auto", background:"none", border:"none", color:"#444", cursor:"pointer", display:"flex", alignItems:"center" }}>
                      <XIcon color="#444" size={13}/>
                    </button>
                  </div>
                  <div style={{ ...S.mono, fontSize:11, color:"#777", lineHeight:1.6, marginBottom:8 }}>{p.prompt?.slice(0,200)}...</div>
                  <CopyBtn text={p.prompt} small/>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SETTINGS TAB */}
      {tab === "settings" && (
        <div style={{ maxWidth:620, margin:"0 auto", padding:20 }}>
          <div style={S.card}>
            <div style={{ ...S.ch }}><span>API Keys</span><EyeToggle visible={keyVisible} onToggle={() => setKeyVisible(!keyVisible)}/></div>
            <div style={{ padding:14 }}>
              {PROVIDERS.map(p => (
                <div key={p.id} style={{ marginBottom:16 }}>
                  <span style={S.label}>{p.label} - {p.freeCredits}</span>
                  <div style={{ display:"flex", gap:6 }}>
                    <input type={keyVisible ? "text" : "password"} value={apiKeys[p.id]||""} onChange={e => persistKeys({ ...apiKeys, [p.id]: e.target.value })} placeholder={p.keyPlaceholder} style={{ ...S.input, flex:1 }}/>
                    <a href={p.keyLink} target="_blank" rel="noopener noreferrer" style={{ padding:"0 12px", borderRadius:7, background:"#111", border:`1px solid ${C.border}`, color:C.muted, fontSize:10, display:"flex", alignItems:"center", gap:4, textDecoration:"none", ...S.mono, whiteSpace:"nowrap" }}>
                      Get Key <ChevRight color={C.muted} size={10}/>
                    </a>
                  </div>
                </div>
              ))}
              <div style={{ ...S.mono, fontSize:10, color:"#2a2a2a" }}>Keys stored in browser only</div>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.ch}>LoRA Settings</div>
            <div style={{ padding:14 }}>
              <span style={S.label}>Default Trigger Word</span>
              <input type="text" value={loraWord} onChange={e => persistLora(e.target.value)} placeholder="skyeewmn" style={S.input}/>
            </div>
          </div>

          <div style={S.card}>
            <div style={S.ch}>Model Reference</div>
            <div style={{ padding:14, display:"flex", flexDirection:"column", gap:8 }}>
              {MODELS.map(m => (
                <div key={m.id} style={{ display:"flex", gap:12, alignItems:"center", background:"#0d0d0d", borderRadius:8, padding:"9px 12px", border:`1px solid ${C.border}` }}>
                  <ModelLogo modelId={m.id} size={22}/>
                  <div>
                    <div style={{ ...S.mono, fontSize:11, color:m.color }}>{m.label}</div>
                    <div style={{ ...S.mono, fontSize:9, color:C.muted, marginTop:2 }}>{m.settings}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={S.card}>
            <div style={S.ch}>Provider Guide</div>
            <div style={{ padding:14, ...S.mono, fontSize:11, color:C.sub, lineHeight:1.9 }}>
              <strong style={{ color:"#b8ff47" }}>Anthropic Claude</strong> - Best scene analysis accuracy. console.anthropic.com<br/>
              <strong style={{ color:"#47b8ff" }}>OpenAI GPT-4o</strong> - Strong vision understanding. platform.openai.com<br/>
              <strong style={{ color:"#ffaa47" }}>Google Gemini Flash</strong> - Free tier available. Use for batch to save Claude credits. aistudio.google.com
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes dot{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}
