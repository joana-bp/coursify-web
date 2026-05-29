function CourseCard({ course, matchScore, reason }) {

  let scoreClass = "low-score";
  if (matchScore >= 85) scoreClass = "high-score";
  else if (matchScore >= 70) scoreClass = "medium-score";

  return (
    <div className="course-card">
      <div className="course-title">{course}</div>
      <div className="course-reason">{reason}</div>
      <div className={`match-score ${scoreClass}`}>
        Match Score: {matchScore}%
      </div>
    </div>
  );
}

export default CourseCard;
