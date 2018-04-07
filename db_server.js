var mysql = require('mysql');

// Create Database
var create_db = require('./modules/create_db.js')

var con = mysql.createConnection({
  host: "localhost",
  user: "ic3",
  password: "qazxsw",
  database: "mydb"
});

con.connect(function(err) {
    if (err) throw err;
    //   console.log("Connected Database!");
    var sql = "DROP TABLE IF EXISTS users"
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table drop");
    });

    var sql = "CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, acc_num INT, username VARCHAR(255), password VARCHAR(255), session VARCHAR(255))";
    con.query(sql, function (err, result) {
        if (err) throw err;
        console.log("Table created");
    });

    var sql = "INSERT INTO users (acc_num, username, password) VALUES ?";
    var values = [
        [123, 'foo', 'bar'],
        [456, 'alice', 'bob'],
    ];
    con.query(sql, [values], function (err, result) {
      if (err) throw err;
    //   console.log("Number of records inserted: " + result.affectedRows);
    });

});

exports.checkLogin = function(username, password) {
    
    console.log("Check password!")
    var sql = 'SELECT * FROM users WHERE username = ' + mysql.escape(username)
    con.query(sql, function (err, result, fields) {
        if (err) throw err
        console.log(username, password)
        if (result.length == 0){
            console.log('false')
            return false
        }else if(result[0].password == password){
            console.log('result[0].password == password true')
            return true
        }
        return false
    });
}