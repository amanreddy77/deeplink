#!/bin/bash

echo "🚀 Setting up Student Grade Management System Environment"
echo "=================================================="

# Create .env file for backend
echo "📝 Creating .env file for backend..."
cat > backend/.env << EOF
MONGODB_URI=mongodb://localhost:27017/student-grades
PORT=6000
NODE_ENV=development
EOF

echo "✅ Backend .env file created"

# Create .env file for frontend
echo "📝 Creating .env file for frontend..."
cat > frontend/.env << EOF
REACT_APP_API_URL=http://localhost:6000
EOF

echo "✅ Frontend .env file created"

echo ""
echo "🔧 Environment setup complete!"
echo ""
echo "To start the application:"
echo "1. Start MongoDB: brew services start mongodb-community"
echo "2. Start backend: cd backend && npm start"
echo "3. Start frontend: cd frontend && npm start"
echo ""
echo "The application will be available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend: http://localhost:6000"
