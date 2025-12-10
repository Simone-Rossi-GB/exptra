import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Card, CardContent } from "../components/ui/card.jsx";
import { Github, Lock, Mail, User } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";

export function Signup() {
  const navigate = useNavigate();
  // Use AuthContext methods - OAuth methods work for BOTH signup and login
  const { signup, loginWithGoogle, loginWithGitHub } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  /**
   * Handle email/password signup form submission
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Signup: Attempting registration', formData.email);

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError('Le password non corrispondono');
      return;
    }

    // Validate terms acceptance
    if (!formData.acceptTerms) {
      setError('Devi accettare i termini e condizioni');
      return;
    }

    // Clear previous errors
    setError('');
    setLoading(true);

    try {
      // Call signup from AuthContext (which uses authService.signup)
      await signup(formData.email, formData.password, formData.name);
      console.log('Signup: Success, redirecting to dashboard');

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup: Failed', err);

      // Handle specific error messages
      if (err.message?.includes('email')) {
        setError('Questa email è già registrata');
      } else {
        setError('Errore durante la registrazione');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Google OAuth signup/login
   * IMPORTANT: OAuth works for BOTH new users (signup) and existing users (login)
   * PocketBase automatically handles this - if email exists it logs in, otherwise it creates new account
   */
  const handleGoogleOAuth = async () => {
    console.log('Signup: Attempting Google OAuth (works for both signup and login)');

    setError('');
    setLoading(true);

    try {
      // Call loginWithGoogle from AuthContext (which uses authService.loginOAuthGoogle)
      // This method handles BOTH signup and login automatically
      await loginWithGoogle();
      console.log('Signup: Google OAuth success, redirecting to dashboard');

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup: Google OAuth failed', err);
      setError('Errore durante l\'autenticazione con Google');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle GitHub OAuth signup/login
   * IMPORTANT: OAuth works for BOTH new users (signup) and existing users (login)
   * PocketBase automatically handles this - if email exists it logs in, otherwise it creates new account
   */
  const handleGitHubOAuth = async () => {
    console.log('Signup: Attempting GitHub OAuth (works for both signup and login)');

    setError('');
    setLoading(true);

    try {
      // Call loginWithGitHub from AuthContext (which uses authService.loginOAuthGithub)
      // This method handles BOTH signup and login automatically
      await loginWithGitHub();
      console.log('Signup: GitHub OAuth success, redirecting to dashboard');

      // Redirect to dashboard on success
      navigate('/dashboard');
    } catch (err) {
      console.error('Signup: GitHub OAuth failed', err);
      setError('Errore durante l\'autenticazione con GitHub');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Crea il tuo account</h1>
          <p className="text-gray-600 dark:text-gray-400">Inizia a tracciare le tue spese</p>
        </div>

        <Card className="bg-white/80 dark:bg-surface/50 border-gray-200 dark:border-gray-800/50">
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
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-gray-50 border border-gray-300 rounded-lg transition-colors text-gray-900 font-medium"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.64 9.20443C17.64 8.56625 17.5827 7.95262 17.4764 7.36353H9V10.8449H13.8436C13.635 11.9699 13.0009 12.9231 12.0477 13.5613V15.8194H14.9564C16.6582 14.2526 17.64 11.9453 17.64 9.20443Z" fill="#4285F4"/>
                  <path d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5613C11.2418 14.1013 10.2109 14.4204 9 14.4204C6.65591 14.4204 4.67182 12.8372 3.96409 10.71H0.957275V13.0418C2.43818 15.9831 5.48182 18 9 18Z" fill="#34A853"/>
                  <path d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.82999 3.96409 7.28999V4.95818H0.957275C0.347727 6.17318 0 7.54772 0 9C0 10.4523 0.347727 11.8268 0.957275 13.0418L3.96409 10.71Z" fill="#FBBC05"/>
                  <path d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z" fill="#EA4335"/>
                </svg>
                Registrati con Google
              </button>

              <button
                onClick={handleGitHubOAuth}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5 bg-gray-900 hover:bg-gray-800 border border-gray-700 rounded-lg transition-colors text-white font-medium"
              >
                <Github className="w-5 h-5" />
                Registrati con GitHub
              </button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-surface text-gray-600 dark:text-gray-400">oppure</span>
              </div>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Mario Rossi"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
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
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    className="pl-10"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-500">Minimo 8 caratteri</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Conferma Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 dark:text-gray-400" />
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData(prev => ({ ...prev, acceptTerms: e.target.checked }))}
                  className="w-4 h-4 mt-0.5 rounded border-gray-300 dark:border-gray-700 bg-white dark:bg-surface text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0"
                  required
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Accetto i{' '}
                  <Link to="/terms" className="text-primary hover:text-primary-light transition-colors">
                    Termini e Condizioni
                  </Link>{' '}
                  e la{' '}
                  <Link to="/privacy" className="text-primary hover:text-primary-light transition-colors">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Creazione account...' : 'Crea Account'}
              </Button>
            </form>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              Hai già un account?{' '}
              <Link to="/login" className="text-primary hover:text-primary-light transition-colors font-medium">
                Accedi
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
