const db = require('../models/db');

// Generate financial report
exports.getFinancialSummary = async (req, res) => {
    try {
        const summary = await db.query(`
            SELECT
                SUM(p.total_cost) AS totalCosts,
                SUM(p.final_cost) AS totalFinalCosts,
                SUM(p.total_cost - p.final_cost) AS totalToClaimFromInsurance
            FROM patients p
            LEFT JOIN insurances i ON p.insurance_id = i.id
        `);

        res.status(200).json(summary[0]);
    } catch (err) {
        console.error('Error fetching financial summary:', err);
        res.status(500).json({ message: 'Failed to retrieve financial summary' });
    }
};
exports.getInsuranceBreakdown = async (req, res) => {
    try {
        const breakdown = await db.query(`
            SELECT
                i.name as insurance_name,
                COUNT(*) as totalPatients,
                SUM(p.total_cost) as totalCosts,
                SUM(p.final_cost) as totalFinalCosts,
                SUM(p.total_cost - p.final_cost) as totalToClaimFromInsurance
            FROM patients p
            LEFT JOIN insurances i ON p.insurance_id = i.id
            GROUP BY i.name
        `);

        res.status(200).json(breakdown);
    } catch (err) {
        console.error('Error fetching insurance breakdown:', err);
        res.status(500).json({ message: 'Failed to retrieve insurance breakdown' });
    }
};
exports.getDailyReport = async (req, res) => {
    const { date } = req.params;

    try {
        const results = await db.query(`
            SELECT p.name, p.national_id, p.total_cost, p.final_cost, i.name as insurance_name, i.coverage_rate
            FROM patients p
            LEFT JOIN insurances i ON p.insurance_id = i.id
            WHERE DATE(p.created_at) = ?
        `, [date]);

        const summary = await db.query(`
            SELECT
                SUM(p.total_cost) AS totalCosts,
                SUM(p.final_cost) AS totalFinalCosts,
                SUM(p.total_cost - p.final_cost) AS totalToClaimFromInsurance
            FROM patients p
            LEFT JOIN insurances i ON p.insurance_id = i.id
            WHERE DATE(p.created_at) = ?
        `, [date]);

        res.status(200).json({ results, summary: summary[0] });
    } catch (err) {
        console.error('Error fetching daily report:', err);
        res.status(500).json({ message: 'Failed to retrieve daily report' });
    }
};