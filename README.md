# Student Management System

A modern, full-stack web application for managing student records with REST API endpoints and an interactive user interface.

## Features

### 🎯 Core Functionality
- ✅ **CRUD Operations**: Create, Read, Update, and Delete student records
- 📊 **Advanced Statistics**: Real-time charts for branch and year distribution
- 🔍 **Search & Filter**: Filter students by name, branch, or year
- 📈 **Data Visualization**: Interactive pie charts and bar charts using Chart.js
- 💾 **Export Data**: Download student records as JSON

### 🎨 User Interface
- Modern gradient design with pistachio-green, white, and black color scheme
- Responsive layout optimized for mobile and desktop
- Font Awesome icons for visual clarity
- Smooth animations and transitions
- Real-time data updates

### 🔌 REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/students` | Get all students |
| GET | `/students/:id` | Get specific student |
| POST | `/students` | Add new student |
| PATCH | `/students/:id` | Update student details |
| DELETE | `/students/:id` | Delete student |

### 📦 Student Data Model

```json
{
  "id": 1,
  "name": "Student Name",
  "branch": "CSE",
  "year": 2
}
```

**Supported Branches:**
- CSE (Computer Science Engineering)
- IT (Information Technology)
- ECE (Electronics & Communication)
- ME (Mechanical Engineering)
- CE (Civil Engineering)

**Years:** 1, 2, 3, 4

## Installation & Setup

### Prerequisites
- Node.js (v12 or higher)
- npm or yarn

### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/Evans-per/stud-manager.git
   cd stud-manager
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the server**
   ```bash
   node server.js
   ```

4. **Access the application**
   - Open your browser and navigate to `http://localhost:3000`
   - The server runs on port 3000 by default

## Project Structure

```
stud-manager/
├── server.js              # Express server with API endpoints
├── package.json           # Project dependencies
├── public/
│   └── index.html        # Main UI with all features
└── README.md             # This file
```

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework for REST API
- **Body Parser** - Middleware for JSON parsing

### Frontend
- **HTML5** - Markup
- **CSS3** - Styling and responsive design
- **Vanilla JavaScript** - Interactivity
- **Chart.js** - Data visualization
- **Font Awesome** - Icon library

## API Usage Examples

### Get All Students
```bash
curl http://localhost:3000/students
```

### Get Specific Student
```bash
curl http://localhost:3000/students/1
```

### Add New Student
```bash
curl -X POST http://localhost:3000/students \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","branch":"CSE","year":2}'
```

### Update Student
```bash
curl -X PATCH http://localhost:3000/students/1 \
  -H "Content-Type: application/json" \
  -d '{"name":"Jane Doe","year":3}'
```

### Delete Student
```bash
curl -X DELETE http://localhost:3000/students/1
```

## Features in Detail

### 📊 Statistics Dashboard
- Total student count with large prominent display
- Branch distribution pie chart
- Year-wise distribution bar chart
- Auto-updating charts as data changes

### 🔍 Advanced Search
- Real-time search by name, branch, or year
- Dropdown filters for branch and year
- Clear button to reset all filters
- Live filtering as you type

### 📁 Data Management
- In-memory data storage (data resets on server restart)
- Student detail view with full information
- Edit functionality with modal form
- Delete confirmation dialog
- API response display for learning

### 📱 Responsive Design
- Mobile-friendly layout
- Tablet optimized views
- Desktop full-featured experience
- Flexible grid system

## Future Enhancements

- Database integration (MongoDB/PostgreSQL)
- User authentication
- Bulk import from CSV
- Email notifications
- Student performance tracking
- Attendance management
- Advanced reporting

## License

MIT License - feel free to use this project for learning and development.

## Author

Evans - Student Management System Developer

---

**Happy Learning!** 🎓
