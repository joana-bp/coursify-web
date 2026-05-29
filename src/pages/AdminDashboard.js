import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import API_BASE_URL from "../config/api";

const API = API_BASE_URL; // to avoid "API is not defined" in helper functions

const RANGE_OPTIONS = [
  { label: "Last 7 days",  value: "7d"  },
  { label: "Last 30 days", value: "30d" },
  { label: "All time",     value: "all" },
];

const STRAND_COLORS = ["#6ee7b7","#93c5fd","#fcd34d","#f9a8d4","#c4b5fd","#fb923c","#34d399","#60a5fa"];

const RIASEC_SUBS  = ["realistic","investigative","artistic","social","enterprising","conventional"];
const BIGFIVE_SUBS = ["openness","conscientiousness","extraversion","agreeableness","neuroticism"];
const APT_SUBJECTS = ["math","english","science","abstract"];
const APT_TOPICS   = {
  math:     ["algebra","geometry","statistics","logic"],
  english:  ["grammar_and_sentence_structure","reading_comprehension","vocabulary_and_context_clues","logical_verbal_reasoning"],
  science:  ["biology","physics","chemistry","earth_and_environmental_science"],
  abstract: ["pattern_recognition","spatial_reasoning","logical_sequences","analogical_reasoning"],
};
const APT_DIFFS = ["easy","medium","hard"];

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Syne:wght@600;700;800&display=swap');
*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
:root{
  --bg:#080e1a;--bg-surface:#0d1424;--bg-raised:#111c30;
  --border:#1a2540;--border-light:#24324d;
  --text-primary:#eef2f8;--text-secondary:#7a90b0;--text-muted:#51627d;
  --accent:#6ee7b7;
  --red:#f87171;--red-dim:rgba(248,113,113,0.08);--red-border:rgba(248,113,113,0.22);
  --sidebar-w:230px;
  --radius-sm:6px;--radius-md:10px;--radius-lg:16px;
}
body{background:var(--bg);}
.ad-root{min-height:100vh;display:flex;background:var(--bg);color:var(--text-primary);font-family:'DM Sans',sans-serif;}

/* SIDEBAR */
.ad-sidebar{width:var(--sidebar-w);min-height:100vh;background:var(--bg-surface);border-right:1px solid var(--border);display:flex !important;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;flex-shrink:0;}
.ad-logo{display:flex;align-items:center;gap:12px;padding:28px 22px;border-bottom:1px solid var(--border);}
.ad-logo-mark{width:38px;height:38px;border-radius:10px;background:var(--accent);color:var(--bg);display:grid;place-items:center;font-family:'Syne',sans-serif;font-weight:800;font-size:20px;}
.ad-logo-text{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;}
.ad-nav{flex:1;display:flex;flex-direction:column;gap:4px;padding:18px 12px;}
.ad-nav-section{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);padding:14px 10px 6px;}
.ad-nav-item{width:100%;border:none;outline:none;background:transparent;color:var(--text-secondary);display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:var(--radius-sm);cursor:pointer;transition:0.15s;font-size:13.5px;font-weight:500;font-family:'DM Sans',sans-serif;}
.ad-nav-item:hover{background:var(--bg-raised);color:var(--text-primary);}
.ad-nav-item.active{background:rgba(110,231,183,0.1);color:var(--accent);}
.ad-nav-icon{width:18px;text-align:center;}
.ad-sidebar-footer{border-top:1px solid var(--border);padding:18px;display:flex;align-items:center;gap:10px;}
.ad-avatar{width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,#6ee7b7,#059669);display:grid;place-items:center;color:var(--bg);font-weight:700;flex-shrink:0;}
.ad-sidebar-user{flex:1;min-width:0;}
.ad-sidebar-name{display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.ad-sidebar-role{font-size:11px;color:var(--accent);text-transform:uppercase;}
.ad-logout{border:none;background:transparent;color:var(--text-muted);cursor:pointer;font-size:15px;}
.ad-logout:hover{color:var(--red);}

/* MAIN */
.ad-main{flex:1;padding:36px;min-width:0;overflow-x:hidden;}
.ad-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:30px;}
.ad-title{font-family:'Syne',sans-serif;font-size:28px;font-weight:800;}
.ad-subtitle{margin-top:6px;color:var(--text-secondary);font-size:13px;}

/* TABS */
.ad-tab-bar{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:28px;border-bottom:1px solid var(--border);padding-bottom:0;}
.ad-tab{border:none;background:transparent;color:var(--text-secondary);padding:10px 18px;cursor:pointer;font-size:13.5px;font-weight:500;font-family:'DM Sans',sans-serif;border-bottom:2px solid transparent;margin-bottom:-1px;transition:0.15s;}
.ad-tab:hover{color:var(--text-primary);}
.ad-tab.active{color:var(--accent);border-bottom-color:var(--accent);}

/* RANGE */
.ad-range-tabs{display:flex;gap:8px;flex-wrap:wrap;}
.ad-range-btn{border:1px solid var(--border-light);background:var(--bg-surface);color:var(--text-secondary);padding:9px 16px;border-radius:10px;cursor:pointer;transition:0.15s;font-size:13px;font-family:'DM Sans',sans-serif;}
.ad-range-btn:hover{color:var(--text-primary);}
.ad-range-btn.active{background:rgba(110,231,183,0.1);border-color:rgba(110,231,183,0.25);color:var(--accent);}

/* STATS */
.ad-stats-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(190px,1fr));gap:16px;margin-bottom:24px;}
.stat-card{background:var(--bg-surface);border:1px solid var(--border);border-top:3px solid var(--accent-color);border-radius:var(--radius-lg);padding:22px;}
.stat-value{display:block;font-size:34px;font-weight:800;color:var(--accent-color);font-family:'Syne',sans-serif;}
.stat-label{display:block;margin-top:6px;color:var(--text-secondary);font-size:13px;}
.stat-sub{display:block;font-size:11px;color:var(--text-muted);margin-top:2px;}

