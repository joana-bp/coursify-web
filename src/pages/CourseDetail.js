import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useLatestResult } from "../hooks/useLatestResult";
import "../styles/CourseDetail.css";

function getScoreClass(confidence) {
  if (confidence >= 30) return "high-score";
  if (confidence >= 15) return "medium-score";
  return "low-score";
}

function CourseDetail() {
  const { id } = useParams();          // id = rank (1-based) or index
  const navigate = useNavigate();
  const { result, loading } = useLatestResult();

  // Find the course by rank or list index
  const data = result?.recommendations?.find(
    (r) => r.rank === parseInt(id) || String(r.rank) === id
  );

  if (loading) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <main className="dashboard">
            <div className="detail-loading">
              <div className="loading-spinner" />
              <p>Loading course details…</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="dashboard-layout">
        <Sidebar />
        <div className="dashboard-main">
          <main className="dashboard">
            <section className="empty-state">
              <div className="empty-icon">🔍</div>
              <h3>Course not found</h3>
              <p>Please complete the assessment first to view course details.</p>
              <button
                type="button"
                className="primary-btn-assess"
                onClick={() => navigate("/assessment")}
              >
                Take Assessment →
              </button>
            </section>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <Sidebar />
      <div className="dashboard-main">
        <main className="dashboard">

          <button
            type="button"
            className="back-btn"
            onClick={() => navigate("/dashboard")}
          >
            ← Back to Dashboard
          </button>

          <section className="detail-hero">
            <div>
              <h2 className="detail-title">{data.course}</h2>
              <p className="detail-reason">
                Ranked #{data.rank} based on your RIASEC profile, Big Five personality, and aptitude scores.
              </p>
            </div>
            <span className={`match-score ${getScoreClass(data.confidence)}`}>
              Confidence: {data.confidence}%
            </span>
          </section>

          <section className="detail-cta">
            <p>Want better recommendations?</p>
            <button
              type="button"
              className="cta-btn"
              onClick={() => navigate("/assessment")}
            >
              Retake Assessment →
            </button>
          </section>

        </main>
      </div>
    </div>
  );
}

export default CourseDetail;