const mongoose = require("mongoose");

const studioSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  hostId: { type: String, required: true },
  status: { type: String, enum: ["active", "ended"], default: "active" },
  startedAt: { type: Date, default: Date.now },
  endedAt: { type: Date },
  attendees: [{
    userId: { type: String, required: true },
    name: { type: String, required: true },
    online: { type: Boolean, default: true },
    muted: { type: Boolean, default: true },
    cameraOn: { type: Boolean, default: false },
    raisedHand: { type: Boolean, default: false }
  }]
}, { timestamps: true });

module.exports = mongoose.model("StudioSession", studioSessionSchema);