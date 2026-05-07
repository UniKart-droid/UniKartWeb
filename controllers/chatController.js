import Chat from "../model/Chat.js";
import Message from "../model/Message.js";
import User from "../model/User.js";

const getConsistentChatId = (id1, id2) => {
  if (!id1 || !id2) return null;
  return [id1.toString(), id2.toString()].sort().join("_");
};

/* CREATE OR GET CHAT */
export const createChat = async (req, res) => {
  try {
    const { sender, receiver } = req.body;

    if (!sender || !receiver) {
      return res.status(400).json({ message: "Sender and Receiver are required" });
    }

    const chatId = getConsistentChatId(sender, receiver);

    let chat = await Chat.findOne({ chatId });

    if (!chat) {
      chat = await Chat.create({
        chatId,
        members: [sender, receiver],
        lastMessage: ""
      });
    }

    res.status(200).json({
      success: true,
      chatId: chat.chatId,
      data: chat
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* SEND MESSAGE */
export const sendMessage = async (req, res) => {
  try {
    const { chatId, sender, receiver, message } = req.body;

    // 'message' 
    if (!sender || !message) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const finalChatId = chatId || getConsistentChatId(sender, receiver);

    // 1. Ensure chat exists 
    let chat = await Chat.findOne({ chatId: finalChatId });

    if (!chat) {
      chat = await Chat.create({
        chatId: finalChatId,
        members: [sender, receiver],
        lastMessage: ""
      });
    }

    // 2. Save message 
    const newMsg = await Message.create({
      chatId: finalChatId,
      sender,
      text: message 
    });

    // 3. Update chat last message info
    chat.lastMessage = message;
    chat.lastMessageSender = sender; 
    chat.updatedAt = Date.now();
    await chat.save();

    res.status(200).json({
      success: true,
      data: newMsg
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* GET USER CHATS */
export const getUserChats = async (req, res) => {
  try {
    const { userId } = req.params;

    const chats = await Chat.find({
      members: { $in: [userId] }
    }).sort({ updatedAt: -1 });

    const chatList = await Promise.all(
      chats.map(async (chat) => {
        const otherUserId = chat.members.find(
          (id) => id.toString() !== userId
        );

        let otherUser = null;
        if (otherUserId) {
          otherUser = await User.findById(otherUserId).select("name profilePic");
        }

        return {
          chatId: chat.chatId,
          otherUserId,
          otherUserName: otherUser?.name || "Unknown User",
          profilePic: otherUser?.profilePic || null,
          lastMessage: chat.lastMessage,
          lastMessageTime: chat.updatedAt
        };
      })
    );

    res.status(200).json({
      success: true,
      data: chatList
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message
    });
  }
};

/* GET MESSAGES */
export const getMessages = async (req, res) => {
  try {
    const { chatId } = req.params;

    
    const messages = await Message.find({ chatId })
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      data: messages
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};