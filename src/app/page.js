"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { MODELS, AI_MODELS, LORA_TRIGGER } from "@/lib/prompts";

// ─── STYLES (scoped inline to avoid CSS module complexity) ───────────────────
const S = {
  // Layout
  wrap: { background: "var(--bg)", minHeight: "100vh", color: "var(--text)", fontFamily: "'DM Sans', sans-serif" },
  header: { position: "sticky", top: 0, zIndex: 100, background: "rgba(8,8,8,0.96)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--border)", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 },
  logo: { fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700, color: "var(--accent)", letterSpacing: "0.1em" },
  logoSub: { fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 1, letterSpacing: "0.06em" },
  // Cards
  card: { background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, overflow: "hidden", marginBottom: 12 },
  cardHead: { padding: "10px 14px", borderBottom: "1px solid var(--border)", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.1em" },
  cardBody: { padding: 16 },
  // Form
  fieldLabel: { display: "block", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 5 },
  input: { width: "100%", background: "#0a0a0a", border: "1px solid var(--border)", color: "var(--text)", padding: "9px 12px", borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none" },
  select: { width: "100%", background: "#0a0a0a", border: "1px solid var(--border)", color: "var(--text)", padding: "9px 12px", borderRadius: 8, fontFamily: "'Space Mono', monospace", fontSize: 12, outline: "none", cursor: "pointer" },
};

// ─── TINY COMPONENTS ─────────────────────────────────────────────────────────
function Label({ children }) {
  return <span style={S.fieldLabel}>{children}</span>;
}

function Field({ label, children, style }) {
  return <div style={{ marginBottom: 14, ...style }}><Label>{label}</Label>{children}</div>;
}

function NavTab({ label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "5px 14px", borderRadius: 6,
      fontFamily: "'Space Mono', monospace", fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em",
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      background: active ? "var(--accent)" : "transparent",
      color: active ? "#000" : "var(--muted)",
      cursor: "pointer", transition: "all 0.12s",
    }}>{label}</button>
  );
}

function ModeBtn({ label, desc, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "10px 12px", borderRadius: 9, textAlign: "left",
      border: `1px solid ${active ? "var(--accent)" : "var(--border)"}`,
      background: active ? "var(--accent-dim)" : "#0d0d0d",
      cursor: "pointer", flex: 1, transition: "all 0.12s",
    }}>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: active ? "var(--accent)" : "var(--sub)" }}>{label}</div>
      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", marginTop: 2 }}>{desc}</div>
    </button>
  );
}

function ModelPill({ model, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", borderRadius: 999,
      border: `1px solid ${active ? model.color : "var(--border)"}`,
      background: active ? `${model.color}18` : "transparent",
      color: active ? model.color : "var(--muted)",
      fontFamily: "'Space Mono', monospace", fontSize: 11,
      cursor: "pointer", transition: "all 0.12s", whiteSpace: "nowrap",
    }}>{model.label}</button>
  );
}

function CopyBtn({ text, small }) {
  const [done, setDone] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text).then(() => {
      setDone(true);
      setTimeout(() => setDone(false), 2000);
    });
  };
  return (
    <button onClick={copy} style={{
      padding: small ? "5px 12px" : "8px 18px",
      borderRadius: 7,
      background: done ? "var(--accent-dim)" : "var(--accent)",
      color: done ? "var(--accent)" : "#000",
      border: done ? "1px solid var(--accent)" : "none",
      fontFamily: "'Space Mono', monospace",
      fontSize: small ? 10 : 12,
      fontWeight: 700,
      cursor: "pointer",
      transition: "all 0.12s",
    }}>{done ? "✓ COPIED" : "COPY PROMPT"}</button>
  );
}

