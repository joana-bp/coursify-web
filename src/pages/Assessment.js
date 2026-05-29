import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAssessment } from "../context/Assessmentcontext";
import "../styles/Assessment.css";
import API_BASE_URL from "../config/api";

// ── Constants ────────────────────────────────────────────────────────────────
const STORAGE_KEY = "coursify_assessment_progress";

const LIKERT_LABELS = [
  "Strongly Disagree",
  "Disagree",
  "Neutral",
  "Agree",
  "Strongly Agree",
];

// Aptitude subjects now include programming; no Big Five, no Strand.
// Subject → ML feature mapping (matches career_data.csv):
//   math        → Math_Score
//   science     → Science_Score
//   programming → Programming_Skill
//   english     → Communication_Skill
//   abstract    → Logical_Ability
const SECTIONS = [
  { key: "riasec",      title: "RIASEC Interests",     icon: "🧭", desc: "Holland Interest Inventory · 36 questions" },
  { key: "math",        title: "Math Aptitude",         icon: "📐", desc: "Algebra, Geometry, Statistics, Logic · 12 questions" },
  { key: "science",     title: "Science Aptitude",      icon: "🔬", desc: "Biology, Physics, Chemistry, Earth Science · 12 questions" },
  { key: "programming", title: "Programming Aptitude",  icon: "💻", desc: "Fundamentals, OOP & Design, Algorithm & Data Structures, Web & Databases · 12 questions" },
  { key: "english",     title: "English Aptitude",      icon: "📖", desc: "Grammar & Sentence Structure, Reading Comprehension, Vocabulary & Word Usage, Writing & Communication Analysis · 12 questions" },
  { key: "abstract",    title: "Abstract Reasoning",    icon: "🔷", desc: "Pattern Recognition, Spatial Reasoning, Logical Sequences, Analogical Reasoning · 12 questions" },
];

const APTITUDE_SUBJECTS = ["math", "science", "programming", "english", "abstract"];


// ── Helpers ──────────────────────────────────────────────────────────────────

function getCurrentUserId() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub ?? payload.id ?? null;
  } catch {
    return null;
  }
}

function loadSaved(currentUserId) {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return {};
    const parsed = JSON.parse(s);
    if (parsed.userId && parsed.userId !== currentUserId) {
      localStorage.removeItem(STORAGE_KEY);
      return {};
    }
    return parsed;
  } catch {
    return {};
  }
}

function isSectionComplete(key, questions, answers) {
  if (key === "riasec") {
    return (
      questions?.riasec &&
      Object.keys(answers.riasecAnswers || {}).length === questions.riasec.length
    );
  }

  if (APTITUDE_SUBJECTS.includes(key)) {
    const qs = questions?.aptitude?.[key];
    return (
      qs &&
      Object.keys((answers.aptitudeAnswers || {})[key] || {}).length === qs.length
    );
  }

  return false;
}

function SectionProgress({ current, total }) {
  const pct = total > 0 ? Math.round((current / total) * 100) : 0;
  return (
    <div className="section-progress">
      <div className="section-progress-track">
        <div className="section-progress-fill" style={{ width: `${pct}%` }} />
      </div>
      <span className="section-progress-label">{current}/{total}</span>
    </div>
  );
}


