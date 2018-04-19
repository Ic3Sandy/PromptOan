const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

client.connect()

var sql = "CREATE TABLE IF NOT EXISTS users (acc_num INT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), balance INT, session VARCHAR(255))";
client.query(sql, function (err, result) {
    if (err) throw err
    console.log("[db_server] Table created")
})