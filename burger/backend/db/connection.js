const mysql = require('mysql');

const pool = mysql.createPool({
    connectionLimit: process.env.DB_CONNECTION_LIMIT,
    password: process.env.DB_PASS,
    user: process.env.DB_USER,
    database: process.env.DB_NAME,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT

});

module.exports = pool;

