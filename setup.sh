#!/bin/bash

echo "🔧 Tool Parts Finder - Setup Script"
echo "===================================="
echo ""

# Check prerequisites
echo "✅ Checking prerequisites..."

# Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.11+"
    exit 1
fi

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 20+"
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Backend setup
echo "🐍 Setting up backend..."
cd backend

# Create virtual environment
if [ ! -d "venv" ]; then
    python3 -m venv venv
    echo "✅ Virtual environment created"
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
echo "✅ Backend dependencies installed"

# Create .env if not exists
if [ ! -f ".env" ]; then
    cp .env.example .env
    echo "⚠️  Created .env file - please edit with your MongoDB Atlas URI and OpenAI API key"
fi

cd ..

# Frontend setup
echo ""
echo "⚛️  Setting up frontend..."
cd frontend

# Install dependencies
npm install
echo "✅ Frontend dependencies installed"

cd ..

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit backend/.env with your MongoDB Atlas URI"
echo "2. Start backend: cd backend && source venv/bin/activate && uvicorn app.main:app --reload"
echo "3. Start frontend (in new terminal): cd frontend && npm run dev"
echo ""
echo "🌐 Access the app at: http://localhost:5173"
echo "📖 Read README.md for detailed documentation"
