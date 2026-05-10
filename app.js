import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db/connect.js";
import http from "http";
import { Server } from "socket.io";

import router from "./routes/userRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import notesRoutes from "./routes/notesRoutes.js";
import opportunityRoutes from "./routes/opportunityRoutes.js";
import noticeRoutes from "./routes/noticeRoutes.js";

import Chat from "./model/Chat.js";
import Message from "./model/Message.js";

dotenv.config();

const app = express();

/* ---------------------------
    CORS CONFIGURATION
---------------------------- */
const allowedOrigins = [
  "https://unikart-frontend.vercel.app",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps/Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        // Logging blocked origin for easier debugging in Render logs
        console.log("CORS Blocked for origin:", origin);
        return callback(new Error("CORS Not Allowed"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

/* ---------------------------
    ROUTES
---------------------------- */
app.use("/api/user", router);
app.use("/api/items", itemRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notes", notesRoutes);
app.use("/api/opportunities", opportunityRoutes);
app.use("/api/notices", noticeRoutes);

app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running fine" });
});

const server = http.createServer(app);

/* ---------------------------
    SOCKET.IO SETUP
---------------------------- */
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

const getConsistentChatId = (id1, id2) => {
  if (!id1 || !id2) return null;
  return [id1.toString(), id2.toString()].sort().join("_");
};

io.on("connection", (socket) => {
  console.log("✅ User Connected:", socket.id);

  socket.on("join_chat", (chatId) => {
    if (chatId) socket.join(chatId);
  });

  socket.on("send_message", async (data) => {
    try {
      const { sender, receiver, message, chatId } = data;
      const finalChatId = chatId || getConsistentChatId(sender, receiver);

      if (!finalChatId || !sender || !receiver || !message) return;

      let chat = await Chat.findOne({ chatId: finalChatId });

      if (!chat) {
        chat = await Chat.create({
          chatId: finalChatId,
          members: [sender, receiver],
          lastMessage: message,
        });
      }

      const savedMessage = await Message.create({
        chatId: finalChatId,
        sender,
        receiver,
        text: message,
      });

      chat.lastMessage = message;
      chat.updatedAt = Date.now();
      await chat.save();

      io.to(finalChatId).emit("receive_message", {
        _id: savedMessage._id,
        chatId: finalChatId,
        sender: savedMessage.sender,
        receiver: savedMessage.receiver,
        text: savedMessage.text,
        createdAt: savedMessage.createdAt,
      });
    } catch (error) {
      console.log("❌ SOCKET ERROR:", error.message);
    }
  });

  socket.on("disconnect", () => {
    console.log("❌ User Disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 8000;
const start = async () => {
  try {
    await connectDB();
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port: ${PORT}`);
    });
  } catch (error) {
    console.log("❌ SERVER START ERROR:", error.message);
    process.exit(1);
  }
};

start();