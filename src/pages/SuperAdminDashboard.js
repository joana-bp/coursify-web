import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import API_BASE_URL from "../config/api";

const API = API_BASE_URL;

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: "7d" },
  { label: "Last 30 days", value: "30d" },
  { label: "All time", value: "all" },
];

const STRAND_COLORS = ["#a78bfa","#60a5fa","#34d399","#fb923c","#f472b6","#fbbf24","#38bdf8","#a3e635"];

const RIASEC_SUBS  = ["realistic","investigative","artistic","social","enterprising","conventional"];
const APT_SUBJECTS = ["math","english","science","abstract","programming"];
const APT_TOPICS   = {
  math:        ["algebra","geometry","statistics","logic"],
  english:     ["grammar_and_sentence_structure","reading_comprehension","vocabulary_and_context_clues","logical_verbal_reasoning"],
  science:     ["biology","physics","chemistry","earth_and_environmental_science"],
  abstract:    ["pattern_recognition","spatial_reasoning","logical_sequences","analogical_reasoning"],
  programming: ["fundamentals","data_structures","algorithms","web_development"],
};
const APT_DIFFS = ["easy","medium","hard"];
const ROLES = ["user","admin","superadmin"];
const PER_PAGE = 20;
const Q_LIMIT  = 20;

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Outfit:wght@300;400;500;600;700;800&display=swap');

*,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}

:root{
  --bg:#060c18;
  --bg-s:#0a1220;
  --bg-r:#0f1a2e;
  --bg-h:#162038;
  --bd:#182236;
  --bd-l:#1e2d47;
  --bd-m:#243554;

  --t1:#e8edf5;
  --t2:#8494ad;
  --t3:#4a5e78;

  --acc:#a78bfa;
  --acc-d:rgba(167,139,250,.12);
  --acc-b:rgba(167,139,250,.3);

  --grn:#34d399;
  --grn-d:rgba(52,211,153,.1);
  --grn-b:rgba(52,211,153,.25);

  --blu:#60a5fa;
  --blu-d:rgba(96,165,250,.1);
  --blu-b:rgba(96,165,250,.25);

  --amb:#fbbf24;
  --amb-d:rgba(251,191,36,.1);
  --amb-b:rgba(251,191,36,.25);

  --red:#f87171;
  --red-d:rgba(248,113,113,.08);
  --red-b:rgba(248,113,113,.22);

  --ora:#fb923c;
  --ora-d:rgba(251,146,60,.1);
  --ora-b:rgba(251,146,60,.25);

  --r-sm:6px;--r-md:10px;--r-lg:16px;--r-xl:22px;
  --sw:240px;
  --font:'Outfit',sans-serif;
  --mono:'DM Mono',monospace;
}

body{background:var(--bg);font-family:var(--font);}

/* LAYOUT */
.root{display:flex;min-height:100vh;background:var(--bg);color:var(--t1);}

