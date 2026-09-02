const mongoose = require("mongoose");

const pollSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, index: true },
  question: { type: String, required: true },
  options: [{
    text: { type: String, required: true },
    votes: { type: Number, default: 0 }
  }],
  voters: { type: Map, of: String, default: {} },
  status: { type: String, enum: ["open", "closed"], default: "open" }
}, { timestamps: true });

module.exports = mongoose.model("Poll", pollSchema);