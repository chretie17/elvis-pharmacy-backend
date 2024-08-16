const mysql = require('mysql2');  

const pool = mysql.createPool({
    connectionLimit: 10,
    host: 'localhost',
    user: 'root',
    password: 'Admin@123',
    database: 'pharmainsight',
    port: 3306
});


const db = {
    query: (sql, params) => {
        console.log("Executing SQL query:", sql, "with params:", params);
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (err, results) => {
                if (err) {
                    console.error("Error during SQL query execution:", err);
                    return reject(err);
                }
                console.log("SQL query executed successfully, results:", results);
                resolve(results);
            });
        });
    },
};

module.exports = db;
