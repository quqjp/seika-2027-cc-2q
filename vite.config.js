import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // srcをルートとして扱う
  root: 'src',
  // publicディレクトリの場所
  publicDir: resolve(__dirname, 'public'),
  // マルチページ設定
  build: {
    // 出力先をプロジェクトルートのdistに
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/index.html'),
        todo: resolve(__dirname, 'src/todo.html'),
        user: resolve(__dirname, 'src/user.html'),
        practiceEvent: resolve(__dirname, 'src/practice-event.html'),
        practiceStorage: resolve(__dirname, 'src/practice-storage.html'),
      },
    },
  },
  // 開発サーバー設定
  server: {
    port: 5173,
    open: '/index.html',
  },
});
