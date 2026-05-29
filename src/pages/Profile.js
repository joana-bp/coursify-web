import { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/Profile.css";
import API_BASE_URL from "../config/api";

// ── constants ─────────────────────────────────────────────────────────────────

const RIASEC_META = {
  realistic:     { code: "R", label: "Realistic",     emoji: "🔧", color: "#3b82f6" },
  investigative: { code: "I", label: "Investigative", emoji: "🔬", color: "#10b981" },
  artistic:      { code: "A", label: "Artistic",      emoji: "🎨", color: "#8b5cf6" },
  social:        { code: "S", label: "Social",        emoji: "🤝", color: "#f59e0b" },
  enterprising:  { code: "E", label: "Enterprising",  emoji: "🚀", color: "#ef4444" },
  conventional:  { code: "C", label: "Conventional",  emoji: "📋", color: "#14b8a6" },
};

const BIGFIVE_META = {
  openness:          { label: "Openness",          abbr: "O", color: "#8b5cf6" },
  conscientiousness: { label: "Conscientiousness", abbr: "C", color: "#3b82f6" },
  extraversion:      { label: "Extraversion",      abbr: "E", color: "#f59e0b" },
  agreeableness:     { label: "Agreeableness",     abbr: "A", color: "#10b981" },
  neuroticism:       { label: "Neuroticism",       abbr: "N", color: "#ef4444" },
};

const APTITUDE_META = {
  math:     { label: "Math",     emoji: "🔢", color: "#3b82f6" },
  english:  { label: "English",  emoji: "📖", color: "#8b5cf6" },
  science:  { label: "Science",  emoji: "⚗️", color: "#10b981" },
  abstract: { label: "Abstract", emoji: "🧩", color: "#f59e0b" },
};

const MEDAL = ["🥇", "🥈", "🥉"];

const TAB_LABELS = {
  courses: "🎯 Courses",
  riasec:  "🧭 RIASEC",
  bigfive: "🧠 Big Five",
  aptitude:"📚 Aptitude",
};

// ── helpers ───────────────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-PH", {
    year: "numeric", month: "short", day: "numeric",
  });
}

function traitLevel(mean) {
  if (mean >= 4.0) return "High";
  if (mean >= 2.5) return "Medium";
  return "Low";
}

function levelColors(level) {
  if (level === "High")   return { color: "#16a34a", bg: "#dcfce7" };
  if (level === "Medium") return { color: "#ca8a04", bg: "#fef9c3" };
  return                         { color: "#64748b", bg: "#f1f5f9" };
}

// ── ScoreTabs ─────────────────────────────────────────────────────────────────

