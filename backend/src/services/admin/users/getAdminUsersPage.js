import User from "../../../models/User.js";
import { buildAdminUserFilter, buildPagination } from "../../shared/queryBuilders.js";

export const getAdminUsersPage = async ({ query }) => {
    const { role, accountStatus, search, page = 1, limit = 20 } = query;

    const filter = buildAdminUserFilter({ role, accountStatus, search });
    const pagination = buildPagination({ page, limit });

    const [users, total] = await Promise.all([
        User.find(filter)
            .select("-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires")
            .sort({ createdAt: -1 })
            .skip(pagination.skip)
            .limit(pagination.limit),
        User.countDocuments(filter),
    ]);

    return {
        users,
        pagination: {
            total,
            page: pagination.page,
            limit: pagination.limit,
            pages: Math.ceil(total / pagination.limit),
        },
    };
};

export default getAdminUsersPage;
