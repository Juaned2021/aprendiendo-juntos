 # 📦 Guía de Despliegue en Vercel - Plataforma Escolar

## 🚀 Paso a Paso: Despliegue en Vercel

### **PASO 1: Preparar tu Repositorio en GitHub**

1. Asegúrate de que tu código está en GitHub:
```bash
git status
git add .
git commit -m "Preparar para despliegue en Vercel"
git push origin main
```

2. Verifica que estos archivos estén en el repo:
   - ✅ `package.json` (con scripts: dev, build, lint, preview)
   - ✅ `vite.config.js` (configurado correctamente)
   - ✅ `vercel.json` (reescritura de rutas SPA) 
   - ✅ `src/` (código fuente)
   - ✅ `.gitignore` (excluye node_modules)

---

### **PASO 2: Conectar Vercel a GitHub**

1. Ve a https://vercel.com/dashboard
2. Haz click en **"Add New..." → "Project"**
3. Selecciona **"Import Git Repository"**
4. Busca tu repositorio `Plataforma-Escolar`
5. Click **"Import"**

---

### **PASO 3: Configurar Variables de Entorno en Vercel**

**IMPORTANTE:** Aquí configurarás la URL de tu API backend

1. En la página del proyecto, ve a **Settings** → **Environment Variables**
2. Añade esta variable:

```
Name: VITE_API_URL
Value: https://api.tudominio.com/api
    
   (Reemplaza "api.tudominio.com" con tu URL real del backend)
```

**Nota:** Si usas localhost durante pruebas:
```
VITE_API_URL=https://localhost:7028
```
(Solo funciona en desarrollo, no en producción Vercel)

3. Click **"Save"**

---

### **PASO 4: Iniciar Despliegue**

1. Click en **"Deploy"**
2. Vercel hará:
   - ✅ Detectar que es un proyecto Vite
   - ✅ Instalar dependencias (`npm install`)
   - ✅ Ejecutar build (`npm run build`)
   - ✅ Desplegar a CDN

3. Espera a que termine (suele ser 1-2 minutos)
4. Verás una URL como: `https://plataforma-escolar.vercel.app`

---

### **PASO 5: Verificar que Funciona**

1. Abre tu URL de Vercel
2. Prueba:
   - ✅ Página de login carga
   - ✅ Puedes entrar con tus credenciales
   - ✅ Las peticiones a la API funcionan
   - ✅ Puedes navegar entre páginas

**Si hay errores de CORS:**
- Ve a tu backend .NET
- Asegúrate de que `https://[tu-vercel-url].vercel.app` está en la lista de CORS permitidos
- Ejemplo en Program.cs:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("Production", policy =>
    {
        policy.WithOrigins("https://plataforma-escolar.vercel.app")
              .AllowAnyMethod()
              .AllowAnyHeader()
              .AllowCredentials();
    });
});
```

---

### **PASO 6: Despliegues Automáticos (Opcional)**

Con esto configurado, cada vez que hagas:
```bash
git push origin main
```

Vercel automáticamente:
1. Clona tu repo
2. Ejecuta `npm run build`
3. Despliega los cambios

**Sin hacer nada más.** 🎉

---

### **PASO 7: Configurar Dominio Personalizado (Opcional)**

Si tienes tu propio dominio:

1. En Vercel → **Settings** → **Domains**
2. Añade tu dominio (ej: `app.tudominio.com`)
3. Sigue las instrucciones de DNS
4. Espera propagación (5-48 horas)

---

## 🔍 Variables de Entorno por Ambiente

### **Desarrollo Local** (`.env.development`)
```
VITE_API_URL=https://localhost:7028
```

### **Producción en Vercel** (Dashboard → Environment Variables)
```
VITE_API_URL=https://api.tudominio.com/api
```

---

## ⚠️ Checklist Antes de Desplegar

- [ ] Backend está desplegado en producción
- [ ] Backend tiene CORS configurado para tu URL de Vercel
- [ ] Variables de entorno están en Vercel Dashboard
- [ ] Código está pusheado a `main` en GitHub
- [ ] `npm run build` funciona localmente sin errores
- [ ] `npm run lint` pasa sin errores
- [ ] Probaste login localmente

---

## 🆘 Troubleshooting

### **Error: "VITE_API_URL is not defined"**
→ Verifica que la variable está en Vercel → Settings → Environment Variables

### **Error CORS: "No 'Access-Control-Allow-Origin' header"**
→ Configura CORS en tu backend .NET para acepta la URL de Vercel

### **El build falla con "Cannot find module"**
→ Ejecuta `npm install` localmente y verifica que `package.json` está updated

### **Login no funciona después del deploy**
→ Verifica que `VITE_API_URL` en Vercel apunta a tu backend correcto

---

## 📊 Dashboard de Vercel

Una vez desplegado, puedes ver:
- **Analytics:** Visitas, performance
- **Deployments:** Historial de deploys
- **Settings:** Variables, dominios, builds
- **Logs:** Errores y outputs

---

## 🎯 Próximos Pasos

1. ✅ Desplegar en Vercel (esta guía)
2. ✅ Configurar dominio personalizado
3. ✅ Configurar SSL/HTTPS (automático en Vercel)
4. ✅ Monitoreo y analytics
5. ✅ Configurar CI/CD para testing automático

---

**¿Listo para desplegar?** 🚀
Sigue estos 7 pasos y tu app estará en vivo en minutos.
