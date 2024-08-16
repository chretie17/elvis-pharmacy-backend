// Load environment variables from .env file
require('dotenv').config();

// Import required modules
const express = require('express');
const cors = require('cors');
const morgan = require('morgan'); // Import Morgan for logging
const db = require('./models/db'); // Database connection
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const patientRoutes = require('./routes/patientRoutes');
const pharmacistRoutes = require('./routes/pharmacistRoutes');
const financialRoutes = require('./routes/financialRoutes');
const complianceRoutes = require('./routes/complianceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const insuranceRoutes = require('./routes/InsuranceRoutes');

const app = express();

app.use(cors());


app.use(express.json());



// Test database connection
db.query('SELECT 1', (err) => {
    if (err) {
        console.error('Unable to connect to the database:', err);
    } else {
        console.log('Connected to the database successfully.');
    }
});

// Set up routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/pharmacists', pharmacistRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/compliance', complianceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/insurances', insuranceRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
