@echo off
REM Script de preparación para despliegue en Vercel
REM Uso: prepare-vercel.bat

echo 🚀 Preparando Plataforma Escolar para Vercel...
echo.

REM 1. Verificar que estamos en el directorio correcto
if not exist "package.json" (
    echo ❌ Error: package.json no encontrado
    echo    Asegúrate de ejecutar este script desde la raíz del proyecto
    exit /b 1
)

REM 2. Limpiar builds anteriores
echo 🧹 Limpiando builds anteriores...
if exist "dist" rmdir /s /q dist
if exist "node_modules\.vite" rmdir /s /q node_modules\.vite

REM 3. Verificar linting
echo 📝 Verificando linting...
call npm run lint
if errorlevel 1 (
    echo ❌ Errores de linting detectados
    exit /b 1
)

REM 4. Construir proyecto
echo 🔨 Construyendo proyecto...
call npm run build
if errorlevel 1 (
    echo ❌ Error en el build
    exit /b 1
)

REM 5. Verificar que vercel.json existe
if not exist "vercel.json" (
    echo ⚠️  Advertencia: vercel.json no encontrado
    echo    Asegúrate de tener vercel.json en la raíz
)

REM 6. Verificar .gitignore
findstr /m "node_modules" .gitignore >nul
if errorlevel 1 (
    echo ⚠️  Advertencia: node_modules no está en .gitignore
)

REM 7. Mostrar status de git
echo.
echo 📦 Status del repositorio:
call git status

echo.
echo ✅ Preparación completada!
echo.
echo 📋 Próximos pasos:
echo 1. git add .
echo 2. git commit -m "Preparar para Vercel"
echo 3. git push origin main
echo 4. Ve a https://vercel.com/dashboard y connecta tu repo
echo.
echo Variables de entorno a configurar en Vercel:
echo   - VITE_API_URL: https://api.tudominio.com/api (reemplaza con tu URL)
echo.
pause
