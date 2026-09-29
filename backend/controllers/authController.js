const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const loginStudent = async (req, res) => {
  const { matric_no, password } = req.body;

  if (!matric_no || !password) {
    return res.status(400).json({ error: 'matric_no and password are required' });
  }

  db.query('SELECT * FROM students WHERE matric_no = ?', [matric_no], async (err, results) => {
    if (err) {
      console.error('Error looking up student:', err.message);
      return res.status(500).json({ error: 'Failed to process login' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid matric number or password' });
    }

    const student = results[0];

    try {
      const passwordMatches = await bcrypt.compare(password, student.password);

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid matric number or password' });
      }

      const token = jwt.sign(
        { id: student.id, matric_no: student.matric_no, role: 'student' },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({
        message: 'Login successful',
        token,
        student: {
          id: student.id,
          matric_no: student.matric_no,
          name: student.name,
          level: student.level,
          faculty: student.faculty,
          department: student.department
        }
      });
    } catch (compareErr) {
      console.error('Error comparing password:', compareErr.message);
      res.status(500).json({ error: 'Failed to process login' });
    }
  });
};


const loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  db.query('SELECT * FROM admins WHERE email = ?', [email], async (err, results) => {
    if (err) {
      console.error('Error looking up admin:', err.message);
      return res.status(500).json({ error: 'Failed to process login' });
    }

    if (results.length === 0) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const admin = results[0];

    try {
      const passwordMatches = await bcrypt.compare(password, admin.password);

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET,
        { expiresIn: '2h' }
      );

      res.json({
        message: 'Login successful',
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        }
      });
    } catch (compareErr) {
      console.error('Error comparing password:', compareErr.message);
      res.status(500).json({ error: 'Failed to process login' });
    }
  });
};

//change password function for admin
const changeAdminPassword = async (req, res) => {
  const adminId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'currentPassword and newPassword are required' });
  }

  db.query('SELECT * FROM admins WHERE id = ?', [adminId], async (err, results) => {
    if (err) {
      console.error('Error looking up admin:', err.message);
      return res.status(500).json({ error: 'Failed to process request' });
    }

    if (results.length === 0) {
      return res.status(404).json({ error: 'Admin not found' });
    }

    const admin = results[0];

    try {
      const passwordMatches = await bcrypt.compare(currentPassword, admin.password);

      if (!passwordMatches) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);

      db.query('UPDATE admins SET password = ? WHERE id = ?', [hashedNewPassword, adminId], (updateErr) => {
        if (updateErr) {
          console.error('Error updating password:', updateErr.message);
          return res.status(500).json({ error: 'Failed to update password' });
        }
        res.json({ message: 'Password updated successfully' });
      });
    } catch (compareErr) {
      console.error('Error processing password change:', compareErr.message);
      res.status(500).json({ error: 'Failed to process request' });
    }
  });
};

module.exports = { loginStudent, loginAdmin, changeAdminPassword };