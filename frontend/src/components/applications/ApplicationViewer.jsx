import React, { useEffect, useState } from "react";
import api from "../../services/api";
import ViewerContent from "./ViewerContent";

export default function ApplicationViewer({ application, showAnalysis = true }) {
  const [cv, setCv] = useState(null);
  const [loadingCv, setLoadingCv] = useState(false);

  useEffect(() => {
    const fetchCv = async () => {
      const cvId = application?.cvId?._id || application?.cvId;
      if (!cvId) return;
      if (typeof application.cvId === "object") {
        setCv(application.cvId);
        return;
      }
      setLoadingCv(true);
      try {
        const res = await api.get(`/cvs/${cvId}`);
        setCv(res.data?.data?.cv || null);
      } catch (err) {
        console.error("Failed to fetch CV", err);
      } finally {
        setLoadingCv(false);
      }
    };
    fetchCv();
  }, [application?.cvId?._id, application?.cvId]);

  if (!application) return null;

  return (
    <ViewerContent
      application={application}
      cv={cv}
      loadingCv={loadingCv}
      showAnalysis={showAnalysis}
    />
  );
}
