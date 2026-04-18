import catchAsync from "../utils/catchAsync.js";
import { findPotentialCandidates } from "../services/candidates/search/findPotentialCandidates.js";
import { getEmployerSearchHistory as getEmployerSearchHistoryQuery } from "../services/candidates/search/getEmployerSearchHistory.js";


export const findPotintialCandidates = catchAsync(async (req, res, next) => {
    const result = await findPotentialCandidates({
        userId: req.user._id,
        body: req.body,
    });

    res.status(200).json({
        status: "success",
        data: {
            candidates: result.candidates,
            total: result.total
        }
    });

})

export const getEmployerSearchHistory = catchAsync(async (req, res, next) => {
    const history = await getEmployerSearchHistoryQuery({ userId: req.user._id });

    res.status(200).json({
        status: "success",
        data: history
    });
});
