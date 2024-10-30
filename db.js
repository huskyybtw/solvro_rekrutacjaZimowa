require("dotenv").config();
const { Pool } = require("pg");

const pool = new Pool({
    user: process.env.DB_USER,
    host: "localhost",
    database: process.env.DATABASE,
    password: process.env.DB_PASSWORD,
    port: 5432
});

pool.connect((error) => {
    if (error) {
        console.error("Failed to connect to PostgreSQL", error);
    } else {
        console.log("Connected to PostgreSQL successfully");
    }
});

module.exports = pool;