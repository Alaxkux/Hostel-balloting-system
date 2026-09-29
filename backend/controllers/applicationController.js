const db = require('../db');

// get all applications with student name and first choice hostel
const getAllApplications = (req, res) => {
  db.query(
    `SELECT 
      applications.id AS application_id,
      students.matric_no,
      students.name AS student_name,
      hostels.name AS first_choice_hostel,
      applications.status,
      applications.application_date
    FROM applications
    JOIN students ON applications.student_id = students.id
    JOIN application_hostel_choices ON application_hostel_choices.application_id = applications.id
    JOIN hostels ON application_hostel_choices.hostel_id = hostels.id
    WHERE application_hostel_choices.preference_order = 1
    ORDER BY applications.id DESC
    LIMIT 10`,
    (err, results) => {
      if (err) {
        console.error('Error fetching applications:', err.message);
        return res.status(500).json({ error: 'Failed to fetch applications' });
      }
      res.json(results);
    }
  );
};

// create student application with hostel choices
const createApplication = (req, res) => {
  const student_id = req.user.id; // CHANGED: trust the verified token, not the request body
  const { ballot_round_id, hostel_choices } = req.body; // CHANGED: student_id removed from destructuring

  if (!ballot_round_id || !hostel_choices || hostel_choices.length === 0) {
    return res.status(400).json({ error: 'ballot_round_id and hostel_choices are required' });
  }

  db.query('SELECT id FROM students WHERE id = ?', [student_id], (err, studentResults) => {
    if (err) {
      console.error('Error checking student:', err.message);
      return res.status(500).json({ error: 'Failed to verify student' });
    }

    if (studentResults.length === 0) {
      return res.status(404).json({ error: 'Student not found' });
    }

    db.beginTransaction((err) => {
      if (err) {
        console.error('Error starting transaction:', err.message);
        return res.status(500).json({ error: 'Failed to start transaction' });
      }

      const insertApplicationSql = 'INSERT INTO applications (student_id, ballot_round_id, status) VALUES (?, ?, ?)';

      db.query(insertApplicationSql, [student_id, ballot_round_id, 'submitted'], (err, applicationResult) => {
        if (err) {
          return db.rollback(() => {
            console.error('Error creating application:', err.message);
            res.status(500).json({ error: 'Failed to create application' });
          });
        }

        const newApplicationId = applicationResult.insertId;
        const choiceValues = hostel_choices.map((hostelId, index) => [newApplicationId, hostelId, index + 1]);
        const insertChoicesSql = 'INSERT INTO application_hostel_choices (application_id, hostel_id, preference_order) VALUES ?';

        db.query(insertChoicesSql, [choiceValues], (err) => {
          if (err) {
            return db.rollback(() => {
              console.error('Error creating hostel choices:', err.message);
              res.status(500).json({ error: 'Failed to save hostel choices' });
            });
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => {
                console.error('Error committing transaction:', err.message);
                res.status(500).json({ error: 'Failed to finalize application' });
              });
            }

            res.status(201).json({
              message: 'Application submitted successfully',
              applicationId: newApplicationId
            });
          });
        });
      });
    });
  });
};

module.exports = { getAllApplications, createApplication };