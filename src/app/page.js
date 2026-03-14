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

function CopyBtn({ text, small, label }) {
  const [done, setDone] = useState(false);
  const copy = () => { navigator.clipboard.writeText(text).then(() => { setDone(true); setTimeout(() => setDone(false), 2000); }); };
  return (
    <button onClick={copy} style={{ padding: small ? "5px 12px" : "9px 20px", borderRadius:7, background: done ? C.accentDim : C.accent, color: done ? C.accent : "#000", border: done ? `1px solid ${C.accent}` : "none", fontFamily:"'Space Mono',monospace", fontSize: small ? 10 : 12, fontWeight:700, cursor:"pointer", transition:"all 0.12s" }}>
      {done ? "â COPIED" : (label || "COPY PROMPT")}
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
            <div style={{ position:"absolute", top:8, right:8, background:"rgba(0,0,0,0.85)", borderRadius:5, padding:"2px 8px", fontFamily:"'Space Mono',monospace", fontSize:10, color:C.accent }}>â LOADED</div>
          </>
        ) : (
          <div style={{ textAlign:"center", padding:"20px 16px" }}>
            <div style={{ fontSize:22, marginBottom:6 }}>â¬</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:11, color:"#555" }}>Drop image or tap to upload</div>
            <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, marginTop:3 }}>JPG Â· PNG Â· WEBP</div>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{ display:"none" }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {imageData && (
        <button onClick={onClear} style={{ marginTop:6, background:"none", border:`1px solid ${C.border}`, color:C.muted, borderRadius:5, padding:"3px 10px", fontFamily:"'Space Mono',monospace", fontSize:10, cursor:"pointer" }}>â Remove image</button>
      )}
    </div>
  );
}

