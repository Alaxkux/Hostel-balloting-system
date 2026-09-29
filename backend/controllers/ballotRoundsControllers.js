const db = require('../db');

const getAllBallotRounds = (req, res) => {
  db.query(
    'SELECT id, academic_session, name, application_start, application_end, ballot_date, status FROM ballot_rounds',
    (err, results) => {
      if (err) {
        console.error('Error fetching ballot rounds:', err.message);
        return res.status(500).json({ error: 'Failed to fetch ballot rounds' });
      }
      res.json(results);
    }
  );
};

const createBallotRound = (req, res) => {
  const { academic_session, name, application_start, application_end, ballot_date, status } = req.body;

  if (!academic_session || !application_start || !application_end) {
    return res.status(400).json({ error: 'academic_session, application_start, and application_end are required' });
  }

  const sql = `
    INSERT INTO ballot_rounds
      (academic_session, name, application_start, application_end, ballot_date, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [academic_session, name || academic_session, application_start, application_end, ballot_date || null, status || 'open'],
    (err, result) => {
      if (err) {
        console.error('Error creating ballot round:', err.message);
        return res.status(500).json({ error: 'Failed to create ballot round' });
      }
      res.status(201).json({ message: 'Ballot round created successfully', ballotRoundId: result.insertId });
    }
  );
};

module.exports = { getAllBallotRounds, createBallotRound };