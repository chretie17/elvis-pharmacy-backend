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
        // Remove console logs from here
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (err, results) => {
                if (err) {
                    // Log the error if needed
                    console.error("Error during SQL query execution:", err.message); // Log only the error message
                    return reject(err);
                }
                // Resolve the results without logging
                resolve(results);
            });
        });
    },
};

module.exports = db;
