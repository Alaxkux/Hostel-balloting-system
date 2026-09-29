const db = require('../db');

const getMyNotifications = (req, res) => {
  const studentId = req.user.id;

  db.query(
    'SELECT id, title, message, is_read, created_at FROM notifications WHERE student_id = ? ORDER BY created_at DESC',
    [studentId],
    (err, results) => {
      if (err) {
        console.error('Error fetching notifications:', err.message);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
      }
      res.json(results);
    }
  );
};

const markAsRead = (req, res) => {
  const notificationId = req.params.id;
  const studentId = req.user.id;

  db.query(
    'UPDATE notifications SET is_read = 1 WHERE id = ? AND student_id = ?',
    [notificationId, studentId],
    (err, result) => {
      if (err) {
        console.error('Error updating notification:', err.message);
        return res.status(500).json({ error: 'Failed to update notification' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notification not found' });
      }

      res.json({ message: 'Notification marked as read' });
    }
  );
};

module.exports = { getMyNotifications, markAsRead };