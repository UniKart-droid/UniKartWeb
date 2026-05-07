import User from "../model/User.js";
import Item from "../model/Item.js";

export const getSellerProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("name email role");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const items = await Item.find({ user: req.params.id });

    return res.status(200).json({
      user,
      items,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Server error",
      error,
    });
  }
};