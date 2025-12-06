import PocketBase from 'pocketbase';
import { waitForOAuthCallback } from './deeplink.js';

// Initialize PocketBase with full URL (must include protocol)
const pb = new PocketBase('https://exptra.ddns.net');

// Disable auto-cancellation of pending requests
pb.autoCancellation(false);

// Log PocketBase configuration
console.log('PocketBase: Initialized with URL:', pb.baseUrl);
console.log('PocketBase: Auth store valid:', pb.authStore.isValid);

// Deep link redirect URI (configured on OAuth providers)
const DEEP_LINK_REDIRECT_URI = 'https://exptra.ddns.net/oauth/callback.html';

export const authService = {
    async login(email, password) {
        try {
            console.log('authService.login: Attempting login with email', email);
            const authData = await pb.collection('Auth').authWithPassword(email, password);
            console.log('authService.login: Authentication successful', authData.record.id);

            // Update last login information
            await pb.collection('Auth').update(authData.record.id, {
               lastLogin: new Date().toISOString(),
               lastLoginMethod: 'email'
            });

            console.log('authService.login: Login successful');
            return authData;
        } catch (e) {
            console.error('authService.login: Error', e);
            throw e;
        }
    },

    async loginOAuthGoogle() {
        try {
            console.log('authService.loginOAuthGoogle: Starting Google OAuth flow');

            // Detect platform
            const isMobile = window.Capacitor !== undefined;
            const isDesktop = window.__TAURI__ !== undefined;
            const isNativeApp = isMobile || isDesktop;

            console.log('authService.loginOAuthGoogle: Platform -', { isMobile, isDesktop, isNativeApp });

            if (isNativeApp) {
                // Native app flow (Capacitor or Tauri) - use deep linking
                console.log('authService.loginOAuthGoogle: Using native deep link flow');

                // Get OAuth URL from PocketBase
                const authMethods = await pb.collection('Auth').listAuthMethods();

                // Check if OAuth2 providers exist
                if (!authMethods || !authMethods.oauth2 || !authMethods.oauth2.providers) {
                    throw new Error('PocketBase OAuth non configurato correttamente');
                }

                const googleProvider = authMethods.oauth2.providers.find(p => p.name === 'google');

                if (!googleProvider) {
                    throw new Error('Google OAuth non configurato su PocketBase');
                }

                // Build OAuth URL with our redirect URI
                const oauthUrl = new URL(googleProvider.authUrl);
                oauthUrl.searchParams.set('redirect_uri', DEEP_LINK_REDIRECT_URI);

                console.log('authService.loginOAuthGoogle: OAuth URL:', oauthUrl.toString());

                // Open OAuth in system browser
                if (isMobile) {
                    console.log('authService.loginOAuthGoogle: Opening in mobile browser');
                    const { Browser } = await import('@capacitor/browser');
                    await Browser.open({
                        url: oauthUrl.toString(),
                        presentationStyle: 'popover'
                    });
                } else if (isDesktop) {
                    console.log('authService.loginOAuthGoogle: Opening in desktop browser');
                    await window.__TAURI__.shell.open(oauthUrl.toString());
                }

                // Wait for deep link callback with OAuth code
                console.log('authService.loginOAuthGoogle: Waiting for OAuth callback...');
                const { code, state } = await waitForOAuthCallback();

                console.log('authService.loginOAuthGoogle: OAuth code received, exchanging for token');

                // Exchange code for authentication token
                const authData = await pb.collection('Auth').authWithOAuth2Code(
                    googleProvider.name,
                    code,
                    googleProvider.codeVerifier,
                    DEEP_LINK_REDIRECT_URI,
                    // Additional create data for new users
                    {
                        emailVisibility: true
                    }
                );

                console.log('authService.loginOAuthGoogle: OAuth successful', authData.record.id);

                // Close browser on mobile
                if (isMobile) {
                    try {
                        const { Browser } = await import('@capacitor/browser');
                        await Browser.close();
                    } catch (err) {
                        console.warn('authService.loginOAuthGoogle: Failed to close browser (non-critical)', err);
                    }
                }

                // Update last login information
                try {
                    await pb.collection('Auth').update(authData.record.id, {
                        lastLogin: new Date().toISOString(),
                        lastLoginMethod: 'google'
                    });
                } catch (updateError) {
                    console.warn('authService.loginOAuthGoogle: Failed to update last login (non-critical)', updateError);
                }

                console.log('authService.loginOAuthGoogle: Login completed successfully');
                return authData;
            }

            // Web browser fallback - manual redirect flow
            console.log('authService.loginOAuthGoogle: Using manual redirect flow');

            try {
                // Get OAuth URL from PocketBase
                const authMethods = await pb.collection('Auth').listAuthMethods();

                if (!authMethods || !authMethods.oauth2 || !authMethods.oauth2.providers) {
                    throw new Error('PocketBase OAuth non configurato correttamente');
                }

                const googleProvider = authMethods.oauth2.providers.find(p => p.name === 'google');

                if (!googleProvider) {
                    throw new Error('Google OAuth non configurato su PocketBase');
                }

                console.log('authService.loginOAuthGoogle: Provider info:', googleProvider);
                console.log('authService.loginOAuthGoogle: Auth URL:', googleProvider.authUrl);

                // Store code verifier and state for later
                localStorage.setItem('pb_oauth_provider', 'google');
                localStorage.setItem('pb_oauth_code_verifier', googleProvider.codeVerifier);
                localStorage.setItem('pb_oauth_state', googleProvider.state);

                // Fix the redirect_uri to point to our React app, not PocketBase
                const redirectUri = `${window.location.origin}/oauth-callback`;
                let authUrl = googleProvider.authUrl;

                // If redirect_uri is empty in the URL, add it
                if (authUrl.includes('redirect_uri=&') || authUrl.endsWith('redirect_uri=')) {
                    authUrl = authUrl.replace(/redirect_uri=(&|$)/, `redirect_uri=${encodeURIComponent(redirectUri)}$1`);
                }

                console.log('authService.loginOAuthGoogle: Fixed Auth URL:', authUrl);
                console.log('authService.loginOAuthGoogle: Redirect URI:', redirectUri);

                // Redirect to OAuth provider (Google will redirect back to our React app)
                console.log('authService.loginOAuthGoogle: Redirecting to Google...');
                window.location.href = authUrl;

                // Never executes (page redirects)
                return new Promise(() => {});
            } catch (webError) {
                console.error('authService.loginOAuthGoogle: Web OAuth failed:', webError);
                throw webError;
            }
        } catch (e) {
            console.error('authService.loginOAuthGoogle: Error details:', {
                message: e.message,
                status: e.status,
                data: e.data,
                isAbort: e.isAbort
            });
            throw e;
        }
    },

    async loginOAuthGithub() {
        try {
            console.log('authService.loginOAuthGithub: Starting GitHub OAuth flow');

            // Detect platform
            const isMobile = window.Capacitor !== undefined;
            const isDesktop = window.__TAURI__ !== undefined;
            const isNativeApp = isMobile || isDesktop;

            console.log('authService.loginOAuthGithub: Platform -', { isMobile, isDesktop, isNativeApp });

            if (isNativeApp) {
                // Native app flow (Capacitor or Tauri) - use deep linking
                console.log('authService.loginOAuthGithub: Using native deep link flow');

                // Get OAuth URL from PocketBase
                const authMethods = await pb.collection('Auth').listAuthMethods();

                // Check if OAuth2 providers exist
                if (!authMethods || !authMethods.oauth2 || !authMethods.oauth2.providers) {
                    throw new Error('PocketBase OAuth non configurato correttamente');
                }

                const githubProvider = authMethods.oauth2.providers.find(p => p.name === 'github');

                if (!githubProvider) {
                    throw new Error('GitHub OAuth non configurato su PocketBase');
                }

                // Build OAuth URL with our redirect URI
                const oauthUrl = new URL(githubProvider.authUrl);
                oauthUrl.searchParams.set('redirect_uri', DEEP_LINK_REDIRECT_URI);

                console.log('authService.loginOAuthGithub: OAuth URL:', oauthUrl.toString());

                // Open OAuth in system browser
                if (isMobile) {
                    console.log('authService.loginOAuthGithub: Opening in mobile browser');
                    const { Browser } = await import('@capacitor/browser');
                    await Browser.open({
                        url: oauthUrl.toString(),
                        presentationStyle: 'popover'
                    });
                } else if (isDesktop) {
                    console.log('authService.loginOAuthGithub: Opening in desktop browser');
                    await window.__TAURI__.shell.open(oauthUrl.toString());
                }

                // Wait for deep link callback with OAuth code
                console.log('authService.loginOAuthGithub: Waiting for OAuth callback...');
                const { code, state } = await waitForOAuthCallback();

                console.log('authService.loginOAuthGithub: OAuth code received, exchanging for token');

                // Exchange code for authentication token
                const authData = await pb.collection('Auth').authWithOAuth2Code(
                    githubProvider.name,
                    code,
                    githubProvider.codeVerifier,
                    DEEP_LINK_REDIRECT_URI,
                    // Additional create data for new users
                    {
                        emailVisibility: true
                    }
                );

                console.log('authService.loginOAuthGithub: OAuth successful', authData.record.id);

                // Close browser on mobile
                if (isMobile) {
                    try {
                        const { Browser } = await import('@capacitor/browser');
                        await Browser.close();
                    } catch (err) {
                        console.warn('authService.loginOAuthGithub: Failed to close browser (non-critical)', err);
                    }
                }

                // Update last login information
                try {
                    await pb.collection('Auth').update(authData.record.id, {
                        lastLogin: new Date().toISOString(),
                        lastLoginMethod: 'github'
                    });
                } catch (updateError) {
                    console.warn('authService.loginOAuthGithub: Failed to update last login (non-critical)', updateError);
                }

                console.log('authService.loginOAuthGithub: Login completed successfully');
                return authData;
            }

            // Web browser fallback - manual redirect flow
            console.log('authService.loginOAuthGithub: Using manual redirect flow');

            try {
                // Get OAuth URL from PocketBase
                const authMethods = await pb.collection('Auth').listAuthMethods();

                if (!authMethods || !authMethods.oauth2 || !authMethods.oauth2.providers) {
                    throw new Error('PocketBase OAuth non configurato correttamente');
                }

                const githubProvider = authMethods.oauth2.providers.find(p => p.name === 'github');

                if (!githubProvider) {
                    throw new Error('GitHub OAuth non configurato su PocketBase');
                }

                console.log('authService.loginOAuthGithub: Provider info:', githubProvider);
                console.log('authService.loginOAuthGithub: Auth URL:', githubProvider.authUrl);

                // Store code verifier and state for later
                localStorage.setItem('pb_oauth_provider', 'github');
                localStorage.setItem('pb_oauth_code_verifier', githubProvider.codeVerifier);
                localStorage.setItem('pb_oauth_state', githubProvider.state);

                // Fix the redirect_uri to point to our React app, not PocketBase
                const redirectUri = `${window.location.origin}/oauth-callback`;
                let authUrl = githubProvider.authUrl;

                // If redirect_uri is empty in the URL, add it
                if (authUrl.includes('redirect_uri=&') || authUrl.endsWith('redirect_uri=')) {
                    authUrl = authUrl.replace(/redirect_uri=(&|$)/, `redirect_uri=${encodeURIComponent(redirectUri)}$1`);
                }

                console.log('authService.loginOAuthGithub: Fixed Auth URL:', authUrl);
                console.log('authService.loginOAuthGithub: Redirect URI:', redirectUri);

                // Redirect to OAuth provider (GitHub will redirect back to our React app)
                console.log('authService.loginOAuthGithub: Redirecting to GitHub...');
                window.location.href = authUrl;

                // Never executes (page redirects)
                return new Promise(() => {});
            } catch (webError) {
                console.error('authService.loginOAuthGithub: Web OAuth failed:', webError);
                throw webError;
            }
        } catch (e) {
            console.error('authService.loginOAuthGithub: Error details:', {
                message: e.message,
                status: e.status,
                data: e.data,
                isAbort: e.isAbort
            });
            throw e;
        }
    },

    async signup(email, password, username) {
        try {
            const data = {
                email: email,
                password: password,
                passwordConfirm: password,
                username: username,
                emailVisibility: true,
                verified: false,
                valuta: 'EUR',
                lingua: 'IT',
                primaryAuthMethod: 'email',
                primaryEmail: email,
                lastLogin: new Date().toISOString(),
                lastLoginMethod: 'email'
            }

            console.log('authService.signup: Creating user', email);
            const user = await pb.collection('Auth').create(data);
            console.log('authService.signup: User created successfully', user.id);

            // Create default categories for new user (don't block signup if this fails)
            try {
                console.log('authService.signup: Creating default categories for user');
                await categoriesService.createDefaultCategories(user.id);
                console.log('authService.signup: Default categories created');
            } catch (catError) {
                console.warn('authService.signup: Failed to create default categories (non-critical)', catError);
                // Continue with signup even if categories fail
            }

            // Auto-login after signup
            console.log('authService.signup: Auto-login after signup');
            return this.login(email, password);

        } catch (e) {
            console.error('authService.signup: Error', e);
            throw e;
        }
    },

    logout() {
        try {
            console.log('authService.logout: Clearing auth store');
            pb.authStore.clear();
            console.log('authService.logout: Logout successful');
        } catch (e) {
            console.error('authService.logout: Error', e);
            throw e;
        }
    },

    getCurrentUser() {
        if (this.isAuthenticated()) {
            const user = pb.authStore.model;
            console.log('authService.getCurrentUser: User is authenticated', user.id);
            return user;
        } else {
            const error = new Error('User not authenticated');
            console.error('authService.getCurrentUser: Error', error);
            throw error;
        }
    },

    isAuthenticated() {
        const isValid = pb.authStore.isValid;
        console.log('authService.isAuthenticated:', isValid);
        return isValid;
    },

    onAuthChange(callback) {
        console.log('authService.onAuthChange: Subscribing to auth changes');
        return pb.authStore.onChange((token, model) => {
            console.log('authService.onAuthChange: Auth state changed', model ? model.id : 'logged out');
            callback(model);
        });
    }
};

