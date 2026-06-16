@echo off
title Lucca Birthday - Backend
echo.
echo  ========================================
echo   🎂 Lista de Presentes do Lucca - API
echo  ========================================
echo.
echo  Iniciando servidor backend...
echo  Acesse: http://localhost:3001
echo.
cd /d "%~dp0backend"
node --experimental-sqlite src/app.js
pause
