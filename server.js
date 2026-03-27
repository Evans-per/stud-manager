const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

// Middleware - increase limit for image data
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// In-memory data store for students
let students = [
  {
    id: 1,
    name: 'Ava Thompson',
    branch: 'CSE',
    year: '2',
    email: 'ava.thompson@college.edu',
    phone: '+1 555 101 2020',
    studentId: 'CSE-2026-001',
    status: 'active'
  },
  {
    id: 2,
    name: 'Noah Patel',
    branch: 'ECE',
    year: '3',
    email: 'noah.patel@college.edu',
    phone: '+1 555 303 4040',
    studentId: 'ECE-2026-014',
    status: 'active'
  },
  {
    id: 3,
    name: 'Mia Rodriguez',
    branch: 'IT',
    year: '1',
    email: 'mia.rodriguez@college.edu',
    phone: '+1 555 505 6060',
    studentId: 'IT-2026-009',
    status: 'inactive'
  }
];

let nextId = 4;

// GET /students - Get all students
app.get('/students', (req, res) => {
  res.json({
    success: true,
    count: students.length,
    data: students
  });
});

// GET /students/:id - Get a specific student
app.get('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  
  res.json({
    success: true,
    data: student
  });
});

// POST /students - Add a new student
app.post('/students', (req, res) => {
  const { name, branch, year, email, phone, studentId, status } = req.body;
  
  // Validation
  if (!name || !branch || !year) {
    return res.status(400).json({
      success: false,
      message: 'Please provide name, branch, and year'
    });
  }
  
  const newStudent = {
    id: nextId++,
    name,
    branch,
    year,
    email: email || '',
    phone: phone || '',
    studentId: studentId || '',
    status: status || 'active'
  };
  
  students.push(newStudent);
  
  res.status(201).json({
    success: true,
    message: 'Student added successfully',
    data: newStudent
  });
});

// PATCH /students/:id - Update student details
app.patch('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));
  
  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  
  // Update only provided fields
  if (req.body.name) student.name = req.body.name;
  if (req.body.branch) student.branch = req.body.branch;
  if (req.body.year) student.year = req.body.year;
  if (req.body.email !== undefined) student.email = req.body.email;
  if (req.body.phone !== undefined) student.phone = req.body.phone;
  if (req.body.studentId !== undefined) student.studentId = req.body.studentId;
  if (req.body.status !== undefined) student.status = req.body.status;
  
  res.json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
});

// PUT /students/:id - Full/partial update (alias to patch behavior)
app.put('/students/:id', (req, res) => {
  const student = students.find(s => s.id === parseInt(req.params.id));

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }

  if (req.body.name !== undefined) student.name = req.body.name;
  if (req.body.branch !== undefined) student.branch = req.body.branch;
  if (req.body.year !== undefined) student.year = req.body.year;
  if (req.body.email !== undefined) student.email = req.body.email;
  if (req.body.phone !== undefined) student.phone = req.body.phone;
  if (req.body.studentId !== undefined) student.studentId = req.body.studentId;
  if (req.body.status !== undefined) student.status = req.body.status;

  res.json({
    success: true,
    message: 'Student updated successfully',
    data: student
  });
});

// DELETE /students/:id - Delete a student
app.delete('/students/:id', (req, res) => {
  const index = students.findIndex(s => s.id === parseInt(req.params.id));
  
  if (index === -1) {
    return res.status(404).json({
      success: false,
      message: 'Student not found'
    });
  }
  
  const deletedStudent = students.splice(index, 1);
  
  res.json({
    success: true,
    message: 'Student deleted successfully',
    data: deletedStudent[0]
  });
});

// Allow direct visits to /student and other frontend paths in deployment.
app.get('/student', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/students')) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

module.exports = app;
