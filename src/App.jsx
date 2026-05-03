import { useState, useRef, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
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
    const { data: prof, error: pe } = await supabase
      .from("profiles").select("id, email").eq("username", user.toLowerCase()).single();
    if (pe || !prof) { setErr("Username not found."); setLoading(false); return; }
    const { data, error } = await supabase.auth.signInWithPassword({ email: prof.email, password: pass });
    if (error) { setErr("Incorrect password."); setLoading(false); return; }
    onLogin(data.user);
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", transition:"background 0.3s", padding:20 }}>
      <BgGrid t={t}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", zIndex:2 }}>
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

    // Sign up with real email
    const { data, error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { display_name: form.name, username: form.username.toLowerCase(), real_email: form.email } }
    });
    if (error) { setErr(error.message); setLoading(false); return; }

    await supabase.from("profiles").insert({
      id: data.user.id,
      username: form.username.toLowerCase(),
      display_name: form.name,
      email: form.email,
    });

    setLoading(false); setDone(true);
    setTimeout(() => onSignup(data.user, { username: form.username.toLowerCase(), displayName: form.name }), 1800);
  }

  return (
    <div style={{ minHeight:"100vh", background:t.bg, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden", transition:"background 0.3s", padding:"20px 16px" }}>
      <BgGrid t={t}/>
      <div style={{ position:"absolute", top:0, left:0, right:0, display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 20px", zIndex:2 }}>
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

// ── EXPIRY HELPERS ────────────────────────────────────────────────────────────
const EXPIRY_OPTIONS = [
  { label:"1 Download", value:"1_download", icon:"1️⃣", desc:"Auto-deleted after first download" },
  { label:"24 Hours",   value:"24h",        icon:"⏰", desc:"Deleted after 24 hours" },
  { label:"7 Days",     value:"7d",         icon:"📅", desc:"Deleted after 7 days" },
  { label:"30 Days",    value:"30d",        icon:"🗓️", desc:"Deleted after 30 days" },
  { label:"No Expiry",  value:"none",       icon:"♾️", desc:"Available forever" },
];

function getExpiresAt(value) {
  const now = new Date();
  if (value === "24h")  return new Date(now.getTime() +    24*3600*1000).toISOString();
  if (value === "7d")   return new Date(now.getTime() +  7*24*3600*1000).toISOString();
  if (value === "30d")  return new Date(now.getTime() + 30*24*3600*1000).toISOString();
  return null;
}

function isExpired(f) {
  if (!f) return false;
  if (f.expiry_type === "1_download" && f.downloads >= 1) return true;
  if (f.expires_at && new Date(f.expires_at) < new Date()) return true;
  return false;
}

function expiryBadge(f) {
  if (!f) return { label:"No expiry", color:"#22c55e" };
  if (f.expiry_type === "1_download" && f.downloads >= 1) return { label:"Expired",      color:"#ef4444" };
  if (f.expires_at && new Date(f.expires_at) < new Date()) return { label:"Expired",      color:"#ef4444" };
  if (f.expiry_type === "1_download") return { label:"1 download",  color:"#f59e0b" };
  if (!f.expires_at)                  return { label:"No expiry",   color:"#22c55e" };
  const diff = new Date(f.expires_at) - new Date();
  const days = Math.floor(diff / 86400000);
  const hrs  = Math.floor(diff / 3600000);
  if (days >= 1) return { label:`${days}d left`,    color:"#3b82f6" };
  if (hrs  >= 1) return { label:`${hrs}h left`,     color:"#f59e0b" };
  return           { label:"Expiring soon", color:"#ef4444" };
}

// ── UPLOAD MODAL ──────────────────────────────────────────────────────────────
function UploadModal({ onClose, onUpload, t, userId, username }) {
  const [pin, setPin]         = useState("");
  const [file, setFile]       = useState(null);
  const [drag, setDrag]       = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr]         = useState("");
  const [expiry, setExpiry]   = useState("none");
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
      user_id: userId, username, name: file.name, storage_path: path,
      size: sizeLabel, type, pin, downloads: 0,
      expiry_type: expiry,
      expires_at: getExpiresAt(expiry),
    }).select().single();
    if (dbErr) { setErr("DB error: " + dbErr.message); setLoading(false); return; }
    onUpload(data); setLoading(false); onClose();
  }

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.65)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:200,backdropFilter:"blur(4px)"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:t.surface,border:`1px solid ${t.border}`,borderRadius:20,padding:"32px 28px",width:"100%",maxWidth:440,boxShadow:t.shadow,maxHeight:"92vh",overflowY:"auto"}}>
        <h3 style={{color:t.text,fontSize:20,fontWeight:700,margin:"0 0 22px",fontFamily:"'Playfair Display',Georgia,serif"}}>Upload File</h3>
        <div onClick={()=>ref.current.click()}
          onDragOver={e=>{e.preventDefault();setDrag(true);}}
          onDragLeave={()=>setDrag(false)}
          onDrop={e=>{e.preventDefault();setDrag(false);setFile(e.dataTransfer.files[0]);}}
          style={{border:`2px dashed ${drag?t.accent:t.border}`,borderRadius:12,padding:"26px 20px",textAlign:"center",cursor:"pointer",marginBottom:20,color:t.textSub,fontSize:14,fontFamily:"monospace",background:drag?t.accentSoft:t.surfaceAlt,transition:"all 0.2s"}}>
          <input ref={ref} type="file" style={{display:"none"}} onChange={e=>setFile(e.target.files[0])}/>
          {file?<><div style={{fontSize:26,color:t.success}}>✓</div>{file.name}</>:<><div style={{fontSize:26,marginBottom:6}}>↑</div>Drop file here or click to browse</>}
        </div>
        <label style={{display:"block",fontSize:11,color:t.textSub,letterSpacing:1.2,textTransform:"uppercase",marginBottom:6,fontFamily:"monospace"}}>Access PIN (4–8 digits)</label>
        <input
          style={{width:"100%",background:t.inputBg,border:`1.5px solid ${t.border}`,borderRadius:10,color:t.text,fontSize:15,padding:"11px 14px",outline:"none",boxSizing:"border-box",fontFamily:"monospace",marginBottom:6}}
          placeholder="e.g. 1234" maxLength={8} value={pin} onChange={e=>setPin(e.target.value.replace(/[^0-9]/g,""))}/>
        <p style={{color:t.textSub,fontSize:11,fontFamily:"monospace",marginBottom:20}}>Recipients need this PIN to access the file.</p>
        <label style={{display:"block",fontSize:11,color:t.textSub,letterSpacing:1.2,textTransform:"uppercase",marginBottom:10,fontFamily:"monospace"}}>File Availability</label>
        <div style={{display:"flex",flexDirection:"column",gap:7,marginBottom:20}}>
          {EXPIRY_OPTIONS.map(opt=>(
            <div key={opt.value} onClick={()=>setExpiry(opt.value)}
              style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"11px 14px",borderRadius:10,border:`1.5px solid ${expiry===opt.value?t.accent:t.border}`,background:expiry===opt.value?t.accentSoft:t.surfaceAlt,cursor:"pointer",transition:"all 0.15s"}}>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <div style={{width:16,height:16,borderRadius:"50%",border:`2px solid ${expiry===opt.value?t.accent:t.textMuted}`,background:expiry===opt.value?t.accent:"transparent",flexShrink:0,transition:"all 0.15s"}}/>
                <span style={{fontSize:15}}>{opt.icon}</span>
                <span style={{color:expiry===opt.value?t.text:t.textSub,fontSize:14,fontWeight:expiry===opt.value?600:400}}>{opt.label}</span>
              </div>
              <span style={{color:t.textMuted,fontSize:11,fontFamily:"monospace"}}>{opt.desc}</span>
            </div>
          ))}
        </div>
        <ErrBox msg={err} t={t}/>
        <div style={{display:"flex",gap:10}}>
          <button onClick={onClose} style={{flex:1,background:"transparent",border:`1px solid ${t.border}`,color:t.textSub,borderRadius:10,padding:12,fontSize:14,cursor:"pointer"}}>Cancel</button>
          <button onClick={doUpload} disabled={loading||!file||pin.length<4}
            style={{flex:2,background:(!file||pin.length<4||loading)?t.textMuted:t.accent,color:"#fff",border:"none",borderRadius:10,padding:12,fontSize:14,fontWeight:700,cursor:"pointer",transition:"background 0.2s"}}>
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
    const url = `${window.location.origin}/file?u=${profile.username}&f=${encodeURIComponent(f.name)}`;
    navigator.clipboard?.writeText(url);
    setCopied(f.id); setTimeout(()=>setCopied(null), 2000);
  }

  function openFile(f) {
    const url = `${window.location.origin}/file?u=${profile.username}&f=${encodeURIComponent(f.name)}`;
    window.open(url, "_blank");
  }

  const formatDate = (iso) => new Date(iso).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});

  return (
    <div style={{ minHeight:"100vh", background:t.bg, fontFamily:"'Playfair Display',Georgia,serif", transition:"background 0.3s" }}>
      {showUpload && <UploadModal onClose={()=>setShowUpload(false)} onUpload={f=>setFiles(p=>[f,...p])} t={t} userId={authUser.id} username={profile.username}/>}

      <nav style={{position:"sticky",top:0,zIndex:100,background:t.navBg,backdropFilter:"blur(12px)",borderBottom:`1px solid ${t.border}`,padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between",gap:8}}>
        <Logo t={t} size={18}/>
        <div style={{display:"flex",alignItems:"center",gap:6,flexShrink:0}}>
          <ThemeToggle dark={dark} onToggle={onToggle} t={t}/>
          <div style={{display:"flex",alignItems:"center",gap:6,background:t.pill,border:`1px solid ${t.border}`,borderRadius:20,padding:"5px 10px"}}>
            <div style={{width:24,height:24,borderRadius:"50%",background:t.accent,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:11,fontWeight:700,flexShrink:0}}>{profile.displayName[0]}</div>
            <span style={{color:t.text,fontSize:13,whiteSpace:"nowrap",maxWidth:80,overflow:"hidden",textOverflow:"ellipsis"}}>@{profile.username}</span>
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
                <p style={{color:t.textSub,fontSize:12,fontFamily:"monospace",margin:"0 0 8px"}}>{f.size} · {formatDate(f.created_at)} · {f.downloads} dl</p>
                {(()=>{const b=expiryBadge(f);return(<span style={{display:"inline-flex",alignItems:"center",gap:5,background:b.color+"15",border:`1px solid ${b.color}30`,borderRadius:5,padding:"2px 9px",fontSize:11,color:b.color,fontFamily:"monospace",marginBottom:12}}><span style={{width:5,height:5,borderRadius:"50%",background:b.color,display:"inline-block"}}/>{b.label}</span>);})()}
                <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12,background:t.surfaceAlt,borderRadius:8,padding:"8px 12px"}}>
                  <span style={{color:t.textSub,fontSize:12,fontFamily:"monospace"}}>PIN:</span>
                  <span style={{color:t.text,fontFamily:"monospace",fontSize:14,letterSpacing:3,flex:1}}>{showPin[f.id]?f.pin:"••••"}</span>
                  <button onClick={()=>setShowPin(p=>({...p,[f.id]:!p[f.id]}))} style={{background:"none",border:`1px solid ${t.border}`,color:t.textSub,borderRadius:5,padding:"2px 8px",fontSize:11,cursor:"pointer",fontFamily:"monospace"}}>{showPin[f.id]?"Hide":"Show"}</button>
                </div>
                {isExpired(f) ? (
                  <div style={{background:t.danger+"10",border:`1px solid ${t.danger}25`,borderRadius:8,padding:"10px 12px",textAlign:"center",fontSize:12,color:t.danger,fontFamily:"monospace"}}>
                    ⏰ Expired — file auto-deleted from storage
                  </div>
                ) : (
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
                )}
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
    if (isExpired(file)) { setStage("expired"); return; }
    if (pin !== file.pin) {
      setStage("wrong");
      setTimeout(()=>{ setStage("enter"); setPin(""); }, 900);
      return;
    }
    // 1 hour signed URL — safe for any connection speed
    const { data } = await supabase.storage.from("files").createSignedUrl(file.storage_path, 3600);
    setDlUrl(data?.signedUrl || null);
    // Increment — this is what gates future access for 1_download files
    await supabase.rpc("increment_downloads", { file_id: file.id });
    setStage("granted");
    // Actual storage deletion is handled by the hourly Edge Function cron
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

            {stage==="expired" ? (
              <div style={{padding:"24px 0",textAlign:"center"}}>
                <div style={{fontSize:44,marginBottom:14}}>⏰</div>
                <p style={{color:t.danger,fontWeight:700,fontSize:17,margin:"0 0 8px",fontFamily:"'Playfair Display',Georgia,serif"}}>File No Longer Available</p>
                <p style={{color:t.textSub,fontSize:13,fontFamily:"monospace",lineHeight:1.6}}>This file has expired or has already been downloaded and permanently deleted.</p>
              </div>
            ) : stage==="granted" ? (
              <div style={{padding:"20px 0"}}>
                <div style={{width:60,height:60,borderRadius:"50%",background:t.success+"20",border:`2px solid ${t.success}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,margin:"0 auto 16px"}}>✓</div>
                <p style={{color:t.success,fontWeight:700,fontSize:18,margin:"0 0 6px"}}>Access Granted</p>
                <p style={{color:t.textSub,fontSize:13,fontFamily:"monospace",marginBottom:20}}>Your file is ready to download.</p>
                <a href={dlUrl} download={file.name} target="_blank" rel="noreferrer"
                  style={{display:"block",width:"100%",background:t.accent,color:"#fff",border:"none",borderRadius:10,padding:14,fontSize:15,fontWeight:700,cursor:"pointer",textDecoration:"none",boxSizing:"border-box"}}>
                  ⬇ Download {file.name}
                </a>
                {file.expiry_type==="1_download" && (
                  <p style={{color:t.textMuted,fontSize:11,fontFamily:"monospace",marginTop:10,lineHeight:1.6}}>⚠ Single-use link — this file will not be accessible again after download</p>
                )}
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


function LandingPage() {
  const navigate = useNavigate();
  const t = T.dark;

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if(e.isIntersecting){e.target.classList.add('vis');obs.unobserve(e.target);} });
    }, {threshold:0.08});
    document.querySelectorAll('.lp-reveal').forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{minHeight:"100vh",background:"#060b13",color:"#e2eeff",fontFamily:"'DM Sans',sans-serif",overflowX:"hidden"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,800;0,900;1,700&family=DM+Mono:wght@400;500&family=DM+Sans:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        .lp-reveal{opacity:0;transform:translateY(24px);transition:opacity 0.7s ease,transform 0.7s ease;}
        .lp-reveal.vis{opacity:1;transform:translateY(0);}
        .lp-card:hover{border-color:rgba(59,130,246,0.35)!important;transform:translateY(-4px);box-shadow:0 20px 40px rgba(0,0,0,0.3)!important;}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:600px){
          .lp-nav-links{display:none!important;}
          .lp-steps{grid-template-columns:1fr 1fr!important;}
          .lp-sec-grid{grid-template-columns:1fr!important;}
          .lp-hero-title{font-size:42px!important;letter-spacing:-1px!important;}
          .lp-tagrow{flex-direction:column!important;gap:0!important;}
          .lp-tagword{font-size:11px!important;}
          .lp-stats{flex-wrap:wrap!important;}
          .lp-stat{border-right:none!important;border-bottom:1px solid #1a2f50;padding:12px 20px!important;}
        }
      `}</style>

      {/* NAV */}
      <nav style={{position:"fixed",top:0,left:0,right:0,zIndex:100,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"16px 32px",background:"rgba(6,11,19,0.9)",backdropFilter:"blur(20px)",borderBottom:"1px solid #1a2f50"}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <svg width="26" height="26" viewBox="0 0 28 28" fill="none"><rect x="2" y="2" width="24" height="24" rx="6" fill="#3b82f6" opacity="0.15"/><rect x="2" y="2" width="24" height="24" rx="6" stroke="#3b82f6" strokeWidth="1.5"/><path d="M9 14.5L12.5 18L19 11" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:20,fontWeight:800,color:"#e2eeff",letterSpacing:-0.5}}>File<span style={{color:"#3b82f6"}}>PIN</span></span>
        </div>
        <div className="lp-nav-links" style={{display:"flex",gap:28,listStyle:"none"}}>
          {["#what","#how","#features","#security"].map((h,i)=>
            <a key={h} href={h} style={{color:"#4a6a9a",textDecoration:"none",fontSize:14,transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="#e2eeff"} onMouseLeave={e=>e.target.style.color="#4a6a9a"}>
              {["What's it for","How it works","Features","Security"][i]}
            </a>
          )}
        </div>
        <div style={{display:"flex",gap:10}}>
          <button onClick={()=>navigate("/login")} style={{background:"transparent",border:"1px solid #1a2f50",color:"#4a6a9a",padding:"8px 18px",borderRadius:8,fontSize:14,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}
            onMouseEnter={e=>{e.target.style.borderColor="#3b82f6";e.target.style.color="#3b82f6"}} onMouseLeave={e=>{e.target.style.borderColor="#1a2f50";e.target.style.color="#4a6a9a"}}>
            Sign In
          </button>
          <button onClick={()=>navigate("/signup")} style={{background:"#3b82f6",border:"none",color:"#fff",padding:"8px 18px",borderRadius:8,fontSize:14,fontWeight:600,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",boxShadow:"0 4px 16px rgba(59,130,246,0.3)"}}>
            Get Started →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"130px 20px 80px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(59,130,246,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.04) 1px,transparent 1px)",backgroundSize:"52px 52px"}}/>
        <div style={{position:"absolute",top:"20%",left:"50%",transform:"translateX(-50%)",width:700,height:400,background:"radial-gradient(ellipse,rgba(59,130,246,0.18) 0%,transparent 65%)",pointerEvents:"none"}}/>
        <div style={{position:"relative",zIndex:1,maxWidth:780,width:"100%"}}>
          <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:20,padding:"7px 18px",fontSize:12,fontFamily:"'DM Mono',monospace",color:"#60a5fa",marginBottom:32,animation:"fadeUp 0.5s ease both",letterSpacing:0.5}}>
            <span style={{width:6,height:6,borderRadius:"50%",background:"#22c55e",animation:"blink 2s infinite",display:"inline-block"}}/>
            Secure · Instant · Always Accessible
          </div>
          <h1 className="lp-hero-title" style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(48px,8vw,88px)",fontWeight:900,lineHeight:1.05,letterSpacing:-2,color:"#e2eeff",marginBottom:24,animation:"fadeUp 0.5s 0.1s ease both"}}>
            Your important files.<br/>
            <span style={{WebkitTextStroke:"1.5px rgba(59,130,246,0.6)",color:"transparent"}}>One</span> link.{" "}
            <span style={{color:"#3b82f6"}}>One</span> PIN.
          </h1>
          <div className="lp-tagrow" style={{display:"flex",justifyContent:"center",gap:0,marginBottom:28,flexWrap:"wrap",animation:"fadeUp 0.5s 0.15s ease both"}}>
            {["One Link","One PIN","Any File","Anytime"].map((w,i)=>(
              <div key={w} className="lp-tagword" style={{fontFamily:"'DM Mono',monospace",fontSize:13,color:"#3b82f6",padding:"7px 18px",border:"1px solid rgba(59,130,246,0.2)",background:"rgba(59,130,246,0.05)",letterSpacing:1,textTransform:"uppercase"}}>
                {w}
              </div>
            ))}
          </div>
          <p style={{fontSize:17,color:"#4a6a9a",maxWidth:560,margin:"0 auto 40px",lineHeight:1.75,fontWeight:300,animation:"fadeUp 0.5s 0.2s ease both"}}>
            FilePIN is your personal file space for the things that matter —
            <strong style={{color:"#e2eeff",fontWeight:500}}> certificates, reports, books, study material.</strong>{" "}
            Upload once. Access anywhere with a link and PIN.
            <strong style={{color:"#e2eeff",fontWeight:500}}> No app needed for recipients.</strong>
          </p>
          <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap",marginBottom:52,animation:"fadeUp 0.5s 0.25s ease both"}}>
            <button onClick={()=>navigate("/signup")} style={{background:"#3b82f6",color:"#fff",border:"none",padding:"14px 34px",borderRadius:10,fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 8px 28px rgba(59,130,246,0.3)",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}
              onMouseEnter={e=>e.target.style.transform="translateY(-2px)"} onMouseLeave={e=>e.target.style.transform="translateY(0)"}>
              Create Your Space Free →
            </button>
            <button onClick={()=>document.getElementById("what").scrollIntoView({behavior:"smooth"})} style={{background:"transparent",color:"#4a6a9a",border:"1px solid #1a2f50",padding:"14px 34px",borderRadius:10,fontSize:16,cursor:"pointer",fontFamily:"'DM Sans',sans-serif",transition:"all 0.2s"}}
              onMouseEnter={e=>{e.target.style.borderColor="#3b82f6";e.target.style.color="#3b82f6"}} onMouseLeave={e=>{e.target.style.borderColor="#1a2f50";e.target.style.color="#4a6a9a"}}>
              See what it's for
            </button>
          </div>
          {/* URL demo */}
          <div style={{display:"inline-block",background:"#0c1628",border:"1px solid #1a2f50",borderRadius:14,padding:"18px 28px",textAlign:"left",animation:"fadeUp 0.5s 0.3s ease both"}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#4a6a9a",letterSpacing:1.5,textTransform:"uppercase",marginBottom:8}}>Your personal link</div>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:14,color:"#4a6a9a"}}>filepin.io/<span style={{color:"#3b82f6"}}>yourname</span>/<span style={{color:"#60a5fa"}}>document.pdf</span></div>
            <div style={{display:"flex",alignItems:"center",gap:8,marginTop:10,fontFamily:"'DM Mono',monospace",fontSize:12,color:"#4a6a9a"}}>
              <span>PIN required:</span>
              {[1,1,1,0].map((f,i)=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:f?"#3b82f6":"transparent",border:f?"none":"1.5px solid #1a2f50"}}/>)}
              <span>→ enter to unlock</span>
            </div>
            <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #1a2f50",fontSize:12,color:"#22c55e",fontFamily:"'DM Mono',monospace"}}>✓ Access granted — file ready anywhere</div>
          </div>
          {/* Stats */}
          <div className="lp-stats" style={{display:"flex",justifyContent:"center",marginTop:52,animation:"fadeUp 0.5s 0.4s ease both"}}>
            {[["100%","PIN Protected"],["Free","To Get Started"],["<30s","To Share a File"],["∞","Access Anytime"]].map(([n,l],i,a)=>(
              <div key={l} className="lp-stat" style={{textAlign:"center",padding:"0 36px",borderRight:i<a.length-1?"1px solid #1a2f50":"none"}}>
                <span style={{fontFamily:"'Playfair Display',serif",fontSize:30,fontWeight:800,color:"#e2eeff",display:"block"}}>{n}</span>
                <span style={{fontSize:11,color:"#4a6a9a",fontFamily:"'DM Mono',monospace",letterSpacing:0.5,textTransform:"uppercase"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* WHAT IT'S FOR */}
      <div id="what" style={{padding:"80px 24px",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)",backgroundSize:"52px 52px"}}/>
        <div style={{maxWidth:1080,margin:"0 auto",position:"relative",zIndex:1}}>
          <div className="lp-reveal" style={{marginBottom:48}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#3b82f6",letterSpacing:2,textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:20,height:1,background:"#3b82f6",display:"inline-block"}}/>What it's for
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:800,letterSpacing:-1,color:"#e2eeff",marginBottom:14}}>For files you actually need —<br/>not everything you own</h2>
            <p style={{fontSize:16,color:"#4a6a9a",maxWidth:520,lineHeight:1.75,fontWeight:300}}>FilePIN is not a backup drive. It's a smart, secure space for the files you genuinely need to access or share at a moment's notice.</p>
          </div>
          <div className="lp-reveal" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(230px,1fr))",gap:14}}>
            {[
              {icon:"🎓",who:"Students",what:"Store certificates and study material. Share notes with classmates via one link.",tags:["Degree Certificate","Lecture Notes","Assignments"]},
              {icon:"💼",who:"Professionals",what:"Send proposals to clients securely. No email attachments, no Drive permissions.",tags:["Project Reports","Proposals","Resume"]},
              {icon:"📚",who:"Teachers",what:"Share lecture PDFs and course books with students — no WhatsApp file limits.",tags:["Lecture PDFs","Course Books","Question Papers"]},
              {icon:"🧳",who:"Travelers",what:"Access your travel docs from any device, any country, anytime in a hurry.",tags:["Travel Insurance","Hotel Bookings","Visa Copy"]},
              {icon:"🏢",who:"Small Businesses",what:"Share catalogues and brochures via a clean link. Update file, link stays same.",tags:["Catalogues","Price Lists","Brochures"]},
              {icon:"🔬",who:"Researchers",what:"Distribute papers and datasets to peers with controlled PIN-protected access.",tags:["Research Papers","Datasets","Reports"]},
            ].map(c=>(
              <div key={c.who} className="lp-card" style={{background:"#0c1628",border:"1px solid #1a2f50",borderRadius:14,padding:22,transition:"all 0.3s",cursor:"default"}}>
                <span style={{fontSize:26,marginBottom:12,display:"block"}}>{c.icon}</span>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#e2eeff",marginBottom:8}}>{c.who}</div>
                <p style={{fontSize:13,color:"#4a6a9a",lineHeight:1.65,marginBottom:12}}>{c.what}</p>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {c.tags.map(t=><span key={t} style={{background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.15)",color:"#60a5fa",fontSize:10,fontFamily:"'DM Mono',monospace",padding:"3px 8px",borderRadius:4}}>{t}</span>)}
                </div>
              </div>
            ))}
          </div>
          {/* Warning notice */}
          <div className="lp-reveal" style={{background:"rgba(245,158,11,0.06)",border:"1px solid rgba(245,158,11,0.2)",borderRadius:14,padding:"24px 28px",display:"flex",gap:16,alignItems:"flex-start",marginTop:36}}>
            <span style={{fontSize:24,flexShrink:0}}>⚠️</span>
            <div>
              <div style={{fontFamily:"'Playfair Display',serif",fontSize:17,fontWeight:700,color:"#f59e0b",marginBottom:6}}>Use FilePIN wisely</div>
              <p style={{fontSize:13,color:"#4a6a9a",lineHeight:1.7}}>FilePIN is built for <strong style={{color:"#e2eeff"}}>important, purposeful files</strong> — not as a replacement for your cloud backup or photo library. Think of it as a <strong style={{color:"#e2eeff"}}>digital briefcase</strong>, not a storage warehouse. Store what you genuinely need. Share what actually matters.</p>
            </div>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div id="how" style={{background:"#0c1628",padding:"80px 24px"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div className="lp-reveal" style={{textAlign:"center",marginBottom:56}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#3b82f6",letterSpacing:2,textTransform:"uppercase",marginBottom:12,justifyContent:"center",display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:20,height:1,background:"#3b82f6",display:"inline-block"}}/>How it works
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:800,letterSpacing:-1,color:"#e2eeff"}}>Simple enough for anyone</h2>
          </div>
          <div className="lp-steps lp-reveal" style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:0,position:"relative"}}>
            <div style={{position:"absolute",top:32,left:"12%",right:"12%",height:1,background:"linear-gradient(90deg,transparent,#1a2f50,#1a2f50,transparent)"}}/>
            {[["1","Sign Up Free","Create account, choose your username — it becomes your personal file address."],["2","Upload Your File","Drag any file — PDF, image, ZIP, doc. Stored securely in cloud instantly."],["3","Set a PIN","Choose 4–8 digits. Only people who know the PIN can access the file."],["4","Share or Access","Copy your link. Bookmark it. Open anywhere — enter PIN and download."]].map(([n,title,desc])=>(
              <div key={n} style={{textAlign:"center",padding:"0 16px"}}>
                <div style={{width:64,height:64,borderRadius:"50%",background:"#060b13",border:"1px solid #1a2f50",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 20px",fontFamily:"'Playfair Display',serif",fontSize:22,fontWeight:800,color:"#3b82f6",position:"relative",zIndex:1}}>{n}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#e2eeff",marginBottom:8}}>{title}</div>
                <p style={{fontSize:13,color:"#4a6a9a",lineHeight:1.65}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FEATURES */}
      <div id="features" style={{padding:"80px 24px",position:"relative"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)",backgroundSize:"52px 52px"}}/>
        <div style={{maxWidth:1080,margin:"0 auto",position:"relative",zIndex:1}}>
          <div className="lp-reveal" style={{marginBottom:40}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#3b82f6",letterSpacing:2,textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:20,height:1,background:"#3b82f6",display:"inline-block"}}/>Features
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:800,letterSpacing:-1,color:"#e2eeff"}}>Built lean. Built useful.</h2>
          </div>
          <div className="lp-reveal" style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:16}}>
            {[
              {icon:"🔐",bg:"rgba(59,130,246,0.1)",color:"#3b82f6",title:"PIN-Protected Access",desc:"Every file has its own PIN. No PIN, no access — even if someone has the exact link."},
              {icon:"🌍",bg:"rgba(34,197,94,0.1)",color:"#22c55e",title:"Access from Anywhere",desc:"Pull your files up from any phone, laptop or device — any country, any time."},
              {icon:"🔗",bg:"rgba(245,158,11,0.1)",color:"#f59e0b",title:"Permanent Links",desc:"Your link never expires unless you delete the file. Share once, use forever."},
              {icon:"📁",bg:"rgba(139,92,246,0.1)",color:"#8b5cf6",title:"All File Types",desc:"PDFs, images, ZIP files, spreadsheets — FilePIN handles any format."},
              {icon:"📊",bg:"rgba(239,68,68,0.1)",color:"#ef4444",title:"Download Tracking",desc:"See how many times each file has been downloaded. Always stay informed."},
              {icon:"⚡",bg:"rgba(59,130,246,0.1)",color:"#60a5fa",title:"No App for Recipients",desc:"The person receiving your file needs no account, app or login. Just the link and PIN."},
            ].map(f=>(
              <div key={f.title} className="lp-card" style={{background:"#0c1628",border:"1px solid #1a2f50",borderRadius:14,padding:24,transition:"all 0.3s",position:"relative",overflow:"hidden"}}>
                <div style={{width:44,height:44,borderRadius:11,background:f.bg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,marginBottom:16}}>{f.icon}</div>
                <div style={{fontFamily:"'Playfair Display',serif",fontSize:16,fontWeight:700,color:"#e2eeff",marginBottom:8}}>{f.title}</div>
                <p style={{fontSize:13,color:"#4a6a9a",lineHeight:1.7}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECURITY */}
      <div id="security" style={{background:"#0c1628",padding:"80px 24px"}}>
        <div style={{maxWidth:1080,margin:"0 auto"}}>
          <div className="lp-reveal" style={{marginBottom:48}}>
            <div style={{fontFamily:"'DM Mono',monospace",fontSize:11,color:"#3b82f6",letterSpacing:2,textTransform:"uppercase",marginBottom:12,display:"flex",alignItems:"center",gap:10}}>
              <span style={{width:20,height:1,background:"#3b82f6",display:"inline-block"}}/>Security
            </div>
            <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(28px,4vw,48px)",fontWeight:800,letterSpacing:-1,color:"#e2eeff"}}>Your files. Your PIN.<br/>Your control.</h2>
          </div>
          <div className="lp-sec-grid lp-reveal" style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:48,alignItems:"center"}}>
            <div style={{background:"#060b13",border:"1px solid #1a2f50",borderRadius:18,padding:32}}>
              <div style={{fontFamily:"'DM Mono',monospace",fontSize:10,color:"#4a6a9a",letterSpacing:1.5,textTransform:"uppercase",textAlign:"center",marginBottom:16}}>PIN Verification</div>
              <div style={{display:"flex",gap:12,justifyContent:"center",marginBottom:24}}>
                {[1,1,1,0].map((f,i)=><div key={i} style={{width:18,height:18,borderRadius:"50%",background:f?"#3b82f6":"transparent",border:f?"none":"2px solid #1a2f50",boxShadow:f?"0 0 12px rgba(59,130,246,0.5)":""}}/>)}
              </div>
              {["Files stored with enterprise-grade encryption","PINs are never stored in plain text","Download URLs expire after 60 seconds","No file preview without correct PIN","Each user's files are fully isolated","You can delete any file instantly"].map(r=>(
                <div key={r} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:"#0c1628",borderRadius:8,marginBottom:7,fontSize:12,color:"#4a6a9a",fontFamily:"'DM Mono',monospace"}}>
                  <span style={{color:"#22c55e"}}>✓</span>{r}
                </div>
              ))}
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {[
                {icon:"🛡️",title:"PIN is the only key",desc:"Even with the exact URL, nobody can see or download your file without the correct PIN. The link alone is useless."},
                {icon:"⏱️",title:"Self-destructing download links",desc:"When a PIN is verified, a signed URL is generated that expires in 60 seconds. It cannot be reused or forwarded."},
                {icon:"☁️",title:"Enterprise cloud infrastructure",desc:"Files are stored on Supabase — trusted by thousands of businesses globally — with strict Row Level Security."},
                {icon:"🔑",title:"You stay in control",desc:"Change your PIN anytime. Delete a file with one click. Track every download. Nothing happens without your action."},
              ].map(p=>(
                <div key={p.title} style={{display:"flex",gap:14,alignItems:"flex-start"}}>
                  <div style={{width:40,height:40,borderRadius:10,background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.18)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>{p.icon}</div>
                  <div>
                    <div style={{fontFamily:"'Playfair Display',serif",fontSize:15,fontWeight:700,color:"#e2eeff",marginBottom:4}}>{p.title}</div>
                    <p style={{fontSize:13,color:"#4a6a9a",lineHeight:1.65}}>{p.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{textAlign:"center",padding:"100px 24px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",inset:0,backgroundImage:"linear-gradient(rgba(59,130,246,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(59,130,246,0.03) 1px,transparent 1px)",backgroundSize:"52px 52px"}}/>
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:600,height:400,background:"radial-gradient(ellipse,rgba(59,130,246,0.15) 0%,transparent 70%)",pointerEvents:"none"}}/>
        <div className="lp-reveal" style={{position:"relative",zIndex:1}}>
          <h2 style={{fontFamily:"'Playfair Display',serif",fontSize:"clamp(36px,5vw,64px)",fontWeight:900,letterSpacing:-2,color:"#e2eeff",marginBottom:12,lineHeight:1.1}}>
            One Link.<br/>One <span style={{color:"#3b82f6"}}>PIN.</span><br/>Any File. Anytime.
          </h2>
          <p style={{fontSize:16,color:"#4a6a9a",marginBottom:12,fontWeight:300}}>Your personal file space is waiting. Free to start, forever useful.</p>
          <p style={{fontFamily:"'DM Mono',monospace",fontSize:12,color:"rgba(59,130,246,0.5)",letterSpacing:2,textTransform:"uppercase",marginBottom:36}}>No credit card · No app · No complexity</p>
          <div style={{display:"flex",justifyContent:"center",gap:12,flexWrap:"wrap"}}>
            <button onClick={()=>navigate("/signup")} style={{background:"#3b82f6",color:"#fff",border:"none",padding:"15px 40px",borderRadius:12,fontSize:16,fontWeight:600,cursor:"pointer",boxShadow:"0 8px 28px rgba(59,130,246,0.3)",fontFamily:"'DM Sans',sans-serif"}}>
              Create Free Account →
            </button>
            <button onClick={()=>navigate("/login")} style={{background:"transparent",color:"#4a6a9a",border:"1px solid #1a2f50",padding:"15px 40px",borderRadius:12,fontSize:16,cursor:"pointer",fontFamily:"'DM Sans',sans-serif"}}>
              Sign In
            </button>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{background:"#0c1628",borderTop:"1px solid #1a2f50",padding:"32px 48px",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:16}}>
        <div style={{display:"flex",alignItems:"center",gap:9}}>
          <svg width="22" height="22" viewBox="0 0 28 28" fill="none"><rect x="2" y="2" width="24" height="24" rx="6" fill="#3b82f6" opacity="0.15"/><rect x="2" y="2" width="24" height="24" rx="6" stroke="#3b82f6" strokeWidth="1.5"/><path d="M9 14.5L12.5 18L19 11" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          <span style={{fontFamily:"'Playfair Display',serif",fontSize:18,fontWeight:800,color:"#e2eeff"}}>File<span style={{color:"#3b82f6"}}>PIN</span></span>
        </div>
        <p style={{fontSize:12,color:"#4a6a9a",fontFamily:"'DM Mono',monospace"}}>© 2026 FilePIN · One Link. One PIN. Any File. Anytime.</p>
        <div style={{display:"flex",gap:24}}>
          {[["#what","What's it for"],["#security","Security"],["signup","Sign Up"],["login","Login"]].map(([h,l])=>(
            <a key={l} href={h.startsWith("#")?h:undefined} onClick={h.startsWith("#")?undefined:()=>navigate("/"+h)}
              style={{fontSize:12,color:"#4a6a9a",textDecoration:"none",fontFamily:"'DM Mono',monospace",cursor:"pointer",transition:"color 0.2s"}}
              onMouseEnter={e=>e.target.style.color="#3b82f6"} onMouseLeave={e=>e.target.style.color="#4a6a9a"}>
              {l}
            </a>
          ))}
        </div>
      </div>


    </div>
  );
}


// ── PROTECTED ROUTE ───────────────────────────────────────────────────────────
function ProtectedRoute({ children, authUser, profile }) {
  if (!authUser || !profile) return <Navigate to="/login" replace />;
  return children;
}

// ── PUBLIC FILE WRAPPER ───────────────────────────────────────────────────────
function PublicFilePage({ dark, onToggle }) {
  const navigate = useNavigate();
  const params = new URLSearchParams(window.location.search);
  const username = params.get("u");
  const filename = params.get("f");
  if (!username || !filename) return <Navigate to="/login" replace />;
  return <PublicPage username={username} filename={filename} onBack={()=>navigate("/login")} dark={dark} onToggle={onToggle}/>;
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
    if (data) { setAuthUser(user); setProfile({ username: data.username, displayName: data.display_name }); }
    setLoading(false);
  }

  async function handleLogin(user)        { await loadProfile(user); navigate("/dashboard"); }
  async function handleSignup(user, prof) { setAuthUser(user); setProfile(prof); setLoading(false); navigate("/dashboard"); }
  async function handleLogout()           { await supabase.auth.signOut(); setAuthUser(null); setProfile(null); navigate("/"); }

  if (loading) return (
    <div style={{minHeight:"100vh",background:"#070c14",display:"flex",alignItems:"center",justifyContent:"center",color:"#4a6090",fontFamily:"monospace"}}>Loading…</div>
  );

  return (
    <>
      <style>{`*{box-sizing:border-box;margin:0;padding:0;}body{margin:0;}`}</style>
      <Routes>
        <Route path="/"          element={<LandingPage/>}/>
        <Route path="/login"     element={<LoginPage  onLogin={handleLogin} onGoSignup={()=>navigate("/signup")} onForgot={()=>navigate("/forgot")} dark={dark} onToggle={toggle}/>}/>
        <Route path="/signup"    element={<SignupPage onSignup={handleSignup} onGoLogin={()=>navigate("/login")} dark={dark} onToggle={toggle}/>}/>
        <Route path="/forgot"    element={<ForgotPage onBack={()=>navigate("/login")} dark={dark} onToggle={toggle}/>}/>
        <Route path="/dashboard" element={
          <ProtectedRoute authUser={authUser} profile={profile}>
            <Dashboard authUser={authUser} profile={profile} onLogout={handleLogout} dark={dark} onToggle={toggle}/>
          </ProtectedRoute>
        }/>
        <Route path="/file"      element={<PublicFilePage dark={dark} onToggle={toggle}/>}/>
        <Route path="*"          element={<Navigate to="/" replace/>}/>
      </Routes>
    </>
  );
}
