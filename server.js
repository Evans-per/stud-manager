const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// In-memory data store for students
let students = [];

let nextId = 1;

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
  const { name, branch, year } = req.body;
  
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
    year
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

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
