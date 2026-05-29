import { useState } from "react";
import Sidebar from "../components/Sidebar";
import "../styles/AboutModel.css"; 

// ─────────────────────────────────────────────────────────
// Data — sourced directly from lab-activity-2-revised.ipynb
// ─────────────────────────────────────────────────────────

const DATASET = {
  source:     "Kaggle — Student Career Prediction using RIASEC Dataset",
  author:     "Venkatesh Kumar",
  samples:    2400,
  features:   11,
  classes:    6,
  balance:    "Perfectly balanced — 400 samples per class",
  missing:    0,
  evalMethod: "Stratified K-Fold Cross-Validation (K=5)",
};

const CAREERS = [
  { name: "Accountant",        emoji: "💼", color: "#dbeafe", accent: "#2563eb" },
  { name: "Data Scientist",    emoji: "📊", color: "#f3e8ff", accent: "#9333ea" },
  { name: "Doctor",            emoji: "🩺", color: "#dcfce7", accent: "#16a34a" },
  { name: "Entrepreneur",      emoji: "🚀", color: "#fef9c3", accent: "#ca8a04" },
  { name: "Software Engineer", emoji: "💻", color: "#ffedd5", accent: "#ea580c" },
  { name: "Teacher",           emoji: "📚", color: "#fce7f3", accent: "#db2777" },
];

// Actual importances extracted from course_model.joblib
const FEATURES = [
  { name: "Investigative (I)",    key: "I_score",             importance: 0.2482, group: "RIASEC"   },
  { name: "Social (S)",           key: "S_score",             importance: 0.1478, group: "RIASEC"   },
  { name: "Enterprising (E)",     key: "E_score",             importance: 0.1274, group: "RIASEC"   },
  { name: "Conventional (C)",     key: "C_score",             importance: 0.1201, group: "RIASEC"   },
  { name: "Programming Skill",    key: "Programming_Skill",   importance: 0.0997, group: "Aptitude" },
  { name: "Artistic (A)",         key: "A_score",             importance: 0.0671, group: "RIASEC"   },
  { name: "Math Score",           key: "Math_Score",          importance: 0.0464, group: "Aptitude" },
  { name: "Logical Ability",      key: "Logical_Ability",     importance: 0.0397, group: "Aptitude" },
  { name: "Realistic (R)",        key: "R_score",             importance: 0.0377, group: "RIASEC"   },
  { name: "Science Score",        key: "Science_Score",       importance: 0.0331, group: "Aptitude" },
  { name: "Communication Skill",  key: "Communication_Skill", importance: 0.0329, group: "Aptitude" },
];

// All models from notebook cell 45
const MODEL_COMPARISON = [
  { name: "Stacking Ensemble",    accuracy: 0.9604, f1: 0.9604, tuning: "Stacked",      deployed: false },
  { name: "Logistic Regression",  accuracy: 0.9567, f1: 0.9567, tuning: "None",         deployed: false },
  { name: "Random Forest (n=100)",accuracy: 0.9558, f1: 0.9558, tuning: "None",         deployed: true  },
  { name: "SVM — Linear",         accuracy: 0.9554, f1: 0.9554, tuning: "None",         deployed: false },
  { name: "SVM — RBF",            accuracy: 0.9525, f1: 0.9526, tuning: "None",         deployed: false },
  { name: "SVM — RBF (Tuned)",    accuracy: 0.9525, f1: 0.9525, tuning: "GridSearchCV", deployed: false },
  { name: "SVM — Poly (d=3)",     accuracy: 0.9483, f1: 0.9484, tuning: "None",         deployed: false },
  { name: "AdaBoost (Tuned)",     accuracy: 0.7129, f1: 0.7129, tuning: "GridSearchCV", deployed: false },
];

const DEPLOYED = MODEL_COMPARISON.find(m => m.deployed);

const DEPLOYED_METRICS = [
  { label: "Accuracy",  value: 0.9558, color: "#2563eb", bg: "#dbeafe" },
  { label: "F1-Score",  value: 0.9558, color: "#16a34a", bg: "#dcfce7" },
  { label: "Precision", value: 0.9558, color: "#9333ea", bg: "#f3e8ff" },
  { label: "Recall",    value: 0.9558, color: "#ea580c", bg: "#ffedd5" },
];

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function pct(val, decimals = 2) {
  return `${(val * 100).toFixed(decimals)}%`;
}

