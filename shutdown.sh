#!/usr/bin/env bash

echo "Shutting down Knowledge LLM servers..."

# 1. Stop processes listening on port 8000 (Backend)
PID_BACKEND=$(lsof -t -i :8000)
if [ -n "$PID_BACKEND" ]; then
    # lsof -t can return multiple line-separated PIDs
    for pid in $PID_BACKEND; do
        echo "Stopping backend service (PID: $pid)..."
        kill -9 "$pid" 2>/dev/null
    done
else
    echo "No backend services found on port 8000."
fi

# 2. Stop processes listening on port 5173 (Frontend)
PID_FRONTEND=$(lsof -t -i :5173)
if [ -n "$PID_FRONTEND" ]; then
    for pid in $PID_FRONTEND; do
        echo "Stopping frontend service (PID: $pid)..."
        kill -9 "$pid" 2>/dev/null
    done
else
    echo "No frontend services found on port 5173."
fi

echo "Shutdown complete!"
