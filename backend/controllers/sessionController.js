// Local mock data store (No database)
let sessions = [];
let attendance = [];

/**
 * 1. Create a New Live Session (With Jitsi Integration & WebSockets)
 * POST /api/v1/sessions
 */
const createSession = async (req, res) => {
    try {
        const { title, startTime, endTime, platform } = req.body;

        // Validate required fields
        if (!title || !startTime || !platform) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // PM Requirement: Mock Jitsi Room Creation
        const cleanTitle = title.replace(/\s+/g, '-').toLowerCase();
        const generatedMeetingLink = `https://jit.si{cleanTitle}-${Date.now()}`;

        const newSession = {
            id: Date.now().toString(), // Generate a unique ID string
            title,
        
            startTime: new Date(startTime), // FIXED: added space to 'new Date'
            endTime: endTime ? new Date(endTime) : null,
            status: "SCHEDULED", 
            meetingLink: generatedMeetingLink, // Added dynamic Jitsi room link
            recordingUrl: null,
            createdAt: new Date()
        };

        sessions.push(newSession);

        // PM Requirement: Broadcast to all connected clients via WebSockets
        const io = req.app.get('io');
        if (io) {
            io.emit('session_created', newSession);
        }

        return res.status(201).json(newSession);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

/**
 * 2. Handle Recording Save Callback (Webhook)
 * POST /api/v1/sessions/callback/recording
 */
const handleRecordingCallback = async (req, res) => {
    try {
        const { sessionId, recordingUrl } = req.body;

        if (!sessionId || !recordingUrl) {
            return res.status(400).json({ error: "Missing sessionId or recordingUrl" });
        }

        // Find session in mock array and update it
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
            return res.status(404).json({ error: "Session not found" });
        }

        sessions[sessionIndex].recordingUrl = recordingUrl;
        sessions[sessionIndex].status = "COMPLETED";

        // PM Requirement: Broadcast recording ready event
        const io = req.app.get('io');
        if (io) {
            io.emit('recording_ready', sessions[sessionIndex]);
        }

        return res.status(200).json({ message: "Recording callback processed successfully", session: sessions[sessionIndex] });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};


/**
 * 3. Update Session Status or Details
 * PUT /api/v1/sessions/:id
 */
const updateSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, startTime, endTime, status, meetingLink, recordingUrl } = req.body;

        const sessionIndex = sessions.findIndex(s => s.id === id);
        if (sessionIndex === -1) {
            return res.status(404).json({ error: 'Session not found' });
        }

        // Update individual values dynamically
        if (title) sessions[sessionIndex].title = title;
        if (startTime) sessions[sessionIndex].startTime = new Date(startTime);
        if (endTime) sessions[sessionIndex].endTime = new Date(endTime);
        if (status) sessions[sessionIndex].status = status;
        if (meetingLink) sessions[sessionIndex].meetingLink = meetingLink;
        if (recordingUrl) sessions[sessionIndex].recordingUrl = recordingUrl;

         res.status(200).json(sessions[sessionIndex]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update session' });
    }
};

/**
 * 4. Cancel / Delete a Session
 * DELETE /api/v1/sessions/:id
 */
const deleteSession = async (req, res) => {
    try {
        const { id } = req.params;
        const sessionIndex = sessions.findIndex(s => s.id === id);

        if (sessionIndex === -1) {
            return res.status(404).json({ error: "Session not found" });
        }

        sessions[sessionIndex].recordingUrl = recordingUrl;
        return res.status(200).json({
            success: true,
            message: "Recording save callback processed successfully",
            data: sessions[sessionIndex]
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
// 3. Get Session By ID Handler
const getSessionById = async (req, res) => {
    try {
        const { id } = req.params;
        const session = sessions.find(s => s.id === id);
        if (!session) {
            return res.status(404).json({ error: "Session not found" });
        }
        return res.status(200).json(session);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
// 5. Save Recording Callback Webhook
const saveRecordingCallback = async (req, res) => {
    try {
        const { sessionId, recordingUrl } = req.body;
        if (!sessionId || !recordingUrl) {
            return res.status(400).json({ error: "Missing sessionId or recordingUrl" });
        }
        const sessionIndex = sessions.findIndex(s => s.id === sessionId);
        if (sessionIndex === -1) {
            return res.status(404).json({ error: "Session not found" });
        }
        sessions[sessionIndex].recordingUrl = recordingUrl;
        return res.status(200).json({
            success: true,
            message: "Recording save callback processed successfully",
            data: sessions[sessionIndex]
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
// Export all the middleware handlers globally
module.exports = {
    createSession,
    getSessionById,
    updateSession,
    deleteSession,
    saveRecordingCallback
};