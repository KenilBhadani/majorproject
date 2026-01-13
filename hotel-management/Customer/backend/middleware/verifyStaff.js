const jwt = require('jsonwebtoken');

function verifyStaff(req, res, next) {
  try {
    // Session-based staff
    if (req.session && req.session.staff) {
      const s = req.session.staff;
      if (!['Housekeeping', 'Receptionist', 'Manager'].includes(s.role)) return res.status(403).json({ message: 'Forbidden' });
      req.user = { id: s.staffId, role: s.role };
      return next();
    }

    const auth = req.headers.authorization;
    if (!auth) return res.status(401).json({ message: 'Unauthorized' });
    const token = auth.replace('Bearer ', '');
    const data = jwt.verify(token, process.env.JWT_SECRET);
    if (!data || !['Housekeeping', 'Receptionist', 'Manager'].includes(data.role)) return res.status(403).json({ message: 'Forbidden' });
    req.user = { id: data.staffId, role: data.role };
    next();
  } catch (err) {
    console.error('verifyStaff error', err.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
}

module.exports = verifyStaff;