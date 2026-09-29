const express = require('express');
const cors = require('cors');
const studentRoutes = require('./routes/studentRoutes');
const hostelRoutes = require('./routes/hostelRoutes');
const applicationRoutes = require('./routes/applicationRoutes');
const ballotRoundRoutes = require('./routes/ballotRoundRoutes');
const ballotRoutes = require('./routes/ballotRoutes');
const authRoutes = require('./routes/authRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const auditlogsRoutes = require('./routes/auditlogsRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;

app.get('/', (req, res) => {
  res.send('Hostel Balloting backend is running');
});

app.get('/api', (req, res) => {
  res.send('Hostel Balloting is running');
});

//api routes
app.use('/api/students', studentRoutes);
app.use('/api/hostels', hostelRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/ballot-rounds', ballotRoundRoutes);
app.use('/api/ballots', ballotRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/auditlogs', auditlogsRoutes);
app.use('/api/dashboard', dashboardRoutes);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
}); 