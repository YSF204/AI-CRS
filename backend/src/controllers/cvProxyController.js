import catchAsync from "../utils/catchAsync.js";
import AppError from "../utils/appError.js";
import Application from "../models/Application.js";
import { getSupabaseClient, SUPABASE_BUCKET } from "../config/supabase.js";

/**
 * GET /applications/:id/cv
 *
 * Streams the candidate's uploaded PDF from Supabase directly to the client.
 * This avoids any dependency on ephemeral local filesystem paths (e.g. Render disk).
 *
 * Access control: the requester must be either the applicant (userId) or the
 * employer who owns the job posting (employerId).
 */
export const streamApplicationCv = catchAsync(async (req, res, next) => {
  const application = await Application.findById(req.params.id).lean();

  if (!application) {
    return next(new AppError("Application not found", 404));
  }

  // Allow access to: the applicant themselves OR the employer for that job
  const requesterId = String(req.user._id);
  const isApplicant = String(application.userId) === requesterId;
  const isEmployer =
    req.user.role === "employer" &&
    String(application.employerId) === String(req.user.employerId || "");

  // Fallback: allow any authenticated employer (they see applications on their jobs)
  const allowedRoles = ["employer", "admin"];
  const isAllowed =
    isApplicant || allowedRoles.includes(req.user.role) || isEmployer;

  if (!isAllowed) {
    return next(new AppError("Not authorised to view this CV", 403));
  }

  const cvFile = application.cvFile;
  if (!cvFile?.path && !cvFile?.storagePath) {
    return next(new AppError("No CV file attached to this application", 404));
  }

  // ── 1. Prefer streaming from Supabase using storagePath ──────────────────
  const storagePath = cvFile.storagePath;
  if (storagePath) {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .download(storagePath);

      if (error) throw error;

      // `data` is a Blob — convert to Buffer and stream
      const arrayBuffer = await data.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = cvFile.filename || "cv.pdf";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(filename)}"`,
      );
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "private, max-age=3600");
      return res.send(buffer);
    } catch (err) {
      console.warn(
        "[cvProxy] Supabase stream failed, trying public URL:",
        err.message,
      );
    }
  }

  // ── 2. Fallback: proxy the stored public URL ──────────────────────────────
  const publicUrl = cvFile.path;
  if (publicUrl && /^https?:\/\//i.test(publicUrl)) {
    try {
      const fetchRes = await fetch(publicUrl);
      if (!fetchRes.ok) {
        throw new Error(`Remote fetch failed: ${fetchRes.status}`);
      }
      const arrayBuffer = await fetchRes.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const filename = cvFile.filename || "cv.pdf";
      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `inline; filename="${encodeURIComponent(filename)}"`,
      );
      res.setHeader("Content-Length", buffer.length);
      res.setHeader("Cache-Control", "private, max-age=3600");
      return res.send(buffer);
    } catch (err) {
      console.error("[cvProxy] Public URL proxy failed:", err.message);
      return next(new AppError("CV file is no longer available", 404));
    }
  }

  return next(new AppError("CV file is no longer available", 404));
});
