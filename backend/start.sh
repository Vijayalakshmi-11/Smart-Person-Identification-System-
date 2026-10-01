#!/bin/bash

echo "Starting Missing Person Tracker Backend Server..."
echo "=============================================="

if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

echo "Installing dependencies..."
pip install -r requirements.txt

echo "Starting FastAPI server on http://0.0.0.0:8000"
echo "=============================================="
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
