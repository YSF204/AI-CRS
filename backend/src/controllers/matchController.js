import catchAsync from "../utils/catchAsync.js";
import { recommendJobsForCv } from "../services/matching/recommendJobsForCv.js";

export const recommendJobs = catchAsync(async (req, res, next) => {
  const filteredJobs = await recommendJobsForCv({
    cvId: req.params.id,
    userId: req.user._id,
  });

  res.status(200).json({
    success: true,
    data: { match: filteredJobs },
  });
});
