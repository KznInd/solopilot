@echo off
echo Installation des dépendances...
npm install framer-motion react-hook-form @hookform/resolvers yup --legacy-peer-deps
echo.
echo Démarrage du serveur de développement...
npm run dev
pause 