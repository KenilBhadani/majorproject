const jwt = require("jsonwebtoken");

/**
 * Auth middleware
 * Supports:
 *  - Session / Passport login
 *  - JWT (Bearer token) login
 * Sets req.user = { userId, role }
 */
module.exports = function auth(req, res, next) {
  try {
    // 1️⃣ Session login
    if (req.session?.user) {
      const s = req.session.user;
      req.user = {
        userId: s.id || s._id,
        role: s.role || "user",
      };
      return next();
    }

    // 2️⃣ JWT token login
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      userId: decoded.userId || decoded.id,
      role: decoded.role || "user",
    };

    next();
  } catch (err) {
    console.error("AUTH MIDDLEWARE ERROR:", err.message);
    return res.status(401).json({ error: "Invalid token" });
  }
};
