import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    electron([
      {
        // Main process entry file
        entry: 'electron/main.js',
      }
    ]),
    renderer(),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
      },
      output: {
        manualChunks: {
          'vendor': ['vue', 'vue-router', 'vuex'],
        }
      }
    },
    // 启用源码映射，方便调试
    sourcemap: true,
  },
  server: {
    port: 5173,
    strictPort: true,
    // 启用热更新
    hmr: true,
  },
});
