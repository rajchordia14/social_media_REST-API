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
console.log(proConfig);
console.log(typeof(process.env.NODE_ENV));

const pool = new Pool({connectionString:proConfig});
console.log("RAJ");
console.log(pool);
module.exports = pool;

//postgres://knlxjclxfousxc:bbe97d6e94ba7b352c8a82225695c804e4e5e677e2ec45687a7c2888c6e0b3d5@ec2-54-156-60-12.compute-1.amazonaws.com:5432/dcd2l9vch4ir42