export const expensesService = {
    /**
     * Get all expenses for the authenticated user
     * @returns {Promise<Array>} Array of expense records with expanded category
     */
    async getAll() {
        try {
            console.log('expensesService.getAll: Fetching all expenses');

            const records = await pb.collection('expenses').getFullList({
                sort: '-date', // Sort by date descending (newest first)
                expand: 'category' // Include category details
            });

            console.log('expensesService.getAll: Fetched', records.length, 'expenses');
            return records;
        } catch (e) {
            console.error('expensesService.getAll: Error', e);
            throw e;
        }
    },

    /**
     * Create a new expense
     * @param {Object} data - Expense data
     * @returns {Promise<Object>} Created expense record
     */
    async create(data) {
        try {
            console.log('expensesService.create: Creating new expense', data.description);

            // Get authenticated user ID
            const userID = pb.authStore.model?.id;
            if (!userID) {
                const error = new Error('User not authenticated');
                console.error('expensesService.create: Error - not authenticated');
                throw error;
            }

            // Get category ID - handle both 'category' and 'categoryID' field names
            let categoryID = data.categoryID || data.category;
            if (!categoryID) {
                console.log('expensesService.create: No categoryID provided, using first category');
                const categories = await categoriesService.getAll();
                categoryID = categories[0]?.id;
                console.log('expensesService.create: Using category', categoryID);
            }

            // Build expense data object
            const expenseData = {
                user: userID,
                category: categoryID,
                title: data.title || '',
                amount: data.amount,
                currency: data.currency || 'EUR',
                description: data.description || '',
                notes: data.notes || '',
                date: data.date,
                paymentMethod: data.paymentMethod || 'card',
                isRecurring: data.isRecurring || false
            };

            console.log('expensesService.create: Saving expense to database');
            const record = await pb.collection('expenses').create(expenseData);
            console.log('expensesService.create: Expense created successfully', record.id);

            return record;

        } catch(e) {
            console.error('expensesService.create: Error', e);
            throw e;
        }
    },

    /**
     * Update an existing expense
     * @param {string} id - Expense ID
     * @param {Object} data - Updated expense data
     * @returns {Promise<Object>} Updated expense record
     */
    async update(id, data) {
        try {
            console.log('expensesService.update: Updating expense', id);

            // Build update data object
            const updateData = {
                title: data.title || '',
                amount: data.amount,
                currency: data.currency || 'EUR',
                description: data.description || '',
                notes: data.notes || '',
                date: data.date,
                paymentMethod: data.paymentMethod || 'card',
                isRecurring: data.isRecurring || false
            };

            // Update category if provided - handle both 'category' and 'categoryID' field names
            if (data.categoryID || data.category) {
                updateData.category = data.categoryID || data.category;
                console.log('expensesService.update: Updating category to', updateData.category);
            }

            const record = await pb.collection('expenses').update(id, updateData);
            console.log('expensesService.update: Expense updated successfully');

            return record;

        } catch (e) {
            console.error('expensesService.update: Error', e);
            throw e;
        }
    },

    /**
     * Delete an expense
     * @param {string} id - Expense ID
     * @returns {Promise<boolean>} True if successful
     */
    async delete(id) {
        try {
            console.log('expensesService.delete: Deleting expense', id);
            await pb.collection('expenses').delete(id);
            console.log('expensesService.delete: Expense deleted successfully');
            return true;
        } catch (e) {
            console.error('expensesService.delete: Error', e);
            throw e;
        }
    }
};

