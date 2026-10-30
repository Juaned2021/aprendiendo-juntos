#!/bin/bash
# Script de preparación para despliegue en Vercel
# Uso: ./prepare-vercel.sh

echo "🚀 Preparando Plataforma Escolar para Vercel..."
echo ""

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json no encontrado"
    echo "   Asegúrate de ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# 2. Limpiar builds anteriores
echo "🧹 Limpiando builds anteriores..."
rm -rf dist
rm -rf node_modules/.vite

# 3. Verificar linting
echo "📝 Verificando linting..."
npm run lint
if [ $? -ne 0 ]; then
    echo "❌ Errores de linting detectados"
    exit 1
fi

# 4. Construir proyecto
echo "🔨 Construyendo proyecto..."
npm run build
if [ $? -ne 0 ]; then
    echo "❌ Error en el build"
    exit 1
fi

# 5. Verificar que vercel.json existe
if [ ! -f "vercel.json" ]; then
    echo "⚠️  Advertencia: vercel.json no encontrado"
    echo "   Asegúrate de tener vercel.json en la raíz"
fi

# 6. Verificar .gitignore
if ! grep -q "node_modules" .gitignore; then
    echo "⚠️  Advertencia: node_modules no está en .gitignore"
fi

# 7. Mostrar status de git
echo ""
echo "📦 Status del repositorio:"
git status

echo ""
echo "✅ Preparación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. git add ."
echo "2. git commit -m 'Preparar para Vercel'"
echo "3. git push origin main"
echo "4. Ve a https://vercel.com/dashboard y connecta tu repo"
echo ""
echo "Variables de entorno a configurar en Vercel:"
echo "  - VITE_API_URL: https://api.tudominio.com/api (reemplaza con tu URL)"
