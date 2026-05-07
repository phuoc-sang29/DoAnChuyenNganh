@echo off
title SaHa System Control Panel
color 0b


echo     KHOI DONG TOAN BO HE THONG SAHA (3 IN 1)

echo.

echo [1/3] Dang bat Backend C#...
start "Backend C# (Cổng 5246)" cmd /k "cd backend-saha && echo === LOG LỖI BACKEND C# === && dotnet run"

echo [2/3] Dang bat Frontend ReactJS...
start "Frontend React (Cổng 5173)" cmd /k "cd frontend-saha && echo === LOG LỖI FRONTEND === && npm run dev"

echo [3/3] Dang bat Backend AI Python...
start "Backend AI Python" cmd /k "cd saha-backend-ai && echo === LOG LỖI BACKEND AI === && python chatbot.py"

echo.
echo Da mo 3 cua so Terminal.

pause