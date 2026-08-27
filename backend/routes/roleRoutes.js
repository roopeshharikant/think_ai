const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');

// Item 5: Fetch all users
router.get('/users', adminController.getAllUsers);

// Item 6: Fetch Permissions Matrix
router.get('/matrix', (req, res) => {
    // Mock role permission matrix structure
    const matrixData = {
        roles: ['Admin', 'Instructor', 'Student'],
        permissions: [
            { module: "Courses", actions: { /* ... */ } },
            { module: "Batches", actions: { /* ... */ } },
            { module: "Enrollments", actions: { /* ... */ } }
        ]
    };

    res.status(200).json({ success: true, data: matrixData });
});

module.exports = router;