/* SIDEBAR */
.sb{width:var(--sw);min-height:100vh;background:var(--bg-s);border-right:1px solid var(--bd);display:flex;flex-direction:column;position:sticky;top:0;height:100vh;overflow-y:auto;flex-shrink:0;z-index:20;}
.sb-logo{display:flex;align-items:center;gap:11px;padding:26px 20px;border-bottom:1px solid var(--bd);}
.sb-mark{width:36px;height:36px;border-radius:10px;background:var(--acc);color:var(--bg);display:grid;place-items:center;font-weight:800;font-size:18px;letter-spacing:-1px;flex-shrink:0;}
.sb-name{font-weight:800;font-size:17px;letter-spacing:-.4px;}
.sb-name span{color:var(--acc);}
.sb-nav{flex:1;padding:16px 10px;display:flex;flex-direction:column;gap:2px;}
.sb-sec{font-size:9.5px;text-transform:uppercase;letter-spacing:1.2px;color:var(--t3);padding:14px 10px 5px;font-weight:600;}
.sb-item{width:100%;border:none;outline:none;background:transparent;color:var(--t2);display:flex;align-items:center;gap:9px;padding:9px 10px;border-radius:var(--r-sm);cursor:pointer;transition:.15s;font-size:13.5px;font-weight:500;font-family:var(--font);position:relative;text-align:left;}
.sb-item:hover{background:var(--bg-r);color:var(--t1);}
.sb-item.active{background:var(--acc-d);color:var(--acc);}
.sb-item.active::before{content:'';position:absolute;left:0;top:50%;transform:translateY(-50%);width:3px;height:16px;background:var(--acc);border-radius:0 3px 3px 0;}
.sb-icon{font-size:15px;width:17px;text-align:center;flex-shrink:0;}
.sb-badge{margin-left:auto;font-size:10px;font-weight:700;padding:2px 7px;border-radius:20px;background:var(--acc-d);color:var(--acc);}
.sb-badge.red{background:var(--red-d);color:var(--red);}
.sb-foot{border-top:1px solid var(--bd);padding:16px;display:flex;align-items:center;gap:10px;margin-top:auto;}
.sb-av{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,var(--acc),#7c3aed);color:#fff;display:grid;place-items:center;font-weight:700;font-size:13px;flex-shrink:0;}
.sb-user{flex:1;min-width:0;}
.sb-uname{display:block;font-size:13px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-urole{font-size:10px;color:var(--acc);text-transform:uppercase;letter-spacing:.5px;margin-top:1px;}
.sb-out{border:none;background:transparent;color:var(--t3);cursor:pointer;font-size:14px;padding:5px;border-radius:var(--r-sm);transition:.15s;}
.sb-out:hover{color:var(--red);background:var(--red-d);}

/* MAIN */
.main{flex:1;padding:36px 40px;min-width:0;overflow-x:hidden;}
.ph{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;flex-wrap:wrap;margin-bottom:28px;}
.ph-l h1{font-size:26px;font-weight:800;letter-spacing:-.5px;}
.ph-l p{margin-top:5px;color:var(--t2);font-size:13px;}

/* RANGE TABS */
.rtabs{display:flex;gap:6px;}
.rtab{border:1px solid var(--bd-l);background:var(--bg-s);color:var(--t2);padding:8px 15px;border-radius:var(--r-md);cursor:pointer;font-size:13px;font-family:var(--font);font-weight:500;transition:.15s;}
.rtab:hover{color:var(--t1);}
.rtab.active{background:var(--acc-d);border-color:var(--acc-b);color:var(--acc);}

/* SECTION TABS */
.stabs{display:flex;gap:2px;margin-bottom:26px;border-bottom:1px solid var(--bd);padding-bottom:0;}
.stab{border:none;background:transparent;color:var(--t2);padding:10px 16px;cursor:pointer;font-size:13.5px;font-weight:500;font-family:var(--font);border-bottom:2px solid transparent;margin-bottom:-1px;transition:.15s;}
.stab:hover{color:var(--t1);}
.stab.active{color:var(--acc);border-bottom-color:var(--acc);}

/* GRID STATS */
.sg{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-bottom:22px;}
.sc{background:var(--bg-s);border:1px solid var(--bd);border-top:3px solid var(--ac,#a78bfa);border-radius:var(--r-lg);padding:20px;}
.sc-val{display:block;font-size:32px;font-weight:800;color:var(--ac,#a78bfa);letter-spacing:-1px;}
.sc-lbl{display:block;margin-top:5px;color:var(--t2);font-size:12.5px;}
.sc-sub{display:block;font-size:11px;color:var(--t3);margin-top:2px;}

/* CARD */
.card{background:var(--bg-s);border:1px solid var(--bd);border-radius:var(--r-lg);padding:22px;}
.card-t{font-size:14.5px;font-weight:700;margin-bottom:16px;color:var(--t1);}
.grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;}
.col{display:flex;flex-direction:column;gap:16px;}

/* POOL STAT PILLS */
.pool-pills{display:flex;gap:10px;flex-wrap:wrap;margin-bottom:18px;}
.pool-pill{display:flex;flex-direction:column;align-items:center;padding:14px 22px;border-radius:var(--r-lg);border:1px solid var(--bd-l);background:var(--bg-r);gap:4px;min-width:110px;cursor:pointer;transition:.15s;}
.pool-pill:hover{border-color:var(--bd-m);}
.pool-pill.active{border-color:var(--acc-b);background:var(--acc-d);}
.pool-pill-num{font-size:24px;font-weight:800;letter-spacing:-1px;}
.pool-pill-lbl{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--t2);font-weight:600;}
.pool-pill-sub{font-size:10px;color:var(--t3);}

/* TOOLBAR */
.qtb{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px;align-items:center;}
.qtb select,.qtb input[type=text]{background:var(--bg-r);border:1px solid var(--bd-l);color:var(--t1);border-radius:var(--r-sm);padding:8px 11px;font-size:13px;font-family:var(--font);outline:none;transition:.15s;}
.qtb select:focus,.qtb input[type=text]:focus{border-color:var(--acc-b);}
.qtb select option{background:var(--bg-r);}

/* BULK BAR */
.bulk-bar{display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--acc-d);border:1px solid var(--acc-b);border-radius:var(--r-md);margin-bottom:14px;font-size:13px;}
.bulk-bar-count{font-weight:700;color:var(--acc);}

/* BUTTONS */
.btn{border:none;border-radius:var(--r-sm);padding:9px 15px;font-size:13px;font-weight:600;font-family:var(--font);cursor:pointer;transition:.15s;display:inline-flex;align-items:center;gap:6px;}
.btn-p{background:var(--acc);color:var(--bg);}
.btn-p:hover{opacity:.88;}
.btn-g{background:var(--bg-r);color:var(--t2);border:1px solid var(--bd-l);}
.btn-g:hover{color:var(--t1);border-color:var(--bd-m);}
.btn-d{background:var(--red-d);color:var(--red);border:1px solid var(--red-b);}
.btn-d:hover{background:rgba(248,113,113,.14);}
.btn-grn{background:var(--grn-d);color:var(--grn);border:1px solid var(--grn-b);}
.btn-grn:hover{background:rgba(52,211,153,.17);}
.btn-blu{background:var(--blu-d);color:var(--blu);border:1px solid var(--blu-b);}
.btn-blu:hover{background:rgba(96,165,250,.18);}
.btn-sm{padding:5px 10px;font-size:12px;}
.btn:disabled{opacity:.4;cursor:not-allowed;}

/* TABLE */
.tw{overflow-x:auto;}
.qt{width:100%;border-collapse:collapse;font-size:13px;}
.qt th{text-align:left;color:var(--t3);font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;padding:10px 12px;border-bottom:1px solid var(--bd);white-space:nowrap;}
.qt td{padding:11px 12px;border-bottom:1px solid var(--bd);vertical-align:top;}
.qt tr:last-child td{border-bottom:none;}
.qt tr:hover td{background:rgba(255,255,255,.015);}
.qt-check{width:36px;}
.qt-check input[type=checkbox]{accent-color:var(--acc);width:14px;height:14px;cursor:pointer;}

/* Q text */
.qtext{max-width:260px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;color:var(--t1);}
.q-opts{margin-top:5px;display:flex;flex-direction:column;gap:2px;}
.q-opt{font-size:11px;color:var(--t2);display:flex;gap:4px;}
.q-opt-k{font-weight:700;flex-shrink:0;width:13px;font-family:var(--mono);}
.q-opt-v{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:180px;}
.q-opt.cor .q-opt-k,.q-opt.cor .q-opt-v{color:var(--grn);}

/* BADGES */
.bd2{display:inline-block;padding:3px 8px;border-radius:20px;font-size:10.5px;font-weight:700;white-space:nowrap;}
.bg-grn{background:var(--grn-d);color:var(--grn);}
.bg-red{background:var(--red-d);color:var(--red);}
.bg-blu{background:var(--blu-d);color:var(--blu);}
.bg-amb{background:var(--amb-d);color:var(--amb);}
.bg-acc{background:var(--acc-d);color:var(--acc);}
.bg-ora{background:var(--ora-d);color:var(--ora);}
.bg-t3{background:rgba(74,94,120,.15);color:var(--t2);}

/* PAGINATION */
.pg{display:flex;align-items:center;gap:10px;justify-content:flex-end;margin-top:14px;font-size:13px;color:var(--t2);}
.pg-btn{background:var(--bg-r);border:1px solid var(--bd-l);color:var(--t2);padding:6px 12px;border-radius:var(--r-sm);cursor:pointer;font-family:var(--font);font-size:13px;transition:.15s;}
.pg-btn:disabled{opacity:.35;cursor:not-allowed;}
.pg-btn:not(:disabled):hover{color:var(--t1);}

/* MODAL */
.mo{position:fixed;inset:0;background:rgba(6,12,24,.88);display:flex;align-items:center;justify-content:center;z-index:999;padding:20px;backdrop-filter:blur(6px);}
.mo-box{background:var(--bg-s);border:1px solid var(--bd-l);border-radius:var(--r-xl);padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto;}
.mo-t{font-size:18px;font-weight:800;margin-bottom:22px;letter-spacing:-.3px;}
.fr{display:flex;flex-direction:column;gap:5px;margin-bottom:15px;}
.fr label{font-size:11px;color:var(--t2);font-weight:600;text-transform:uppercase;letter-spacing:.5px;}
.inp,.sel,.ta{background:var(--bg-r);border:1px solid var(--bd-l);color:var(--t1);border-radius:var(--r-sm);padding:10px 12px;font-size:13.5px;font-family:var(--font);outline:none;width:100%;transition:.15s;}
.inp:focus,.sel:focus,.ta:focus{border-color:var(--acc-b);}
.sel option{background:var(--bg-r);}
.ta{resize:vertical;min-height:76px;}
.opt-grid{display:flex;flex-direction:column;gap:7px;margin-top:5px;}
.opt-row{display:flex;gap:7px;align-items:center;}
.opt-k{font-size:13px;font-weight:700;color:var(--t3);width:15px;flex-shrink:0;text-align:center;font-family:var(--mono);}
.opt-cor{background:var(--bg-r);border:1px solid var(--bd-l);color:var(--t3);width:26px;height:26px;border-radius:var(--r-sm);cursor:pointer;font-size:12px;flex-shrink:0;display:grid;place-items:center;transition:.15s;}
.opt-cor.active{background:var(--grn-d);border-color:var(--grn-b);color:var(--grn);}
.mo-acts{display:flex;gap:10px;justify-content:flex-end;margin-top:20px;}

/* DRAWER (user profile) */
.dr-overlay{position:fixed;inset:0;background:rgba(6,12,24,.7);z-index:80;backdrop-filter:blur(3px);}
.dr{position:fixed;top:0;right:0;bottom:0;width:480px;max-width:100vw;background:var(--bg-s);border-left:1px solid var(--bd-l);z-index:81;overflow-y:auto;padding:28px;display:flex;flex-direction:column;gap:20px;}
.dr-head{display:flex;align-items:flex-start;justify-content:space-between;}
.dr-av{width:52px;height:52px;border-radius:50%;background:linear-gradient(135deg,var(--acc),#7c3aed);color:#fff;display:grid;place-items:center;font-size:20px;font-weight:700;flex-shrink:0;}
.dr-info{flex:1;margin-left:14px;}
.dr-name{font-size:17px;font-weight:700;}
.dr-email{font-size:12.5px;color:var(--t2);margin-top:2px;}
.dr-close{background:transparent;border:none;color:var(--t3);cursor:pointer;font-size:18px;padding:4px;}
.dr-close:hover{color:var(--red);}
.dr-sec{border-top:1px solid var(--bd);padding-top:18px;}
.dr-sec-t{font-size:11px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);font-weight:600;margin-bottom:12px;}
.dr-row{display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--bd);font-size:13px;}
.dr-row:last-child{border-bottom:none;}
.dr-key{color:var(--t2);}
.dr-val{font-weight:500;}
.res-card{background:var(--bg-r);border:1px solid var(--bd);border-radius:var(--r-md);padding:14px;margin-bottom:10px;}
.res-card-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;}
.res-card-date{font-size:11px;color:var(--t3);}
.score-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:8px;}
.score-item{background:var(--bg-s);border-radius:var(--r-sm);padding:10px;text-align:center;}
.score-val{font-size:18px;font-weight:800;display:block;}
.score-lbl{font-size:10px;color:var(--t2);text-transform:uppercase;letter-spacing:.5px;display:block;margin-top:2px;}
.recs{display:flex;flex-direction:column;gap:5px;margin-top:10px;}
.rec-item{display:flex;justify-content:space-between;padding:6px 10px;background:var(--bg-s);border-radius:var(--r-sm);font-size:12px;}
.rec-name{color:var(--t1);}
.rec-rank{color:var(--t3);font-size:11px;}

/* STATES */
.loading{display:flex;flex-direction:column;align-items:center;gap:14px;color:var(--t2);padding:60px 0;}
.spin{width:32px;height:32px;border:3px solid var(--bd);border-top-color:var(--acc);border-radius:50%;animation:spin .7s linear infinite;}
.err{background:var(--red-d);border:1px solid var(--red-b);color:#fca5a5;padding:12px 15px;border-radius:var(--r-md);margin-bottom:18px;font-size:13px;}
.suc{background:var(--grn-d);border:1px solid var(--grn-b);color:var(--grn);padding:11px 15px;border-radius:var(--r-md);margin-bottom:14px;font-size:13px;}
.empty{color:var(--t3);font-size:13px;padding:20px 0;text-align:center;}

/* COURSE LIST */
.crs-list{display:flex;flex-direction:column;gap:8px;}
.crs-row{display:flex;justify-content:space-between;align-items:center;padding:10px 13px;border-radius:var(--r-md);background:var(--bg-r);border:1px solid var(--bd);font-size:13px;gap:8px;}
.crs-rank{color:var(--t3);font-size:10.5px;width:18px;flex-shrink:0;font-family:var(--mono);}
.crs-name{flex:1;}
.crs-cnt{font-weight:700;color:var(--acc);}

/* APTITUDE TILES */
.apt-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(110px,1fr));gap:10px;}
.apt-tile{background:var(--bg-r);border:1px solid var(--bd);border-radius:var(--r-md);padding:14px;text-align:center;}
.apt-sub{font-size:10px;text-transform:uppercase;letter-spacing:1px;color:var(--t3);margin-bottom:7px;}
.apt-pct{font-size:26px;font-weight:800;}

