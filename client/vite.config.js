const { resolve } = require('path');
const { defineConfig } = require('vite');
const port = 4000;
export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      base: '/',
      server: {
        open: true,
        hmr: true,
        proxy: {
          // api
          '/socket.io': {
            target: `ws://localhost:${port}`,
            changeOrigin: true
          },
          // assets
          '^/.+\.(png|jpg|gif|jpeg|bmp|ico|svg|json|obj|mtl|mp3|mp4|zip)(?!\.js)': {
            target: `ws://localhost:${port}`,
            changeOrigin: true
          },
          // custom and upload
          '^/custom': {
            target: `ws://localhost:${port}`,
            changeOrigin: true
          },
          // preview
          '^/.+\.html?.+json$': {
            target: `ws://localhost:${port}`,
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
            test: resolve(__dirname, 'index.html') ,
            index3d: resolve(__dirname, '3d.html')
          }
        }
      }
    }
  }
})
