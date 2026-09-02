const db = require("../data/mockData");

const AVATAR_COLORS = db.avatarColors;

function serialize(user) {
    if (!user) return null;
    let hash = 0;
    for (let i = 0; i < user.id.length; i += 1) hash = (hash * 31 + user.id.charCodeAt(i)) >>> 0;
    return {
        id: user.id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        banned: Boolean(user.banned),
        avatarColor: AVATAR_COLORS[hash % AVATAR_COLORS.length]
    };
}

function list() {
    return db.users.map(serialize);
}

function findById(id) {
    const user = db.users.find((u) => u.id === id);
    return user ? serialize(user) : null;
}

function findByUsername(username) {
    const needle = String(username).toLowerCase();
    const user = db.users.find((u) => u.username.toLowerCase() === needle);
    return user ? serialize(user) : null;
}

function setBanned(id, banned) {
    const user = db.users.find((u) => u.id === id);
    if (!user) return null;
    user.banned = Boolean(banned);
    return serialize(user);
}

module.exports = { serialize, list, findById, findByUsername, setBanned };
