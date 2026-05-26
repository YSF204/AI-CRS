import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const EXTERNAL_JOBS_PATH = path.resolve(
    __dirname,
    "..",
    "..",
    "..",
    "..",
    "..",
    "scraper",
    "jobs_2026.json",
);

const normalizeExternalJob = (job, index) => ({
    id: job.url || `external-${index}`,
    title: job.title || "Untitled Job",
    company: job.company || job.sourceName || "Jobs.ps",
    location: job.location || "N/A",
    type: job.workDuration || "OPEN",
    posted: job.createdAt || "Recently",
    externalUrl: job.url || "",
    sourceName: job.sourceName || "Jobs.ps",
    raw: {
        ...job,
        workSite: job.workSite || job.location || "N/A",
        externalUrl: job.url || "",
        sourceName: job.sourceName || "Jobs.ps",
    },
});

export const getExternalJobs = async () => {
    try {
        const raw = await fs.readFile(EXTERNAL_JOBS_PATH, "utf8");
        const jobs = JSON.parse(raw);

        if (!Array.isArray(jobs)) {
            return [];
        }

        return jobs
            .filter((job) => job && job.url)
            .map(normalizeExternalJob);
    } catch (error) {
        if (error.code === "ENOENT") {
            return [];
        }

        throw error;
    }
};

export default getExternalJobs;