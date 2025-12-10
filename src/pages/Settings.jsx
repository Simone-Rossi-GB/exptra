import { useState, useEffect } from "react";
import { AppLayout } from "../components/layout/AppLayout.jsx";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card.jsx";
import { Button } from "../components/ui/button.jsx";
import { Input } from "../components/ui/input.jsx";
import { Select } from "../components/ui/select.jsx";
import { useAuth } from "../contexts/AuthContext.jsx";
import { useToast } from "../components/ui/toast.jsx";
import { useI18n } from "../contexts/I18nContext.jsx";
import pb from "../lib/pocketBase.js";
import {
  User,
  Mail,
  Lock,
  Globe,
  DollarSign,
  Moon,
  Sun,
  Download,
  Trash2,
  Save,
} from "lucide-react";

const CURRENCIES = [
  { value: 'EUR', label: '€ EUR - Euro', symbol: '€' },
  { value: 'USD', label: '$ USD - Dollaro Americano', symbol: '$' },
  { value: 'GBP', label: '£ GBP - Sterlina', symbol: '£' },
  { value: 'JPY', label: '¥ JPY - Yen', symbol: '¥' },
  { value: 'CHF', label: 'CHF - Franco Svizzero', symbol: 'CHF' },
];

const LANGUAGES = [
  { value: 'it', label: '🇮🇹 Italiano' },
  { value: 'en', label: '🇬🇧 English' },
  { value: 'fr', label: '🇫🇷 Français' },
];