/* USER TABLE */
.ut{width:100%;border-collapse:collapse;font-size:13px;}
.ut th{text-align:left;color:var(--t3);font-weight:600;font-size:10.5px;text-transform:uppercase;letter-spacing:.6px;padding:10px 13px;border-bottom:1px solid var(--bd);white-space:nowrap;}
.ut td{padding:11px 13px;border-bottom:1px solid var(--bd);vertical-align:middle;}
.ut tr:last-child td{border-bottom:none;}
.ut tr:hover td{background:rgba(255,255,255,.015);}
.ut tr.inactive{opacity:.45;}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;}
.dot-on{background:var(--grn);box-shadow:0 0 6px rgba(52,211,153,.5);}
.dot-off{background:var(--t3);}

/* FILTERS */
.filters{display:flex;gap:8px;margin-bottom:18px;flex-wrap:wrap;}
.f-inp{flex:1;min-width:200px;padding:9px 13px;background:var(--bg-s);border:1px solid var(--bd-l);border-radius:var(--r-md);color:var(--t1);font-size:13.5px;font-family:var(--font);outline:none;}
.f-inp::placeholder{color:var(--t3);}
.f-inp:focus{border-color:var(--acc-b);}
.f-sel{padding:9px 13px;background:var(--bg-s);border:1px solid var(--bd-l);border-radius:var(--r-md);color:var(--t1);font-size:13.5px;font-family:var(--font);outline:none;cursor:pointer;}
.f-sel option{background:var(--bg-r);}

/* AUDIT */
.au-item{display:flex;align-items:flex-start;gap:12px;padding:12px 0;border-bottom:1px solid var(--bd);}
.au-item:last-child{border-bottom:none;}
.au-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;flex-shrink:0;font-size:14px;}
.au-body{flex:1;}
.au-main{font-size:13px;font-weight:500;}
.au-by{font-size:11.5px;color:var(--t2);margin-top:2px;}
.au-time{font-size:11px;color:var(--t3);flex-shrink:0;white-space:nowrap;}

/* ROLE MODAL */
.role-opts{display:flex;flex-direction:column;gap:6px;margin:14px 0 20px;}
.role-opt{display:flex;align-items:center;gap:10px;padding:10px 13px;border-radius:var(--r-md);border:1px solid var(--bd);cursor:pointer;transition:.15s;}
.role-opt input{display:none;}
.role-opt.sel{border-color:var(--acc-b);background:var(--acc-d);}
.role-opt:hover:not(.sel){background:var(--bg-r);}

/* TOAST */
.toast{position:fixed;bottom:26px;right:26px;background:var(--bg-h);border:1px solid var(--bd-l);color:var(--t1);padding:12px 18px;border-radius:var(--r-md);font-size:13.5px;z-index:300;animation:slideup .2s ease;box-shadow:0 8px 32px rgba(0,0,0,.45);max-width:300px;}

