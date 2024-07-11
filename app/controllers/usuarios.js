const db = require('../db/db')
const bcrytp = require('bcrypt')
const jwt = require('jsonwebtoken')
//llamamos a dotenv
require('dotenv').config()

const encrypt = async (password) => {
    const salt = await bcrytp.genSalt(10)
    return await bcrytp.hash(password, salt)
}

const compare = async (password, hash) => {
    return await bcrytp.compare(password, hash)
}

//Obtenemos la secret key del .env
const secretKey = process.env.JWT_SECRET

const addUsuario = async (req, res) => {
    let {
        nombre, email, password, password2,idRol
    } = req.body
    //si idRol es null, se pone 2 por defecto
    if (!idRol) {
        idRol = 2
    }

    if (password !== password2) {
        return res.status(400).json({ error: 'Las contraseñas no coinciden' });
    }else{
        password = await encrypt(password)
    }

    const sql = 'INSERT INTO usuarios (nombre, email, password, id_rol) VALUES (?, ?, ?, ?)'
    db.query(sql, [nombre, email, password, idRol], (err, result) => {
        if (err) {
            console.error('Error al insertar el usuario:', err);
            return res.status(500).json({ error: 'Error al insertar el usuario en la base de datos' });
        }
        res.json({ message: 'Usuario creado correctamente', id: result.insertId });
    })
}


const updateUsuario = (req, res) => {
    const { id } = req.params;
    const fieldsToUpdate = req.body;
  
    let sql = 'UPDATE usuarios SET ';
    let values = [];
    let updateFields = [];
  
    // Construir la consulta SQL y los valores a actualizar
    Object.keys(fieldsToUpdate).forEach(key => {
        if (key !== 'id') { // No permitir actualizar el ID
            updateFields.push(`${key} = ?`);
            values.push(fieldsToUpdate[key]);
        }
    });
  
    // Si no se proporcionan campos para actualizar, devolver un error
    if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron campos para actualizar.' });
    }
  
    sql += updateFields.join(', ') + ' WHERE id = ?';
    values.push(id);
  
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error al actualizar el usuario:', err);
            return res.status(500).json({ error: 'Error interno del servidor al actualizar el usuario.' });
        }
        res.json({ message: 'usuario actualizado correctamente.' });
    });
  };

const deleteUsuario = (req, res) => {
    const { id } = req.params
    const sql = 'DELETE FROM usuarios WHERE id = ?'
    db.query(sql, [id], (err, result) => {
        if (err) throw err
        res.json(result)
    })
}

const getUsuarioById = (req, res) => {
    const { id } = req.params
    const sql = 'SELECT * FROM usuarios WHERE id = ?'
    db.query(sql, [id], (err, result) => {
        if (err) throw err
        res.json(result)
    })
}

const getUsuarios = (req, res) => {
    const sql = 'SELECT * FROM usuarios'
    db.query(sql, (err, result) => {
        if (err) throw err
        res.json(result)
    })
}

const getRoles = (req, res) => {
    const sql = 'SELECT * FROM roles'
    db.query(sql, (err, result) => {
        if (err) throw err
        res.json(result)
    })
}

const login = (req, res) => {
    let { email, pass } = req.body;

    if (!email || !pass) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const sql = 'SELECT * FROM usuarios WHERE email = ?';
    db.query(sql, [email], async (err, result) => {
        if (err) {
            console.error('Error en la consulta:', err);
            return res.status(500).json({ error: 'Error interno del servidor' });
        }
        if (result.length === 0) {
            return res.status(401).json({ error: 'El usuario no existe' });
        }
        
        const user = result[0];
        const match = await compare(pass, user.password);  // Compara la contraseña en texto plano con la encriptada
        
        if (!match) {
            return res.status(401).json({ error: 'La contraseña es incorrecta' });
        }
        // creamos la cookie con el token
        const token = jwt.sign({ id: user.id, email: user.email, idRol: user.id_rol }, secretKey, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.status(200).json({ id: user.id, idRol: user.id_rol, token: token });
        console.log("Login correcto", user);
    });
};

module.exports = {
    addUsuario,
    updateUsuario,
    deleteUsuario,
    getUsuarioById,
    getUsuarios,
    getRoles,
    login
}