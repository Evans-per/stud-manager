# Student Records Management API

A RESTful API for managing student records built with Express.js.

## Features

- Get all students
- Get a specific student by ID
- Add a new student
- Update student details
- Delete a student

## Student Fields

- **ID**: Unique identifier
- **Name**: Student's full name
- **Branch**: Engineering branch (CSE, IT, ECE, etc.)
- **Year**: Academic year (1, 2, 3, 4)

## API Endpoints

### GET /students
Get all students

**Response:**
```json
{
  "success": true,
  "count": 3,
  "data": [
    { "id": 1, "name": "Amish Kumar", "branch": "CSE", "year": 2 }
  ]
}
```

### GET /students/:id
Get a specific student by ID

**Response:**
```json
{
  "success": true,
  "data": { "id": 1, "name": "Amish Kumar", "branch": "CSE", "year": 2 }
}
```

### POST /students
Add a new student

**Request Body:**
```json
{
  "name": "John Doe",
  "branch": "CSE",
  "year": 2
}
```

### PATCH /students/:id
Update student details

**Request Body:**
```json
{
  "name": "Jane Doe",
  "branch": "IT",
  "year": 3
}
```

### DELETE /students/:id
Delete a student

## Installation

```bash
npm install
```

## Running the Server

```bash
npm start
```

Server will run on `http://localhost:3000`
