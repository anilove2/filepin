import { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

// ── SUPABASE ──────────────────────────────────────────────────────────────────
const SUPABASE_URL  = "https://ylkskjjzkyydeqgvyuop.supabase.co";
const SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsa3Nramp6a3l5ZGVxZ3Z5dW9wIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc2Mzk3MTcsImV4cCI6MjA5MzIxNTcxN30.eC1gnIASNR-40RBUB3B567-EnhaIfkECcKGMzRTjGVU";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// ── THEME ─────────────────────────────────────────────────────────────────────
const T = {
  dark: {
    bg: "#070c14", surface: "#0d1526", surfaceAlt: "#111d35",
    border: "#1a2a45", borderHover: "#2a4a7a",
    text: "#e8f0ff", textSub: "#4a6090", textMuted: "#2a3a55",
    accent: "#3b82f6", accentGlow: "rgba(59,130,246,0.18)", accentSoft: "rgba(59,130,246,0.10)",
    danger: "#ef4444", success: "#22c55e",
    navBg: "rgba(7,12,20,0.85)", shadow: "0 0 60px rgba(59,130,246,0.08)",
    gridColor: "rgba(59,130,246,0.04)", inputBg: "#060b12", pill: "#0d1526",
  },
  light: {
    bg: "#f0f4ff", surface: "#ffffff", surfaceAlt: "#f5f8ff",
    border: "#d0daf5", borderHover: "#93b4f0",
    text: "#0f1d3a", textSub: "#6080b0", textMuted: "#b0c0df",
    accent: "#2563eb", accentGlow: "rgba(37,99,235,0.12)", accentSoft: "rgba(37,99,235,0.08)",
    danger: "#dc2626", success: "#16a34a",
    navBg: "rgba(240,244,255,0.88)", shadow: "0 4px 40px rgba(37,99,235,0.08)",
    gridColor: "rgba(37,99,235,0.04)", inputBg: "#f8faff", pill: "#eef2ff",
  },
};

const FILE_COLORS = { pdf:"#ef4444", image:"#3b82f6", zip:"#f59e0b", sheet:"#22c55e", file:"#8b5cf6" };
const FILE_ICONS  = { pdf:"PDF", image:"IMG", zip:"ZIP", sheet:"XLS", file:"FILE" };

function getFileType(ext) {
  if (ext === "pdf") return "pdf";
  if (["png","jpg","jpeg","gif","webp"].includes(ext)) return "image";
  if (ext === "zip") return "zip";
  if (["xlsx","xls","csv"].includes(ext)) return "sheet";
  return "file";
}

// ── SHARED UI ─────────────────────────────────────────────────────────────────
function Logo({ t, size = 22 }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:9 }}>
      <svg width={size+6} height={size+6} viewBox="0 0 28 28" fill="none">
        <rect x="2" y="2" width="24" height="24" rx="6" fill={t.accent} opacity="0.15"/>
        <rect x="2" y="2" width="24" height="24" rx="6" stroke={t.accent} strokeWidth="1.5"/>
        <path d="M9 14.5L12.5 18L19 11" stroke={t.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <span style={{ fontSize:size, fontWeight:800, color:t.text, letterSpacing:-0.8, fontFamily:"'Playfair Display',Georgia,serif" }}>
        File<span style={{ color:t.accent }}>PIN</span>
      </span>
    </div>
  );
}

function ThemeToggle({ dark, onToggle, t }) {
  return (
    <button onClick={onToggle} style={{ background:t.surfaceAlt, border:`1px solid ${t.border}`, borderRadius:20, padding:"7px 14px", cursor:"pointer", fontSize:13, color:t.textSub, display:"inline-flex", alignItems:"center", justifyContent:"center", gap:6, lineHeight:1, whiteSpace:"nowrap" }}>
      <span style={{ fontSize:14, lineHeight:1, display:"flex", alignItems:"center" }}>{dark?"☀️":"🌙"}</span>
      <span style={{ lineHeight:1 }}>{dark?"Light":"Dark"}</span>
    </button>
  );
}

function LogoutBtn({ onLogout, t }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onLogout} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} title="Logout"
      style={{ background:hov?t.danger+"18":"transparent", border:`1px solid ${hov?t.danger+"60":t.border}`, color:hov?t.danger:t.textSub, borderRadius:8, padding:"7px 10px", cursor:"pointer", display:"inline-flex", alignItems:"center", justifyContent:"center", transition:"all 0.2s" }}>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
        <polyline points="16 17 21 12 16 7"/>
        <line x1="21" y1="12" x2="9" y2="12"/>
      </svg>
    </button>
  );
}

function BgGrid({ t }) {
  return (
    <>
      <div style={{ position:"absolute", inset:0, backgroundImage:`linear-gradient(${t.gridColor} 1px,transparent 1px),linear-gradient(90deg,${t.gridColor} 1px,transparent 1px)`, backgroundSize:"48px 48px" }}/>
      <div style={{ position:"absolute", top:"15%", left:"50%", transform:"translateX(-50%)", width:600, height:320, background:`radial-gradient(ellipse,${t.accentGlow} 0%,transparent 70%)`, pointerEvents:"none" }}/>
    </>
  );
}

