var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'message_node_db'
});

connection.connect((err) => {
    if (err) {
        throw err;
    } else {
        console.log('db connected');
    }
});

module.exports = connection;