export const categoriesService = {
    /**
     * Get all categories for the authenticated user
     * @returns {Promise<Array>} Array of category records
     */
    async getAll() {
        try {
            console.log('categoriesService.getAll: Fetching all categories');

            const records = await pb.collection('categories').getFullList({
                sort: 'name' // Sort alphabetically by name
            });

            console.log('categoriesService.getAll: Fetched', records.length, 'categories');
            return records;
        } catch (e) {
            console.error('categoriesService.getAll: Error', e);
            throw e;
        }
    },

    /**
     * Create a new category
     * @param {Object} data - Category data
     * @returns {Promise<Object>} Created category record
     */
    async create(data) {
        try {
            console.log('categoriesService.create: Creating new category', data.name);

            // Get authenticated user ID
            const userID = pb.authStore.model?.id;
            if (!userID) {
                const error = new Error('User not authenticated');
                console.error('categoriesService.create: Error - not authenticated');
                throw error;
            }

            // Build category data object
            const categoryData = {
                user: userID,
                name: data.name,
                description: data.description || '',
                color: data.color,
                icon: data.icon,
                isDefault: data.isDefault || false
            };

            console.log('categoriesService.create: Saving category to database');
            const record = await pb.collection('categories').create(categoryData);
            console.log('categoriesService.create: Category created successfully', record.id);

            return record;

        } catch (e) {
            console.error('categoriesService.create: Error', e);
            throw e;
        }
    },

    async createDefaultCategories(userID) {
        const defaultCategories = [
            { name: 'spesa', description: 'Spesa alimentare', color: '#3B82F6', icon: 'ShoppingBag', isDefault: true },
            { name: 'cibo', description: 'Ristoranti e cibo fuori', color: '#F97316', icon: 'Coffee', isDefault: true },
            { name: 'trasporti', description: 'Trasporti e benzina', color: '#10B981', icon: 'Car', isDefault: true },
            { name: 'casa', description: 'Casa e arredamento', color: '#A855F7', icon: 'Home', isDefault: true },
            { name: 'utilità', description: 'Bollette e utenze', color: '#FBBF24', icon: 'Zap', isDefault: true },
            { name: 'intrattenimento', description: 'Intrattenimento e svago', color: '#EC4899', icon: 'Smartphone', isDefault: true }
        ];

        try {
            console.log('categoriesService.createDefaultCategories: Creating default categories for user', userID);

            // Create each default category
            for (const category of defaultCategories) {
                const categoryData = {
                    user: userID,
                    ...category
                };

                await pb.collection('categories').create(categoryData);
                console.log('categoriesService.createDefaultCategories: Created category', category.name);
            }

            console.log('categoriesService.createDefaultCategories: All default categories created successfully');
        } catch (e) {
            console.error('categoriesService.createDefaultCategories: Error', e);
            throw e;
        }
    },

    /**
     * Update an existing category
     * @param {string} id - Category ID
     * @param {Object} data - Updated category data
     * @returns {Promise<Object>} Updated category record
     */
    async update(id, data) {
        try {
            console.log('categoriesService.update: Updating category', id);

            // Build update data object
            const updateData = {
                name: data.name,
                description: data.description || '',
                color: data.color,
                icon: data.icon,
                isDefault: data.isDefault || false
            };

            const record = await pb.collection('categories').update(id, updateData);
            console.log('categoriesService.update: Category updated successfully');

            return record;
        } catch(e) {
            console.error('categoriesService.update: Error', e);
            throw e;
        }
    },

    /**
     * Delete a category
     * @param {string} id - Category ID
     * @returns {Promise<boolean>} True if successful
     */
    async delete(id) {
        try {
            console.log('categoriesService.delete: Deleting category', id);
            await pb.collection('categories').delete(id);
            console.log('categoriesService.delete: Category deleted successfully');
            return true;
        } catch (e) {
            console.error('categoriesService.delete: Error', e);
            throw e;
        }
    }
};

