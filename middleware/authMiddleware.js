const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
  const [scheme, token] = (req.headers.authorization || '').split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ error: 'Token não informado' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, {
      algorithms: ['HS256']
    });

    // Tokens emitidos antes da introdução de papéis não têm "role".
    // Tratamos como sessão desatualizada para o front levar ao login.
    if (!decoded.role) {
      return res.status(401).json({
        error: 'Sessão desatualizada. Entre novamente.',
        code: 'TOKEN_INVALID'
      });
    }

    req.usuario = decoded;
    next();
  } catch (error) {
    const expirado = error.name === 'TokenExpiredError';

    return res.status(401).json({
      error: expirado ? 'Sessão expirada. Entre novamente.' : 'Token inválido',
      code: expirado ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
    });
  }
}

function exigirPapel(...papeis) {
  return (req, res, next) => {
    if (!papeis.includes(req.usuario?.role)) {
      return res.status(403).json({
        error: 'Você não tem permissão para esta ação'
      });
    }

    next();
  };
}

module.exports = authMiddleware;
module.exports.exigirPapel = exigirPapel;
