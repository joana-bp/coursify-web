import { NavLink, useNavigate } from "react-router-dom";
import logoText1 from "../assets/logo-text.png";
import { MdDashboard, MdAssignment, MdMenuBook, MdPerson } from "react-icons/md";
import { useAssessment } from "../context/Assessmentcontext";

// ── Storage key must match Assessment.jsx ────────────────────────────────────
const STORAGE_KEY = "coursify_assessment_progress";

function Sidebar() {
  const navigate = useNavigate();
  const { setQuestions, setAssessmentAnswers, setResultId } = useAssessment();

  const handleLogout = () => {
    // 1. Clear auth (was sessionStorage — keep as-is)
    sessionStorage.removeItem("coursify_user");

    // 2. Clear JWT token used by assessment fetches
    localStorage.removeItem("token");

    // 3. Clear assessment draft so next user gets a clean slate
    localStorage.removeItem(STORAGE_KEY);

    // 4. Reset AssessmentContext so stale questions/results don't bleed
    //    into the next account that logs in during the same browser session
    setQuestions(null);
    setAssessmentAnswers(null);
    setResultId(null);

    navigate("/");
  };

  return (
    <aside className="sidebar">
      <div className="logo-container">
        <img src={logoText1} alt="Coursify" className="logo-text1" />
      </div>

      <nav>
        <NavLink to="/dashboard" className="sidebar-link">
          <MdDashboard className="sidebar-icon" />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/assessment" className="sidebar-link">
          <MdAssignment className="sidebar-icon" />
          <span>Assessment</span>
        </NavLink>

        <NavLink to="/model" className="sidebar-link">
          <MdMenuBook className="sidebar-icon" />
          <span>About Model</span>
        </NavLink>

        <NavLink to="/profile" className="sidebar-link">
          <MdPerson className="sidebar-icon" />
          <span>Profile</span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout"
          onClick={handleLogout}
        >
          <span className="sidebar-logout-icon">⎋</span>
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;