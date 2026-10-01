@echo off

echo Starting Missing Person Tracker Backend Server...
echo ==============================================

if not exist "venv\" (
    echo Creating virtual environment...
    python -m venv venv
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing dependencies...
pip install -r requirements.txt

echo Starting FastAPI server on http://0.0.0.0:8000
echo ==============================================
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
