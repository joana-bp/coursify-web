import { createContext, useContext, useState } from "react";

const AssessmentContext = createContext();

export function AssessmentProvider({ children }) {
  const [questions, setQuestions]               = useState(null);   // fetched from backend
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [questionsError, setQuestionsError]     = useState(null);

  const [assessmentAnswers, setAssessmentAnswers] = useState(null);
  const [recommendations, setRecommendations]     = useState([]);
  const [resultId, setResultId]                   = useState(null);

  return (
    <AssessmentContext.Provider value={{
      // Questions
      questions,
      setQuestions,
      questionsLoading,
      setQuestionsLoading,
      questionsError,
      setQuestionsError,

      // Answers & results
      assessmentAnswers,
      setAssessmentAnswers,
      recommendations,
      setRecommendations,
      resultId,
      setResultId,
    }}>
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  return useContext(AssessmentContext);
}