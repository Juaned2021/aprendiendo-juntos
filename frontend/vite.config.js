import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production'

  return {
    plugins: [react()],
    
    define: {
      'process.env.NODE_ENV': JSON.stringify(mode),
    },

    build: {
      outDir: 'dist',
      
      // Sourcemaps
      sourcemap: !isProduction,
      
      // Minificación
      minify: isProduction ? 'terser' : false,
      terserOptions: {
        compress: {
          drop_console: isProduction,
          drop_debugger: true,
        },
      },

      // Optimización de chunks
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            utils: ['axios', 'jspdf', 'jspdf-autotable', 'xlsx'],
          },
          
          entryFileNames: isProduction 
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          
          chunkFileNames: isProduction
            ? 'assets/[name]-[hash].js'
            : 'assets/[name].js',
          
          assetFileNames: isProduction
            ? 'assets/[name]-[hash][extname]'
            : 'assets/[name][extname]',
        }
      },

      reportCompressedSize: false,
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },

    // 🔥 Configuración DEFINITIVA para Cloudflare Tunnel
    server: {
      host: '0.0.0.0', // importante para exponer correctamente
      port: 3000,
      strictPort: false,

      // Permite cualquier subdominio de Quick Tunnel
      allowedHosts: [
        '.trycloudflare.com'
      ],
      
      proxy: {
        '/api': {
          target: 'https://localhost:7028',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
          timeout: 10000,
          ws: true,
        }
      }
    },

    resolve: {
      extensions: ['.js', '.jsx', '.json'],
    },
  }
})
