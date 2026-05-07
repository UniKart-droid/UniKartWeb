import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { verifyToken, isAdmin } from "../middleware/authMiddleware.js";
import { checkApprovedUser } from "../middleware/checkApprovedUser.js";

import { addItemController, updateItem, deleteItem } from "../controllers/itemController.js";
import { getAllItemsController } from "../controllers/getAllItemsController.js";

const router = express.Router();


const uploadPath = "uploads/item-images";

if (!fs.existsSync(uploadPath)) {
  fs.mkdirSync(uploadPath, { recursive: true });
}


//  MULTER SETUP

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

//  POST ROUTE (ADD ITEM)

router.post(
  "/add",
  verifyToken,
  checkApprovedUser,
  upload.single("image"),
  addItemController
);

//  GET ROUTE (MARKETPLACE DATA)

router.get("/all", getAllItemsController);

// UPDATE ROUTE (EDIT ITEM)

router.put(
  "/update/:id",
  verifyToken,
  checkApprovedUser,
  upload.single("image"), 
  updateItem
);

//  DELETE ROUTE (REMOVE ITEM)

router.delete(
  "/delete/:id",
  verifyToken,
  checkApprovedUser,
  deleteItem
);

export default router;