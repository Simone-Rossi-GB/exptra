import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext.jsx";
import { NotificationPanel } from "../NotificationPanel.jsx";
import {
  Wallet,
  LayoutDashboard,
  ArrowLeftRight,
  PieChart,
  Package,
  Settings,
  User,
  Bell,
  LogOut,
} from "lucide-react";

/**
 * AppLayout - Shared layout component with sidebar and top menu
 * Used by all authenticated pages
 * @param {Object} props
 * @param {React.ReactNode} props.children - Page content
 */
export function AppLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isNotificationPanelOpen, setIsNotificationPanelOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Sample notifications - in a real app, these would come from an API or context
  const [notifications, setNotifications] = useState([
    {
      id: '1',
      title: 'Benvenuto in ExpTra!',
      message: 'Inizia a tracciare le tue spese e gestisci il tuo budget.',
      date: new Date().toISOString(),
      read: false,
    },
  ]);

  // Navigation items for sidebar
  const navigationItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { id: "transactions", label: "Transazioni", icon: ArrowLeftRight, path: "/transactions" },
    { id: "analytics", label: "Analytics", icon: PieChart, path: "/analytics" },
    { id: "categories", label: "Categorie", icon: Package, path: "/categories" },
    { id: "wallet", label: "Wallet", icon: Wallet, path: "/wallet" },
    { id: "settings", label: "Impostazioni", icon: Settings, path: "/settings" },
  ];

  /**
   * Handle navigation to different pages
   * @param {string} path - Route path
   */
  const handleNavigate = (path) => {
    console.log('AppLayout: Navigating to', path);
    navigate(path);
  };

  /**
   * Handle user logout
   */
  const handleLogout = () => {
    console.log('AppLayout: Logging out');
    logout();
    navigate('/login');
  };

  /**
   * Mark a notification as read
   * @param {string} notificationId - Notification ID
   */
  const handleMarkAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  /**
   * Clear all notifications
   */
  const handleClearAllNotifications = () => {
    setNotifications([]);
    setIsNotificationPanelOpen(false);
  };

  /**
   * Delete a single notification
   * @param {string} notificationId - Notification ID
   */
  const handleDeleteNotification = (notificationId) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  // Get current active route
  const currentPath = location.pathname;

  // Count unread notifications
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen max-h-screen bg-gray-50 dark:bg-background flex overflow-hidden">
      {/* Sidebar - Fixed on left, hidden on mobile */}
      <aside className="hidden lg:flex flex-col w-64 border-r border-gray-200 dark:border-gray-800/50 bg-white dark:bg-surface/50 fixed left-0 top-0 bottom-0 z-40 shadow-sm dark:shadow-none">
        {/* Logo and app name */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-800/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-gray-900 dark:text-white text-lg">ExpTra</h2>
              <p className="text-xs text-gray-500 dark:text-gray-500">Expense Tracker</p>
            </div>
          </div>
        </div>

        {/* Navigation menu */}
        <nav className="flex-1 p-4 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;

            return (
              <button
                key={item.id}
                onClick={() => handleNavigate(item.path)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-primary text-white shadow-lg shadow-primary/20"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface-light"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User profile section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-surface-light/50">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
              <User className="w-7 h-7 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-base text-gray-900 dark:text-white truncate">{user?.username || 'User'}</p>
            </div>
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="w-full mt-2 flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Esci</span>
          </button>
        </div>
      </aside>

      {/* Main content area - With margin for fixed sidebar */}
      <div className="flex-1 lg:ml-64 overflow-y-auto h-screen">
        {/* Top navigation bar */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-surface/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800/50">
          <div className="px-4 sm:px-6 pb-4 pt-16 sm:pt-4 flex items-center justify-between gap-4">
            {/* Page title - dynamically set by current route */}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white truncate">
                {navigationItems.find(item => item.path === currentPath)?.label || 'ExpTra'}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                {new Date().toLocaleDateString('it-IT', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>

            {/* Right side - Notifications & Profile (mobile) */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setIsNotificationPanelOpen(!isNotificationPanelOpen)}
                  className="relative p-2 rounded-lg bg-gray-100 dark:bg-surface-light hover:bg-gray-200 dark:hover:bg-surface transition-colors"
                >
                  <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                  )}
                </button>
                <NotificationPanel
                  isOpen={isNotificationPanelOpen}
                  onClose={() => setIsNotificationPanelOpen(false)}
                  notifications={notifications}
                  onMarkAsRead={handleMarkAsRead}
                  onClearAll={handleClearAllNotifications}
                  onDelete={handleDeleteNotification}
                />
              </div>

              {/* User Menu (mobile only) */}
              <div className="relative lg:hidden">
                <button
                  onClick={() => {
                    setIsNotificationPanelOpen(false);
                    setIsUserMenuOpen(!isUserMenuOpen);
                  }}
                  className="p-2 rounded-lg bg-gray-100 dark:bg-surface-light hover:bg-gray-200 dark:hover:bg-surface transition-colors"
                >
                  <User className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* User Dropdown */}
                {isUserMenuOpen && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />

                    {/* Dropdown Menu */}
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-surface border border-gray-200 dark:border-gray-800/50 rounded-xl shadow-xl z-50 overflow-hidden">
                      {/* User Info */}
                      <div className="p-4 border-b border-gray-200 dark:border-gray-800/50">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-6 h-6 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 dark:text-white truncate">{user?.username || 'User'}</p>
                            <p className="text-xs text-gray-600 dark:text-gray-400 truncate">{user?.email || ''}</p>
                          </div>
                        </div>
                      </div>

                      {/* Logout Button */}
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          handleLogout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200"
                      >
                        <LogOut className="w-5 h-5" />
                        <span className="font-medium">Esci</span>
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 pb-36 lg:pb-6">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="lg:hidden fixed bottom-4 left-8 right-8 bg-white/95 dark:bg-surface/95 backdrop-blur-xl border border-gray-200 dark:border-gray-800/50 rounded-2xl shadow-xl z-40">
          <div className="grid grid-cols-6 gap-1 p-1">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;

              return (
                <button
                  key={item.id}
                  onClick={() => handleNavigate(item.path)}
                  className={`flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-all ${
                    isActive
                      ? "bg-primary/20 text-primary"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-surface-light"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium truncate w-full text-center">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
