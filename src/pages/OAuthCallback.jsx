import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import pb from '../lib/pocketBase.js';

/**
 * OAuth Callback Handler
 * This page handles the redirect back from Google/GitHub OAuth
 */
export function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('processing');
  const [error, setError] = useState(null);

  useEffect(() => {
    handleOAuthCallback();
  }, []);

  const handleOAuthCallback = async () => {
    try {
      console.log('OAuthCallback: Processing OAuth callback');

      // Get URL parameters
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const state = urlParams.get('state');
      const error = urlParams.get('error');
      const errorDescription = urlParams.get('error_description');

      console.log('OAuthCallback: Parameters -', { code, state, error });

      // Handle OAuth error
      if (error) {
        console.error('OAuthCallback: OAuth error -', error, errorDescription);
        setError(errorDescription || error);
        setStatus('error');
        return;
      }

      // Validate we have a code
      if (!code) {
        console.error('OAuthCallback: No code in URL');
        setError('Codice OAuth mancante');
        setStatus('error');
        return;
      }

      // Get stored OAuth data from localStorage
      const provider = localStorage.getItem('pb_oauth_provider');
      const codeVerifier = localStorage.getItem('pb_oauth_code_verifier');
      const storedState = localStorage.getItem('pb_oauth_state');

      console.log('OAuthCallback: Stored data -', { provider, codeVerifier, storedState });

      // Validate stored data
      if (!provider || !codeVerifier) {
        console.error('OAuthCallback: Missing stored OAuth data');
        setError('Dati OAuth mancanti. Riprova ad accedere.');
        setStatus('error');
        return;
      }

      // Validate state matches (CSRF protection)
      if (state !== storedState) {
        console.error('OAuthCallback: State mismatch', { received: state, expected: storedState });
        setError('Errore di sicurezza OAuth. Riprova ad accedere.');
        setStatus('error');
        return;
      }

      console.log('OAuthCallback: Exchanging code for token with PocketBase');

      // Exchange code for token with PocketBase (use same redirect URI as initial request)
      // IMPORTANT: Must match the redirect_uri used in the initial OAuth request
      const redirectUri = 'https://exptra.ddns.net/oauth/callback.html';
      console.log('OAuthCallback: Using redirect URI:', redirectUri);

      // Retry logic for slow connections
      let authData = null;
      let lastError = null;
      const maxRetries = 3;

      for (let i = 0; i < maxRetries; i++) {
        try {
          console.log(`OAuthCallback: Attempt ${i + 1}/${maxRetries}`);
          authData = await pb.collection('Auth').authWithOAuth2Code(
            provider,
            code,
            codeVerifier,
            redirectUri,
            // Additional create data for new users
            {
              emailVisibility: true
            }
          );
          console.log('OAuthCallback: Authentication successful', authData.record.id);
          break; // Success, exit retry loop
        } catch (err) {
          lastError = err;
          console.warn(`OAuthCallback: Attempt ${i + 1} failed:`, err.message);

          // Only retry on network errors, not on auth errors
          if (i < maxRetries - 1 && (err.message.includes('fetch') || err.message.includes('network'))) {
            console.log(`OAuthCallback: Retrying in 1 second...`);
            await new Promise(resolve => setTimeout(resolve, 1000));
          } else {
            throw err; // Don't retry, throw error
          }
        }
      }

      if (!authData) {
        throw lastError || new Error('Failed to authenticate after retries');
      }

      // Update last login information
      try {
        await pb.collection('Auth').update(authData.record.id, {
          lastLogin: new Date().toISOString(),
          lastLoginMethod: provider
        });
      } catch (updateError) {
        console.warn('OAuthCallback: Failed to update last login (non-critical)', updateError);
      }

      // Clear stored OAuth data
      localStorage.removeItem('oauth_provider');
      localStorage.removeItem('oauth_code_verifier');
      localStorage.removeItem('oauth_state');
      localStorage.removeItem('oauth_return_url');

      console.log('OAuthCallback: Redirecting to dashboard');
      setStatus('success');

      // Redirect to dashboard (or return URL)
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 1000);

    } catch (err) {
      console.error('OAuthCallback: Error processing callback', err);
      setError(err.message || 'Errore durante l\'autenticazione');
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center">
        {status === 'processing' && (
          <>
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-white mb-2">Completamento accesso...</h1>
            <p className="text-gray-400">Attendere prego</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Accesso completato!</h1>
            <p className="text-gray-400">Reindirizzamento...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Errore di autenticazione</h1>
            <p className="text-red-400 mb-4">{error}</p>
            <button
              onClick={() => navigate('/login', { replace: true })}
              className="px-6 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
            >
              Torna al login
            </button>
          </>
        )}
      </div>
    </div>
  );
}
