const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Acceso denegado — token requerido' })
  }

  try {
    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user      = decoded
    next()
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token inválido o expirado' })
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Acceso denegado — se requiere rol admin' })
  }
  next()
}

module.exports = { authMiddleware, adminOnly }