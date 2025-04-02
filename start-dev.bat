@echo off
echo Démarrage du serveur de développement...
start cmd /k "npm run dev"
start cmd /k "node src/server/socket.ts"
pause 