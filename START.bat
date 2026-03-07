@echo off
echo.
echo  SkillsMirage — India Workforce Intelligence
echo  DevxLabs Hackathon 2025
echo  [Groq Llama 3.3 70B powered chatbot]
echo ─────────────────────────────────────────────
echo.

REM ── Load API keys from .env file ──────────────────────────────
if exist "%~dp0.env" (
    for /f "usebackq tokens=1,* delims==" %%A in ("%~dp0.env") do (
        REM Skip comment lines starting with #
        echo %%A | findstr /b "#" >nul || set "%%A=%%B"
    )
)

if "%GROQ_API_KEY%"=="" (
    echo  No GROQ_API_KEY found in .env file.
    echo  Create a .env file with: GROQ_API_KEY=your_key_here
    echo  Get a free Groq key: https://console.groq.com/keys
    echo.
)

echo  [1/2] Installing Python dependencies...
pip install flask flask-cors groq --quiet

echo.
echo  [2/2] Starting Flask backend on http://localhost:5000 ...
start "" cmd /k "set GROQ_API_KEY=%GROQ_API_KEY% && python app.py"

echo  Waiting for backend to start...
timeout /t 3 /nobreak >nul

echo.
echo  [3/3] Opening frontend in browser...
start "" "%~dp0frontend\index.html"

echo.
echo ─────────────────────────────────────────────────────────────
echo  ✅  SkillsMirage is LIVE!
echo      Frontend  →  frontend\index.html
echo      Backend   →  http://localhost:5000/api/health
echo      Chatbot   →  Gemini 2.0 Flash (grounded in worker data + L1)
echo ─────────────────────────────────────────────────────────────
echo.
pause
