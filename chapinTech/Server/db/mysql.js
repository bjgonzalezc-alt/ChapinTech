import mysql from "mysql2/promise";

export const db =
  await mysql.createPool({

    host: "localhost",

    user: "root",

    password: "YOUR_PASSWORD",

    database: "chapintech",

    waitForConnections: true,

    connectionLimit: 10

});

export default db;

// tickets table schema
// CREATE TABLE tickets (
//   id INT AUTO_INCREMENT PRIMARY KEY,
//   ticket_id VARCHAR(20) UNIQUE,
//   cliente VARCHAR(100),
//   zona VARCHAR(50),
//   descripcion TEXT,
//   prioridad VARCHAR(20),
//   estado VARCHAR(50),
//   tecnico VARCHAR(100),
//   fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
// );

// INSERT INTO tickets
// (ticket_id, cliente, zona, descripcion, prioridad, estado, tecnico)
//
// VALUES
// ('CT-1024','Carlos Méndez','Zona 14',
// 'La computadora no enciende',
// 'Alta',
// 'ABIERTO',
// NULL),

// ('CT-1025','María López','Zona 10',
// 'La impresora no responde',
// 'Media',
// 'ABIERTO',
// NULL),

// ('CT-1026','Juan Pérez','Zona 1',
// 'Internet intermitente',
// 'Baja',
// 'EN RUTA',
// 'Kevin');