import CommunityUser from "../models/CommunityUser.js";

export const getMembers = async (req, res) => {
  try {
    const members = await CommunityUser.find();
    res.json(members);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch members" });
  }
};