function FieldInput({ label, type="text", value, onChange, placeholder, t, note }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontSize:11, color:t.textSub, letterSpacing:1.2, textTransform:"uppercase", marginBottom:7, fontFamily:"monospace" }}>{label}</label>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder}
        onFocus={()=>setFocused(true)} onBlur={()=>setFocused(false)}
        style={{ width:"100%", background:t.inputBg, border:`1.5px solid ${focused?t.accent:t.border}`, borderRadius:10, color:t.text, fontSize:15, padding:"13px 16px", outline:"none", boxSizing:"border-box", fontFamily:"monospace", transition:"border-color 0.2s", boxShadow:focused?`0 0 0 3px ${t.accentGlow}`:"none" }}/>
      {note && <p style={{ color:t.textMuted, fontSize:11, fontFamily:"monospace", marginTop:5 }}>{note}</p>}
    </div>
  );
}

function PrimaryBtn({ children, onClick, disabled, t }) {
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ width:"100%", background:disabled?t.textMuted:t.accent, color:"#fff", border:"none", borderRadius:10, padding:"14px", fontSize:15, fontWeight:700, cursor:disabled?"not-allowed":"pointer", fontFamily:"'Playfair Display',Georgia,serif", boxShadow:disabled?"none":`0 4px 20px ${t.accentGlow}`, transition:"all 0.2s" }}>
      {children}
    </button>
  );
}

function ErrBox({ msg, t }) {
  if (!msg) return null;
  return <div style={{ background:`${t.danger}15`, border:`1px solid ${t.danger}40`, borderRadius:8, padding:"10px 14px", color:t.danger, fontSize:13, marginBottom:16, fontFamily:"monospace" }}>⚠ {msg}</div>;
}

// ── LOGIN ─────────────────────────────────────────────────────────────────────
function LoginPage({ onLogin, onGoSignup, onForgot, dark, onToggle }) {
  const t = dark ? T.dark : T.light;
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err,  setErr]  = useState("");
  const [loading, setLoading] = useState(false);

  async function login() {
    setErr(""); setLoading(true);
    // username → look up email from profiles
    const { data: profile, error: pe } = await supabase
      .from("profiles").select("id").eq("username", user.toLowerCase()).single();
    if (pe || !profile) { setErr("Username not found."); setLoading(false); return; }

    // get email from auth — we stored it at signup as email = username@filepin.io
    const email = `${user.toLowerCase()}@filepin.internal`;
    const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
    if (error) { setErr("Incorrect password."); setLoading(false); return; }
    onLogin(data.user);
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", transition:"background 0.3s", padding:20 }}>
      <BgGrid t={t}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 32px", zIndex:2 }}>
        <Logo t={t}/><ThemeToggle dark={dark} onToggle={onToggle} t={t}/>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:20, padding:"44px 40px", width:"100%", maxWidth:420, position:"relative", zIndex:1, boxShadow:t.shadow, marginTop:48 }}>
        <div style={{ marginBottom:6 }}><Logo t={t} size={20}/></div>
        <p style={{ color:t.textSub, fontSize:13, fontFamily:"monospace", marginBottom:28 }}>Sign in to manage your files</p>
        <FieldInput label="Username" value={user} onChange={e=>setUser(e.target.value)} placeholder="e.g. john" t={t}/>
        <FieldInput label="Password" type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" t={t}/>
        <div style={{ display:"flex", justifyContent:"flex-end", marginTop:-10, marginBottom:20 }}>
          <button onClick={onForgot} style={{ background:"none", border:"none", color:t.accent, fontSize:12, cursor:"pointer", fontFamily:"monospace" }}>Forgot password?</button>
        </div>
        <ErrBox msg={err} t={t}/>
        <PrimaryBtn onClick={login} disabled={loading} t={t}>{loading?"Signing in…":"Sign In →"}</PrimaryBtn>
        <div style={{ borderTop:`1px solid ${t.border}`, marginTop:22, paddingTop:20, textAlign:"center" }}>
          <span style={{ color:t.textSub, fontSize:14, fontFamily:"monospace" }}>Don't have an account? </span>
          <button onClick={onGoSignup} style={{ background:"none", border:"none", color:t.accent, fontSize:14, cursor:"pointer", fontFamily:"monospace", fontWeight:700 }}>Sign Up →</button>
        </div>
      </div>
    </div>
  );
}

