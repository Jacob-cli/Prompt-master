"use client";
import { useState, useRef, useCallback, useEffect } from "react";
import { MODELS, AI_MODELS, PROVIDERS, LORA_TRIGGER } from "@/lib/prompts";

const C={bg:"#080808",surface:"#0f0f0f",card:"#121212",border:"#1c1c1c",accent:"#b8ff47",accentDim:"rgba(184,255,71,0.08)",text:"#e0e0e0",muted:"#555",sub:"#888",red:"#ff5a5f",green:"#58d26a"};
const M={fontFamily:"'Space Mono', monospace"};
const inputStyle={width:"100%",background:"#0a0a0a",border:`1px solid ${C.border}`,color:C.text,padding:"10px 12px",borderRadius:10,...M,fontSize:12,outline:"none",boxSizing:"border-box"};
const selectStyle={...inputStyle,cursor:"pointer"};
const labelStyle={display:"block",...M,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:6};

const TONGYI_LOGO="https://drive.google.com/thumbnail?id=1B2PA8tRx3jeO1livS8NGdeNXeGKWyTw5&sz=w128";
const faviconId=((u)=>String(u).match(/\/d\/([^/]+)/)?.[1]||"")("https://drive.google.com/file/d/1zsH0eR_OAeQA42uYDU0k_LsCunpGW1MV/view?usp=drive_link");
const countWords=(text="")=>text.trim()?text.trim().split(/\s+/).length:0;
const supportsNegative=(id)=>Boolean(MODELS.find((m)=>m.id===id)?.supportsNegative);
const normalizeSections=(entry)=>Array.isArray(entry?.sections)&&entry.sections.length?entry.sections:[{kind:supportsNegative(entry?.modelId)?"positive":"prompt",label:supportsNegative(entry?.modelId)?"Positive":"Prompt",text:entry?.prompt||""}];
const serializeSections=(sections=[])=>JSON.stringify(sections.map((s)=>({kind:s.kind,text:s.text})));
async function readFile(file){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>{const dataUrl=r.result;resolve({name:file.name,dataUrl,base64:String(dataUrl).split(",")[1],mediaType:file.type||"image/png"});};r.onerror=reject;r.readAsDataURL(file);});}

// ── SVG ICONS ──────────────────────────────────────────────────────────────────
function ModelLogo({modelId,size=16}){const [failed,setFailed]=useState(false);if(modelId==="nano_banana")return <span style={{fontSize:Math.round(size*1.15),lineHeight:1,display:"inline-block",width:size,textAlign:"center",flexShrink:0}}>🍌</span>;const letters={zimage_turbo:"Z",zimage_base:"Z",wan22:"W",qwen:"Q"};const colors={zimage_turbo:"#b8ff47",zimage_base:"#47b8ff",wan22:"#b847ff",qwen:"#ff47aa"};if(failed)return <span style={{display:"inline-flex",width:size,height:size,borderRadius:4,background:`${colors[modelId]||C.muted}22`,alignItems:"center",justifyContent:"center",...M,fontWeight:700,fontSize:Math.round(size*0.58),color:colors[modelId]||C.muted,flexShrink:0}}>{letters[modelId]||"?"}</span>;return <img src={TONGYI_LOGO} alt="" onError={()=>setFailed(true)} style={{width:size,height:size,objectFit:"contain",borderRadius:4,display:"block",flexShrink:0}}/>;}
const Eye=({color=C.muted,size=15})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
const EyeOff=({color=C.muted,size=15})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
const SearchIco=({color="#000",size=15})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
const CopyIco=({color="#000",size=12})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>;
const CheckIco=({color=C.accent,size=12})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>;
const TrashIco=({color=C.red,size=13})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>;
const ChevR=({color=C.muted,size=11})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>;
const ChevUp=({color=C.muted,size=14})=><svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15"/></svg>;

