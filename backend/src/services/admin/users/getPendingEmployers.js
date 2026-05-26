import User from "../../../models/User.js";
import Employer from "../../../models/Employer.js";

export const getPendingEmployers = async ({ limit = 5 } = {}) => {
  const pendingUsers = await User.find({
    role: "EMPLOYER",
    accountStatus: "PENDING",
  })
    .select("-password -passwordResetToken -passwordResetExpires -deleteToken -deleteTokenExpires")
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  // Get employer details for each pending user
  const userIds = pendingUsers.map((u) => u._id);
  const employers = await Employer.find({ userId: { $in: userIds } }).lean();

  const employersMap = new Map(employers.map((e) => [e.userId.toString(), e]));

  const pendingEmployers = pendingUsers.map((user) => ({
    user,
    employer: employersMap.get(user._id.toString()) || null,
  }));

  return {
    pendingEmployers,
    total: await User.countDocuments({
      role: "EMPLOYER",
      accountStatus: "PENDING",
    }),
  };
};

export default getPendingEmployers;
