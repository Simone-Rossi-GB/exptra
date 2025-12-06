# Guida Router e OAuth con PocketBase

## 📋 Indice
1. [Setup Router React](#1-setup-router-react)
2. [Come funziona OAuth con PocketBase](#2-come-funziona-oauth-con-pocketbase)
3. [Registrazione vs Login con OAuth](#3-registrazione-vs-login-con-oauth)
4. [Multiple modalità di accesso allo stesso account](#4-multiple-modalità-di-accesso-allo-stesso-account)
5. [Implementazione completa](#5-implementazione-completa)

---

## 1. Setup Router React

### Installazione
```bash
npm install react-router-dom
```

### Configurazione del Router

Crea o modifica `src/pages/main.jsx`:

```jsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

// Pages
import { Dashboard } from './Dashboard.jsx';
import { Transactions } from './Transactions.jsx';
import { Analytics } from './Analytics.jsx';
import { Categories } from './Categories.jsx';
import { Wallet } from './Wallet.jsx';
import { Settings } from './Settings.jsx';
import { Login } from './Login.jsx';
import { Signup } from './Signup.jsx';

// Context per autenticazione (da creare)
import { AuthProvider, useAuth } from '../contexts/AuthContext.jsx';

// Componente per proteggere le route
function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-white">Caricamento...</p>
    </div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

// Componente per redirect se già autenticato
function PublicRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-white">Caricamento...</p>
    </div>;
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />

          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/categories" element={<ProtectedRoute><Categories /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><Wallet /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

---

## 2. Come funziona OAuth con PocketBase

### OAuth: Concetti Base

**OAuth NON è solo per il login - è anche per la registrazione!**

Quando un utente clicca su "Continua con Google":
1. **Se l'email Google NON esiste nel database**: PocketBase **CREA AUTOMATICAMENTE** un nuovo account
2. **Se l'email Google ESISTE già**: PocketBase fa il login

### PocketBase gestisce tutto automaticamente

```javascript
// Questo comando fa ENTRAMBE le cose:
// - Registrazione (se utente nuovo)
// - Login (se utente esistente)
const authData = await pb.collection('Auth').authWithOAuth2({
  provider: 'google', // o 'github'
});

console.log(authData.meta); // Contiene isNew: true se è una registrazione
console.log(authData.record); // L'utente creato/loggato
```

### Come PocketBase identifica l'utente OAuth

PocketBase usa l'**email del provider OAuth** per:
1. Cercare se esiste già un account con quella email
2. Se esiste → Login
3. Se NON esiste → Crea nuovo account e Login

---

## 3. Registrazione vs Login con OAuth

### NON c'è differenza tecnica!

Con OAuth, **registrazione e login sono LA STESSA COSA**:

```javascript
// Nella pagina di Login:
const handleGoogleOAuth = async () => {
  try {
    const authData = await pb.collection('Auth').authWithOAuth2({
      provider: 'google',
    });

    if (authData.meta?.isNew) {
      console.log('Nuovo utente registrato!');
      // Opzionale: redirect a onboarding
    } else {
      console.log('Utente esistente loggato!');
    }

    navigate('/dashboard');
  } catch (error) {
    console.error('Errore OAuth:', error);
  }
};

// Nella pagina di Signup:
const handleGoogleOAuth = async () => {
  // IDENTICO al login! PocketBase gestisce tutto
  try {
    const authData = await pb.collection('Auth').authWithOAuth2({
      provider: 'google',
    });

    if (authData.meta?.isNew) {
      console.log('Account creato con successo!');
    }

    navigate('/dashboard');
  } catch (error) {
    console.error('Errore OAuth:', error);
  }
};
```

### Perché avere pulsanti OAuth sia in Login che Signup?

**UX - User Experience:**
- L'utente si aspetta di vedere "Registrati con Google" nella pagina Signup
- L'utente si aspetta di vedere "Accedi con Google" nella pagina Login
- Anche se tecnicamente fanno la stessa cosa, il **contesto** è diverso

---

## 4. Multiple modalità di accesso allo stesso account

### Il tuo schema è PERFETTO per questo!

Analizzando `pb_schema.json`, hai creato una struttura molto intelligente:

#### Tabella `Auth` (Collection principale)
- **email**: Email primaria dell'account (UNIQUE)
- **primaryEmail**: Email principale usata dall'utente
- **primaryAuthMethod**: Metodo di autenticazione principale (`email`, `google`, `github`)
- **password**: Password (opzionale se registrato con OAuth)

#### Tabella `linked_auth_providers` (Collection per provider multipli)
- **user**: Relazione all'utente in `Auth`
- **provider**: `github`, `google`, `email`
- **providerEmail**: Email del provider
- **providerUserId**: ID utente del provider
- **isPrimary**: Se è il metodo principale
- **linkedAt**: Quando è stato collegato
- **lastUsedAt**: Ultimo utilizzo

### Come funziona il linking dei provider

#### Scenario 1: Registrazione con Email + Password
```javascript
// 1. Utente si registra con email/password
const user = await pb.collection('Auth').create({
  email: 'mario@email.com',
  password: 'password123',
  passwordConfirm: 'password123',
  username: 'mario',
  primaryEmail: 'mario@email.com',
  primaryAuthMethod: 'email',
  // ... altri campi
});

// 2. PocketBase crea automaticamente un record in linked_auth_providers
await pb.collection('linked_auth_providers').create({
  user: user.id,
  provider: 'email',
  providerEmail: 'mario@email.com',
  providerUserId: user.id,
  isPrimary: true,
  linkedAt: new Date(),
  isVerified: false, // Fino a conferma email
});
```

#### Scenario 2: Registrazione con Google OAuth
```javascript
// 1. Utente clicca "Registrati con Google"
const authData = await pb.collection('Auth').authWithOAuth2({
  provider: 'google',
});

// 2. PocketBase crea automaticamente:
// - Record in Auth con email di Google
// - Record in linked_auth_providers

// Dati creati automaticamente da PocketBase:
// Auth:
// - email: 'mario@gmail.com'
// - primaryEmail: 'mario@gmail.com'
// - primaryAuthMethod: 'google'
// - password: null (non necessaria)

// linked_auth_providers:
// - provider: 'google'
// - providerEmail: 'mario@gmail.com'
// - providerUserId: 'google-user-id-12345'
// - isPrimary: true
// - isVerified: true (Google verifica automaticamente)
```

#### Scenario 3: Link di un secondo provider

Supponiamo che Mario si sia registrato con Google e ora vuole aggiungere GitHub:

```javascript
// In Settings page - "Collega Account GitHub"
const handleLinkGitHub = async () => {
  try {
    // 1. Esegui OAuth GitHub
    const authData = await pb.collection('Auth').authWithOAuth2({
      provider: 'github',
    });

    // 2. Controlla se l'email GitHub corrisponde a quella dell'account
    const githubEmail = authData.meta.email;
    const currentUser = pb.authStore.model;

    if (githubEmail === currentUser.primaryEmail || githubEmail === currentUser.email) {
      // 3. Email corrisponde - Aggiungi provider
      await pb.collection('linked_auth_providers').create({
        user: currentUser.id,
        provider: 'github',
        providerEmail: githubEmail,
        providerUserId: authData.meta.id,
        providerUsername: authData.meta.username,
        providerAvatar: authData.meta.avatarUrl,
        providerData: authData.meta,
        isPrimary: false,
        linkedAt: new Date(),
        isVerified: true,
        lastUsedAt: new Date(),
      });

      alert('Account GitHub collegato con successo!');
    } else {
      // 4. Email diversa - chiedi all'utente cosa fare
      const confirm = window.confirm(
        `L'email GitHub (${githubEmail}) è diversa dalla tua email primaria (${currentUser.primaryEmail}). ` +
        'Vuoi comunque collegare questo account?'
      );

      if (confirm) {
        // Collega comunque
        await pb.collection('linked_auth_providers').create({
          user: currentUser.id,
          provider: 'github',
          providerEmail: githubEmail,
          providerUserId: authData.meta.id,
          providerUsername: authData.meta.username,
          isPrimary: false,
          linkedAt: new Date(),
          isVerified: true,
          lastUsedAt: new Date(),
        });
      }
    }
  } catch (error) {
    console.error('Errore collegamento GitHub:', error);
    alert('Errore nel collegamento dell\'account');
  }
};
```

#### Scenario 4: Login con un provider secondario

```javascript
// Utente ha account con email primaria mario@email.com
// Ha collegato Google (mario@gmail.com) e GitHub (mariorossi@github.com)

// 1. Utente clicca "Accedi con GitHub"
const authData = await pb.collection('Auth').authWithOAuth2({
  provider: 'github',
});

// 2. PocketBase:
//    - Cerca in linked_auth_providers se esiste un record con:
//      provider='github' E providerUserId='github-id-dell-utente'
//    - Trova il record
//    - Prende il campo 'user' (ID dell'utente principale)
//    - Autentica quell'utente
//    - Aggiorna lastUsedAt

// 3. Aggiorna LastLoginMethod nell'Auth
await pb.collection('Auth').update(authData.record.id, {
  LastLoginMethod: 'github',
  lastLogin: new Date(),
});

// 4. Aggiorna lastUsedAt in linked_auth_providers
await pb.collection('linked_auth_providers').update(linkedProviderId, {
  lastUsedAt: new Date(),
});
```

### Gestione conflitti di email

**Problema**: Cosa succede se un utente registrato con `mario@email.com` prova a collegarsi con Google usando `mario@email.com`?

**Soluzione**:

```javascript
const handleLinkProvider = async (provider) => {
  try {
    // 1. Esegui OAuth
    const authData = await pb.collection('Auth').authWithOAuth2({
      provider: provider,
    });

    const providerEmail = authData.meta.email;
    const currentUser = pb.authStore.model;

    // 2. Controlla se esiste già un account con questa email
    const existingUser = await pb.collection('Auth').getFirstListItem(
      `email="${providerEmail}"`
    ).catch(() => null);

    if (existingUser && existingUser.id !== currentUser.id) {
      alert('Questa email è già associata a un altro account!');
      return;
    }

    // 3. Controlla se questo provider è già collegato
    const existingLink = await pb.collection('linked_auth_providers').getFirstListItem(
      `user="${currentUser.id}" && provider="${provider}"`
    ).catch(() => null);

    if (existingLink) {
      alert('Questo provider è già collegato al tuo account!');
      return;
    }

    // 4. Tutto OK - Collega il provider
    await pb.collection('linked_auth_providers').create({
      user: currentUser.id,
      provider: provider,
      providerEmail: providerEmail,
      providerUserId: authData.meta.id,
      providerUsername: authData.meta.username || authData.meta.name,
      providerAvatar: authData.meta.avatarUrl,
      providerData: authData.meta,
      isPrimary: false,
      linkedAt: new Date(),
      isVerified: true,
      lastUsedAt: new Date(),
    });

    alert(`Account ${provider} collegato con successo!`);
  } catch (error) {
    console.error('Errore:', error);
  }
};
```

---

## 5. Implementazione completa

### Step 1: Inizializza PocketBase

Crea `src/lib/pocketbase.js`:

```javascript
import PocketBase from 'pocketbase';

// URL del tuo PocketBase sul Raspberry Pi
export const pb = new PocketBase('http://192.168.1.XXX:8090'); // Sostituisci con il tuo IP

// Abilita auto cancellation delle richieste duplicate
pb.autoCancellation(false);

// Persisti l'auth nello storage
pb.authStore.onChange(() => {
  console.log('Auth changed:', pb.authStore.isValid);
});

export default pb;
```

### Step 2: Crea AuthContext

Crea `src/contexts/AuthContext.jsx`:

```javascript
import { createContext, useContext, useState, useEffect } from 'react';
import pb from '../lib/pocketbase';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(pb.authStore.model);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verifica se c'è un token valido
    setLoading(true);

    if (pb.authStore.isValid) {
      setUser(pb.authStore.model);
    } else {
      setUser(null);
    }

    setLoading(false);

    // Listener per cambio auth
    const unsubscribe = pb.authStore.onChange((token, model) => {
      setUser(model);
    });

    return () => unsubscribe();
  }, []);

  // Registrazione con email/password
  const signup = async (email, password, name) => {
    try {
      const user = await pb.collection('Auth').create({
        email,
        password,
        passwordConfirm: password,
        username: name,
        primaryEmail: email,
        primaryAuthMethod: 'email',
        LastLoginMethod: 'email',
        lastLogin: new Date(),
        valuta: 'EUR',
        lingua: 'IT',
      });

      // Crea record in linked_auth_providers
      await pb.collection('linked_auth_providers').create({
        user: user.id,
        provider: 'email',
        providerEmail: email,
        providerUserId: user.id,
        isPrimary: true,
        linkedAt: new Date(),
        isVerified: false,
      });

      // Login automatico
      await pb.collection('Auth').authWithPassword(email, password);

      // Invia email di verifica
      await pb.collection('Auth').requestVerification(email);

      return user;
    } catch (error) {
      throw error;
    }
  };

  // Login con email/password
  const login = async (email, password) => {
    try {
      const authData = await pb.collection('Auth').authWithPassword(email, password);

      // Aggiorna lastLogin e LastLoginMethod
      await pb.collection('Auth').update(authData.record.id, {
        LastLoginMethod: 'email',
        lastLogin: new Date(),
      });

      // Aggiorna lastUsedAt in linked_auth_providers
      const linkedProvider = await pb.collection('linked_auth_providers').getFirstListItem(
        `user="${authData.record.id}" && provider="email"`
      ).catch(() => null);

      if (linkedProvider) {
        await pb.collection('linked_auth_providers').update(linkedProvider.id, {
          lastUsedAt: new Date(),
        });
      }

      return authData.record;
    } catch (error) {
      throw error;
    }
  };

  // Login/Signup con OAuth
  const loginWithOAuth = async (provider) => {
    try {
      const authData = await pb.collection('Auth').authWithOAuth2({
        provider: provider,
      });

      // Aggiorna o crea record in Auth
      if (authData.meta?.isNew) {
        // Nuovo utente - aggiorna i campi
        await pb.collection('Auth').update(authData.record.id, {
          primaryEmail: authData.meta.email,
          primaryAuthMethod: provider,
          LastLoginMethod: provider,
          lastLogin: new Date(),
          valuta: 'EUR',
          lingua: 'IT',
        });

        // Crea record in linked_auth_providers
        await pb.collection('linked_auth_providers').create({
          user: authData.record.id,
          provider: provider,
          providerEmail: authData.meta.email,
          providerUserId: authData.meta.id,
          providerUsername: authData.meta.username || authData.meta.name,
          providerAvatar: authData.meta.avatarUrl,
          providerData: authData.meta,
          isPrimary: true,
          linkedAt: new Date(),
          lastUsedAt: new Date(),
          isVerified: true,
        });
      } else {
        // Utente esistente - aggiorna lastLogin
        await pb.collection('Auth').update(authData.record.id, {
          LastLoginMethod: provider,
          lastLogin: new Date(),
        });

        // Aggiorna lastUsedAt
        const linkedProvider = await pb.collection('linked_auth_providers').getFirstListItem(
          `user="${authData.record.id}" && provider="${provider}"`
        ).catch(() => null);

        if (linkedProvider) {
          await pb.collection('linked_auth_providers').update(linkedProvider.id, {
            lastUsedAt: new Date(),
          });
        }
      }

      return authData.record;
    } catch (error) {
      throw error;
    }
  };

  // Link provider secondario
  const linkProvider = async (provider) => {
    if (!user) {
      throw new Error('Devi essere autenticato per collegare un provider');
    }

    try {
      const authData = await pb.collection('Auth').authWithOAuth2({
        provider: provider,
      });

      const providerEmail = authData.meta.email;

      // Controlla se provider già collegato
      const existingLink = await pb.collection('linked_auth_providers').getFirstListItem(
        `user="${user.id}" && provider="${provider}"`
      ).catch(() => null);

      if (existingLink) {
        throw new Error('Questo provider è già collegato al tuo account');
      }

      // Crea link
      await pb.collection('linked_auth_providers').create({
        user: user.id,
        provider: provider,
        providerEmail: providerEmail,
        providerUserId: authData.meta.id,
        providerUsername: authData.meta.username || authData.meta.name,
        providerAvatar: authData.meta.avatarUrl,
        providerData: authData.meta,
        isPrimary: false,
        linkedAt: new Date(),
        lastUsedAt: new Date(),
        isVerified: true,
      });

      return true;
    } catch (error) {
      throw error;
    }
  };

  // Unlink provider
  const unlinkProvider = async (provider) => {
    if (!user) {
      throw new Error('Devi essere autenticato');
    }

    try {
      const linkedProvider = await pb.collection('linked_auth_providers').getFirstListItem(
        `user="${user.id}" && provider="${provider}"`
      );

      if (linkedProvider.isPrimary) {
        throw new Error('Non puoi scollegare il metodo di autenticazione principale');
      }

      await pb.collection('linked_auth_providers').delete(linkedProvider.id);
      return true;
    } catch (error) {
      throw error;
    }
  };

  // Get linked providers
  const getLinkedProviders = async () => {
    if (!user) return [];

    try {
      const providers = await pb.collection('linked_auth_providers').getFullList({
        filter: `user="${user.id}"`,
        sort: '-isPrimary,-lastUsedAt',
      });
      return providers;
    } catch (error) {
      console.error('Errore recupero provider:', error);
      return [];
    }
  };

  // Logout
  const logout = () => {
    pb.authStore.clear();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signup,
    login,
    loginWithOAuth,
    linkProvider,
    unlinkProvider,
    getLinkedProviders,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Step 3: Aggiorna Login.jsx

```javascript
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext.jsx";
// ... altri import

export function Login() {
  const navigate = useNavigate();
  const { login, loginWithOAuth } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      navigate('/dashboard');
    } catch (err) {
      setError('Email o password non validi');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleOAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithOAuth('google');
      navigate('/dashboard');
    } catch (err) {
      setError('Errore durante l\'autenticazione con Google');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGitHubOAuth = async () => {
    setError('');
    setLoading(true);
    try {
      await loginWithOAuth('github');
      navigate('/dashboard');
    } catch (err) {
      setError('Errore durante l\'autenticazione con GitHub');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... JSX esistente
    // Aggiungi visualizzazione errore:
    {error && (
      <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-400 text-sm">
        {error}
      </div>
    )}
  );
}
```

### Step 4: Aggiungi sezione in Settings.jsx

```javascript
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext.jsx";
// ... altri import

export function Settings() {
  const { user, linkProvider, unlinkProvider, getLinkedProviders } = useAuth();
  const [linkedProviders, setLinkedProviders] = useState([]);
  const [settings, setSettings] = useState({
    name: user?.username || '',
    email: user?.primaryEmail || '',
    // ... altri settings
  });

  useEffect(() => {
    loadLinkedProviders();
  }, []);

  const loadLinkedProviders = async () => {
    const providers = await getLinkedProviders();
    setLinkedProviders(providers);
  };

  const handleLinkProvider = async (provider) => {
    try {
      await linkProvider(provider);
      alert(`Account ${provider} collegato con successo!`);
      await loadLinkedProviders();
    } catch (error) {
      alert(error.message);
    }
  };

  const handleUnlinkProvider = async (provider) => {
    if (!window.confirm(`Vuoi scollegare ${provider}?`)) return;

    try {
      await unlinkProvider(provider);
      alert(`Account ${provider} scollegato`);
      await loadLinkedProviders();
    } catch (error) {
      alert(error.message);
    }
  };

  const isProviderLinked = (provider) => {
    return linkedProviders.some(p => p.provider === provider);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ... existing code ... */}

      {/* Nuova sezione: Linked Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-primary" />
            Account Collegati
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            {/* Google */}
            <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
                  {/* Google SVG logo */}
                  <svg width="20" height="20" viewBox="0 0 18 18">
                    {/* ... SVG path ... */}
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-white">Google</p>
                  {isProviderLinked('google') && (
                    <p className="text-xs text-gray-400">
                      {linkedProviders.find(p => p.provider === 'google')?.providerEmail}
                    </p>
                  )}
                </div>
              </div>
              {isProviderLinked('google') ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUnlinkProvider('google')}
                  disabled={linkedProviders.find(p => p.provider === 'google')?.isPrimary}
                >
                  Scollega
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLinkProvider('google')}
                >
                  Collega
                </Button>
              )}
            </div>

            {/* GitHub */}
            <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-medium text-white">GitHub</p>
                  {isProviderLinked('github') && (
                    <p className="text-xs text-gray-400">
                      {linkedProviders.find(p => p.provider === 'github')?.providerEmail}
                    </p>
                  )}
                </div>
              </div>
              {isProviderLinked('github') ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleUnlinkProvider('github')}
                  disabled={linkedProviders.find(p => p.provider === 'github')?.isPrimary}
                >
                  Scollega
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleLinkProvider('github')}
                >
                  Collega
                </Button>
              )}
            </div>

            {/* Email/Password */}
            <div className="flex items-center justify-between p-4 bg-surface-light rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-white">Email</p>
                  {isProviderLinked('email') && (
                    <p className="text-xs text-gray-400">
                      {linkedProviders.find(p => p.provider === 'email')?.providerEmail}
                    </p>
                  )}
                </div>
              </div>
              {isProviderLinked('email') ? (
                <span className="text-sm text-gray-400">
                  {linkedProviders.find(p => p.provider === 'email')?.isPrimary ? 'Principale' : 'Collegato'}
                </span>
              ) : (
                <span className="text-sm text-gray-400">Non disponibile</span>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-gray-700">
            <p className="text-xs text-gray-500">
              Puoi collegare più metodi di accesso al tuo account.
              Il metodo principale non può essere scollegato.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## 🔑 Riepilogo Concetti Chiave

### 1. OAuth = Login + Registrazione
- Un singolo click su "Continua con Google" può CREARE un account O fare LOGIN
- PocketBase gestisce tutto automaticamente

### 2. Email è la chiave
- PocketBase usa l'email per identificare univocamente gli utenti
- Se l'email esiste → Login
- Se l'email NON esiste → Registrazione

### 3. Multiple modalità di accesso
- La tabella `linked_auth_providers` permette di collegare più provider allo stesso account
- Un utente può registrarsi con email e poi collegare Google e GitHub
- Può fare login con qualsiasi metodo collegato

### 4. Provider primario
- `isPrimary: true` indica il metodo di registrazione originale
- Il metodo primario NON può essere scollegato
- Gli altri metodi possono essere aggiunti/rimossi liberamente

### 5. Tracking
- `lastLogin` e `LastLoginMethod` in `Auth` tracciano ultimo accesso
- `lastUsedAt` in `linked_auth_providers` traccia ultimo uso di ogni provider

---

## 📚 Risorse

- [PocketBase OAuth2 Docs](https://pocketbase.io/docs/authentication/#oauth2-integration)
- [React Router Docs](https://reactrouter.com/)
- [PocketBase JavaScript SDK](https://github.com/pocketbase/js-sdk)
