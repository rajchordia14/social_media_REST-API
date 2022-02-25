const {Pool, Client} = require("pg");
const { ppid } = require("process");
require("dotenv").config();
const devConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT   
}
const proConfig = process.env.DATABASE_URL;
const pool = new Pool({connectionString:proConfig});
module.exports = pool;
