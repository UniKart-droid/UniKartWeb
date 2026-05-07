import Notes from "../model/Notes.js";
import fs from "fs";
import path from "path";

// 1. Upload Notes
export const uploadNotes = async (req, res) => {
  try {
    const user = req.currentUser;
    if (!user || user.role !== "teacher") {
      return res.status(403).json({ success: false, message: "Access Denied: Only teachers can upload." });
    }

    const { title, subject, description, semester } = req.body;
    if (!req.file) {
      return res.status(400).json({ success: false, message: "Please upload a file." });
    }

    const newNote = new Notes({
      title,
      subject,
      description,
      semester,
      file: req.file.path.replace(/\\/g, "/"),
      teacherId: user._id
    });

    await newNote.save();
    res.status(201).json({ success: true, message: "Notes uploaded successfully", newNote });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error uploading notes", error: error.message });
  }
};

// 2. Get All Notes
export const getNotes = async (req, res) => {
  try {
    const notes = await Notes.find().populate("teacherId", "name").sort({ createdAt: -1 });
    res.status(200).json({ success: true, notes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error fetching notes", error: error.message });
  }
};

// 3. Update Note (STRICT OWNERSHIP)
export const updateNote = async (req, res) => {
  try {
    const user = req.currentUser;
    const { id } = req.params;
    const { title, subject, description, semester } = req.body;

    const note = await Notes.findById(id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    // Authorization: Owner Check
    const isOwner = note.teacherId && note.teacherId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only update your own notes." });
    }

    // Update fields
    if (title) note.title = title;
    if (subject) note.subject = subject;
    if (description) note.description = description;
    if (semester) note.semester = semester;

    if (req.file) {
      
      if (note.file) {
        try { fs.unlinkSync(path.resolve(note.file)); } catch (e) { console.log("Old file not found"); }
      }
      note.file = req.file.path.replace(/\\/g, "/");
    }

    await note.save();
    res.status(200).json({ success: true, message: "Note updated successfully", updatedNote: note });
  } catch (error) {
    res.status(500).json({ success: false, message: "Update Error", error: error.message });
  }
};

// 4. Delete Note 
export const deleteNote = async (req, res) => {
  try {
    const user = req.currentUser;
    const { id } = req.params;

    const note = await Notes.findById(id);
    if (!note) return res.status(404).json({ success: false, message: "Note not found." });

    const isOwner = note.teacherId && note.teacherId.toString() === user._id.toString();
    const isAdmin = user.role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Unauthorized: You can only delete your own notes." });
    }

    // File cleanup from server
    if (note.file) {
      try { fs.unlinkSync(path.resolve(note.file)); } catch (e) { console.log("File not found on disk"); }
    }

    await Notes.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Note deleted successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: "Delete Error", error: error.message });
  }
};