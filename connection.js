const mysql = require('mysql');

const connection = mysql.createConnection({
     multipleStatements: true,
    host: 'localhost',
    database: 'crm_db',
    user: 'root',
    password: '',
    connectionLimit:10
});

connection.connect(function (error) {
    if (error) {
        throw error;
    } else {
        console.log('MySQL database is connection Successfully');
    }
});

module.exports = connection;