function AccuracyRing({ value, size = 80, strokeWidth = 7 }) {
  const r    = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dash = circ * value;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="#f1f5f9" strokeWidth={strokeWidth} />
      <circle cx={size/2} cy={size/2} r={r}
        fill="none" stroke="url(#ringGrad)" strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${size/2} ${size/2})`} />
      <defs>
        <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#4da3f5" />
          <stop offset="100%" stopColor="#2bbbad" />
        </linearGradient>
      </defs>
      <text x="50%" y="50%" dominantBaseline="middle" textAnchor="middle"
        fontSize={size * 0.17} fontWeight="800" fontFamily="Sora, sans-serif" fill="#1e293b">
        {Math.round(value * 100)}%
      </text>
    </svg>
  );
}

// ─────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────

function HeroMetrics() {
  return (
    <div className="am-card am-hero-card">
      <div className="am-hero-left">
        <div className="am-hero-badge">⚙️ Deployed Model</div>
        <h2 className="am-hero-algo">Random Forest Classifier</h2>
        <p className="am-hero-sub">
          n_estimators=100 · random_state=42 · trained on full 2,400-sample dataset
        </p>
        <div className="am-hero-tags">
          <span className="am-tag">Stratified K-Fold (K=5)</span>
          <span className="am-tag">Weighted F1</span>
          <span className="am-tag">Multi-class (6)</span>
        </div>
      </div>
      <div className="am-hero-right">
        {DEPLOYED_METRICS.map(({ label, value, color, bg }) => (
          <div key={label} className="am-metric-tile" style={{ background: bg }}>
            <span className="am-metric-tile-label">{label}</span>
            <span className="am-metric-tile-value" style={{ color }}>
              {(value * 100).toFixed(2)}%
            </span>
            <div className="am-metric-tile-bar-track">
              <div className="am-metric-tile-bar-fill"
                style={{ width: `${value * 100}%`, background: color }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DatasetSection() {
  return (
    <div className="am-card">
      <div className="am-section-header">
        <span className="am-section-icon">🗂️</span>
        <h3 className="am-section-title">Dataset</h3>
      </div>

      <div className="am-dataset-stats">
        {[
          { num: DATASET.samples.toLocaleString(), lbl: "Samples" },
          { num: DATASET.features,                 lbl: "Features" },
          { num: DATASET.classes,                  lbl: "Classes"  },
          { num: DATASET.missing,                  lbl: "Missing Values" },
        ].map(({ num, lbl }) => (
          <div key={lbl} className="am-stat-tile">
            <span className="am-stat-num">{num}</span>
            <span className="am-stat-lbl">{lbl}</span>
          </div>
        ))}
      </div>

      <div className="am-dataset-rows">
        {[
          { label: "Source",        value: DATASET.source },
          { label: "Author",        value: DATASET.author },
          { label: "Class Balance", value: DATASET.balance },
          { label: "Evaluation",    value: DATASET.evalMethod },
        ].map(({ label, value }) => (
          <div key={label} className="am-dataset-row">
            <span className="am-dataset-label">{label}</span>
            <span className="am-dataset-value">{value}</span>
          </div>
        ))}
      </div>

      <p className="am-subsection-title">Predicted Career Classes</p>
      <div className="am-career-chips">
        {CAREERS.map(c => (
          <span key={c.name} className="am-career-chip"
            style={{ background: c.color, color: c.accent }}>
            {c.emoji} {c.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function FeaturesSection() {
  const maxImp = FEATURES[0].importance;

  return (
    <div className="am-card">
      <div className="am-section-header">
        <span className="am-section-icon">📐</span>
        <h3 className="am-section-title">Input Features &amp; Importances</h3>
        <span className="am-section-sub">Random Forest — Mean Decrease in Impurity (actual model values)</span>
      </div>

      <div className="am-features-list">
        {FEATURES.map((f, i) => {
          const barPct = (f.importance / maxImp) * 100;
          const isApt  = f.group === "Aptitude";
          return (
            <div key={f.key} className="am-feat-row">
              <span className="am-feat-rank">#{i + 1}</span>
              <span className={`am-feat-chip-sm ${isApt ? "feat-apt" : "feat-riasec"}`}>
                {f.group}
              </span>
              <span className="am-feat-name">{f.name}</span>
              <div className="am-feat-bar-track">
                <div className="am-feat-bar-fill"
                  style={{
                    width:      `${barPct}%`,
                    background: isApt ? "#2563eb" : "#9333ea",
                  }} />
              </div>
              <span className="am-feat-imp"
                style={{ color: isApt ? "#2563eb" : "#9333ea" }}>
                {(f.importance * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="am-feat-legend">
        <span className="am-feat-chip-sm feat-riasec">RIASEC</span>
        <span className="am-feat-legend-desc">Holland Interest Inventory — top 4 of 6 codes dominate</span>
        <span className="am-feat-chip-sm feat-apt" style={{ marginLeft: "16px" }}>Aptitude</span>
        <span className="am-feat-legend-desc">Academic skill scores (5 subjects)</span>
      </div>
    </div>
  );
}

function ModelComparisonSection() {
  const [sortBy, setSortBy] = useState("accuracy");
  const sorted = [...MODEL_COMPARISON].sort((a, b) => b[sortBy] - a[sortBy]);
  const best   = sorted[0][sortBy];

  return (
    <div className="am-card">
      <div className="am-section-header">
        <span className="am-section-icon">🏆</span>
        <h3 className="am-section-title">Model Comparison</h3>
        <div className="am-sort-toggle">
          <button type="button"
            className={`am-sort-btn ${sortBy === "accuracy" ? "active" : ""}`}
            onClick={() => setSortBy("accuracy")}>Accuracy</button>
          <button type="button"
            className={`am-sort-btn ${sortBy === "f1" ? "active" : ""}`}
            onClick={() => setSortBy("f1")}>F1-Score</button>
        </div>
      </div>

      <div className="am-comparison-table">
        <div className="am-comp-header-row">
          <span>Model</span>
          <span>Tuning</span>
          <span>Accuracy</span>
          <span>F1-Score</span>
        </div>

        {sorted.map((m, i) => (
          <div key={m.name}
            className={`am-comp-row ${m.deployed ? "am-comp-deployed" : ""}`}>

            <div className="am-comp-name-cell">
              {i === 0 && <span className="am-comp-crown">🥇</span>}
              {m.deployed && <span className="am-comp-deployed-badge">Deployed</span>}
              <span className="am-comp-name">{m.name}</span>
            </div>

            <span className={`am-comp-tuning ${m.tuning !== "None" ? "am-tuning-active" : ""}`}>
              {m.tuning}
            </span>

            <div className="am-comp-metric-cell">
              <div className="am-comp-bar-track">
                <div className="am-comp-bar-fill"
                  style={{
                    width:      `${(m.accuracy / best) * 100}%`,
                    background: m.deployed ? "linear-gradient(90deg,#4da3f5,#2bbbad)" : "#e2e8f0",
                  }} />
              </div>
              <span className="am-comp-val">{pct(m.accuracy)}</span>
            </div>

            <div className="am-comp-metric-cell">
              <div className="am-comp-bar-track">
                <div className="am-comp-bar-fill"
                  style={{
                    width:      `${(m.f1 / best) * 100}%`,
                    background: m.deployed ? "linear-gradient(90deg,#4da3f5,#2bbbad)" : "#e2e8f0",
                  }} />
              </div>
              <span className="am-comp-val">{pct(m.f1)}</span>
            </div>
          </div>
        ))}
      </div>

      <p className="am-comp-note">
        ✅ Random Forest (n=100) was selected for deployment — it achieves competitive accuracy
        with the Stacking ensemble (only −0.46%) while being significantly faster and requiring
        no meta-learner. Stacking took <strong>21.6s</strong> to train vs <strong>1.6s</strong> for RF.
      </p>
    </div>
  );
}

function WhyDeployedSection() {
  const reasons = [
    {
      icon: "⚖️",
      title: "Best accuracy-to-complexity ratio",
      desc:  "RF at 95.58% is only 0.46% below Stacking (96.04%) but trains in 1.6s vs 21.6s with no meta-learner overhead.",
    },
    {
      icon: "🔍",
      title: "Feature importance built-in",
      desc:  "Natively provides Mean Decrease in Impurity scores. I_score (24.8%) and S_score (14.8%) are the top discriminating features.",
    },
    {
      icon: "⚡",
      title: "Fast inference",
      desc:  "Predicts in <1ms per sample — suitable for real-time web responses without GPU or caching infrastructure.",
    },
    {
      icon: "🛡️",
      title: "Robust to noise & correlation",
      desc:  "Bagging across 100 independent trees suppresses variance from correlated academic features (Math ↔ Science ↔ Logical Ability).",
    },
    {
      icon: "📦",
      title: "Self-contained deployment package",
      desc:  "Serialized as course_model.joblib alongside scaler, label_encoder, and feature_names — a complete 4-file package.",
    },
  ];

  return (
    <div className="am-card">
      <div className="am-section-header">
        <span className="am-section-icon">💡</span>
        <h3 className="am-section-title">Why Random Forest?</h3>
        <span className="am-section-sub">Deployment rationale</span>
      </div>
      <div className="am-why-list">
        {reasons.map(r => (
          <div key={r.title} className="am-why-row">
            <span className="am-why-icon">{r.icon}</span>
            <div>
              <p className="am-why-title">{r.title}</p>
              <p className="am-why-desc">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PipelineSection() {
  const steps = [
    { icon: "📝", label: "User Input",       desc: "5 aptitude scores + 6 RIASEC Likert ratings" },
    { icon: "🔢", label: "Feature Vector",   desc: "11 numerical features assembled in training column order" },
    { icon: "📏", label: "StandardScaler",   desc: "Normalise to mean=0, std=1 using scaler.joblib (fitted on training data)" },
    { icon: "🌲", label: "Random Forest",    desc: "100 trees vote; predict_proba() extracts per-class probability" },
    { icon: "🏷️", label: "LabelEncoder",     desc: "Integer prediction decoded back to career string via label_encoder.joblib" },
    { icon: "🎯", label: "Top-N Output",     desc: "Ranked careers with confidence % returned to the dashboard UI" },
  ];

  return (
    <div className="am-card">
      <div className="am-section-header">
        <span className="am-section-icon">🔄</span>
        <h3 className="am-section-title">Prediction Pipeline</h3>
      </div>
      <div className="am-pipeline">
        {steps.map((s, i) => (
          <div key={s.label} className="am-pipeline-step">
            <div className="am-pipeline-node">
              <span className="am-pipeline-icon">{s.icon}</span>
            </div>
            {i < steps.length - 1 && <div className="am-pipeline-arrow">→</div>}
            <div className="am-pipeline-text">
              <p className="am-pipeline-label">{s.label}</p>
              <p className="am-pipeline-desc">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotebookInfoSection() {
  return (
    <div className="am-card am-notebook-card">
      <div className="am-section-header">
        <span className="am-section-icon">📓</span>
        <h3 className="am-section-title">Lab Activity Reference</h3>
        <span className="am-section-sub">IT325 — Machine Learning</span>
      </div>
      <div className="am-notebook-body">
        <div className="am-notebook-row">
          <span className="am-notebook-label">Subject</span>
          <span className="am-notebook-value">IT325 — Machine Learning | College of Information Technology and Computing</span>
        </div>
        <div className="am-notebook-row">
          <span className="am-notebook-label">Activity</span>
          <span className="am-notebook-value">Lab Activity 2 — Margins, Forests &amp; Boosters: Pushing Classification to Its Limits</span>
        </div>
        <div className="am-notebook-row">
          <span className="am-notebook-label">Topics</span>
          <span className="am-notebook-value">SVM (Linear, RBF, Poly), Ensemble Methods (Random Forest, AdaBoost, Stacking)</span>
        </div>
        <div className="am-notebook-row">
          <span className="am-notebook-label">Authors</span>
          <span className="am-notebook-value">Abragan, Q. A. · Lao, D. A. · Pailanan, J. M. · Tubio, J.</span>
        </div>
        <div className="am-notebook-row">
          <span className="am-notebook-label">Notebook</span>
          <span className="am-notebook-value am-notebook-file">lab-activity-2-revised.ipynb</span>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────

export default function AboutModel() {
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <main className="am-page">

          <div className="am-page-header">
            <div>
              <h2 className="am-page-title">About the Model</h2>
              <p className="am-page-sub">
                Architecture, performance metrics, dataset info, and deployment rationale —
                sourced from <code>lab-activity-2-revised.ipynb</code>.
              </p>
            </div>
            <div className="am-page-header-ring">
              <AccuracyRing value={DEPLOYED.accuracy} size={88} strokeWidth={8} />
              <span className="am-page-header-ring-label">Model Accuracy</span>
            </div>
          </div>

          <div className="am-sections">
            <HeroMetrics />
            <ModelComparisonSection />
            <FeaturesSection />
            <div className="am-two-col">
              <DatasetSection />
              <WhyDeployedSection />
            </div>
            <PipelineSection />
            <NotebookInfoSection />
          </div>

        </main>
      </div>
    </div>
  );
}