import CV from "../../../models/CV.js";

export const getMyCvs = async ({ userId }) => {
    return CV.find({ userId }).sort({ createdAt: -1 });
};

export default getMyCvs;
