#!/bin/bash
echo "Stopping existing Vite dev server..."
# Find and kill any running Vite processes
pkill -f "vite"
sleep 1

echo "Starting new Vite dev server on host 0.0.0.0 port 80..."
# Start Vite with --host to bind to all interfaces and allow external access
nohup npm run dev -- --host 0.0.0.0 --port 80 > run.log 2>&1 &
echo "Server restarted."
