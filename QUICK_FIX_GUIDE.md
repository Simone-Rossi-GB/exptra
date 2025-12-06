# Quick Fix Guide - ExpTra

## ✅ COMPLETED
1. Fixed signup error - wrapped category creation in try/catch
2. Created AppLayout component with shared sidebar and top menu
3. Updated Categories page to be full page with AppLayout

## 🔧 REMAINING FIXES

### 1. Fix Routing - Update all pages to use AppLayout

All pages need to wrap content in `<AppLayout>` component:

```jsx
import { AppLayout } from "../components/layout/AppLayout.jsx";

export function YourPage() {
  return (
    <AppLayout>
      {/* Your page content here */}
    </AppLayout>
  );
}
```

**Pages to update:**
- ✅ Categories.jsx (DONE)
- ❌ Dashboard.jsx (REMOVE sidebar, REMOVE CategoryManager popup, use AppLayout)
- ❌ Transactions.jsx (Add AppLayout wrapper)
- ❌ Analytics.jsx (Add AppLayout wrapper)
- ❌ Wallet.jsx (Add AppLayout wrapper)
- ❌ Settings.jsx (Add AppLayout wrapper)

### 2. Update Dashboard.jsx

**Remove:**
- Entire sidebar section (lines ~148-198)
- CategoryManager popup
- Navigation state and handlers

**Keep:**
- Stats cards
- Charts
- Expense history
- Add expense modal

**Add:**
- Import AppLayout
- Wrap content in `<AppLayout>`
- Remove `<div className="min-h-screen bg-background flex">` wrapper

Example structure:
```jsx
import { AppLayout } from "../components/layout/AppLayout.jsx";

export function Dashboard() {
  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Stats cards */}
        {/* Charts */}
        {/* Expense history */}
      </div>
    </AppLayout>
  );
}
```

### 3. Check Browser Console

Open browser DevTools (F12) and check:
1. **Console tab** - Look for errors and navigation logs
2. **Network tab** - Check if PocketBase requests are being made
3. **Application tab** -> Local Storage - Check if auth token is stored

Common issues:
- CORS errors: Need to configure PocketBase CORS settings
- 404 errors: Check PocketBase URL is correct (`https://exptra.ddns.net`)
- Auth errors: Check if user is authenticated

### 4. Test Navigation

After applying AppLayout to all pages:
1. Login with existing user
2. Click sidebar menu items
3. Check if URL changes (should see `/dashboard`, `/transactions`, etc.)
4. Check if page content updates

### 5. PocketBase CORS Configuration

If you see CORS errors in console, add this to PocketBase settings:
1. Open PocketBase admin (`https://exptra.ddns.net/_/`)
2. Settings -> Application
3. Add to "Allowed origins": `http://localhost:5173` (your Vite dev server)
