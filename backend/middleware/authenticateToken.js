const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  const demoRole = req.headers["x-demo-role"];
  const demoUserId = req.headers["x-demo-user-id"];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET || "fallback_secret", (err, user) => {
      if (err) return res.status(403).json({ success: false, message: "Invalid or expired token" });
      req.user = user;
      next();
    });
  } else if (demoRole) {
    // Support mock-auth headers for development/demo mode
    req.user = {
      id: demoUserId || "demo-user-1",
      role: demoRole
    };
    next();
  } else {
    return res.status(401).json({ success: false, message: "Authentication required: Missing token or roles" });
  }
}

module.exports = authenticateToken;