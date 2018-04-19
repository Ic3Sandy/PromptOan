const { Client } = require('pg')

const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: true,
})

client.connect()

// function create_tb(){
//     var sql = "CREATE TABLE IF NOT EXISTS users (acc_num INT PRIMARY KEY, username VARCHAR(255), password VARCHAR(255), balance INT, session VARCHAR(255))";
//     client.query(sql, function (err, result) {
//     if (err) throw err
//     console.log("[db_server] Table created")
//     insert_info()
// })
// }

// function insert_info(){

//     var sql = "INSERT INTO users (acc_num, username, password, balance) VALUES ?";
//     var values = [
//         [123, 'foo', 'bar', 500],
//         [456, 'alice', 'bob', 500],
//     ]
//     client.query(sql, [values], function (err, result) {
//         if (err) throw err
//     //   console.log("Number of records inserted: " + result.affectedRows);
//     })

// }

var sql = "DROP TABLE IF EXISTS users"
client.query(sql, function (err, result) {
    if (err) throw err;
    console.log("[db_server] Table drop")
    create_tb()
})



