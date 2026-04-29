import React, { useEffect, useState } from "react";
import api from "../../services/api";
import ViewerContent from "./ViewerContent";

export default function ApplicationViewer({ application }) {
  const [cv, setCv] = useState(null);
  const [loadingCv, setLoadingCv] = useState(false);

  useEffect(() => {
    const fetchCv = async () => {
      if (!application?.cvId?._id) return;
      setLoadingCv(true);
      try {
        const res = await api.get(`/cvs/${application.cvId._id}`);
        setCv(res.data?.data?.cv || null);
      } catch (err) {
        console.error("Failed to fetch CV", err);
      } finally {
        setLoadingCv(false);
      }
    };
    fetchCv();
  }, [application?.cvId?._id]);

  if (!application) return null;

  return <ViewerContent application={application} cv={cv} loadingCv={loadingCv} />;
}