export const cardService = {
    /**
     * Get all cards for the authenticated user
     * @returns {Promise<Array>} Array of cards records
     */
    async getAll() {
        try {
            console.log('cardService.getAll: Fetching all cards');

            const records = await pb.collection('credit_cards').getFullList({
                sort: '-created' // Sort by creation date descending
            });

            console.log('cardService.getAll: Fetched', records.length, 'cards');
            return records;
        } catch (e) {
            console.error('cardService.getAll: Error', e);
            throw e;
        }
    },

    /**
     * Create a new card (max:5)
     * @param {Object} data - card data
     * @returns {Promise<Object>} Created card record
     */
    async create(data) {
        try {
            console.log('cardService.create: Creating new card', data.number);

            // Get authenticated user ID
            const userID = pb.authStore.model?.id;
            if (!userID) {
                const error = new Error('User not authenticated');
                console.error('cardService.create: Error - not authenticated');
                throw error;
            }

            // Build card data object matching PocketBase schema
            const cardData = {
                user: userID,
                payment_circuit: data.circuit,      // visa, mastercard, amex, maestro
                card_type: data.type,               // debit, credit
                card_holder: data.holder,
                last_four_digits: data.number.replace(/[•\s]/g, ''), // Remove bullets and spaces
                expiration_date: data.expiration,
                isDefault: data.isDefault || false,
                color_variant: data.variant || 'gradient-purple'
            };

            console.log('cardService.create: Saving card to database', cardData);
            const record = await pb.collection('credit_cards').create(cardData);
            console.log('cardService.create: Card created successfully', record.id);

            return record;

        } catch(e) {
            console.error('cardService.create: Error', e);
            throw e;
        }
    },

    /**
     * Update an existing card
     * @param {string} id - Card ID
     * @param {Object} data - Updated card data
     * @returns {Promise<Object>} Updated card record
     */
    async update(id, data) {
        try {
            console.log('cardService.update: Updating card', id);

            // Build update data object matching PocketBase schema
            const updateData = {
                payment_circuit: data.circuit,      // visa, mastercard, amex, maestro
                card_type: data.type,               // debit, credit
                card_holder: data.holder,
                expiration_date: data.expiration,
                isDefault: data.isDefault || false,
                color_variant: data.variant || 'gradient-purple'
            };

            const record = await pb.collection('credit_cards').update(id, updateData);
            console.log('cardService.update: Card updated successfully');

            return record;

        } catch (e) {
            console.error('cardService.update: Error', e);
            throw e;
        }
    },

    /**
     * Delete a card
     * @param {string} id - Card ID
     * @returns {Promise<boolean>} True if successful
     */
    async delete(id) {
        try {
            console.log('cardService.delete: Deleting card', id);
            await pb.collection('credit_cards').delete(id);
            console.log('cardService.delete: Card deleted successfully');
            return true;
        } catch (e) {
            console.error('cardService.delete: Error', e);
            throw e;
        }
    }
};

export default pb;