function PromptOutput({ promptText, model, onSave, onRegenerate, loading }) {
  const [saveFlash, setSaveFlash] = useState(false);
  const wordCount = promptText ? promptText.trim().split(/\s+/).filter(Boolean).length : 0;
  const wOk = wordCount >= 80 && wordCount <= 250;

  const handleSave = () => {
    onSave();
    setSaveFlash(true);
    setTimeout(() => setSaveFlash(false), 2000);
  };

  if (!promptText && !loading) return null;

  return (
    <div style={{ ...base.card, border:`1px solid #1e2800` }}>
      {/* Header */}
      <div style={{ ...base.cardHead, background:"#090d00", borderColor:"#1e2800" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ color: model.color }}>{model.label} Prompt</span>
          {wordCount > 0 && (
            <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color: wOk ? C.accent : "#ff8844", border:"1px solid currentColor", padding:"1px 6px", borderRadius:3 }}>
              {wordCount}w {wOk ? "â" : wordCount < 80 ? "â short" : "â long"}
            </span>
          )}
        </div>
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={onRegenerate} disabled={loading} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color: loading ? C.muted : "#aaa", background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"3px 10px", cursor: loading ? "not-allowed" : "pointer" }}>
            {loading ? "..." : "âº REGENERATE"}
          </button>
          <button onClick={handleSave} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color: saveFlash ? C.accent : C.muted, background: saveFlash ? C.accentDim : "none", border:`1px solid ${saveFlash ? C.accent : C.border}`, borderRadius:5, padding:"3px 10px", cursor:"pointer", transition:"all 0.2s" }}>
            {saveFlash ? "â SAVED" : "SAVE"}
          </button>
        </div>
      </div>

      {/* Prompt text */}
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

      {/* Settings strip + copy */}
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
  const [apiKeys, setApiKeys] = useState({ anthropic: "", openai: "", gemini: "" });
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
    setProvider(p);
    localStorage.setItem("skye_provider", p);
    const models = AI_MODELS[p];
    if (models) setAiModel(models[0].id);
  };

  const activeModel = MODELS.find(m => m.id === targetModel) || MODELS[0];
  const currentKey = apiKeys[provider] || "";
  const providerInfo = PROVIDERS.find(p => p.id === provider) || PROVIDERS[0];

  const callAnalyze = useCallback(async (imgData) => {
    if (!currentKey.trim()) throw new Error("Enter your API key for the selected provider.");
    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageBase64: imgData.base64, mediaType: imgData.mediaType, mode, modelId: targetModel, loraWord, apiKey: currentKey.trim(), aiModel, provider }),
    });
    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
    return data.result?.prompt || data.result || "";
  }, [currentKey, mode, targetModel, loraWord, aiModel, provider]);

  const runSingle = async () => {
    if (!singleImg) return;
    setSingleLoading(true);
    setSingleError("");
    setSinglePrompt("");
    try {
      const prompt = await callAnalyze(singleImg);
      setSinglePrompt(typeof prompt === "string" ? prompt : JSON.stringify(prompt, null, 2));
    } catch (err) {
      setSingleError(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const saveSingle = () => {
    if (!singlePrompt) return;
    const entry = { id: Date.now(), model: activeModel.label, mode, prompt: singlePrompt, thumb: singleImg?.dataUrl, provider };
    const updated = [entry, ...saved];
    setSaved(updated);
    localStorage.setItem("skye_saved", JSON.stringify(updated));
  };

  const handleBatchFiles = async (files) => {
    const arr = Array.from(files).slice(0, 10);
    const loaded = await Promise.all(arr.map(readFile));
    setBatchImgs(loaded);
    setBatchResults([]);
  };

  const runBatch = async () => {
    if (batchImgs.length === 0) return;
    setBatchLoading(true);
    setBatchResults([]);
    setBatchProgress(0);
    const results = [];
    for (let i = 0; i < batchImgs.length; i++) {
      setBatchStatus(`Analyzing ${i + 1} of ${batchImgs.length}...`);
      setBatchProgress(Math.round((i / batchImgs.length) * 100));
      try {
        const prompt = await callAnalyze(batchImgs[i]);
        results.push({ img: batchImgs[i], prompt: typeof prompt === "string" ? prompt : JSON.stringify(prompt, null, 2), index: i + 1, error: null });
      } catch (err) {
        results.push({ img: batchImgs[i], prompt: null, index: i + 1, error: err.message });
      }
      setBatchResults([...results]);
      if (i < batchImgs.length - 1) await new Promise(r => setTimeout(r, 700));
    }
    setBatchProgress(100);
    setBatchStatus(`Done â ${results.filter(r => !r.error).length}/${batchImgs.length} succeeded`);
    setBatchLoading(false);
  };

  const saveBatch = (item) => {
    const entry = { id: Date.now(), model: activeModel.label, mode, prompt: item.prompt, thumb: item.img?.dataUrl, provider };
    const updated = [entry, ...saved];
    setSaved(updated);
    localStorage.setItem("skye_saved", JSON.stringify(updated));
  };

  const configBar = (
    <div style={{ borderBottom:`1px solid ${C.border}`, padding:"12px 20px", display:"flex", gap:12, flexWrap:"wrap", alignItems:"flex-end", background:C.surface }}>
      {/* Provider */}
      <div style={{ flex:"0 0 180px" }}>
        <span style={base.label}>AI Provider</span>
        <select value={provider} onChange={e => persistProvider(e.target.value)} style={base.select}>
          {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.label}</option>)}
        </select>
      </div>
      {/* API Key */}
      <div style={{ flex:"0 0 220px" }}>
        <span style={base.label}>API Key ({providerInfo.freeCredits})</span>
        <div style={{ display:"flex", gap:6 }}>
          <input type={keyVisible ? "text" : "password"} value={currentKey} onChange={e => persistKeys({ ...apiKeys, [provider]: e.target.value })} placeholder={providerInfo.keyPlaceholder} style={{ ...base.input, flex:1 }} />
          <button onClick={() => setKeyVisible(!keyVisible)} title={keyVisible ? "Hide key" : "Show key"} style={{ padding:"0 10px", borderRadius:7, background:"#111", border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer", fontSize:14 }}>
            {keyVisible ? "ð" : "ð"}
          </button>
        </div>
      </div>
      {/* AI Model */}
      <div style={{ flex:"0 0 200px" }}>
        <span style={base.label}>Analysis Model</span>
        <select value={aiModel} onChange={e => setAiModel(e.target.value)} style={base.select}>
          {(AI_MODELS[provider] || []).map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
        </select>
      </div>
      {/* Mode */}
      <div>
        <span style={base.label}>Mode</span>
        <div style={{ display:"flex", gap:6 }}>
          <ModeBtn label="ð¯ Exact Clone" desc="full replication" active={mode === "exact"} onClick={() => setMode("exact")} />
          <ModeBtn label="â¨ LoRA Swap" desc={`${loraWord} Â· scene preserved`} active={mode === "lora"} onClick={() => setMode("lora")} />
        </div>
      </div>
      {/* Target model */}
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
          <div style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:C.muted, marginTop:1 }}>AI-POWERED Â· IMAGE â PERFECT PROMPT Â· LORA READY</div>
        </div>
        <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
          {["single","batch","saved","settings"].map(t => (
            <NavTab key={t} label={t === "saved" ? `Saved${saved.length > 0 ? ` (${saved.length})` : ""}` : t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>
      </div>

      {/* CONFIG BAR */}
      {(tab === "single" || tab === "batch") && configBar}

      {/* âââ SINGLE âââ */}
      {tab === "single" && (
        <div style={{ display:"grid", gridTemplateColumns:"300px 1fr", minHeight:"calc(100vh-130px)", maxWidth:1280, margin:"0 auto", padding:20, gap:20 }}>
          <div>
            <div style={base.card}>
              <div style={base.cardHead}><span>Reference Image</span></div>
              <div style={{ padding:14 }}>
                <DropZone imageData={singleImg} onFile={async f => { const d = await readFile(f); setSingleImg(d); setSinglePrompt(""); setSingleError(""); }} onClear={() => { setSingleImg(null); setSinglePrompt(""); setSingleError(""); }} />
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
                    <strong style={{ color:C.accent }}>{loraWord}</strong> replaces subject<br />
                    Scene Â· lighting Â· outfit Â· pose â preserved<br />
                    Drift protection: ON
                  </div>
                </div>
              </div>
            )}

            <div style={{ background:"#090d00", border:"1px solid #1e2800", borderRadius:10, padding:"11px 14px", fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, lineHeight:1.8, marginBottom:12 }}>
              <span style={{ color: activeModel.color }}>â¸ {activeModel.label}</span><br />
              {activeModel.settings}
            </div>

            <button onClick={runSingle} disabled={!singleImg || singleLoading}
              style={{ width:"100%", padding:14, background: (!singleImg || singleLoading) ? "#1a1a1a" : C.accent, color: (!singleImg || singleLoading) ? C.muted : "#000", border:"none", borderRadius:10, fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700, cursor: singleImg && !singleLoading ? "pointer" : "not-allowed", letterSpacing:"0.06em" }}>
              {singleLoading ? "ð ANALYZING..." : "ð ANALYZE & GENERATE"}
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
                <div style={{ fontSize:44, marginBottom:12 }}>ð¼ï¸</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12 }}>Upload a reference â hit Analyze</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#333", marginTop:8, lineHeight:1.8 }}>
                  Full forensic scene analysis â lighting geometry, pose components,<br />environment objects, photography style â one perfect prompt
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
                    <div style={{ fontSize:20, marginBottom:5 }}>ð</div>
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
                          <div style={{ position:"absolute", top:2, left:2, background:"rgba(0,0,0,0.8)", borderRadius:3, fontFamily:"'Space Mono',monospace", fontSize:8, color:C.accent, padding:"1px 4px" }}>{i+1}</div>
                          <div style={{ position:"absolute", bottom:2, right:2, fontSize:10 }}>
                            {res ? (res.error ? "â" : "â") : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button onClick={runBatch} disabled={batchImgs.length === 0 || batchLoading}
              style={{ width:"100%", padding:14, background: batchImgs.length === 0 || batchLoading ? "#1a1a1a" : C.accent, color: batchImgs.length === 0 || batchLoading ? C.muted : "#000", border:"none", borderRadius:10, fontFamily:"'Space Mono',monospace", fontSize:13, fontWeight:700, cursor: batchImgs.length > 0 && !batchLoading ? "pointer" : "not-allowed", letterSpacing:"0.06em" }}>
              {batchLoading ? `â³ ${batchStatus}` : `ð ANALYZE ALL (${batchImgs.length})`}
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
                <div style={{ fontSize:44, marginBottom:12 }}>ð¦</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:12 }}>Upload images â Analyze All</div>
                <div style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#333", marginTop:8, lineHeight:1.8 }}>One prompt per image Â· Same model for all Â· Easy copy on each</div>
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
            {saved.length > 0 && <button onClick={() => { if (confirm("Clear all saved prompts?")) { setSaved([]); localStorage.removeItem("skye_saved"); }}} style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:C.muted, background:"none", border:`1px solid ${C.border}`, borderRadius:5, padding:"4px 10px", cursor:"pointer" }}>Clear All</button>}
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
                    <span style={{ fontFamily:"'Space Mono',monospace", fontSize:9, color:"#444", border:`1px solid #222`, padding:"1px 7px", borderRadius:3 }}>{p.provider || "anthropic"}</span>
                    <button onClick={() => { const u = saved.filter(x => x.id !== p.id); setSaved(u); localStorage.setItem("skye_saved", JSON.stringify(u)); }} style={{ marginLeft:"auto", background:"none", border:"none", color:"#444", cursor:"pointer", fontSize:14 }}>â</button>
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
            <div style={base.cardHead}>API Keys â All Providers</div>
            <div style={{ padding:16 }}>
              {PROVIDERS.map(p => (
                <div key={p.id} style={{ marginBottom:16 }}>
                  <Field label={`${p.label} â ${p.freeCredits}`}>
                    <div style={{ display:"flex", gap:6 }}>
                      <input type={keyVisible ? "text" : "password"} value={apiKeys[p.id] || ""} onChange={e => persistKeys({ ...apiKeys, [p.id]: e.target.value })} placeholder={p.keyPlaceholder} style={{ ...base.input, flex:1 }} />
                      <a href={p.keyLink} target="_blank" rel="noopener noreferrer" style={{ padding:"0 10px", borderRadius:7, background:"#111", border:`1px solid ${C.border}`, color:C.muted, cursor:"pointer", fontSize:11, display:"flex", alignItems:"center", textDecoration:"none", whiteSpace:"nowrap", fontFamily:"'Space Mono',monospace" }}>Get Key</a>
                    </div>
                  </Field>
                </div>
              ))}
              <div style={{ display:"flex", alignItems:"center", gap:10, marginTop:4 }}>
                <button onClick={() => setKeyVisible(!keyVisible)} style={{ display:"flex", alignItems:"center", gap:6, background:"none", border:`1px solid ${C.border}`, borderRadius:7, padding:"6px 12px", color:C.muted, cursor:"pointer", fontFamily:"'Space Mono',monospace", fontSize:10 }}>
                  {keyVisible ? "ð Hide all keys" : "ð Show all keys"}
                </button>
                <span style={{ fontFamily:"'Space Mono',monospace", fontSize:10, color:"#333" }}>Keys stored in browser only</span>
              </div>
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
              <strong style={{ color:C.text }}>Anthropic (Claude):</strong> console.anthropic.com Â· $5 free on signup Â· Best for scene analysis<br />
              <strong style={{ color:C.text }}>OpenAI (GPT-4o):</strong> platform.openai.com Â· $5 free trial Â· Strong image understanding<br />
              <strong style={{ color:C.text }}>Google (Gemini):</strong> aistudio.google.com Â· Free tier available Â· gemini-1.5-flash is free<br /><br />
              <strong style={{ color:C.accent }}>Recommendation:</strong> Use Gemini Flash (free) for batch runs to preserve Claude credits for fine-tuning prompts here in Claude.ai
            </div>
          </div>

          <div style={base.card}>
            <div style={base.cardHead}>Deploy / Run</div>
            <div style={{ padding:16, fontFamily:"'Space Mono',monospace", fontSize:11, color:C.sub, lineHeight:2 }}>
              <strong style={{ color:C.text }}>Vercel:</strong> Push to GitHub â import on vercel.com â deploy<br />
              <strong style={{ color:C.text }}>Local:</strong> npm install â npm run dev â localhost:3000<br />
              <strong style={{ color:C.text }}>Phone:</strong> Open your Vercel URL in Safari/Chrome â works fully
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
