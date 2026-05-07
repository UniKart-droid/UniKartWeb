import Item from "../model/Item.js";


export const getAllItemsController = async (req, res) => {
  try {
    const items = await Item.find()
      .populate("user", "name email role") 
      .sort({ createdAt: -1 }); 

    return res.status(200).json({
      success: true,
      items,
    });

  } catch (error) {
    console.error("Get Items Error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching items",
    });
  }
};