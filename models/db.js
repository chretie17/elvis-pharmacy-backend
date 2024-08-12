const mysql = require('mysql2');  

// Create a connection pool for better performance
const pool = mysql.createPool({
    connectionLimit: 10,  // Adjust the number of connections in the pool as needed
    host: 'localhost',    // Corrected to the actual MySQL host
    user: 'root',         // Replace with your MySQL username
    password: 'Admin@123', // Replace with your MySQL password
    database: 'pharmainsight', // Replace with your database name
    port: 3306            // Optional, only if MySQL is running on a different port
});

// Export a method to execute queries
const db = {
    query: (sql, params) => {
        console.log("Executing SQL query:", sql, "with params:", params); // Log the query and parameters
        return new Promise((resolve, reject) => {
            pool.query(sql, params, (err, results) => {
                if (err) {
                    console.error("Error during SQL query execution:", err); // Log any errors
                    return reject(err);
                }
                console.log("SQL query executed successfully, results:", results); // Log results
                resolve(results);
            });
        });
    },
};

module.exports = db;
