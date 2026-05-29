import { useState, useEffect } from "react";
import API_BASE_URL from "../config/api";

const API_BASE = API_BASE_URL;

export function useLatestResult() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // FIXED KEY HERE
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/api/assessment/results/latest`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((r) => {
        if (r.status === 404) return null;

        if (!r.ok) {
          throw new Error("Failed to load results.");
        }

        return r.json();
      })
      .then((data) => setResult(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { result, loading, error };
}