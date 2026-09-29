const db = require('../db');

// Helper function to group applications by application_id and collect hostel choices
const groupApplicationsByChoices = (rows) => {
  const grouped = {};

  rows.forEach((row) => {
    if (!grouped[row.application_id]) {
      grouped[row.application_id] = {
        application_id: row.application_id,
        student_id: row.student_id,
        choices: []
      };
    }
    grouped[row.application_id].choices.push(row.hostel_id);
  });

  return Object.values(grouped);
};

// function to shuffle an array using Fisher-Yates algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// save allocation results, one application at a time, recursively
const saveAllocationResults = (allocationResults, ballotRoundId, index, callback) => {
  if (index >= allocationResults.length) {
    return callback();
  }

  const current = allocationResults[index];

  const insertEntrySql = 'INSERT INTO ballot_entries (ballot_round_id, application_id, selection_status) VALUES (?, ?, ?)';

  db.query(insertEntrySql, [ballotRoundId, current.application_id, current.selection_status], (err, entryResult) => {
    if (err) return callback(err);

    const ballotEntryId = entryResult.insertId;

    const insertResultSql = 'INSERT INTO results (ballot_entry_id, student_id, hostel_id, result_status) VALUES (?, ?, ?, ?)';

    db.query(insertResultSql, [ballotEntryId, current.student_id, current.allocated_hostel_id, current.result_status], (err) => {
      if (err) return callback(err);

      const updateStatusSql = 'UPDATE applications SET status = ? WHERE id = ?';

      db.query(updateStatusSql, ['processed', current.application_id], (err) => {
        if (err) return callback(err);

        if (!current.allocated_hostel_id) {
          const notificationTitle = 'Hostel Ballot Result';
          const notificationMessage = 'Unfortunately, you were not allocated a hostel in this ballot round.';

          const insertNotificationSql = 'INSERT INTO notifications (student_id, title, message) VALUES (?, ?, ?)';

          db.query(insertNotificationSql, [current.student_id, notificationTitle, notificationMessage], (err) => {
            if (err) return callback(err);
            saveAllocationResults(allocationResults, ballotRoundId, index + 1, callback);
          });

        } else {
          db.query('SELECT name FROM hostels WHERE id = ?', [current.allocated_hostel_id], (err, hostelRows) => {
            if (err) return callback(err);

            const hostelName = hostelRows[0]?.name || 'a hostel';
            const notificationTitle = 'Hostel Ballot Result';
            const notificationMessage = `Congratulations! You have been allocated ${hostelName} in this ballot round.`;

            const insertNotificationSql = 'INSERT INTO notifications (student_id, title, message) VALUES (?, ?, ?)';

            db.query(insertNotificationSql, [current.student_id, notificationTitle, notificationMessage], (err) => {
              if (err) return callback(err);
              saveAllocationResults(allocationResults, ballotRoundId, index + 1, callback);
            });
          });
        }
      });
    });
  });
};
// start ballot
const runBallot = (req, res) => {
  const ballotRoundId = req.params.id;

  const getApplicationsSql = `
    SELECT 
      applications.id AS application_id,
      applications.student_id,
      application_hostel_choices.hostel_id,
      application_hostel_choices.preference_order
    FROM applications
    JOIN application_hostel_choices ON application_hostel_choices.application_id = applications.id
    WHERE applications.ballot_round_id = ?
    AND applications.status = 'submitted'
    ORDER BY applications.id, application_hostel_choices.preference_order
  `;

  db.query(getApplicationsSql, [ballotRoundId], (err, rows) => {
    if (err) {
      console.error('Error fetching applications for ballot:', err.message);
      return res.status(500).json({ error: 'Failed to fetch applications' });
    }

    if (rows.length === 0) {
      return res.status(400).json({ error: 'No submitted applications found for this ballot round. The ballot may have already been run, or no one has applied yet.' });
    }

    const groupedApplications = groupApplicationsByChoices(rows);
    const shuffledApplications = shuffleArray(groupedApplications);

    db.query('SELECT id, available_slots FROM hostels', (err, hostelRows) => {
      if (err) {
        console.error('Error fetching hostels for ballot:', err.message);
        return res.status(500).json({ error: 'Failed to fetch hostels' });
      }

      const hostelSlots = {};
      hostelRows.forEach((hostel) => {
        hostelSlots[hostel.id] = hostel.available_slots;
      });

      const allocationResults = shuffledApplications.map((application) => {
        let allocatedHostelId = null;

        for (const hostelId of application.choices) {
          if (hostelSlots[hostelId] > 0) {
            allocatedHostelId = hostelId;
            hostelSlots[hostelId] -= 1;
            break;
          }
        }

        return {
          application_id: application.application_id,
          student_id: application.student_id,
          allocated_hostel_id: allocatedHostelId,
          result_status: allocatedHostelId ? 'successful' : 'unsuccessful',
          selection_status: allocatedHostelId ? 'selected' : 'rejected'
        };
      });

      db.beginTransaction((transErr) => {
        if (transErr) {
          console.error('Error starting transaction:', transErr.message);
          return res.status(500).json({ error: 'Failed to start ballot transaction' });
        }

        saveAllocationResults(allocationResults, ballotRoundId, 0, (saveErr) => {
          if (saveErr) {
            return db.rollback(() => {
              console.error('Error saving allocation results:', saveErr.message);
              res.status(500).json({ error: 'Failed to save ballot results' });
            });
          }

          db.commit((commitErr) => {
            if (commitErr) {
              return db.rollback(() => {
                console.error('Error committing ballot transaction:', commitErr.message);
                res.status(500).json({ error: 'Failed to finalize ballot' });
              });
            }

            res.json({ message: 'Ballot run successfully', results: allocationResults });
          });
        });
      });
    });
  });
};

// Function to assign a specific ballot round to student name and hostel name
const getBallotResults = (req, res) => {
  const ballotRoundId = req.params.id;

  const sql = `
    SELECT 
      students.name AS student_name,
      hostels.name AS hostel_name,
      results.room_number,
      results.result_status
    FROM results
    JOIN ballot_entries ON results.ballot_entry_id = ballot_entries.id
    JOIN students ON results.student_id = students.id
    JOIN hostels ON results.hostel_id = hostels.id
    WHERE ballot_entries.ballot_round_id = ?
  `;

  db.query(sql, [ballotRoundId], (err, results) => {
    if (err) {
      console.error('Error fetching ballot results:', err.message);
      return res.status(500).json({ error: 'Failed to fetch ballot results' });
    }
    res.json(results);
  });
};

module.exports = { runBallot, getBallotResults };