function ScoreTabs({ entry }) {
  const [tab, setTab] = useState("courses");

  return (
    <div className="score-tabs-root">
      <div className="score-tab-bar" role="tablist">
        {Object.entries(TAB_LABELS).map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={`score-tab-btn ${tab === key ? "active" : ""}`}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* ── Courses ── */}
      {tab === "courses" && (
        <div className="score-panel" role="tabpanel">
          <div className="course-result-list">
            {entry.recommendations.map((r, i) => (
              <div key={i} className={`course-result-row ${i === 0 ? "cr-top" : ""}`}>
                <span className="cr-medal">{MEDAL[i] || `${i + 1}.`}</span>
                <span className="cr-name">{r.course}</span>
                <div className="cr-bar-wrap">
                  <div className="cr-bar-track">
                    <div
                      className="cr-bar-fill"
                      style={{ width: `${Math.min(r.confidence * 2, 100)}%` }}
                    />
                  </div>
                  <span className="cr-pct">{r.confidence}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RIASEC ── */}
      {tab === "riasec" && (
        <div className="score-panel" role="tabpanel">
          <p className="score-note">Scores out of 30 · Top 3 highlighted</p>
          <div className="riasec-result-list">
            {Object.entries(entry.scores.riasec_raw)
              .sort((a, b) => b[1] - a[1])
              .map(([key, val], i) => {
                const meta = RIASEC_META[key];
                const pct  = Math.round((val / 30) * 100);
                const isTop = i < 3;
                return (
                  <div key={key} className={`rr-row ${isTop ? "rr-top" : ""}`}>
                    <div className="rr-label">
                      <span className="rr-emoji">{meta.emoji}</span>
                      <span className="rr-code" style={{ color: isTop ? meta.color : "#94a3b8" }}>
                        {meta.code}
                      </span>
                      <span className="rr-name">{meta.label}</span>
                      {i === 0 && <span className="rr-top-badge">Top</span>}
                    </div>
                    <div className="rr-bar-wrap">
                      <div className="rr-bar-track">
                        <div
                          className="rr-bar-fill"
                          style={{
                            width: `${pct}%`,
                            background: isTop ? meta.color : "#e2e8f0",
                          }}
                        />
                      </div>
                      <span className="rr-score" style={{ color: isTop ? meta.color : "#94a3b8" }}>
                        {val}<span className="rr-max">/30</span>
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* ── Big Five ── */}
      {tab === "bigfive" && (
        <div className="score-panel" role="tabpanel">
          <p className="score-note">Trait means on a 1–5 scale</p>
          <div className="bf-result-grid">
            {Object.entries(entry.scores.bigfive_raw).map(([trait, mean]) => {
              const meta  = BIGFIVE_META[trait];
              const level = traitLevel(mean);
              const lc    = levelColors(level);
              const pct   = Math.round(((mean - 1) / 4) * 100);
              return (
                <div key={trait} className="bf-card">
                  <div className="bf-card-top">
                    <span className="bf-abbr" style={{ background: lc.bg, color: lc.color }}>
                      {meta.abbr}
                    </span>
                    <span className="bf-trait-name">{meta.label}</span>
                    <span className="bf-level" style={{ background: lc.bg, color: lc.color }}>
                      {level}
                    </span>
                  </div>
                  <div className="bf-bar-track">
                    <div
                      className="bf-bar-fill"
                      style={{ width: `${pct}%`, background: meta.color }}
                    />
                  </div>
                  <span className="bf-mean">{mean.toFixed(2)} / 5.00</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Aptitude ── */}
      {tab === "aptitude" && (
        <div className="score-panel" role="tabpanel">
          <p className="score-note">12 questions per subject</p>
          <div className="apt-result-grid">
            {Object.entries(entry.scores.aptitude_pct)
              .sort((a, b) => b[1] - a[1])
              .map(([subj, pct]) => {
                const meta    = APTITUDE_META[subj];
                const correct = Math.round((pct / 100) * 12);
                const grade   = pct >= 75 ? "apt-high" : pct >= 50 ? "apt-mid" : "apt-low";
                return (
                  <div key={subj} className={`apt-card ${grade}`}>
                    <span className="apt-emoji">{meta.emoji}</span>
                    <span className="apt-label">{meta.label}</span>
                    <div className="apt-score-row">
                      <span className="apt-score">{correct}</span>
                      <span className="apt-max">/12</span>
                    </div>
                    <div className="apt-bar-track">
                      <div
                        className="apt-bar-fill"
                        style={{ width: `${pct}%`, background: meta.color }}
                      />
                    </div>
                    <span className="apt-pct" style={{ color: meta.color }}>{pct}%</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}

// ── HistoryEntry ──────────────────────────────────────────────────────────────

function HistoryEntry({ entry, index }) {
  const [open, setOpen] = useState(false);

  const topCodes = Object.entries(entry.scores?.riasec_raw || {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k]) => RIASEC_META[k]?.code || k[0].toUpperCase())
    .join("");

  const topCourse = entry.recommendations?.[0]?.course || "—";
  const topConf   = entry.recommendations?.[0]?.confidence;

  return (
    <div className={`history-entry ${open ? "he-open" : ""}`}>
      <button
        type="button"
        className="he-header"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
      >
        <div className="he-left">
          <span className="he-index">#{index + 1}</span>
          <div className="he-meta">
            <div className="he-badges">
              <span className="he-strand-badge">{entry.strand}</span>
              {topCodes && <span className="he-riasec-badge">{topCodes}</span>}
            </div>
            <span className="he-date">{formatDate(entry.submittedAt)}</span>
          </div>
        </div>
        <div className="he-right">
          <div className="he-top-course-wrap">
            <span className="he-top-label">Top pick</span>
            <span className="he-top-course">{topCourse}</span>
            {topConf && <span className="he-top-conf">{topConf}%</span>}
          </div>
          <span className="he-chevron" aria-hidden="true">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {open && (
        <div className="he-body">
          {entry.scores ? (
            <ScoreTabs entry={entry} />
          ) : (
            <p className="he-no-scores">Full scores not available for this attempt.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Profile (main) ────────────────────────────────────────────────────────────

function Profile() {
  const [isEditing,   setIsEditing]   = useState(false);
  const [saved,       setSaved]       = useState(false);
  const [saveError,   setSaveError]   = useState("");
  const [loading,     setLoading]     = useState(true);
  const [histLoading, setHistLoading] = useState(true);
  const [history,     setHistory]     = useState([]);

  const empty = { username: "", email: "", gradeLevel: "", strand: "" };
  const [profile, setProfile] = useState(empty);
  const [draft,   setDraft]   = useState(empty);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API_BASE_URL}/api/auth/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail);
        const ud = {
          username:   data.username   || "",
          email:      data.email      || "",
          gradeLevel: data.gradeLevel || "",
          strand:     data.strand     || "",
        };
        setProfile(ud); setDraft(ud);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("token");
        const res   = await fetch(`${API_BASE_URL}/api/assessment/results/history`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Failed.");
        const data = await res.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (e) { console.error(e); setHistory([]); }
      finally { setHistLoading(false); }
    })();
  }, []);

  const handleSave = async () => {
    setSaveError("");
    try {
      const token = localStorage.getItem("token");
      const res   = await fetch(`${API_BASE_URL}/api/auth/profile`, {
        method:  "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          username:   draft.username   || undefined,
          email:      draft.email      || undefined,
          gradeLevel: draft.gradeLevel || undefined,
          strand:     draft.strand     || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to update profile.");
      const ud = {
        username:   data.user.username   || "",
        email:      data.user.email      || "",
        gradeLevel: data.user.gradeLevel || "",
        strand:     data.user.strand     || "",
      };
      setProfile(ud); setDraft(ud);
      setIsEditing(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) { setSaveError(e.message); }
  };

  const handleEditToggle = () => {
    if (isEditing) setDraft({ ...profile });
    setIsEditing(!isEditing);
    setSaved(false);
    setSaveError("");
  };

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <main className="profile-page">

          <div className="profile-header">
            <div>
              <h2>My Profile</h2>
              <p>Manage your personal info and view your assessment history.</p>
            </div>
            {saved && <div className="save-toast" role="status">✓ Profile saved!</div>}
          </div>

          {/* personal info */}
          <section className="profile-card">
            <div className="card-header">
              <h3>Personal Information</h3>
              <button type="button" className="edit-btn" onClick={handleEditToggle}>
                {isEditing ? "Cancel" : "✏️ Edit"}
              </button>
            </div>

            {loading ? (
              <div className="profile-loading"><div className="profile-spinner" /></div>
            ) : (
              <div className="info-grid">
                <div className="info-field">
                  <label htmlFor="pf-name">Full Name</label>
                  {isEditing
                    ? <input id="pf-name" className="profile-input" value={draft.username} onChange={e => setDraft({ ...draft, username: e.target.value })} />
                    : <span>{profile.username || <em className="empty-val">—</em>}</span>}
                </div>
                <div className="info-field">
                  <label htmlFor="pf-email">Email</label>
                  {isEditing
                    ? <input id="pf-email" type="email" className="profile-input" value={draft.email} onChange={e => setDraft({ ...draft, email: e.target.value })} />
                    : <span>{profile.email || <em className="empty-val">—</em>}</span>}
                </div>
                <div className="info-field">
                  <label htmlFor="pf-grade">Grade Level</label>
                  {isEditing ? (
                    <select id="pf-grade" className="profile-input" value={draft.gradeLevel} onChange={e => setDraft({ ...draft, gradeLevel: e.target.value })}>
                      <option value="">Select grade</option>
                      <option>Grade 11</option>
                      <option>Grade 12</option>
                    </select>
                  ) : <span>{profile.gradeLevel || <em className="empty-val">Not set</em>}</span>}
                </div>
                <div className="info-field">
                  <label htmlFor="pf-strand">Academic Strand</label>
                  {isEditing ? (
                    <select id="pf-strand" className="profile-input" value={draft.strand} onChange={e => setDraft({ ...draft, strand: e.target.value })}>
                      <option value="">Select strand</option>
                      <option>STEM</option>
                      <option>ABM</option>
                      <option>HUMSS</option>
                      <option>TVL</option>
                      <option>GAS</option>
                    </select>
                  ) : <span>{profile.strand || <em className="empty-val">Not set</em>}</span>}
                </div>
              </div>
            )}

            {saveError && <p className="save-error">{saveError}</p>}
            {isEditing && (
              <button type="button" className="save-btn" onClick={handleSave}>Save Changes</button>
            )}
          </section>

          {/* assessment history */}
          <section className="profile-card history-card">
            <div className="card-header">
              <h3>Assessment History</h3>
              <span className="history-count-badge">
                {history.length} attempt{history.length !== 1 ? "s" : ""}
              </span>
            </div>

            {histLoading ? (
              <div className="profile-loading"><div className="profile-spinner" /></div>
            ) : history.length === 0 ? (
              <div className="history-empty-state">
                <span className="history-empty-icon">📋</span>
                <p>No assessments taken yet.</p>
                <p className="history-empty-sub">Complete the assessment to see your results here.</p>
              </div>
            ) : (
              <div className="history-list">
                {history.map((entry, i) => (
                  <HistoryEntry key={entry.result_id} entry={entry} index={i} />
                ))}
              </div>
            )}
          </section>

        </main>
      </div>
    </div>
  );
}

export default Profile;