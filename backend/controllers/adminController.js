const bcrypt = require("bcryptjs");
const prisma = require("../config/database");

const createUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                name: name || null,
                email,
                password: hashedPassword,
                role: role || "Learner" // Defaults to Learner if role isn't provided
            }
        });

        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: {
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error("Create user error:", error);
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to create user"
        });
    }
};

module.exports = { createUser };