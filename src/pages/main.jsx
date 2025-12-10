import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Import pages for SPA routing
import { Dashboard } from './Dashboard.jsx';
import { Transactions } from './Transactions.jsx';
import { Analytics } from './Analytics.jsx';
import { Categories } from './Categories.jsx';
import { Wallet } from './Wallet.jsx';
import { Settings } from './Settings.jsx';
import { Login } from './Login.jsx';
import { Signup } from './Signup.jsx';
import { OAuthCallback } from './OAuthCallback.jsx';

// Import authentication context
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx';
import { ToastProvider } from '../components/ui/toast.jsx';
import { I18nProvider } from '../contexts/I18nContext.jsx';

// Import and setup deep link handler for OAuth callbacks
import { setupDeepLinkHandler } from '../lib/deeplink.js';
import { initializeTheme } from '../utils/theme.js';
import { initializeExchangeRates } from '../utils/currency.js';

// Initialize theme, exchange rates and deep link handler on app startup (before rendering)
initializeTheme();
initializeExchangeRates(); // Fetch exchange rates from API
setupDeepLinkHandler();

/**
 * ProtectedRoute - Wrapper component that protects routes requiring authentication
 * Redirects to login if user is not authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Protected component to render
 */
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    console.log('ProtectedRoute: Checking authentication...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('ProtectedRoute: User not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  console.log('ProtectedRoute: User authenticated, rendering protected content');
  return children;
}

/**
 * PublicRoute - Wrapper component for public routes (login, signup)
 * Redirects to dashboard if user is already authenticated
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Public component to render
 */
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  // Show loading screen while checking authentication
  if (loading) {
    console.log('PublicRoute: Checking authentication...');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  // Redirect to dashboard if already authenticated
  if (user) {
    console.log('PublicRoute: User already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  console.log('PublicRoute: User not authenticated, rendering public content');
  return children;
}

// Render app with router and auth provider
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <I18nProvider>
          <ToastProvider>
            <Routes>
          {/* Public Routes - Login and Signup */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />

          {/* OAuth Callback - Public route for handling OAuth redirects */}
          <Route path="/oauth-callback" element={<OAuthCallback />} />

          {/* Protected Routes - Require authentication */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/transactions"
            element={
              <ProtectedRoute>
                <Transactions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Analytics />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/wallet"
            element={
              <ProtectedRoute>
                <Wallet />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            }
          />

          {/* Default Routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </ToastProvider>
        </I18nProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
