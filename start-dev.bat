@echo off
echo Starting backend and frontend servers...

REM Start the backend server in a new window
start "Backend" cmd /k "cd pulse_discover && pipenv run uvicorn backend.main:app --reload"

REM Start the frontend server in a new window
start "Frontend" cmd /k "cd pulse_discover\frontend && npm install && npm run dev"
