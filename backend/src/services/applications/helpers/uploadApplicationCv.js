import fs from "fs";
import crypto from "crypto";
import path from "path";
import { getSupabaseClient, SUPABASE_BUCKET } from "../../../config/supabase.js";
import AppError from "../../../utils/appError.js";

export const uploadApplicationCvToSupabase = async ({ file, userId }) => {
  if (!file) return null;

  const extension = path.extname(file.originalname || ".pdf") || ".pdf";
  const fileName = `${userId}-${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
  const storagePath = `cvs/${fileName}`;

  let publicUrl = "";

  try {
    const supabase = getSupabaseClient();
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(storagePath, file.buffer, {
        contentType: file.mimetype || "application/pdf",
        upsert: true,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data: publicData } = supabase.storage
      .from(SUPABASE_BUCKET)
      .getPublicUrl(storagePath);
    publicUrl = publicData?.publicUrl || "";
  } catch (error) {
    console.warn("Supabase upload failed, falling back to local storage:", error.message);

    const localDir = path.join(process.cwd(), "src", "uploads", "cvs");
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }

    const localFilePath = path.join(localDir, fileName);
    fs.writeFileSync(localFilePath, file.buffer);

    const backendUrl = process.env.BACKEND_URL || "http://localhost:3001";
    publicUrl = `${backendUrl}/uploads/cvs/${fileName}`;
  }

  return {
    publicUrl,
    storagePath,
  };
};

export default uploadApplicationCvToSupabase;

