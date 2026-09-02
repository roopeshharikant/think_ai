const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  userId: { type: String, required: true },
  text: { type: String, required: true },
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);