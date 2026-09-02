// In-memory breakout room store, scoped per parent room.
// Resets on server restart — acceptable for today's scope.

// parentRoomName -> { groups: [{ groupName, members: [userId] }], startedAt }
const activeBreakouts = new Map();

function createBreakout(parentRoomName, memberUserIds, groupCount) {
  const groups = [];
  for (let i = 0; i < groupCount; i++) {
    groups.push({ groupName: `${parentRoomName}-breakout-${i + 1}`, members: [] });
  }

  // Round-robin assign members
  memberUserIds.forEach((userId, i) => {
    groups[i % groupCount].members.push(userId);
  });

  const breakout = {
    parentRoomName,
    groups,
    startedAt: new Date().toISOString(),
  };

  activeBreakouts.set(parentRoomName, breakout);
  return breakout;
}

function assignUser(parentRoomName, groupName, userId) {
  const breakout = activeBreakouts.get(parentRoomName);
  if (!breakout) return null;

  // Remove user from any other group first
  breakout.groups.forEach((g) => {
    g.members = g.members.filter((id) => id !== userId);
  });

  const group = breakout.groups.find((g) => g.groupName === groupName);
  if (!group) return null;

  group.members.push(userId);
  return breakout;
}

function getBreakout(parentRoomName) {
  return activeBreakouts.get(parentRoomName) || null;
}

function endBreakout(parentRoomName) {
  const breakout = activeBreakouts.get(parentRoomName);
  if (!breakout) return null;
  activeBreakouts.delete(parentRoomName);
  return breakout;
}

module.exports = { createBreakout, assignUser, getBreakout, endBreakout };