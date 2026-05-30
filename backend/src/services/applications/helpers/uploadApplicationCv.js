import crypto from "crypto";
import path from "path";
import { getSupabaseClient, SUPABASE_BUCKET } from "../../../config/supabase.js";
import AppError from "../../../utils/appError.js";

export const uploadApplicationCvToSupabase = async ({ file, userId }) => {
  if (!file) return null;

  const extension = path.extname(file.originalname || ".pdf") || ".pdf";
  const fileName = `${userId}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
  const storagePath = `cvs/${fileName}`;
  const supabase = getSupabaseClient();

  const { error: uploadError } = await supabase.storage
    .from(SUPABASE_BUCKET)
    .upload(storagePath, file.buffer, {
      contentType: file.mimetype || "application/pdf",
      upsert: true,
    });

  if (uploadError) {
    throw new AppError(`Failed to upload CV PDF: ${uploadError.message}`, 500);
  }

  const { data: publicData } = supabase.storage
    .from(SUPABASE_BUCKET)
    .getPublicUrl(storagePath);

  return {
    publicUrl: publicData?.publicUrl || "",
    storagePath,
  };
};

export default uploadApplicationCvToSupabase;
