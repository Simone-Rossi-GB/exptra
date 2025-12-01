# ExpenseTracker

Personal expense tracking application built with React, Tauri, and PocketBase.

## Features

- 💰 Track expenses with categories
- 📊 Visualize spending with charts
- 🔐 Multiple authentication methods (Email, Google, GitHub)
- 🌓 Dark mode support
- 🖥️ Desktop app (Tauri) + Web app
- 📱 Responsive design

## Tech Stack

- **Frontend**: React 19 + Vite
- **Desktop**: Tauri 2
- **Backend**: PocketBase (self-hosted)
- **Database**: SQLite (via PocketBase)
- **Auth**: PocketBase Auth + OAuth2 (Google, GitHub)

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PocketBase server running (see backend setup)
- OAuth credentials (for Google/GitHub login)

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd exptra
```

2. Install dependencies:
```bash
npm install
```

3. Setup environment variables:
```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local and fill in your actual values
# NEVER commit .env.local to Git!
```

4. Configure your OAuth credentials in `.env.local`:
   - See [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) for OAuth setup instructions
   - Get Google Client ID/Secret from Google Cloud Console
   - Get GitHub Client ID/Secret from GitHub Developer Settings

### Development

Run the development server:
```bash
npm run dev
```

Run Tauri desktop app:
```bash
npm run tauri:dev
```

### Build

Build for production:
```bash
npm run build
```

Build Tauri app:
```bash
npm run tauri:build
```

## Environment Variables

All environment variables must be prefixed with `VITE_` to be exposed to the frontend.

Required variables (see `.env.example`):
- `VITE_POCKETBASE_URL` - Your PocketBase server URL
- `VITE_GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `VITE_GITHUB_CLIENT_ID` - GitHub OAuth Client ID

**⚠️ SECURITY NOTE**:
- Never commit `.env.local` or any file containing real credentials
- All `VITE_*` variables are exposed in the frontend bundle
- Sensitive secrets (like Client Secrets) should be handled server-side only

## Database Schema

See PocketBase collections:
- `Auth` - Users with multi-provider authentication
- `linked_auth_providers` - Track multiple auth methods per user
- `categories` - Expense categories
- `expenses` - Expense records

For detailed schema, check the backup in `docs/` or PocketBase Admin UI.

## Documentation

- [DESIGN_GUIDE.md](./DESIGN_GUIDE.md) - Frontend design guidelines and resources
- [doc.md](./doc.md) - Original project requirements

## Contributing

This is a personal project, but suggestions are welcome via issues.

## License

MIT

---

**Note**: This project is for personal use. OAuth credentials and database backups are not included in the repository for security reasons.
