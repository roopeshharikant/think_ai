const { sendTestEmail, sendTestSMS } = require('../services/notificationService'); // Make sure to require the file where these helpers live

exports.triggerNotification = async (req, res) => {
    const { type, target } = req.body;
    try {
        if (type === 'email') {
            await sendTestEmail(target);
        } else if (type === 'sms') {
            await sendTestSMS(target);
        } else {
            return res.status(400).json({ error: "Invalid notification type" });
        }
        
        return res.json({ success: true, message: "Notification sent successfully" });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

exports.getDashboardData = async (req, res) => {
    return res.json({ success: true, message: "Dashboard data retrieved successfully" });
};