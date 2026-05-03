import { useCallback } from "react";
import api from "../services/api";

export default function useEmployeeDash() {
  const fetchAll = useCallback(async () => {
    const [cvsRes, appsRes, jobsRes] = await Promise.all([
      api.get("/cvs"),
      api.get("/applications/my-applications"),
      api.get("/jobs"),
    ]);

    return {
      cvs: cvsRes.data?.data?.cvs || [],
      applications: appsRes.data?.data?.applications || [],
      jobs: jobsRes.data?.data?.jobs || [],
    };
  }, []);

  return { fetchAll };
}
