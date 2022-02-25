const {Pool, Client} = require("pg");
const { ppid } = require("process");
const PORT = process.env.PORT || 4000;
const devConfig = {
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT   
}
const proConfig = {
    connectionString: process.env.DATABASE_URL//heroku addons
}

const pool = new Pool(process.env.NODE_ENV === "production" ? proConfig : devConfig);

module.exports = pool;