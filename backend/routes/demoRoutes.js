const express = require('express');
const router = express.Router();
const expressRateLimit = require('express-rate-limit');

const demoController = require('../controllers/demoController');

// Strict setting for live demo visibility
const demoLimiter = expressRateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 3, // Limit each IP to 3 requests per windowMs
    message: { error: "Too many requests, please try again later." },
    standardHeaders: true, // Return rate limit info in standard headers
    legacyHeaders: false, // Disable legacy X-RateLimit headers
});

// Test Dashboard Route with rate limiting
router.get('/dashboard', demoLimiter, demoController.getDashboardData);

module.exports = router;