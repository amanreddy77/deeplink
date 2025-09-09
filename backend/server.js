require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const xlsx = require('xlsx');
const cors = require('cors');
const path = require('path');
const config = require('./config');

const app = express();
const PORT = config.PORT;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());
app.use(express.static('uploads'));

// MongoDB connection with better error handling
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on('connected', () => {
  console.log('✅ Connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.log('⚠️  MongoDB disconnected');
});

// Student Schema
const studentSchema = new mongoose.Schema({
  student_id: { type: String, required: true },
  student_name: { type: String, required: true },
  total_marks: { type: Number, required: true },
  marks_obtained: { type: Number, required: true },
  percentage: { type: Number, required: true },
  created_at: { type: Date, default: Date.now }
});

const Student = mongoose.model('Student', studentSchema);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.xlsx', '.csv'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel (.xlsx) and CSV files are allowed'));
    }
  }
});

// Helper function to parse Excel/CSV files
function parseFile(filePath, originalName) {
  const ext = path.extname(originalName).toLowerCase();
  
  if (ext === '.xlsx') {
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  } else if (ext === '.csv') {
    const workbook = xlsx.readFile(filePath, { type: 'binary' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    return xlsx.utils.sheet_to_json(worksheet);
  }
  
  throw new Error('Unsupported file format');
}

// Routes

// Upload file and process data
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const filePath = req.file.path;
    const originalName = req.file.originalname;
    
    // Parse the file
    const data = parseFile(filePath, originalName);
    
    if (!data || data.length === 0) {
      return res.status(400).json({ error: 'No data found in file' });
    }

    // Check if MongoDB is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not available. Please ensure MongoDB is running.',
        parsedData: data // Return parsed data even if DB is not available
      });
    }

    // Clear existing data
    await Student.deleteMany({});
    
    // Process and save data
    const students = [];
    for (const row of data) {
      // Handle different column name variations
      const studentId = row['Student_ID'] || row['student_id'] || row['Student ID'];
      const studentName = row['Student_Name'] || row['student_name'] || row['Student Name'];
      const totalMarks = parseInt(row['Total_Marks'] || row['total_marks'] || row['Total Marks']);
      const marksObtained = parseInt(row['Marks_Obtained'] || row['marks_obtained'] || row['Marks Obtained']);
      
      if (studentId && studentName && !isNaN(totalMarks) && !isNaN(marksObtained)) {
        const percentage = (marksObtained / totalMarks) * 100;
        
        const student = new Student({
          student_id: studentId,
          student_name: studentName,
          total_marks: totalMarks,
          marks_obtained: marksObtained,
          percentage: Math.round(percentage * 100) / 100
        });
        
        students.push(student);
      }
    }
    
    if (students.length === 0) {
      return res.status(400).json({ error: 'No valid student data found in file' });
    }
    
    await Student.insertMany(students);
    
    res.json({ 
      message: 'File uploaded and processed successfully',
      count: students.length,
      students: students
    });
    
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all students with pagination
app.get('/api/students', async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ 
        error: 'Database not available. Please ensure MongoDB is running.',
        students: [],
        totalCount: 0,
        totalPages: 0,
        currentPage: 1
      });
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    
    const totalCount = await Student.countDocuments();
    const totalPages = Math.ceil(totalCount / limit);
    
    const students = await Student.find()
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit);
    
    res.json({
      students,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Get students error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get student by ID
app.get('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json(student);
  } catch (error) {
    console.error('Get student error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update student
app.put('/api/students/:id', async (req, res) => {
  try {
    const { student_name, total_marks, marks_obtained } = req.body;
    
    if (!student_name || !total_marks || !marks_obtained) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    
    const percentage = (marks_obtained / total_marks) * 100;
    
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      {
        student_name,
        total_marks,
        marks_obtained,
        percentage: Math.round(percentage * 100) / 100
      },
      { new: true }
    );
    
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    
    res.json(student);
  } catch (error) {
    console.error('Update student error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete student
app.delete('/api/students/:id', async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);
    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }
    res.json({ message: 'Student deleted successfully' });
  } catch (error) {
    console.error('Delete student error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get upload history (simplified - just count of students)
app.get('/api/history', async (req, res) => {
  try {
    const count = await Student.countDocuments();
    const latestUpload = await Student.findOne().sort({ created_at: -1 });
    
    res.json({
      totalStudents: count,
      lastUpload: latestUpload ? latestUpload.created_at : null
    });
  } catch (error) {
    console.error('Get history error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({ error: error.message });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
