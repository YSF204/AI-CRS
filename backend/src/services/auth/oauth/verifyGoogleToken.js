import { OAuth2Client } from "google-auth-library";
import AppError from "../../../utils/appError.js";

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async ({ token }) => {
    if (!token) {
        throw new AppError("Google token is required", 400);
    }

    try {
        const ticket = await googleClient.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });

        return ticket.getPayload();
    } catch (_error) {
        throw new AppError("Invalid Google token", 401);
    }
};

export default verifyGoogleToken;