/* CARDS */
.ad-card{background:var(--bg-surface);border:1px solid var(--border);border-radius:var(--radius-lg);padding:22px;}
.section-title{margin-bottom:18px;font-family:'Syne',sans-serif;font-size:16px;font-weight:700;}
.ad-content{display:flex;flex-direction:column;gap:20px;}
.ad-bottom-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(320px,1fr));gap:18px;}

/* ROLE LIST */
.ad-role-list{display:flex;flex-direction:column;gap:12px;}
.ad-role-row{display:flex;align-items:center;justify-content:space-between;}
.ad-role-badge{padding:4px 10px;border-radius:20px;background:rgba(110,231,183,0.08);color:var(--accent);font-size:11px;font-weight:700;text-transform:uppercase;}
.ad-role-count{font-size:22px;font-weight:800;font-family:'Syne',sans-serif;}

/* COURSE LIST */
.ad-course-list{display:flex;flex-direction:column;gap:10px;}
.ad-course-row{display:flex;justify-content:space-between;align-items:center;padding:11px 14px;border-radius:10px;background:var(--bg-raised);border:1px solid var(--border);font-size:13px;gap:8px;}
.ad-course-row .rank{color:var(--text-muted);font-size:11px;width:20px;flex-shrink:0;}
.ad-course-row .name{flex:1;}
.ad-course-row .count{font-weight:700;color:var(--accent);flex-shrink:0;}

/* APT GRID */
.ad-apt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;}
.ad-apt-item{background:var(--bg-raised);border:1px solid var(--border);border-radius:var(--radius-md);padding:16px;text-align:center;}
.ad-apt-subject{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--text-muted);margin-bottom:8px;}
.ad-apt-pct{font-size:28px;font-weight:800;font-family:'Syne',sans-serif;}

/* QUESTION TOOLBAR */
.ad-q-toolbar{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;align-items:center;}
.ad-q-toolbar select,.ad-q-toolbar input{background:var(--bg-raised);border:1px solid var(--border-light);color:var(--text-primary);border-radius:var(--radius-sm);padding:8px 12px;font-size:13px;font-family:'DM Sans',sans-serif;outline:none;}
.ad-q-toolbar select:focus,.ad-q-toolbar input:focus{border-color:rgba(110,231,183,0.4);}
.ad-q-toolbar select option{background:var(--bg-raised);}

/* BUTTONS */
.ad-btn{border:none;border-radius:var(--radius-sm);padding:9px 16px;font-size:13px;font-weight:600;font-family:'DM Sans',sans-serif;cursor:pointer;transition:0.15s;}
.ad-btn-primary{background:var(--accent);color:var(--bg);}
.ad-btn-primary:hover{opacity:0.9;}
.ad-btn-ghost{background:var(--bg-raised);color:var(--text-secondary);border:1px solid var(--border-light);}
.ad-btn-ghost:hover{color:var(--text-primary);}
.ad-btn-danger{background:var(--red-dim);color:var(--red);border:1px solid var(--red-border);}
.ad-btn-danger:hover{background:rgba(248,113,113,0.15);}
.ad-btn-sm{padding:5px 11px;font-size:12px;}

/* QUESTION TABLE */
.ad-q-table-wrap{overflow-x:auto;}
.ad-q-table{width:100%;border-collapse:collapse;font-size:13px;}
.ad-q-table th{text-align:left;color:var(--text-muted);font-weight:600;font-size:11px;text-transform:uppercase;letter-spacing:.5px;padding:10px 12px;border-bottom:1px solid var(--border);white-space:nowrap;}
.ad-q-table td{padding:11px 12px;border-bottom:1px solid var(--border);vertical-align:top;}
.ad-q-table tr:last-child td{border-bottom:none;}
.ad-q-table tr:hover td{background:rgba(255,255,255,0.02);}
.ad-q-text{max-width:280px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;}

/* OPTIONS DISPLAY in table */
.ad-q-options{margin-top:6px;display:flex;flex-direction:column;gap:3px;}
.ad-q-opt{font-size:11px;color:var(--text-secondary);display:flex;gap:5px;align-items:flex-start;}
.ad-q-opt-key{font-weight:700;flex-shrink:0;width:14px;}
.ad-q-opt-val{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:200px;}
.ad-q-opt.correct .ad-q-opt-key,.ad-q-opt.correct .ad-q-opt-val{color:var(--accent);}

