import User from "../../../models/User.js";
import AppError from "../../../utils/appError.js";
import sendEmail from "../../../utils/email.js";
import buildPasswordResetEmailHtml from "../helpers/buildPasswordResetEmailHtml.js";

export const sendPasswordResetEmail = async ({ email, protocol, host }) => {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
        throw new AppError("There is no user with that email address", 404);
    }

    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    const resetURL = `${protocol}://${host}/api/users/resetpassword/${resetToken}`;

    try {
        await sendEmail({
            email: user.email,
            subject: "Your password token valid for (10 min)",
            html: buildPasswordResetEmailHtml({ resetUrl: resetURL }),
            text: `Reset your password using this link (valid for 10 minutes): ${resetURL}`,
        });
    } catch (_error) {
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
        throw new AppError("An error occured when sending the email", 500);
    }
};

export default sendPasswordResetEmail;
