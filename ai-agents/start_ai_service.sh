#!/bin/bash

# AidRoute AI Service Startup Script
# Starts the Python AI agent API bridge server

set -e

echo "╔══════════════════════════════════════════════════════════════════╗"
echo "║              AidRoute AI Service Startup                         ║"
echo "╚══════════════════════════════════════════════════════════════════╝"
echo ""

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "📦 Upgrading pip..."
pip install --upgrade pip --quiet

# Install requirements
echo "📦 Installing Python dependencies..."
pip install -r requirements.txt --quiet

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cat << EOF > .env
# AidRoute AI Service Configuration

# API Keys (optional - add your keys here)
OPENAI_API_KEY=your_openai_key_here
ANTHROPIC_API_KEY=your_anthropic_key_here

# Blockchain (optional)
ETHEREUM_RPC_URL=https://sepolia.infura.io/v3/your_key
PRIVATE_KEY=your_private_key_here

# Service Configuration
AI_SERVICE_PORT=5001
FLASK_DEBUG=false
EOF
    echo "✅ .env file created. Please update with your API keys if needed."
fi

# Check if port is available
PORT=${AI_SERVICE_PORT:-5001}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $PORT is already in use!"
    echo "   Killing existing process..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "🚀 Starting AI API Bridge Server..."
echo "   Press Ctrl+C to stop"
echo ""

# Start the API bridge server
cd src
python api_bridge.py
