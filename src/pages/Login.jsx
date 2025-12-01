import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Github, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export function Login() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, loginWithGitHub } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle email/password login form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Login: Attempting email/password login', formData.email);

    // Clear previous errors
    setError('');
    setLoading(true);

    try {
      // Call login from AuthContext (which uses authService)
      await login(formData.email, formData.password);
      console.log('Login: Success, redirecting to dashboard');

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Login: Failed', err);
      setError('Email o password non validi');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth login
   * Works for both existing users (login) and new users (signup)
   */
  const handleGoogleOAuth = async () => {
    console.log('Login: Attempting Google OAuth');

    setError('');
    setLoading(true);

    try {
      // Call loginWithGoogle from AuthContext (which uses authService.loginOAuthGoogle)
      await loginWithGoogle();
      console.log('Login: Google OAuth success, redirecting to dashboard');

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Login: Google OAuth failed', err);
      setError('Errore durante l\'autenticazione con Google');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle GitHub OAuth login
   * Works for both existing users (login) and new users (signup)
   */
  const handleGitHubOAuth = async () => {
    console.log('Login: Attempting GitHub OAuth');

    setError('');
    setLoading(true);

    try {
      // Call loginWithGitHub from AuthContext (which uses authService.loginOAuthGithub)
      await loginWithGitHub();
      console.log('Login: GitHub OAuth success, redirecting to dashboard');

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Login: GitHub OAuth failed', err);
      setError('Errore durante l\'autenticazione con GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Bentornato</h1>
          <p className="text-gray-400">Accedi al tuo account ExpTra</p>
        </div>

        <Card className="bg-surface/50 border-gray-800/50">
          <CardContent className="p-6 space-y-6">
            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
                {error}
              </div>
            )}

            {/* OAuth Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleGoogleOAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-gray-900 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82999 3.96409 7.28999V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                {loading ? 'Accesso in corso...' : 'Continua con Google'}
              </button>

              <button
                onClick={handleGitHubOAuth}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="w-5 h-5" />
                {loading ? 'Accesso in corso...' : 'Continua con GitHub'}
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-surface text-gray-400">oppure</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="email"
                    placeholder="nome@esempio.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.rememberMe}
                    onChange={(e) => setFormData(prev => ({ ...prev, rememberMe: e.target.checked }))}
                    className="w-4 h-4 rounded border-gray-700 bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  />
                  <span className="text-sm text-gray-300">Ricordami</span>
                </label>
                <Link to="/forgot-password" className="text-sm text-primary hover:text-primary-light transition-colors">
                  Password dimenticata?
                </Link>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Accesso in corso...' : 'Accedi'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-400">
              Non hai un account?{' '}
              <Link to="/signup" className="text-primary hover:text-primary-light transition-colors font-medium">
                Registrati
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
