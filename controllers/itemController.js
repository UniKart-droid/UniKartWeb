import Item from "../model/Item.js";


export const addItemController = async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: User not found",
      });
    }

    const { title, price, category, description, contact } = req.body;

    let image = "";
    if (req.file) {
      image = req.file.path.replace(/\\/g, "/");
    } else if (req.body.image) {
      image = req.body.image;
    }

    if (!title || !price || !category || !description || !contact || !image) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newItem = await Item.create({
      title,
      price,
      category,
      description,
      contact,
      image,
      user: userId,
    });

    return res.status(201).json({
      success: true,
      message: "Item added successfully",
      item: newItem,
    });

  } catch (error) {
    console.error("Add Item Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while adding item",
    });
  }
};


export const updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, price, description, category } = req.body;
    const userId = req.user?.id;
    const userRole = req.currentUser?.role; 

    // 1. Check if item exists
    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // 2. Security Check
    const isOwner = item.user.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to edit this item" });
    }

    // 3. Prepare Update Object
    let updateData = { 
      title, 
      price: Number(price), 
      description, 
      category 
    };

    // 4. Handle Image Update
    if (req.file) {
      updateData.image = req.file.path.replace(/\\/g, "/");
    }

    // 5. Update in Database
    const updatedItem = await Item.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("user", "name email");

    res.status(200).json({
      success: true,
      message: "Item updated successfully! 🎉",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update Item Error:", error);
    res.status(500).json({ success: false, message: "Server error while updating item" });
  }
};

export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userRole = req.currentUser?.role;

    const item = await Item.findById(id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Item not found" });
    }

    // Security Check: 
    const isOwner = item.user.toString() === userId;
    const isAdmin = userRole === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this item" });
    }

    await Item.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: isAdmin ? "Item deleted by Admin" : "Item deleted successfully",
    });
  } catch (error) {
    console.error("Delete Item Error:", error);
    res.status(500).json({ success: false, message: "Server error while deleting item" });
  }
};