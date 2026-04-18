import User from "../../../models/User.js";
import { validateSelfUpdatePayload } from "./validateSelfUpdatePayload.js";
import { filterUpdatableUserFields } from "./filterUpdatableUserFields.js";

export const updateMyProfile = async ({ userId, body }) => {
    validateSelfUpdatePayload(body);
    const filteredBody = filterUpdatableUserFields(body);

    return User.findByIdAndUpdate(userId, filteredBody, {
        new: true,
        runValidators: true,
    });
};

export default updateMyProfile;
