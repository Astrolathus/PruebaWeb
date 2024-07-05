//Libreria de Express
const express = require('express');
//Libreria Path
const multer = require('multer');
//Libreria Mysql
const path = require('path');
//Libreria Mysql
const mysql = require('mysql');
const app = express();
const port = 3000;

const upload = multer({dest: 'pagina_principal/imagenes/'});

// Configurar la conexión a la base de datos
const connection = mysql.createConnection({
    host: '10.0.6.39',
    user: 'estudiante',
    password: 'Info-2023',
    database: 'HeladeriaNyP'
});


//Verificacion de errores para validar si la conexion es correcta
connection.connect((err) => {
    if (err) {
        console.error('Error de conexión a la base de datos: ' + err.stack);
        return;
    }
    console.log('Conexión exitosa a la base de datos.');
});
//Envio los datos del formulario por url
app.use(express.urlencoded({ extended: true }));
app.use('/imagenes', express.static(path.join(__dirname, 'imagenes')));
app.use(express.json());
//Configuro para que la aplicacon inicie desde el director o carpeta pagina principal
app.use(express.static(path.join(__dirname, 'pagina_principal')));


app.post('/guardar_helado',upload.single('imagen'),(req, res) => {
    const { nombre, descripcion, sabor, tipo, cobertura, precio } = req.body;
    const imagen = req.file.filename;
    const sql = 'INSERT INTO Helado (nombre, descripcion, imagen, sabor, tipo, cobertura, precio) VALUES (?, ?, ?, ?, ?, ?)';
    connection.query(sql, [nombre, descripcion, imagen, sabor, tipo, cobertura, precio], (err, result) => {
        if (err) throw err;
        console.log('Helado insertada correctamente.');
        res.redirect('/listardatos.html');
    });
});
//Ruta para mostrar las películas en el listardatos.html con metodo GET
app.get('/helados', (req, res) => {
    //Realiza una consulta SQL para seleccionar todas las filas de la tabla "peliculas"
    connection.query('SELECT * FROM Helado', (err, rows) => {
        //Maneja los errores, si los hay
        if (err) throw err;
        res.send(rows); //Aquí puedes enviar la respuesta como quieras (por ejemplo, renderizar un HTML o enviar un JSON)
    });
});
// Ruta para obtener los datos de una película por su ID
app.get('/helado_especifico/:id', (req, res) => {
    // Extraer el ID de los parámetros de la solicitud
    const id = req.params.id;
    // Ejecutar una consulta SQL para obtener los datos de la película con el ID proporcionado
    connection.query('SELECT * FROM Helado WHERE id = ?', [id], (err, result) => {
        if (err) {
            // Manejar el error si ocurre durante la consulta
            console.error('Error al obtener los datos de la película:', err);
            res.status(500).send('Error interno del servidor');
            return;
        }
        // Verificar si no se encontró ninguna película con el ID proporcionado
        if (result.length === 0) {
            res.status(404).send('Película no encontrada');
            return;
        }
        // Enviar los datos de la película como respuesta en formato JSON
        res.json(result[0]);
    });
});
app.post('/registrarUsuario',(req,res)=>{
    const {nombre, correo, contraseña, rol } = req.body;

    const query = 'INSERT INTO usuarios (nombre, correo, contraseña, rol) VALUES (?, ?, ?, ?)';
    connection.query(query, [nombre, correo, contraseña, rol], (err, result) => {
        if (err) {
            console.error('Error al registrar el usuario:', err);
            res.send('Error al registrar el usuario');
        } else {
            res.redirect('/iniciarSesion.html');
        }
    });
});
app.post('/iniciar_sesion', (req, res) => { // Define una ruta POST para '/iniciar_sesion'
    const { correo, contraseña } = req.body; // Extrae 'correo' y 'contraseña' del cuerpo de la solicitud

    // Define la consulta SQL para obtener el rol del usuario que coincida con el correo y la contraseña
    const query = 'SELECT rol FROM usuarios WHERE correo = ? AND contraseña = ?';

    connection.query(query, [correo, contraseña], (err, results) => {
        if (err) { // Si hay un error en la consulta
            console.error('Error al iniciar sesión:', err);
            res.send('Error al iniciar sesión'); 
        } else if (results.length > 0) { 
            const rol = results[0].rol; 
            if (rol === 1) { 
                res.redirect('/formularioHeladeria.html'); 
            } else if (rol === 2) { 
                res.redirect('/formularioHeladeria.html'); 
            }
        } else { 
            res.send('Correo o clave incorrectos'); 
        }
    });
});
//Servidor ejecutandose en el puerto 3000

app.use(express.static(path.join(__dirname, 'pagina_principal')));
app.listen(port, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});

