function verifyAdmin(req, res, next) {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admins only' });
    }
    next();
  }
  
  module.exports = verifyAdmin;
  