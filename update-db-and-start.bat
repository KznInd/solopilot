@echo off
echo Nettoyage des fichiers temporaires...
if exist node_modules\.prisma rmdir /s /q node_modules\.prisma
if exist node_modules\.next rmdir /s /q node_modules\.next
if exist node_modules\@next rmdir /s /q node_modules\@next
if exist node_modules\@tailwindcss rmdir /s /q node_modules\@tailwindcss
if exist prisma\migrations rmdir /s /q prisma\migrations
echo.

echo Installation des dépendances...
call npm install --legacy-peer-deps
echo.

echo Réinitialisation de la base de données...
call npx prisma db push --force-reset
echo.

echo Application des migrations de la base de données...
call npx prisma generate
call npx prisma migrate dev --name initial
echo.

echo Démarrage du serveur de développement...
call npm run dev

echo.
echo Appuyez sur une touche pour fermer...
pause > nul 