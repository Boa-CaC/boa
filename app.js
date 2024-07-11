
// Hacemos la llamada a express
const express = require('express');

// Conectamos la base de datos
const db = require('./app/db/db');

// Llamamos a dotenv
require('dotenv').config();

// Llamamos a body-parser
const bodyParser = require('body-parser');
// Importamos path para manejar rutas de archivos
const path = require('path');

const cookieParser = require('cookie-parser')



const authenticateJWT = require('./app/middlewares/auth');
const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET

// Creamos la variable app que nos va a permitir hacer llamadas
const app = express();

// Creamos el puerto
const PORT = process.env.PORT || 3000;

// Middleware para parsear JSON antes de definir las rutas
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieParser(secretKey));

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas
const comerciosRouter = require('./app/routes/comercios');
app.use('/comercios', comerciosRouter);

const usuariosRouter = require('./app/routes/usuarios');
app.use('/usuarios', usuariosRouter);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/mapa', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'mapa.html'));
});

app.get('/ofertas', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'ofertas.html'));
});

app.get('/comercio', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'comercio.html'));
});

app.get('/registro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'registro.html'));
});

app.get('/api/user', authenticateJWT, (req, res) => {
    res.json({
      id: req.user.id,
      nombre: req.user.nombre,
      email: req.user.email,
      foto: req.user.foto,
      id_rol: req.user.id_rol
    });
  });
  

app.get('/back', authenticateJWT, (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'back.html'));
  });

app.get('/resultados', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'resultados.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'login.html'));
});

app.get('/logout', (req, res) => {
    // Destruimos la cookie con el token
    res.clearCookie('token');
    res.redirect('/login');
});

app.use('/uploads', express.static('uploads'));

// Error 404
/*app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', '404.html'));
});*/

// Hacemos el listen
app.listen(PORT, () => {
    console.log(`Servidor corriendo en la url http://localhost:${PORT}/`);
});
