import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Enhanced Vite configuration for production optimization
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // React Fast Refresh configuration
      fastRefresh: true,
      // JSX runtime optimization
      jsxRuntime: 'automatic'
    }),
    tailwindcss(),
  ],
  
  // Dependency optimization
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'react-hook-form',
      'yup',
      'axios',
      'lodash-es',
      'date-fns',
      'framer-motion',
      'lucide-react',
      'recharts',
      'react-hot-toast',
      'zustand'
    ],
    exclude: ['react-signature-canvas'] // Exclude problematic dependencies
  },

  // Development server configuration
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        // Add proxy timeout
        timeout: 30000
      },
      '/uploads': {
        target: process.env.VITE_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        secure: false
      }
    },
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173
    },
    // Enable gzip compression for development
    middlewareMode: false
  },

  // Build configuration
  build: {
    // Production optimizations
    target: 'es2020',
    outDir: 'dist',
    assetsDir: 'assets',
    
    // Minification settings
    minify: mode === 'production' ? 'terser' : 'esbuild',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
        pure_funcs: mode === 'production' ? ['console.log', 'console.info'] : []
      },
      format: {
        comments: false
      }
    },
    
    // Source maps
    sourcemap: mode === 'development' ? 'inline' : false,
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // Rollup configuration
    rollupOptions: {
      // External dependencies (if needed)
      external: [],
      
      output: {
        // Manual chunk splitting for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('lodash') || id.includes('date-fns')) {
              return 'utils-vendor';
            }
            if (id.includes('mui') || id.includes('lucide-react')) {
              return 'ui-vendor';
            }
            if (id.includes('recharts') || id.includes('chart')) {
              return 'charts-vendor';
            }
            return 'vendor';
          }
          
          // App chunks
          if (id.includes('/pages/')) {
            return 'pages';
          }
          if (id.includes('/components/')) {
            return 'components';
          }
          if (id.includes('/services/')) {
            return 'services';
          }
        },
        
        // Asset file naming
        assetFileNames: (assetInfo) => {
          let extType = assetInfo.name.split('.').at(1);
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
            extType = 'img';
          } else if (/woff|woff2|ttf|eot/i.test(extType)) {
            extType = 'fonts';
          }
          return `assets/${extType}/[name]-[hash][extname]`;
        },
        
        // Chunk file naming
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        
        // Compact output
        compact: mode === 'production'
      }
    },
    
    // CSS optimization
    cssCodeSplit: true,
    cssMinify: mode === 'production' ? 'lightningcss' : 'esbuild',
    
    // Asset optimization
    assetsInlineLimit: 4096, // 4kb limit for inlining assets
    
    // Enable brotli compression for production
    reportCompressedSize: mode === 'production',
    
    // Module pre-bundling
    commonjsOptions: {
      include: [/node_modules/],
      extensions: ['.js', '.cjs']
    }
  },

  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __IS_DEVELOPMENT__: mode === 'development'
  },

  // Resolve configuration
  resolve: {
    alias: {
      '@': '/src',
      '@components': '/src/components',
      '@pages': '/src/pages',
      '@services': '/src/services',
      '@utils': '/src/utils',
      '@hooks': '/src/hooks',
      '@context': '/src/context'
    },
    extensions: ['.js', '.jsx', '.json', '.mjs']
  },

  // Preview server
  preview: {
    port: 4173,
    strictPort: true,
    host: true,
    // Enable gzip compression for preview
    proxy: {}
  }
}));