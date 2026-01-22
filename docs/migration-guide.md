# Webpack から Vite への移行ガイド

## 概要

Firebase演習プロジェクトのビルドツールを **Webpack** から **Vite** に移行しました。
本ドキュメントでは、変更内容と教材更新が必要な箇所をまとめています。

---

## 移行の背景

| 課題 | 説明 |
|------|------|
| 起動速度 | Webpackは起動に数秒〜十数秒かかる |
| 設定の複雑さ | webpack.config.js の設定が初学者には難しい |
| 依存パッケージの多さ | browser-sync, npm-run-all など複数のツールが必要 |
| 業界トレンド | Viteが主流になりつつある |

---

## 技術スタックの比較

### 旧: Webpack版

```json
{
  "scripts": {
    "webpack": "webpack --watch --mode development",
    "browser-sync": "browser-sync start --server --serveStatic dist --files dist/*.*",
    "dev": "npm-run-all -p webpack browser-sync"
  },
  "devDependencies": {
    "browser-sync": "^3.0.4",
    "css-loader": "^7.1.2",
    "eslint": "^9.39.1",
    "eslint-config-prettier": "^10.1.8",
    "npm-run-all": "^4.1.5",
    "prettier": "^3.7.1",
    "style-loader": "^4.0.0",
    "webpack": "^5.103.0",
    "webpack-cli": "^6.0.1"
  }
}
```

### 新: Vite版

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "devDependencies": {
    "vite": "^6.0.0"
  }
}
```

### 比較表

| 項目 | Webpack版 | Vite版 |
|------|-----------|--------|
| devDependencies | 8個 | **1個** |
| 起動速度 | 数秒〜十数秒 | **数百ミリ秒** |
| HMR（ホットリロード） | 遅い | **瞬時** |
| 設定ファイル | webpack.config.js（必須） | vite.config.js（ほぼ不要） |
| CSSローダー | css-loader, style-loader が必要 | **不要（組み込み）** |
| 開発サーバー | browser-sync が必要 | **不要（組み込み）** |

---

## ディレクトリ構成の変更

### 旧: Webpack版

```
cloud-computing/
├── dist/                    # ビルド出力先 & HTMLの配置場所
│   ├── index.html
│   ├── todo.html
│   ├── main.js             # Webpackがバンドルしたファイル
│   └── ...
├── src/                     # ソースファイル
│   ├── index.js
│   ├── todo.js
│   ├── firebase.js
│   └── style.css
├── webpack.config.js
└── package.json
```

### 新: Vite版

```
cloud-computing-vite/
├── src/                     # HTML, JS, CSS をすべて集約
│   ├── index.html
│   ├── main.js
│   ├── todo.html
│   ├── todo.js
│   ├── user.html
│   ├── user.js
│   ├── practice-event.html
│   ├── practice-event.js
│   ├── practice-storage.html
│   ├── practice-storage.js
│   ├── firebase.js
│   └── style.css
├── dist/                    # ビルド出力先（npm run build で生成）
├── docs/                    # ドキュメント
├── vite.config.js
└── package.json
```

### 主な変更点

1. **HTMLファイルの場所**: `dist/` → `src/`
2. **ソースとHTMLの統合**: 同じディレクトリに配置してパス参照をシンプルに
3. **distは自動生成**: 開発時は不要、ビルド時のみ生成

---

## 開発コマンドの変更

### 旧: Webpack版

```bash
# 開発サーバー起動（webpack + browser-sync を並列実行）
npm run dev

# 内部で実行されるコマンド
# - webpack --watch --mode development
# - browser-sync start --server --serveStatic dist --files dist/*.*
```

### 新: Vite版

```bash
# 開発サーバー起動
npm run dev

# 本番用ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

---

## HTMLファイルの変更点

### 旧: Webpack版

```html
<!-- dist/index.html -->
<script src="main.js"></script>
```

- HTMLは `dist/` フォルダに手動配置
- JSはWebpackがバンドルした `main.js` を参照

### 新: Vite版

```html
<!-- src/index.html -->
<script type="module" src="./main.js"></script>
```

- HTMLは `src/` に配置
- **`type="module"`** を追加（ES Modules として読み込む）
- ソースのJSファイルを直接参照（Viteが自動で処理）

---

## JSファイルの変更点

### CSSのインポート

変更なし。両方とも同じ書き方：

```javascript
import './style.css';
```

### ページ遷移のパス

| 遷移先 | Webpack版 | Vite版 |
|--------|-----------|--------|
| ログイン画面 | `window.location.href = '/'` | `window.location.href = '/index.html'` |
| Todo画面 | `window.location.assign('todo.html')` | `window.location.assign('/todo.html')` |

---

## vite.config.js の設定

```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // srcをルートとして扱う
  root: 'src',

  // マルチページ設定
  build: {
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
```

---

## 教材更新が必要な箇所

### 1. 環境構築手順

| 項目 | 旧 | 新 |
|------|-----|-----|
| プロジェクト作成 | 手動でディレクトリ作成 | `npm create vite@latest` も選択肢に |
| npm install | 8パッケージ | 1パッケージ（firebase除く） |
| 設定ファイル作成 | webpack.config.js を詳しく解説 | vite.config.js は最小限の説明でOK |

### 2. 開発フロー

| 項目 | 旧 | 新 |
|------|-----|-----|
| 開発サーバー起動 | `npm run dev`（複数プロセス） | `npm run dev`（単一プロセス） |
| ファイル変更時 | 再バンドル → 自動リロード | **瞬時に反映** |
| ビルド | Webpackが自動実行 | `npm run build` を明示的に実行 |

### 3. HTMLファイルの書き方

- **`<script type="module">`** の説明を追加
- HTMLの配置場所が `dist/` から `src/` に変更

### 4. 削除できる説明

- webpack.config.js の詳細な設定解説
- css-loader, style-loader の役割説明
- browser-sync の設定説明
- npm-run-all の使い方

---

## 生徒にとってのメリット

1. **環境構築が簡単**: パッケージ数が大幅に減少
2. **起動が速い**: 待ち時間のストレスが軽減
3. **エラーが分かりやすい**: Viteのエラーメッセージは明確
4. **業界標準**: 実務でも使われているツールを学べる

---

## 注意点

- Vite 6.x を使用（2024年12月リリース）
- Node.js 18.x 以上が必要
- 古いブラウザ（IE等）はサポート外（教育環境では問題なし）

---

## 参考リンク

- [Vite 公式ドキュメント（日本語）](https://ja.vitejs.dev/)
- [Vite vs Webpack 比較記事](https://ja.vitejs.dev/guide/why.html)
