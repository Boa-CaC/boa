const jwt = require('jsonwebtoken');
//llamamos a dotenv
require('dotenv').config()

const secretKey = process.env.JWT_SECRET

// Middleware para verificar el token desde las cookies
const authenticateJWT = (req, res, next) => {
    console.log('authenticating...')
    // Obtenemos las cookies con cookie-parser
    const authCookies = req.cookies;
    if (!authCookies) {
        return res.status(401).json({ error: 'No se proporcionaron cookies de autenticación' });
    }
    const token = authCookies.token;
    if (!token) {
        return res.status(401).json({ error: 'No se proporcionó el token de autenticación' });
    }
    jwt.verify(token, secretKey, (err, user) => {
        if (err) {
            return res.status(401).json({ error: 'Token de autenticación inválido' });
        }
        req.user = user;
        next();
    });
};

module.exports = authenticateJWT ;
