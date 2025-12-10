/**
 * Initialize theme from localStorage and apply it to document
 * Should be called on app startup
 */
export function initializeTheme() {
  const savedTheme = localStorage.getItem('theme');

  // Default to dark theme if nothing saved
  const theme = savedTheme || 'dark';

  applyTheme(theme);

  console.log('Theme initialized:', theme);
}

/**
 * Apply theme to document
 * @param {string} theme - 'dark' or 'light'
 */
export function applyTheme(theme) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  localStorage.setItem('theme', theme);
  console.log('Theme applied:', theme);
}
