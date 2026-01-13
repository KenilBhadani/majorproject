// middleware/auth.js
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  // Passport or session based user already present
  if (req.user && (req.user._id || req.user.id)) {
    const id = req.user._id ? req.user._id : req.user.id;
    req.user = { userId: id.toString(), role: req.user.role, id: id.toString() };
    return next();
  }

  // Session-based fallback
  if (req.session && req.session.user) {
    const s = req.session.user;
    req.user = { userId: s.id.toString(), role: s.role, id: s.id.toString() };
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, role, iat, exp }
    next();
  } catch (err) {
    console.error("JWT error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};
