@echo off
chcp 65001 >nul
title Сайт Анастасии Старшиновой - сервер
cd /d "%~dp0"
if not exist node_modules (
  echo Первый запуск: устанавливаю зависимости...
  call npm install
)
echo Собираю боевую версию (она в разы быстрее dev-режима)...
call npx vite build
if errorlevel 1 (
  echo Сборка не удалась.
  pause
  exit /b 1
)
echo Запускаю сайт. Окно не закрывайте. Остановить: Ctrl+C.
call npx vite preview --host 127.0.0.1 --port 4173 --strictPort --open
pause
