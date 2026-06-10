import React from "react";
import {
  ChevronLeft,
  CheckCircle2,
  XCircle,
  Zap,
  AlertTriangle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalysisScreen({
  job,
  matchAnalysis,
  setStep,
  setMatchAnalysis,
  setCvFile,
  setSelectedCvId,
  handleSubmitApplication,
  submitting,
  isEdit,
}) {
  const navigate = useNavigate();
  const matchPercentage =
    matchAnalysis?.matchPercentage ||
    matchAnalysis?.overall_fit_percentage ||
    0;
  const isQualified = matchPercentage >= 50;

  // Extract details handles both the new AI schema and the old schema
  const matchDetails = matchAnalysis.matchDetails || {};
  const aiSummary =
    matchAnalysis.recruiter_summary || matchDetails.matchAnalysis || "";
  const strengthsList = matchAnalysis.strengths || [];
  const weaknessesList = matchAnalysis.weaknesses || [];

  // FIX #4: Handler to reset CV selection and go back to upload step
  const handleTryDifferentCV = () => {
    setMatchAnalysis(null);
    setCvFile(null);
    setSelectedCvId("");
    setStep("upload");
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8 pb-10 bg-[var(--bg)] p-4 sm:p-8 border-[6px] border-black shadow-[12px_12px_0px_#000]">
      {/* Header Area */}
      <div className="flex items-center justify-between border-b-[6px] border-black pb-6">
        <div>
          <button
            onClick={() => {
              setStep("upload");
              setMatchAnalysis(null);
              setCvFile(null);
            }}
            className="flex items-center gap-2 mb-4 text-black hover:bg-black hover:text-white transition-colors font-mono font-bold uppercase tracking-widest text-xs border-4 border-black px-4 py-2"
          >
            <ChevronLeft size={16} /> Back to CV Selection
          </button>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black font-['Space_Grotesk'] uppercase tracking-tight text-black">
            Fit Analysis
          </h1>
          <p className="font-mono text-xs sm:text-base text-black font-bold uppercase tracking-widest mt-2 border-2 border-black inline-block px-2 sm:px-3 py-1 bg-[var(--yellow)]">
            POSITION: {job.position}
          </p>
        </div>
      </div>

      {/* Main Score Area */}
      <div className="flex flex-col md:flex-row gap-6">
        {/* Massive Score Block */}
        <div className="flex-1 border-[6px] border-black p-8 flex flex-col items-center justify-center bg-white shadow-[8px_8px_0px_#000] relative">
          <div className="absolute top-4 right-4 bg-white text-black p-2 border-4 border-black shadow-[4px_4px_0px_#000]">
            {isQualified ? <CheckCircle2 size={32} /> : <XCircle size={32} />}
          </div>

          <span className="font-mono font-black text-sm uppercase tracking-[0.2em] text-black mb-2 px-4 py-1 border-2 border-black">
            Overall AI Score
          </span>

          <h2 className="text-6xl sm:text-8xl md:text-[9rem] font-black leading-none text-black">
            {matchPercentage}
            <span className="text-2xl sm:text-4xl">%</span>
          </h2>
        </div>


      </div>

      {/* Summary Notes */}
      {aiSummary && (
        <div className="border-[6px] border-black p-6 bg-white shadow-[8px_8px_0px_#000]">
          <h3 className="font-black font-['Space_Grotesk'] text-2xl uppercase mb-4 text-black border-b-4 border-black inline-block pb-1">
            Recruiter Summary
          </h3>
          <p className="font-mono text-base font-bold text-black leading-relaxed">
            {aiSummary}
          </p>
        </div>
      )}

      {/* Grid for Strengths and Weaknesses */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="border-[6px] border-black p-6 bg-white shadow-[8px_8px_0px_#000]">
          <h3 className="font-black font-['Space_Grotesk'] text-xl uppercase mb-4 text-black bg-[var(--teal)] px-3 py-1 inline-block border-2 border-black">
            Detected Strengths
          </h3>
          {strengthsList.length > 0 ? (
            <ul className="space-y-3">
              {strengthsList.map((strength, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-mono text-sm font-bold text-black items-start"
                >
                  <span className="font-black text-xl leading-none mt-1 text-[var(--teal)]">
                    +
                  </span>
                  {strength}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-sm text-[var(--fg-muted)] italic">
              No strengths listed.
            </p>
          )}
        </div>

        <div className="border-[6px] border-black p-6 bg-white shadow-[8px_8px_0px_#000]">
          <h3 className="font-black font-['Space_Grotesk'] text-xl uppercase mb-4 text-black bg-[var(--coral)] px-3 py-1 inline-block border-2 border-black">
            Missing Elements
          </h3>
          {weaknessesList.length > 0 ? (
            <ul className="space-y-3">
              {weaknessesList.map((weakness, i) => (
                <li
                  key={i}
                  className="flex gap-3 font-mono text-sm font-bold text-black items-start"
                >
                  <span className="font-black text-xl leading-none mt-1 text-[var(--coral)]">
                    -
                  </span>
                  {weakness}
                </li>
              ))}
            </ul>
          ) : (
            <p className="font-mono text-sm text-[var(--fg-muted)] italic">
              No elements missing.
            </p>
          )}
        </div>
      </div>

      {/* Application Actions */}
      <div className="mt-4 pt-6 border-t-[6px] border-black">
        {!isQualified && (
          <div className="flex items-start gap-4 bg-[var(--coral)] border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_#000]">
            <AlertTriangle className="text-black shrink-0 mt-1" size={28} />
            <p className="font-mono text-sm text-black font-bold">
              Your profile does not meet the minimum match threshold for this
              position (match score: {matchPercentage}%). Please try a different
              CV or explore other opportunities.
            </p>
          </div>
        )}

        {/* FIX #4: Show different buttons based on match percentage */}
        {isQualified ? (
          <button
            onClick={handleSubmitApplication}
            disabled={submitting}
            className="w-full flex items-center justify-center gap-2 sm:gap-4 bg-[var(--teal)] hover:bg-[#fff] text-black border-[6px] border-black py-4 sm:py-6 px-4 sm:px-10 shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#000] transition-all disabled:opacity-50"
          >
            <span className="font-black font-['Space_Grotesk'] text-lg sm:text-2xl md:text-3xl uppercase tracking-wider sm:tracking-widest">
              {submitting
                ? "Processing..."
                : isEdit
                  ? "Update Submission"
                  : "Submit Application"}
            </span>
            {!submitting && <ArrowRight className="w-6 h-6 sm:w-8 sm:h-8 shrink-0" />}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleTryDifferentCV}
              className="flex-1 flex items-center justify-center gap-3 bg-[var(--yellow)] hover:bg-[#FFC107] text-black border-[6px] border-black py-4 px-6 shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#000] transition-all"
            >
              <RotateCcw size={24} />
              <span className="font-black font-['Space_Grotesk'] text-lg uppercase tracking-widest">
                Try a Different CV
              </span>
            </button>
            <button
              onClick={() => navigate("/employee/jobs")}
              className="flex-1 flex items-center justify-center gap-3 bg-white text-black border-[6px] border-black py-4 px-6 shadow-[8px_8px_0px_#000] hover:translate-x-1 hover:-translate-y-1 hover:shadow-[12px_12px_0px_#000] transition-all"
            >
              <span className="font-black font-['Space_Grotesk'] text-lg uppercase tracking-widest">
                Find Another Job
              </span>
              <ArrowRight size={24} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
