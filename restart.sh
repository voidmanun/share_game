#!/bin/bash
echo "Stopping existing Vite dev server..."
# Find and kill any running Vite processes
pkill -f "vite"
sleep 1

echo "Starting new Vite dev server on host 0.0.0.0..."
# Start Vite with --host to bind to all interfaces and allow external access
npm run dev -- --host 0.0.0.0 &
echo "Server restarted."