export function Settings() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const { t, changeLanguage } = useI18n();

  // Settings state
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [language, setLanguage] = useState('it');
  const [theme, setTheme] = useState('dark');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, [user]);

  const loadSettings = async () => {
    try {
      if (!user) return;

      console.log('Settings: Loading user settings');
      const userRecord = await pb.collection('Auth').getOne(user.id);

      setUsername(userRecord.username || '');
      setEmail(userRecord.email || '');

      // Load preferences from JSON field
      const prefs = userRecord.preferences || {};
      setCurrency(prefs.currency || 'EUR');
      setLanguage(prefs.language || 'it');
      setTheme(prefs.theme || 'dark');

      console.log('Settings: Loaded preferences', prefs);
    } catch (err) {
      console.error('Settings: Error loading settings', err);
      toast.error('Errore nel caricamento delle impostazioni', { duration: 3000 });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!username.trim()) {
      toast.error('Il nome utente non può essere vuoto', { duration: 3000 });
      return;
    }

    if (!email.trim()) {
      toast.error('L\'email non può essere vuota', { duration: 3000 });
      return;
    }

    setSaving(true);
    try {
      console.log('Settings: Saving profile', { username, email });

      await pb.collection('Auth').update(user.id, {
        username: username.trim(),
        email: email.trim()
      });

      toast.success('Profilo aggiornato con successo', { duration: 3000 });
    } catch (err) {
      console.error('Settings: Error saving profile', err);
      toast.error('Errore nel salvare il profilo: ' + err.message, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      console.log('Settings: Saving preferences', { currency, language, theme });

      // Save preferences as JSON object
      await pb.collection('Auth').update(user.id, {
        preferences: {
          currency: currency,
          language: language,
          theme: theme
        }
      });

      // Save theme to localStorage
      localStorage.setItem('theme', theme);

      // Apply theme immediately
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Update language in i18n context
      changeLanguage(language);

      toast.success('Preferenze aggiornate con successo', { duration: 3000 });
    } catch (err) {
      console.error('Settings: Error saving preferences', err);
      toast.error('Errore nel salvare le preferenze: ' + err.message, { duration: 5000 });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Compila tutti i campi della password', { duration: 3000 });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Le nuove password non corrispondono', { duration: 3000 });
      return;
    }

    if (newPassword.length < 8) {
      toast.error('La password deve essere di almeno 8 caratteri', { duration: 3000 });
      return;
    }

    setChangingPassword(true);
    try {
      console.log('Settings: Changing password');

      // Verify current password by attempting to authenticate
      await pb.collection('Auth').authWithPassword(email, currentPassword);

      // Change password
      await pb.collection('Auth').update(user.id, {
        password: newPassword,
        passwordConfirm: newPassword
      });

      // Clear password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');

      toast.success('Password cambiata con successo', { duration: 3000 });
    } catch (err) {
      console.error('Settings: Error changing password', err);
      if (err.status === 400) {
        toast.error('Password attuale non corretta', { duration: 5000 });
      } else {
        toast.error('Errore nel cambiare la password: ' + err.message, { duration: 5000 });
      }
    } finally {
      setChangingPassword(false);
    }
  };

  const handleExportData = async () => {
    try {
      console.log('Settings: Exporting data');
      toast.info('Esportazione dati in corso...', { duration: 2000 });

      // Get all user data
      const [expenses, categories, cards] = await Promise.all([
        pb.collection('expenses').getFullList({ filter: `user="${user.id}"`, expand: 'category' }),
        pb.collection('categories').getFullList({ filter: `user="${user.id}"` }),
        pb.collection('credit_cards').getFullList({ filter: `user="${user.id}"` })
      ]);

      const exportData = {
        user: {
          id: user.id,
          username: username,
          email: email,
          currency: currency,
          language: language
        },
        expenses,
        categories,
        cards,
        exportDate: new Date().toISOString()
      };

      // Create download
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `exptra-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success('Dati esportati con successo', { duration: 3000 });
    } catch (err) {
      console.error('Settings: Error exporting data', err);
      toast.error('Errore nell\'esportazione dei dati: ' + err.message, { duration: 5000 });
    }
  };

  const handleDeleteAllData = async () => {
    const confirm1 = window.confirm(
      'ATTENZIONE: Questa azione eliminerà TUTTI i tuoi dati (spese, categorie, carte) in modo PERMANENTE. Sei sicuro?'
    );

    if (!confirm1) return;

    const confirm2 = window.confirm(
      'ULTIMA CONFERMA: I dati eliminati NON possono essere recuperati. Vuoi procedere?'
    );

    if (!confirm2) return;

    try {
      console.log('Settings: Deleting all user data');

      // Delete all expenses
      const expenses = await pb.collection('expenses').getFullList({ filter: `user="${user.id}"` });
      for (const expense of expenses) {
        await pb.collection('expenses').delete(expense.id);
      }

      // Delete all cards
      const cards = await pb.collection('credit_cards').getFullList({ filter: `user="${user.id}"` });
      for (const card of cards) {
        await pb.collection('credit_cards').delete(card.id);
      }

      // Delete all categories
      const categories = await pb.collection('categories').getFullList({ filter: `user="${user.id}"` });
      for (const category of categories) {
        await pb.collection('categories').delete(category.id);
      }

      toast.success('Tutti i dati sono stati eliminati', { duration: 3000 });

      // Reload page to refresh state
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      console.error('Settings: Error deleting data', err);
      toast.error('Errore nell\'eliminazione dei dati: ' + err.message, { duration: 5000 });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-600 dark:text-gray-400">Caricamento impostazioni...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Impostazioni</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Gestisci il tuo account e le preferenze</p>
        </div>

        {/* Profile Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Profilo Utente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nome Utente</label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Il tuo nome"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tua@email.com"
              />
            </div>

            <Button onClick={handleSaveProfile} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva Profilo'}
            </Button>
          </CardContent>
        </Card>

        {/* Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-primary" />
              Preferenze
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Select
                label={
                  <span>
                    <DollarSign className="w-4 h-4 inline mr-1" />
                    Valuta Predefinita
                  </span>
                }
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                options={CURRENCIES}
              />
              <p className="text-xs text-gray-600 dark:text-gray-500">La conversione avviene automaticamente in locale</p>
            </div>

            <div className="space-y-2">
              <Select
                label={
                  <span>
                    <Globe className="w-4 h-4 inline mr-1" />
                    Lingua
                  </span>
                }
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                options={LANGUAGES}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {theme === 'dark' ? <Moon className="w-4 h-4 inline mr-1" /> : <Sun className="w-4 h-4 inline mr-1" />}
                Tema
              </label>
              <div className="flex gap-2">
                <Button
                  variant={theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => setTheme('dark')}
                  className="flex-1"
                >
                  <Moon className="w-4 h-4 mr-2" />
                  Scuro
                </Button>
                <Button
                  variant={theme === 'light' ? 'default' : 'outline'}
                  onClick={() => setTheme('light')}
                  className="flex-1"
                >
                  <Sun className="w-4 h-4 mr-2" />
                  Chiaro
                </Button>
              </div>
            </div>

            <Button onClick={handleSavePreferences} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Salvataggio...' : 'Salva Preferenze'}
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Cambia Password
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password Attuale</label>
              <Input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Nuova Password</label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Conferma Nuova Password</label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <Button onClick={handleChangePassword} disabled={changingPassword} className="w-full">
              <Lock className="w-4 h-4 mr-2" />
              {changingPassword ? 'Cambio in corso...' : 'Cambia Password'}
            </Button>
          </CardContent>
        </Card>

        {/* Data Management */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Gestione Dati
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Button onClick={handleExportData} variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Esporta Tutti i Dati (JSON)
              </Button>
              <p className="text-xs text-gray-600 dark:text-gray-500 mt-2">
                Scarica una copia di tutti i tuoi dati (spese, categorie, carte)
              </p>
            </div>

            <div className="border-t border-gray-800 pt-4">
              <Button
                onClick={handleDeleteAllData}
                variant="outline"
                className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Elimina Tutti i Dati
              </Button>
              <p className="text-xs text-red-400 mt-2">
                ATTENZIONE: Questa azione è irreversibile e eliminerà tutti i tuoi dati
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
