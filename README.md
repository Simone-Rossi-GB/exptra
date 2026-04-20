# Exptra — Expense Tracker

A personal expense tracking app with charts, categories, and multi-provider authentication. Runs as both a web app and a native desktop app (via Tauri).

![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Tauri](https://img.shields.io/badge/Tauri-24C8D8?style=flat-square&logo=tauri&logoColor=white)
![PocketBase](https://img.shields.io/badge/PocketBase-B8DBE4?style=flat-square&logo=pocketbase&logoColor=black)

---

## Features

- Track expenses with categories
- Visualize spending with charts
- Multi-provider authentication: Email, Google, GitHub (OAuth2)
- Dark mode
- Desktop app (Tauri) + web app from the same codebase
- Responsive design

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite |
| Desktop | Tauri 2 |
| Backend | PocketBase (self-hosted) |
| Database | SQLite (via PocketBase) |
| Auth | PocketBase Auth + OAuth2 (Google, GitHub) |
| CI | GitHub Actions (Windows build) |

---

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- A running PocketBase instance
- OAuth credentials for Google and/or GitHub

### Setup

```bash
# Install dependencies
npm install

# Copy env file and fill in your values
cp .env.example .env.local
```

Required environment variables:
```
VITE_POCKETBASE_URL=http://localhost:8090
VITE_GOOGLE_CLIENT_ID=...
VITE_GITHUB_CLIENT_ID=...
```

### Run

```bash
# Web app
npm run dev

# Desktop app
npm run tauri:dev
```

### Build

```bash
# Web
npm run build

# Desktop (Tauri)
npm run tauri:build
```

---

## Database Schema (PocketBase Collections)

| Collection | Description |
|------------|-------------|
| `Auth` | Users with multi-provider authentication |
| `linked_auth_providers` | Multiple auth methods per user |
| `categories` | Expense categories |
| `expenses` | Expense records |

---

## Project context

Personal project. OAuth credentials and database backups are not included in the repository.

**Author:** Simone Rossi
