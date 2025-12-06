/**
 * Universal Deep Link Handler
 * Supports Capacitor (iOS/Android), Tauri (Desktop), and Web
 *
 * Handles OAuth callbacks via custom URL scheme: exptra://auth/callback
 */

/**
 * Setup deep link listener for the current platform
 * Call this once during app initialization (in main.jsx)
 */
export function setupDeepLinkHandler() {
  console.log('DeepLink: Setting up deep link handler');

  // For Capacitor (iOS/Android)
  if (window.Capacitor) {
    console.log('DeepLink: Running on Capacitor (iOS/Android)');

    // Dynamically import Capacitor App plugin
    import('@capacitor/app').then(({ App }) => {
      App.addListener('appUrlOpen', (event) => {
        console.log('DeepLink: Deep link received (Capacitor):', event.url);
        handleDeepLink(event.url);
      });

      console.log('DeepLink: Capacitor listener registered');
    }).catch(err => {
      console.error('DeepLink: Failed to load @capacitor/app plugin', err);
    });

    return;
  }

  // For Tauri (Desktop)
  if (window.__TAURI__) {
    console.log('DeepLink: Running on Tauri (Desktop)');

    // Listen for deep link events from Tauri
    window.__TAURI__.event.listen('deep-link', (event) => {
      console.log('DeepLink: Deep link received (Tauri):', event.payload);
      handleDeepLink(event.payload);
    }).catch(err => {
      console.error('DeepLink: Failed to setup Tauri deep link listener', err);
    });

    return;
  }

  // For Web (no deep linking support)
  console.log('DeepLink: Running on Web (no deep linking needed)');
}

/**
 * Process deep link URL and emit appropriate events
 * @param {string} url - The deep link URL (e.g., exptra://auth/callback?code=xxx)
 */
function handleDeepLink(url) {
  try {
    console.log('DeepLink: Processing URL:', url);

    const urlObj = new URL(url);

    // Check if this is an OAuth callback
    if (urlObj.hostname === 'auth' && urlObj.pathname === '/callback') {
      const code = urlObj.searchParams.get('code');
      const state = urlObj.searchParams.get('state');
      const error = urlObj.searchParams.get('error');
      const error_description = urlObj.searchParams.get('error_description');

      if (error) {
        console.error('DeepLink: OAuth error received:', error, error_description);
        window.dispatchEvent(new CustomEvent('oauth-error', {
          detail: { error, error_description }
        }));
        return;
      }

      if (code) {
        console.log('DeepLink: OAuth code received, emitting oauth-callback event');
        window.dispatchEvent(new CustomEvent('oauth-callback', {
          detail: { code, state }
        }));
      } else {
        console.warn('DeepLink: No code or error in OAuth callback');
      }
    } else {
      console.warn('DeepLink: Unknown deep link format:', url);
    }
  } catch (error) {
    console.error('DeepLink: Error processing deep link:', error);
  }
}

/**
 * Wait for OAuth callback with timeout
 * Returns a Promise that resolves with { code, state } or rejects on error/timeout
 *
 * @param {number} timeoutMs - Timeout in milliseconds (default: 5 minutes)
 * @returns {Promise<{code: string, state: string}>}
 */
export function waitForOAuthCallback(timeoutMs = 300000) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('OAuth timeout - il login è scaduto'));
    }, timeoutMs);

    const handleCallback = (event) => {
      console.log('DeepLink: OAuth callback received:', event.detail);
      cleanup();
      resolve(event.detail);
    };

    const handleError = (event) => {
      console.error('DeepLink: OAuth error received:', event.detail);
      cleanup();
      reject(new Error(event.detail.error_description || event.detail.error || 'OAuth failed'));
    };

    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener('oauth-callback', handleCallback);
      window.removeEventListener('oauth-error', handleError);
    };

    window.addEventListener('oauth-callback', handleCallback);
    window.addEventListener('oauth-error', handleError);
  });
}
