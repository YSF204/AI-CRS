export const buildAdminUserFilter = ({ role, accountStatus, search }) => {
    const filter = {};

    if (role) filter.role = String(role).toUpperCase();
    if (accountStatus) filter.accountStatus = String(accountStatus).toUpperCase();
    if (search) {
        filter.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
        ];
    }

    return filter;
};

export const buildPagination = ({ page = 1, limit = 20 }) => {
    const normalizedPage = Math.max(Number(page) || 1, 1);
    const normalizedLimit = Math.max(Number(limit) || 20, 1);

    return {
        page: normalizedPage,
        limit: normalizedLimit,
        skip: (normalizedPage - 1) * normalizedLimit,
    };
};

export default {
    buildAdminUserFilter,
    buildPagination,
};