function DropZone({ imageData, onFile, onClear, id }) {
  const [drag, setDrag] = useState(false);
  const ref = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDrag(false);
    const file = e.dataTransfer.files[0];
    if (file) onFile(file);
  };

  return (
    <div>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${drag ? "var(--accent)" : imageData ? "#2a3800" : "var(--border)"}`,
          borderRadius: 12, background: drag ? "var(--accent-dim)" : imageData ? "#0a1200" : "#0d0d0d",
          cursor: "pointer", transition: "all 0.15s", overflow: "hidden",
          minHeight: imageData ? "auto" : 130, display: "flex", alignItems: "center", justifyContent: "center",
          position: "relative",
        }}
      >
        {imageData ? (
          <>
            <img src={imageData.dataUrl} alt="" style={{ width: "100%", display: "block", maxHeight: 240, objectFit: "cover", borderRadius: 10 }} />
            <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.8)", borderRadius: 5, padding: "2px 8px", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--accent)" }}>✓ LOADED</div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "24px 16px" }}>
            <div style={{ fontSize: 24, marginBottom: 8 }}>⬆</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555" }}>Drop image or tap to upload</div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>JPG · PNG · WEBP · Works on mobile</div>
          </div>
        )}
      </div>
      <input ref={ref} type="file" id={id} accept="image/*" style={{ display: "none" }} onChange={(e) => e.target.files[0] && onFile(e.target.files[0])} />
      {imageData && (
        <button onClick={onClear} style={{ marginTop: 6, background: "none", border: "1px solid var(--border)", color: "var(--muted)", borderRadius: 5, padding: "3px 10px", fontFamily: "'Space Mono', monospace", fontSize: 10, cursor: "pointer" }}>✕ Remove</button>
      )}
    </div>
  );
}

function PromptResult({ result, model, mode, loraWord, onSave }) {
  if (!result) return null;
  const { analysis, prompt, settings } = result;
  const [showAnalysis, setShowAnalysis] = useState(false);

  const promptStr = typeof prompt === "object" ? JSON.stringify(prompt, null, 2) : (prompt || "");
  const wordCount = promptStr.trim().split(/\s+/).filter(Boolean).length;
  const wOk = wordCount >= 80 && wordCount <= 250;

  return (
    <div>
      {/* Analysis toggle */}
      <div style={S.card}>
        <div style={{ ...S.cardHead, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: mode === "lora" ? "var(--accent)" : "var(--sub)" }}>
            {mode === "lora" ? `🔬 Scene Analysis — preserved for ${loraWord}` : "🔬 Image Analysis"}
          </span>
          <button onClick={() => setShowAnalysis(!showAnalysis)} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
            {showAnalysis ? "HIDE ▲" : "SHOW ▼"}
          </button>
        </div>
        {showAnalysis && (
          <div style={{ ...S.cardBody, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {Object.entries(analysis || {}).map(([k, v]) => v ? (
              <div key={k}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--muted)", textTransform: "uppercase", marginBottom: 3 }}>{k.replace(/_/g, " ")}</div>
                <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>{v}</div>
              </div>
            ) : null)}
          </div>
        )}
      </div>

      {/* Prompt box */}
      <div style={{ ...S.card, border: `1px solid #1e2800` }}>
        <div style={{ ...S.cardHead, background: "#090d00", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ color: model.color }}>{model.label} Prompt</span>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: wOk ? "var(--accent)" : "#ff8844", border: "1px solid currentColor", padding: "1px 6px", borderRadius: 3 }}>
              {wordCount}w {wOk ? "✓" : wordCount < 80 ? "↑" : "↓"}
            </span>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={onSave} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "3px 10px", cursor: "pointer" }}>SAVE</button>
          </div>
        </div>
        <div style={{ padding: 16, fontFamily: "'Space Mono', monospace", fontSize: 12.5, lineHeight: 1.9, color: "#ccc", whiteSpace: "pre-wrap", wordBreak: "break-word", background: "#090d00", borderBottom: "1px solid #1e2800" }}>
          {promptStr}
        </div>
        {/* Settings strip */}
        {settings && (
          <div style={{ padding: "8px 16px", background: "#090d00", fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", borderBottom: "1px solid #1e2800" }}>
            {settings}
          </div>
        )}
        {/* Copy button */}
        <div style={{ padding: "12px 16px", background: "#090d00", display: "flex", justifyContent: "flex-end" }}>
          <CopyBtn text={promptStr} />
        </div>
      </div>
    </div>
  );
}

