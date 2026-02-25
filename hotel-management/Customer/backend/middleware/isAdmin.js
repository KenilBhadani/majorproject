module.exports = function isAdmin(req, res, next) {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });
    if (req.user.role !== "admin") return res.status(403).json({ error: "Admin access required" });
    next();
  } catch (err) {
    console.error("isAdmin error:", err.message);
    return res.status(500).json({ error: "Authorization failed" });
  }
};
