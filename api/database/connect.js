import dotenv from "dotenv";
import mysql from "mysql2";
dotenv.config();

export const db = mysql.createPool({
  password: process.env.DB_PASS,
  user: process.env.DB_USER,
  multipleStatements: true,
  connectionLimit: 10,
  database:"previate",
  dateStrings: true,
  host:"127.0.0.1",
  charset: "utf8mb4"
});

// Configurar collation para todas las conexiones del pool
db.on('connection', (connection) => {
  connection.query("SET NAMES utf8mb4 COLLATE utf8mb4_general_ci;");
  connection.query("SET collation_connection = 'utf8mb4_general_ci';");
  connection.query("SET collation_server = 'utf8mb4_general_ci';");
});

export async function queryDatabase(query, params) {
    return new Promise((resolve, reject) => {
        db.query(query, params, (err, data) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}

const connect = () => {
  db.getConnection((err, connection) => {
    if(err){
      console.log("Ocurrio un error en la conexion con la base de datos");
    }else{
      connection.release();
      console.log("Conexion a MySql Establecida");
    }
  });
}
connect();

db.on('error', (err) => {
  if (err.code === 'PROTOCOL_CONNECTION_LOST') {
    connect();
  } else {
    throw err;
  }
});