@keyframes spin{to{transform:rotate(360deg)}}
@keyframes slideup{from{transform:translateY(12px);opacity:0}to{transform:none;opacity:1}}
@media(max-width:900px){.sb{display:none}.main{padding:20px}}
@media(max-width:640px){.main{padding:16px}.ph-l h1{font-size:22px}}
`;

const TT = {background:"#0f1a2e",border:"1px solid #182236",borderRadius:8,color:"#e8edf5",fontSize:12,fontFamily:"Outfit,sans-serif"};

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

function normalizeOptions(options) {
  if (!options) return {};
  if (Array.isArray(options)) return Object.fromEntries(options.map(o=>[o.label,o.value]));
  return options;
}

function SC({label,value,sub,color="#a78bfa"}) {
  return (
    <div className="sc" style={{"--ac":color}}>
      <span className="sc-val">{value??"-"}</span>
      <span className="sc-lbl">{label}</span>
      {sub&&<span className="sc-sub">{sub}</span>}
    </div>
  );
}

function Spin() {
  return <div className="loading"><div className="spin"/><span>Loading…</span></div>;
}

function poolBadge(pool) {
  const m={riasec:"bg-grn",aptitude:"bg-acc"};
  return <span className={`bd2 ${m[pool]||"bg-blu"}`}>{pool}</span>;
}
function diffBadge(d) {
  const m={easy:"bg-grn",medium:"bg-amb",hard:"bg-red"};
  return d?<span className={`bd2 ${m[d]||"bg-blu"}`}>{d}</span>:null;
}
function roleBadge(r) {
  const m={user:"bg-t3",admin:"bg-blu",superadmin:"bg-acc"};
  return <span className={`bd2 ${m[r]||"bg-t3"}`}>{r}</span>;
}

// ── ANALYTICS: USERS ─────────────────────────────────────────────────────────
function UsersAnalytics({range}) {
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{setLoading(true);apiFetch(`/api/admin/analytics?range=${range}`).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[range]);
  if(loading) return <Spin/>;
  if(error) return <div className="err">{error}</div>;
  if(!data) return null;
  return (
    <div className="col">
      <div className="sg">
        <SC label="Total Users"    value={data.totalUsers}    color="#a78bfa"/>
        <SC label="New Users"      value={data.newUsers}      sub="in selected range" color="#60a5fa"/>
        <SC label="Active"         value={data.activeUsers}   color="#34d399"/>
        <SC label="Inactive"       value={data.inactiveUsers} color="#f87171"/>
      </div>
      <div className="card">
        <div className="card-t">Registration Trend</div>
        {data.registrationTrend.length===0?<p className="empty">No registrations in this period.</p>:(
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.registrationTrend} margin={{top:6,right:14,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
              <XAxis dataKey="date" tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={TT} cursor={{stroke:"#a78bfa",strokeWidth:1}}/>
              <Line type="monotone" dataKey="count" stroke="#a78bfa" strokeWidth={2.5} dot={{r:3,fill:"#a78bfa"}} activeDot={{r:5}} name="Registrations"/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-t">By Strand</div>
          {data.strandBreakdown.length===0?<p className="empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.strandBreakdown} layout="vertical" margin={{top:0,right:14,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" horizontal={false}/>
                <XAxis type="number" tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <YAxis dataKey="strand" type="category" tick={{fill:"#e8edf5",fontSize:11}} tickLine={false} axisLine={false} width={78}/>
                <Tooltip contentStyle={TT}/>
                <Bar dataKey="count" radius={[0,4,4,0]} name="Users">
                  {data.strandBreakdown.map((_,i)=><Cell key={i} fill={STRAND_COLORS[i%STRAND_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="card-t">By Grade Level</div>
          {data.gradeLevelBreakdown.length===0?<p className="empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.gradeLevelBreakdown} margin={{top:0,right:14,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" vertical={false}/>
                <XAxis dataKey="gradeLevel" tick={{fill:"#e8edf5",fontSize:11}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={TT}/>
                <Bar dataKey="count" radius={[4,4,0,0]} name="Users">
                  {data.gradeLevelBreakdown.map((_,i)=><Cell key={i} fill={STRAND_COLORS[(i+3)%STRAND_COLORS.length]}/>)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card">
          <div className="card-t">Role Breakdown</div>
          <div style={{display:"flex",flexDirection:"column",gap:11}}>
            {Object.entries(data.roleBreakdown).map(([role,count])=>(
              <div key={role} style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                {roleBadge(role)}
                <span style={{fontSize:22,fontWeight:800,letterSpacing:"-1px"}}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── ANALYTICS: COURSES ────────────────────────────────────────────────────────
function CoursesAnalytics({range}) {
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  const [strand,setStrand]=useState("all");
  const strands=data?["all",...new Set(data.coursesByStrand.map(s=>s.strand).filter(Boolean))]:["all"];
  useEffect(()=>{setLoading(true);apiFetch(`/api/admin/analytics/courses?range=${range}&strand=${strand}`).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[range,strand]);
  if(loading) return <Spin/>;
  if(error) return <div className="err">{error}</div>;
  if(!data) return null;
  return (
    <div className="col">
      <div className="sg">
        <SC label="Total Submissions"    value={data.totalSubmissions}   color="#a78bfa"/>
        <SC label="Submissions in Range" value={data.submissionsInRange} sub="in selected range" color="#60a5fa"/>
      </div>
      <div style={{display:"flex",gap:7,flexWrap:"wrap",marginBottom:6}}>
        {strands.map(s=>(
          <button key={s} className={`rtab ${strand===s?"active":""}`} onClick={()=>setStrand(s)}>
            {s==="all"?"All Strands":s}
          </button>
        ))}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-t">Top 10 Recommended Courses</div>
          {data.topCourses.length===0?<p className="empty">No data for this period.</p>:(
            <div className="crs-list">
              {data.topCourses.map((c,i)=>(
                <div key={i} className="crs-row">
                  <span className="crs-rank">#{i+1}</span>
                  <span className="crs-name">{c.course}</span>
                  <span className="crs-cnt">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="card">
          <div className="card-t">Submission Trend</div>
          {data.courseTrend.length===0?<p className="empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.courseTrend} margin={{top:6,right:14,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
                <XAxis dataKey="date" tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false}/>
                <YAxis tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <Tooltip contentStyle={TT}/>
                <Line type="monotone" dataKey="count" stroke="#60a5fa" strokeWidth={2.5} dot={{r:3,fill:"#60a5fa"}} activeDot={{r:5}} name="Submissions"/>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
      <div className="card">
        <div className="card-t">Top Courses by Strand (All Time)</div>
        {data.coursesByStrand.length===0?<p className="empty">No data.</p>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:12}}>
            {data.coursesByStrand.map((s,si)=>(
              <div key={si} style={{background:"var(--bg-r)",border:"1px solid var(--bd)",borderRadius:10,padding:13}}>
                <div style={{fontSize:10,textTransform:"uppercase",letterSpacing:1,color:STRAND_COLORS[si%STRAND_COLORS.length],marginBottom:9,fontWeight:700}}>{s.strand||"Unknown"}</div>
                {s.courses.map((c,ci)=>(
                  <div key={ci} style={{display:"flex",justifyContent:"space-between",fontSize:12,padding:"5px 0",borderBottom:ci<s.courses.length-1?"1px solid var(--bd)":"none"}}>
                    <span style={{color:"var(--t1)"}}>{c.course}</span>
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
function AssessmentsAnalytics({range}) {
  const [data,setData]=useState(null);const [loading,setLoading]=useState(true);const [error,setError]=useState("");
  useEffect(()=>{setLoading(true);apiFetch(`/api/admin/analytics/assessments?range=${range}`).then(setData).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[range]);
  if(loading) return <Spin/>;
  if(error) return <div className="err">{error}</div>;
  if(!data) return null;
  const riasecRadar=Object.entries(data.avgRiasecScores).map(([code,value])=>({code:code.slice(0,3).toUpperCase(),fullCode:code,value:parseFloat(value)||0}));
  return (
    <div className="col">
      <div className="sg">
        <SC label="Total Completions"    value={data.totalSubmissions}   color="#a78bfa"/>
        <SC label="Completions in Range" value={data.submissionsInRange} sub="in selected range" color="#60a5fa"/>
      </div>
      <div className="card">
        <div className="card-t">Daily Submission Trend</div>
        {data.submissionTrend.length===0?<p className="empty">No data.</p>:(
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data.submissionTrend} margin={{top:6,right:14,left:0,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)"/>
              <XAxis dataKey="date" tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false}/>
              <YAxis tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
              <Tooltip contentStyle={TT}/>
              <Line type="monotone" dataKey="count" stroke="#fbbf24" strokeWidth={2.5} dot={{r:3,fill:"#fbbf24"}} activeDot={{r:5}} name="Completions"/>
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
      <div className="grid2">
        <div className="card">
          <div className="card-t">Avg Aptitude Scores</div>
          {/* Shows all APT_SUBJECTS including programming */}
          <div className="apt-grid">
            {APT_SUBJECTS.map((subj,i)=>{
              const pct=data.avgAptitudeScores?.[subj]??null;
              return (
                <div key={subj} className="apt-tile">
                  <div className="apt-sub">{subj}</div>
                  <div className="apt-pct" style={{color:STRAND_COLORS[i]}}>{pct!=null?`${pct}%`:"—"}</div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="card">
          <div className="card-t">Avg RIASEC Profile</div>
          <ResponsiveContainer width="100%" height={210}>
            <RadarChart data={riasecRadar} margin={{top:6,right:18,bottom:6,left:18}}>
              <PolarGrid stroke="rgba(255,255,255,.08)"/>
              <PolarAngleAxis dataKey="code" tick={{fill:"#8494ad",fontSize:11}}/>
              <Radar dataKey="value" stroke="#a78bfa" fill="#a78bfa" fillOpacity={0.2} strokeWidth={2}/>
              <Tooltip contentStyle={TT} formatter={(v,n,p)=>[v.toFixed(2),p.payload.fullCode]}/>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <div className="card-t">Submissions by Strand</div>
          {data.topStrandsBySubmission.length===0?<p className="empty">No data.</p>:(
            <ResponsiveContainer width="100%" height={190}>
              <BarChart data={data.topStrandsBySubmission} layout="vertical" margin={{top:0,right:14,left:0,bottom:0}}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,.06)" horizontal={false}/>
                <XAxis type="number" tick={{fill:"#8494ad",fontSize:11}} tickLine={false} axisLine={false} allowDecimals={false}/>
                <YAxis dataKey="strand" type="category" tick={{fill:"#e8edf5",fontSize:11}} tickLine={false} axisLine={false} width={78}/>
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

// ── QUESTION MODAL ────────────────────────────────────────────────────────────
function QuestionModal({pool,editDoc,onClose,onSaved}) {
  const isEdit=!!editDoc;
  const [form,setForm]=useState(()=>{
    if(isEdit) return {...editDoc,options:normalizeOptions(editDoc.options)};
    return {
      pool,
      text:"",
      subcategory: pool==="riasec" ? RIASEC_SUBS[0] : "",
      subject:"math",
      topic:APT_TOPICS["math"][0],
      difficulty:"easy",
      options:{A:"",B:"",C:"",D:""},
      correct_answer:"A",
    };
  });
  const [saving,setSaving]=useState(false);const [error,setError]=useState("");
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  const setOpt=(k,v)=>setForm(f=>({...f,options:{...f.options,[k]:v}}));
  const handleSubjectChange=subj=>{set("subject",subj);set("topic",APT_TOPICS[subj]?.[0]||"");};

  async function handleSave() {
    if(!form.text.trim()){setError("Question text is required.");return;}
    setSaving(true);setError("");
    try {
      if(isEdit) await apiFetch(`/api/admin/questions/${editDoc.id}`,{method:"PUT",body:JSON.stringify(form)});
      else       await apiFetch("/api/admin/questions",{method:"POST",body:JSON.stringify(form)});
      onSaved();
    } catch(e){setError(e.message);}finally{setSaving(false);}
  }

  return (
    <div className="mo" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="mo-box">
        <div className="mo-t">{isEdit?"Edit Question":"Add Question"}</div>
        {error&&<div className="err">{error}</div>}
        {!isEdit&&(
          <div className="fr"><label>Pool</label>
            <select className="sel" value={form.pool} onChange={e=>set("pool",e.target.value)}>
              <option value="riasec">RIASEC</option>
              <option value="aptitude">Aptitude</option>
            </select>
          </div>
        )}
        <div className="fr"><label>Question Text *</label>
          <textarea className="ta" value={form.text} onChange={e=>set("text",e.target.value)} placeholder="Enter question text…"/>
        </div>
        {form.pool==="riasec"&&(
          <div className="fr"><label>Subcategory</label>
            <select className="sel" value={form.subcategory||""} onChange={e=>set("subcategory",e.target.value)}>
              {RIASEC_SUBS.map(s=><option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}
        {form.pool==="aptitude"&&(
          <>
            <div className="fr"><label>Subject</label>
              <select className="sel" value={form.subject||"math"} onChange={e=>handleSubjectChange(e.target.value)}>
                {APT_SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="fr"><label>Topic</label>
              <select className="sel" value={form.topic||""} onChange={e=>set("topic",e.target.value)}>
                {(APT_TOPICS[form.subject]||[]).map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
              </select>
            </div>
            <div className="fr"><label>Difficulty</label>
              <select className="sel" value={form.difficulty||"easy"} onChange={e=>set("difficulty",e.target.value)}>
                {APT_DIFFS.map(d=><option key={d} value={d}>{d}</option>)}
              </select>
            </div>
            <div className="fr">
              <label>Answer Choices <span style={{color:"var(--t3)",textTransform:"none",fontSize:10.5}}>— click ✓ to mark correct</span></label>
              <div className="opt-grid">
                {["A","B","C","D"].map(k=>(
                  <div key={k} className="opt-row">
                    <span className="opt-k">{k}</span>
                    <input className="inp" style={{flex:1}} value={form.options?.[k]||""} onChange={e=>setOpt(k,e.target.value)} placeholder={`Option ${k}`}/>
                    <button type="button" className={`opt-cor ${form.correct_answer===k?"active":""}`} onClick={()=>set("correct_answer",k)} title="Mark correct">✓</button>
                  </div>
                ))}
              </div>
              <div style={{marginTop:7,fontSize:12,color:"var(--t3)"}}>Correct: <strong style={{color:"var(--grn)"}}>{form.correct_answer}</strong> — {form.options?.[form.correct_answer]||"(empty)"}</div>
            </div>
          </>
        )}
        <div className="mo-acts">
          <button className="btn btn-g" onClick={onClose}>Cancel</button>
          <button className="btn btn-p" onClick={handleSave} disabled={saving}>{saving?"Saving…":isEdit?"Save Changes":"Create Question"}</button>
        </div>
      </div>
    </div>
  );
}

// ── QUESTIONS PANEL ───────────────────────────────────────────────────────────
function QuestionsPanel() {
  const [pool,setPool]           = useState("riasec");
  const [subcategory,setSub]     = useState("");
  const [subject,setSubject]     = useState("");
  const [topic,setTopic]         = useState("");
  const [difficulty,setDiff]     = useState("");
  const [activeFilter,setAF]     = useState("");
  const [page,setPage]           = useState(1);
  const [data,setData]           = useState(null);
  const [poolStats,setPoolStats] = useState({});
  const [loading,setLoading]     = useState(true);
  const [error,setError]         = useState("");
  const [toast,setToast]         = useState("");
  const [modal,setModal]         = useState(null);
  const [selected,setSelected]   = useState(new Set());
  const [bulkWorking,setBW]      = useState(false);

  useEffect(()=>{setSub("");setSubject("");setTopic("");setDiff("");setPage(1);setSelected(new Set());},[pool]);
  useEffect(()=>{setTopic("");},[subject]);

  const load=useCallback(async()=>{
    setLoading(true);setError("");
    try {
      const p=new URLSearchParams({pool,page,limit:Q_LIMIT});
      if(activeFilter!=="") p.set("active",activeFilter);
      if(pool==="riasec"&&subcategory) p.set("subcategory",subcategory);
      if(pool==="aptitude"){
        if(subject)    p.set("subject",subject);
        if(topic)      p.set("topic",topic);
        if(difficulty) p.set("difficulty",difficulty);
      }
      const d=await apiFetch(`/api/admin/questions?${p}`);
      setData(d);
    } catch(e){setError(e.message);}
    finally{setLoading(false);}
  },[pool,page,activeFilter,subcategory,subject,topic,difficulty]);

  // Pool-level stats
  const loadPoolStats=useCallback(async()=>{
    const stats={};
    await Promise.all(["riasec","aptitude"].map(async p=>{
      try {
        const d=await apiFetch(`/api/admin/questions?pool=${p}&limit=1`);
        const da=await apiFetch(`/api/admin/questions?pool=${p}&limit=1&active=true`);
        stats[p]={total:d.total,active:da.total};
      } catch{}
    }));
    setPoolStats(stats);
  },[]);

  useEffect(()=>{load();},[load]);
  useEffect(()=>{loadPoolStats();},[loadPoolStats]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const handleToggle=async(q)=>{
    try{
      const r=await apiFetch(`/api/admin/questions/${q.id}/toggle?pool=${pool}`,{method:"PATCH"});
      showToast(r.message);load();loadPoolStats();
    }catch(e){setError(e.message);}
  };

  const handleBulkToggle=async(activate)=>{
    if(!selected.size) return;
    setBW(true);
    let done=0;
    for(const id of selected){
      const q=data?.questions?.find(x=>x.id===id);
      if(!q) continue;
      const shouldToggle=(activate&&!q.active)||(!activate&&q.active);
      if(shouldToggle){
        try{await apiFetch(`/api/admin/questions/${id}/toggle?pool=${pool}`,{method:"PATCH"});done++;}catch{}
      }
    }
    setBW(false);setSelected(new Set());
    showToast(`${done} question${done!==1?"s":""} updated.`);
    load();loadPoolStats();
  };

  const toggleSelect=id=>setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll=()=>{
    const qs=data?.questions||[];
    if(selected.size===qs.length) setSelected(new Set());
    else setSelected(new Set(qs.map(q=>q.id)));
  };

  const totalPages=data?Math.ceil(data.total/Q_LIMIT):1;
  const topicOptions=subject?(APT_TOPICS[subject]||[]):[];
  const qs=data?.questions||[];

  const POOL_COLORS={riasec:STRAND_COLORS[2],aptitude:STRAND_COLORS[0]};

  return (
    <div>
      {toast&&<div className="suc">{toast}</div>}
      {error&&<div className="err">{error}</div>}

      {/* Pool picker with stats */}
      <div className="pool-pills">
        {["riasec","aptitude"].map(p=>{
          const s=poolStats[p]||{};
          return (
            <div key={p} className={`pool-pill ${pool===p?"active":""}`} onClick={()=>setPool(p)} style={{"--pc":POOL_COLORS[p]}}>
              <span className="pool-pill-num" style={{color:pool===p?"var(--acc)":POOL_COLORS[p]}}>{s.total??"-"}</span>
              <span className="pool-pill-lbl" style={{textTransform:"uppercase"}}>{p}</span>
              <span className="pool-pill-sub">{s.active??"-"} active</span>
            </div>
          );
        })}
      </div>

      <div className="qtb">
        <select value={activeFilter} onChange={e=>{setAF(e.target.value);setPage(1);}}>
          <option value="">All status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        {pool==="riasec"&&(
          <select value={subcategory} onChange={e=>{setSub(e.target.value);setPage(1);}}>
            <option value="">All subcategories</option>
            {RIASEC_SUBS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
        )}
        {pool==="aptitude"&&(<>
          <select value={subject} onChange={e=>{setSubject(e.target.value);setTopic("");setPage(1);}}>
            <option value="">All subjects</option>
            {APT_SUBJECTS.map(s=><option key={s} value={s}>{s}</option>)}
          </select>
          <select value={topic} onChange={e=>setTopic(e.target.value)} disabled={!subject}>
            <option value="">All topics</option>
            {topicOptions.map(t=><option key={t} value={t}>{t.replace(/_/g," ")}</option>)}
          </select>
          <select value={difficulty} onChange={e=>{setDiff(e.target.value);setPage(1);}}>
            <option value="">All difficulty</option>
            {APT_DIFFS.map(d=><option key={d} value={d}>{d}</option>)}
          </select>
        </>)}
        <button className="btn btn-p" style={{marginLeft:"auto"}} onClick={()=>setModal("new")}>+ Add Question</button>
      </div>

      {/* Bulk actions bar */}
      {selected.size>0&&(
        <div className="bulk-bar">
          <span className="bulk-bar-count">{selected.size} selected</span>
          <button className="btn btn-sm btn-grn" onClick={()=>handleBulkToggle(true)} disabled={bulkWorking}>Activate all</button>
          <button className="btn btn-sm btn-d"   onClick={()=>handleBulkToggle(false)} disabled={bulkWorking}>Deactivate all</button>
          <button className="btn btn-sm btn-g"   onClick={()=>setSelected(new Set())} style={{marginLeft:"auto"}}>Clear</button>
        </div>
      )}

      {loading?<Spin/>:data&&(
        <>
          <div style={{fontSize:12,color:"var(--t3)",marginBottom:11}}>{data.total} question{data.total!==1?"s":""}</div>
          <div className="tw">
            <table className="qt">
              <thead>
                <tr>
                  <th className="qt-check"><input type="checkbox" onChange={toggleAll} checked={qs.length>0&&selected.size===qs.length}/></th>
                  <th style={{minWidth:240}}>Question</th>
                  <th>Category</th>
                  {pool==="aptitude"&&<th>Topic</th>}
                  {pool==="aptitude"&&<th>Diff</th>}
                  {pool==="aptitude"&&<th style={{minWidth:190}}>Choices</th>}
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {qs.length===0&&(
                  <tr><td colSpan={9} style={{textAlign:"center",color:"var(--t3)",padding:28}}>No questions found.</td></tr>
                )}
                {qs.map(q=>{
                  const opts=normalizeOptions(q.options);
                  return (
                    <tr key={q.id}>
                      <td className="qt-check"><input type="checkbox" checked={selected.has(q.id)} onChange={()=>toggleSelect(q.id)}/></td>
                      <td>
                        <span className="qtext" title={q.text}>{q.text}</span>
                      </td>
                      <td>
                        {q.subcategory&&<span className="bd2 bg-ora" style={{textTransform:"capitalize"}}>{q.subcategory.replace(/_/g," ")}</span>}
                        {q.subject&&<span className="bd2 bg-blu" style={{textTransform:"capitalize"}}>{q.subject}</span>}
                      </td>
                      {pool==="aptitude"&&<td style={{fontSize:12,color:"var(--t2)"}}>{q.topic?q.topic.replace(/_/g," "):"—"}</td>}
                      {pool==="aptitude"&&<td>{diffBadge(q.difficulty)}</td>}
                      {pool==="aptitude"&&(
                        <td>
                          <div className="q-opts">
                            {["A","B","C","D"].map(k=>(
                              <div key={k} className={`q-opt ${q.correct_answer===k?"cor":""}`}>
                                <span className="q-opt-k">{k}.</span>
                                <span className="q-opt-v" title={opts[k]||""}>{opts[k]||<em style={{color:"var(--t3)"}}>—</em>}</span>
                              </div>
                            ))}
                          </div>
                        </td>
                      )}
                      <td>
                        <span className={`bd2 ${q.active?"bg-grn":"bg-red"}`}>{q.active?"Active":"Inactive"}</span>
                      </td>
                      <td>
                        <div style={{display:"flex",gap:5}}>
                          <button className="btn btn-g btn-sm" onClick={()=>setModal(q)}>Edit</button>
                          <button className={`btn btn-sm ${q.active?"btn-d":"btn-grn"}`} onClick={()=>handleToggle(q)}>
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
          <div className="pg">
            <button className="pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
            <span>Page {page} of {totalPages}</span>
            <button className="pg-btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
          </div>
        </>
      )}

      {modal&&(
        <QuestionModal
          pool={pool}
          editDoc={modal==="new"?null:modal}
          onClose={()=>setModal(null)}
          onSaved={()=>{setModal(null);showToast("Question saved.");load();loadPoolStats();}}
        />
      )}
    </div>
  );
}

// ── USER PROFILE DRAWER ───────────────────────────────────────────────────────
function UserDrawer({user,onClose}) {
  const [results,setResults]=useState([]);
  const [loading,setLoading]=useState(true);

  useEffect(()=>{
    apiFetch(`/api/admin/users/${user.id}/results`).then(d=>setResults(d.results||[])).catch(()=>{}).finally(()=>setLoading(false));
  },[user.id]);

  return (
    <>
      <div className="dr-overlay" onClick={onClose}/>
      <div className="dr">
        <div className="dr-head">
          <div style={{display:"flex",alignItems:"center",flex:1}}>
            <div className="dr-av">{user.username?.[0]?.toUpperCase()??"U"}</div>
            <div className="dr-info">
              <div className="dr-name">{user.username}</div>
              <div className="dr-email">{user.email}</div>
            </div>
          </div>
          <button className="dr-close" onClick={onClose}>✕</button>
        </div>

        <div className="dr-sec">
          <div className="dr-sec-t">Account Info</div>
          <div className="dr-row"><span className="dr-key">Role</span><span className="dr-val">{roleBadge(user.role)}</span></div>
          <div className="dr-row"><span className="dr-key">Grade Level</span><span className="dr-val">{user.gradeLevel||"—"}</span></div>
          <div className="dr-row"><span className="dr-key">Strand</span><span className="dr-val">{user.strand||"—"}</span></div>
          <div className="dr-row"><span className="dr-key">Status</span><span className="dr-val">{user.isActive?<span style={{color:"var(--grn)"}}>Active</span>:<span style={{color:"var(--red)"}}>Inactive</span>}</span></div>
          <div className="dr-row"><span className="dr-key">Joined</span><span className="dr-val" style={{color:"var(--t2)",fontSize:12}}>{user.createdAt?.slice(0,10)||"—"}</span></div>
        </div>

        <div className="dr-sec">
          <div className="dr-sec-t">Assessment Results ({results.length})</div>
          {loading?<Spin/>:results.length===0?(
            <p className="empty" style={{textAlign:"left"}}>No assessments completed yet.</p>
          ):results.map((r,i)=>(
            <div key={i} className="res-card">
              <div className="res-card-head">
                <span className="bd2 bg-grn">Completed</span>
                <span className="res-card-date">{r.submittedAt?.slice(0,10)||"—"}</span>
              </div>
              {r.scores?.aptitude_pct&&(
                <div className="score-grid">
                  {APT_SUBJECTS.map((s,i)=>{
                    const v=r.scores.aptitude_pct[s];
                    return v!=null?(
                      <div key={s} className="score-item">
                        <span className="score-val" style={{color:STRAND_COLORS[i]}}>{v}%</span>
                        <span className="score-lbl">{s}</span>
                      </div>
                    ):null;
                  })}
                </div>
              )}
              {r.recommendations?.length>0&&(
                <div>
                  <div style={{fontSize:11,color:"var(--t3)",marginTop:12,marginBottom:6,textTransform:"uppercase",letterSpacing:1,fontWeight:600}}>Top Recommendations</div>
                  <div className="recs">
                    {r.recommendations.slice(0,5).map((rec,ri)=>(
                      <div key={ri} className="rec-item">
                        <span className="rec-name">{rec.course}</span>
                        <span className="rec-rank">#{rec.rank}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

// ── USER MANAGEMENT (Superadmin) ──────────────────────────────────────────────
function UserManagement() {
  const token=getToken();
  const [users,setUsers]       = useState([]);
  const [total,setTotal]       = useState(0);
  const [page,setPage]         = useState(1);
  const [search,setSearch]     = useState("");
  const [roleFilter,setRoleF]  = useState("");
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState("");
  const [toast,setToast]       = useState("");
  const [editUser,setEditUser] = useState(null);
  const [newRole,setNewRole]   = useState("");
  const [saving,setSaving]     = useState(false);
  const [exporting,setExp]     = useState(false);
  const [drawerUser,setDrawer] = useState(null);

  const fetchUsers=useCallback(async()=>{
    setLoading(true);setError("");
    try{
      const p=new URLSearchParams({page,limit:PER_PAGE});
      if(roleFilter) p.set("role",roleFilter);
      if(search)     p.set("search",search);
      const res=await fetch(`${API}/api/admin/users?${p}`,{headers:{Authorization:`Bearer ${token}`}});
      if(!res.ok) throw new Error((await res.json()).detail||"Failed.");
      const d=await res.json();
      setUsers(d.users);setTotal(d.total);
    }catch(e){setError(e.message);}finally{setLoading(false);}
  },[page,roleFilter,search,token]);

  useEffect(()=>{fetchUsers();},[fetchUsers]);

  const showToast=msg=>{setToast(msg);setTimeout(()=>setToast(""),3000);};

  const handleRoleSave=async()=>{
    if(!newRole||newRole===editUser.role){setEditUser(null);return;}
    setSaving(true);
    try{
      const res=await fetch(`${API}/api/admin/users/${editUser.id}/role`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({role:newRole})});
      if(!res.ok) throw new Error((await res.json()).detail);
      showToast(`Role updated to "${newRole}".`);setEditUser(null);fetchUsers();
    }catch(e){showToast("Error: "+e.message);}finally{setSaving(false);}
  };

  const toggleStatus=async u=>{
    try{
      const res=await fetch(`${API}/api/admin/users/${u.id}/status`,{method:"PUT",headers:{"Content-Type":"application/json",Authorization:`Bearer ${token}`},body:JSON.stringify({isActive:!u.isActive})});
      if(!res.ok) throw new Error((await res.json()).detail);
      showToast(`User ${!u.isActive?"activated":"deactivated"}.`);fetchUsers();
    }catch(e){showToast("Error: "+e.message);}
  };

  const handleExport=async()=>{
    setExp(true);
    try{
      const res=await fetch(`${API}/api/admin/export/users`,{headers:{Authorization:`Bearer ${token}`}});
      if(!res.ok) throw new Error("Export failed.");
      const blob=await res.blob();
      const url=URL.createObjectURL(blob);
      const a=document.createElement("a");a.href=url;a.download=`coursify_users_${Date.now()}.csv`;a.click();URL.revokeObjectURL(url);
      showToast("Export downloaded.");
    }catch(e){showToast("Error: "+e.message);}finally{setExp(false);}
  };

  const totalPages=Math.ceil(total/PER_PAGE);

  return (
    <div>
      {toast&&<div className="toast">{toast}</div>}
      <div className="ph" style={{marginBottom:20}}>
        <div className="ph-l"><h1 style={{fontSize:22,fontWeight:800}}>User Management</h1><p style={{color:"var(--t2)",fontSize:13}}>{total} total accounts</p></div>
        <button className="btn btn-acc" style={{background:"var(--acc-d)",color:"var(--acc)",border:"1px solid var(--acc-b)",borderRadius:"var(--r-md)",padding:"9px 16px",fontWeight:600,fontFamily:"var(--font)",cursor:"pointer",fontSize:13}} onClick={handleExport} disabled={exporting}>
          {exporting?"Exporting…":"⬇ Export CSV"}
        </button>
      </div>

      <div className="filters">
        <input className="f-inp" placeholder="Search username or email…" value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}}/>
        <select className="f-sel" value={roleFilter} onChange={e=>{setRoleF(e.target.value);setPage(1);}}>
          <option value="">All roles</option>
          {ROLES.map(r=><option key={r} value={r}>{r}</option>)}
        </select>
      </div>

      {error&&<div className="err">{error}</div>}

      <div className="tw">
        <table className="ut">
          <thead>
            <tr>
              <th>Status</th>
              <th>Username</th>
              <th>Email</th>
              <th>Role</th>
              <th>Grade</th>
              <th>Strand</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading?(
              <tr><td colSpan={8} style={{textAlign:"center",padding:40}}><div className="spin" style={{margin:"0 auto"}}/></td></tr>
            ):users.length===0?(
              <tr><td colSpan={8} style={{textAlign:"center",color:"var(--t3)",padding:40}}>No users found.</td></tr>
            ):users.map(u=>(
              <tr key={u.id} className={u.isActive?"":"inactive"}>
                <td><span className={`dot ${u.isActive?"dot-on":"dot-off"}`}/></td>
                <td style={{fontWeight:500,cursor:"pointer",color:"var(--acc)"}} onClick={()=>setDrawer(u)}>{u.username}</td>
                <td style={{color:"var(--t2)",fontSize:12.5}}>{u.email}</td>
                <td>{roleBadge(u.role)}</td>
                <td style={{color:"var(--t2)"}}>{u.gradeLevel||"—"}</td>
                <td style={{color:"var(--t2)"}}>{u.strand||"—"}</td>
                <td style={{color:"var(--t3)",fontSize:12}}>{u.createdAt?.slice(0,10)}</td>
                <td>
                  <div style={{display:"flex",gap:5}}>
                    <button className="btn btn-blu btn-sm" onClick={()=>{setEditUser(u);setNewRole(u.role);}}>Role</button>
                    <button className={`btn btn-sm ${u.isActive?"btn-d":"btn-grn"}`} onClick={()=>toggleStatus(u)}>
                      {u.isActive?"Deactivate":"Activate"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages>1&&(
        <div className="pg">
          <button className="pg-btn" disabled={page===1} onClick={()=>setPage(p=>p-1)}>← Prev</button>
          <span>Page {page} of {totalPages}</span>
          <button className="pg-btn" disabled={page>=totalPages} onClick={()=>setPage(p=>p+1)}>Next →</button>
        </div>
      )}

      {/* Role modal */}
      {editUser&&(
        <div className="mo" onClick={e=>e.target===e.currentTarget&&setEditUser(null)}>
          <div className="mo-box" style={{maxWidth:360}}>
            <div className="mo-t" style={{fontSize:16}}>Change role — {editUser.username}</div>
            <div style={{fontSize:13,color:"var(--t2)",marginBottom:4}}>Current: {roleBadge(editUser.role)}</div>
            <div className="role-opts">
              {ROLES.map(r=>(
                <label key={r} className={`role-opt ${newRole===r?"sel":""}`}>
                  <input type="radio" name="role" value={r} checked={newRole===r} onChange={()=>setNewRole(r)}/>
                  {roleBadge(r)}
                  <span style={{fontSize:12,color:"var(--t2)"}}>
                    {r==="user"?"Standard access":r==="admin"?"Analytics + questions":r==="superadmin"?"Full access":""}
                  </span>
                </label>
              ))}
            </div>
            <div className="mo-acts">
              <button className="btn btn-g" onClick={()=>setEditUser(null)}>Cancel</button>
              <button className="btn btn-p" onClick={handleRoleSave} disabled={saving}>{saving?"Saving…":"Save"}</button>
            </div>
          </div>
        </div>
      )}

      {/* User profile drawer */}
      {drawerUser&&<UserDrawer user={drawerUser} onClose={()=>setDrawer(null)}/>}
    </div>
  );
}

// ── AUDIT LOG ─────────────────────────────────────────────────────────────────
function AuditLog() {
  const token=getToken();
  const [events,setEvents]=useState([]);
  const [loading,setLoading]=useState(true);
  const [error,setError]=useState("");

  useEffect(()=>{
    (async()=>{
      try{
        const res=await fetch(`${API}/api/admin/audit-log?limit=100`,{headers:{Authorization:`Bearer ${token}`}});
        if(!res.ok) throw new Error("Failed to load audit log.");
        const d=await res.json();
        setEvents(d.events);
      }catch(e){setError(e.message);}finally{setLoading(false);}
    })();
  },[token]);

  if(loading) return <Spin/>;
  if(error)   return <div className="err">{error}</div>;

  return (
    <div>
      <div className="ph" style={{marginBottom:20}}>
        <div className="ph-l"><h1 style={{fontSize:22,fontWeight:800}}>Audit Log</h1><p style={{color:"var(--t2)",fontSize:13}}>All admin-initiated account changes</p></div>
      </div>
      {events.length===0?<p className="empty">No audit events recorded yet.</p>:(
        <div className="card">
          {events.map((ev,i)=>{
            const isRole=ev.action==="role_change";
            return (
              <div key={i} className="au-item">
                <div className="au-icon" style={{background:isRole?"var(--blu-d)":"var(--amb-d)"}}>
                  {isRole?<span style={{color:"var(--blu)",fontSize:13}}>⬡</span>:<span style={{color:"var(--amb)",fontSize:13}}>◈</span>}
                </div>
                <div className="au-body">
                  <div className="au-main">
                    <strong style={{color:"var(--t1)"}}>{ev.username}</strong>
                    <span style={{color:"var(--t2)"}}> — {isRole?`role → ${ev.newRole}`:ev.isActive?"activated":"deactivated"}</span>
                  </div>
                  <div className="au-by">by {ev.by}</div>
                </div>
                <div className="au-time">{ev.timestamp?.slice(0,16).replace("T"," ")||"—"}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── ROOT ──────────────────────────────────────────────────────────────────────
const ADMIN_TABS=[
  {key:"users",       label:"Users",       icon:"▦"},
  {key:"courses",     label:"Courses",     icon:"🎯"},
  {key:"assessments", label:"Assessments", icon:"📊"},
  {key:"questions",   label:"Questions",   icon:"📝"},
];

const SUPER_TABS=[
  {key:"user-mgmt", label:"User Management", icon:"⬡"},
  {key:"audit",     label:"Audit Log",       icon:"◈"},
];

const SUBTITLES={
  users:       "Registration trends and user breakdowns",
  courses:     "Most-recommended courses and submission trends",
  assessments: "Completion rates and score averages",
  questions:   "Manage RIASEC and Aptitude question pools with bulk actions",
  "user-mgmt": "View, promote, and manage all accounts",
  audit:       "All admin-initiated account changes",
};

export default function AdminDashboard() {
  const navigate=useNavigate();
  const [user]=useState(()=>JSON.parse(localStorage.getItem("coursify_user")||"{}"));
  const role=user.role||localStorage.getItem("coursify_role")||"admin";
  const isSuperAdmin=role==="superadmin";

  const [tab,setTab]     = useState("users");
  const [range,setRange] = useState("7d");
  const [toast,setToast] = useState("");

  useEffect(()=>{
    const r=localStorage.getItem("coursify_role");
    if(!localStorage.getItem("token")||!["admin","superadmin"].includes(r)) navigate("/dashboard");
  },[navigate]);

  const allTabs=[...ADMIN_TABS,...(isSuperAdmin?SUPER_TABS:[])];
  const showRange=["users","courses","assessments"].includes(tab);

  return (
    <>
      <style>{CSS}</style>
      {toast&&<div className="toast">{toast}</div>}
      <div className="root">
        <aside className="sb">
          <div className="sb-logo">
            <span className="sb-mark">C</span>
            <span className="sb-name">Course<span>ify</span></span>
          </div>
          <nav className="sb-nav">
            <span className="sb-sec">Analytics</span>
            {ADMIN_TABS.map(t=>(
              <button key={t.key} className={`sb-item ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
                <span className="sb-icon">{t.icon}</span>{t.label}
              </button>
            ))}
            {isSuperAdmin&&(
              <>
                <span className="sb-sec">Superadmin</span>
                {SUPER_TABS.map(t=>(
                  <button key={t.key} className={`sb-item ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>
                    <span className="sb-icon">{t.icon}</span>{t.label}
                  </button>
                ))}
              </>
            )}
            <span className="sb-sec">Navigate</span>
            <button className="sb-item" onClick={()=>navigate("/dashboard")}>
              <span className="sb-icon">⌂</span>Student View
            </button>
          </nav>
          <div className="sb-foot">
            <div className="sb-av">{user.username?.[0]?.toUpperCase()??"A"}</div>
            <div className="sb-user">
              <span className="sb-uname">{user.username||"Admin"}</span>
              <span className="sb-urole">{role}</span>
            </div>
            <button className="sb-out" title="Logout" onClick={()=>{localStorage.clear();navigate("/");}}>⏻</button>
          </div>
        </aside>

        <main className="main">
          <header className="ph">
            <div className="ph-l">
              <h1>{allTabs.find(t=>t.key===tab)?.label||tab}</h1>
              <p>{SUBTITLES[tab]||""}</p>
            </div>
            {showRange&&(
              <div className="rtabs">
                {RANGE_OPTIONS.map(o=>(
                  <button key={o.value} className={`rtab ${range===o.value?"active":""}`} onClick={()=>setRange(o.value)}>{o.label}</button>
                ))}
              </div>
            )}
          </header>

          {/* Tab bar */}
          <div className="stabs">
            {allTabs.map(t=>(
              <button key={t.key} className={`stab ${tab===t.key?"active":""}`} onClick={()=>setTab(t.key)}>{t.label}</button>
            ))}
          </div>

          {tab==="users"       && <UsersAnalytics range={range}/>}
          {tab==="courses"     && <CoursesAnalytics range={range}/>}
          {tab==="assessments" && <AssessmentsAnalytics range={range}/>}
          {tab==="questions"   && <QuestionsPanel/>}
          {tab==="user-mgmt"   && <UserManagement/>}
          {tab==="audit"       && <AuditLog/>}
        </main>
      </div>
    </>
  );
}