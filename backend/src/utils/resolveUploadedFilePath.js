import crypto from "crypto";
import fs from "fs";
import os from "os";
import path from "path";

export const resolveUploadedFilePath = async (file, defaultExtension = ".pdf") => {
  if (!file) {
    throw new Error("No file provided");
  }

  if (file.path) {
    return { filePath: file.path, cleanup: null };
  }

  if (!file.buffer) {
    throw new Error("Uploaded file buffer is missing");
  }

  const tempDir = await fs.promises.mkdtemp(path.join(os.tmpdir(), "ai-crs-upload-"));
  const extension = path.extname(file.originalname || "") || defaultExtension;
  const tempFilePath = path.join(
    tempDir,
    `${crypto.randomBytes(8).toString("hex")}${extension}`,
  );

  await fs.promises.writeFile(tempFilePath, file.buffer);

  return {
    filePath: tempFilePath,
    cleanup: async () => {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    },
  };
};

export default resolveUploadedFilePath;
