#!/usr/bin/env bash

echo "========================================="
echo "   Launching NeMo Studio UI              "
echo "========================================="

# Function to clean up background processes on exit
cleanup() {
    echo -e "\nShutting down servers..."
    pkill -P $$ 2>/dev/null || true
    kill $(jobs -p) 2>/dev/null || true
    exit
}

# Trap Ctrl+C (SIGINT) and exit
trap cleanup SIGINT SIGTERM EXIT

# Start Backend
echo "[1/2] Installing backend dependencies and starting API..."
cd backend
if [ -d "../.venv" ]; then
    source ../.venv/bin/activate
fi
pip install -q fastapi uvicorn pydantic
uvicorn app.main:app --reload --port 8000 &
cd ..

# Start Frontend
echo "[2/2] Installing frontend dependencies and starting App..."
cd frontend
npm install --no-audit --no-fund --quiet
npm run dev -- --host &
cd ..

echo "========================================="
echo "   All systems go!                       "
echo "   Frontend: http://localhost:5173       "
echo "   Backend:  http://127.0.0.1:8000       "
echo "   Press Ctrl+C to stop all servers.     "
echo "========================================="

# Keep the script running and output logs
wait
