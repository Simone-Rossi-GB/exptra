import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../lib/pocketBase.js';

// Create authentication context
const AuthContext = createContext();

/**
 * AuthProvider - Provides authentication state and methods to entire app
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * Check if user is already authenticated on mount
   */
  useEffect(() => {
    console.log('AuthContext: Checking authentication status...');

    // Get current user if authenticated
    if (authService.isAuthenticated()) {
      const currentUser = authService.getCurrentUser();
      console.log('AuthContext: User is authenticated', currentUser);
      setUser(currentUser);
    } else {
      console.log('AuthContext: No authenticated user found');
    }

    setLoading(false);

    // Subscribe to auth changes
    const unsubscribe = authService.onAuthChange((model) => {
      console.log('AuthContext: Auth state changed', model);
      setUser(model);
    });

    // Cleanup subscription
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Login with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} Authentication data
   */
  const login = async (email, password) => {
    console.log('AuthContext: Attempting login with email:', email);

    try {
      const authData = await authService.login(email, password);
      console.log('AuthContext: Login successful', authData.record);
      setUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: Login failed', error);
      throw error;
    }
  };

  /**
   * Login/Signup with Google OAuth
   * Automatically handles both new users (signup) and existing users (login)
   * @returns {Promise<Object>} Authentication data
   */
  const loginWithGoogle = async () => {
    console.log('AuthContext: Attempting Google OAuth...');

    try {
      const authData = await authService.loginOAuthGoogle();
      console.log('AuthContext: Google OAuth successful', authData.record);

      // Check if this is a new user registration
      if (authData.meta?.isNew) {
        console.log('AuthContext: New user registered via Google');
      } else {
        console.log('AuthContext: Existing user logged in via Google');
      }

      setUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: Google OAuth failed', error);
      throw error;
    }
  };

  /**
   * Login/Signup with GitHub OAuth
   * Automatically handles both new users (signup) and existing users (login)
   * @returns {Promise<Object>} Authentication data
   */
  const loginWithGitHub = async () => {
    console.log('AuthContext: Attempting GitHub OAuth...');

    try {
      const authData = await authService.loginOAuthGithub();
      console.log('AuthContext: GitHub OAuth successful', authData.record);

      // Check if this is a new user registration
      if (authData.meta?.isNew) {
        console.log('AuthContext: New user registered via GitHub');
      } else {
        console.log('AuthContext: Existing user logged in via GitHub');
      }

      setUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: GitHub OAuth failed', error);
      throw error;
    }
  };

  /**
   * Signup with email and password
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} username - Username
   * @returns {Promise<Object>} Authentication data
   */
  const signup = async (email, password, username) => {
    console.log('AuthContext: Attempting signup with email:', email);

    try {
      const authData = await authService.signup(email, password, username);
      console.log('AuthContext: Signup successful', authData.record);
      setUser(authData.record);
      return authData;
    } catch (error) {
      console.error('AuthContext: Signup failed', error);
      throw error;
    }
  };

  /**
   * Logout current user
   */
  const logout = () => {
    console.log('AuthContext: Logging out user');

    try {
      authService.logout();
      setUser(null);
      console.log('AuthContext: Logout successful');
    } catch (error) {
      console.error('AuthContext: Logout failed', error);
      throw error;
    }
  };

  // Context value with all auth methods
  const value = {
    user,
    loading,
    login,
    loginWithGoogle,
    loginWithGitHub,
    signup,
    logout,
    isAuthenticated: authService.isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Custom hook to use auth context
 * @returns {Object} Auth context value
 * @throws {Error} If used outside AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
