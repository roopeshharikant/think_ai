/**
 * Live Class Studio chat WebSocket (Socket.IO namespace: /studio).
 *
 * Phase 6/7: real-time chat + poll updates for the studio. When the backend
 * is not running, the frontend `websocket.js` service transparently falls
 * back to a local mock socket so the UI keeps working.
 */

const db = require("../data/mockData");
const studioController = require("../controllers/studioController");

function findSession(sessionId) {
    return db.studioSessions.find((s) => s.id === sessionId) || null;
}

module.exports = function initChatSocket(io) {
    const namespace = io.of("/studio");

    namespace.on("connection", (socket) => {
        let joinedSessionId = null;

        socket.on("session:join", ({ sessionId, user } = {}) => {
            const session = findSession(sessionId);
            if (!session) {
                socket.emit("session:error", { message: "Session not found" });
                return;
            }
            joinedSessionId = sessionId;
            socket.join(sessionId);

            if (user && user.id) {
                const attendee = session.attendees.find((a) => a.userId === user.id);
                if (!attendee) {
                    session.attendees.push({
                        userId: user.id,
                        name: user.name || "Guest",
                        online: true,
                        muted: true,
                        cameraOn: false,
                        raisedHand: false
                    });
                } else {
                    attendee.online = true;
                }
            }

            namespace.to(sessionId).emit("session:state", studioController.serializeSession(session));
        });

        socket.on("chat:send", ({ sessionId, text, user } = {}) => {
            const session = findSession(sessionId);
            if (!session || !text || !String(text).trim()) return;
            const message = {
                id: db.makeId("msg"),
                userId: (user && user.id) || "guest",
                userName: (user && user.name) || "Guest",
                text: String(text).trim().slice(0, 1000),
                timestamp: new Date().toISOString(),
                deleted: false
            };
            session.messages.push(message);
            namespace.to(sessionId).emit("chat:new", message);
        });

        socket.on("poll:create", ({ sessionId, poll } = {}) => {
            const session = findSession(sessionId);
            if (!session || !poll) return;
            namespace.to(sessionId).emit("poll:update", poll);
        });

        socket.on("presence:update", ({ sessionId, userId, patch } = {}) => {
            const session = findSession(sessionId);
            if (!session) return;
            const attendee = session.attendees.find((a) => a.userId === userId);
            if (!attendee) return;
            ["online", "muted", "cameraOn", "raisedHand"].forEach((key) => {
                if (patch && typeof patch[key] === "boolean") attendee[key] = patch[key];
            });
            namespace.to(sessionId).emit("session:state", studioController.serializeSession(session));
        });

        socket.on("moderation:deleteMessage", ({ sessionId, messageId }) => {
            const session = findSession(sessionId);
            if (!session) return;
            const message = session.messages.find((m) => m.id === messageId);
            if (message) message.deleted = true;
            namespace.to(sessionId).emit("message:deleted", { messageId });
            namespace.to(sessionId).emit("session:state", studioController.serializeSession(session));
        });

        socket.on("disconnect", () => {
            if (!joinedSessionId) return;
            const session = findSession(joinedSessionId);
            if (!session) return;
            void session; // presence flips are handled by the client heartbeat in mock mode
        });
    });

    return namespace;
};
