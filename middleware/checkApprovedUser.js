import User from "../model/User.js";


export const checkApprovedUser = async (req, res, next) => {
  try {

    const userId = req.user?.id;
    //  safety check
    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User ID missing in request"
      });
    }

   
    const user = await User.findById(userId).select("isApproved role");

    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    //  approved nahi hai
    if (!user.isApproved) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You are not approved to perform this action"
      });
    }

    
    req.currentUser = user;

    //  next middleware/controller
    next();

  } catch (error) {
    console.error("checkApprovedUser Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while verifying user approval"
    });
  }
};