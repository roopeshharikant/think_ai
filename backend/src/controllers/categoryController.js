const Category = require("../models/Category");

const NAME_MAX = 50;

function validateCategoryInput(body, currentId) {
    const name = String(body.name || "").trim();
    const errors = {};
    if (!name) errors.name = "Name is required";
    else if (name.length > NAME_MAX) errors.name = `Name must be at most ${NAME_MAX} characters`;
    else {
        const existing = Category.findByName(name);
        if (existing && existing.id !== currentId) errors.name = "A category with this name already exists";
    }
    const color = body.color ? String(body.color) : "#6366f1";
    if (!/^#[0-9a-fA-F]{6}$/.test(color)) errors.color = "Color must be a hex value like #6366f1";
    return { valid: Object.keys(errors).length === 0, errors, name, color };
}

function list(_req, res) {
    res.status(200).json({ success: true, data: Category.list() });
}

function create(req, res) {
    const { valid, errors, name, color } = validateCategoryInput(req.body, null);
    if (!valid) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    const category = Category.create({ name, color, description: req.body.description });
    res.status(201).json({ success: true, data: Category.serialize(category) });
}

function update(req, res) {
    const existing = Category.findById(req.params.id);
    if (!existing) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }
    const { valid, errors, name, color } = validateCategoryInput(
        { ...req.body, name: req.body.name != null ? req.body.name : existing.name },
        existing.id
    );
    if (!valid) {
        return res.status(400).json({ success: false, message: "Validation failed", errors });
    }
    const category = Category.update(req.params.id, {
        name,
        color,
        description: req.body.description != null ? req.body.description : existing.description
    });
    res.status(200).json({ success: true, data: Category.serialize(category) });
}

function remove(req, res) {
    const removed = Category.remove(req.params.id);
    if (!removed) {
        return res.status(404).json({ success: false, message: "Category not found" });
    }
    res.status(200).json({ success: true, data: { id: req.params.id, deleted: true } });
}

module.exports = { list, create, update, remove };