// ─── FILE UTILS ───────────────────────────────────────────────────────────────
function readFile(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = (e) => res({ base64: e.target.result.split(",")[1], mediaType: file.type, dataUrl: e.target.result, name: file.name });
    r.onerror = () => rej(new Error("Read failed"));
    r.readAsDataURL(file);
  });
}

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────
export default function Home() {
  const [tab, setTab] = useState("single");
  const [apiKey, setApiKey] = useState("");
  const [aiModel, setAiModel] = useState(AI_MODELS[0].id);
  const [targetModel, setTargetModel] = useState(MODELS[0].id);
  const [mode, setMode] = useState("exact");
  const [loraWord, setLoraWord] = useState(LORA_TRIGGER);

  // Single
  const [singleImg, setSingleImg] = useState(null);
  const [singleResult, setSingleResult] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState("");

  // Batch
  const [batchImgs, setBatchImgs] = useState([]);
  const [batchResults, setBatchResults] = useState([]);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchProgress, setBatchProgress] = useState(0);
  const [batchStatus, setBatchStatus] = useState("");
  const [batchError, setBatchError] = useState("");

  // Saved
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    const k = localStorage.getItem("skye_apikey") || "";
    const lora = localStorage.getItem("skye_lora") || LORA_TRIGGER;
    if (k) setApiKey(k);
    setLoraWord(lora);
    const sv = JSON.parse(localStorage.getItem("skye_saved") || "[]");
    setSaved(sv);
  }, []);

  const persistKey = (k) => { setApiKey(k); localStorage.setItem("skye_apikey", k); };
  const persistLora = (l) => { setLoraWord(l); localStorage.setItem("skye_lora", l); };

  const activeModel = MODELS.find((m) => m.id === targetModel) || MODELS[0];

  // ── API CALL ──
  const analyze = useCallback(async (imgData) => {
    if (!apiKey.trim()) throw new Error("Enter your Anthropic API key in the settings bar above.");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        imageBase64: imgData.base64,
        mediaType: imgData.mediaType,
        mode,
        modelId: targetModel,
        loraWord,
        apiKey: apiKey.trim(),
        aiModel,
      }),
    });

    const data = await res.json();
    if (!res.ok || data.error) throw new Error(data.error || "Analysis failed");
    return data.result;
  }, [apiKey, mode, targetModel, loraWord, aiModel]);

  // ── SINGLE ──
  const runSingle = async () => {
    if (!singleImg) return;
    setSingleLoading(true);
    setSingleError("");
    setSingleResult(null);
    try {
      const result = await analyze(singleImg);
      setSingleResult(result);
    } catch (err) {
      setSingleError(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  const saveSingle = () => {
    if (!singleResult) return;
    const p = typeof singleResult.prompt === "object" ? JSON.stringify(singleResult.prompt, null, 2) : singleResult.prompt;
    const entry = { id: Date.now(), model: activeModel.label, mode, vibe: singleResult.analysis?.overall_vibe || "", prompt: p, thumb: singleImg?.dataUrl };
    const updated = [entry, ...saved];
    setSaved(updated);
    localStorage.setItem("skye_saved", JSON.stringify(updated));
  };

  // ── BATCH ──
  const handleBatchFiles = async (files) => {
    const arr = Array.from(files).slice(0, 10);
    const loaded = await Promise.all(arr.map(readFile));
    setBatchImgs(loaded);
    setBatchResults([]);
  };

  const runBatch = async () => {
    if (batchImgs.length === 0) return;
    setBatchLoading(true);
    setBatchError("");
    setBatchResults([]);
    setBatchProgress(0);

    const results = [];
    for (let i = 0; i < batchImgs.length; i++) {
      setBatchStatus(`Analyzing image ${i + 1} of ${batchImgs.length}...`);
      setBatchProgress(Math.round((i / batchImgs.length) * 100));
      try {
        const result = await analyze(batchImgs[i]);
        results.push({ img: batchImgs[i], result, index: i + 1, error: null });
      } catch (err) {
        results.push({ img: batchImgs[i], result: null, index: i + 1, error: err.message });
      }
      setBatchResults([...results]);
      if (i < batchImgs.length - 1) await new Promise((r) => setTimeout(r, 700));
    }

    setBatchProgress(100);
    setBatchStatus(`Done — ${results.filter(r => !r.error).length}/${batchImgs.length} succeeded`);
    setBatchLoading(false);
  };

  const saveBatchPrompt = (item) => {
    const p = typeof item.result.prompt === "object" ? JSON.stringify(item.result.prompt, null, 2) : item.result.prompt;
    const entry = { id: Date.now(), model: activeModel.label, mode, vibe: item.result.analysis?.overall_vibe || "", prompt: p, thumb: item.img?.dataUrl };
    const updated = [entry, ...saved];
    setSaved(updated);
    localStorage.setItem("skye_saved", JSON.stringify(updated));
  };

  // ── RENDER ──
  return (
    <div style={S.wrap}>

      {/* HEADER */}
      <div style={S.header}>
        <div>
          <div style={S.logo}>SKYE PROMPT ENGINE</div>
          <div style={S.logoSub}>AI-POWERED · IMAGE → PERFECT PROMPT · LORA READY</div>
        </div>
        <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
          {["single", "batch", "saved", "settings"].map((t) => (
            <NavTab key={t} label={t === "saved" ? `Saved${saved.length > 0 ? ` (${saved.length})` : ""}` : t} active={tab === t} onClick={() => setTab(t)} />
          ))}
        </div>
      </div>

      {/* ── CONFIG BAR (always visible on single/batch) ── */}
      {(tab === "single" || tab === "batch") && (
        <div style={{ borderBottom: "1px solid var(--border)", padding: "12px 20px", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end", background: "var(--surface)" }}>
          {/* API Key */}
          <div style={{ flex: "0 0 220px" }}>
            <Label>Anthropic API Key</Label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => persistKey(e.target.value)}
              placeholder="sk-ant-..."
              style={{ ...S.input, width: "100%" }}
            />
          </div>
          {/* AI Model */}
          <div style={{ flex: "0 0 200px" }}>
            <Label>Claude Model (for analysis)</Label>
            <select value={aiModel} onChange={(e) => setAiModel(e.target.value)} style={S.select}>
              {AI_MODELS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
          {/* Mode */}
          <div>
            <Label>Mode</Label>
            <div style={{ display: "flex", gap: 6 }}>
              <ModeBtn label="🎯 Exact Clone" desc="replicate everything" active={mode === "exact"} onClick={() => setMode("exact")} />
              <ModeBtn label="✨ LoRA Swap" desc={`${loraWord} · scene preserved`} active={mode === "lora"} onClick={() => setMode("lora")} />
            </div>
          </div>
          {/* Target model */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <Label>Optimize prompt for</Label>
            <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
              {MODELS.map((m) => (
                <ModelPill key={m.id} model={m} active={targetModel === m.id} onClick={() => setTargetModel(m.id)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════ SINGLE TAB ═══════════════ */}
      {tab === "single" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 130px)", maxWidth: 1300, margin: "0 auto", padding: 20, gap: 20 }}>
          {/* Left */}
          <div>
            <div style={S.card}>
              <div style={S.cardHead}>Reference Image</div>
              <div style={S.cardBody}>
                <DropZone
                  imageData={singleImg}
                  onFile={async (f) => { const d = await readFile(f); setSingleImg(d); setSingleResult(null); setSingleError(""); }}
                  onClear={() => { setSingleImg(null); setSingleResult(null); setSingleError(""); }}
                  id="file-single"
                />
              </div>
            </div>

            {/* LoRA word (only in lora mode) */}
            {mode === "lora" && (
              <div style={S.card}>
                <div style={S.cardHead}>LoRA Settings</div>
                <div style={S.cardBody}>
                  <Field label="Trigger Word">
                    <input type="text" value={loraWord} onChange={(e) => persistLora(e.target.value)} style={S.input} />
                  </Field>
                  <div style={{ background: "#0a1200", border: "1px solid #2a3800", borderRadius: 8, padding: "10px 12px", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#88aa44", lineHeight: 1.8 }}>
                    Subject → replaced by <strong style={{ color: "var(--accent)" }}>{loraWord}</strong><br />
                    Scene / lighting / outfit / makeup → preserved<br />
                    Character drift protection: ON
                  </div>
                </div>
              </div>
            )}

            {/* Model info */}
            <div style={{ background: "#090d00", border: "1px solid #1e2800", borderRadius: 10, padding: "12px 14px", fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--muted)", lineHeight: 1.8 }}>
              <span style={{ color: activeModel.color }}>▸ {activeModel.label}</span><br />
              {activeModel.settings}
            </div>

            <button
              onClick={runSingle}
              disabled={!singleImg || singleLoading}
              style={{
                marginTop: 12, width: "100%", padding: 14,
                background: singleLoading ? "#1a1a1a" : "var(--accent)",
                color: singleLoading ? "var(--muted)" : "#000",
                border: "none", borderRadius: 10,
                fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700,
                cursor: singleImg && !singleLoading ? "pointer" : "not-allowed",
                letterSpacing: "0.06em", transition: "all 0.15s",
              }}
            >
              {singleLoading ? "🔍 ANALYZING..." : "🔍 ANALYZE & GENERATE"}
            </button>

            {singleError && (
              <div style={{ marginTop: 8, background: "#1a0000", border: "1px solid #440000", borderRadius: 8, padding: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff6666", lineHeight: 1.6 }}>
                {singleError}
              </div>
            )}
          </div>

          {/* Right */}
          <div>
            {singleLoading && (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: "var(--muted)", marginBottom: 16 }}>Claude is analyzing your image...</div>
                <div style={{ display: "flex", gap: 8, justifyContent: "center" }}>
                  {["Lighting", "Composition", "Makeup", "Scene", "Prompt"].map((s, i) => (
                    <div key={s} style={{ padding: "4px 10px", border: "1px solid var(--border)", borderRadius: 5, fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", animation: `pulse 1.4s ${i * 0.2}s infinite` }}>{s}</div>
                  ))}
                </div>
                <style>{`@keyframes pulse{0%,100%{opacity:.2}50%{opacity:1}}`}</style>
              </div>
            )}
            {!singleLoading && !singleResult && !singleError && (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>🖼️</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12 }}>Upload a reference image → hit Analyze</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#333", marginTop: 8, lineHeight: 1.8 }}>
                  Claude reads every detail — lighting, scene, outfit, makeup, skin finish, vibe<br />
                  Outputs one perfectly formatted prompt for your selected model
                </div>
              </div>
            )}
            {singleResult && (
              <PromptResult result={singleResult} model={activeModel} mode={mode} loraWord={loraWord} onSave={saveSingle} />
            )}
          </div>
        </div>
      )}

      {/* ═══════════════ BATCH TAB ═══════════════ */}
      {tab === "batch" && (
        <div style={{ display: "grid", gridTemplateColumns: "320px 1fr", minHeight: "calc(100vh - 130px)", maxWidth: 1300, margin: "0 auto", padding: 20, gap: 20 }}>
          {/* Left */}
          <div>
            <div style={S.card}>
              <div style={S.cardHead}>Upload Images (max 10)</div>
              <div style={S.cardBody}>
                <div
                  onClick={() => document.getElementById("file-batch")?.click()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={async (e) => { e.preventDefault(); await handleBatchFiles(e.dataTransfer.files); }}
                  style={{ border: "2px dashed var(--border)", borderRadius: 10, background: "#0d0d0d", cursor: "pointer", minHeight: 100, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, textAlign: "center" }}
                >
                  <div>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>📁</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#555" }}>Drop up to 10 images</div>
                    <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", marginTop: 3 }}>Analyzed one by one · Same model for all</div>
                  </div>
                </div>
                <input type="file" id="file-batch" accept="image/*" multiple style={{ display: "none" }} onChange={(e) => handleBatchFiles(e.target.files)} />

                {/* Thumbnails */}
                {batchImgs.length > 0 && (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginTop: 10 }}>
                    {batchImgs.map((img, i) => {
                      const res = batchResults[i];
                      return (
                        <div key={i} style={{ position: "relative", borderRadius: 7, overflow: "hidden", aspectRatio: "1", border: "1px solid var(--border)" }}>
                          <img src={img.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          <div style={{ position: "absolute", top: 3, left: 3, background: "rgba(0,0,0,0.8)", borderRadius: 3, fontFamily: "'Space Mono', monospace", fontSize: 9, color: "var(--accent)", padding: "1px 5px" }}>{i + 1}</div>
                          <div style={{ position: "absolute", bottom: 3, right: 3, fontSize: 12 }}>
                            {res ? (res.error ? "❌" : "✅") : (batchLoading && batchResults.length === i ? "⏳" : "")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={runBatch}
              disabled={batchImgs.length === 0 || batchLoading}
              style={{
                width: "100%", padding: 14,
                background: batchLoading || batchImgs.length === 0 ? "#1a1a1a" : "var(--accent)",
                color: batchLoading || batchImgs.length === 0 ? "var(--muted)" : "#000",
                border: "none", borderRadius: 10,
                fontFamily: "'Space Mono', monospace", fontSize: 13, fontWeight: 700,
                cursor: batchImgs.length > 0 && !batchLoading ? "pointer" : "not-allowed",
                letterSpacing: "0.06em",
              }}
            >
              {batchLoading ? `⏳ ${batchStatus || "Analyzing..."}` : `🔍 ANALYZE ALL (${batchImgs.length})`}
            </button>

            {batchLoading && (
              <div style={{ marginTop: 8 }}>
                <div style={{ height: 4, background: "#111", borderRadius: 4, overflow: "hidden" }}>
                  <div style={{ height: "100%", background: "var(--accent)", borderRadius: 4, width: `${batchProgress}%`, transition: "width 0.3s" }} />
                </div>
              </div>
            )}
            {!batchLoading && batchStatus && (
              <div style={{ marginTop: 8, fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--accent)", textAlign: "center" }}>{batchStatus}</div>
            )}
            {batchError && (
              <div style={{ marginTop: 8, background: "#1a0000", border: "1px solid #440000", borderRadius: 8, padding: 10, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff6666" }}>{batchError}</div>
            )}
          </div>

          {/* Right - Batch results */}
          <div>
            {batchResults.length === 0 && !batchLoading && (
              <div style={{ textAlign: "center", padding: "80px 20px", color: "var(--muted)" }}>
                <div style={{ fontSize: 44, marginBottom: 12 }}>📦</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12 }}>Upload up to 10 images → Analyze All</div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "#333", marginTop: 8, lineHeight: 1.8 }}>
                  Each image gets its own labeled section<br />
                  One prompt per image · Easy copy button on each
                </div>
              </div>
            )}
            {batchResults.map((item) => (
              <div key={item.index} style={{ marginBottom: 20 }}>
                {/* Batch header */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#000", background: item.error ? "#ff5555" : "var(--accent)", padding: "3px 10px", borderRadius: 5, fontWeight: 700 }}>
                    IMAGE {item.index}
                  </span>
                  <img src={item.img.dataUrl} alt="" style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 5, border: "1px solid var(--border)" }} />
                  {item.result?.analysis?.overall_vibe && (
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>{item.result.analysis.overall_vibe.slice(0, 60)}</span>
                  )}
                </div>
                {item.error ? (
                  <div style={{ background: "#1a0000", border: "1px solid #440000", borderRadius: 8, padding: 12, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#ff6666" }}>{item.error}</div>
                ) : (
                  <PromptResult result={item.result} model={activeModel} mode={mode} loraWord={loraWord} onSave={() => saveBatchPrompt(item)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══════════════ SAVED TAB ═══════════════ */}
      {tab === "saved" && (
        <div style={{ maxWidth: 820, margin: "0 auto", padding: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--muted)", textTransform: "uppercase" }}>
              {saved.length} saved prompt{saved.length !== 1 ? "s" : ""}
            </span>
            {saved.length > 0 && (
              <button onClick={() => { if (confirm("Clear all?")) { setSaved([]); localStorage.removeItem("skye_saved"); } }} style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", background: "none", border: "1px solid var(--border)", borderRadius: 5, padding: "4px 10px", cursor: "pointer" }}>
                Clear All
              </button>
            )}
          </div>
          {saved.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", color: "#333", fontFamily: "'Space Mono', monospace", fontSize: 12 }}>No saved prompts yet.</div>
          ) : saved.map((p) => {
            const modelMeta = MODELS.find(m => m.label === p.model);
            return (
              <div key={p.id} style={{ ...S.card, display: "flex", gap: 14, padding: 16, marginBottom: 10 }}>
                {p.thumb && <img src={p.thumb} alt="" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 7, flexShrink: 0, border: "1px solid var(--border)" }} />}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: modelMeta?.color || "#fff", border: "1px solid currentColor", padding: "1px 7px", borderRadius: 3 }}>{p.model}</span>
                    <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 9, color: p.mode === "lora" ? "var(--accent)" : "var(--blue)", border: "1px solid currentColor", padding: "1px 7px", borderRadius: 3 }}>{p.mode.toUpperCase()}</span>
                    {p.vibe && <span style={{ fontSize: 11, color: "var(--muted)" }}>{p.vibe.slice(0, 50)}</span>}
                    <button onClick={() => { const u = saved.filter(x => x.id !== p.id); setSaved(u); localStorage.setItem("skye_saved", JSON.stringify(u)); }} style={{ marginLeft: "auto", background: "none", border: "none", color: "#444", cursor: "pointer", fontSize: 14 }}>✕</button>
                  </div>
                  <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 11, color: "#777", lineHeight: 1.6, marginBottom: 10 }}>{p.prompt.slice(0, 200)}...</div>
                  <CopyBtn text={p.prompt} small />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ═══════════════ SETTINGS TAB ═══════════════ */}
      {tab === "settings" && (
        <div style={{ maxWidth: 600, margin: "0 auto", padding: 24 }}>
          <div style={S.card}>
            <div style={S.cardHead}>API & Model</div>
            <div style={S.cardBody}>
              <Field label="Anthropic API Key">
                <div style={{ display: "flex", gap: 8 }}>
                  <input type="password" value={apiKey} onChange={(e) => persistKey(e.target.value)} placeholder="sk-ant-..." style={{ ...S.input, flex: 1 }} />
                </div>
                <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 10, color: "var(--muted)", marginTop: 5, lineHeight: 1.7 }}>
                  Get free credits → console.anthropic.com/api-keys<br />
                  Stored in your browser only. Never sent anywhere except Anthropic.
                </div>
              </Field>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardHead}>LoRA</div>
            <div style={S.cardBody}>
              <Field label="Default LoRA Trigger Word">
                <input type="text" value={loraWord} onChange={(e) => persistLora(e.target.value)} placeholder="skyeewmn" style={S.input} />
              </Field>
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardHead}>How to Deploy / Run</div>
            <div style={{ ...S.cardBody, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--sub)", lineHeight: 2 }}>
              <strong style={{ color: "var(--text)" }}>Vercel (recommended):</strong><br />
              1. Push this project to GitHub<br />
              2. Connect repo to vercel.com → Deploy<br />
              3. Done — your own permanent URL<br /><br />
              <strong style={{ color: "var(--text)" }}>Local:</strong><br />
              npm install → npm run dev → localhost:3000<br /><br />
              <strong style={{ color: "var(--text)" }}>Your API key</strong> is stored in browser localStorage.<br />
              Set it once and it persists across sessions.
            </div>
          </div>
          <div style={S.card}>
            <div style={S.cardHead}>Prompt Engineering Rules (baked in)</div>
            <div style={{ ...S.cardBody, fontFamily: "'Space Mono', monospace", fontSize: 11, color: "var(--sub)", lineHeight: 2 }}>
              <span style={{ color: "var(--accent)" }}>Z-Image Turbo:</span> CFG=0 · no neg prompt · camera-first · 80–220w<br />
              <span style={{ color: "#47b8ff" }}>Z-Image Base:</span> CFG 3.5–7 · supports negative · sentence style<br />
              <span style={{ color: "#ffaa47" }}>Nano Banana:</span> JSON weighted tags · neg field supported<br />
              <span style={{ color: "#b847ff" }}>Wan 2.2:</span> Natural language · motion-aware<br />
              <span style={{ color: "#ff47aa" }}>Qwen Image:</span> Descriptive natural language · CFG 5–7<br /><br />
              All rules live in <code style={{ color: "var(--accent)" }}>src/lib/prompts.js</code> — edit anytime.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
