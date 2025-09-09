import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://deeplink-m00m.onrender.com';



function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStudent, setEditingStudent] = useState(null);
  const [editForm, setEditForm] = useState({
    student_name: '',
    total_marks: '',
    marks_obtained: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    limit: 50,
    hasNext: false,
    hasPrev: false
  });

  // Fetch students on component mount
  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/api/students?page=${page}&limit=50`);
      
      if (response.data.students) {
        // New paginated response
        setStudents(response.data.students);
        setPagination(response.data.pagination);
      } else {
        // Fallback for old response format
        setStudents(response.data);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalCount: response.data.length,
          limit: 50,
          hasNext: false,
          hasPrev: false
        });
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch students: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const response = await axios.post(`${API_BASE_URL}/api/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setSuccess(`File uploaded successfully! ${response.data.count} students processed.`);
      await fetchStudents();
    } catch (err) {
      setError('Upload failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (student) => {
    setEditingStudent(student._id);
    setEditForm({
      student_name: student.student_name,
      total_marks: student.total_marks.toString(),
      marks_obtained: student.marks_obtained.toString()
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError('');
      
      await axios.put(`${API_BASE_URL}/api/students/${editingStudent}`, editForm);
      
      setSuccess('Student updated successfully!');
      setEditingStudent(null);
      await fetchStudents();
    } catch (err) {
      setError('Update failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (studentId) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return;
    
    try {
      setLoading(true);
      setError('');
      
      await axios.delete(`${API_BASE_URL}/api/students/${studentId}`);
      
      setSuccess('Student deleted successfully!');
      await fetchStudents();
    } catch (err) {
      setError('Delete failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const cancelEdit = () => {
    setEditingStudent(null);
    setEditForm({ student_name: '', total_marks: '', marks_obtained: '' });
  };

  const handleClearAllData = async () => {
    if (!window.confirm('Are you sure you want to clear all student data? This action cannot be undone.')) return;
    
    try {
      setLoading(true);
      setError('');
      
      await axios.delete(`${API_BASE_URL}/api/students`);
      
      setSuccess('All student data cleared successfully!');
      await fetchStudents();
    } catch (err) {
      setError('Clear data failed: ' + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(newPage);
    }
  };

  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;

    const pages = [];
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-btn ${i === pagination.currentPage ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return (
      <div className="pagination">
        <button
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={!pagination.hasPrev}
          className="pagination-btn"
        >
          Previous
        </button>
        {pages}
        <button
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={!pagination.hasNext}
          className="pagination-btn"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Student Grade Management System</h1>
        <p>Upload Excel or CSV files to manage student grades</p>
      </header>

      <main className="App-main">
        {/* File Upload Section */}
        <section className="upload-section">
          <h2>Upload Student Data</h2>
          <div className="upload-container">
            <input
              type="file"
              accept=".xlsx,.csv"
              onChange={handleFileUpload}
              disabled={loading}
              className="file-input"
            />
            <p className="upload-hint">
              Supported formats: Excel (.xlsx) and CSV files
            </p>
          </div>
        </section>

        {/* Messages */}
        {error && <div className="message error">{error}</div>}
        {success && <div className="message success">{success}</div>}

        {/* Students Table */}
        <section className="students-section">
          <div className="section-header">
            <h2>Student Records</h2>
            <div className="header-actions">
              <div className="stats">
                <span>Total Students: {pagination.totalCount}</span>
                <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
                <span>Showing {students.length} students</span>
              </div>
              {pagination.totalCount > 0 && (
                <button 
                  onClick={handleClearAllData}
                  className="btn btn-clear"
                  disabled={loading}
                >
                  Clear All Data
                </button>
              )}
            </div>
          </div>

          {loading ? (
            <div className="loading">Loading...</div>
          ) : students.length === 0 ? (
            <div className="no-data">
              No student data found. Upload a file to get started.
            </div>
          ) : (
            <div className="table-container">
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student ID</th>
                    <th>Student Name</th>
                    <th>Total Marks</th>
                    <th>Marks Obtained</th>
                    <th>Percentage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => (
                    <tr key={student._id}>
                      <td>{student.student_id}</td>
                      <td>
                        {editingStudent === student._id ? (
                          <input
                            type="text"
                            value={editForm.student_name}
                            onChange={(e) => setEditForm({...editForm, student_name: e.target.value})}
                            className="edit-input"
                          />
                        ) : (
                          student.student_name
                        )}
                      </td>
                      <td>
                        {editingStudent === student._id ? (
                          <input
                            type="number"
                            value={editForm.total_marks}
                            onChange={(e) => setEditForm({...editForm, total_marks: e.target.value})}
                            className="edit-input"
                          />
                        ) : (
                          student.total_marks
                        )}
                      </td>
                      <td>
                        {editingStudent === student._id ? (
                          <input
                            type="number"
                            value={editForm.marks_obtained}
                            onChange={(e) => setEditForm({...editForm, marks_obtained: e.target.value})}
                            className="edit-input"
                          />
                        ) : (
                          student.marks_obtained
                        )}
                      </td>
                      <td>{student.percentage}%</td>
                      <td>
                        {editingStudent === student._id ? (
                          <div className="edit-actions">
                            <button onClick={handleEditSubmit} className="btn btn-save">Save</button>
                            <button onClick={cancelEdit} className="btn btn-cancel">Cancel</button>
                          </div>
                        ) : (
                          <div className="actions">
                            <button onClick={() => handleEdit(student)} className="btn btn-edit">Edit</button>
                            <button onClick={() => handleDelete(student._id)} className="btn btn-delete">Delete</button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {renderPagination()}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