/* BADGES */
.ad-badge{display:inline-block;padding:3px 8px;border-radius:12px;font-size:11px;font-weight:600;white-space:nowrap;}
.ad-badge-green{background:rgba(110,231,183,0.1);color:var(--accent);}
.ad-badge-red{background:var(--red-dim);color:var(--red);}
.ad-badge-blue{background:rgba(147,197,253,0.1);color:#93c5fd;}
.ad-badge-yellow{background:rgba(252,211,77,0.1);color:#fcd34d;}
.ad-badge-purple{background:rgba(196,181,253,0.1);color:#c4b5fd;}
.ad-badge-orange{background:rgba(251,146,60,0.1);color:#fb923c;}

/* PAGINATION */
.ad-pagination{display:flex;align-items:center;gap:10px;justify-content:flex-end;margin-top:16px;font-size:13px;color:var(--text-secondary);}
.ad-page-btn{background:var(--bg-raised);border:1px solid var(--border-light);color:var(--text-secondary);padding:6px 12px;border-radius:var(--radius-sm);cursor:pointer;font-family:'DM Sans',sans-serif;font-size:13px;}
.ad-page-btn:disabled{opacity:0.4;cursor:not-allowed;}
.ad-page-btn:not(:disabled):hover{color:var(--text-primary);}

/* MODAL */
.ad-modal-overlay{position:fixed;inset:0;background:rgba(8,14,26,0.85);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px;backdrop-filter:blur(4px);}
.ad-modal{background:var(--bg-surface);border:1px solid var(--border-light);border-radius:var(--radius-lg);padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;}
.ad-modal-title{font-family:'Syne',sans-serif;font-size:18px;font-weight:700;margin-bottom:22px;}
.ad-form-row{display:flex;flex-direction:column;gap:6px;margin-bottom:16px;}
.ad-form-row label{font-size:12px;color:var(--text-secondary);font-weight:500;text-transform:uppercase;letter-spacing:.4px;}
.ad-input,.ad-select,.ad-textarea{background:var(--bg-raised);border:1px solid var(--border-light);color:var(--text-primary);border-radius:var(--radius-sm);padding:10px 12px;font-size:13.5px;font-family:'DM Sans',sans-serif;outline:none;width:100%;}
.ad-input:focus,.ad-select:focus,.ad-textarea:focus{border-color:rgba(110,231,183,0.4);}
.ad-select option{background:var(--bg-raised);}
.ad-textarea{resize:vertical;min-height:80px;}
.ad-options-grid{display:flex;flex-direction:column;gap:8px;margin-top:6px;}
.ad-opt-row{display:flex;gap:8px;align-items:center;}
.ad-opt-key{font-size:13px;font-weight:700;color:var(--text-muted);width:16px;flex-shrink:0;text-align:center;}
.ad-opt-correct-btn{background:var(--bg-raised);border:1px solid var(--border-light);color:var(--text-muted);width:28px;height:28px;border-radius:6px;cursor:pointer;font-size:13px;flex-shrink:0;display:grid;place-items:center;}
.ad-opt-correct-btn.active{background:rgba(110,231,183,0.15);border-color:rgba(110,231,183,0.4);color:var(--accent);}
.ad-modal-actions{display:flex;gap:10px;justify-content:flex-end;margin-top:22px;}

/* STATES */
.ad-loading{margin-top:90px;display:flex;flex-direction:column;align-items:center;gap:16px;color:var(--text-secondary);}
.ad-spinner{width:36px;height:36px;border:3px solid var(--border);border-top-color:var(--accent);border-radius:50%;animation:spin 0.75s linear infinite;}
.ad-error{background:var(--red-dim);border:1px solid var(--red-border);color:#fca5a5;padding:14px 16px;border-radius:var(--radius-md);margin-bottom:20px;font-size:13px;}
.ad-empty{color:var(--text-muted);font-size:13px;}
.ad-success{background:rgba(110,231,183,0.08);border:1px solid rgba(110,231,183,0.2);color:var(--accent);padding:12px 16px;border-radius:var(--radius-md);margin-bottom:16px;font-size:13px;}

@keyframes spin{to{transform:rotate(360deg);}}
@media(max-width:640px){.ad-sidebar{display:none !important;}.ad-title{font-size:24px;}.ad-main{padding:18px;}.ad-bottom-grid{grid-template-columns:1fr;}}
`;

const TT = { background:"#111c30", border:"1px solid #1a2540", borderRadius:8, color:"#eef2f8", fontSize:12, fontFamily:"DM Sans,sans-serif" };

// ── Helpers ───────────────────────────────────────────────────────────────────
function getToken() { return localStorage.getItem("token"); }

async function apiFetch(path, opts = {}) {
  const res = await fetch(`${API}${path}`, {
    ...opts,
    headers: { "Content-Type":"application/json", Authorization:`Bearer ${getToken()}`, ...(opts.headers||{}) },
  });
  if (!res.ok) { const e = await res.json().catch(()=>({})); throw new Error(e.detail||`HTTP ${res.status}`); }
  return res.json();
}

// Options can be stored as array [{label:"A",value:"..."}] or dict {"A":"..."}
function normalizeOptions(options) {
  if (!options) return {};
  if (Array.isArray(options)) {
    return Object.fromEntries(options.map(o => [o.label, o.value]));
  }
  return options; // already a dict
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="stat-card" style={{"--accent-color":accent}}>
      <span className="stat-value">{value??"-"}</span>
      <span className="stat-label">{label}</span>
      {sub && <span className="stat-sub">{sub}</span>}
    </div>
  );
}
function Spinner() { return <div className="ad-loading"><div className="ad-spinner"/><span>Loading...</span></div>; }

function poolBadge(pool) {
  const map = { riasec:"ad-badge-green", bigfive:"ad-badge-blue", aptitude:"ad-badge-purple" };
  return <span className={`ad-badge ${map[pool]||"ad-badge-blue"}`}>{pool}</span>;
}
function diffBadge(d) {
  const map = { easy:"ad-badge-green", medium:"ad-badge-yellow", hard:"ad-badge-red" };
  return d ? <span className={`ad-badge ${map[d]||"ad-badge-blue"}`}>{d}</span> : null;
}
function subBadge(s) {
  return s ? <span className="ad-badge ad-badge-orange" style={{textTransform:"capitalize"}}>{s.replace(/_/g," ")}</span> : null;
}

// ── ANALYTICS: USERS ─────────────────────────────────────────────────────────
function UsersAnalytics({ token, range }) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{ setLoading(true); apiFetch(`/api/admin/analytics?range=${range}`).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[range]);
  if(loading) return <Spinner/>;
  if(error) return <div className="ad-error">{error}</div>;
  if(!data) return null;
  return (
    <div className="ad-content">
      <div className="ad-stats-grid">
        <StatCard label="Total Users"    value={data.totalUsers}    accent="#6ee7b7"/>
        <StatCard label="New Users"      value={data.newUsers}      sub="in selected range" accent="#93c5fd"/>
        <StatCard label="Active Users"   value={data.activeUsers}   accent="#fcd34d"/>
        <StatCard label="Inactive Users" value={data.inactiveUsers} accent="#f9a8d4"/>
      </div>
      <div className="ad-card">
        <h2 className="section-title">Registration Trend</h2>
        {data.registrationTrend.length===0?<p className="ad-empty">No registrations in this period.</p>:(
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.registrationTrend} margin={{top:8,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="date" tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={TT} cursor={{stroke:"#6ee7b7",strokeWidth:1}}/>
              <Line type="monotone" dataKey="count" stroke="#6ee7b7" strokeWidth={2.5} dot={{r:3,fill:"#6ee7b7"}} activeDot={{r:5}} name="Registrations"/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="ad-bottom-grid">
        <div className="ad-card">
          <h2 className="section-title">By Strand</h2>
          {data.strandBreakdown.length===0?<p className="ad-empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.strandBreakdown} layout="vertical" margin={{top:0,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false}/>
                <XAxis type="number" tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <YAxis dataKey="strand" type="category" tick={{fill:"#eef2f8",fontSize:11}} tickLine={false} axisLine={false} width={80}/>
                <Tooltip contentStyle={TT}/>
                <Bar dataKey="count" radius={[0,4,4,0]} name="Users">
                  {data.strandBreakdown.map((_,i)=><Cell key={i} fill={STRAND_COLORS[i%STRAND_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="ad-card">
          <h2 className="section-title">By Grade Level</h2>
          {data.gradeLevelBreakdown.length===0?<p className="ad-empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.gradeLevelBreakdown} margin={{top:0,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false}/>
                <XAxis dataKey="gradeLevel" tick={{fill:"#eef2f8",fontSize:11}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={TT}/>
                <Bar dataKey="count" radius={[4,4,0,0]} name="Users">
                  {data.gradeLevelBreakdown.map((_,i)=><Cell key={i} fill={STRAND_COLORS[(i+2)%STRAND_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="ad-card">
          <h2 className="section-title">Role Breakdown</h2>
          <div className="ad-role-list">
            {Object.entries(data.roleBreakdown).map(([role,count])=>(
              <div key={role} className="ad-role-row">
                <span className="ad-role-badge">{role}</span>
                <span className="ad-role-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS: COURSES ────────────────────────────────────────────────────────
function CoursesAnalytics({ range }) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [strand,setStrand]=useState("all");
  const strands = data ? ["all",...new Set(data.coursesByStrand.map(s=>s.strand).filter(Boolean))] : ["all"];
  useEffect(()=>{ setLoading(true); apiFetch(`/api/admin/analytics/courses?range=${range}&strand=${strand}`).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[range,strand]);
  if(loading) return <Spinner/>;
  if(error) return <div className="ad-error">{error}</div>;
  if(!data) return null;
  return (
    <div className="ad-content">
      <div className="ad-stats-grid">
        <StatCard label="Total Submissions"    value={data.totalSubmissions}   accent="#6ee7b7"/>
        <StatCard label="Submissions in Range" value={data.submissionsInRange} sub="in selected range" accent="#93c5fd"/>
      </div>
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:4}}>
        {strands.map(s=>(
          <button key={s} className={`ad-range-btn ${strand===s?"active":""}`} onClick={()=>setStrand(s)}>
            {s==="all"?"All Strands":s}
          </button>
        ))}
      </div>
      <div className="ad-bottom-grid">
        <div className="ad-card">
          <h2 className="section-title">Top 10 Recommended Courses</h2>
          {data.topCourses.length===0?<p className="ad-empty">No data for this period.</p>:(
            <div className="ad-course-list">
              {data.topCourses.map((c,i)=>(
                <div key={i} className="ad-course-row">
                  <span className="rank">#{i+1}</span>
                  <span className="name">{c.course}</span>
                  <span className="count">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="ad-card">
          <h2 className="section-title">Submission Trend</h2>
          {data.courseTrend.length===0?<p className="ad-empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={data.courseTrend} margin={{top:8,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
                <XAxis dataKey="date" tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={TT}/>
                <Line type="monotone" dataKey="count" stroke="#93c5fd" strokeWidth={2.5} dot={{r:3,fill:"#93c5fd"}} activeDot={{r:5}} name="Submissions"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="ad-card">
        <h2 className="section-title">Top Courses by Strand (All Time)</h2>
        {data.coursesByStrand.length===0?<p className="ad-empty">No data.</p>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(240px,1fr))",gap:14}}>
            {data.coursesByStrand.map((s,si)=>(
              <div key={si} style={{background:"var(--bg-raised)",border:"1px solid var(--border)",borderRadius:10,padding:14}}>
                <div style={{fontSize:11,textTransform:"uppercase",letterSpacing:1,color:STRAND_COLORS[si%STRAND_COLORS.length],marginBottom:10,fontWeight:700}}>{s.strand||"Unknown"}</div>
                {s.courses.map((c,ci)=>(
                  <div key={ci} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:ci<s.courses.length-1?"1px solid var(--border)":"none"}}>
                    <span style={{color:"var(--text-primary)"}}>{c.course}</span>
                    <span style={{color:STRAND_COLORS[si%STRAND_COLORS.length],fontWeight:700}}>{c.count}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ── ANALYTICS: ASSESSMENTS ────────────────────────────────────────────────────
function AssessmentsAnalytics({ range }) {
  const [data,setData]=useState(null); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  useEffect(()=>{ setLoading(true); apiFetch(`/api/admin/analytics/assessments?range=${range}`).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false)); },[range]);
  if(loading) return <Spinner/>;
  if(error) return <div className="ad-error">{error}</div>;
  if(!data) return null;
  const riasecRadar = Object.entries(data.avgRiasecScores).map(([code,value])=>({
    code: code.slice(0,3).toUpperCase(), fullCode:code, value:parseFloat(value)||0,
  }));
  return (
    <div className="ad-content">
      <div className="ad-stats-grid">
        <StatCard label="Total Completions"    value={data.totalSubmissions}   accent="#6ee7b7"/>
        <StatCard label="Completions in Range" value={data.submissionsInRange} sub="in selected range" accent="#93c5fd"/>
      </div>
      <div className="ad-card">
        <h2 className="section-title">Daily Submission Trend</h2>
        {data.submissionTrend.length===0?<p className="ad-empty">No data.</p>:(
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={data.submissionTrend} margin={{top:8,right:16,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)"/>
              <XAxis dataKey="date" tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={TT}/>
              <Line type="monotone" dataKey="count" stroke="#fcd34d" strokeWidth={2.5} dot={{r:3,fill:"#fcd34d"}} activeDot={{r:5}} name="Completions"/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="ad-bottom-grid">
        <div className="ad-card">
          <h2 className="section-title">Avg Aptitude Scores</h2>
          <div className="ad-apt-grid">
            {Object.entries(data.avgAptitudeScores).map(([subj,pct],i)=>(
              <div key={subj} className="ad-apt-item">
                <div className="ad-apt-subject">{subj}</div>
                <div className="ad-apt-pct" style={{color:STRAND_COLORS[i]}}>{pct}%</div>
              </div>
            ))}
          </div>
        </div>
        <div className="ad-card">
          <h2 className="section-title">Avg RIASEC Profile</h2>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={riasecRadar} margin={{top:8,right:20,bottom:8,left:20}}>
              <PolarGrid stroke="rgba(255,255,255,0.08)"/>
              <PolarAngleAxis dataKey="code" tick={{fill:"#7a90b0",fontSize:11}}/>
              <Radar dataKey="value" stroke="#6ee7b7" fill="#6ee7b7" fillOpacity={0.2} strokeWidth={2}/>
              <Tooltip contentStyle={TT} formatter={(v,n,p)=>[v.toFixed(2),p.payload.fullCode]}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="ad-card">
          <h2 className="section-title">Submissions by Strand</h2>
          {data.topStrandsBySubmission.length===0?<p className="ad-empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.topStrandsBySubmission} layout="vertical" margin={{top:0,right:16,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false}/>
                <XAxis type="number" tick={{fill:"#7a90b0",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <YAxis dataKey="strand" type="category" tick={{fill:"#eef2f8",fontSize:11}} tickLine={false} axisLine={false} width={80}/>
                <Tooltip contentStyle={TT}/>
                <Bar dataKey="count" radius={[0,4,4,0]} name="Submissions">
                  {data.topStrandsBySubmission.map((_,i)=><Cell key={i} fill={STRAND_COLORS[i%STRAND_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}

// ── QUESTION MODAL ─────────────────────────────────────────────────────────────
function QuestionModal({ pool, editDoc, onClose, onSaved }) {
  const isEdit = !!editDoc;
  const [form,setForm] = useState(()=>{
    if(isEdit) {
      return {
        ...editDoc,
        options: normalizeOptions(editDoc.options),
      };
    }
    return {
      pool,
      text:"",
      subcategory: pool==="riasec" ? RIASEC_SUBS[0] : pool==="bigfive" ? BIGFIVE_SUBS[0] : "",
      reverse_scored: false,
      subject: "math",
      topic: APT_TOPICS["math"][0],
      difficulty: "easy",
      options:{A:"",B:"",C:"",D:""},
      correct_answer:"A",
    };
  });
  const [saving,setSaving]=useState(false); const [error,setError]=useState("");

  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const setOpt = (k,v) => setForm(f=>({...f,options:{...f.options,[k]:v}}));

  // When subject changes, reset topic
  const handleSubjectChange = (subj) => {
    set("subject", subj);
    set("topic", APT_TOPICS[subj]?.[0] || "");
  };

  async function handleSave() {
    if(!form.text.trim()){ setError("Question text is required."); return; }
    setSaving(true); setError("");
    try {
      const payload = { ...form };
      // Send options as dict always
      if(payload.options && typeof payload.options === "object" && !Array.isArray(payload.options)){
        // already dict, fine
      }
      if(isEdit) {
        await apiFetch(`/api/admin/questions/${editDoc.id}`, { method:"PUT", body:JSON.stringify(payload) });
      } else {
        await apiFetch("/api/admin/questions", { method:"POST", body:JSON.stringify(payload) });
      }
      onSaved();
    } catch(e){ setError(e.message); } finally { setSaving(false); }
  }

  return (
    <div className="ad-modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="ad-modal">
        <h2 className="ad-modal-title">{isEdit?"Edit Question":"Add Question"}</h2>
        {error && <div className="ad-error">{error}</div>}

        {!isEdit && (
          <div className="ad-form-row">
            <label>Pool</label>
            <select className="ad-select" value={form.pool} onChange={e=>set("pool",e.target.value)}>
              <option value="riasec">RIASEC</option>
              <option value="bigfive">Big Five</option>
              <option value="aptitude">Aptitude</option>
            </select>
          </div>
        )}

        <div className="ad-form-row">
          <label>Question Text *</label>
          <textarea className="ad-textarea" value={form.text} onChange={e=>set("text",e.target.value)} placeholder="Enter question text…"/>
        </div>

        {form.pool==="riasec" && (
          <div className="ad-form-row">
            <label>Subcategory</label>
            <select className="ad-select" value={form.subcategory||""} onChange={e=>set("subcategory",e.target.value)}>
              {RIASEC_SUBS.map(s=><option key={s} value={s} style={{textTransform:"capitalize"}}>{s}</option>)}
            </select>
          </div>
        )}

        {form.pool==="bigfive" && (
          <>
            <div className="ad-form-row">
              <label>Trait (Subcategory)</label>
              <select className="ad-select" value={form.subcategory||""} onChange={e=>set("subcategory",e.target.value)}>
                {BIGFIVE_SUBS.map(s=><option key={s} value={s} style={{textTransform:"capitalize"}}>{s}</option>)}
              </select>
            </div>
            <div className="ad-form-row" style={{flexDirection:"row",alignItems:"center",gap:10}}>
              <input type="checkbox" id="rev" checked={!!form.reverse_scored} onChange={e=>set("reverse_scored",e.target.checked)} style={{accentColor:"var(--accent)",width:16,height:16}}/>
              <label htmlFor="rev" style={{textTransform:"none",letterSpacing:0,fontSize:13,color:"var(--text-primary)",cursor:"pointer",fontWeight:400}}>Reverse scored</label>
            </div>
          </>
        )}

        {form.pool==="aptitude" && (
          <>
            <div className="ad-form-row">
              <label>Subject</label>
              <select className="ad-select" value={form.subject||"math"} onChange={e=>handleSubjectChange(e.target.value)}>
                {APT_SUBJECTS.map(s=><option key={s} value={s} style={{textTransform:"capitalize"}}>{s}</option>)}
              </select>
            </div>
            <div className="ad-form-row">
              <label>Topic</label>
              <select className="ad-select" value={form.topic||""} onChange={e=>set("topic",e.target.value)}>
                {(APT_TOPICS[form.subject]||[]).map(t=>(
                  <option key={t} value={t} style={{textTransform:"capitalize"}}>{t.replace(/_/g," ")}</option>
                ))}
              </select>
            </div>
            <div className="ad-form-row">
              <label>Difficulty</label>
              <select className="ad-select" value={form.difficulty||"easy"} onChange={e=>set("difficulty",e.target.value)}>
                {APT_DIFFS.map(d=><option key={d} value={d} style={{textTransform:"capitalize"}}>{d}</option>)}
              </select>
            </div>
            <div className="ad-form-row">
              <label>Answer Choices <span style={{color:"var(--text-muted)",textTransform:"none",fontSize:11}}>(click ✓ to mark correct)</span></label>
              <div className="ad-options-grid">
                {["A","B","C","D"].map(k=>(
                  <div key={k} className="ad-opt-row">
                    <span className="ad-opt-key">{k}</span>
                    <input className="ad-input" style={{flex:1}} value={form.options?.[k]||""} onChange={e=>setOpt(k,e.target.value)} placeholder={`Option ${k}`}/>
                    <button type="button" className={`ad-opt-correct-btn ${form.correct_answer===k?"active":""}`} onClick={()=>set("correct_answer",k)} title="Mark as correct">✓</button>
                  </div>
                ))}
              </div>
              <div style={{marginTop:8,fontSize:12,color:"var(--text-muted)"}}>Correct answer: <strong style={{color:"var(--accent)"}}>{form.correct_answer}</strong> — {form.options?.[form.correct_answer]||"(empty)"}</div>
            </div>
          </>
        )}

        <div className="ad-modal-actions">
          <button className="ad-btn ad-btn-ghost" onClick={onClose}>Cancel</button>
          <button className="ad-btn ad-btn-primary" onClick={handleSave} disabled={saving}>
            {saving?"Saving…":isEdit?"Save Changes":"Create Question"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── QUESTIONS PANEL ──────────────────────────────────────────────────────────
function QuestionsPanel() {
  const [pool,setPool]               = useState("riasec");
  const [subcategory,setSubcategory] = useState("");
  const [subject,setSubject]         = useState("");
  const [topic,setTopic]             = useState("");
  const [difficulty,setDifficulty]   = useState("");
  const [activeFilter,setActiveF]    = useState("");
  const [page,setPage]               = useState(1);
  const [data,setData]               = useState(null);
  const [loading,setLoading]         = useState(true);
  const [error,setError]             = useState("");
  const [toast,setToast]             = useState("");
  const [modal,setModal]             = useState(null);

  const LIMIT = 20;

  // Reset filters when pool changes
  useEffect(()=>{ setSubcategory(""); setSubject(""); setTopic(""); setDifficulty(""); setPage(1); },[pool]);
  // Reset topic when subject changes
  useEffect(()=>{ setTopic(""); },[subject]);

  const load = useCallback(async()=>{
    setLoading(true); setError("");
    try {
      const p = new URLSearchParams({ pool, page, limit:LIMIT });
      if(activeFilter!==""){ p.set("active",activeFilter); }
      if((pool==="riasec"||pool==="bigfive") && subcategory) p.set("subcategory",subcategory);
      if(pool==="aptitude"){
        if(subject)    p.set("subject",subject);
        if(topic)      p.set("topic",topic);
        if(difficulty) p.set("difficulty",difficulty);
        // topic is a front-end filter only (not in backend API) — filter client-side below
      }
      const d = await apiFetch(`/api/admin/questions?${p}`);
      setData(d);
    } catch(e){ setError(e.message); }
    finally{ setLoading(false); }
  },[pool,page,activeFilter,subcategory,subject,topic,difficulty]);
  

  useEffect(()=>{ load(); },[load]);

  const showToast = msg => { setToast(msg); setTimeout(()=>setToast(""),3000); };

  const handleToggle = async(q) => {
    try {
      const r = await apiFetch(`/api/admin/questions/${q.id}/toggle?pool=${pool}`,{method:"PATCH"});
      showToast(r.message); load();
    } catch(e){ setError(e.message); }
  };

  // Client-side topic filter for aptitude (backend doesn't expose topic filter)
  const visibleQuestions = data?.questions || [];

  const totalPages = data ? Math.ceil(data.total/LIMIT) : 1;
  const topicOptions = subject ? (APT_TOPICS[subject]||[]) : [];

  return (
    <div>
      {toast && <div className="ad-success">{toast}</div>}
      {error && <div className="ad-error">{error}</div>}

      <div className="ad-q-toolbar">
        {/* Pool */}
        <select value={pool} onChange={e=>setPool(e.target.value)} title="Pool">
          <option value="riasec">RIASEC</option>
          <option value="bigfive">Big Five</option>
          <option value="aptitude">Aptitude</option>
        </select>

        {/* Status */}
        <select value={activeFilter} onChange={e=>{ setActiveF(e.target.value); setPage(1); }} title="Status">
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>

        {/* RIASEC subcategory */}
        {pool==="riasec" && (
          <select value={subcategory} onChange={e=>{ setSubcategory(e.target.value); setPage(1); }} title="Subcategory">
            <option value="">All subcategories</option>
            {RIASEC_SUBS.map(s=><option key={s} value={s} style={{textTransform:"capitalize"}}>{s}</option>)}
          </select>
        )}

        {/* Big Five subcategory */}
        {pool==="bigfive" && (
          <select value={subcategory} onChange={e=>{ setSubcategory(e.target.value); setPage(1); }} title="Trait">
            <option value="">All traits</option>
            {BIGFIVE_SUBS.map(s=><option key={s} value={s} style={{textTransform:"capitalize"}}>{s}</option>)}
          </select>
        )}

        {/* Aptitude filters */}
        {pool==="aptitude" && (
          <>
            <select value={subject} onChange={e=>{ setSubject(e.target.value); setTopic(""); setPage(1); }} title="Subject">
              <option value="">All subjects</option>
              {APT_SUBJECTS.map(s=><option key={s} value={s} style={{textTransform:"capitalize"}}>{s}</option>)}
            </select>
            <select value={topic} onChange={e=>setTopic(e.target.value)} title="Topic" disabled={!subject}>
              <option value="">All topics</option>
              {topicOptions.map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
            </select>
            <select value={difficulty} onChange={e=>{ setDifficulty(e.target.value); setPage(1); }} title="Difficulty">
              <option value="">All difficulty</option>
              {APT_DIFFS.map(d=><option key={d} value={d} style={{textTransform:"capitalize"}}>{d}</option>)}
            </select>
          </>
        )}

        <button className="ad-btn ad-btn-primary" style={{marginLeft:"auto"}} onClick={()=>setModal("new")}>
          + Add Question
        </button>
      </div>

      {loading ? <Spinner/> : data && (
        <>
          <div style={{fontSize:12,color:"var(--text-muted)",marginBottom:12}}>
            {data.total} question{data.total!==1?"s":""}
            
          </div>
          <div className="ad-q-table-wrap">
            <table className="ad-q-table">
              <thead>
                <tr>
                  <th style={{minWidth:260}}>Question</th>
                  <th>Subcategory / Subject</th>
                  {pool==="aptitude" && <th>Topic</th>}
                  {pool==="aptitude" && <th>Diff</th>}
                  {pool==="aptitude" && <th style={{minWidth:200}}>Choices</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleQuestions.length===0 && (
                  <tr><td colSpan={8} style={{textAlign:"center",color:"var(--text-muted)",padding:28}}>No questions found.</td></tr>
                )}
                {visibleQuestions.map(q=>{
                  const opts = normalizeOptions(q.options);
                  return (
                    <tr key={q.id}>
                      <td>
                        <span className="ad-q-text" title={q.text}>{q.text}</span>
                        {pool==="bigfive" && q.reverse_scored && (
                          <span className="ad-badge ad-badge-orange" style={{marginTop:4,display:"inline-block"}}>reverse</span>
                        )}
                      </td>
                      <td>{subBadge(q.subcategory||q.subject)}</td>
                      {pool==="aptitude" && <td style={{fontSize:12,color:"var(--text-secondary)"}}>{q.topic ? q.topic.replace(/_/g," ") : "—"}</td>}
                      {pool==="aptitude" && <td>{diffBadge(q.difficulty)}</td>}
                      {pool==="aptitude" && (
                        <td>
                          <div className="ad-q-options">
                            {["A","B","C","D"].map(k=>(
                              <div key={k} className={`ad-q-opt ${q.correct_answer===k?"correct":""}`}>
                                <span className="ad-q-opt-key">{k}.</span>
                                <span className="ad-q-opt-val" title={opts[k]||""}>{opts[k]||<em style={{color:"var(--text-muted)"}}>—</em>}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                      <td>
                        <span className={`ad-badge ${q.active?"ad-badge-green":"ad-badge-red"}`}>
                          {q.active?"Active":"Inactive"}
                        </span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:6}}>
                          <button className="ad-btn ad-btn-ghost ad-btn-sm" onClick={()=>setModal(q)}>Edit</button>
                          <button className={`ad-btn ad-btn-sm ${q.active?"ad-btn-danger":"ad-btn-ghost"}`} onClick={()=>handleToggle(q)}>
                            {q.active?"Deactivate":"Activate"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="ad-pagination">
            <button className="ad-page-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button className="ad-page-btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
          </div>
        </>
      )}

      {modal && (
        <QuestionModal
          pool={pool}
          editDoc={modal==="new"?null:modal}
          onClose={()=>setModal(null)}
          onSaved={()=>{ setModal(null); showToast("Question saved."); load(); }}
        />
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const TABS = [
  { key:"users",       label:"Users"       },
  { key:"courses",     label:"Courses"     },
  { key:"assessments", label:"Assessments" },
  { key:"questions",   label:"Questions"   },
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user]   = useState(()=>JSON.parse(localStorage.getItem("coursify_user")||"{}"));
  const [authorized, setAuthorized] = useState(false);
  const [tab,setTab]     = useState("users");
  const [range,setRange] = useState("7d");

  useEffect(()=>{
    const role = localStorage.getItem("coursify_role");
    const token = localStorage.getItem("token");
    if(!token || !["admin","superadmin"].includes(role)) {
      navigate("/dashboard");
    } else {
      setAuthorized(true); // ← only show dashboard if authorized
    }
  },[navigate]);

  if(!authorized) return null;

  const subtitles = {
    users:       "Registration trends and user breakdowns",
    courses:     "Most-recommended courses and submission trends",
    assessments: "Completion rates and score averages",
    questions:   "Add, edit, and manage assessment pool questions",
  };

  return (
    <>
      <style>{CSS}</style>
      <div className="ad-root">
        <aside className="ad-sidebar" style={{display:"flex"}}>
          <div className="ad-logo">
            <span className="ad-logo-mark">C</span>
            <span className="ad-logo-text">Coursify</span>
          </div>
          <nav className="ad-nav">
            <span className="ad-nav-section">Admin</span>
            {TABS.map(t=>(
              <button key={t.key} className={`ad-nav-item ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
                <span className="ad-nav-icon">
                  {t.key==="users"?"▦":t.key==="courses"?"🎯":t.key==="assessments"?"📊":"📝"}
                </span>
                {t.label}
              </button>
            ))}
            {user.role==="superadmin" && (
              <>
                <span className="ad-nav-section">Superadmin</span>
                <button className="ad-nav-item" onClick={()=>navigate("/superadmin/dashboard")}>
                  <span className="ad-nav-icon">⬡</span> Users
                </button>
              </>
            )}
            <span className="ad-nav-section">Navigate</span>
            <button className="ad-nav-item" onClick={()=>navigate("/dashboard")}>
              <span className="ad-nav-icon">⌂</span> Student View
            </button>
          </nav>
          <div className="ad-sidebar-footer">
            <div className="ad-avatar">{user.username?.[0]?.toUpperCase()??"A"}</div>
            <div className="ad-sidebar-user">
              <span className="ad-sidebar-name">{user.username}</span>
              <span className="ad-sidebar-role">{user.role}</span>
            </div>
            <button className="ad-logout" title="Logout" onClick={()=>{ localStorage.clear(); navigate("/"); }}>⏻</button>
          </div>
        </aside>

        <main className="ad-main">
          <header className="ad-header">
            <div>
              <h1 className="ad-title">{TABS.find(t=>t.key===tab)?.label}</h1>
              <p className="ad-subtitle">{subtitles[tab]}</p>
            </div>
            {tab!=="questions" && (
              <div className="ad-range-tabs">
                {RANGE_OPTIONS.map(o=>(
                  <button key={o.value} className={`ad-range-btn ${range===o.value?"active":""}`} onClick={()=>setRange(o.value)}>
                    {o.label}
                  </button>
                ))}
              </div>
            )}
          </header>

          <div className="ad-tab-bar">
            {TABS.map(t=>(
              <button key={t.key} className={`ad-tab ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
                {t.label}
              </button>
            ))}
          </div>

          {tab==="users"       && <UsersAnalytics       token={getToken()} range={range}/>}
          {tab==="courses"     && <CoursesAnalytics     range={range}/>}
          {tab==="assessments" && <AssessmentsAnalytics range={range}/>}
          {tab==="questions"   && <QuestionsPanel/>}
        </main>
      </div>
    </>
  );
}