// ── Main Component ────────────────────────────────────────────────────────────
export default function Assessment() {
  const navigate = useNavigate();
  const {
    questions, setQuestions,
    questionsLoading, setQuestionsLoading,
    questionsError,   setQuestionsError,
    setAssessmentAnswers, setResultId,
  } = useAssessment();

  const currentUserId = getCurrentUserId();
  const saved = loadSaved(currentUserId);

  // ── Answer state ──
  const [riasecAnswers,   setRiasecAnswers]   = useState(saved.riasecAnswers   || {});
  const [aptitudeAnswers, setAptitudeAnswers] = useState(saved.aptitudeAnswers || {});

  // ── UI state ──
  const [openSection, setOpenSection] = useState(null);
  const [submitted,   setSubmitted]   = useState(false);
  const [submitting,  setSubmitting]  = useState(false);
  const [submitError, setSubmitError] = useState(null);

  // ── Auto-save progress (scoped to current user) ──
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      userId: currentUserId,
      riasecAnswers,
      aptitudeAnswers,
    }));
  }, [currentUserId, riasecAnswers, aptitudeAnswers]);

  // ── Fetch questions ──────────────────────────────────────────────────────
  const fetchQuestions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { navigate("/"); return; }
    try {
      setQuestionsLoading(true);
      setQuestionsError(null);
      const res  = await fetch(`${API_BASE_URL}/api/assessment/questions`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Failed to load questions.");
      setQuestions(data);

      // Scrub stale answer keys not in the new question set
      const freshRiasecIds = new Set(data.riasec.map(q => q._id));
      const freshAptitudeIds = Object.fromEntries(
        APTITUDE_SUBJECTS.map(subj => [
          subj,
          new Set((data.aptitude?.[subj] || []).map(q => q._id)),
        ])
      );

      setRiasecAnswers(prev =>
        Object.fromEntries(Object.entries(prev).filter(([id]) => freshRiasecIds.has(id)))
      );
      setAptitudeAnswers(prev => {
        const cleaned = {};
        for (const subj of APTITUDE_SUBJECTS) {
          cleaned[subj] = Object.fromEntries(
            Object.entries(prev[subj] || {}).filter(([id]) => freshAptitudeIds[subj].has(id))
          );
        }
        return cleaned;
      });

    } catch (err) {
      setQuestionsError(err.message);
    } finally {
      setQuestionsLoading(false);
    }
  }, [navigate, setQuestions, setQuestionsLoading, setQuestionsError]);

  // Always fetch fresh questions on mount
  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Progress ──
  const answersObj = { riasecAnswers, aptitudeAnswers };

  const completedSections = SECTIONS.filter(s =>
    isSectionComplete(s.key, questions, answersObj)
  ).length;
  const overallPct  = Math.round((completedSections / SECTIONS.length) * 100);
  const allComplete = completedSections === SECTIONS.length;

  // ── Answer helpers ──
  const setAptitudeAnswer = (subject, qid, value) => {
    setAptitudeAnswers(prev => ({
      ...prev,
      [subject]: { ...(prev[subject] || {}), [qid]: value },
    }));
  };

  // ── Submit ──
  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Flatten { math: { qid: "A" }, science: { qid: "B" }, ... }
      // into   { qid: "A", qid2: "B", ... } — what the backend expects
      const flatAptitudeAnswers = APTITUDE_SUBJECTS.reduce(
        (acc, subj) => ({ ...acc, ...(aptitudeAnswers[subj] || {}) }),
        {}
      );

      const res = await fetch(`${API_BASE_URL}/api/assessment/submit`, {
        method:  "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          riasec_answers:   riasecAnswers,
          aptitude_answers: flatAptitudeAnswers,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Submission failed.");

      setAssessmentAnswers({ riasecAnswers, aptitudeAnswers });
      setResultId(data.result_id);
      localStorage.removeItem(STORAGE_KEY);
      setSubmitted(true);
    } catch (err) {
      setSubmitError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Submitted screen ──
  if (submitted) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <main className="dashboard">
            <section className="assessment-complete">
              <div className="complete-icon">🎓</div>
              <h2>Assessment Complete!</h2>
              <p>Your answers have been saved. Course recommendations will be generated soon.</p>
              <button type="button" className="primary-btn-assess"
                onClick={() => navigate("/dashboard")}>
                Back to Dashboard →
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  // ── Loading ──
  if (questionsLoading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <main className="assessment-page">
            <div className="questions-loading">
              <div className="loading-spinner" />
              <p>Loading your assessment questions...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Error ──
  if (questionsError) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <main className="assessment-page">
            <div className="questions-error">
              <p>⚠️ {questionsError}</p>
              <button type="button" className="primary-btn-assess" onClick={fetchQuestions}>
                Retry
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  // ── Main render ──
  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <main className="assessment-page">

          {/* Header */}
          <div className="assessment-header">
            <div>
              <h2>Course Assessment</h2>
              <p>Complete all sections — your progress saves automatically.</p>
            </div>
            <span className="progress-badge">{completedSections}/{SECTIONS.length} completed</span>
          </div>

          {/* Overall progress bar */}
          <div className="overall-progress">
            <div className="overall-progress-track">
              <div className="overall-progress-fill" style={{ width: `${overallPct}%` }} />
            </div>
            <span className="overall-progress-label">{overallPct}% complete</span>
          </div>

          {/* Section cards */}
          <div className="section-cards">
            {SECTIONS.map((section) => {
              const done   = isSectionComplete(section.key, questions, answersObj);
              const isOpen = openSection === section.key;

              return (
                <div key={section.key}
                  className={`section-card ${done ? "done" : ""} ${isOpen ? "open" : ""}`}>

                  <button type="button" className="section-card-header"
                    onClick={() => setOpenSection(isOpen ? null : section.key)}>
                    <div className="section-card-left">
                      <span className="section-icon">{section.icon}</span>
                      <div>
                        <span className="section-card-title">{section.title}</span>
                        <span className="section-card-desc">{section.desc}</span>
                      </div>
                    </div>
                    <div className="section-card-right">
                      {done
                        ? <span className="section-status done-badge">✓ Complete</span>
                        : <span className="section-status pending-badge">Pending</span>}
                      <span className="section-chevron">{isOpen ? "▲" : "▼"}</span>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="section-body">

                      {section.key === "riasec" && questions?.riasec && (
                        <LikertSection
                          questions={questions.riasec}
                          answers={riasecAnswers}
                          setAnswers={setRiasecAnswers}
                          subtitle="Rate how much each activity interests you."
                          onDone={() => setOpenSection(null)}
                          done={done}
                        />
                      )}

                      {APTITUDE_SUBJECTS.includes(section.key) &&
                        questions?.aptitude?.[section.key] && (
                        <AptitudeSection
                          subject={section.key}
                          questions={questions.aptitude[section.key]}
                          answers={(aptitudeAnswers[section.key] || {})}
                          setAnswer={(qid, val) => setAptitudeAnswer(section.key, qid, val)}
                          onDone={() => setOpenSection(null)}
                          done={done}
                        />
                      )}

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit area */}
          <div className="assessment-submit-area">
            {submitError && <p className="submit-error">⚠️ {submitError}</p>}
            {allComplete ? (
              <button type="button" className="submit-btn"
                onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "🎯 Submit Assessment"}
              </button>
            ) : (
              <p className="submit-hint">
                Complete all {SECTIONS.length} sections above to submit your assessment.
              </p>
            )}
          </div>

        </main>
      </div>
    </div>
  );
}


// ── Sub-components ────────────────────────────────────────────────────────────

function LikertSection({ questions, answers, setAnswers, subtitle, onDone, done }) {
  const answered = Object.keys(answers).length;
  const total    = questions.length;

  return (
    <div>
      <p className="step-subtitle">{subtitle}</p>

      <div className="likert-legend">
        {LIKERT_LABELS.map((label, i) => (
          <div key={i} className="likert-legend-item">
            <span className="likert-legend-num">{i + 1}</span>
            <span className="likert-legend-label">{label}</span>
          </div>
        ))}
      </div>

      <SectionProgress current={answered} total={total} />

      <div className="riasec-list">
        {questions.map((q, i) => {
          const current = answers[q._id] || 0;
          return (
            <div key={q._id} className={`riasec-row ${current ? "answered" : ""}`}>
              <span className="riasec-num">{i + 1}</span>
              <span className="riasec-text">{q.text}</span>
              <div className="likert-scale">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button key={val} type="button"
                    className={"likert-btn" + (current === val ? " active" : "")}
                    title={LIKERT_LABELS[val - 1]}
                    onClick={() => setAnswers(prev => ({ ...prev, [q._id]: val }))}>
                    {val}
                  </button>
                ))}
                {current > 0 && (
                  <span className="likert-selected-label">{LIKERT_LABELS[current - 1]}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {done && (
        <button type="button" className="section-done-btn" onClick={onDone}>
          Save & Close ✓
        </button>
      )}
    </div>
  );
}


function AptitudeSection({ subject, questions, answers, setAnswer, onDone, done }) {
  const answered = Object.keys(answers).length;
  const total    = questions.length;

  return (
    <div>
      <p className="step-subtitle">Choose the best answer for each question.</p>
      <SectionProgress current={answered} total={total} />

      {questions.map((q, i) => {
        const selected = answers[q._id];
        return (
          <div key={q._id} className={`academic-q ${selected ? "answered" : ""}`}>
            <p className="academic-q-text">
              <span className="academic-q-num">{i + 1}.</span>
              {q.text}
            </p>
            <div className="mcq-options">
              {(q.options || []).map((opt) => {
                const isSelected = selected === opt.label;
                return (
                  <button key={opt.label} type="button"
                    className={"mcq-opt" + (isSelected ? " selected" : "")}
                    aria-pressed={isSelected}
                    onClick={() => setAnswer(q._id, opt.label)}>
                    <span className="mcq-label">{opt.label}.</span>
                    <span className="mcq-value">{opt.value}</span>
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}

      {done && (
        <button type="button" className="section-done-btn" onClick={onDone}>
          Save & Close ✓
        </button>
      )}
    </div>
  );
}