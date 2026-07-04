@echo off
title AuraFit Baslatici
echo AuraFit baslatiliyor, lutfen bekleyin...
cd /d "c:\Users\Gaming\Desktop\Projects\gym"
start /min cmd /c "npm run dev"
echo Gelistirme sunucusu arka planda baslatildi.
echo Tarayici aciliyor...
timeout /t 3 /nobreak >nul
start http://localhost:5173
exit
