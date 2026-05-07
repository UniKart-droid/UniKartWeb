import jwt from "jsonwebtoken";
import User from "../model/User.js";

// 1. Verify JWT Token
export const verifyToken = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Save decoded data
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Invalid or expired token",
    });
  }
};

// 2. Check if User is Approved (and inject currentUser)
export const checkApprovedUser = async (req, res, next) => {
  try {
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing in token",
      });
    }

    const user = await User.findById(userId).select("_id isApproved role name");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Admin bypass approval
    if (user.role !== "admin" && !user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Access denied: Your account is not approved yet",
      });
    }

    // Inject full user (with _id)
    req.currentUser = user;

    next();
  } catch (error) {
    console.error("checkApprovedUser Error:", error);

    res.status(500).json({
      success: false,
      message: "Server error during approval check",
    });
  }
};

// 3. Admin Only Access
export const isAdmin = (req, res, next) => {
  if (req.currentUser && req.currentUser.role === "admin") {
    next();
  } else {
    return res.status(403).json({
      success: false,
      message: "Access denied: Only admins can perform this action.",
    });
  }
};