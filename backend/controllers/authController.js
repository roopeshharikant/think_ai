const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

// ============================================================
// USER REGISTRATION
// ============================================================
exports.register = async (req, res) => {
    try {
        const { email, password, name, role } = req.body;

        // Basic validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.'
            });
        }

        // Check if user already exists in PostgreSQL
        const existingUser = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists with this email.'
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user in PostgreSQL
        const newUser = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name: name || null,
                role: role || 'Learner'
            }
        });

        // Generate JWT
        const token = jwt.sign(
            {
                id: newUser.id,
                email: newUser.email,
                role: newUser.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        // Remove password from response
        const userWithoutPassword = {
            id: newUser.id,
            name: newUser.name,
            email: newUser.email,
            role: newUser.role,
            createdAt: newUser.createdAt
        };

        return res.status(201).json({
            success: true,
            message: 'User registered successfully!',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Registration error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error occurred.'
        });
    }
};


// ============================================================
// USER LOGIN
// ============================================================
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Email and password are required.'
            });
        }

        // Find user in PostgreSQL using Prisma
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials.'
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(
            password,
            user.password
        );

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials.'
            });
        }

        // Generate JWT
        const token = jwt.sign(
            {
                id: user.id,
                email: user.email,
                role: user.role
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '7d'
            }
        );

        // Remove password from response
        const userWithoutPassword = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        return res.status(200).json({
            success: true,
            message: 'Login successful!',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        console.error('Login error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error occurred.'
        });
    }
};


// ============================================================
// GET CURRENT USER
// ============================================================
exports.getCurrentUser = async (req, res) => {
    try {
        // req.user is populated by authentication middleware
        const userId = Number(req.user.id);

        if (!userId || Number.isNaN(userId)) {
            return res.status(401).json({
                success: false,
                error: 'Invalid user ID.'
            });
        }

        // Find user in PostgreSQL
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                error: 'User not found.'
            });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error('Get current user error:', error);

        return res.status(500).json({
            success: false,
            error: 'Internal server error occurred.'
        });
    }
};