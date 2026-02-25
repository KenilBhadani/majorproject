const jwt = require("jsonwebtoken");

function verifyStaff(req, res, next) {
  try {
    // Session-based staff
    if (req.session?.staff) {
      const s = req.session.staff;
      const validRoles = ["housekeeping", "receptionist", "manager", "admin", "maintenance"];
      if (!validRoles.includes(s.role.toLowerCase()))
        return res.status(403).json({ message: "Forbidden" });
      req.user = { userId: s.staffId || s.userId || s.id, role: s.role };
      return next();
    }

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: "Unauthorized" });
    const token = auth.replace("Bearer ", "");
    const data = jwt.verify(token, process.env.JWT_SECRET);
    const validRoles = ["housekeeping", "receptionist", "manager", "admin", "maintenance"];
    
    if (!data || !validRoles.includes((data.role || "").toLowerCase()))
      return res.status(403).json({ message: "Forbidden" });

    req.user = { userId: data.staffId || data.userId || data.id, role: data.role };
    next();
  } catch (err) {
    console.error("verifyStaff error", err.message);
    return res.status(401).json({ message: "Invalid token" });
  }
}

module.exports = verifyStaff;
