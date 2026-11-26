import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { transform as lightningTransform } from 'lightningcss';
import path from 'path';
import { defineConfig, type Plugin } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

function transformCssForMobileCompat(code: string, id: string): string {
  // Strip CSS Color 4 gradient interpolation spaces (e.g. `to right in oklab`) unsupported by Android/Samsung WebViews < Chrome 111
  const normalized = code.replace(/\s+in\s+(?:oklab|oklch|srgb|hsl|hwb)\b/gi, '');
  const result = lightningTransform({
    filename: id,
    code: Buffer.from(normalized),
    minify: false,
    targets: {
      chrome: 88 << 16,
      android: 88 << 16,
      safari: 14 << 16,
      ios_saf: 14 << 16,
      samsung: 14 << 16,
    },
  });
  return Buffer.from(result.code).toString('utf8');
}

function basitMobileCssCompat(): Plugin {
  return {
    name: 'basit-mobile-css-compat',
    transform(code, id) {
      if (!id.endsWith('.css') && !id.includes('.css?')) return null;
      if (/[?&](?:raw|url|inline)\b/.test(id)) return null;
      if (!code.includes('oklch') && !code.includes('oklab')) return null;
      if (code.includes('__vite__css') || /^\s*(?:import|export)\s/m.test(code)) return null;
      return {
        code: transformCssForMobileCompat(code, id.split('?')[0]),
        map: null,
      };
    },
    generateBundle(_options, bundle) {
      for (const [fileName, asset] of Object.entries(bundle)) {
        if (fileName.endsWith('.css') && asset.type === 'asset' && typeof asset.source === 'string') {
          if (asset.source.includes('oklch') || asset.source.includes('oklab')) {
            const cleaned = asset.source.replace(/\s+in\s+(?:oklab|oklch|srgb|hsl|hwb)\b/gi, '');
            const result = lightningTransform({
              filename: fileName,
              code: Buffer.from(cleaned),
              minify: true,
              targets: {
                chrome: 88 << 16,
                android: 88 << 16,
                safari: 14 << 16,
                ios_saf: 14 << 16,
                samsung: 14 << 16,
              },
            });
            asset.source = Buffer.from(result.code).toString('utf8');
          }
        }
      }
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      basitMobileCssCompat(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'pwa-192x192.png'],
        manifest: {
          id: '/',
          name: 'BASIT | باسط — منظومة الإعاشة والمزايا للشركة الوطنية اللوجستية',
          short_name: 'BASIT | باسط',
          description: 'الذراع الرقمي للشركة الوطنية اللوجستية لإدارة الإعاشة والتغذية للمصانع والشركات والترفيه والمزايا والخدمات المجتمعية',
          theme_color: '#852BEB',
          background_color: '#FAF9FC',
          display: 'standalone',
          start_url: '/',
          scope: '/',
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          // Precache strictly the minimal App Shell (< 750 KB/file) for fast installs & free-tier publish limits
          cleanupOutdatedCaches: true,
          maximumFileSizeToCacheInBytes: 750 * 1024,
          globPatterns: [
            'index.html',
            'habe.html',
            'manifest*.webmanifest',
            'assets/main-*.js',
            'assets/habe-*.js',
            'assets/vendor-react-*.js',
            'assets/rolldown-runtime-*.js',
            'assets/*.css',
          ],
          globIgnores: [
            '**/node_modules/**/*',
            '**/assets/aistudio/**',
            '**/assets/branding/**',
            '**/assets/catering/**',
            '**/assets/alain/**',
            '**/*.woff',
            '**/*.woff2',
            '**/*.svg',
            '**/*.png',
            '**/*.jpg',
            '**/*.jpeg',
            '**/*.webp',
            '**/*.map',
            '**/vendor-pdf*',
            '**/vendor-canvas*',
            '**/vendor-charts*',
            '**/vendor-three*',
            '**/vendor-firebase*',
            '**/vendor-qr*',
          ],
          navigateFallbackDenylist: [/^\/habe/],
          runtimeCaching: [
            {
              urlPattern: /\/assets\/.*\.js$/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'basit-lazy-chunks',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 7,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:woff2?|ttf|otf)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'basit-local-fonts',
                expiration: {
                  maxEntries: 24,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /\.(?:png|jpg|jpeg|webp|svg|ico)$/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'catering-images-cache',
                expiration: {
                  maxEntries: 50,
                  maxAgeSeconds: 60 * 60 * 24 * 30,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.(?:googleapis|gstatic)\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          // Disable SW in dev preview to avoid blocking iFrame hot updates & live testing
          enabled: false,
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(import.meta.dirname, '.'),
      },
    },
    build: {
      sourcemap: false,
      cssCodeSplit: true,
      chunkSizeWarningLimit: 600,
      rolldownOptions: {
        input: {
          main: path.resolve(import.meta.dirname, 'index.html'),
          habe: path.resolve(import.meta.dirname, 'habe.html'),
        },
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('scheduler')) {
                return 'vendor-react';
              }
              if (id.includes('three')) {
                return 'vendor-three';
              }
              if (id.includes('recharts') || id.includes('d3-') || id.includes('victory-vendor')) {
                return 'vendor-charts';
              }
              if (id.includes('jspdf')) {
                return 'vendor-pdf';
              }
              if (
                id.includes('html-to-image') ||
                id.includes('html2canvas') ||
                id.includes('canvg') ||
                id.includes('dompurify')
              ) {
                return 'vendor-canvas';
              }
              if (id.includes('firebase') || id.includes('@firebase')) {
                return 'vendor-firebase';
              }
              if (id.includes('qrcode')) {
                return 'vendor-qr';
              }
              if (id.includes('lucide-react') || id.includes('motion')) {
                return 'vendor-ui';
              }
            }
          },
        },
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
