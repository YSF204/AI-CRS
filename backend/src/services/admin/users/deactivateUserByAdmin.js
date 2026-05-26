import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import sendEmail from "../../../utils/email.js";
import { buildAdminDeleteAccountEmail } from "../../shared/emailTemplateService.js";

export const deactivateUserByAdmin = async ({ userId }) => {
    const targetUser = await User.findById(userId);
    if (!targetUser) {
        throw new AppError("User not found", 404);
    }

    if (targetUser.role === "ADMIN") {
        throw new AppError("Cannot delete another admin", 403);
    }

    targetUser.active = false;
    await targetUser.save({ validateBeforeSave: false });

    try {
        const emailTemplate = buildAdminDeleteAccountEmail(targetUser);
        await sendEmail({
            email: targetUser.email,
            subject: emailTemplate.subject,
            html: emailTemplate.html,
            text: `Hello ${targetUser.firstName}, your account has been deactivated by an administrator.`,
        });
    } catch (_error) {
        // best effort
    }

    return { deleted: true };
};

export default deactivateUserByAdmin;
