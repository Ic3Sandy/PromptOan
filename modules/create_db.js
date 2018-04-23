var mysql = require('mysql')

var con = mysql.createConnection({
  host: "localhost",
  user: "ic3",
  password: "qazxsw"
})


con.connect(function(err) {
  if (err) throw err
  console.log("[Modules Create DB] Connected Database!")

  // con.query("DROP DATABASE IF EXISTS mydb", function (err, result) {
  //   if (err) throw err;
  //   console.log("Database drop: "+result);
  // });

  con.query("CREATE DATABASE IF NOT EXISTS mydb", function (err, result) {
    if (err) throw err
    console.log("[Modules Create DB] Database created")
  })
})