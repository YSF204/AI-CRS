import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import sendEmail from "../../../utils/email.js";
import { buildDeleteConfirmationEmail } from "../../shared/emailTemplateService.js";
import { getTrustedBackendUrl } from "../../../config/security.js";

export const requestAccountDeletion = async ({ userId }) => {
    const user = await User.findById(userId);
    if (!user) {
        throw new AppError("User not found", 404);
    }

    const deleteToken = user.createDeleteToken();
    await user.save({ validateBeforeSave: false });

    const deleteURL = `${getTrustedBackendUrl()}/api/users/confirmDelete/${deleteToken}`;

    try {
        const template = buildDeleteConfirmationEmail({
            fullName: `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User",
            deleteURL,
        });

        await sendEmail({
            email: user.email,
            subject: template.subject,
            text: template.text,
            html: template.html,
        });
    } catch (_error) {
        user.deleteToken = undefined;
        user.deleteTokenExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError("There was an error sending the email. Try again later.", 500);
    }

    return { sent: true };
};

export default requestAccountDeletion;
