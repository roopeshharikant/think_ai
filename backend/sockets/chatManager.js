// In-memory chat message store, scoped per room.
// Resets on server restart — acceptable for today's scope.

const MAX_MESSAGES_PER_ROOM = 200;

// roomName -> array of messages
const roomMessages = new Map();

let nextMessageId = 1;

function addMessage(roomName, userId, text) {
  const message = {
    messageId: nextMessageId++,
    userId,
    roomName,
    text,
    sentAt: new Date().toISOString(),
  };

  if (!roomMessages.has(roomName)) {
    roomMessages.set(roomName, []);
  }

  const messages = roomMessages.get(roomName);
  messages.push(message);

  if (messages.length > MAX_MESSAGES_PER_ROOM) {
    messages.shift();
  }

  return message;
}

function getMessages(roomName) {
  return roomMessages.get(roomName) || [];
}

module.exports = { addMessage, getMessages };