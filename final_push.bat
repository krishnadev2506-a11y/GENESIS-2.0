@echo off
git remote set-url origin https://github.com/krishnadev2506-a11y/GENESIS-2.0.git
if %errorlevel% neq 0 git remote add origin https://github.com/krishnadev2506-a11y/GENESIS-2.0.git
git branch -M main
git push -u origin main -f
