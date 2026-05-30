# Vite + React + TypeScript + MUI Boilerplate

[![CI](https://github.com/pavel-anisimov/vite-react-mui-boilerplate/actions/workflows/ci.yml/badge.svg)](https://github.com/pavel-anisimov/vite-react-mui-boilerplate/actions/workflows/ci.yml)
![Node](https://img.shields.io/badge/node-20.x-green)
![TypeScript](https://img.shields.io/badge/typescript-5.x-blue)
![React](https://img.shields.io/badge/react-19.x-61dafb)
![Vite](https://img.shields.io/badge/vite-6.x-646cff)
![MUI](https://img.shields.io/badge/mui-7.x-007FFF)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Code style: Biome](https://img.shields.io/badge/code%20style-biome-ff69b4)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
<!-- ![Bundle size](https://img.shields.io/bundlephobia/minzip/vite-react-mui-boilerplate) -->

A modern boilerplate project built with **Vite 8**, **React 19**, **TypeScript 6**, and **MUI 9**, featuring:

- **ESLint v9 flat config** (strict rules: `unicorn`, `regexp`, `security`, `import-x`)
- **Biome** (formatter-only, fast replacement for Prettier)
- **Vitest** + Testing Library
- **TanStack Query** (+ Devtools in dev)
- **i18next** with EN/RU/PL locales
- **Husky + lint-staged + Commitlint**
- **GitHub Actions** CI (typecheck → lint → format → test → build)

---

## 🔧 Requirements
- Node.js **20.x** (see `.nvmrc`)
- npm 10+

---

## 🚀 Quick Start
```bash
npm install
npm run dev
```

## 📜 Scripts
- `dev` — run Vite dev server with HMR
- `build` — build for production
- `preview` — preview production build locally
- `test` / `test:watch` — run unit tests with Vitest
- `typecheck` — run TypeScript type checking
- `lint` / `lint:fix` — run ESLint (flat config)
- `format` / `format:check` — run Biome for formatting
- `check` — run full pipeline: typecheck → lint → format → tests
- `prepare` — install Husky hooks


## 🌐 Environment Variables
Create `.env.local` (already in `.gitignore`):

```dotenv
VITE_API_URL=http://localhost:8000
```


## 🌍 i18n
Languages supported: **English**, **Russian**, **Polish**.
Switching via AppBar dropdown (Translate icon → flags + labels).
Uses **i18next** + `react-i18next` with auto language detection.

## 🧪 Testing
- **Vitest** with jsdom
- **@testing-library/react**
- Configured in `src/setupTests.ts`
- Example tests in `src/tests/`

Run:
```bash
npm run test
```

## 🔐 License
MIT — see [LICENSE](LICENSE).

## 📌 Roadmap
- [ ] Authentication & JWT (FastAPI backend integration)
- [ ] RBAC (roles & permissions)
- [ ] CRUD example (e.g., posts) with MUI DataGrid + forms
- [ ] OpenAPI → TypeScript client generation
- [ ] Deployment configs (Docker Compose, optional Kubernetes)
