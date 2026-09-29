const db = require('../db');

const getAllAuditLogs = (req, res) => {
  db.query(
    'SELECT id, admin_id, action, table_name, record_id, description, created_at FROM audit_logs ORDER BY created_at DESC',
    (err, results) => {
      if (err) {
        console.error('Error fetching audit logs:', err.message);
        return res.status(500).json({ error: 'Failed to fetch audit logs' });
      }
      res.json(results);
    }
  );
};

module.exports = { getAllAuditLogs };