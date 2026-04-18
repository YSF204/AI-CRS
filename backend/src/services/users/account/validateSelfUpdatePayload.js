import AppError from "../../../utils/appError.js";

export const validateSelfUpdatePayload = (body) => {
    if (body.role) {
        throw new AppError("You are not allowed to change your role", 403);
    }

    if (body.password || body.passwordConfirm) {
        throw new AppError(
            "This route isn't for password updates. Please use /updatepassword",
            400,
        );
    }
};

export default validateSelfUpdatePayload;
