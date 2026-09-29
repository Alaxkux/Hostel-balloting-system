const db = require('../db');

const VALID_LEVELS = [100, 200, 300, 400, 500, 600];
const VALID_STATUSES = ['active', 'inactive'];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}][\p{L}\s.'-]*$/u;

const validateStudentInput = ({ name, email, level, faculty, department, status }) => {
  if (!name || !String(name).trim()) return 'Full name is required';
  if (String(name).trim().length > 100) return 'Full name is too long (100 characters max)';
  if (!NAME_REGEX.test(String(name).trim())) return 'Full name can only contain letters, spaces, hyphens, apostrophes and full stops';
  if (email && String(email).trim() && !EMAIL_REGEX.test(String(email).trim())) return 'Email address is not valid';
  if (!VALID_LEVELS.includes(Number(level))) return 'Level must be 100, 200, 300, 400, 500 or 600';
  if (!faculty || !String(faculty).trim()) return 'Faculty is required';
  if (!department || !String(department).trim()) return 'Department is required';
  if (!VALID_STATUSES.includes(status)) return 'Status must be active or inactive';
  return null;
};

const getAllStudents = (req, res) => {
  db.query(
    'SELECT id, matric_no, name, email, level, faculty, department, status FROM students',
    (err, results) => {
      if (err) {
        console.error('Error fetching students:', err.message);
        return res.status(500).json({ error: 'Failed to fetch students' });
      }
      res.json(results);
    }
  );
};

const getStudentApplications = (req, res) => {
  const studentId = req.user.id;

  db.query(
    `SELECT 
      applications.id AS application_id,
      hostels.name AS first_choice_hostel,
      applications.status,
      applications.application_date
    FROM applications
    JOIN application_hostel_choices ON application_hostel_choices.application_id = applications.id
    JOIN hostels ON application_hostel_choices.hostel_id = hostels.id
    WHERE applications.student_id = ?
    AND application_hostel_choices.preference_order = 1
    ORDER BY applications.id DESC`,
    [studentId],
    (err, results) => {
      if (err) {
        console.error('Error fetching student applications:', err.message);
        return res.status(500).json({ error: 'Failed to fetch applications' });
      }
      res.json(results);
    }
  );
};

// Function to get the result of the student for the latest ballot round 
const getMyResult = (req, res) => {
  const studentId = req.user.id;

  const sql = `
    SELECT 
      hostels.name AS hostel_name,
      results.room_number,
      results.result_status,
      ballot_rounds.academic_session,
      ballot_rounds.ballot_date
    FROM results
    JOIN hostels ON results.hostel_id = hostels.id
    JOIN ballot_entries ON results.ballot_entry_id = ballot_entries.id
    JOIN ballot_rounds ON ballot_entries.ballot_round_id = ballot_rounds.id
    WHERE results.student_id = ?
    ORDER BY results.id DESC
    LIMIT 1
  `;

  db.query(sql, [studentId], (err, results) => {
    if (err) {
      console.error('Error fetching result:', err.message);
      return res.status(500).json({ error: 'Failed to fetch result' });
    }

    if (results.length === 0) {
      return res.json({ message: 'No result available yet. The ballot may not have run for your application.' });
    }

    res.json(results[0]);
  });
};

const updateStudent = (req, res) => {
  const studentId = req.params.id;
  const validationError = validateStudentInput(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const { name, email, level, faculty, department, status } = req.body;
  const cleanEmail = email && String(email).trim() ? String(email).trim() : null;

  const sql = `
    UPDATE students
    SET name = ?, email = ?, level = ?, faculty = ?, department = ?, status = ?
    WHERE id = ?
  `;

  db.query(
    sql,
    [String(name).trim(), cleanEmail, Number(level), String(faculty).trim(), String(department).trim(), status, studentId],
    (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.status(409).json({ error: 'That email is already used by another student' });
        }
        console.error('Error updating student:', err.message);
        return res.status(500).json({ error: 'Failed to update student' });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Student not found' });
      }

      res.json({ message: 'Student updated successfully' });
    }
  );
};

const setStudentStatus = (newStatus, successMessage) => (req, res) => {
  const studentId = req.params.id;

  db.query('UPDATE students SET status = ? WHERE id = ?', [newStatus, studentId], (err, result) => {
    if (err) {
      console.error('Error updating student status:', err.message);
      return res.status(500).json({ error: 'Failed to update student status' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ message: successMessage });
  });
};

const deactivateStudent = setStudentStatus('inactive', 'Student deactivated successfully');
const reactivateStudent = setStudentStatus('active', 'Student reactivated successfully');

module.exports = {
  getAllStudents,
  getStudentApplications,
  getMyResult,
  updateStudent,
  deactivateStudent,
  reactivateStudent,
};