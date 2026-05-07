import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  getAllNotices,
  createNotice,
  updateNotice,
  deleteNotice,
} from "../controllers/noticeController.js";
import { verifyToken, checkApprovedUser, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ---------------------------
    MULTER CONFIGURATION
---------------------------- */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = "uploads/notices";

    try {
      //  Ensure folder exists
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      cb(null, uploadPath);
    } catch (err) {
      console.error(" Folder creation error:", err);
      cb(err, uploadPath);
    }
  },

  filename: (req, file, cb) => {
    try {
      const uniqueName = `${Date.now()}-${file.originalname}`;
      cb(null, uniqueName);
    } catch (err) {
      cb(err);
    }
  },
});

/* ---------------------------
    FILE FILTER
---------------------------- */
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed!"), false);
  }
};

/* ---------------------------
    MULTER INSTANCE
---------------------------- */
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

/* ---------------------------
    ROUTES
---------------------------- */

//  1. Get All Notices (Public)
router.get("/", getAllNotices);

//  2. Create Notice (Admin Only)
router.post(
  "/",
  verifyToken,
  checkApprovedUser,
  isAdmin,
  upload.single("pdfUrl"),
  createNotice
);

//  3. Update Notice (Admin Only)
router.put(
  "/:id",
  verifyToken,
  checkApprovedUser,
  isAdmin,
  upload.single("pdfUrl"),
  updateNotice
);

//  4. Delete Notice (Admin Only)
router.delete(
  "/:id",
  verifyToken,
  checkApprovedUser,
  isAdmin,
  deleteNotice
);

/* ---------------------------
    GLOBAL ERROR HANDLER (MULTER)
---------------------------- */
router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: err.message,
    });
  }

  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message || "File upload error",
    });
  }

  next();
});

export default router;