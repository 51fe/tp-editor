import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    const target = 'http://localhost:4000';
    return {
      base: '/',
      server: {
        open: true,
        hmr: true,
        proxy: {
          // api
          '/socket.io': {
            target: `${target}`,
            changeOrigin: true
          },
          // custom and upload
          '^/custom': {
            target: `${target}`,
            changeOrigin: true
          },
          // assets
          '^/.+.(png|jpg|gif|jpeg|bmp|ico|svg|json|obj|mtl|mp3|mp4|zip)(?!.js)': {
            target: `${target}`,
            changeOrigin: true
          },
          // preview
          '^/.+.html?.+.json$': {
            target: `${target}`,
            changeOrigin: true
          }
        }
      }
    }
  } else {
    return {
      base: './',
      build: {
        outDir: '../server/public',
        assetsDir: '',
        rollupOptions: {
          input: {
            test: resolve('index.html') ,
            index3d: resolve('3d.html')
          }
        }
      }
    }
  }
})
