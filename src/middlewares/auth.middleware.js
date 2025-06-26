import jwt from 'jsonwebtoken';
import config from '../config/config.js';

export function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
        // Attach user info to req.user
    req.user = {
      id: decoded.userId || decoded.id,
      role: decoded.role,
      ...decoded
    };
      next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
}

export function checkRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }
    next();
  };
}