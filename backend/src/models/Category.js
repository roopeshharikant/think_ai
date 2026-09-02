const db = require("../data/mockData");

function discussionCount(categoryId) {
    return db.discussions.filter((d) => d.categoryId === categoryId && !d.hidden).length;
}

function serialize(category) {
    return { ...category, discussionCount: discussionCount(category.id) };
}

function list() {
    return db.categories.map(serialize);
}

function findById(id) {
    return db.categories.find((c) => c.id === id) || null;
}

function findByName(name) {
    const needle = String(name).trim().toLowerCase();
    return db.categories.find((c) => c.name.toLowerCase() === needle) || null;
}

function create({ name, color, description }) {
    const category = {
        id: db.makeId("cat"),
        name: String(name).trim(),
        color: color || "#6366f1",
        description: description || ""
    };
    db.categories.push(category);
    return category;
}

function update(id, patch) {
    const category = findById(id);
    if (!category) return null;
    if (patch.name != null) category.name = String(patch.name).trim();
    if (patch.color != null) category.color = patch.color;
    if (patch.description != null) category.description = patch.description;
    return category;
}

function remove(id) {
    const index = db.categories.findIndex((c) => c.id === id);
    if (index === -1) return false;
    // Detach discussions so they fall back to "Uncategorized" instead of breaking.
    db.discussions.forEach((d) => {
        if (d.categoryId === id) d.categoryId = null;
    });
    db.categories.splice(index, 1);
    return true;
}

module.exports = { serialize, list, findById, findByName, create, update, remove, discussionCount };