// ── SIGNUP ────────────────────────────────────────────────────────────────────
function SignupPage({ onSignup, onGoLogin, dark, onToggle }) {
  const t = dark ? T.dark : T.light;
  const [form, setForm] = useState({ name:"", username:"", email:"", password:"", confirm:"" });
  const [err, setErr]   = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  function validate() {
    if (!form.name.trim())                      return "Full name is required.";
    if (form.username.length < 3)               return "Username must be at least 3 characters.";
    if (!/^[a-z0-9_]+$/i.test(form.username))  return "Username: letters, numbers, underscores only.";
    if (!form.email.includes("@"))              return "Enter a valid email address.";
    if (form.password.length < 6)               return "Password must be at least 6 characters.";
    if (form.password !== form.confirm)         return "Passwords do not match.";
    return null;
  }

  async function handleSignup() {
    const e = validate(); if (e) { setErr(e); return; }
    setErr(""); setLoading(true);

    // Check username taken
    const { data: existing } = await supabase.from("profiles").select("id").eq("username", form.username.toLowerCase()).single();
    if (existing) { setErr("Username already taken. Choose another."); setLoading(false); return; }

    // Sign up — use internal email pattern
    const internalEmail = `${form.username.toLowerCase()}@filepin.internal`;
    const { data, error } = await supabase.auth.signUp({
      email: internalEmail,
      password: form.password,
      options: { data: { display_name: form.name, username: form.username.toLowerCase(), real_email: form.email } }
    });
    if (error) { setErr(error.message); setLoading(false); return; }

    // Insert profile
    await supabase.from("profiles").insert({
      id: data.user.id,
      username: form.username.toLowerCase(),
      display_name: form.name,
    });

    setLoading(false); setDone(true);
    setTimeout(() => onSignup(data.user, { username: form.username.toLowerCase(), displayName: form.name }), 1800);
  }

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", transition:"background 0.3s", padding:"20px 16px" }}>
      <BgGrid t={t}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 32px", zIndex:2 }}>
        <Logo t={t}/><ThemeToggle dark={dark} onToggle={onToggle} t={t}/>
      </div>
      {done ? (
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:20, padding:"52px 40px", maxWidth:400, width:"100%", textAlign:"center", position:"relative", zIndex:1, boxShadow:t.shadow }}>
          <div style={{ width:68, height:68, borderRadius:"50%", background:t.success+"20", border:`2px solid ${t.success}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:30, margin:"0 auto 20px" }}>✓</div>
          <h2 style={{ color:t.text, fontSize:22, fontWeight:800, margin:"0 0 8px", fontFamily:"'Playfair Display',Georgia,serif" }}>Account Created!</h2>
          <p style={{ color:t.textSub, fontSize:14, fontFamily:"monospace" }}>Welcome, {form.name}! Taking you to your dashboard…</p>
        </div>
      ) : (
        <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:20, padding:"44px 40px", width:"100%", maxWidth:440, position:"relative", zIndex:1, boxShadow:t.shadow, marginTop:60 }}>
          <h2 style={{ color:t.text, fontSize:24, fontWeight:800, margin:"0 0 4px", fontFamily:"'Playfair Display',Georgia,serif" }}>Create your account</h2>
          <p style={{ color:t.textSub, fontSize:13, fontFamily:"monospace", marginBottom:28 }}>Start sharing files with PIN-protected links</p>
          <div style={{ display:"flex", gap:6, marginBottom:28 }}>
            {["Profile","Username","Security"].map((s,i)=>(
              <div key={s} style={{ flex:1, textAlign:"center" }}>
                <div style={{ height:3, borderRadius:2, background:i===0?t.accent:i===1?t.accent+"80":t.border, marginBottom:5 }}/>
                <span style={{ fontSize:10, color:i===0?t.accent:t.textMuted, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:0.8 }}>{s}</span>
              </div>
            ))}
          </div>
          <FieldInput label="Full Name" value={form.name} onChange={set("name")} placeholder="e.g. John Doe" t={t}/>
          <FieldInput label="Username" value={form.username} onChange={set("username")} placeholder="e.g. john" t={t} note="Your files will be at filepin.io/username/..."/>
          <FieldInput label="Email Address" type="email" value={form.email} onChange={set("email")} placeholder="you@example.com" t={t}/>
          <FieldInput label="Password" type="password" value={form.password} onChange={set("password")} placeholder="Min 6 characters" t={t}/>
          <FieldInput label="Confirm Password" type="password" value={form.confirm} onChange={set("confirm")} placeholder="Repeat password" t={t}/>
          {form.password.length > 0 && (
            <div style={{ marginTop:-10, marginBottom:18 }}>
              <div style={{ display:"flex", gap:4, marginBottom:4 }}>
                {[1,2,3,4].map(i=>(
                  <div key={i} style={{ flex:1, height:3, borderRadius:2, background:form.password.length>=i*3?(form.password.length>=10?t.success:t.accent):t.border, transition:"background 0.3s" }}/>
                ))}
              </div>
              <span style={{ fontSize:11, fontFamily:"monospace", color:form.password.length>=10?t.success:form.password.length>=6?t.accent:t.danger }}>
                {form.password.length>=10?"Strong password ✓":form.password.length>=6?"Good password":"Too short"}
              </span>
            </div>
          )}
          {form.username.length >= 3 && (
            <div style={{ background:t.accentSoft, border:`1px solid ${t.accent}30`, borderRadius:9, padding:"10px 14px", marginBottom:18, fontFamily:"monospace", fontSize:12 }}>
              <span style={{ color:t.textSub }}>Your link: </span>
              <span style={{ color:t.accent }}>filepin.io/<b>{form.username.toLowerCase()}</b>/...</span>
            </div>
          )}
          <ErrBox msg={err} t={t}/>
          <PrimaryBtn onClick={handleSignup} disabled={loading} t={t}>{loading?"Creating account…":"Create Account →"}</PrimaryBtn>
          <p style={{ color:t.textMuted, fontSize:11, fontFamily:"monospace", textAlign:"center", marginTop:14, lineHeight:1.6 }}>By signing up you agree to our Terms of Service and Privacy Policy.</p>
          <div style={{ borderTop:`1px solid ${t.border}`, marginTop:22, paddingTop:20, textAlign:"center" }}>
            <span style={{ color:t.textSub, fontSize:14, fontFamily:"monospace" }}>Already have an account? </span>
            <button onClick={onGoLogin} style={{ background:"none", border:"none", color:t.accent, fontSize:14, cursor:"pointer", fontFamily:"monospace", fontWeight:700 }}>Sign In →</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── FORGOT PASSWORD ───────────────────────────────────────────────────────────
function ForgotPage({ onBack, dark, onToggle }) {
  const t = dark ? T.dark : T.light;
  const [email, setEmail] = useState("");
  const [sent, setSent]   = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  async function handleSend() {
    if (!email.includes("@")) return;
    setLoading(true); setErr("");
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });
    setLoading(false);
    if (error) { setErr(error.message); return; }
    setSent(true);
  }

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", transition:"background 0.3s", padding:20 }}>
      <BgGrid t={t}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"18px 32px", zIndex:2 }}>
        <Logo t={t}/><ThemeToggle dark={dark} onToggle={onToggle} t={t}/>
      </div>
      <div style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:20, padding:"44px 40px", width:"100%", maxWidth:420, position:"relative", zIndex:1, boxShadow:t.shadow }}>
        {sent ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:64, height:64, borderRadius:"50%", background:t.accent+"18", border:`2px solid ${t.accent}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:26, margin:"0 auto 20px" }}>📧</div>
            <h2 style={{ color:t.text, fontSize:22, fontWeight:800, margin:"0 0 10px", fontFamily:"'Playfair Display',Georgia,serif" }}>Check your email</h2>
            <p style={{ color:t.textSub, fontSize:14, fontFamily:"monospace", lineHeight:1.7, marginBottom:28 }}>We sent a reset link to<br/><b style={{ color:t.text }}>{email}</b></p>
            <button onClick={onBack} style={{ background:t.accent, color:"#fff", border:"none", borderRadius:10, padding:"12px 28px", fontSize:14, fontWeight:700, cursor:"pointer", width:"100%" }}>← Back to Sign In</button>
          </div>
        ) : (
          <>
            <h2 style={{ color:t.text, fontSize:24, fontWeight:800, margin:"0 0 6px", fontFamily:"'Playfair Display',Georgia,serif" }}>Forgot Password</h2>
            <p style={{ color:t.textSub, fontSize:13, fontFamily:"monospace", marginBottom:28 }}>Enter your email and we'll send a reset link</p>
            <FieldInput label="Email Address" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@example.com" t={t}/>
            <ErrBox msg={err} t={t}/>
            <PrimaryBtn onClick={handleSend} disabled={loading||!email.includes("@")} t={t}>{loading?"Sending…":"Send Reset Link →"}</PrimaryBtn>
            <div style={{ textAlign:"center", marginTop:20 }}>
              <button onClick={onBack} style={{ background:"none", border:"none", color:t.textSub, fontSize:13, cursor:"pointer", fontFamily:"monospace" }}>← Back to Sign In</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── UPLOAD MODAL ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUpload, t, userId, username }) {
  const [pin, setPin]   = useState("");
  const [file, setFile] = useState(null);
  const [drag, setDrag] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]   = useState("");
  const ref = useRef();

  async function doUpload() {
    if (!file || pin.length < 4) return;
    setLoading(true); setErr("");
    const ext  = file.name.split(".").pop().toLowerCase();
    const type = getFileType(ext);
    const path = `${userId}/${Date.now()}_${file.name}`;

    const { error: upErr } = await supabase.storage.from("files").upload(path, file);
    if (upErr) { setErr("Upload failed: " + upErr.message); setLoading(false); return; }

    const sizeLabel = file.size > 1048576 ? (file.size/1048576).toFixed(1)+" MB" : Math.round(file.size/1024)+" KB";
    const { data, error: dbErr } = await supabase.from("files").insert({
      user_id: userId, username, name: file.name,
      storage_path: path, size: sizeLabel, type, pin, downloads: 0,
    }).select().single();

    if (dbErr) { setErr("DB error: " + dbErr.message); setLoading(false); return; }
    onUpload(data);
    setLoading(false);
    onClose();
  }

  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:200, backdropFilter:"blur(4px)" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:t.surface, border:`1px solid ${t.border}`, borderRadius:20, padding:"36px 32px", width:"100%", maxWidth:420, boxShadow:t.shadow }}>
        <h3 style={{ color:t.text, fontSize:20, fontWeight:700, margin:"0 0 24px", fontFamily:"'Playfair Display',Georgia,serif" }}>Upload File</h3>
        <div onClick={()=>ref.current.click()} onDragOver={e=>{e.preventDefault();setDrag(true);}} onDragLeave={()=>setDrag(false)} onDrop={e=>{e.preventDefault();setDrag(false);setFile(e.dataTransfer.files[0]);}}
          style={{ border:`2px dashed ${drag?t.accent:t.border}`, borderRadius:12, padding:"36px 20px", textAlign:"center", cursor:"pointer", marginBottom:22, color:t.textSub, fontSize:14, fontFamily:"monospace", background:drag?t.accentSoft:t.surfaceAlt, transition:"all 0.2s" }}>
          <input ref={ref} type="file" style={{display:"none"}} onChange={e=>setFile(e.target.files[0])}/>
          {file?<><div style={{fontSize:28,color:t.success}}>✓</div>{file.name}</>:<><div style={{fontSize:28,marginBottom:8}}>↑</div>Drop file here or click</>}
        </div>
        <label style={{ display:"block", fontSize:11, color:t.textSub, letterSpacing:1.2, textTransform:"uppercase", marginBottom:7, fontFamily:"monospace" }}>Access PIN (4–8 digits)</label>
        <input style={{ width:"100%", background:t.inputBg, border:`1.5px solid ${t.border}`, borderRadius:10, color:t.text, fontSize:15, padding:"12px 14px", outline:"none", boxSizing:"border-box", fontFamily:"monospace", marginBottom:8 }}
          placeholder="e.g. 1234" maxLength={8} value={pin} onChange={e=>setPin(e.target.value.replace(/\D/g,""))}/>
        <p style={{ color:t.textSub, fontSize:12, fontFamily:"monospace", marginBottom:16 }}>Anyone with your link needs this PIN to access the file.</p>
        <ErrBox msg={err} t={t}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{ flex:1, background:"transparent", border:`1px solid ${t.border}`, color:t.textSub, borderRadius:10, padding:12, fontSize:14, cursor:"pointer" }}>Cancel</button>
          <button onClick={doUpload} disabled={loading||!file||pin.length<4}
            style={{ flex:2, background:(!file||pin.length<4||loading)?t.textMuted:t.accent, color:"#fff", border:"none", borderRadius:10, padding:12, fontSize:14, fontWeight:700, cursor:"pointer", transition:"background 0.2s" }}>
            {loading?"Uploading…":"Upload →"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ authUser, profile, onLogout, dark, onToggle }) {
  const t = dark ? T.dark : T.light;
  const [files, setFiles]       = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [showUpload, setShowUpload]     = useState(false);
  const [copied, setCopied]     = useState(null);
  const [showPin, setShowPin]   = useState({});
  const [delConfirm, setDelConfirm]     = useState(null);
  const [hover, setHover]       = useState(null);

  useEffect(() => { fetchFiles(); }, []);

  async function fetchFiles() {
    setLoadingFiles(true);
    const { data } = await supabase.from("files").select("*").eq("user_id", authUser.id).order("created_at", { ascending: false });
    setFiles(data || []);
    setLoadingFiles(false);
  }

  async function deleteFile(f) {
    await supabase.storage.from("files").remove([f.storage_path]);
    await supabase.from("files").delete().eq("id", f.id);
    setFiles(p => p.filter(x => x.id !== f.id));
    setDelConfirm(null);
  }

  function copyLink(f) {
    const url = `${window.location.origin}?u=${profile.username}&f=${encodeURIComponent(f.name)}`;
    navigator.clipboard?.writeText(url);
    setCopied(f.id); setTimeout(()=>setCopied(null), 2000);
  }

  function openFile(f) {
    const url = `${window.location.origin}?u=${profile.username}&f=${encodeURIComponent(f.name)}`;
    window.open(url, "_blank");
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Playfair Display',Georgia,serif", transition:"background 0.3s" }}>
      {showUpload && <UploadModal onClose={()=>setShowUpload(false)} onUpload={f=>setFiles(p=>[f,...p])} t={t} userId={authUser.id} username={profile.username}/>}

      <nav style={{ position:"sticky", top:0, zIndex:100, background:t.navBg, backdropFilter:"blur(12px)", borderBottom:`1px solid ${t.border}`, padding:"14px 32px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Logo t={t}/>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <ThemeToggle dark={dark} onToggle={onToggle} t={t}/>
          <div style={{display:"flex",alignItems:"center",gap:8,background:t.pill,border:`1px solid ${t.border}`,borderRadius:20,padding:"6px 14px"}}>
            <div style={{width:26,height:26,borderRadius:"50%",background:t.accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:700,flexShrink:0}}>{profile.displayName[0]}</div>
            <span style={{color:t.text,fontSize:14,whiteSpace:"nowrap"}}>@{profile.username}</span>
          </div>
          <LogoutBtn onLogout={onLogout} t={t}/>
        </div>
      </nav>

      <div style={{maxWidth:1000,margin:"0 auto",padding:"40px 24px"}}>
        <div style={{marginBottom:28}}>
          <h1 style={{color:t.text,fontSize:30,fontWeight:700,margin:0,letterSpacing:-0.8}}>Hello, {profile.displayName} 👋</h1>
          <p style={{color:t.textSub,fontSize:14,marginTop:6,fontFamily:"monospace"}}>Your files are publicly accessible via PIN-protected links</p>
        </div>

        {/* Stats + Upload row */}
        <div style={{display:"flex",gap:14,marginBottom:28,flexWrap:"wrap",alignItems:"stretch"}}>
          <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 22px",flex:1,minWidth:140}}>
            <div style={{color:t.textSub,fontSize:11,letterSpacing:1,textTransform:"uppercase",fontFamily:"monospace",marginBottom:4}}>Total Files</div>
            <div style={{color:t.text,fontSize:22,fontWeight:700}}>{files.length}</div>
          </div>
          <button onClick={()=>setShowUpload(true)}
            style={{background:t.accent,border:"none",borderRadius:12,padding:"16px 28px",flex:1,minWidth:140,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:10,boxShadow:`0 4px 20px ${t.accentGlow}`}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
            </svg>
            <span style={{color:"#fff",fontSize:16,fontWeight:700,fontFamily:"'Playfair Display',Georgia,serif"}}>Upload File</span>
          </button>
        </div>

        <div style={{background:t.accentSoft,border:`1px solid ${t.accent}30`,borderRadius:12,padding:"13px 20px",marginBottom:28,fontFamily:"monospace",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
          <span style={{color:t.textSub,fontSize:12}}>PUBLIC LINK FORMAT</span>
          <span style={{color:t.accent,fontSize:14}}>filepin.io/?u=<b>{profile.username}</b>&f=filename.pdf</span>
        </div>

        {loadingFiles ? (
          <div style={{textAlign:"center",padding:"60px 20px",color:t.textSub,fontFamily:"monospace"}}>Loading your files…</div>
        ) : files.length === 0 ? (
          <div style={{textAlign:"center",padding:"80px 20px",color:t.textSub}}>
            <div style={{fontSize:48}}>📭</div>
            <p style={{fontFamily:"monospace",marginTop:12}}>No files yet. Upload your first file!</p>
          </div>
        ) : (
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {files.map(f=>(
              <div key={f.id} onMouseEnter={()=>setHover(f.id)} onMouseLeave={()=>setHover(null)}
                style={{background:t.surface,border:`1.5px solid ${hover===f.id?t.borderHover:t.border}`,borderRadius:14,padding:20,position:"relative",transition:"all 0.2s",boxShadow:hover===f.id?`0 8px 30px ${t.accentGlow}`:"none"}}>
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14}}>
                  <div style={{background:FILE_COLORS[f.type]+"18",color:FILE_COLORS[f.type],border:`1px solid ${FILE_COLORS[f.type]}35`,fontSize:11,fontWeight:700,padding:"3px 10px",borderRadius:6,fontFamily:"monospace",letterSpacing:1}}>{FILE_ICONS[f.type]||"FILE"}</div>
                  <button onClick={()=>setDelConfirm(f.id)} style={{background:"none",border:"none",color:t.textMuted,fontSize:16,cursor:"pointer",lineHeight:1}}>✕</button>
                </div>
                <p style={{color:t.text,fontSize:15,fontWeight:700,margin:"0 0 4px",wordBreak:"break-all"}}>{f.name}</p>
                <p style={{color:t.textSub,fontSize:12,fontFamily:"monospace",margin:"0 0 14px"}}>{f.size} · {formatDate(f.created_at)} · {f.downloads} dl</p>
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,background:t.surfaceAlt,borderRadius:8,padding:"8px 12px"}}>
                  <span style={{color:t.textSub,fontSize:12,fontFamily:"monospace"}}>PIN:</span>
                  <span style={{color:t.text,fontFamily:"monospace",fontSize:14,letterSpacing:3,flex:1}}>{showPin[f.id]?f.pin:"••••"}</span>
                  <button onClick={()=>setShowPin(p=>({...p,[f.id]:!p[f.id]}))} style={{background:"none",border:`1px solid ${t.border}`,color:t.textSub,borderRadius:5,padding:"2px 8px",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>{showPin[f.id]?"Hide":"Show"}</button>
                </div>
                <div style={{display:"flex",gap:8}}>
                  <button onClick={()=>copyLink(f)} style={{flex:1,background:copied===f.id?t.success+"20":t.surfaceAlt,border:`1px solid ${copied===f.id?t.success+"40":t.border}`,color:copied===f.id?t.success:t.textSub,borderRadius:8,padding:"9px 6px",fontSize:12,cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s",whiteSpace:"nowrap"}}>
                    {copied===f.id?"✓ Copied!":"⎘ Copy Link"}
                  </button>
                  <button onClick={()=>openFile(f)} title="Open in new tab"
                    style={{background:t.accentSoft,border:`1px solid ${t.accent}30`,color:t.accent,borderRadius:8,padding:"9px 12px",fontSize:13,cursor:"pointer",display:"flex",alignItems:"center",gap:5,whiteSpace:"nowrap"}}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                      <polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>
                    </svg>
                    Open
                  </button>
                </div>
                {delConfirm===f.id&&(
                  <div style={{position:"absolute",inset:0,background:dark?"rgba(7,12,20,0.96)":"rgba(255,255,255,0.96)",borderRadius:14,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:12,backdropFilter:"blur(2px)"}}>
                    <p style={{color:t.text,fontFamily:"monospace",fontSize:14,margin:0}}>Delete this file?</p>
                    <div style={{display:"flex",gap:10}}>
                      <button onClick={()=>deleteFile(f)} style={{background:t.danger,color:"#fff",border:"none",borderRadius:8,padding:"8px 18px",cursor:"pointer",fontSize:13}}>Delete</button>
                      <button onClick={()=>setDelConfirm(null)} style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,color:t.textSub,borderRadius:8,padding:"8px 18px",cursor:"pointer",fontSize:13}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── PUBLIC FILE PAGE ──────────────────────────────────────────────────────────
function PublicPage({ username, filename, onBack, dark, onToggle }) {
  const t = dark ? T.dark : T.light;
  const [file, setFile]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin]     = useState("");
  const [stage, setStage] = useState("enter");
  const [dlUrl, setDlUrl] = useState(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from("files")
        .select("*").eq("username", username).eq("name", filename).single();
      setFile(data || null);
      setLoading(false);
    }
    load();
  }, [username, filename]);

  async function tryPin() {
    if (!file) return;
    if (pin !== file.pin) {
      setStage("wrong");
      setTimeout(()=>{ setStage("enter"); setPin(""); }, 900);
      return;
    }
    // Get signed download URL
    const { data } = await supabase.storage.from("files").createSignedUrl(file.storage_path, 60);
    setDlUrl(data?.signedUrl || null);
    // Increment downloads
    await supabase.rpc("increment_downloads", { file_id: file.id });
    setStage("granted");
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  return (
    <div style={{minHeight:"100vh",background:t.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:20,transition:"background 0.3s",position:"relative",overflow:"hidden"}}>
      <BgGrid t={t}/>
      <div style={{position:"absolute",top:16,right:24,zIndex:10}}><ThemeToggle dark={dark} onToggle={onToggle} t={t}/></div>
      <div style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:"40px 36px",width:"100%",maxWidth:380,boxShadow:t.shadow,position:"relative",zIndex:1,textAlign:"center"}}>
        <div style={{display:"flex",justifyContent:"center",marginBottom:28}}><Logo t={t}/></div>

        {loading ? (
          <p style={{color:t.textSub,fontFamily:"monospace"}}>Loading file…</p>
        ) : !file ? (
          <p style={{color:t.danger,fontFamily:"monospace"}}>File not found or has been removed.</p>
        ) : (
          <>
            <div style={{background:t.surfaceAlt,border:`1px solid ${t.border}`,borderRadius:12,padding:"16px 18px",marginBottom:28,textAlign:"left"}}>
              <div style={{background:FILE_COLORS[file.type]+"18",color:FILE_COLORS[file.type],border:`1px solid ${FILE_COLORS[file.type]}35`,fontSize:10,fontWeight:700,padding:"2px 8px",borderRadius:5,fontFamily:"monospace",display:"inline-block",marginBottom:10}}>{FILE_ICONS[file.type]||"FILE"}</div>
              <p style={{color:t.text,fontSize:16,fontWeight:700,margin:"0 0 4px",wordBreak:"break-all"}}>{file.name}</p>
              <p style={{color:t.textSub,fontSize:12,fontFamily:"monospace",margin:0}}>Shared by <b>@{username}</b> · {file.size} · {file.downloads} dl</p>
            </div>

            {stage==="granted" ? (
              <div style={{padding:"20px 0"}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:t.success+"20",border:`2px solid ${t.success}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>✓</div>
                <p style={{color:t.success,fontWeight:700,fontSize:18,margin:"0 0 6px"}}>Access Granted</p>
                <p style={{color:t.textSub,fontSize:13,fontFamily:"monospace",marginBottom:20}}>Your file is ready.</p>
                <a href={dlUrl} download={file.name} target="_blank" rel="noreferrer"
                  style={{display:"block",width:"100%",background:t.accent,color:"#fff",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:700,cursor:"pointer",textDecoration:"none",boxSizing:"border-box"}}>
                  ⬇ Download {file.name}
                </a>
              </div>
            ) : (
              <>
                <p style={{color:t.textSub,fontSize:13,fontFamily:"monospace",marginBottom:20}}>Enter the PIN to access this file</p>
                <div style={{display:"flex",justifyContent:"center",gap:14,marginBottom:8}}>
                  {[0,1,2,3].map(i=>(
                    <div key={i} style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${stage==="wrong"?t.danger:pin.length>i?t.accent:t.border}`,background:pin.length>i?t.accent:"transparent",transition:"all 0.15s"}}/>
                  ))}
                </div>
                {stage==="wrong"&&<p style={{color:t.danger,fontSize:12,fontFamily:"monospace",marginBottom:4}}>Wrong PIN. Try again.</p>}
                <div style={{height:20}}/>
                <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,maxWidth:230,margin:"0 auto 16px"}}>
                  {[1,2,3,4,5,6,7,8,9,"",0,"⌫"].map((k,i)=>(
                    <button key={i} onClick={()=>k!==""&&(k==="⌫"?setPin(p=>p.slice(0,-1)):pin.length<8&&setPin(p=>p+String(k)))}
                      style={{background:k===""?"transparent":t.surfaceAlt,border:`1px solid ${k===""?"transparent":t.border}`,color:t.text,borderRadius:10,padding:"15px",fontSize:18,cursor:k===""?"default":"pointer",fontFamily:"'Playfair Display',Georgia,serif",pointerEvents:k===""?"none":"auto"}}>
                      {k}
                    </button>
                  ))}
                </div>
                <button onClick={tryPin} style={{width:"100%",background:pin.length<4?t.textMuted:t.accent,color:"#fff",border:"none",borderRadius:10,padding:13,fontSize:15,fontWeight:700,cursor:"pointer",boxShadow:pin.length>=4?`0 4px 16px ${t.accentGlow}`:"none",transition:"all 0.2s"}}>Unlock File</button>
              </>
            )}
          </>
        )}
        <button onClick={onBack} style={{background:"none",border:"none",color:t.textSub,fontSize:12,cursor:"pointer",marginTop:20,fontFamily:"monospace"}}>← Back</button>
      </div>
    </div>
  );
}

// ── AUTH CONTEXT ─────────────────────────────────────────────────────────────
function ProtectedRoute({ children, authUser, profile }) {
  if (!authUser || !profile) return <Navigate to="/login" replace />;
  return children;
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [dark, setDark]         = useState(true);
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();
  const toggle = () => setDark(d => !d);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) loadProfile(session.user);
      else setLoading(false);
    });
  }, []);

  async function loadProfile(user) {
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (data) {
      setAuthUser(user);
      setProfile({ username: data.username, displayName: data.display_name });
    }
    setLoading(false);
  }

  async function handleLogin(user) {
    await loadProfile(user);
    navigate("/dashboard");
  }

  async function handleSignup(user, prof) {
    setAuthUser(user);
    setProfile(prof);
    setLoading(false);
    navigate("/dashboard");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setAuthUser(null); setProfile(null);
    navigate("/login");
  }

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#070c14",display:"flex",alignItems:"center",justifyContent:"center",color:"#4a6090",fontFamily:"monospace"}}>
      Loading…
    </div>
  );

  return (
    <>
      <style>{`
        *{box-sizing:border-box;margin:0;padding:0;}
        body{margin:0;}
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;800&display=swap');
      `}</style>
      <Routes>
        <Route path="/login"     element={<LoginPage  onLogin={handleLogin} onGoSignup={()=>navigate("/signup")} onForgot={()=>navigate("/forgot")} dark={dark} onToggle={toggle}/>}/>
        <Route path="/signup"    element={<SignupPage onSignup={handleSignup} onGoLogin={()=>navigate("/login")} dark={dark} onToggle={toggle}/>}/>
        <Route path="/forgot"    element={<ForgotPage onBack={()=>navigate("/login")} dark={dark} onToggle={toggle}/>}/>
        <Route path="/dashboard" element={
          <ProtectedRoute authUser={authUser} profile={profile}>
            <Dashboard authUser={authUser} profile={profile} onLogout={handleLogout} dark={dark} onToggle={toggle}/>
          </ProtectedRoute>
        }/>
        <Route path="/file" element={<PublicFilePage dark={dark} onToggle={toggle}/>}/>
        <Route path="*" element={<Navigate to="/login" replace />}/>
      </Routes>
    </>
  );
}

// ── PUBLIC FILE PAGE WRAPPER (reads URL params) ───────────────────────────────
function PublicFilePage({ dark, onToggle }) {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const username = params.get("u");
  const filename = params.get("f");
  if (!username || !filename) return <Navigate to="/login" replace />;
  return <PublicPage username={username} filename={filename} onBack={()=>navigate("/login")} dark={dark} onToggle={toggle}/>;
}
