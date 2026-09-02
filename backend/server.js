require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");

const PORT = process.env.PORT || 5000;

// Create HTTP server
const httpServer = http.createServer(app);

// Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"]
  }
});

// Make Socket.IO available in Express
app.set("io", io);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "ok",
    service: "think-ai-backend"
  });
});

// Start server
httpServer.listen(PORT, "127.0.0.1", () => {
  console.log(`Thinkz AI backend running on port ${PORT}`);
});

module.exports = httpServer;