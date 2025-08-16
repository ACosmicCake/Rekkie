@echo off
echo Starting backend and frontend servers...

REM --- Start the backend server in a new Anaconda Prompt window ---
REM NOTE: You may need to change "%USERPROFILE%\anaconda3" to your actual Anaconda installation path.
set ANACONDA_PATH=%USERPROFILE%\anaconda3
start "Backend (Anaconda)" cmd /k "call %ANACONDA_PATH%\Scripts\activate.bat && pipenv run uvicorn pulse_discover.backend.main:app --reload"

REM --- Start the frontend server in a new standard command prompt window ---
start "Frontend" cmd /k "cd pulse_discover\frontend && npm install && npm run dev"