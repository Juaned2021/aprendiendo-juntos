# Carpeta de Imágenes

## Estructura

```
public/images/
├── logos/          # Logos de la plataforma
├── backgrounds/    # Imágenes de fondo
└── icons/          # Iconos y elementos UI
```

## Uso en componentes

```jsx
// Importar desde public
<img src="/images/logos/logo.png" alt="Logo" />

// O con import
import logo from '/images/logos/logo.png';
<img src={logo} alt="Logo" />
```

## Formatos recomendados
- Logos: PNG con transparencia
- Backgrounds: JPG o WebP
- Icons: SVG o PNG

## Optimización
- Comprimir imágenes antes de subir
- Usar WebP cuando sea posible
- Tamaño máximo recomendado: 500KB por imagen
