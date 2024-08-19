const db = require('../models/db'); // Adjust the path as necessary
const { jsPDF } = require('jspdf'); // Correct import
require('jspdf-autotable'); // Ensure you have this for tables

exports.generateComplianceReport = async (req, res) => {
    try {
        // Ensure the user information is available
        if (!req.user || !req.user.id) {
            return res.status(400).json({ message: 'User information is missing' });
        }

        // Fetch data
        const expiredMeds = await db.query(`SELECT name, quantity, expiration_date FROM inventory WHERE expiration_date < CURDATE()`);
        const lowStockMeds = await db.query(`SELECT name, quantity FROM inventory WHERE quantity < 10`);
        const expiredLicenses = await db.query(`SELECT name, national_id, license_number, qualification_name, expiration_date FROM pharmacists WHERE expiration_date < CURDATE() OR expiration_date IS NULL`);
        const patientsWithoutInsurance = await db.query(`SELECT name, national_id, prescription FROM patients WHERE insurance_id IS NULL`);
        const pendingOrders = await db.query(`SELECT o.order_date, i.name as item_name, o.order_quantity, o.status FROM orders o JOIN inventory i ON o.inventory_id = i.id WHERE o.status = 'Pending'`);

        // Fetch history of previous compliance reports
        const complianceHistory = await db.query(`SELECT id, created_at FROM compliance_records ORDER BY created_at DESC`);

        // Initialize jsPDF
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Report title
        pdf.setFontSize(18);
        pdf.text('Compliance Report', 14, 22);

        // Inventory Compliance Section
        pdf.setFontSize(14);
        pdf.text('Inventory Compliance', 14, 32);
        pdf.autoTable({
            head: [['Medication', 'Quantity', 'Expiration Date']],
            body: expiredMeds.map(item => [item.name, item.quantity, item.expiration_date]),
            startY: 36,
        });

        pdf.autoTable({
            head: [['Medication', 'Quantity']],
            body: lowStockMeds.map(item => [item.name, item.quantity]),
            startY: pdf.lastAutoTable.finalY + 10,
        });

        // Pharmacist Compliance Section
        pdf.text('Pharmacist Compliance', 14, pdf.lastAutoTable.finalY + 20);
        pdf.autoTable({
            head: [['Pharmacist Name', 'National ID', 'License Number', 'Qualification', 'Expiration Date']],
            body: expiredLicenses.map(item => [item.name, item.national_id, item.license_number, item.qualification_name, item.expiration_date]),
            startY: pdf.lastAutoTable.finalY + 30,
        });

        // Patient Compliance Section
        pdf.text('Patient Compliance', 14, pdf.lastAutoTable.finalY + 20);
        pdf.autoTable({
            head: [['Patient Name', 'National ID', 'Prescription']],
            body: patientsWithoutInsurance.map(item => [item.name, item.national_id, item.prescription]),
            startY: pdf.lastAutoTable.finalY + 30,
        });

        // Order Compliance Section
        pdf.text('Order Compliance', 14, pdf.lastAutoTable.finalY + 20);
        pdf.autoTable({
            head: [['Order Date', 'Item Name', 'Quantity', 'Status']],
            body: pendingOrders.map(item => [item.order_date, item.item_name, item.order_quantity, item.status]),
            startY: pdf.lastAutoTable.finalY + 30,
        });

        // History Section
        pdf.addPage();
        pdf.setFontSize(14);
        pdf.text('Compliance Report History', 14, 22);
        pdf.autoTable({
            head: [['Report ID', 'Generated At']],
            body: complianceHistory.map(item => [item.id, item.created_at]),
            startY: 26,
        });

        // Convert PDF to binary data (Buffer)
        const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));

        // Store the report in the database
        const query = `
            INSERT INTO compliance_records (report, generated_by, report_type)
            VALUES (?, ?, 'Compliance')
        `;
        await db.query(query, [pdfBuffer, req.user.id]);

        // Convert PDF to base64 string for client download
        const pdfOutput = pdf.output('datauristring');
        
        // Send response
        res.status(200).send({ pdfOutput });

    } catch (error) {
        console.error('Error generating compliance report:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
