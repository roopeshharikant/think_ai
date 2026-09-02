// In-memory poll store, scoped per room.
// Resets on server restart — acceptable for today's scope.

// roomName -> active poll object (only one active poll per room at a time)
const activePolls = new Map();

let nextPollId = 1;

function createPoll(roomName, question, options) {
  const poll = {
    pollId: nextPollId++,
    roomName,
    question,
    options,
    votes: {}, // optionIndex -> count
    voters: new Set(), // userId set, one vote per user
    startedAt: new Date().toISOString(),
    active: true,
  };

  options.forEach((_, i) => {
    poll.votes[i] = 0;
  });

  activePolls.set(roomName, poll);
  return poll;
}

function castVote(roomName, userId, optionIndex) {
  const poll = activePolls.get(roomName);
  if (!poll || !poll.active) return null;
  if (poll.voters.has(userId)) return null; // already voted
  if (poll.votes[optionIndex] === undefined) return null; // invalid option

  poll.votes[optionIndex]++;
  poll.voters.add(userId);
  return poll;
}

function getResults(roomName) {
  return activePolls.get(roomName) || null;
}

function endPoll(roomName) {
  const poll = activePolls.get(roomName);
  if (!poll) return null;
  poll.active = false;
  activePolls.delete(roomName);
  return poll;
}

module.exports = { createPoll, castVote, getResults, endPoll };