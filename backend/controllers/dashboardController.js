const db = require('../db');

const getAdminStats = (req, res) => {
  const sql = `
    SELECT
      (SELECT COUNT(*) FROM students) AS total_students,
      (SELECT COUNT(*) FROM applications) AS total_applications,
      (SELECT COUNT(*) FROM ballot_rounds) AS total_ballot_rounds,
      (SELECT COUNT(*) FROM hostels) AS total_hostels
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('Error fetching dashboard stats:', err.message);
      return res.status(500).json({ error: 'Failed to fetch dashboard stats' });
    }
    res.json(results[0]);
  });
};

module.exports = { getAdminStats };