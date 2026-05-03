import { useCallback } from "react";
import api from "../services/api";

export default function useEmployerDash() {
  const fetchAll = useCallback(async () => {
    const [profileRes, jobsRes] = await Promise.all([
      api.get("/employers"),
      api.get("/jobs/employer/me"),
    ]);

    return {
      profile: profileRes.data?.data?.employer || null,
      jobs: jobsRes.data?.data?.jobs || [],
    };
  }, []);

  return { fetchAll };
}
