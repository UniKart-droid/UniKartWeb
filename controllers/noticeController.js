import Notice from "../model/Notice.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

//  1. Get All Notices
export const getAllNotices = async (req, res) => {
  try {
    const notices = await Notice.find().sort({ createdAt: -1 });
    res.status(200).json(notices);
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error", error: error.message });
  }
};

//  2. Create New Notice
export const createNotice = async (req, res) => {
  try {
    const { title, description } = req.body;
    const pdfUrl = req.file ? req.file.filename : null;

    if (!title || !description) {
      return res.status(400).json({ success: false, message: "Title and Description are required" });
    }

    const newNotice = new Notice({
      title,
      description,
      pdfUrl,
      postedBy: req.user?.id || req.user?._id 
    });

    const savedNotice = await newNotice.save();
    res.status(201).json({ success: true, message: "Notice uploaded successfully", notice: savedNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upload notice", error: error.message });
  }
};

//  3. Update Notice
export const updateNotice = async (req, res) => {
  try {
    const { title, description } = req.body;
    const noticeId = req.params.id;

    let notice = await Notice.findById(noticeId);
    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    
    if (req.file) {
      if (notice.pdfUrl) {
        const oldPath = path.join(__dirname, "..", "uploads", "notices", notice.pdfUrl);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      notice.pdfUrl = req.file.filename;
    }

    notice.title = title || notice.title;
    notice.description = description || notice.description;

    const updatedNotice = await notice.save();
    res.status(200).json({ success: true, message: "Notice updated successfully", notice: updatedNotice });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update failed", error: error.message });
  }
};

//  4. Delete Notice
export const deleteNotice = async (req, res) => {
  try {
    const notice = await Notice.findById(req.params.id);
    if (!notice) {
      return res.status(404).json({ success: false, message: "Notice not found" });
    }

    // Server se PDF file delete karein
    if (notice.pdfUrl) {
      const filePath = path.join(__dirname, "..", "uploads", "notices", notice.pdfUrl);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await Notice.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Notice deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Deletion failed", error: error.message });
  }
};