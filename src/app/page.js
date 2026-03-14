"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { MODELS, AI_MODELS, PROVIDERS, LORA_TRIGGER } from "@/lib/prompts";

const C = {
  bg: "#080808", surface: "#0f0f0f", card: "#121212", border: "#1c1c1c",
  accent: "#b8ff47", accentDim: "rgba(184,255,71,0.08)",
  text: "#e0e0e0", muted: "#555", sub: "#888",
};

const base = {
  input: { width:"100%", background:"#0a0a0a", border:`1px solid ${C.border}`, color:C.text, padding:"9px 12px", borderRadius:8, fontFamily:"'Space Mono',monospace", fontSize:12, outline:"none", boxSizing:"border-box" },
  select: { width:"100%", background:"#0a0a0a", border:`1px solid ${C.border}`, color:C.text, padding:"9px 12px", borderRadius:8, fontFamily:"'Space Mono',monospace", fontSize:12, outline:"none", cursor:"pointer" },
  card: { background:C.card, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:12 },
  cardHead: { padding:"10px 14px", borderBottom:`1px solid ${C.border}`, fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.1em", display:"flex", justifyContent:"space-between", alignItems:"center" },
  label: { display:"block", fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:5 },
};

// âââ SVG ICONS â no emoji, renders correctly on all mobile browsers âââââââââââ
const Icon = {
  Eye: ({ color = C.muted, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  EyeOff: ({ color = C.muted, size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  Upload: ({ color = "#555", size = 24 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/>
      <line x1="12" y1="12" x2="12" y2="21"/>
      <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  Folder: ({ color = "#555", size = 20 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  Image: ({ color = "#444", size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  ),
  Box: ({ color = "#444", size = 40 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="21 8 21 21 3 21 3 8"/>
      <rect x="1" y="3" width="22" height="5"/>
      <line x1="10" y1="12" x2="14" y2="12"/>
    </svg>
  ),
  Search: ({ color = "#000", size = 16 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  ),
  Refresh: ({ color = "#aaa", size = 13 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10"/>
      <path d="M3.51 15a9 9 0 1 0 .49-3.5"/>
    </svg>
  ),
  Copy: ({ color = "#000", size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
    </svg>
  ),
  Check: ({ color = C.accent, size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  X: ({ color = "#555", size = 14 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  ),
  ChevronRight: ({ color = C.muted, size = 12 }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
  Dot: ({ color = C.accent }) => (
    <svg width="8" height="8" viewBox="0 0 8 8"><circle cx="4" cy="4" r="4" fill={color}/></svg>
  ),
};

function Field({ label, children, mb }) {
  return <div style={{ marginBottom: mb ?? 14 }}><span style={base.label}>{label}</span>{children}</div>;
}

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"5px 14px", borderRadius:6, fontFamily:"'Space Mono',monospace", fontSize:10, textTransform:"uppercase", letterSpacing:"0.06em", border:`1px solid ${active ? C.accent : C.border}`, background: active ? C.accent : "transparent", color: active ? "#000" : C.muted, cursor:"pointer", transition:"all 0.12s" }}>
      {label}
    </button>
  );
}

function ModeBtn({ label, desc, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"10px 12px", borderRadius:9, textAlign:"left", border:`1px solid ${active ? C.accent : C.border}`, background: active ? C.accentDim : "#0d0d0d", cursor:"pointer", flex:1, transition:"all 0.12s" }}>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color: active ? C.accent : C.sub }}>{label}</div>
      <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted, marginTop:2 }}>{desc}</div>
    </button>
  );
}

function ModelPill({ model, active, onClick }) {
  return (
    <button onClick={onClick} style={{ padding:"7px 14px", borderRadius:999, border:`1px solid ${active ? model.color : C.border}`, background: active ? `${model.color}18` : "transparent", color: active ? model.color : C.muted, fontFamily:"'Space Mono',monospace", fontSize:11, cursor:"pointer", transition:"all 0.12s", whiteSpace:"nowrap" }}>
      {model.label}
    </button>
  );
}

// Eye toggle button â green when visible, grey when hidden
function EyeToggle({ visible, onToggle, small }) {
  const sz = small ? 13 : 15;
  return (
    <button
      onClick={onToggle}
      title={visible ? "Hide key" : "Show key"}
      style={{
        padding: small ? "0 8px" : "0 11px",
        borderRadius:7,
        background: visible ? "rgba(184,255,71,0.08)" : "#0d0d0d",
        border: `1px solid ${visible ? C.accent : C.border}`,
        cursor:"pointer",
        display:"flex", alignItems:"center", justifyContent:"center",
        transition:"all 0.15s",
        height: small ? 32 : 36,
        minWidth: small ? 32 : 36,
      }}
    >
      {visible
        ? <Icon.Eye color={C.accent} size={sz} />
        : <Icon.EyeOff color={C.muted} size={sz} />
      }
    </button>
  );
}

function CopyBtn({ text, small, label }) {
  const [done, setDone] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }); };
  return (
    <button onClick={copy} style={{ padding: small ? "5px 11px" : "9px 18px", borderRadius:7, background: done ? C.accentDim : C.accent, color: done ? C.accent : "#000", border: done ? `1px solid ${C.accent}` : "none", fontFamily:"'Space Mono',monospace", fontSize: small ? 10 : 12, fontWeight:700, cursor:"pointer", transition:"all 0.12s", display:"flex", alignItems:"center", gap:5 }}>
      {done ? <><Icon.Check color={C.accent} size={12}/> COPIED</> : <><Icon.Copy color={small ? C.accent : "#000"} size={12}/> {label || "COPY PROMPT"}</>}
    </button>
  );
}

function DropZone({ imageData, onFile, onClear }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();
  const handleDrop = (e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) onFile(f); };
  return (
    <div>
      <div onClick={() => ref.current?.click()} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={handleDrop}
        style={{ border:`2px dashed ${drag ? C.accent : imageData ? "#2a3800" : C.border}`, borderRadius:12, background: drag ? C.accentDim : imageData ? "#0a1200" : "#0d0d0d", cursor:"pointer", transition:"all 0.15s", overflow:"hidden", minHeight: imageData ? "auto" : 120, display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
        {imageData ? (
          <>
            <img src={imageData.dataUrl} alt="" style={{ width:"100%", display:"block", maxHeight:220, objectFit:"cover", borderRadius:10 }} />
            <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.85)", borderRadius:5, padding:"2px 8px", fontFamily:"'Space Mono',monospace", fontSize:10, color:C.accent, display:"flex", alignItems:"center", gap:4 }}>
              <Icon.Check color={C.accent} size={10}/> LOADED
            </div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"20px 16px" }}>
            <div style={{ display:"flex", justifyContent:"center", marginBottom:8 }}><Icon.Upload color="#444" size={28}/></div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#555" }}>Drop image or tap to upload</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, marginTop:3 }}>JPG Â· PNG Â· WEBP</div>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {imageData && (
        <button onClick={onClear} style={{ marginTop:6, background:"none", border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, padding:"3px 10px", fontFamily:"'Space Mono',monospace", fontSize:10, cursor:"pointer", display:"inline-flex", alignItems:"center", gap:5 }}>
          <Icon.X color={C.muted} size={11}/> Remove image
        </button>
      )}
    </div>
  );
}

function PromptOutput({ promptText, model, onSave, onRegenerate, loading }) {
  const [saveFlash, setSaveFlash] = useState(false);
  const wordCount = promptText ? promptText.trim().split(/\s+/).filter(Boolean).length : 0;
  const wOk = wordCount >= 80 && wordCount <= 250;

  const handleSave = () => { onSave(); setSaveFlash(true); setTimeout(() => setSaveFlash(false), 2000); };

  if (!promptText && !loading) return null;

  return (
    <div style={{ ...base.card, border:`1px solid #1e2800` }}>
      <div style={{ ...base.cardHead, background:"#090d00", borderColor:"#1e2800" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <Icon.Dot color={model.color}/>
          <span style={{ color:model.color, fontFamily:"'Space Mono',monospace", fontSize:10 }}>{model.label}</span>
          {wordCount > 0 && (
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: wOk ? C.accent : "#ff8844", border:"1px solid currentColor", padding:"1px 6px", borderRadius:3 }}>
              {wordCount}w {wOk ? "OK" : wordCount < 80 ? "SHORT" : "LONG"}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onRegenerate} disabled={loading} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color: loading ? C.muted : "#aaa", background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"4px 10px", cursor: loading ? "not-allowed" : "pointer", display:"inline-flex", alignItems:"center", gap:5 }}>
            <Icon.Refresh color={loading ? C.muted : "#aaa"} size={11}/> {loading ? "..." : "REGEN"}
          </button>
          <button onClick={handleSave} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color: saveFlash ? C.accent : C.muted, background: saveFlash ? C.accentDim : "none", border:`1px solid ${saveFlash ? C.accent : C.border}`, borderRadius:5, padding:"4px 10px", cursor:"pointer", transition:"all 0.2s", display:"inline-flex", alignItems:"center", gap:5 }}>
            {saveFlash ? <><Icon.Check color={C.accent} size={11}/> SAVED</> : "SAVE"}
          </button>
        </div>
      </div>

      <div style={{ padding:16, fontFamily:"'Space Mono',monospace", fontSize:12.5, lineHeight:1.9, color:"#ccc", whiteSpace:"pre-wrap", wordBreak:"break-word", background:"#090d00", borderBottom:`1px solid #1e2800`, minHeight:60 }}>
        {loading ? (
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            <div style={{ display:"flex", gap:5 }}>
              {[0,1,2].map(i => <div key={i} style={{ width:6, height:6, borderRadius:"50%", background:C.accent, animation:`dot 1.2s ${i*0.2}s infinite` }} />)}
            </div>
            <span style={{ fontSize:11, color:C.muted }}>Analyzing image...</span>
          </div>
        ) : promptText}
      </div>

      <div style={{ padding:"10px 16px", background:"#090d00", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted }}>{model.settings}</span>
        {promptText && <CopyBtn text={promptText} />}
      </div>

      <style>{`@keyframes dot{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res({ base64: e.target.result.split(",")[1], mediaType: file.type, dataUrl: e.target.result, name: file.name });
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

export default function Home() {
  const [tab, setTab] = useState("single");
  const [provider, setProvider] = useState("anthropic");
  const [apiKeys, setApiKeys] = useState({ anthropic:"", openai:"", gemini:"" });
  const [keyVisible, setKeyVisible] = useState(false);
  const [aiModel, setAiModel] = useState("claude-sonnet-4-20250514");
  const [targetModel, setTargetModel] = useState("zimage_turbo");
  const [mode, setMode] = useState("exact");
  const [loraWord, setLoraWord] = useState(LORA_TRIGGER);

  const [singleImg, setSingleImg] = useState(null);
  const [singlePrompt, setSinglePrompt] = useState("");
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState("");

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
      if (keys.anthropic || keys.openai || keys.gemini) setApiKeys(prev => ({ ...prev, ...keys }));
      setLoraWord(lora);
      setProvider(prov);
      setSaved(sv);
      const models = AI_MODELS[prov];
      if (models) setAiModel(models[0].id);
    } catch {}
  }, []);

  const persistKeys = (updated) => { setApiKeys(updated); localStorage.setItem("skye_keys", JSON.stringify(updated)); };
  const persistLora = (l) => { setLoraWord(l); localStorage.setItem("skye_lora", l); };
  const persistProvider = (p) => {
    setProvider(p); localStorage.setItem("skye_provider", p);
    const models = AI_MODELS[p];
    if (models) setAiModel(models[0].id);
  };

  const activeModel = MODELS.find(m => m.id === targetModel) || MODELS[0];
  const currentKey = apiKeys[provider] || "";
  const providerInfo = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  const callAnalyze = useCallback(async (imgData) => {
    if (!currentKey.trim()) throw new Error("Enter your API key for the selected provider.");
    const res = await fetch("/api/analyze", {
      method:"POST", headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ imageBase64: imgData.base64, mediaType: imgData.mediaType, mode, modelId: targetModel, loraWord, apiKey: currentKey.trim(), aiModel, provider }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
    return data.result?.prompt || data.result || "";
  }, [currentKey, mode, targetModel, loraWord, aiModel, provider]);

  const runSingle = async () => {
    if (!singleImg) return;
    setSingleLoading(true); setSingleError(""); setSinglePrompt("");
    try { const p = await callAnalyze(singleImg); setSinglePrompt(typeof p === "string" ? p : JSON.stringify(p, null, 2)); }
    catch (err) { setSingleError(err.message); }
    finally { setSingleLoading(false); }
  };

  const saveSingle = () => {
    if (!singlePrompt) return;
    const entry = { id: Date.now(), model: activeModel.label, mode, prompt: singlePrompt, thumb: singleImg?.dataUrl, provider };
    const updated = [entry, ...saved];
    setSaved(updated); localStorage.setItem("skye_saved", JSON.stringify(updated));
  };

  const handleBatchFiles = async (files) => {
    const arr = Array.from(files).slice(0, 10);
    const loaded = await Promise.all(arr.map(readFile));
    setBatchImgs(loaded); setBatchResults([]);
  };

  const runBatch = async () => {
    if (batchImgs.length === 0) return;
    setBatchLoading(true); setBatchResults([]); setBatchProgress(0);
    const results = [];
    for (let i = 0; i < batchImgs.length; i++) {
      setBatchStatus(`Analyzing ${i + 1} of ${batchImgs.length}...`);
      setBatchProgress(Math.round((i / batchImgs.length) * 100));
      try {
        const p = await callAnalyze(batchImgs[i]);
        results.push({ img: batchImgs[i], prompt: typeof p === "string" ? p : JSON.stringify(p, null, 2), index: i + 1, error: null });
      } catch (err) {
        results.push({ img: batchImgs[i], prompt: null, index: i + 1, error: err.message });
      }
      setBatchResults([...results]);
      if (i < batchImgs.length - 1) await new Promise(r => setTimeout(r, 700));
    }
    setBatchProgress(100); setBatchStatus(`Done â ${results.filter(r => !r.error).length}/${batchImgs.length} succeeded`);
    setBatchLoading(false);
  };

  const saveBatch = (item) => {
    const entry = { id: Date.now(), model: activeModel.label, mode, prompt: item.prompt, thumb: item.img?.dataUrl, provider };
    const updated = [entry, ...saved];
    setSaved(updated); localStorage.setItem("skye_saved", JSON.stringify(updated));
  };

  // âââ CONFIG BAR âââââââââââââââââââââââââââââââââââââââââââââââââââââââââââ
  const configBar = (
    <div style={{ borderBottom:`1px solid ${C.border}`, padding:"12px 20px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end", background:C.surface }}>
      <div style={{ flex:"0 0 180px" }}>
        <span style={base.label}>AI Provider</span>
        <select value={provider} onChange={e => persistProvider(e.target.value)} style={base.select}>
          {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>

      <div style={{ flex:"0 0 240px" }}>
        <span style={base.label}>API Key ({providerInfo.freeCredits})</span>
        <div style={{ display:"flex", gap:6 }}>
          <input type={keyVisible ? "text" : "password"} value={currentKey} onChange={e => persistKeys({ ...apiKeys, [provider]: e.target.value })} placeholder={providerInfo.keyPlaceholder} style={{ ...base.input, flex:1 }} />
          <EyeToggle visible={keyVisible} onToggle={() => setKeyVisible(!keyVisible)} />
        </div>
      </div>

      <div style={{ flex:"0 0 200px" }}>
        <span style={base.label}>Analysis Model</span>
        <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={base.select}>
          {(AI_MODELS[provider] || []).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>

      <div>
        <span style={base.label}>Mode</span>
        <div style={{ display:"flex", gap:6 }}>
          <ModeBtn label="Exact Clone" desc="full replication" active={mode === "exact"} onClick={() => setMode("exact")} />
          <ModeBtn label="LoRA Swap" desc={`${loraWord} Â· scene preserved`} active={mode === "lora"} onClick={() => setMode("lora")} />
        </div>
      </div>

      <div style={{ flex:1, minWidth:280 }}>
        <span style={base.label}>Optimize prompt for</span>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {MODELS.map(m => <ModelPill key={m.id} model={m} active={targetModel === m.id} onClick={() => setTargetModel(m.id)} />)}
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ background:C.bg, minHeight:"100vh", color:C.text, fontFamily:"'DM Sans',sans-serif" }}>
      {/* HEADER */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:"rgba(8,8,8,0.96)", backdropFilter:"blur(12px)", borderBottom:`1px solid ${C.border}`, padding:"12px 20px", display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>
        <div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700, color:C.accent, letterSpacing:"0.1em" }}>SKYE PROMPT ENGINE</div>
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted, marginTop:1, letterSpacing:"0.04em" }}>AI-POWERED Â· IMAGE TO PERFECT PROMPT Â· LORA READY</div>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {["single","batch","saved","settings"].map(t => (
            <NavTab key={t} label={t === "saved" ? `Saved${saved.length > 0 ? ` (${saved.length})` : ""}` : t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>
      </div>

      {(tab === "single" || tab === "batch") && configBar}

      {/* âââ SINGLE âââ */}
      {tab === "single" && (
        <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", maxWidth:1280, margin:"0 auto", padding:20, gap:20 }}>
          <div>
            <div style={base.card}>
              <div style={base.cardHead}><span>Reference Image</span></div>
              <div style={{ padding:14 }}>
                <DropZone imageData={singleImg}
                  onFile={async f => { const d = await readFile(f); setSingleImg(d); setSinglePrompt(""); setSingleError(""); }}
                  onClear={() => { setSingleImg(null); setSinglePrompt(""); setSingleError(""); }}
                />
              </div>
            </div>

            {mode === "lora" && (
              <div style={base.card}>
                <div style={base.cardHead}>LoRA Settings</div>
                <div style={{ padding:14 }}>
                  <Field label="Trigger Word">
                    <input type="text" value={loraWord} onChange={e => persistLora(e.target.value)} style={base.input} />
                  </Field>
                  <div style={{ background:"#0a1200", border:"1px solid #2a3800", borderRadius:8, padding:"10px 12px", fontFamily:"'Space Mono',monospace", fontSize:11, color:"#88aa44", lineHeight:1.8 }}>
                    <strong style={{ color:C.accent }}>{loraWord}</strong> replaces subject<br/>
                    Scene Â· lighting Â· outfit Â· pose preserved<br/>
                    Drift protection: ON
                  </div>
                </div>
              </div>
            )}

            <div style={{ background:"#090d00", border:"1px solid #1e2800", borderRadius:10, padding:"11px 14px", fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, lineHeight:1.8, marginBottom:12, display:"flex", alignItems:"flex-start", gap:8 }}>
              <Icon.Dot color={activeModel.color}/>
              <div><span style={{ color:activeModel.color }}>{activeModel.label}</span><br/>{activeModel.settings}</div>
            </div>

            <button onClick={runSingle} disabled={!singleImg || singleLoading}
              style={{ width:"100%", padding:14, background: (!singleImg || singleLoading) ? "#1a1a1a" : C.accent, color: (!singleImg || singleLoading) ? C.muted : "#000", border:"none", borderRadius:10, fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700, cursor: singleImg && !singleLoading ? "pointer" : "not-allowed", letterSpacing:"0.06em", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Icon.Search color={(!singleImg || singleLoading) ? C.muted : "#000"} size={15}/>
              {singleLoading ? "ANALYZING..." : "ANALYZE & GENERATE"}
            </button>

            {singleError && (
              <div style={{ marginTop:8, background:"#1a0000", border:"1px solid #440000", borderRadius:8, padding:12, fontFamily:"'Space Mono',monospace", fontSize:11, color:"#ff6666", lineHeight:1.6 }}>
                {singleError}
              </div>
            )}
          </div>

          <div>
            {!singleLoading && !singlePrompt && !singleError && (
              <div style={{ textAlign:"center", padding:"80px 20px", color:C.muted }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><Icon.Image color="#333" size={44}/></div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12 }}>Upload a reference then hit Analyze</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#2a2a2a", marginTop:8, lineHeight:1.8 }}>
                  Full forensic scene analysis â lighting geometry, pose<br/>components, environment objects, photography style
                </div>
              </div>
            )}
            {(singleLoading || singlePrompt) && (
              <PromptOutput promptText={singlePrompt} model={activeModel} loading={singleLoading} onSave={saveSingle} onRegenerate={runSingle} />
            )}
          </div>
        </div>
      )}

      {/* âââ BATCH âââ */}
      {tab === "batch" && (
        <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", maxWidth:1280, margin:"0 auto", padding:20, gap:20 }}>
          <div>
            <div style={base.card}>
              <div style={base.cardHead}>Upload Images (max 10)</div>
              <div style={{ padding:14 }}>
                <div onClick={() => document.getElementById("file-batch")?.click()} onDragOver={e => e.preventDefault()} onDrop={async e => { e.preventDefault(); await handleBatchFiles(e.dataTransfer.files); }}
                  style={{ border:`2px dashed ${C.border}`, borderRadius:10, background:"#0d0d0d", cursor:"pointer", minHeight:90, display:"flex", alignItems:"center", justifyContent:"center", padding:14, textAlign:"center" }}>
                  <div>
                    <div style={{ display:"flex", justifyContent:"center", marginBottom:5 }}><Icon.Folder color="#444" size={22}/></div>
                    <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#555" }}>Drop up to 10 images</div>
                  </div>
                </div>
                <input type="file" id="file-batch" accept="image/*" multiple style={{ display:"none" }} onChange={e => handleBatchFiles(e.target.files)} />

                {batchImgs.length > 0 && (
                  <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:5, marginTop:10 }}>
                    {batchImgs.map((img, i) => {
                      const res = batchResults[i];
                      return (
                        <div key={i} style={{ position:"relative", borderRadius:6, overflow:"hidden", aspectRatio:"1", border:`1px solid ${C.border}` }}>
                          <img src={img.dataUrl} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                          <div style={{ position:"absolute", top:2, left:2, background:"rgba(0,0,0,0.85)", borderRadius:3, fontFamily:"'Space Mono',monospace", fontSize:8, color:C.accent, padding:"1px 4px" }}>{i+1}</div>
                          {res && (
                            <div style={{ position:"absolute", bottom:3, right:3 }}>
                              {res.error ? <Icon.X color="#ff5555" size={12}/> : <Icon.Check color={C.accent} size={12}/>}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button onClick={runBatch} disabled={batchImgs.length === 0 || batchLoading}
              style={{ width:"100%", padding:14, background: batchImgs.length === 0 || batchLoading ? "#1a1a1a" : C.accent, color: batchImgs.length === 0 || batchLoading ? C.muted : "#000", border:"none", borderRadius:10, fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700, cursor: batchImgs.length > 0 && !batchLoading ? "pointer" : "not-allowed", letterSpacing:"0.06em", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              <Icon.Search color={batchImgs.length === 0 || batchLoading ? C.muted : "#000"} size={15}/>
              {batchLoading ? batchStatus : `ANALYZE ALL (${batchImgs.length})`}
            </button>

            {batchLoading && (
              <div style={{ marginTop:8, height:4, background:"#111", borderRadius:4, overflow:"hidden" }}>
                <div style={{ height:"100%", background:C.accent, borderRadius:4, width:`${batchProgress}%`, transition:"width 0.3s" }} />
              </div>
            )}
            {!batchLoading && batchStatus && (
              <div style={{ marginTop:8, fontFamily:"'Space Mono',monospace", fontSize:10, color:C.accent, textAlign:"center" }}>{batchStatus}</div>
            )}
          </div>

          <div>
            {batchResults.length === 0 && !batchLoading && (
              <div style={{ textAlign:"center", padding:"80px 20px", color:C.muted }}>
                <div style={{ display:"flex", justifyContent:"center", marginBottom:12 }}><Icon.Box color="#333" size={44}/></div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12 }}>Upload images then Analyze All</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#2a2a2a", marginTop:8, lineHeight:1.8 }}>One prompt per image Â· Same model Â· Copy on each</div>
              </div>
            )}
            {batchResults.map(item => (
              <div key={item.index} style={{ marginBottom:20 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
                  <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#000", background: item.error ? "#ff5555" : C.accent, padding:"3px 10px", borderRadius:5, fontWeight:700 }}>IMAGE {item.index}</span>
                  <img src={item.img.dataUrl} alt="" style={{ width:36, height:36, objectFit:"cover", borderRadius:5, border:`1px solid ${C.border}` }} />
                </div>
                {item.error ? (
                  <div style={{ background:"#1a0000", border:"1px solid #440000", borderRadius:8, padding:12, fontFamily:"'Space Mono',monospace", fontSize:11, color:"#ff6666" }}>{item.error}</div>
                ) : (
                  <div style={{ ...base.card, border:"1px solid #1e2800" }}>
                    <div style={{ padding:16, fontFamily:"'Space Mono',monospace", fontSize:12, lineHeight:1.9, color:"#ccc", whiteSpace:"pre-wrap", background:"#090d00", borderBottom:"1px solid #1e2800" }}>{item.prompt}</div>
                    <div style={{ padding:"10px 16px", background:"#090d00", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                      <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted }}>{activeModel.settings}</span>
                      <div style={{ display:"flex", gap:6 }}>
                        <CopyBtn text={item.prompt} small label="COPY" />
                        <button onClick={() => saveBatch(item)} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"4px 10px", cursor:"pointer" }}>SAVE</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* âââ SAVED âââ */}
      {tab === "saved" && (
        <div style={{ maxWidth:820, margin:"0 auto", padding:24 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:C.muted, textTransform:"uppercase" }}>{saved.length} saved prompt{saved.length !== 1 ? "s" : ""}</span>
            {saved.length > 0 && (
              <button onClick={() => { if (confirm("Clear all saved prompts?")) { setSaved([]); localStorage.removeItem("skye_saved"); }}}
                style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"4px 10px", cursor:"pointer" }}>
                Clear All
              </button>
            )}
          </div>
          {saved.length === 0 ? (
            <div style={{ textAlign:"center", padding:"60px 20px", color:"#333", fontFamily:"'Space Mono',monospace", fontSize:12 }}>No saved prompts yet.</div>
          ) : saved.map(p => {
            const m = MODELS.find(x => x.label === p.model);
            return (
              <div key={p.id} style={{ ...base.card, display:"flex", gap:14, padding:16, marginBottom:10 }}>
                {p.thumb && <img src={p.thumb} alt="" style={{ width:60, height:60, objectFit:"cover", borderRadius:7, flexShrink:0, border:`1px solid ${C.border}` }} />}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:"flex", gap:6, marginBottom:8, flexWrap:"wrap", alignItems:"center" }}>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: m?.color || "#fff", border:"1px solid currentColor", padding:"1px 7px", borderRadius:3 }}>{p.model}</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: p.mode === "lora" ? C.accent : "#47b8ff", border:"1px solid currentColor", padding:"1px 7px", borderRadius:3 }}>{p.mode?.toUpperCase()}</span>
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#444", border:`1px solid #222`, padding:"1px 7px", borderRadius:3 }}>{p.provider || "claude"}</span>
                    <button onClick={() => { const u = saved.filter(x => x.id !== p.id); setSaved(u); localStorage.setItem("skye_saved", JSON.stringify(u)); }}
                      style={{ marginLeft:"auto", background:"none", border:"none", color:"#444", cursor:"pointer", display:"flex", alignItems:"center" }}>
                      <Icon.X color="#444" size={14}/>
                    </button>
                  </div>
                  <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#777", lineHeight:1.6, marginBottom:10 }}>{p.prompt?.slice(0, 220)}...</div>
                  <CopyBtn text={p.prompt} small label="COPY FULL PROMPT" />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* âââ SETTINGS âââ */}
      {tab === "settings" && (
        <div style={{ maxWidth:620, margin:"0 auto", padding:24 }}>
          <div style={base.card}>
            <div style={base.cardHead}>
              <span>API Keys</span>
              <EyeToggle visible={keyVisible} onToggle={() => setKeyVisible(!keyVisible)} small />
            </div>
            <div style={{ padding:16 }}>
              {PROVIDERS.map(p => (
                <div key={p.id} style={{ marginBottom:16 }}>
                  <Field label={`${p.label} â ${p.freeCredits}`}>
                    <div style={{ display:"flex", gap:6 }}>
                      <input type={keyVisible ? "text" : "password"} value={apiKeys[p.id] || ""} onChange={e => persistKeys({ ...apiKeys, [p.id]: e.target.value })} placeholder={p.keyPlaceholder} style={{ ...base.input, flex:1 }} />
                      <a href={p.keyLink} target="_blank" rel="noopener noreferrer"
                        style={{ padding:"0 10px", borderRadius:7, background:"#111", border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer", fontSize:10, display:"flex", alignItems:"center", textDecoration:"none", whiteSpace:"nowrap", fontFamily:"'Space Mono',monospace" }}>
                        Get Key <Icon.ChevronRight color={C.muted} size={10}/>
                      </a>
                    </div>
                  </Field>
                </div>
              ))}
              <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#333", marginTop:4 }}>Keys stored in browser only â never sent anywhere except the provider API</div>
            </div>
          </div>

          <div style={base.card}>
            <div style={base.cardHead}>LoRA Settings</div>
            <div style={{ padding:16 }}>
              <Field label="Default LoRA Trigger Word">
                <input type="text" value={loraWord} onChange={e => persistLora(e.target.value)} placeholder="skyeewmn" style={base.input} />
              </Field>
            </div>
          </div>

          <div style={base.card}>
            <div style={base.cardHead}>Provider Guide</div>
            <div style={{ padding:16, fontFamily:"'Space Mono',monospace", fontSize:11, color:C.sub, lineHeight:2 }}>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}><Icon.Dot color="#b8ff47"/><div><strong style={{ color:C.text }}>Anthropic (Claude)</strong> â console.anthropic.com Â· $5 free on signup Â· Best scene analysis</div></div>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}><Icon.Dot color="#47b8ff"/><div><strong style={{ color:C.text }}>OpenAI (GPT-4o)</strong> â platform.openai.com Â· $5 free trial Â· Strong vision</div></div>
              <div style={{ display:"flex", gap:8, alignItems:"flex-start", marginBottom:8 }}><Icon.Dot color="#ffaa47"/><div><strong style={{ color:C.text }}>Google (Gemini Flash)</strong> â aistudio.google.com Â· Free tier Â· Use for batch to save Claude credits</div></div>
            </div>
          </div>

          <div style={base.card}>
            <div style={base.cardHead}>Deploy</div>
            <div style={{ padding:16, fontFamily:"'Space Mono',monospace", fontSize:11, color:C.sub, lineHeight:2 }}>
              Push to GitHub â import on vercel.com â deploy Â· Works on phone and desktop
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