// ── SMALL COMPONENTS ───────────────────────────────────────────────────────────
// FIX #3d: EyeToggle on Single page = icon-only, no border. Settings page = styled toggle (uses small prop).
function EyeToggle({visible,onToggle,small,iconOnly}){
  if(iconOnly){
    return(
      <button type="button" onClick={onToggle} style={{background:"none",border:"none",padding:"0 8px",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",height:40,color:visible?C.accent:C.muted,transition:"color 0.15s"}}>
        {visible?<Eye color={C.accent} size={15}/>:<EyeOff color={C.muted} size={15}/>}
      </button>
    );
  }
  const h=small?30:36;
  return(
    <button type="button" onClick={onToggle} style={{padding:"0 10px",borderRadius:7,background:visible?C.accentDim:"#0d0d0d",border:`1px solid ${visible?C.accent:C.border}`,cursor:"pointer",display:"flex",alignItems:"center",height:h,minWidth:h,transition:"all 0.15s"}}>
      {visible?<Eye color={C.accent} size={small?13:15}/>:<EyeOff color={C.muted} size={small?13:15}/>}
    </button>
  );
}

function CopyBtn({text,small,onCopied}){
  const [done,setDone]=useState(false);
  const go=()=>{navigator.clipboard.writeText(text).then(()=>{setDone(true);if(onCopied)onCopied();setTimeout(()=>setDone(false),2000);});};
  return(
    <button type="button" onClick={go} style={{padding:small?"4px 10px":"8px 16px",borderRadius:7,background:done?C.accentDim:C.accent,color:done?C.accent:"#000",border:done?`1px solid ${C.accent}`:"none",...M,fontSize:small?10:11,fontWeight:700,cursor:"pointer",transition:"all 0.12s",display:"inline-flex",alignItems:"center",gap:5}}>
      {done?<><CheckIco color={C.accent}/> COPIED</>:<><CopyIco color={small?C.accent:"#000"}/> COPY</>}
    </button>
  );
}

// FIX #4a: Fixed min-width so "Saved" state doesn't cause layout shift
function SaveBtn({onSave}){
  const [done,setDone]=useState(false);
  const go=()=>{onSave();setDone(true);setTimeout(()=>setDone(false),2000);};
  return(
    <button type="button" onClick={go} style={{padding:"4px 10px",borderRadius:7,background:done?C.accentDim:"transparent",color:done?C.accent:C.muted,border:`1px solid ${done?C.accent:C.border}`,...M,fontSize:10,cursor:"pointer",transition:"color 0.15s, background 0.15s, border 0.15s",display:"inline-flex",alignItems:"center",gap:4,minWidth:64,justifyContent:"center"}}>
      {done?<><CheckIco color={C.accent} size={10}/> SAVED</>:"SAVE"}
    </button>
  );
}

function NavTab({label,active,onClick}){
  return(
    <button type="button" onClick={onClick} style={{padding:"6px 14px",borderRadius:7,...M,fontSize:10,textTransform:"uppercase",letterSpacing:"0.05em",border:`1px solid ${active?C.accent:C.border}`,background:active?C.accent:"transparent",color:active?"#000":C.muted,cursor:"pointer",transition:"all 0.12s",whiteSpace:"nowrap"}}>
      {label}
    </button>
  );
}

function ModeBtn({label,desc,active,onClick}){
  return(
    <button type="button" onClick={onClick} style={{padding:"9px 12px",borderRadius:9,textAlign:"left",border:`1px solid ${active?C.accent:C.border}`,background:active?C.accentDim:"#0d0d0d",cursor:"pointer",flex:1,transition:"all 0.12s",minWidth:0}}>
      <div style={{...M,fontSize:11,color:active?C.accent:C.sub}}>{label}</div>
      <div style={{...M,fontSize:9,color:C.muted,marginTop:2}}>{desc}</div>
    </button>
  );
}

function ModelPill({model,active,onClick}){
  return(
    <button type="button" onClick={onClick} style={{padding:"5px 11px",borderRadius:999,border:`1px solid ${active?model.color:C.border}`,background:active?`${model.color}15`:"transparent",color:active?model.color:C.muted,...M,fontSize:11,cursor:"pointer",transition:"all 0.12s",whiteSpace:"nowrap",display:"inline-flex",alignItems:"center",gap:5,height:30}}>
      <ModelLogo modelId={model.id} size={14}/>
      {model.label}
    </button>
  );
}

function ToastLayer({toasts}){
  return(
    <div style={{position:"fixed",top:82,right:16,zIndex:1200,display:"flex",flexDirection:"column",gap:10,pointerEvents:"none"}}>
      {toasts.map((t)=>(
        <div key={t.id} style={{minWidth:220,maxWidth:320,padding:"10px 12px",borderRadius:12,border:`1px solid ${t.tone==="danger"?"rgba(255,90,95,0.35)":t.tone==="success"?"rgba(184,255,71,0.35)":C.border}`,background:t.tone==="danger"?"rgba(36,8,10,0.96)":t.tone==="success"?"rgba(10,18,0,0.96)":"rgba(18,18,18,0.96)",boxShadow:"0 14px 40px rgba(0,0,0,0.35)",animation:"toastIn .2s ease-out"}}>
          <div style={{...M,fontSize:10,color:t.tone==="danger"?C.red:t.tone==="success"?C.accent:C.sub,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:4}}>{t.title}</div>
          <div style={{fontSize:13,color:C.text,lineHeight:1.4}}>{t.message}</div>
        </div>
      ))}
    </div>
  );
}

// FIX #7: ConfirmModal — centered on mobile, dropdown-attached on desktop
function ConfirmModal({open,title,message,onCancel,onConfirm,anchorRef}){
  const [pos,setPos]=useState(null);
  useEffect(()=>{
    if(open&&anchorRef?.current){
      const rect=anchorRef.current.getBoundingClientRect();
      setPos({top:rect.bottom+window.scrollY+6,right:window.innerWidth-rect.right});
    } else {
      setPos(null);
    }
  },[open,anchorRef]);
  if(!open)return null;
  // Desktop: anchored dropdown; Mobile: centered overlay
  const isDesktop=typeof window!=="undefined"&&window.innerWidth>640;
  const modalStyle=isDesktop&&pos
    ?{position:"absolute",top:pos.top,right:pos.right,width:260,background:C.card,border:`1px solid ${C.border}`,borderRadius:12,boxShadow:"0 12px 40px rgba(0,0,0,0.6)",padding:14,zIndex:1300}
    :{position:"fixed",inset:0,display:"flex",alignItems:"center",justifyContent:"center",padding:18,zIndex:1300};
  if(isDesktop&&pos){
    return(
      <div style={{position:"fixed",inset:0,zIndex:1290}} onClick={onCancel}>
        <div style={modalStyle} onClick={e=>e.stopPropagation()}>
          <div style={{...M,fontSize:11,color:C.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{title}</div>
          <div style={{color:C.text,fontSize:13,lineHeight:1.5,marginBottom:14}}>{message}</div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button type="button" onClick={onCancel} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.green}`,background:"rgba(88,210,106,0.08)",color:C.green,...M,fontSize:10,cursor:"pointer"}}>Cancel</button>
            <button type="button" onClick={onConfirm} style={{padding:"8px 12px",borderRadius:8,border:`1px solid ${C.red}`,background:C.red,color:"#fff",...M,fontSize:10,cursor:"pointer"}}>Delete</button>
          </div>
        </div>
      </div>
    );
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.42)",display:"flex",alignItems:"center",justifyContent:"center",padding:18,zIndex:1300}}>
      <div style={{width:"min(100%, 360px)",background:C.card,border:`1px solid ${C.border}`,borderRadius:16,boxShadow:"0 20px 60px rgba(0,0,0,0.45)",padding:16}}>
        <div style={{...M,fontSize:11,color:C.red,textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:8}}>{title}</div>
        <div style={{color:C.text,fontSize:14,lineHeight:1.5,marginBottom:16}}>{message}</div>
        <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button type="button" onClick={onCancel} style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${C.green}`,background:"rgba(88,210,106,0.08)",color:C.green,...M,fontSize:11,cursor:"pointer"}}>Cancel</button>
          <button type="button" onClick={onConfirm} style={{padding:"10px 14px",borderRadius:10,border:`1px solid ${C.red}`,background:C.red,color:"#fff",...M,fontSize:11,cursor:"pointer"}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

function DropZone({imageData,onFile,onRequestClear}){
  const [drag,setDrag]=useState(false);
  const ref=useRef();
  const drop=(e)=>{e.preventDefault();setDrag(false);const f=e.dataTransfer.files[0];if(f)onFile(f);};
  return(
    <div>
      <div onClick={()=>ref.current?.click()} onDragOver={(e)=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={drop}
        style={{border:`2px dashed ${drag?C.accent:imageData?"#2a3800":"#222"}`,borderRadius:14,background:drag?C.accentDim:imageData?"#0a1200":"#0d0d0d",cursor:"pointer",overflow:"hidden",minHeight:imageData?"auto":160,display:"flex",alignItems:"center",justifyContent:"center",position:"relative"}}>
        {imageData?(
          <>
            <img src={imageData.dataUrl} alt="" style={{width:"100%",display:"block",maxHeight:260,objectFit:"cover"}}/>
            <div style={{position:"absolute",top:8,right:8,background:"rgba(0,0,0,0.82)",borderRadius:6,padding:"3px 8px",...M,fontSize:10,color:C.accent,display:"flex",alignItems:"center",gap:4}}><CheckIco color={C.accent} size={10}/> LOADED</div>
          </>
        ):(
          <div style={{textAlign:"center",padding:"20px 16px"}}>
            <div style={{fontSize:44,marginBottom:8,lineHeight:1}}>⬆️</div>
            <div style={{...M,fontSize:11,color:"#666"}}>Drop image or tap to upload</div>
            <div style={{...M,fontSize:10,color:"#333",marginTop:4}}>JPG / PNG / WEBP</div>
          </div>
        )}
      </div>
      <input ref={ref} type="file" accept="image/*" style={{display:"none"}} onChange={(e)=>e.target.files?.[0]&&onFile(e.target.files[0])}/>
      {imageData&&<button type="button" onClick={onRequestClear} style={{marginTop:8,background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"5px 10px",...M,fontSize:10,cursor:"pointer"}}>Remove image</button>}
    </div>
  );
}

// FIX #5a: ModelGuide shown after each output box
function ModelGuide({modelId}){
  const model=MODELS.find((m)=>m.id===modelId);
  if(!model)return null;
  return(
    <div style={{marginTop:8,background:"#090d00",border:"1px solid #1e2800",borderRadius:10,padding:"8px 12px",display:"flex",alignItems:"center",gap:10}}>
      <ModelLogo modelId={model.id} size={16}/>
      <div>
        <div style={{...M,fontSize:10,color:model.color}}>{model.label}</div>
        <div style={{...M,fontSize:9,color:"#3a5000",marginTop:1}}>{model.settings}</div>
      </div>
    </div>
  );
}

function PromptSection({section,modelId,onSave,onCopied}){
  const model=MODELS.find((m)=>m.id===modelId);
  return(
    <div style={{background:"#0d0d0d",border:`1px solid ${section.kind==="negative"?"rgba(255,90,95,0.2)":C.border}`,borderRadius:12,padding:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8,marginBottom:10,flexWrap:"wrap"}}>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center"}}>
          <span style={{...M,fontSize:9,color:section.kind==="negative"?C.red:C.accent,border:`1px solid ${section.kind==="negative"?C.red:C.accent}`,padding:"1px 6px",borderRadius:4,textTransform:"uppercase"}}>{section.label}</span>
          <span style={{...M,fontSize:9,color:model?.color||C.sub,border:"1px solid currentColor",padding:"1px 6px",borderRadius:4}}>{model?.label||modelId}</span>
          <span style={{...M,fontSize:9,color:C.muted}}>{countWords(section.text)} words</span>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <CopyBtn text={section.text} small onCopied={onCopied}/>
          <SaveBtn onSave={onSave}/>
        </div>
      </div>
      <div style={{whiteSpace:"pre-wrap",...M,fontSize:11,color:section.kind==="negative"?"#c9c9c9":C.text,lineHeight:1.75}}>{section.text}</div>
    </div>
  );
}

function PromptBox({entry,onRemoveRequest,onSave,onCopied,anchorRef}){
  const model=MODELS.find((m)=>m.id===entry.modelId);
  const sections=normalizeSections(entry);
  return(
    <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,padding:14,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:12,marginBottom:12}}>
        <div style={{display:"flex",gap:10,alignItems:"center",minWidth:0}}>
          <ModelLogo modelId={entry.modelId} size={18}/>
          <div>
            <div style={{...M,fontSize:11,color:model?.color||C.text}}>{model?.label||entry.modelId}</div>
            <div style={{...M,fontSize:9,color:C.muted,marginTop:2}}>{entry.mode==="lora"?"LoRA Swap":"Exact Clone"} · Output #{entry.index||entry.id}</div>
          </div>
        </div>
        <button type="button" ref={anchorRef} onClick={onRemoveRequest} style={{background:"transparent",border:`1px solid rgba(255,90,95,0.18)`,borderRadius:10,width:34,height:34,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
          <TrashIco color={C.red} size={14}/>
        </button>
      </div>
      <div style={{display:"grid",gap:10}}>
        {sections.map((section,idx)=>(
          <PromptSection key={`${entry.id}-${section.kind}-${idx}`} section={section} modelId={entry.modelId} onSave={onSave} onCopied={onCopied}/>
        ))}
      </div>
      {/* FIX #5a: Model guide at end of output box */}
      <ModelGuide modelId={entry.modelId}/>
    </div>
  );
}

// FIX #6: Scroll-to-top FAB
function ScrollTopBtn(){
  const [visible,setVisible]=useState(false);
  useEffect(()=>{
    const onScroll=()=>setVisible(window.scrollY>300);
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  if(!visible)return null;
  return(
    <button type="button" onClick={()=>window.scrollTo({top:0,behavior:"smooth"})}
      style={{position:"fixed",bottom:24,right:20,zIndex:1100,width:40,height:40,borderRadius:"50%",background:C.card,border:`1px solid ${C.border}`,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",boxShadow:"0 4px 20px rgba(0,0,0,0.5)",transition:"opacity 0.2s",opacity:0.85}}>
      <ChevUp color={C.accent} size={16}/>
    </button>
  );
}

export default function Page(){
  const [tab,setTab]=useState("single");
  const [provider,setProvider]=useState("anthropic");
  const [apiKeys,setApiKeys]=useState({anthropic:"",openai:"",gemini:""});
  const [keyVisible,setKeyVisible]=useState(false);
  const [aiModel,setAiModel]=useState("claude-sonnet-4-20250514");
  const [targetModel,setTargetModel]=useState("zimage_turbo");
  const [mode,setMode]=useState("exact");
  const [loraWord,setLoraWord]=useState(LORA_TRIGGER);
  const [singleImg,setSingleImg]=useState(null);
  // FIX #4b: store captured image reference per output entry for save
  const singleImgRef=useRef(null);
  const [outputs,setOutputs]=useState([]);
  const [singleLoading,setSingleLoading]=useState(false);
  const [singleError,setSingleError]=useState("");
  const [batchImgs,setBatchImgs]=useState([]);
  const [batchResults,setBatchResults]=useState([]);
  const [batchLoading,setBatchLoading]=useState(false);
  const [batchProgress,setBatchProgress]=useState(0);
  const [batchStatus,setBatchStatus]=useState("");
  const [saved,setSaved]=useState([]);
  const [toasts,setToasts]=useState([]);
  const [confirmState,setConfirmState]=useState({open:false,title:"",message:"",action:null,payload:null,anchorRef:null});
  const outputCounter=useRef(0);
  // refs map for anchoring confirm modals to trash buttons
  const trashRefs=useRef({});

  const pushToast=useCallback((title,message,tone="neutral")=>{const id=Date.now()+Math.random();setToasts((p)=>[...p,{id,title,message,tone}]);setTimeout(()=>setToasts((p)=>p.filter((t)=>t.id!==id)),2200);},[]);

  useEffect(()=>{
    try{
      const keys=JSON.parse(localStorage.getItem("skye_keys")||"{}");
      const lora=localStorage.getItem("skye_lora")||LORA_TRIGGER;
      const prov=localStorage.getItem("skye_provider")||"anthropic";
      const sv=JSON.parse(localStorage.getItem("skye_saved")||"[]");
      if(Object.keys(keys).length)setApiKeys((p)=>({...p,...keys}));
      setLoraWord(lora);setProvider(prov);setSaved(sv);
      const mm=AI_MODELS[prov];if(mm)setAiModel(mm[0].id);
    }catch{}
  },[]);

  useEffect(()=>{const link=document.querySelector("link[rel='icon']")||document.createElement("link");link.rel="icon";link.href=`https://drive.google.com/thumbnail?id=${faviconId}&sz=w128`;document.head.appendChild(link);},[]);

  const persistKeys=(u)=>{setApiKeys(u);localStorage.setItem("skye_keys",JSON.stringify(u));};
  const persistLora=(l)=>{setLoraWord(l);localStorage.setItem("skye_lora",l);};
  const persistProvider=(p)=>{setProvider(p);localStorage.setItem("skye_provider",p);const mm=AI_MODELS[p];if(mm)setAiModel(mm[0].id);};

  const activeModel=MODELS.find((m)=>m.id===targetModel)||MODELS[0];
  const currentKey=apiKeys[provider]||"";
  const providerInfo=PROVIDERS.find((p)=>p.id===provider)||PROVIDERS[0];

  // FIX #4b: build saved entry always captures image at time of generation
  const buildSavedEntry=(entry,thumbUrl,fallbackProvider=provider)=>({
    id:Date.now()+Math.random(),
    model:MODELS.find((m)=>m.id===entry.modelId)?.label||entry.modelId,
    modelId:entry.modelId,
    mode:entry.mode,
    prompt:entry.prompt,
    sections:normalizeSections(entry),
    thumb:thumbUrl,
    provider:fallbackProvider
  });

  const saveEntryIfNeeded=(candidate)=>{
    const sig=serializeSections(candidate.sections);
    const exists=saved.some((i)=>i.modelId===candidate.modelId&&i.mode===candidate.mode&&serializeSections(normalizeSections(i))===sig);
    if(exists){pushToast("Already saved","This prompt is already in your saved list.","neutral");return "duplicate";}
    const updated=[candidate,...saved];setSaved(updated);localStorage.setItem("skye_saved",JSON.stringify(updated));
    pushToast("Saved","Prompt added to your saved tab.","success");
    return "saved";
  };

  const callAnalyze=useCallback(async(imgData)=>{
    if(!currentKey.trim())throw new Error("Enter your API key above.");
    const res=await fetch("/api/analyze",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({imageBase64:imgData.base64,mediaType:imgData.mediaType,mode,modelId:targetModel,loraWord,apiKey:currentKey.trim(),aiModel,provider})});
    const data=await res.json();
    if(!res.ok||data.error)throw new Error(data.error||"Analysis failed");
    const result=data.result||{};
    const sections=normalizeSections({...result,modelId:targetModel});
    return{prompt:result.prompt||sections[0]?.text||"",analysis:result.analysis||null,sections};
  },[currentKey,mode,targetModel,loraWord,aiModel,provider]);

  const askConfirm=(title,message,action,payload=null,anchorRef=null)=>setConfirmState({open:true,title,message,action,payload,anchorRef});
  const closeConfirm=()=>setConfirmState({open:false,title:"",message:"",action:null,payload:null,anchorRef:null});
  const handleConfirm=()=>{
    const{action,payload}=confirmState;
    if(action==="removeOutput"){setOutputs((p)=>p.filter((o)=>o.id!==payload));pushToast("Removed","Output box deleted.","danger");}
    else if(action==="clearOutputs"){setOutputs([]);pushToast("Cleared","All output boxes removed.","danger");}
    else if(action==="clearSingleImage"){setSingleImg(null);singleImgRef.current=null;setSingleError("");pushToast("Removed","Reference image removed.","danger");}
    else if(action==="removeSaved"){const updated=saved.filter((x)=>x.id!==payload);setSaved(updated);localStorage.setItem("skye_saved",JSON.stringify(updated));pushToast("Deleted","Saved prompt deleted.","danger");}
    else if(action==="clearSaved"){setSaved([]);localStorage.removeItem("skye_saved");pushToast("Cleared","Saved prompts cleared.","danger");}
    else if(action==="clearBatchImgs"){setBatchImgs([]);setBatchResults([]);pushToast("Cleared","Batch images cleared.","danger");}
    closeConfirm();
  };

  const runSingle=async()=>{
    if(!singleImg)return;
    setSingleLoading(true);setSingleError("");
    outputCounter.current+=1;
    const idx=outputCounter.current;
    // FIX #4b: snapshot the image at generation time so save always has it
    const capturedImg=singleImg;
    setOutputs((p)=>[{id:idx,index:idx,loading:true,modelId:targetModel,mode,_capturedImg:capturedImg},...p]);
    try{
      const{prompt,analysis,sections}=await callAnalyze(capturedImg);
      setOutputs((p)=>p.map((o)=>o.id===idx?{...o,loading:false,prompt,analysis,sections,_capturedImg:capturedImg}:o));
      pushToast("Generated",supportsNegative(targetModel)?"Positive and negative prompts are ready.":"Prompt generated successfully.","success");
    }catch(err){
      setSingleError(err.message);setOutputs((p)=>p.filter((o)=>o.id!==idx));
    }finally{setSingleLoading(false);}
  };

  const handleBatchFiles=async(files)=>{
    const arr=Array.from(files||[]).slice(0,10);
    const loaded=await Promise.all(arr.map(readFile));
    setBatchImgs(loaded);setBatchResults([]);
    if(loaded.length)pushToast("Upload complete",`${loaded.length} image${loaded.length>1?"s":""} ready for batch analysis.`,"success");
  };

  const runBatch=async()=>{
    if(!batchImgs.length)return;setBatchLoading(true);setBatchResults([]);setBatchProgress(0);
    const results=[];
    for(let i=0;i<batchImgs.length;i+=1){
      setBatchStatus(`Analyzing ${i+1} of ${batchImgs.length}...`);
      setBatchProgress(Math.round(i/batchImgs.length*100));
      try{
        const{prompt,analysis,sections}=await callAnalyze(batchImgs[i]);
        results.push({img:batchImgs[i],prompt,sections,analysis,index:i+1,error:null,modelId:targetModel,mode});
      }catch(err){
        results.push({img:batchImgs[i],prompt:null,sections:[],analysis:null,index:i+1,error:err.message,modelId:targetModel,mode});
      }
      setBatchResults([...results]);
      if(i<batchImgs.length-1)await new Promise((r)=>setTimeout(r,450));
    }
    setBatchProgress(100);setBatchStatus(`Done · ${results.filter((r)=>!r.error).length}/${batchImgs.length} succeeded`);
    setBatchLoading(false);
    pushToast("Batch complete","Batch analysis finished.","success");
  };

  // ── CONFIG BAR ──────────────────────────────────────────────────────────────
  // FIX #1: Desktop full-width bg, children constrained. FIX #2: Mobile inline mode/pills. FIX #3a,c: padding, dropdown icon padding. FIX #3b: label "Analysis Model"
  const configBar=(
    <div style={{borderBottom:`1px solid ${C.border}`,background:C.surface,width:"100%",boxSizing:"border-box"}}>
      <div style={{maxWidth:1480,margin:"0 auto",padding:"14px 20px",display:"grid",gap:14}}>

        {/* Provider */}
        <div>
          <span style={labelStyle}>AI Provider</span>
          {/* FIX #1: constrain select on desktop */}
          <div style={{maxWidth:320}}>
            <div style={{position:"relative"}}>
              <select value={provider} onChange={(e)=>persistProvider(e.target.value)} style={{...selectStyle,paddingLeft:12,paddingRight:32}}>
                {PROVIDERS.map((p)=><option key={p.id} value={p.id}>{p.label}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* API Key - FIX #3c: eye icon is icon-only on single page */}
        <div>
          <span style={labelStyle}>API Key ({providerInfo.freeCredits})</span>
          <div style={{display:"flex",gap:0,maxWidth:520,background:"#0a0a0a",border:`1px solid ${C.border}`,borderRadius:10,overflow:"hidden"}}>
            <input type={keyVisible?"text":"password"} value={currentKey} onChange={(e)=>persistKeys({...apiKeys,[provider]:e.target.value})} placeholder={providerInfo.keyPlaceholder} style={{...inputStyle,border:"none",borderRadius:0,flex:1}}/>
            <EyeToggle visible={keyVisible} onToggle={()=>setKeyVisible(!keyVisible)} iconOnly/>
          </div>
        </div>

        {/* Analysis Model — FIX #3b: label restored */}
        <div>
          <span style={labelStyle}>Analysis Model</span>
          <div style={{maxWidth:360}}>
            <select value={aiModel} onChange={(e)=>setAiModel(e.target.value)} style={{...selectStyle,paddingLeft:12,paddingRight:32}}>
              {(AI_MODELS[provider]||[]).map((m)=><option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
          </div>
        </div>

        {/* Mode — FIX #2: flex row, wraps nicely on mobile */}
        <div>
          <span style={labelStyle}>Mode</span>
          {/* On mobile flex wraps; on desktop side by side, max 520 */}
          <div className="modeRow" style={{display:"flex",gap:8,maxWidth:520}}>
            <ModeBtn label="🎯 Exact Clone" desc="full replication" active={mode==="exact"} onClick={()=>setMode("exact")}/>
            <ModeBtn label="✨ LoRA Swap" desc={`${loraWord} replaces subject`} active={mode==="lora"} onClick={()=>setMode("lora")}/>
          </div>
        </div>

        {/* Optimize for — FIX #2: flex wrap pills inline */}
        <div>
          <span style={labelStyle}>Optimize for</span>
          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
            {MODELS.map((m)=><ModelPill key={m.id} model={m} active={targetModel===m.id} onClick={()=>setTargetModel(m.id)}/>)}
          </div>
        </div>

      </div>
    </div>
  );

  return(
    <div style={{background:C.bg,minHeight:"100vh",color:C.text,fontFamily:"'DM Sans', sans-serif"}}>
      <ToastLayer toasts={toasts}/>
      <ConfirmModal
        open={confirmState.open}
        title={confirmState.title}
        message={confirmState.message}
        onCancel={closeConfirm}
        onConfirm={handleConfirm}
        anchorRef={confirmState.anchorRef}
      />
      <ScrollTopBtn/>

      {/* HEADER */}
      <div style={{position:"sticky",top:0,zIndex:100,background:"rgba(8,8,8,0.96)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"12px 16px",width:"100%",boxSizing:"border-box"}}>
        <div style={{maxWidth:1480,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
          <div>
            <div style={{...M,fontSize:13,fontWeight:700,color:C.accent,letterSpacing:"0.1em"}}>SKYE PROMPT ENGINE</div>
            <div style={{...M,fontSize:9,color:C.muted,marginTop:2}}>AI-POWERED · IMAGE → PERFECT PROMPT · LORA READY</div>
          </div>
          <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
            {["single","batch","saved","settings"].map((t)=>(
              <NavTab key={t} label={t==="saved"?`Saved${saved.length>0?` (${saved.length})`:""}`:`${t.charAt(0).toUpperCase()}${t.slice(1)}`} active={tab===t} onClick={()=>setTab(t)}/>
            ))}
          </div>
        </div>
      </div>

      {(tab==="single"||tab==="batch")&&configBar}

      {/* ── SINGLE TAB ── */}
      {tab==="single"&&(
        <div className="workspaceGrid" style={{display:"grid",gridTemplateColumns:"minmax(340px, 430px) minmax(0, 1fr)",maxWidth:1480,margin:"0 auto",padding:"18px 20px",gap:18,alignItems:"start"}}>
          {/* Left panel */}
          <div>
            {/* FIX #1: same left margin as configBar (maxWidth 1480, padding 20px) */}
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:14}}>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Reference Image</div>
              <div style={{padding:12}}>
                <DropZone imageData={singleImg}
                  onFile={async(f)=>{const d=await readFile(f);setSingleImg(d);singleImgRef.current=d;setSingleError("");pushToast("Image uploaded","Reference image loaded successfully.","success");}}
                  onRequestClear={()=>askConfirm("Remove image","Delete the currently loaded reference image?","clearSingleImage")}/>
              </div>
            </div>

            {mode==="lora"&&(
              <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:14}}>
                <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>LoRA Settings</div>
                <div style={{padding:12}}>
                  <div style={{marginBottom:10}}><span style={labelStyle}>Trigger Word</span><input type="text" value={loraWord} onChange={(e)=>persistLora(e.target.value)} style={inputStyle}/></div>
                  <div style={{background:"#0a1200",border:"1px solid #2a3800",borderRadius:10,padding:"10px 12px",...M,fontSize:10,color:"#7a9a40",lineHeight:1.8}}>
                    <strong style={{color:C.accent}}>{loraWord}</strong> replaces subject only<br/>Scene, lighting, outfit, and pose stay locked<br/>Drift protection: ON
                  </div>
                </div>
              </div>
            )}

            <div style={{background:"#090d00",border:"1px solid #1e2800",borderRadius:12,padding:"10px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <ModelLogo modelId={activeModel.id} size={18}/>
              <div>
                <div style={{...M,fontSize:11,color:activeModel.color}}>{activeModel.label}</div>
                <div style={{...M,fontSize:9,color:C.muted,marginTop:1}}>{activeModel.settings}</div>
              </div>
            </div>

            <button type="button" onClick={runSingle} disabled={!singleImg||singleLoading}
              style={{width:"100%",padding:14,background:(!singleImg||singleLoading)?"#1a1a1a":C.accent,color:(!singleImg||singleLoading)?C.muted:"#000",border:"none",borderRadius:12,...M,fontSize:13,fontWeight:700,cursor:singleImg&&!singleLoading?"pointer":"not-allowed",letterSpacing:"0.05em",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <SearchIco color={(!singleImg||singleLoading)?C.muted:"#000"} size={15}/>
              {singleLoading?"ANALYZING...":"ANALYZE AND GENERATE"}
            </button>
            {singleError&&<div style={{marginTop:10,background:"#1a0000",border:"1px solid #440000",borderRadius:10,padding:10,...M,fontSize:11,color:"#ff6666",lineHeight:1.6}}>{singleError}</div>}
          </div>

          {/* Right panel — outputs */}
          <div>
            {outputs.length>0&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,gap:8,flexWrap:"wrap"}}>
                <span style={{...M,fontSize:10,color:C.muted}}>{outputs.length} output{outputs.length!==1?"s":""}</span>
                {/* FIX #3e: text-only "Clear all" button, no icon */}
                <button type="button" onClick={()=>askConfirm("Clear outputs","Delete every generated output box in this panel?","clearOutputs")}
                  style={{...M,fontSize:10,color:C.red,background:"none",border:`1px solid rgba(255,90,95,0.2)`,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>
                  Clear all
                </button>
              </div>
            )}
            {outputs.length===0&&!singleLoading&&(
              <div style={{textAlign:"center",padding:"100px 20px",color:C.muted,border:`1px dashed ${C.border}`,borderRadius:14,background:"rgba(255,255,255,0.01)"}}>
                <div style={{fontSize:52,marginBottom:12}}>🖼️</div>
                <div style={{...M,fontSize:11,color:"#444"}}>Upload a reference image, then hit Analyze</div>
                <div style={{...M,fontSize:10,color:"#252525",marginTop:8,lineHeight:1.9}}>Each click adds a new output box.<br/>Switch models between runs to compare.<br/>The loaded image stays until you remove it.</div>
              </div>
            )}
            {outputs.map((entry)=>{
              const trashRef=trashRefs.current[entry.id]||(trashRefs.current[entry.id]={current:null});
              return entry.loading?(
                <div key={entry.id} style={{background:"#090d00",border:"1px solid #1e2800",borderRadius:14,padding:14,marginBottom:14,display:"flex",gap:10,alignItems:"center"}}>
                  <ModelLogo modelId={entry.modelId} size={16}/>
                  <div style={{display:"flex",gap:5}}>{[0,1,2].map((i)=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:C.accent,animation:`dot 1.2s ${i*0.2}s infinite`}}/>)}</div>
                  <span style={{...M,fontSize:11,color:C.muted}}>Analyzing...</span>
                </div>
              ):(
                <PromptBox
                  key={entry.id}
                  entry={entry}
                  anchorRef={trashRef}
                  onRemoveRequest={()=>askConfirm("Delete output","Delete this generated output box?","removeOutput",entry.id,trashRef)}
                  // FIX #4b: always save with captured image, not current singleImg
                  onSave={()=>saveEntryIfNeeded(buildSavedEntry(entry,entry._capturedImg?.dataUrl))}
                  onCopied={()=>pushToast("Copied","Prompt copied to clipboard.","success")}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── BATCH TAB — FIX #5b: restored upload + output sections ── */}
      {tab==="batch"&&(
        <div className="workspaceGrid" style={{display:"grid",gridTemplateColumns:"minmax(300px, 380px) minmax(0,1fr)",maxWidth:1480,margin:"0 auto",padding:"18px 20px",gap:18,alignItems:"start"}}>
          {/* Left — upload */}
          <div>
            <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:14}}>
              <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase",letterSpacing:"0.1em"}}>Upload Images (max 10)</div>
              <div style={{padding:12}}>
                {/* Batch drop zone with original stacked-images icon */}
                <div onClick={()=>document.getElementById("file-batch")?.click()}
                  onDragOver={(e)=>e.preventDefault()}
                  onDrop={async(e)=>{e.preventDefault();await handleBatchFiles(e.dataTransfer.files);}}
                  style={{border:"2px dashed #222",borderRadius:12,background:"#0d0d0d",cursor:"pointer",minHeight:120,display:"flex",alignItems:"center",justifyContent:"center",padding:16,textAlign:"center",transition:"border-color 0.15s"}}>
                  <div>
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" style={{display:"block",margin:"0 auto 10px"}}>
                      <rect x="2" y="16" width="32" height="24" rx="5" fill="#111" stroke="#2a2a2a" strokeWidth="1.2"/>
                      <rect x="8" y="10" width="32" height="24" rx="5" fill="#151515" stroke="#242424" strokeWidth="1.2"/>
                      <rect x="14" y="4" width="32" height="24" rx="5" fill="#1a1a1a" stroke="#2e2e2e" strokeWidth="1.2"/>
                      <circle cx="30" cy="16" r="4" fill="#111" stroke={C.accent} strokeWidth="1" opacity="0.4"/>
                      <polyline points="16,25 22,19 27,24 33,17 44,25" stroke={C.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity="0.4"/>
                    </svg>
                    <div style={{...M,fontSize:11,color:"#555"}}>Drop up to 10 images</div>
                    <div style={{...M,fontSize:10,color:"#333",marginTop:4}}>JPG / PNG / WEBP</div>
                  </div>
                </div>
                <input type="file" id="file-batch" accept="image/*" multiple style={{display:"none"}} onChange={(e)=>handleBatchFiles(e.target.files)}/>

                {batchImgs.length>0&&(
                  <div style={{marginTop:12}}>
                    <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:5}}>
                      {batchImgs.map((img,i)=>{
                        const res=batchResults[i];
                        return(
                          <div key={i} style={{position:"relative",borderRadius:6,overflow:"hidden",aspectRatio:"1",border:`1px solid ${C.border}`}}>
                            <img src={img.dataUrl} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                            <div style={{position:"absolute",top:2,left:2,background:"rgba(0,0,0,0.85)",borderRadius:3,...M,fontSize:8,color:C.accent,padding:"1px 4px"}}>{i+1}</div>
                            {res&&<div style={{position:"absolute",bottom:3,right:3}}>{res.error?<span style={{color:C.red,fontSize:10}}>✗</span>:<CheckIco color={C.accent} size={11}/>}</div>}
                          </div>
                        );
                      })}
                    </div>
                    <button type="button" onClick={()=>askConfirm("Clear images","Remove all uploaded batch images?","clearBatchImgs")}
                      style={{marginTop:8,background:"none",border:`1px solid ${C.border}`,color:C.muted,borderRadius:8,padding:"5px 10px",...M,fontSize:10,cursor:"pointer"}}>
                      Clear images
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Active model strip */}
            <div style={{background:"#090d00",border:"1px solid #1e2800",borderRadius:12,padding:"10px 12px",marginBottom:14,display:"flex",alignItems:"center",gap:10}}>
              <ModelLogo modelId={activeModel.id} size={18}/>
              <div>
                <div style={{...M,fontSize:11,color:activeModel.color}}>{activeModel.label}</div>
                <div style={{...M,fontSize:9,color:C.muted,marginTop:1}}>{activeModel.settings}</div>
              </div>
            </div>

            <button type="button" onClick={runBatch} disabled={batchImgs.length===0||batchLoading}
              style={{width:"100%",padding:14,background:batchImgs.length===0||batchLoading?"#1a1a1a":C.accent,color:batchImgs.length===0||batchLoading?C.muted:"#000",border:"none",borderRadius:12,...M,fontSize:13,fontWeight:700,cursor:batchImgs.length>0&&!batchLoading?"pointer":"not-allowed",letterSpacing:"0.05em",display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              <SearchIco color={batchImgs.length===0||batchLoading?C.muted:"#000"} size={15}/>
              {batchLoading?batchStatus:`ANALYZE ALL (${batchImgs.length})`}
            </button>
            {batchLoading&&(
              <div style={{marginTop:8,height:4,background:"#111",borderRadius:4,overflow:"hidden"}}>
                <div style={{height:"100%",background:C.accent,borderRadius:4,width:`${batchProgress}%`,transition:"width 0.3s"}}/>
              </div>
            )}
            {!batchLoading&&batchStatus&&<div style={{marginTop:8,...M,fontSize:10,color:C.accent,textAlign:"center"}}>{batchStatus}</div>}
          </div>

          {/* Right — outputs */}
          <div>
            {batchResults.length===0&&!batchLoading&&(
              <div style={{textAlign:"center",padding:"100px 20px",color:C.muted,border:`1px dashed ${C.border}`,borderRadius:14,background:"rgba(255,255,255,0.01)"}}>
                <div style={{fontSize:52,marginBottom:12}}>🖼️</div>
                <div style={{...M,fontSize:11,color:"#444"}}>Upload images then click Analyze All</div>
                <div style={{...M,fontSize:10,color:"#252525",marginTop:8,lineHeight:1.9}}>Results appear here as each image is analyzed.<br/>Switch models in the config bar between batches.</div>
              </div>
            )}
            {batchResults.map((item)=>(
              <div key={item.index} style={{marginBottom:20}}>
                <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                  <span style={{...M,fontSize:11,color:"#000",background:item.error?C.red:C.accent,padding:"3px 10px",borderRadius:5,fontWeight:700}}>IMAGE {item.index}</span>
                  <img src={item.img.dataUrl} alt="" style={{width:32,height:32,objectFit:"cover",borderRadius:5,border:`1px solid ${C.border}`}}/>
                </div>
                {item.error?(
                  <div style={{background:"#1a0000",border:"1px solid #440000",borderRadius:10,padding:10,...M,fontSize:11,color:"#ff6666"}}>{item.error}</div>
                ):(
                  <>
                    <PromptBox
                      entry={{...item,id:item.index}}
                      onRemoveRequest={()=>{}}
                      onSave={()=>saveEntryIfNeeded(buildSavedEntry({...item,id:item.index},item.img?.dataUrl))}
                      onCopied={()=>pushToast("Copied","Prompt copied to clipboard.","success")}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SAVED TAB ── */}
      {tab==="saved"&&(
        <div style={{maxWidth:980,margin:"0 auto",padding:20}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,gap:8,flexWrap:"wrap"}}>
            <span style={{...M,fontSize:11,color:C.muted,textTransform:"uppercase"}}>{saved.length} saved</span>
            {saved.length>0&&(
              <button type="button" onClick={()=>askConfirm("Clear saved","Delete every saved prompt from this tab?","clearSaved")}
                style={{...M,fontSize:10,color:C.red,background:"none",border:`1px solid rgba(255,90,95,0.2)`,borderRadius:8,padding:"6px 10px",cursor:"pointer"}}>
                Clear all
              </button>
            )}
          </div>
          {saved.length===0?(
            <div style={{textAlign:"center",padding:"60px 20px",...M,fontSize:12,color:"#333"}}>No saved prompts yet.</div>
          ):saved.map((p)=>{
            const m=MODELS.find((x)=>x.id===p.modelId||x.label===p.model);
            const sections=normalizeSections(p);
            return(
              <div key={p.id} style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,display:"flex",gap:12,padding:14,marginBottom:12,alignItems:"flex-start"}}>
                {p.thumb&&<img src={p.thumb} alt="" style={{width:64,height:64,objectFit:"cover",borderRadius:8,flexShrink:0,border:`1px solid ${C.border}`}}/>}
                <div style={{flex:1,minWidth:0}}>
                  <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap",alignItems:"center"}}>
                    <span style={{...M,fontSize:9,color:m?.color||"#fff",border:"1px solid currentColor",padding:"1px 6px",borderRadius:4}}>{p.model}</span>
                    <span style={{...M,fontSize:9,color:p.mode==="lora"?C.accent:"#47b8ff",border:"1px solid currentColor",padding:"1px 6px",borderRadius:4}}>{p.mode?.toUpperCase()}</span>
                    <button type="button" onClick={()=>askConfirm("Delete saved prompt","Delete this saved prompt?","removeSaved",p.id)}
                      style={{marginLeft:"auto",background:"transparent",border:`1px solid rgba(255,90,95,0.18)`,borderRadius:10,width:34,height:34,display:"inline-flex",alignItems:"center",justifyContent:"center",cursor:"pointer"}}>
                      <TrashIco color={C.red} size={13}/>
                    </button>
                  </div>
                  <div style={{display:"grid",gap:8}}>
                    {sections.map((section,i)=>(
                      <div key={`${p.id}-${i}`} style={{background:"#0d0d0d",border:`1px solid ${C.border}`,borderRadius:10,padding:10}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,marginBottom:8,flexWrap:"wrap"}}>
                          <div style={{display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                            <span style={{...M,fontSize:9,color:section.kind==="negative"?C.red:C.accent,border:`1px solid ${section.kind==="negative"?C.red:C.accent}`,padding:"1px 6px",borderRadius:4}}>{section.label}</span>
                            <span style={{...M,fontSize:9,color:C.muted}}>{countWords(section.text)} words</span>
                          </div>
                          <CopyBtn text={section.text} small onCopied={()=>pushToast("Copied","Prompt copied to clipboard.","success")}/>
                        </div>
                        <div style={{...M,fontSize:11,color:"#777",lineHeight:1.6}}>{section.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── SETTINGS TAB ── */}
      {tab==="settings"&&(
        <div style={{maxWidth:700,margin:"0 auto",padding:20}}>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:12}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <span>API Keys</span>
              {/* Settings page keeps styled EyeToggle */}
              <EyeToggle visible={keyVisible} onToggle={()=>setKeyVisible(!keyVisible)} small/>
            </div>
            <div style={{padding:14}}>
              {PROVIDERS.map((p)=>(
                <div key={p.id} style={{marginBottom:14}}>
                  <span style={labelStyle}>{p.label} — {p.freeCredits}</span>
                  <div style={{display:"flex",gap:8}}>
                    <input type={keyVisible?"text":"password"} value={apiKeys[p.id]||""} onChange={(e)=>persistKeys({...apiKeys,[p.id]:e.target.value})} placeholder={p.keyPlaceholder} style={{...inputStyle,flex:1}}/>
                    <a href={p.keyLink} target="_blank" rel="noopener noreferrer" style={{padding:"0 12px",borderRadius:10,background:"#111",border:`1px solid ${C.border}`,color:C.muted,fontSize:10,display:"flex",alignItems:"center",gap:4,textDecoration:"none",...M,whiteSpace:"nowrap"}}>Get Key <ChevR color={C.muted} size={10}/></a>
                  </div>
                </div>
              ))}
              <div style={{...M,fontSize:10,color:"#2a2a2a"}}>Keys stored in browser only</div>
            </div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:12}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase"}}>LoRA Settings</div>
            <div style={{padding:14}}>
              <span style={labelStyle}>Default Trigger Word</span>
              <input type="text" value={loraWord} onChange={(e)=>persistLora(e.target.value)} placeholder="skyeewmn" style={inputStyle}/>
            </div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14,marginBottom:12}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase"}}>Model Reference</div>
            <div style={{padding:14,display:"flex",flexDirection:"column",gap:8}}>
              {MODELS.map((m)=>(
                <div key={m.id} style={{display:"flex",gap:12,alignItems:"center",background:"#0d0d0d",borderRadius:10,padding:"10px 12px",border:`1px solid ${C.border}`}}>
                  <ModelLogo modelId={m.id} size={20}/>
                  <div>
                    <div style={{...M,fontSize:11,color:m.color}}>{m.label}</div>
                    <div style={{...M,fontSize:9,color:C.muted,marginTop:2}}>{m.settings}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div style={{background:C.card,border:`1px solid ${C.border}`,borderRadius:14}}>
            <div style={{padding:"10px 14px",borderBottom:`1px solid ${C.border}`,...M,fontSize:10,color:C.muted,textTransform:"uppercase"}}>Provider Guide</div>
            <div style={{padding:14,...M,fontSize:11,color:C.sub,lineHeight:1.9}}>
              <strong style={{color:C.accent}}>Anthropic Claude</strong> — Best accuracy. console.anthropic.com<br/>
              <strong style={{color:"#47b8ff"}}>OpenAI GPT-4o</strong> — Strong vision. platform.openai.com<br/>
              <strong style={{color:"#ffaa47"}}>Google Gemini Flash</strong> — Free tier. Use for batch to save Claude credits. aistudio.google.com
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes dot{0%,100%{opacity:.2;transform:scale(.8)}50%{opacity:1;transform:scale(1)}}
        @keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        /* Desktop: side-by-side workspace */
        @media (min-width:981px){
          .workspaceGrid{grid-template-columns:minmax(340px,430px) minmax(0,1fr) !important;}
        }
        /* Tablet: collapse to single column */
        @media (max-width:980px){
          .workspaceGrid{grid-template-columns:1fr !important;}
        }
        /* Mobile: mode buttons and pills inline */
        @media (max-width:640px){
          .modeRow{flex-wrap:wrap;}
          .modeRow > button{flex:1 1 calc(50% - 4px);min-width:0;}
        }
      `}</style>
    </div>
  );
}
