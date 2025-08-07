class GestPrev {
    constructor() {
        this.services = [];
        this.employes = [];
        this.planning = [];
        this.isAuthenticated = false;
    }

    init() {
        // Vérifier l'authentification d'abord
        this.checkAuthentication();
        
        if (!this.isAuthenticated) {
            this.setupAuthentication();
            return;
        }
        
        // ===== SYNCHRONISATION UNIVERSELLE AUTOMATIQUE =====
        this.loadFromLocalStorage();
        
        // Synchroniser automatiquement avec le cloud pour TOUS les comptes
        this.syncWithCloud().then(() => {
            console.log('✅ Synchronisation universelle terminée');
            
            // Créer des données de test si aucune donnée n'existe
            if (this.services.length === 0 || this.employes.length === 0) {
                console.log('Création des données de test...');
                this.createTestData();
            }
            
            // ===== VÉRIFICATION ET RESTAURATION DE LA CONFIGURATION =====
            this.ensureDefaultConfiguration();
            
            this.setupEventListeners();
            this.setupCheckboxHandlers();
            this.updateAllSelects();
            this.displayServices();
            this.displayEmployes();
            
            // Initialiser l'affichage vide du planning
            this.initializePlanningDisplay();
            
            // Afficher une notification de synchronisation réussie
            this.showNotification('Données synchronisées avec tous les comptes', 'success');
            
        }).catch((error) => {
            console.error('❌ Erreur lors de la synchronisation universelle:', error);
            
            // Continuer avec les données locales en cas d'erreur
            if (this.services.length === 0 || this.employes.length === 0) {
                console.log('Création des données de test...');
                this.createTestData();
            }
            
            this.ensureDefaultConfiguration();
            this.setupEventListeners();
            this.setupCheckboxHandlers();
            this.updateAllSelects();
            this.displayServices();
            this.displayEmployes();
            this.initializePlanningDisplay();
        });
    }

    // ===== AUTHENTIFICATION =====
    checkAuthentication() {
        console.log('🔍 Vérification de l\'authentification...');
        
        const authToken = localStorage.getItem('gestPrevAuth');
        if (authToken) {
            try {
                const authData = JSON.parse(authToken);
                const now = Date.now();
                // Token valide pendant 24h
                if (authData.expires > now) {
                    console.log('✅ Token valide trouvé');
                    this.isAuthenticated = true;
                    document.body.classList.add('authenticated');
                    
                    // MASQUAGE FORCÉ de l'overlay d'authentification
                    const authOverlay = document.getElementById('auth-overlay');
                    if (authOverlay) {
                        authOverlay.style.display = 'none !important';
                        authOverlay.style.visibility = 'hidden !important';
                        authOverlay.style.opacity = '0 !important';
                        authOverlay.style.zIndex = '-1 !important';
                        authOverlay.style.pointerEvents = 'none !important';
                    }
                    
                    // FORCAGE de l'affichage du contenu principal
                    const mainHeader = document.querySelector('.main-header');
                    const moduleBanner = document.querySelector('.module-banner');
                    const mainContent = document.querySelector('.main-content');
                    
                    if (mainHeader) {
                        mainHeader.style.display = 'block !important';
                        mainHeader.style.visibility = 'visible !important';
                        mainHeader.style.opacity = '1 !important';
                    }
                    if (moduleBanner) {
                        moduleBanner.style.display = 'block !important';
                        moduleBanner.style.visibility = 'visible !important';
                        moduleBanner.style.opacity = '1 !important';
                    }
                    if (mainContent) {
                        mainContent.style.display = 'block !important';
                        mainContent.style.visibility = 'visible !important';
                        mainContent.style.opacity = '1 !important';
                    }
                    
                    console.log('✅ Authentification réussie - Interface affichée');
                    return;
                }
            } catch (e) {
                console.error('❌ Erreur lors de la vérification du token:', e);
            }
        }
        
        console.log('❌ Pas de token valide - Affichage de la page de connexion');
        this.isAuthenticated = false;
        document.body.classList.remove('authenticated');
        
        // Afficher l'overlay d'authentification si pas connecté
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) {
            authOverlay.style.display = 'flex';
            authOverlay.style.visibility = 'visible';
            authOverlay.style.opacity = '1';
        }
        
        // Masquer le contenu principal
        const mainHeader = document.querySelector('.main-header');
        const moduleBanner = document.querySelector('.module-banner');
        const mainContent = document.querySelector('.main-content');
        
        if (mainHeader) {
            mainHeader.style.display = 'none';
            mainHeader.style.visibility = 'hidden';
        }
        if (moduleBanner) {
            moduleBanner.style.display = 'none';
            moduleBanner.style.visibility = 'hidden';
        }
        if (mainContent) {
            mainContent.style.display = 'none';
            mainContent.style.visibility = 'hidden';
        }
    }
    setupAuthentication() {
        const loginForm = document.getElementById('login-form');
        const authOverlay = document.getElementById('auth-overlay');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Masquer le contenu principal
        document.body.classList.remove('authenticated');
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Identifiants de test
        const validCredentials = {
            'admin': 'gestprev2024',
            'rh': 'rh2024',
            'ca': 'ca2024'
        };
        
        if (validCredentials[username] && validCredentials[username] === password) {
            // Nettoyer l'état précédent
            this.services = [];
            this.employes = [];
            this.planning = [];
            
            // Créer un token d'authentification
            const authData = {
                username: username,
                expires: Date.now() + (24 * 60 * 60 * 1000), // 24h
                timestamp: Date.now()
            };
            
            localStorage.setItem('gestPrevAuth', JSON.stringify(authData));
            this.isAuthenticated = true;
            document.body.classList.add('authenticated');
            
            // Masquer l'overlay d'authentification
            const authOverlay = document.getElementById('auth-overlay');
            if (authOverlay) {
                authOverlay.style.display = 'none';
            }
            
            // Afficher le contenu principal
            const mainHeader = document.querySelector('.main-header');
            if (mainHeader) {
                mainHeader.style.display = 'block';
            }
            
            // Initialiser l'application après authentification
            this.loadFromLocalStorage();
            
            // Créer des données de test si nécessaire
            if (this.services.length === 0 || this.employes.length === 0) {
                this.createTestData();
            }
            
            // Configuration et affichage
            this.ensureDefaultConfiguration();
            this.setupEventListeners();
            this.setupCheckboxHandlers();
            this.updateAllSelects();
            this.displayServices();
            this.displayEmployes();
            this.initializePlanningDisplay();
            
            this.showNotification('Connexion réussie ! Bienvenue dans GEST PREV.', 'success');
        } else {
            this.showNotification('Identifiants incorrects. Veuillez réessayer.', 'error');
            
            // Vider le champ mot de passe en cas d'erreur
            const passwordField = document.getElementById('password');
            if (passwordField) passwordField.value = '';
        }
    }

    logout() {
        // Nettoyer complètement l'authentification
        localStorage.removeItem('gestPrevAuth');
        this.isAuthenticated = false;
        document.body.classList.remove('authenticated');
        
        // Réinitialiser l'état de l'application
        this.services = [];
        this.employes = [];
        this.planning = [];
        
        // Afficher l'overlay d'authentification
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) {
            authOverlay.style.display = 'flex';
            authOverlay.style.visibility = 'visible';
            authOverlay.style.opacity = '1';
        }
        
        // Masquer le contenu principal
        const mainHeader = document.querySelector('.main-header');
        if (mainHeader) {
            mainHeader.style.display = 'none';
            mainHeader.style.visibility = 'hidden';
        }
        
        // Masquer tous les modules
        document.querySelectorAll('.module-content').forEach(module => {
            module.classList.remove('active');
        });
        
        // Masquer toutes les sections
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Masquer tous les onglets
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Vider les champs de connexion
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if (usernameField) usernameField.value = '';
        if (passwordField) passwordField.value = '';
        
        this.showNotification('Déconnexion réussie.', 'info');
        
        // Forcer la vérification d'authentification
        setTimeout(() => {
            this.checkAuthentication();
        }, 100);
    }

    // ===== FORCE LOGOUT - NETTOYAGE COMPLET =====
    forceLogout() {
        console.log('Force logout en cours...');
        
        // Nettoyer complètement le localStorage
        localStorage.clear();
        
        // Nettoyer les cookies si possible
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Réinitialiser complètement l'état
        this.isAuthenticated = false;
        this.services = [];
        this.employes = [];
        this.planning = [];
        
        // Supprimer toutes les classes d'authentification
        document.body.classList.remove('authenticated');
        
        // Forcer l'affichage de l'overlay d'authentification
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) {
            authOverlay.style.display = 'flex';
            authOverlay.style.visibility = 'visible';
            authOverlay.style.opacity = '1';
            authOverlay.style.zIndex = '9999';
        }
        
        // Masquer complètement le contenu principal
        const mainHeader = document.querySelector('.main-header');
        const moduleBanner = document.querySelector('.module-banner');
        const mainContent = document.querySelector('.main-content');
        
        if (mainHeader) {
            mainHeader.style.display = 'none';
            mainHeader.style.visibility = 'hidden';
        }
        if (moduleBanner) {
            moduleBanner.style.display = 'none';
            moduleBanner.style.visibility = 'hidden';
        }
        if (mainContent) {
            mainContent.style.display = 'none';
            mainContent.style.visibility = 'hidden';
        }
        
        // Masquer tous les modules, sections et onglets
        document.querySelectorAll('.module-content, .module-section, .tab-btn').forEach(element => {
            element.classList.remove('active');
            element.style.display = 'none';
        });
        
        // Vider les champs de connexion
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if (usernameField) usernameField.value = '';
        if (passwordField) passwordField.value = '';
        
        // Forcer le rechargement des styles CSS
        this.reloadCSS();
        
        // Nettoyer le cache du navigateur
        this.clearBrowserCache();
        
        // Forcer le rechargement de la page après un délai
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
        
        this.showNotification('Déconnexion forcée effectuée. La page va se recharger.', 'info');
    }

    // ===== RECHARGEMENT CSS =====
    reloadCSS() {
        // Recharger tous les fichiers CSS
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            const href = link.href;
            link.href = '';
            link.href = href + '?v=' + Date.now();
        });
        
        // Forcer le rechargement des styles inline
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                if (rules) {
                    // Forcer le rechargement en modifiant temporairement
                    styleSheets[i].disabled = true;
                    setTimeout(() => {
                        styleSheets[i].disabled = false;
                    }, 100);
                }
            } catch (e) {
                // Ignorer les erreurs CORS
            }
        }
    }

    // ===== NETTOYAGE CACHE NAVIGATEUR =====
    clearBrowserCache() {
        // Essayer de nettoyer le cache via l'API Cache
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // Nettoyer le sessionStorage
        sessionStorage.clear();
        
        // Forcer le rechargement des images et autres ressources
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const src = img.src;
            img.src = '';
            img.src = src + '?v=' + Date.now();
        });
    }

    // ===== CONFIGURATION VERROUILLÉE =====
    ensureDefaultConfiguration() {
    // Vérifier et restaurer la configuration par défaut
    const config = JSON.parse(localStorage.getItem('gestPrevConfig') || '{}');
    
    // S'assurer que le module RH est actif
    const rhModule = document.getElementById('rh-module');
    if (rhModule && !rhModule.classList.contains('active')) {
        document.querySelectorAll('.module-content').forEach(module => {
            module.classList.remove('active');
        });
        rhModule.classList.add('active');
    }
    
    // S'assurer que la section Présentation est active
    const presentationSection = document.getElementById('rh-presentation');
    if (presentationSection && !presentationSection.classList.contains('active')) {
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });
        presentationSection.classList.add('active');
    }
    
    // S'assurer que l'onglet Présentation est actif
    const presentationTab = document.querySelector('[data-tab="rh-presentation"]');
    if (presentationTab && !presentationTab.classList.contains('active')) {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        presentationTab.classList.add('active');
    }
    
    // Sauvegarder la configuration mise à jour
    const updatedConfig = {
        defaultModule: 'rh',
        defaultSection: 'rh-presentation',
        defaultTab: 'rh-presentation',
        timestamp: Date.now(),
        lastCheck: Date.now()
    };
    localStorage.setItem('gestPrevConfig', JSON.stringify(updatedConfig));
}
    setupAuthentication() {
        const loginForm = document.getElementById('login-form');
        const authOverlay = document.getElementById('auth-overlay');
        
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }
        
        // Masquer le contenu principal
        document.body.classList.remove('authenticated');
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        // Identifiants de test
        const validCredentials = {
            'admin': 'gestprev2024',
            'rh': 'rh2024',
            'ca': 'ca2024'
        };
        
        if (validCredentials[username] && validCredentials[username] === password) {
            // Nettoyer l'état précédent
            this.services = [];
            this.employes = [];
            this.planning = [];
            
            // Créer un token d'authentification
            const authData = {
                username: username,
                expires: Date.now() + (24 * 60 * 60 * 1000), // 24h
                timestamp: Date.now()
            };
            
            localStorage.setItem('gestPrevAuth', JSON.stringify(authData));
            this.isAuthenticated = true;
            document.body.classList.add('authenticated');
            
            // Masquer l'overlay d'authentification
            const authOverlay = document.getElementById('auth-overlay');
            if (authOverlay) {
                authOverlay.style.display = 'none';
            }
            
            // Afficher le contenu principal
            const mainHeader = document.querySelector('.main-header');
            if (mainHeader) {
                mainHeader.style.display = 'block';
            }
            
            // Initialiser l'application après authentification
            this.loadFromLocalStorage();
            
            // Créer des données de test si nécessaire
            if (this.services.length === 0 || this.employes.length === 0) {
                this.createTestData();
            }
            
            // Configuration et affichage
            this.ensureDefaultConfiguration();
            this.setupEventListeners();
            this.setupCheckboxHandlers();
            this.updateAllSelects();
            this.displayServices();
            this.displayEmployes();
            this.initializePlanningDisplay();
            
            this.showNotification('Connexion réussie ! Bienvenue dans GEST PREV.', 'success');
        } else {
            this.showNotification('Identifiants incorrects. Veuillez réessayer.', 'error');
            
            // Vider le champ mot de passe en cas d'erreur
            const passwordField = document.getElementById('password');
            if (passwordField) passwordField.value = '';
        }
    }

    logout() {
        // Nettoyer complètement l'authentification
        localStorage.removeItem('gestPrevAuth');
        this.isAuthenticated = false;
        document.body.classList.remove('authenticated');
        
        // Réinitialiser l'état de l'application
        this.services = [];
        this.employes = [];
        this.planning = [];
        
        // Afficher l'overlay d'authentification
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) {
            authOverlay.style.display = 'flex';
            authOverlay.style.visibility = 'visible';
            authOverlay.style.opacity = '1';
        }
        
        // Masquer le contenu principal
        const mainHeader = document.querySelector('.main-header');
        if (mainHeader) {
            mainHeader.style.display = 'none';
            mainHeader.style.visibility = 'hidden';
        }
        
        // Masquer tous les modules
        document.querySelectorAll('.module-content').forEach(module => {
            module.classList.remove('active');
        });
        
        // Masquer toutes les sections
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Masquer tous les onglets
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        
        // Vider les champs de connexion
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if (usernameField) usernameField.value = '';
        if (passwordField) passwordField.value = '';
        
        this.showNotification('Déconnexion réussie.', 'info');
        
        // Forcer la vérification d'authentification
        setTimeout(() => {
            this.checkAuthentication();
        }, 100);
    }

    // ===== FORCE LOGOUT - NETTOYAGE COMPLET =====
    forceLogout() {
        console.log('Force logout en cours...');
        
        // Nettoyer complètement le localStorage
        localStorage.clear();
        
        // Nettoyer les cookies si possible
        document.cookie.split(";").forEach(function(c) { 
            document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
        });
        
        // Réinitialiser complètement l'état
        this.isAuthenticated = false;
        this.services = [];
        this.employes = [];
        this.planning = [];
        
        // Supprimer toutes les classes d'authentification
        document.body.classList.remove('authenticated');
        
        // Forcer l'affichage de l'overlay d'authentification
        const authOverlay = document.getElementById('auth-overlay');
        if (authOverlay) {
            authOverlay.style.display = 'flex';
            authOverlay.style.visibility = 'visible';
            authOverlay.style.opacity = '1';
            authOverlay.style.zIndex = '9999';
        }
        
        // Masquer complètement le contenu principal
        const mainHeader = document.querySelector('.main-header');
        const moduleBanner = document.querySelector('.module-banner');
        const mainContent = document.querySelector('.main-content');
        
        if (mainHeader) {
            mainHeader.style.display = 'none';
            mainHeader.style.visibility = 'hidden';
        }
        if (moduleBanner) {
            moduleBanner.style.display = 'none';
            moduleBanner.style.visibility = 'hidden';
        }
        if (mainContent) {
            mainContent.style.display = 'none';
            mainContent.style.visibility = 'hidden';
        }
        
        // Masquer tous les modules, sections et onglets
        document.querySelectorAll('.module-content, .module-section, .tab-btn').forEach(element => {
            element.classList.remove('active');
            element.style.display = 'none';
        });
        
        // Vider les champs de connexion
        const usernameField = document.getElementById('username');
        const passwordField = document.getElementById('password');
        if (usernameField) usernameField.value = '';
        if (passwordField) passwordField.value = '';
        
        // Forcer le rechargement des styles CSS
        this.reloadCSS();
        
        // Nettoyer le cache du navigateur
        this.clearBrowserCache();
        
        // Forcer le rechargement de la page après un délai
        setTimeout(() => {
            window.location.reload(true);
        }, 1000);
        
        this.showNotification('Déconnexion forcée effectuée. La page va se recharger.', 'info');
    }

    // ===== RECHARGEMENT CSS =====
    reloadCSS() {
        // Recharger tous les fichiers CSS
        const links = document.querySelectorAll('link[rel="stylesheet"]');
        links.forEach(link => {
            const href = link.href;
            link.href = '';
            link.href = href + '?v=' + Date.now();
        });
        
        // Forcer le rechargement des styles inline
        const styleSheets = document.styleSheets;
        for (let i = 0; i < styleSheets.length; i++) {
            try {
                const rules = styleSheets[i].cssRules || styleSheets[i].rules;
                if (rules) {
                    // Forcer le rechargement en modifiant temporairement
                    styleSheets[i].disabled = true;
                    setTimeout(() => {
                        styleSheets[i].disabled = false;
                    }, 100);
                }
            } catch (e) {
                // Ignorer les erreurs CORS
            }
        }
    }

    // ===== NETTOYAGE CACHE NAVIGATEUR =====
    clearBrowserCache() {
        // Essayer de nettoyer le cache via l'API Cache
        if ('caches' in window) {
            caches.keys().then(names => {
                names.forEach(name => {
                    caches.delete(name);
                });
            });
        }
        
        // Nettoyer le sessionStorage
        sessionStorage.clear();
        
        // Forcer le rechargement des images et autres ressources
        const images = document.querySelectorAll('img');
        images.forEach(img => {
            const src = img.src;
            img.src = '';
            img.src = src + '?v=' + Date.now();
        });
    }

    // ===== CONFIGURATION VERROUILLÉE =====
    ensureDefaultConfiguration() {
    // Vérifier et restaurer la configuration par défaut
    const config = JSON.parse(localStorage.getItem('gestPrevConfig') || '{}');
    
    // S'assurer que le module RH est actif
    const rhModule = document.getElementById('rh-module');
    if (rhModule && !rhModule.classList.contains('active')) {
        document.querySelectorAll('.module-content').forEach(module => {
            module.classList.remove('active');
        });
        rhModule.classList.add('active');
    }
    
    // S'assurer que la section Présentation est active
    const presentationSection = document.getElementById('rh-presentation');
    if (presentationSection && !presentationSection.classList.contains('active')) {
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });
        presentationSection.classList.add('active');
    }
    
    // S'assurer que l'onglet Présentation est actif
    const presentationTab = document.querySelector('[data-tab="rh-presentation"]');
    if (presentationTab && !presentationTab.classList.contains('active')) {
        document.querySelectorAll('.tab-btn').forEach(tab => {
            tab.classList.remove('active');
        });
        presentationTab.classList.add('active');
    }
    
    // Sauvegarder la configuration mise à jour
    const updatedConfig = {
        defaultModule: 'rh',
        defaultSection: 'rh-presentation',
        defaultTab: 'rh-presentation',
        timestamp: Date.now(),
        lastCheck: Date.now()
    };
    localStorage.setItem('gestPrevConfig', JSON.stringify(updatedConfig));
}

    // ===== PERSISTANCE DES DONNÉES =====
    loadFromLocalStorage() {
        try {
            // Sauvegarde de sécurité avant chargement
            this.createBackup();
            
            // Charger les données partagées entre tous les utilisateurs
            const savedServices = localStorage.getItem('gestPrevUniversalServices') || localStorage.getItem('gestPrevServices');
            const savedEmployes = localStorage.getItem('gestPrevUniversalEmployes') || localStorage.getItem('gestPrevEmployes');
            const savedPlanning = localStorage.getItem('gestPrevUniversalPlanning') || localStorage.getItem('gestPrevPlanning');
            const savedScenarios = localStorage.getItem('gestPrevUniversalScenarios') || localStorage.getItem('gestPrevScenarios');
            const savedSimulations = localStorage.getItem('gestPrevUniversalSimulations') || localStorage.getItem('gestPrevSimulations');
            const savedCurrentPlanning = localStorage.getItem('gestPrevUniversalCurrentPlanning') || localStorage.getItem('currentPlanning');
            
            // Charger les services avec migration
            if (savedServices) {
                this.services = JSON.parse(savedServices);
                this.migrateOldServices();
            }
            
            // Charger les employés avec migration
            if (savedEmployes) {
                this.employes = JSON.parse(savedEmployes);
                this.migrateOldEmployes();
            }
            
            // Charger le planning
            if (savedPlanning) {
                this.planning = JSON.parse(savedPlanning);
            }
            
            // Charger les scénarios
            if (savedScenarios) {
                this.scenarios = JSON.parse(savedScenarios);
            }
            
            // Charger les simulations
            if (savedSimulations) {
                this.simulations = JSON.parse(savedSimulations);
            }
            
            // Charger le planning actuel
            if (savedCurrentPlanning) {
                this.currentPlanning = JSON.parse(savedCurrentPlanning);
            }
            
            console.log('✅ Données partagées chargées avec succès:', {
                services: this.services.length,
                employes: this.employes.length,
                planning: this.planning.length,
                scenarios: this.scenarios ? this.scenarios.length : 0,
                simulations: this.simulations ? this.simulations.length : 0
            });
            
            // Afficher une notification pour confirmer la synchronisation
            this.showNotification('Données synchronisées avec les autres utilisateurs', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données. Restauration de la sauvegarde...', 'error');
            this.restoreFromBackup();
        }
    }

    saveToLocalStorage() {
        try {
            // Créer une sauvegarde avant de sauvegarder
            this.createBackup();
            
            // Sauvegarder les données partagées entre tous les utilisateurs
            localStorage.setItem('gestPrevUniversalServices', JSON.stringify(this.services)); localStorage.setItem('gestPrevServices', JSON.stringify(this.services));
            localStorage.setItem('gestPrevUniversalEmployes', JSON.stringify(this.employes)); localStorage.setItem('gestPrevEmployes', JSON.stringify(this.employes));
            localStorage.setItem('gestPrevUniversalPlanning', JSON.stringify(this.planning)); localStorage.setItem('gestPrevPlanning', JSON.stringify(this.planning));
            localStorage.setItem('gestPrevUniversalScenarios', JSON.stringify(this.scenarios || [])); localStorage.setItem('gestPrevScenarios', JSON.stringify(this.scenarios || []));
            localStorage.setItem('gestPrevUniversalSimulations', JSON.stringify(this.simulations || [])); localStorage.setItem('gestPrevSimulations', JSON.stringify(this.simulations || []));
            localStorage.setItem('gestPrevVersion', '2.0.0'); // Version actuelle
            localStorage.setItem('gestPrevLastSave', new Date().toISOString());
            
            console.log('✅ Données partagées sauvegardées avec succès');
            
            // Afficher une notification pour confirmer la synchronisation
            this.showNotification('Données sauvegardées et partagées avec les autres utilisateurs', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde des données', 'error');
        }
    }

    // ===== SYSTÈME DE SAUVEGARDE ET RESTAURATION =====
    
    // Fonction pour forcer la synchronisation des données entre utilisateurs
    async forceDataSync() {
        try {
            console.log('🔄 Synchronisation forcée des données...');
            
            // Recharger les données depuis le localStorage
            this.loadFromLocalStorage();
            
            // Synchroniser avec le cloud
            await this.syncWithCloud();
            
            // Rafraîchir l'affichage
            this.displayServices();
            this.displayEmployes();
            
            // Afficher une notification de confirmation
            this.showNotification('Synchronisation des données terminée', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation:', error);
            this.showNotification('Erreur lors de la synchronisation des données', 'error');
        }
    }
    
    // ===== SYSTÈME DE SYNCHRONISATION CLOUD =====
    
    // Fonction pour synchroniser les données avec le cloud (Netlify)
    async syncWithCloud() {
        try {
            console.log('☁️ Synchronisation universelle avec le cloud...');
            
            // Vérifier si on est sur Netlify, GitHub Pages ou local
            const isNetlify = window.location.hostname.includes('netlify.app');
            const isGitHubPages = window.location.hostname.includes('github.io');
            const isLocal = window.location.hostname.includes('localhost') || 
                           window.location.hostname.includes('127.0.0.1') ||
                           window.location.hostname.includes('file://');
            
            // FORCER LA SYNCHRONISATION BIDIRECTIONNELLE POUR TOUS LES ENVIRONNEMENTS
            console.log('🔄 Synchronisation bidirectionnelle forcée...');
            
            // 1. D'abord charger depuis le cloud
            await this.loadFromCloud();
            
            // 2. Puis sauvegarder vers le cloud
            await this.saveToCloud();
            
            this.showNotification('Synchronisation universelle terminée', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors de la synchronisation universelle:', error);
            this.showNotification('Erreur lors de la synchronisation universelle', 'error');
        }
    }
    
    // Sauvegarder les données vers le cloud
    async saveToCloud() {
        try {
            // Récupérer l'utilisateur actuel
            const authToken = localStorage.getItem('gestPrevAuth');
            let currentUser = 'unknown';
            if (authToken) {
                try {
                    const authData = JSON.parse(authToken);
                    currentUser = authData.username || 'unknown';
                } catch (e) {
                    console.error('Erreur lors de la récupération de l\'utilisateur:', e);
                }
            }
            
            const dataToSync = {
                services: this.services,
                employes: this.employes,
                planning: this.planning,
                scenarios: this.scenarios || [],
                simulations: this.simulations || [],
                currentPlanning: this.currentPlanning,
                version: '2.0.0',
                lastSave: new Date().toISOString(),
                source: window.location.hostname,
                user: currentUser,
                // Ajouter un timestamp pour éviter les conflits
                timestamp: Date.now()
            };
            
            // Sauvegarder dans le localStorage local avec une clé spéciale pour le cloud
            const cloudKey = 'gestPrevCloudData';
            localStorage.setItem(cloudKey, JSON.stringify(dataToSync));
            
            // Essayer d'envoyer vers un service externe
            const externalSuccess = await this.sendToExternalService(dataToSync);
            
            if (externalSuccess) {
                console.log('☁️ Données envoyées vers le cloud externe avec succès');
                this.showNotification(`Données synchronisées par ${currentUser}`, 'success');
            } else {
                console.log('☁️ Données sauvegardées localement (cloud externe non disponible)');
                this.showNotification('Données sauvegardées localement', 'info');
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi vers le cloud:', error);
        }
    }
    
    // Charger les données depuis le cloud
    async loadFromCloud() {
        try {
            // Essayer d'abord de charger depuis le service externe
            const externalSuccess = await this.loadFromExternalService();
            
            if (externalSuccess) {
                this.showNotification('Données synchronisées depuis le cloud externe', 'success');
                return;
            }
            
            // Fallback : charger depuis le localStorage local
            const cloudKey = 'gestPrevCloudData';
            const cloudData = localStorage.getItem(cloudKey);
            
            if (cloudData) {
                const parsedData = JSON.parse(cloudData);
                
                // Mettre à jour les données locales avec les données du cloud
                if (parsedData.services) {
                    this.services = parsedData.services;
                }
                if (parsedData.employes) {
                    this.employes = parsedData.employes;
                }
                if (parsedData.planning) {
                    this.planning = parsedData.planning;
                }
                if (parsedData.scenarios) {
                    this.scenarios = parsedData.scenarios;
                }
                if (parsedData.simulations) {
                    this.simulations = parsedData.simulations;
                }
                if (parsedData.currentPlanning) {
                    this.currentPlanning = parsedData.currentPlanning;
                }
                
                // Sauvegarder localement
                this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
                
                console.log('☁️ Données chargées depuis le localStorage cloud');
                this.showNotification('Données synchronisées depuis le localStorage cloud', 'success');
            }
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement depuis le cloud:', error);
        }
    }
    
    // Envoyer vers un service externe (optionnel)
    async sendToExternalService(data) {
        try {
            // Utiliser JSONBin.io pour le stockage cloud
            // URL de l'API JSONBin.io (à remplacer par votre propre bin)
            const jsonbinUrl = 'https://api.jsonbin.io/v3/b/65a1b8c8266cfc3fde8c8c8c';
            const masterKey = '$2a$10$dXJ3SW6G7P50lGmMkkmwe.20cQQubK3.HZWzG3YB1tlRy.fqvM/BG';
            
            // Essayer d'envoyer les données vers JSONBin.io
            const response = await fetch(jsonbinUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Master-Key': masterKey,
                    'X-Bin-Name': 'GEST PREV Data'
                },
                body: JSON.stringify({
                    record: data,
                    metadata: {
                        createdAt: new Date().toISOString(),
                        source: window.location.hostname,
                        version: '2.0.0'
                    }
                })
            });
            
            if (response.ok) {
                console.log('☁️ Données envoyées vers JSONBin.io avec succès');
                return true;
            } else {
                console.warn('⚠️ Échec de l\'envoi vers JSONBin.io, utilisation du localStorage local');
                return false;
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi vers le service externe:', error);
            return false;
        }
    }
    
    // Charger depuis un service externe
    async loadFromExternalService() {
        try {
            // URL de l'API JSONBin.io (à remplacer par votre propre bin)
            const jsonbinUrl = 'https://api.jsonbin.io/v3/b/65a1b8c8266cfc3fde8c8c8c';
            
            const response = await fetch(jsonbinUrl);
            
            if (response.ok) {
                const result = await response.json();
                const cloudData = result.record;
                
                if (cloudData) {
                    // Mettre à jour les données locales avec les données du cloud
                    if (cloudData.services) {
                        this.services = cloudData.services;
                    }
                    if (cloudData.employes) {
                        this.employes = cloudData.employes;
                    }
                    if (cloudData.planning) {
                        this.planning = cloudData.planning;
                    }
                    if (cloudData.scenarios) {
                        this.scenarios = cloudData.scenarios;
                    }
                    if (cloudData.simulations) {
                        this.simulations = cloudData.simulations;
                    }
                    if (cloudData.currentPlanning) {
                        this.currentPlanning = cloudData.currentPlanning;
                    }
                    
                    // Sauvegarder localement
                    this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
                    
                    console.log('☁️ Données chargées depuis JSONBin.io');
                    return true;
                }
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement depuis le service externe:', error);
            return false;
        }
    }
    
    createBackup() {
        try {
            const backup = {
                timestamp: new Date().toISOString(),
                version: '2.0.0',
                services: this.services,
                employes: this.employes,
                planning: this.planning,
                scenarios: this.scenarios || [],
                simulations: this.simulations || [],
                currentPlanning: localStorage.getItem('currentPlanning')
            };
            
            // Sauvegarder dans localStorage avec un timestamp
            const backupKey = `gestPrevBackup_${Date.now()}`;
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            // Garder seulement les 5 dernières sauvegardes
            this.cleanOldBackups();
            
            console.log('💾 Sauvegarde créée:', backupKey);
        } catch (error) {
            console.error('❌ Erreur lors de la création de la sauvegarde:', error);
        }
    }

    cleanOldBackups() {
        try {
            const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('gestPrevBackup_'));
            if (backupKeys.length > 5) {
                // Trier par timestamp et supprimer les plus anciens
                backupKeys.sort().slice(0, -5).forEach(key => {
                    localStorage.removeItem(key);
                    console.log('🗑️ Sauvegarde supprimée:', key);
                });
            }
        } catch (error) {
            console.error('❌ Erreur lors du nettoyage des sauvegardes:', error);
        }
    }

    restoreFromBackup() {
        try {
            const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('gestPrevBackup_'));
            if (backupKeys.length > 0) {
                // Prendre la sauvegarde la plus récente
                const latestBackupKey = backupKeys.sort().pop();
                const backupData = JSON.parse(localStorage.getItem(latestBackupKey));
                
                if (backupData) {
                    this.services = backupData.services || [];
                    this.employes = backupData.employes || [];
                    this.planning = backupData.planning || [];
                    this.scenarios = backupData.scenarios || [];
                    this.simulations = backupData.simulations || [];
                    
                    if (backupData.currentPlanning) {
                        localStorage.setItem('currentPlanning', backupData.currentPlanning);
                    }
                    
                    console.log('🔄 Restauration depuis la sauvegarde:', latestBackupKey);
                    this.showNotification('Données restaurées depuis la sauvegarde', 'success');
                    return true;
                }
            }
            
            this.showNotification('Aucune sauvegarde disponible', 'warning');
            return false;
        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
            this.showNotification('Erreur lors de la restauration', 'error');
            return false;
        }
    }

    migrateOldServices() {
        let hasChanges = false;
        
        this.services = this.services.map(service => {
            let updatedService = { ...service };
            
            // Migration 1: Ancien format horaires/jours vers horairesParJour
            if (service.horaires && service.jours && !service.horairesParJour) {
                const horairesParJour = {};
                service.jours.forEach(jour => {
                    horairesParJour[jour] = {
                        haute: service.horaires.haute,
                        basse: service.horaires.basse,
                        fermeHaute: false,
                        fermeBasse: false
                    };
                });
                
                updatedService = {
                    ...updatedService,
                    horairesParJour: horairesParJour
                };
                
                // Supprimer les anciens champs
                delete updatedService.horaires;
                delete updatedService.jours;
                delete updatedService.joursConditionnels;
                
                hasChanges = true;
            }
            
            // Migration 2: Ajouter des champs manquants
            if (!updatedService.id) {
                updatedService.id = this.generateId();
                hasChanges = true;
            }
            
            if (!updatedService.createdAt) {
                updatedService.createdAt = new Date().toISOString();
                hasChanges = true;
            }
            
            return updatedService;
        });
        
        if (hasChanges) {
            console.log('🔄 Services migrés vers le nouveau format');
            this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        }
    }

    migrateOldEmployes() {
        let hasChanges = false;
        
        this.employes = this.employes.map(employe => {
            let updatedEmploye = { ...employe };
            
            // Migration 1: Ajouter des champs manquants
            if (!updatedEmploye.id) {
                updatedEmploye.id = this.generateId();
                hasChanges = true;
            }
            
            if (!updatedEmploye.disponibilite) {
                updatedEmploye.disponibilite = {
                    heuresAnnuelContractuelles: 1820,
                    heuresSemaineContractuelles: 35,
                    typeContrat: '35h'
                };
                hasChanges = true;
            }
            
            if (!updatedEmploye.salaireHoraire) {
                updatedEmploye.salaireHoraire = 15; // Salaire par défaut
                hasChanges = true;
            }
            
            if (!updatedEmploye.createdAt) {
                updatedEmploye.createdAt = new Date().toISOString();
                hasChanges = true;
            }
            
            return updatedEmploye;
        });
        
        if (hasChanges) {
            console.log('🔄 Employés migrés vers le nouveau format');
            this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        }
    }

    // ===== DONNÉES DE TEST =====
    createTestData() {
        // Créer des services de test
        this.services = [
            {
                id: 'service-1',
                name: 'Réception Hôtel',
                category: 'hotellerie',
                horairesParJour: {
                    lundi: {
                        haute: { ouverture: '07:00', fermeture: '23:00' },
                        basse: { ouverture: '08:00', fermeture: '22:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    mardi: {
                        haute: { ouverture: '07:00', fermeture: '23:00' },
                        basse: { ouverture: '08:00', fermeture: '22:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    mercredi: {
                        haute: { ouverture: '07:00', fermeture: '23:00' },
                        basse: { ouverture: '08:00', fermeture: '22:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    jeudi: {
                        haute: { ouverture: '07:00', fermeture: '23:00' },
                        basse: { ouverture: '08:00', fermeture: '22:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    vendredi: {
                        haute: { ouverture: '07:00', fermeture: '23:00' },
                        basse: { ouverture: '08:00', fermeture: '22:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    samedi: {
                        haute: { ouverture: '08:00', fermeture: '20:00' },
                        basse: { ouverture: '09:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    dimanche: {
                        haute: { ouverture: '08:00', fermeture: '20:00' },
                        basse: { ouverture: '09:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    }
                },
                createdAt: new Date().toISOString()
            },
            {
                id: 'service-2',
                name: 'Restaurant Principal',
                category: 'restauration',
                horairesParJour: {
                    lundi: {
                        haute: null,
                        basse: null,
                        fermeHaute: true,
                        fermeBasse: true
                    },
                    mardi: {
                        haute: { ouverture: '12:00', fermeture: '14:30' },
                        basse: { ouverture: '12:00', fermeture: '14:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    mercredi: {
                        haute: { ouverture: '12:00', fermeture: '14:30' },
                        basse: { ouverture: '12:00', fermeture: '14:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    jeudi: {
                        haute: { ouverture: '12:00', fermeture: '14:30' },
                        basse: { ouverture: '12:00', fermeture: '14:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    vendredi: {
                        haute: { ouverture: '12:00', fermeture: '14:30' },
                        basse: { ouverture: '12:00', fermeture: '14:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    samedi: {
                        haute: { ouverture: '12:00', fermeture: '15:00' },
                        basse: { ouverture: '12:00', fermeture: '14:30' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    dimanche: {
                        haute: { ouverture: '12:00', fermeture: '15:00' },
                        basse: { ouverture: '12:00', fermeture: '14:30' },
                        fermeHaute: false,
                        fermeBasse: false
                    }
                },
                createdAt: new Date().toISOString()
            },
            {
                id: 'service-3',
                name: 'Spa & Bien-être',
                category: 'loisirs',
                horairesParJour: {
                    lundi: {
                        haute: { ouverture: '09:00', fermeture: '19:00' },
                        basse: { ouverture: '10:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    mardi: {
                        haute: { ouverture: '09:00', fermeture: '19:00' },
                        basse: { ouverture: '10:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    mercredi: {
                        haute: { ouverture: '09:00', fermeture: '19:00' },
                        basse: { ouverture: '10:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    jeudi: {
                        haute: { ouverture: '09:00', fermeture: '19:00' },
                        basse: { ouverture: '10:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    vendredi: {
                        haute: { ouverture: '09:00', fermeture: '19:00' },
                        basse: { ouverture: '10:00', fermeture: '18:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    samedi: {
                        haute: { ouverture: '09:00', fermeture: '18:00' },
                        basse: { ouverture: '10:00', fermeture: '17:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    },
                    dimanche: {
                        haute: { ouverture: '10:00', fermeture: '17:00' },
                        basse: { ouverture: '10:00', fermeture: '16:00' },
                        fermeHaute: false,
                        fermeBasse: false
                    }
                },
                createdAt: new Date().toISOString()
            }
        ];

        // Créer des employés de test
        this.employes = [
            {
                id: 'emp-1',
                nom: 'Dupont',
                prenom: 'Marie',
                niveau: 'Chef de service',
                typeContrat: 'CDI',
                salaireHoraire: 18.50,
                disponibilite: {
                    heuresAnnuelContractuelles: 2028,
                    heuresSemaineContractuelles: 39,
                    joursConges: 25
                },
                services: ['service-1'],
                competences: ['Accueil', 'Gestion', 'Formation'],
                statut: 'actif',
                createdAt: new Date().toISOString()
            },
            {
                id: 'emp-2',
                nom: 'Martin',
                prenom: 'Pierre',
                niveau: 'Employé',
                typeContrat: 'CDI',
                salaireHoraire: 12.80,
                disponibilite: {
                    heuresAnnuelContractuelles: 2028,
                    heuresSemaineContractuelles: 35,
                    joursConges: 25
                },
                services: ['service-1', 'service-2'],
                competences: ['Accueil', 'Service client'],
                statut: 'actif',
                createdAt: new Date().toISOString()
            },
            {
                id: 'emp-3',
                nom: 'Bernard',
                prenom: 'Sophie',
                niveau: 'Chef cuisinier',
                typeContrat: 'CDI',
                salaireHoraire: 22.00,
                disponibilite: {
                    heuresAnnuelContractuelles: 2028,
                    heuresSemaineContractuelles: 39,
                    joursConges: 25
                },
                services: ['service-2'],
                competences: ['Cuisine', 'Gestion équipe', 'HACCP'],
                statut: 'actif',
                createdAt: new Date().toISOString()
            },
            {
                id: 'emp-4',
                nom: 'Petit',
                prenom: 'Lucas',
                niveau: 'Commis',
                typeContrat: 'CDD',
                salaireHoraire: 11.50,
                disponibilite: {
                    heuresAnnuelContractuelles: 2028,
                    heuresSemaineContractuelles: 35,
                    joursConges: 25
                },
                services: ['service-2'],
                competences: ['Cuisine', 'Plonge'],
                statut: 'actif',
                createdAt: new Date().toISOString()
            },
            {
                id: 'emp-5',
                nom: 'Roux',
                prenom: 'Emma',
                niveau: 'Masseuse',
                typeContrat: 'CDI',
                salaireHoraire: 15.20,
                disponibilite: {
                    heuresAnnuelContractuelles: 2028,
                    heuresSemaineContractuelles: 35,
                    joursConges: 25
                },
                services: ['service-3'],
                competences: ['Massage', 'Bien-être', 'Accueil'],
                statut: 'actif',
                createdAt: new Date().toISOString()
            },
            {
                id: 'emp-6',
                nom: 'Leroy',
                prenom: 'Thomas',
                niveau: 'Employé',
                typeContrat: 'CDI',
                salaireHoraire: 13.50,
                disponibilite: {
                    heuresAnnuelContractuelles: 2028,
                    heuresSemaineContractuelles: 35,
                    joursConges: 25
                },
                services: ['service-1', 'service-3'],
                competences: ['Accueil', 'Service client', 'Vente'],
                statut: 'actif',
                createdAt: new Date().toISOString()
            }
        ];

        // Sauvegarder les données de test
        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
    }

    // ===== FONCTION POUR FORCER LA CRÉATION DES DONNÉES DE TEST =====
    forceCreateTestData() {
        console.log('Forçage de la création des données de test...');
        
        // Nettoyer le localStorage
        localStorage.removeItem('gestPrevServices');
        localStorage.removeItem('gestPrevEmployes');
        localStorage.removeItem('gestPrevPlanning');
        
        // Réinitialiser les tableaux
        this.services = [];
        this.employes = [];
        this.planning = [];
        
        // Créer les données de test
        this.createTestData();
        
        // Mettre à jour l'affichage
        this.displayServices();
        this.displayEmployes();
        this.updateAllSelects();
        
        this.showNotification('Données de test créées avec succès !', 'success');
        this.showNotification('Services et employés de démonstration ajoutés', 'info');
    }

    // ===== GESTION DES ÉVÉNEMENTS =====
    setupEventListeners() {
        console.log('🔧 Configuration des event listeners...');
        
        // Gestion de la déconnexion
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }
        
        // Gestion de la force déconnexion
        const forceLogoutBtn = document.getElementById('force-logout-btn');
        if (forceLogoutBtn) {
            forceLogoutBtn.addEventListener('click', () => {
                if (confirm('Êtes-vous sûr de vouloir forcer la déconnexion ? Cela va nettoyer complètement le cache et recharger la page.')) {
                    this.forceLogout();
                }
            });
        }
        
        // Formulaire de service
        const serviceForm = document.getElementById('service-form');
        console.log('📋 Service form trouvé:', !!serviceForm);
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addService();
            });
        }

        // Bouton "Ajouter un service"
        const addServiceBtn = document.getElementById('show-service-form');
        console.log('➕ Bouton ajouter service trouvé:', !!addServiceBtn);
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                console.log('🖱️ Clic sur ajouter service');
                this.showServiceForm();
            });
        }

        // Bouton "Annuler"
        const cancelBtn = document.getElementById('cancel-service-form');
        console.log('❌ Bouton annuler service trouvé:', !!cancelBtn);
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideServiceForm();
            });
        }

        // Gestionnaires pour les checkboxes "Fermé" - Attachement direct
        this.setupCheckboxHandlers();

        // Formulaire d'employé
        const employeForm = document.getElementById('employe-form');
        console.log('👥 Employé form trouvé:', !!employeForm);
        if (employeForm) {
            employeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEmploye();
            });
        }

        // Autres gestionnaires d'événements...
        this.setupEmployeFormHandlers();
        this.setupPlanningHandlers();
        this.setupPlanningEventListeners();
        this.setupSimulationEventListeners();
        this.setupDashboardEventListeners();
        
        // Bouton pour créer les données de test
        const createTestDataBtn = document.getElementById('create-test-data');
        console.log('🧪 Bouton données test trouvé:', !!createTestDataBtn);
        if (createTestDataBtn) {
            createTestDataBtn.addEventListener('click', () => {
                console.log('🖱️ Clic sur créer données test');
                this.forceCreateTestData();
            });
        }
        
        // Event listeners pour les types de simulation
        this.setupSimulationTypeEventListeners();
        
        // Event listeners pour le système d'export global
        this.setupExportEventListeners();
        
        // Event listener pour le gestionnaire de sauvegardes
        this.setupBackupEventListeners();
        
        // Initialisation simulation annuelle et règles légales
        this.setupAnnualSimulationEventListeners();
        this.initializeLegalRules();
        
        // Event listener pour la simulation RH avancée
        const runAdvancedRHSimulationBtn = document.getElementById('run-advanced-rh-simulation');
        if (runAdvancedRHSimulationBtn) {
            runAdvancedRHSimulationBtn.addEventListener('click', () => {
                this.runAdvancedRHSimulation();
            });
        }
        
        // Initialisation du sélecteur d'employés personnalisé
        this.setupCustomMultiselect();
        
        // Initialisation des nouvelles fonctionnalités employés
        this.setupEmployeTypeHeuresHandler();
        this.setupLegalRules35EventListeners();
        this.initializeLegalRules35();
        
        // Test de notification au démarrage
        setTimeout(() => {
            this.showNotification('Application GEST PREV chargée avec succès !', 'success');
        }, 1000);
        
        console.log('✅ Event listeners configurés');

        // Dans la fonction setupEventListeners(), ajouter :
        this.setupEnhancedPlanningHandlers();
        
        // Initialisation de l'interface simplifiée
        this.setupSimplifiedPlanningHandlers();
        
        // Initialiser l'affichage des scénarios
        this.displayScenariosList();
    }

    setupCheckboxHandlers() {
        // Gestionnaire pour les boutons "Fermé"
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('ferme-btn')) {
                this.handleFermeButton(e.target);
            }
        });
    }

    showServiceForm() {
        const form = document.getElementById('service-form');
        const addServiceBtn = document.getElementById('show-service-form');
        
        // Supprimer toute limitation potentielle sur le nombre de services
        // Permettre l'ajout d'un nombre illimité de services
        console.log('Nombre de services actuels:', this.services.length);
        
        if (form) {
            form.style.display = 'block';
        }
        
        if (addServiceBtn) {
            addServiceBtn.style.display = 'none';
        }
        
        // Réattacher les gestionnaires de checkboxes
        this.setupCheckboxHandlers();
    }

    hideServiceForm() {
        const form = document.getElementById('service-form');
        const addServiceBtn = document.getElementById('show-service-form');
        
        if (form) {
            form.style.display = 'none';
            form.reset(); // Réinitialiser le formulaire
        }
        
        if (addServiceBtn) {
            addServiceBtn.style.display = 'block';
        }
    }

    handleFermeButton(button) {
        console.log('Bouton fermé cliqué');
        
        const day = button.dataset.day;
        const season = button.dataset.season;
        const seasonHoursDay = button.closest('.season-hours-day');
        
        if (!seasonHoursDay) {
            console.error('season-hours-day non trouvé');
            return;
        }
        
        const timeInputs = seasonHoursDay.querySelector('.time-inputs');
        if (!timeInputs) {
            console.error('time-inputs non trouvé');
            return;
        }
        
        const inputs = timeInputs.querySelectorAll('input[type="time"]');
        
        // Basculer l'état du bouton
        const isActive = button.classList.contains('active');
        
        if (!isActive) {
            console.log('Activer fermé');
            // Activer le mode fermé
            button.classList.add('active');
            inputs.forEach(input => {
                input.disabled = true;
                input.value = '';
            });
            seasonHoursDay.classList.add('ferme');
        } else {
            console.log('Désactiver fermé');
            // Désactiver le mode fermé
            button.classList.remove('active');
            inputs.forEach(input => {
                input.disabled = false;
            });
            seasonHoursDay.classList.remove('ferme');
        }
    }

    // ===== GESTION DES SERVICES =====
    addService() {
        const form = document.getElementById('service-form');
        const submitBtn = form.querySelector('button[type="submit"]');
        const editId = submitBtn.dataset.editId;

        // Si on est en mode modification
        if (editId) {
            this.updateService(editId);
            return;
        }

        const formData = new FormData(form);
        
        const serviceName = formData.get('service-name');
        const serviceCategory = formData.get('service-category');
        
        // Récupération des horaires jour par jour
        const horairesParJour = {};
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        jours.forEach(jour => {
            const ouvertureHaute = formData.get(`${jour}-haute-ouverture`);
            const fermetureHaute = formData.get(`${jour}-haute-fermeture`);
            const ouvertureBasse = formData.get(`${jour}-basse-ouverture`);
            const fermetureBasse = formData.get(`${jour}-basse-fermeture`);
            
            // Vérifier l'état des boutons "Fermé" (seulement pour lundi)
            let fermeHaute = false;
            let fermeBasse = false;
            
            if (jour === 'lundi') {
                const fermeBtnHaute = document.querySelector(`[data-day="lundi"][data-season="haute"]`);
                const fermeBtnBasse = document.querySelector(`[data-day="lundi"][data-season="basse"]`);
                fermeHaute = fermeBtnHaute && fermeBtnHaute.classList.contains('active');
                fermeBasse = fermeBtnBasse && fermeBtnBasse.classList.contains('active');
            }
            
            // Vérifier si le jour est configuré (au moins une saison)
            if ((ouvertureHaute && fermetureHaute && !fermeHaute) || 
                (ouvertureBasse && fermetureBasse && !fermeBasse) ||
                fermeHaute || fermeBasse) {
                
                horairesParJour[jour] = {
                    haute: fermeHaute ? null : (ouvertureHaute && fermetureHaute ? {
                        ouverture: ouvertureHaute,
                        fermeture: fermetureHaute
                    } : null),
                    basse: fermeBasse ? null : (ouvertureBasse && fermetureBasse ? {
                        ouverture: ouvertureBasse,
                        fermeture: fermetureBasse
                    } : null),
                    fermeHaute: fermeHaute,
                    fermeBasse: fermeBasse
                };
            }
        });

        // Vérifier qu'au moins un jour est configuré
        const joursConfigures = Object.keys(horairesParJour);
        if (!serviceName || !serviceCategory || joursConfigures.length === 0) {
            this.showNotification('Veuillez remplir le nom, la catégorie et configurer au moins un jour', 'error');
            return;
        }

        // Supprimer toute limitation potentielle sur le nombre de services
        // Permettre l'ajout d'un nombre illimité de services
        console.log('Ajout du service:', serviceName, '- Nombre total de services après ajout:', this.services.length + 1);

        const service = {
            id: this.generateId(),
            name: serviceName,
            category: serviceCategory,
            horairesParJour: horairesParJour,
            createdAt: new Date().toISOString()
        };

        this.services.push(service);
        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        this.updateAllSelects();
        this.displayServices();
        this.hideServiceForm();
        
        this.showNotification('Service ajouté avec succès !', 'success');
    }

    deleteService(serviceId) {
        this.services = this.services.filter(service => service.id !== serviceId);
        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        this.updateAllSelects();
        this.displayServices();
        this.showNotification('Service supprimé avec succès !', 'info');
    }

    editService(serviceId) {
        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            this.showNotification('Service non trouvé', 'error');
            return;
        }

        // Remplir le formulaire avec les données du service
        const form = document.getElementById('service-form');
        form.querySelector('#service-name').value = service.name;
        form.querySelector('#service-category').value = service.category;
        
        // Remplir les horaires jour par jour
        Object.entries(service.horairesParJour).forEach(([jour, horaires]) => {
            if (horaires.haute) {
                form.querySelector(`[name="${jour}-haute-ouverture"]`).value = horaires.haute.ouverture;
                form.querySelector(`[name="${jour}-haute-fermeture"]`).value = horaires.haute.fermeture;
            }
            if (horaires.basse) {
                form.querySelector(`[name="${jour}-basse-ouverture"]`).value = horaires.basse.ouverture;
                form.querySelector(`[name="${jour}-basse-fermeture"]`).value = horaires.basse.fermeture;
            }
            
            // Remplir les boutons "Fermé"
            if (horaires.fermeHaute) {
                const fermeBtnHaute = document.querySelector(`[data-day="${jour}"][data-season="haute"]`);
                if (fermeBtnHaute) {
                    fermeBtnHaute.classList.add('active');
                }
            }
            if (horaires.fermeBasse) {
                const fermeBtnBasse = document.querySelector(`[data-day="${jour}"][data-season="basse"]`);
                if (fermeBtnBasse) {
                    fermeBtnBasse.classList.add('active');
                }
            }
        });

        // Changer le bouton pour indiquer qu'on modifie
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Modifier le service';
        submitBtn.dataset.editId = serviceId;
        
        // Afficher le formulaire
        this.showServiceForm();
        
        this.showNotification('Service chargé pour modification avec succès !', 'info');
    }

    updateService(serviceId) {
        const form = document.getElementById('service-form');
        const formData = new FormData(form);
        
        const serviceName = formData.get('service-name');
        const serviceCategory = formData.get('service-category');
        
        // Récupération des horaires jour par jour
        const horairesParJour = {};
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        jours.forEach(jour => {
            const ouvertureHaute = formData.get(`${jour}-haute-ouverture`);
            const fermetureHaute = formData.get(`${jour}-haute-fermeture`);
            const ouvertureBasse = formData.get(`${jour}-basse-ouverture`);
            const fermetureBasse = formData.get(`${jour}-basse-fermeture`);
            
            // Vérifier l'état des boutons "Fermé"
            const fermeBtnHaute = document.querySelector(`[data-day="${jour}"][data-season="haute"]`);
            const fermeBtnBasse = document.querySelector(`[data-day="${jour}"][data-season="basse"]`);
            const fermeHaute = fermeBtnHaute && fermeBtnHaute.classList.contains('active');
            const fermeBasse = fermeBtnBasse && fermeBtnBasse.classList.contains('active');
            
            // Vérifier si le jour est configuré (au moins une saison)
            if ((ouvertureHaute && fermetureHaute && !fermeHaute) || 
                (ouvertureBasse && fermetureBasse && !fermeBasse) ||
                fermeHaute || fermeBasse) {
                
                horairesParJour[jour] = {
                    haute: fermeHaute ? null : (ouvertureHaute && fermetureHaute ? {
                        ouverture: ouvertureHaute,
                        fermeture: fermetureHaute
                    } : null),
                    basse: fermeBasse ? null : (ouvertureBasse && fermetureBasse ? {
                        ouverture: ouvertureBasse,
                        fermeture: fermetureBasse
                    } : null),
                    fermeHaute: fermeHaute,
                    fermeBasse: fermeBasse
                };
            }
        });

        // Vérifier qu'au moins un jour est configuré
        const joursConfigures = Object.keys(horairesParJour);
        if (!serviceName || !serviceCategory || joursConfigures.length === 0) {
            this.showNotification('Veuillez remplir le nom, la catégorie et configurer au moins un jour', 'error');
            return;
        }

        // Mettre à jour le service
        const serviceIndex = this.services.findIndex(s => s.id === serviceId);
        if (serviceIndex !== -1) {
            this.services[serviceIndex] = {
                ...this.services[serviceIndex],
                name: serviceName,
                category: serviceCategory,
                horairesParJour: horairesParJour,
                updatedAt: new Date().toISOString()
            };
            
            this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
            this.updateAllSelects();
            this.displayServices();
            this.hideServiceForm();
            
            this.showNotification('Service modifié avec succès !', 'success');
        }
    }

    displayServices() {
        const servicesList = document.getElementById('services-list');
        if (!servicesList) return;

        if (this.services.length === 0) {
            servicesList.innerHTML = '<div class="empty-state"><p>Aucun service configuré</p></div>';
            return;
        }

        servicesList.innerHTML = this.services.map(service => {
            const heuresSemaine = this.calculateHeuresSemaine(service);
            const horairesFormatted = this.formatHorairesParJour(service.horairesParJour);
            
            return `
                <div class="service-item" data-service-id="${service.id}">
                    <div class="service-header">
                        <div class="service-info">
                            <h4>${service.name}</h4>
                            <span class="service-category">${this.getCategoryLabel(service.category)}</span>
                        </div>
                        <div class="service-actions">
                            <button class="edit-btn" onclick="gestPrev.editService('${service.id}')">
                                <i class="fas fa-edit"></i> Modifier
                            </button>
                            <button class="delete-btn" onclick="gestPrev.deleteService('${service.id}')">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                        </div>
                    </div>
                    <div class="service-details">
                        <div class="heures-semaine-section">
                            <strong>Total heures par semaine :</strong>
                            <span class="heures-haute">HS: ${heuresSemaine.haute}h</span>
                            <span class="heures-basse">BS: ${heuresSemaine.basse}h</span>
                        </div>
                        <div class="horaires-details">
                            ${horairesFormatted}
                         </div>
                    </div>
                </div>
            `;
        }).join('');
        
        // S'assurer que le bouton d'ajout de service reste toujours visible
        const addServiceBtn = document.getElementById('show-service-form');
        if (addServiceBtn) {
            addServiceBtn.style.display = 'block';
        }
    }

    formatHorairesParJour(horairesParJour) {
        const joursLabels = {
            lundi: 'Lun', mardi: 'Mar', mercredi: 'Mer', jeudi: 'Jeu',
            vendredi: 'Ven', samedi: 'Sam', dimanche: 'Dim'
        };
        
        const horairesHTML = Object.entries(horairesParJour).map(([jour, horaires]) => {
            const jourLabel = joursLabels[jour];
            let hauteText = 'Fermé';
            let basseText = 'Fermé';
            
            if (horaires.haute) {
                hauteText = `${horaires.haute.ouverture} - ${horaires.haute.fermeture}`;
            }
            if (horaires.basse) {
                basseText = `${horaires.basse.ouverture} - ${horaires.basse.fermeture}`;
            }
            
            return `
                <div class="jour-horaire">
                    <strong>${jourLabel}</strong>
                    <div class="haute-saison">HS: ${hauteText}</div>
                    <div class="basse-saison">BS: ${basseText}</div>
            </div>
            `;
        }).join('');
        
        return `<div class="horaires-grid">${horairesHTML}</div>`;
    }

    getCategoryLabel(category) {
        const labels = {
            'hotellerie': '🏨 Hôtellerie',
            'restauration': '🍽️ Restauration',
            'loisirs': '🎯 Loisirs',
            'technique': '🔧 Technique',
            'administratif': '📋 Administratif'
        };
        return labels[category] || category;
    }

    calculateHeuresSemaine(service) {
        let totalHaute = 0;
        let totalBasse = 0;
        
        Object.values(service.horairesParJour).forEach(horaires => {
            if (horaires.haute) {
                const debut = this.parseTime(horaires.haute.ouverture);
                const fin = this.parseTime(horaires.haute.fermeture);
                totalHaute += (fin - debut) / 60; // Convertir en heures
            }
            if (horaires.basse) {
                const debut = this.parseTime(horaires.basse.ouverture);
                const fin = this.parseTime(horaires.basse.fermeture);
                totalBasse += (fin - debut) / 60; // Convertir en heures
            }
        });
        
        return {
            haute: Math.round(totalHaute * 10) / 10,
            basse: Math.round(totalBasse * 10) / 10
        };
    }

    // ===== GESTION DES EMPLOYÉS PRÉVISIONNELS =====
    setupEmployeFormHandlers() {
        // Bouton pour afficher/masquer le formulaire
        const showFormBtn = document.getElementById('show-employe-form');
        const employeForm = document.getElementById('employe-form');
        const cancelFormBtn = document.getElementById('cancel-employe-form');

        // S'assurer que le formulaire est masqué par défaut
        if (employeForm) {
            employeForm.style.display = 'none';
        }

        if (showFormBtn) {
            // S'assurer que le bouton est visible par défaut
            showFormBtn.style.display = 'block';
            
            showFormBtn.addEventListener('click', () => {
                employeForm.style.display = 'block';
                showFormBtn.style.display = 'none';
                this.updateServicesCheckboxes();
            });
        }

        if (cancelFormBtn) {
            cancelFormBtn.addEventListener('click', () => {
                this.cancelEmployeEdit();
            });
        }

        // Gestionnaire de soumission du formulaire
        if (employeForm) {
            employeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEmploye();
            });
        }
    }

    updateServicesCheckboxes() {
        const servicesContainer = document.querySelector('.services-checkboxes');
        if (!servicesContainer) return;

        servicesContainer.innerHTML = this.services.map(service => `
            <div class="service-checkbox">
                <input type="checkbox" id="service-${service.id}" name="employe-services" value="${service.id}">
                <label for="service-${service.id}">${service.name}</label>
            </div>
        `).join('');
    }

    addEmploye() {
        const form = document.getElementById('employe-form');
        const formData = new FormData(form);

        // Récupération des services sélectionnés
        const selectedServices = Array.from(form.querySelectorAll('input[name="employe-services"]:checked'))
            .map(checkbox => checkbox.value);

        // Déterminer les heures contractuelles basées sur le type sélectionné
        const typeHeures = formData.get('employe-type-heures');
        const heuresContractuelles = typeHeures === '35' ? 1820 : 2028;
        const heuresHebdo = typeHeures === '35' ? 35 : 39;

        // Récupérer les horaires de travail
        const horaires = {};
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        jours.forEach(jour => {
            horaires[jour] = {
                debut: formData.get(`${jour}-debut`) || '08:00',
                fin: formData.get(`${jour}-fin`) || '17:00',
                actif: formData.get(`${jour}-actif`) === 'on'
            };
        });

        // Récupérer le mode de gestion
        const modeGestion = formData.get('employe-mode') || 'semi-auto';

        const employe = {
            id: this.generateId(),
            nom: formData.get('employe-nom'),
            prenom: formData.get('employe-prenom'),
            categorie: formData.get('employe-categorie'),
            niveau: formData.get('employe-niveau'),
            echelon: formData.get('employe-echelon'),
            typeContrat: formData.get('employe-type-contrat'),
            tauxHoraireBrut: parseFloat(formData.get('employe-taux-brut')),
            tauxChargesPatronales: parseFloat(formData.get('employe-taux-charges')),
            
            // Capacité prévisionnelle
            disponibilite: {
                heuresHebdoStandard: heuresHebdo,
                modulationAnnuelle: true, // Toujours modulation pour les deux types
                heuresAnnuelContractuelles: heuresContractuelles,
                rttLegales: {
                    congesPayes: 25,
                    reposCompensateur: 0,
                    joursFeries: 11
                },
                plafonds: {
                    hebdomadaire: 46,
                    journalier: 11
                }
            },
            
            // Horaires de travail par jour
            horaires: horaires,
            
            // Attribution prévisionnelle
            servicesAttribues: selectedServices,
            quotasParService: {},
            
            // Mode de gestion (manuel, semi-auto, auto)
            modeGestion: modeGestion,
            
            createdAt: new Date().toISOString()
        };

        // Validation des champs obligatoires
        if (!employe.nom || !employe.prenom || !employe.categorie || !employe.niveau || 
            !employe.typeContrat || !employe.tauxHoraireBrut) {
            this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        // Validation des services sélectionnés
        if (selectedServices.length === 0) {
            this.showNotification('Veuillez sélectionner au moins un service', 'error');
            return;
        }

        this.employes.push(employe);
        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        this.updateAllSelects();
        this.displayEmployes();
        
        // Masquer le formulaire après ajout
        form.style.display = 'none';
        const showFormBtn = document.getElementById('show-employe-form');
        if (showFormBtn) {
            showFormBtn.style.display = 'block';
        }
        form.reset();
        
        this.showNotification('Employé ajouté avec succès !', 'success');
    }

    deleteEmploye(employeId) {
        this.employes = this.employes.filter(employe => employe.id !== employeId);
        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        this.updateAllSelects();
        this.displayEmployes();
        this.showNotification('Employé supprimé avec succès !', 'info');
    }

    editEmploye(employeId) {
        const employe = this.employes.find(e => e.id === employeId);
        if (!employe) {
            this.showNotification('Employé non trouvé', 'error');
            return;
        }

        // Afficher le formulaire
        const form = document.getElementById('employe-form');
        if (form) {
            form.style.display = 'block';
        }

        // Remplir le formulaire avec les données de l'employé
        const nomInput = document.getElementById('employe-nom');
        const prenomInput = document.getElementById('employe-prenom');
        const categorieInput = document.getElementById('employe-categorie');
        const niveauInput = document.getElementById('employe-niveau');
        const echelonInput = document.getElementById('employe-echelon');
        const typeContratInput = document.getElementById('employe-type-contrat');
        const typeHeuresInput = document.getElementById('employe-type-heures');
        const tauxBrutInput = document.getElementById('employe-taux-brut');
        const tauxChargesInput = document.getElementById('employe-taux-charges');

        if (nomInput) nomInput.value = employe.nom || '';
        if (prenomInput) prenomInput.value = employe.prenom || '';
        if (categorieInput) categorieInput.value = employe.categorie || '';
        if (niveauInput) niveauInput.value = employe.niveau || '';
        if (echelonInput) echelonInput.value = employe.echelon || '';
        if (typeContratInput) typeContratInput.value = employe.typeContrat || '';
        if (tauxBrutInput) tauxBrutInput.value = employe.tauxHoraireBrut || '';
        if (tauxChargesInput) tauxChargesInput.value = employe.tauxChargesPatronales || '';

        // Déterminer le type d'heures basé sur les heures contractuelles
        if (typeHeuresInput) {
            const heuresContractuelles = employe.disponibilite?.heuresAnnuelContractuelles || 2028;
            if (heuresContractuelles <= 1820) {
                typeHeuresInput.value = '35';
                this.toggleEmployeHoursConfig('35');
            } else {
                typeHeuresInput.value = '39';
                this.toggleEmployeHoursConfig('39');
            }
        }

        // Mettre à jour les services sélectionnés
        this.updateServicesCheckboxes();
        const servicesAttribues = employe.servicesAttribues || [];
        servicesAttribues.forEach(serviceId => {
            const checkbox = form.querySelector(`input[name="employe-services"][value="${serviceId}"]`);
            if (checkbox) checkbox.checked = true;
        });

        // Changer le bouton pour "Modifier"
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Modifier l\'employé';
            // Supprimer l'ancien event listener et en ajouter un nouveau
            submitBtn.removeEventListener('click', this.addEmploye);
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.updateEmploye(employeId);
            });
        }

        // Masquer le bouton "Ajouter un employé"
        const showFormBtn = document.getElementById('show-employe-form');
        if (showFormBtn) {
            showFormBtn.style.display = 'none';
        }

        // Ajouter un bouton "Annuler" pour l'édition
        const cancelBtn = form.querySelector('#cancel-employe-form');
        if (cancelBtn) {
            cancelBtn.style.display = 'block';
            cancelBtn.onclick = () => {
                this.cancelEmployeEdit();
            };
        }

        this.showNotification('Mode édition activé', 'info');
    }

    updateEmploye(employeId) {
        const form = document.getElementById('employe-form');
        const formData = new FormData(form);

        // Récupération des services sélectionnés
        const selectedServices = Array.from(form.querySelectorAll('input[name="employe-services"]:checked'))
            .map(checkbox => checkbox.value);

        const employeIndex = this.employes.findIndex(e => e.id === employeId);
        if (employeIndex === -1) {
            this.showNotification('Employé non trouvé', 'error');
            return;
        }

        // Déterminer les heures contractuelles basées sur le type sélectionné
        const typeHeures = formData.get('employe-type-heures');
        const heuresContractuelles = typeHeures === '35' ? 1820 : 2028;

        // Mettre à jour l'employé
        this.employes[employeIndex] = {
            ...this.employes[employeIndex],
            nom: formData.get('employe-nom'),
            prenom: formData.get('employe-prenom'),
            categorie: formData.get('employe-categorie'),
            niveau: formData.get('employe-niveau'),
            echelon: formData.get('employe-echelon'),
            typeContrat: formData.get('employe-type-contrat'),
            tauxHoraireBrut: parseFloat(formData.get('employe-taux-brut')),
            tauxChargesPatronales: parseFloat(formData.get('employe-taux-charges')),
            servicesAttribues: selectedServices,
            disponibilite: {
                ...this.employes[employeIndex].disponibilite,
                heuresAnnuelContractuelles: heuresContractuelles
            },
            updatedAt: new Date().toISOString()
        };

        // Validation des champs obligatoires
        if (!this.employes[employeIndex].nom || !this.employes[employeIndex].prenom || 
            !this.employes[employeIndex].categorie || !this.employes[employeIndex].niveau || 
            !this.employes[employeIndex].typeContrat || !this.employes[employeIndex].tauxHoraireBrut) {
            this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        // Validation des services sélectionnés
        if (selectedServices.length === 0) {
            this.showNotification('Veuillez sélectionner au moins un service', 'error');
            return;
        }

        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        this.updateAllSelects();
        this.displayEmployes();
        
        // Masquer le formulaire après modification
        form.style.display = 'none';
        const showFormBtn = document.getElementById('show-employe-form');
        if (showFormBtn) {
            showFormBtn.style.display = 'block';
        }
        form.reset();
        
        // Remettre le bouton en mode "Ajouter"
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter l\'employé';
            // Supprimer l'ancien event listener et en ajouter un nouveau
            submitBtn.removeEventListener('click', this.updateEmploye);
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addEmploye();
            });
        }
        
        this.showNotification('Employé modifié avec succès !', 'success');
    }

    cancelEmployeEdit() {
        const form = document.getElementById('employe-form');
        if (form) {
            form.style.display = 'none';
            form.reset();
        }

        // Remettre le bouton en mode "Ajouter"
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter l\'employé';
            // Supprimer l'ancien event listener et en ajouter un nouveau
            submitBtn.removeEventListener('click', this.updateEmploye);
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addEmploye();
            });
        }

        // Afficher le bouton "Ajouter un employé"
        const showFormBtn = document.getElementById('show-employe-form');
        if (showFormBtn) {
            showFormBtn.style.display = 'block';
        }

        // Masquer le bouton "Annuler"
        const cancelBtn = form.querySelector('#cancel-employe-form');
        if (cancelBtn) {
            cancelBtn.style.display = 'none';
        }

        this.showNotification('Édition annulée avec succès !', 'info');
    }

    displayEmployes() {
        const employesList = document.getElementById('employes-list');
        if (!employesList) return;

        if (this.employes.length === 0) {
            employesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-user-friends" style="font-size: 3rem; color: var(--medium-gray); margin-bottom: 1rem;"></i>
                    <p>Aucun employé prévisionnel configuré</p>
                    <small>Cliquez sur "Ajouter un employé" pour commencer</small>
                </div>
            `;
            return;
        }

        employesList.innerHTML = this.employes.map(employe => {
            // Gestion de la compatibilité avec l'ancien format
            const servicesAttribues = employe.servicesAttribues || employe.services || [];
            const nom = employe.nom || '';
            const prenom = employe.prenom || '';
            const nomComplet = prenom ? `${prenom} ${nom}` : nom;
            
            const servicesLabels = servicesAttribues.map(serviceId => {
                const service = this.services.find(s => s.id === serviceId);
                return service ? service.name : 'Service inconnu';
            }).join(', ');

            const statusClass = employe.disponibilite?.modulationAnnuelle ? 'modulation' : 'actif';
            const statusText = employe.disponibilite?.modulationAnnuelle ? 'Modulation annuelle' : 'Standard';

            const tauxBrut = employe.tauxHoraireBrut || employe.taux || 0;
            const tauxCharges = employe.tauxChargesPatronales || 45;
            const coutHoraireTotal = tauxBrut * (1 + tauxCharges / 100);

            return `
                <div class="employe-item" data-id="${employe.id}">
                    <div class="employe-info">
                        <div class="employe-name">
                            <i class="fas fa-user"></i>
                            ${nomComplet}
                            <span class="employe-category">${this.getCategoryLabel(employe.categorie)}</span>
                        </div>
                        
                        <div class="employe-status ${statusClass}">
                            <i class="fas fa-${employe.disponibilite?.modulationAnnuelle ? 'calendar-alt' : 'clock'}"></i>
                            ${statusText}
                        </div>
                        
                        <div class="employe-details">
                            <div class="employe-detail">
                                <i class="fas fa-tags"></i>
                                ${employe.niveau || 'N/A'} - Échelon ${employe.echelon || 'N/A'}
                            </div>
                            <div class="employe-detail">
                                <i class="fas fa-file-contract"></i>
                                ${employe.typeContrat || 'N/A'}
                            </div>
                            <div class="employe-detail">
                                <i class="fas fa-euro-sign"></i>
                                ${tauxBrut}€/h brut (${coutHoraireTotal.toFixed(2)}€/h total)
                            </div>
                            <div class="employe-detail">
                                <i class="fas fa-clock"></i>
                                ${employe.disponibilite?.heuresAnnuelContractuelles || 2028}h/an
                            </div>

                            <div class="employe-detail">
                                <i class="fas fa-cogs"></i>
                                ${servicesAttribues.length} service(s)
                            </div>
                        </div>
                        
                        <div class="employe-services">
                            <small><strong>Services :</strong> ${servicesLabels || 'Aucun service'}</small>
                        </div>
                    </div>
                    
                    <div class="employe-actions">
                        <button class="edit-btn" onclick="gestPrev.editEmploye('${employe.id}')" title="Modifier">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="gestPrev.deleteEmploye('${employe.id}')" title="Supprimer">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== MISE À JOUR DES SÉLECTIONS =====
    updateAllSelects() {
        this.updateServicesSelect();
        this.updateEmployesServicesSelect();
        this.updatePlanningServiceSelect();
        this.updatePlanningTestQuotaSelect();
        this.updateAllSimulationServiceSelects();
    }

    updateServicesSelect() {
        const servicesSelect = document.getElementById('employe-services');
        if (!servicesSelect) return;

        servicesSelect.innerHTML = '<option value="">Sélectionner des services...</option>';
        this.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            servicesSelect.appendChild(option);
        });
    }

    updateEmployesServicesSelect() {
        const employesServicesSelect = document.getElementById('employe-services');
        if (!employesServicesSelect) return;

        // Garder les options existantes mais mettre à jour le texte
        Array.from(employesServicesSelect.options).forEach(option => {
            if (option.value) {
                const service = this.services.find(s => s.id === option.value);
                if (service) {
                    option.textContent = service.name;
                }
            }
        });
    }

    updatePlanningServiceSelect() {
        const planningServiceSelect = document.getElementById('planning-service');
        if (!planningServiceSelect) return;

        planningServiceSelect.innerHTML = '<option value="">Sélectionner un service...</option>';
        this.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            planningServiceSelect.appendChild(option);
        });
    }

    updatePlanningTestQuotaSelect() {
        const planningTestQuotaSelect = document.getElementById('planning-test-quota');
        if (!planningTestQuotaSelect) return;

        planningTestQuotaSelect.innerHTML = '<option value="">Sélectionner un employé...</option>';
        this.employes.forEach(employe => {
            const option = document.createElement('option');
            option.value = employe.id;
            option.textContent = `${employe.nom} (${employe.quota}h)`;
            planningTestQuotaSelect.appendChild(option);
        });
    }

    // ===== GESTION DU PLANNING RH =====
    setupPlanningHandlers() {
        // Gestionnaire pour le sélecteur de semaine
        const weekInput = document.getElementById('planning-week');
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');

        // Initialiser la semaine courante
        if (weekInput) {
            const today = new Date();
            const weekStart = this.getWeekStart(today);
            weekInput.value = this.formatWeekInput(weekStart);
        }

        // Navigation des semaines
        if (prevWeekBtn) {
            prevWeekBtn.addEventListener('click', () => {
                this.navigateWeek(-1);
            });
        }

        if (nextWeekBtn) {
            nextWeekBtn.addEventListener('click', () => {
                this.navigateWeek(1);
            });
        }

        // Gestionnaire pour le service
        const serviceSelect = document.getElementById('planning-service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', () => {
                this.updateEmployesSelector();
            });
        }

        // Gestionnaire pour générer le planning
        const generateBtn = document.getElementById('generate-planning');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generatePlanning();
            });
        }

        // Gestionnaire pour optimiser automatiquement
        const optimizeBtn = document.getElementById('optimize-planning');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizePlanning();
            });
        }
    }

    getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1);
        return new Date(d.setDate(diff));
    }

    formatWeekInput(date) {
        const year = date.getFullYear();
        const week = this.getWeekNumber(date);
        return `${year}-W${week.toString().padStart(2, '0')}`;
    }

    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    navigateWeek(direction) {
        const weekInput = document.getElementById('planning-week');
        if (!weekInput.value) return;

        const [year, week] = weekInput.value.split('-W');
        const currentDate = this.getDateFromWeek(parseInt(year), parseInt(week));
        currentDate.setDate(currentDate.getDate() + (direction * 7));
        
        weekInput.value = this.formatWeekInput(currentDate);
        this.updateTimeline();
    }

    getDateFromWeek(year, week) {
        const simple = new Date(year, 0, 1 + (week - 1) * 7);
        const dayOfWeek = simple.getDay();
        const weekStart = simple;
        if (dayOfWeek <= 4) {
            weekStart.setDate(simple.getDate() - simple.getDay() + 1);
        } else {
            weekStart.setDate(simple.getDate() + 8 - simple.getDay());
        }
        return weekStart;
    }

    updateEmployesSelector() {
        const serviceId = document.getElementById('planning-service').value;
        const employesSelector = document.querySelector('.employes-selector');
        
        if (!employesSelector || !serviceId) return;

        // Filtrer les employés par service
        const employesService = this.employes.filter(employe => {
            const servicesAttribues = employe.servicesAttribues || employe.services || [];
            return servicesAttribues.includes(serviceId);
        });

        employesSelector.innerHTML = employesService.map(employe => `
            <div class="employe-selector-item" data-employe-id="${employe.id}">
                <input type="checkbox" id="employe-${employe.id}" name="planning-employes" value="${employe.id}">
                <div class="employe-info">
                    <div class="employe-name">${employe.prenom || ''} ${employe.nom}</div>
                    <div class="employe-details">
                        ${employe.niveau || 'N/A'} - ${employe.typeContrat || 'N/A'} - 
                        ${employe.disponibilite?.heuresAnnuelContractuelles || 2028}h/an
                    </div>
                </div>
            </div>
        `).join('');

        // Ajouter les gestionnaires d'événements
        employesSelector.querySelectorAll('.employe-selector-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.type !== 'checkbox') {
                    const checkbox = item.querySelector('input[type="checkbox"]');
                    checkbox.checked = !checkbox.checked;
                    item.classList.toggle('selected', checkbox.checked);
                } else {
                    item.classList.toggle('selected', e.target.checked);
                }
            });
        });
    }

    generatePlanning() {
        // Vérifier si on est dans l'interface simplifiée
        const simplifiedInterface = document.getElementById('employes-available');
        
        if (simplifiedInterface) {
            // Interface simplifiée - utiliser la nouvelle logique
            this.generateSimplifiedPlanning();
            return;
        }
        
        // Ancienne interface - logique originale
        const serviceId = document.getElementById('planning-service')?.value;
        const weekInput = document.getElementById('planning-week')?.value;
        const selectedEmployes = Array.from(document.querySelectorAll('input[name="planning-employes"]:checked'))
            .map(checkbox => checkbox.value);

        if (!serviceId || !weekInput || selectedEmployes.length === 0) {
            this.showNotification('Veuillez sélectionner un service, une semaine et au moins un employé', 'error');
            return;
        }

        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            this.showNotification('Service non trouvé', 'error');
            return;
        }

        // Créer le planning pour la semaine
        const planning = this.createWeeklyPlanning(service, weekInput, selectedEmployes);
        this.displayTimeline(planning);
        
        // Afficher les suggestions
        this.displaySuggestions(planning);
        
        // Afficher le bouton d'export
        const exportBtn = document.getElementById('export-planning');
        if (exportBtn) {
            exportBtn.style.display = 'inline-flex';
        }
        
        this.showNotification('Planning généré avec succès !', 'success');
        this.showNotification('Planning affiché dans la timeline', 'info');
    }

    createWeeklyPlanning(service, weekInput, selectedEmployes) {
        const [year, week] = weekInput.split('-W');
        const weekStart = this.getDateFromWeek(parseInt(year), parseInt(week));
        
        const planning = {
            service: service.name,
            weekStart: weekStart,
            employes: selectedEmployes.map(empId => {
                const employe = this.employes.find(e => e.id === empId);
                return {
                    id: employe.id,
                    nom: `${employe.prenom || ''} ${employe.nom}`,
                    niveau: employe.niveau,
                    typeContrat: employe.typeContrat,
                    heuresMax: employe.disponibilite?.heuresAnnuelContractuelles || 2028,
                    heuresSemaine: 0,
                    shifts: []
                };
            }),
            jours: [],
            statistiques: {
                couverture: 0,
                heuresTotales: 0,
                coutTotal: 0
            }
        };

        // Créer les jours de la semaine
        const joursSemaine = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
        
        joursSemaine.forEach((jour, index) => {
            const date = new Date(weekStart);
            date.setDate(date.getDate() + index);
            
            const horairesJour = service.horairesParJour[jour.toLowerCase()];
            const planningJour = {
                nom: jour,
                date: date,
                horaires: horairesJour,
                shifts: [],
                couverture: 0
            };

            // Calculer les créneaux par demi-journée
            if (horairesJour) {
                planningJour.shifts = this.calculateShifts(horairesJour, planning.employes);
                planningJour.couverture = planningJour.shifts.reduce((total, shift) => total + shift.heures, 0);
            }

            planning.jours.push(planningJour);
        });

        // Calculer les statistiques
        planning.statistiques = this.calculatePlanningStats(planning);

        return planning;
    }

    calculateShifts(horairesJour, employes) {
        const shifts = [];
        
        // Définir les créneaux par demi-journée
        const creneaux = [
            { nom: 'Matin', debut: '07:00', fin: '13:00', heures: 6 },
            { nom: 'Après-midi', debut: '13:00', fin: '19:00', heures: 6 },
            { nom: 'Soirée', debut: '19:00', fin: '23:00', heures: 4 }
        ];

        creneaux.forEach((creneau, index) => {
            // Assigner un employé au créneau (logique simple pour l'instant)
            const employeIndex = index % employes.length;
            const employe = employes[employeIndex];
            
            shifts.push({
                creneau: creneau.nom,
                debut: creneau.debut,
                fin: creneau.fin,
                heures: creneau.heures,
                employe: employe,
                type: this.getShiftType(creneau.heures)
            });

            // Mettre à jour les heures de l'employé
            employe.heuresSemaine += creneau.heures;
        });

        return shifts;
    }

    getShiftType(heures) {
        if (heures <= 4) return 'normal';
        if (heures <= 6) return 'standard';
        if (heures <= 8) return 'long';
        return 'overtime';
    }

    calculatePlanningStats(planning) {
        let heuresTotales = 0;
        let coutTotal = 0;
        let couvertureTotale = 0;

        planning.jours.forEach(jour => {
            heuresTotales += jour.couverture;
            couvertureTotale += jour.shifts.length;
        });

        // Calculer le coût (estimation)
        const coutMoyenHoraire = 15.50;
        coutTotal = heuresTotales * coutMoyenHoraire * 1.45; // Avec charges

        return {
            heuresTotales,
            coutTotal,
            couverture: Math.round((couvertureTotale / (planning.jours.length * 3)) * 100), // 3 créneaux par jour
            employesUtilises: planning.employes.length
        };
    }

    displayTimeline(planning) {
        const timelineContainer = document.getElementById('planning-timeline');
        if (!timelineContainer) return;

        const weekStart = planning.weekStart;
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);

        timelineContainer.innerHTML = `
            <div class="timeline-header">
                <h4>
                    <i class="fas fa-calendar-alt"></i>
                    Planning ${planning.service} - Semaine du ${weekStart.toLocaleDateString('fr-FR')} au ${weekEnd.toLocaleDateString('fr-FR')}
                </h4>
                <div class="timeline-stats">
                    <span><i class="fas fa-users"></i> ${planning.statistiques.employesUtilises} employés</span>
                    <span><i class="fas fa-clock"></i> ${planning.statistiques.heuresTotales}h</span>
                    <span><i class="fas fa-euro-sign"></i> ${planning.statistiques.coutTotal.toLocaleString()}€</span>
                    <span><i class="fas fa-percentage"></i> ${planning.statistiques.couverture}% couverture</span>
                </div>
            </div>
            
            <div class="timeline-content">
                <div class="timeline-grid">
                    <div class="timeline-header-row">
                        <div class="timeline-cell header">Employés</div>
                        ${planning.jours.map(jour => `
                            <div class="timeline-cell header">
                                ${jour.nom}<br>
                                <small>${jour.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</small>
                            </div>
                        `).join('')}
                    </div>
                    
                    ${planning.employes.map(employe => `
                        <div class="timeline-row">
                            <div class="timeline-cell employe">
                                <div class="employe-name">${employe.nom}</div>
                                <div class="shift-info">${employe.heuresSemaine}h/sem</div>
                            </div>
                            ${planning.jours.map(jour => {
                                const shift = jour.shifts.find(s => s.employe.id === employe.id);
                                if (shift) {
                                    return `
                                        <div class="timeline-cell employe assigned ${shift.type}">
                                            <div class="employe-name">${shift.creneau}</div>
                                            <div class="shift-info">${shift.debut}-${shift.fin}</div>
                                        </div>
                                    `;
                                } else {
                                    return `
                                        <div class="timeline-cell employe assigned rest">
                                            <div class="employe-name">Repos</div>
                                            <div class="shift-info">-</div>
                                        </div>
                                    `;
                                }
                            }).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="timeline-legend">
                <div class="legend-item">
                    <div class="legend-color" style="background: #28a745;"></div>
                    <span>Matin (6h)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #17a2b8;"></div>
                    <span>Après-midi (6h)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #6f42c1;"></div>
                    <span>Soirée (4h)</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #dc3545;"></div>
                    <span>Heures supp</span>
                </div>
                <div class="legend-item">
                    <div class="legend-color" style="background: #6c757d;"></div>
                    <span>Repos</span>
                </div>
            </div>
        `;
    }

    displaySuggestions(planning) {
        const suggestionsContainer = document.getElementById('planning-suggestions');
        if (!suggestionsContainer) return;

        const suggestions = this.generateSuggestions(planning);
        const alertes = this.generateAlertes(planning);

        suggestionsContainer.innerHTML = `
            <div class="suggestions-header">
                <i class="fas fa-lightbulb"></i>
                Suggestions et alertes
            </div>
            <div class="suggestions-content">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item">
                        <h5>${suggestion.titre}</h5>
                        <p>${suggestion.description}</p>
                        <div class="suggestion-actions">
                            <button class="btn-apply" onclick="gestPrevApp.applySuggestion('${suggestion.id}')">
                                Appliquer
                            </button>
                        </div>
                    </div>
                `).join('')}
                
                ${alertes.map(alerte => `
                    <div class="alert-item ${alerte.type}">
                        <i class="${alerte.icon}"></i>
                        ${alerte.message}
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateSuggestions(planning) {
        const suggestions = [];

        // Suggestion d'équilibrage des charges
        const employesSurcharges = planning.employes.filter(emp => emp.heuresSemaine > 40);
        if (employesSurcharges.length > 0) {
            suggestions.push({
                id: 'equilibrage',
                titre: 'Équilibrage des charges',
                description: `${employesSurcharges.length} employé(s) dépassent 40h/semaine. Répartir les heures pour équilibrer les charges.`
            });
        }

        // Suggestion d'optimisation des coûts
        if (planning.statistiques.coutTotal > 5000) {
            suggestions.push({
                id: 'optimisation-cout',
                titre: 'Optimisation des coûts',
                description: 'Coût élevé détecté. Considérez réduire les heures ou optimiser les créneaux.'
            });
        }

        return suggestions;
    }

    generateAlertes(planning) {
        const alertes = [];

        // Alerte si employé dépasse les limites
        planning.employes.forEach(employe => {
            if (employe.heuresSemaine > 46) {
                alertes.push({
                    type: 'danger',
                    message: `${employe.nom} : ${employe.heuresSemaine}h cette semaine (limite 46h)`,
                    icon: 'fas fa-exclamation-circle'
                });
            } else if (employe.heuresSemaine > 40) {
                alertes.push({
                    type: 'warning',
                    message: `${employe.nom} : ${employe.heuresSemaine}h cette semaine (proche limite)`,
                    icon: 'fas fa-exclamation-triangle'
                });
            }
        });

        // Alerte si couverture insuffisante
        if (planning.statistiques.couverture < 80) {
            alertes.push({
                type: 'warning',
                message: `Couverture faible : ${planning.statistiques.couverture}%. Considérez ajouter du personnel.`,
                icon: 'fas fa-users'
            });
        }

        return alertes;
    }

    optimizePlanning() {
        // Logique d'optimisation automatique
        this.showNotification('Optimisation automatique en cours...', 'info');
        this.showNotification('Analyse des charges et des coûts...', 'info');
        
        // Simuler l'optimisation
        setTimeout(() => {
            this.showNotification('Planning optimisé ! Équilibrage des charges et réduction des coûts.', 'success');
        }, 2000);
    }

    applySuggestion(suggestionId) {
        // Logique pour appliquer les suggestions
        this.showNotification('Suggestion appliquée !', 'success');
    }

    initializePlanningDisplay() {
        const timelineContainer = document.getElementById('planning-timeline');
        const suggestionsContainer = document.getElementById('planning-suggestions');
        
        if (timelineContainer) {
            timelineContainer.innerHTML = `
                <div class="timeline-header">
                    <h4>
                        <i class="fas fa-calendar-alt"></i>
                        Planning RH
                    </h4>
                    <div class="timeline-stats">
                        <span><i class="fas fa-info-circle"></i> Sélectionnez un service pour commencer</span>
                    </div>
                </div>
                <div class="timeline-content">
                    <div style="text-align: center; padding: 3rem; color: var(--medium-gray);">
                        <i class="fas fa-calendar-alt" style="font-size: 3rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Aucun planning généré</p>
                        <small>Sélectionnez un service, une semaine et des employés, puis cliquez sur "Générer le planning"</small>
                    </div>
                </div>
            `;
        }
        
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = `
                <div class="suggestions-header">
                    <i class="fas fa-lightbulb"></i>
                    Suggestions et alertes
                </div>
                <div class="suggestions-content">
                    <div style="text-align: center; padding: 2rem; color: var(--medium-gray);">
                        <i class="fas fa-lightbulb" style="font-size: 2rem; margin-bottom: 1rem; opacity: 0.5;"></i>
                        <p>Aucune suggestion disponible</p>
                        <small>Les suggestions apparaîtront après la génération d'un planning</small>
                    </div>
                </div>
            `;
        }
    }

    // ===== SIMULATION =====
    runSimulation() {
        const periode = parseInt(document.getElementById('simulation-periode').value);
        const tauxCharges = parseFloat(document.getElementById('simulation-taux-charges').value);
        const caEstime = parseFloat(document.getElementById('simulation-ca-estime').value);
        const margeObjectif = parseFloat(document.getElementById('simulation-marge-objectif').value);

        if (!periode || !tauxCharges || !caEstime || !margeObjectif) {
            this.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const results = this.calculateAdvancedSimulation(periode, tauxCharges, caEstime, margeObjectif);
        this.displayFinancialSimulationResults(results);
        
        this.showNotification('Analyse financière terminée avec succès !', 'success');
    }

    // ===== SIMULATION RH AVANCÉE =====
    runAdvancedRHSimulation() {
        // Vérifier s'il y a un planning généré
        const planningResults = document.getElementById('planning-results');
        if (!planningResults || planningResults.innerHTML.includes('Aucun planning généré')) {
            this.showNotification('Veuillez d\'abord générer un planning pour calculer la masse salariale réelle', 'warning');
            return;
        }

        const periode = parseInt(document.getElementById('simulation-periode').value);
        const tauxCharges = parseFloat(document.getElementById('simulation-taux-charges').value);
        const caEstime = parseFloat(document.getElementById('simulation-ca-estime').value);
        const margeObjectif = parseFloat(document.getElementById('simulation-marge-objectif').value);

        if (!periode || !tauxCharges || !caEstime || !margeObjectif) {
            this.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        // Récupérer les données du planning actuel
        const planningData = this.getCurrentPlanningData();
        if (!planningData) {
            this.showNotification('Aucune donnée de planning trouvée', 'error');
            return;
        }
        
        const results = this.calculateAdvancedRHSimulationFromPlanning(planningData, periode, tauxCharges, caEstime, margeObjectif);
        this.displayAdvancedRHResults(results);
        
        this.showNotification('Simulation RH avancée basée sur le planning réel terminée !', 'success');
    }

    getCurrentPlanningData() {
        // Récupérer les données du planning actuel depuis le localStorage ou la session
        const currentPlanning = localStorage.getItem('currentPlanning');
        if (currentPlanning) {
            return JSON.parse(currentPlanning);
        }
        
        // Si pas de planning sauvegardé, essayer de récupérer depuis l'interface
        const planningResults = document.getElementById('planning-results');
        if (planningResults && !planningResults.innerHTML.includes('Aucun planning généré')) {
            // Extraire les données du planning affiché
            return this.extractPlanningDataFromUI();
        }
        
        return null;
    }

    extractPlanningDataFromUI() {
        // Extraire les données du planning depuis l'interface utilisateur
        const planningData = {
            service: null,
            employes: [],
            semaines: [],
            totalHeures: 0,
            masseSalariale: 0
        };

        // Récupérer le service sélectionné
        const serviceSelect = document.getElementById('planning-service');
        if (serviceSelect && serviceSelect.value) {
            const service = this.services.find(s => s.id === serviceSelect.value);
            if (service) {
                planningData.service = service;
            }
        }

        // Récupérer les employés sélectionnés
        const selectedEmployes = this.getSelectedEmployes();
        planningData.employes = selectedEmployes;

        // Calculer les heures totales et la masse salariale
        if (planningData.service && planningData.employes.length > 0) {
            planningData.totalHeures = this.calculateTotalHoursFromPlanning(planningData.service, planningData.employes);
            planningData.masseSalariale = this.calculateMasseSalarialeFromPlanning(planningData.employes, planningData.totalHeures);
        }

        return planningData;
    }

    calculateTotalHoursFromPlanning(service, employes) {
        // Calculer les heures totales basées sur le planning réel
        let totalHeures = 0;
        
        // Calculer les heures par saison
        const heuresHaute = this.calculateHeuresSemaine(service).haute;
        const heuresBasse = this.calculateHeuresSemaine(service).basse;
        
        // Répartir sur 52 semaines (haute saison = 6 mois, basse saison = 6 mois)
        totalHeures = (heuresHaute * 26) + (heuresBasse * 26);
        
        return totalHeures;
    }

    calculateMasseSalarialeFromPlanning(employes, totalHeures) {
        // Calculer la masse salariale basée sur les heures réelles du planning
        let masseSalariale = 0;
        
        employes.forEach(employe => {
            // Calculer les heures par employé basées sur sa disponibilité
            const heuresParEmploye = totalHeures / employes.length;
            const salaireAnnuel = heuresParEmploye * employe.salaireHoraire;
            masseSalariale += salaireAnnuel;
        });
        
        return masseSalariale;
    }

    // === NOUVELLES FONCTIONS POUR LA SIMULATION RH BASÉE SUR LE PLANNING ===
    
    calculateGestionCongesFromPlanning(employes, periode) {
        const totalEmployes = employes.length;
        const joursCongesParEmploye = 25; // Congés payés
        const joursReposHebdo = 104; // 52 semaines * 2 jours
        const joursFeries = 11;
        
        // Calculer les heures de travail réelles basées sur le planning
        const heuresTravailReelles = employes.reduce((total, emp) => {
            return total + (emp.disponibilite ? emp.disponibilite.heuresAnnuelContractuelles : 1820);
        }, 0);
        
        const totalJoursConges = totalEmployes * joursCongesParEmploye;
        const totalJoursRepos = totalEmployes * joursReposHebdo;
        const totalJoursFeries = totalEmployes * joursFeries;
        
        const joursDisponibles = 365 * periode;
        const joursNonDisponibles = totalJoursConges + totalJoursRepos + totalJoursFeries;
        const tauxDisponibilite = ((joursDisponibles - joursNonDisponibles) / joursDisponibles) * 100;
        
        return {
            totalJoursConges: totalJoursConges,
            totalJoursRepos: totalJoursRepos,
            totalJoursFeries: totalJoursFeries,
            joursDisponibles: joursDisponibles,
            joursNonDisponibles: joursNonDisponibles,
            tauxDisponibilite: tauxDisponibilite,
            heuresTravailReelles: heuresTravailReelles,
            repartition: {
                congés: totalJoursConges,
                repos: totalJoursRepos,
                fériés: totalJoursFeries,
                travail: joursDisponibles - joursNonDisponibles
            }
        };
    }

    calculateRotationEquipesFromPlanning(service, employes) {
        const rotation = {
            hauteSaison: {
                effectifNecessaire: 0,
                effectifDisponible: employes.length,
                tauxRotation: 0,
                flexibilite: 0
            },
            basseSaison: {
                effectifNecessaire: 0,
                effectifDisponible: employes.length,
                tauxRotation: 0,
                flexibilite: 0
            }
        };

        // Calculer les besoins basés sur le planning réel
        if (service) {
            const heuresHaute = this.calculateHeuresSemaine(service).haute;
            const heuresBasse = this.calculateHeuresSemaine(service).basse;
            
            rotation.hauteSaison.effectifNecessaire = Math.ceil(heuresHaute / 35);
            rotation.basseSaison.effectifNecessaire = Math.ceil(heuresBasse / 35);
        }

        // Calculer les taux de rotation
        rotation.hauteSaison.tauxRotation = rotation.hauteSaison.effectifNecessaire > 0 
            ? (rotation.hauteSaison.effectifDisponible / rotation.hauteSaison.effectifNecessaire) * 100 
            : 0;
        rotation.basseSaison.tauxRotation = rotation.basseSaison.effectifNecessaire > 0 
            ? (rotation.basseSaison.effectifDisponible / rotation.basseSaison.effectifNecessaire) * 100 
            : 0;
        
        // Calculer la flexibilité basée sur les contrats réels
        const employesFlexibles = employes.filter(emp => emp.disponibilite && emp.disponibilite.heuresAnnuelContractuelles === 1820);
        rotation.hauteSaison.flexibilite = (employesFlexibles.length / employes.length) * 100;
        rotation.basseSaison.flexibilite = (employesFlexibles.length / employes.length) * 100;

        return rotation;
    }

    calculateIndicateursRHFromPlanning(totalHeures, totalCout, employes) {
        const totalEmployes = employes.length;
        const heuresParEmploye = totalHeures / totalEmployes;
        const coutParEmploye = totalCout / totalEmployes;
        const productiviteEmploye = totalHeures > 0 ? totalCout / totalHeures : 0;
        
        // Taux de turnover estimé (industrie hôtelière)
        const tauxTurnover = 25; // 25% par an
        
        // Coût de recrutement moyen
        const coutRecrutement = 3000; // € par recrutement
        const recrutementsAnnuels = Math.ceil(totalEmployes * (tauxTurnover / 100));
        const coutRecrutementTotal = recrutementsAnnuels * coutRecrutement;
        
        // Coût de formation
        const coutFormationParEmploye = 1500; // € par an
        const coutFormationTotal = totalEmployes * coutFormationParEmploye;
        
        // Indice de satisfaction estimé basé sur les données réelles
        const satisfaction = this.calculateSatisfactionEmployesFromPlanning(employes);
        
        return {
            totalEmployes: totalEmployes,
            heuresParEmploye: heuresParEmploye,
            coutParEmploye: coutParEmploye,
            productiviteEmploye: productiviteEmploye,
            tauxTurnover: tauxTurnover,
            coutRecrutementTotal: coutRecrutementTotal,
            coutFormationTotal: coutFormationTotal,
            satisfaction: satisfaction,
            coutRHTotal: totalCout + coutRecrutementTotal + coutFormationTotal
        };
    }

    calculateSatisfactionEmployesFromPlanning(employes) {
        let satisfaction = 0;
        let facteurs = 0;
        
        // Facteur 1: Équilibre travail/vie basé sur les heures réelles
        const heuresMoyennes = employes.reduce((sum, emp) => {
            const heures = emp.disponibilite ? emp.disponibilite.heuresSemaineContractuelles : 35;
            return sum + heures;
        }, 0) / employes.length;
        
        const satisfactionEquilibre = heuresMoyennes <= 35 ? 90 : heuresMoyennes <= 39 ? 75 : 60;
        satisfaction += satisfactionEquilibre;
        facteurs++;
        
        // Facteur 2: Diversité des compétences
        const competences = this.analyzeCompetences();
        const diversiteCompetences = Object.keys(competences).length;
        const satisfactionDiversite = Math.min(90, diversiteCompetences * 15);
        satisfaction += satisfactionDiversite;
        facteurs++;
        
        // Facteur 3: Niveaux de responsabilité
        const niveaux = this.analyzeNiveaux(employes);
        const satisfactionNiveaux = niveaux.senior > 0 ? 85 : 60;
        satisfaction += satisfactionNiveaux;
        facteurs++;
        
        return satisfaction / facteurs;
    }

    generateRHScenariosFromPlanning(planningData, periode, tauxCharges, caEstime, margeObjectif) {
        const scenarios = [];
        const { masseSalariale, totalHeures } = planningData;
        
        // Scénario 1: Optimisation des coûts
        const scenarioOptimisation = {
            nom: "Optimisation des coûts",
            description: "Réduction des coûts RH de 15%",
            impact: {
                coutReduction: 0.15,
                productivite: 1.05,
                satisfaction: 0.95
            }
        };
        
        // Scénario 2: Amélioration de la productivité
        const scenarioProductivite = {
            nom: "Amélioration de la productivité",
            description: "Formation et optimisation des processus",
            impact: {
                coutReduction: 0.05,
                productivite: 1.20,
                satisfaction: 1.10
            }
        };
        
        // Scénario 3: Flexibilité maximale
        const scenarioFlexibilite = {
            nom: "Flexibilité maximale",
            description: "Plus d'employés 35h et rotation",
            impact: {
                coutReduction: 0.10,
                productivite: 1.15,
                satisfaction: 1.15
            }
        };
        
        // Calculer les impacts pour chaque scénario basé sur les données réelles
        [scenarioOptimisation, scenarioProductivite, scenarioFlexibilite].forEach(scenario => {
            const coutScenario = masseSalariale * (1 - scenario.impact.coutReduction);
            const chargesScenario = coutScenario * (tauxCharges / 100);
            const coutTotalScenario = coutScenario + chargesScenario;
            
            const margeScenario = caEstime - coutTotalScenario;
            const margePourcentageScenario = caEstime > 0 ? (margeScenario / caEstime) * 100 : 0;
            
            scenario.resultats = {
                coutReduction: scenario.impact.coutReduction * 100,
                margePourcentage: margePourcentageScenario,
                ecartObjectif: margePourcentageScenario - margeObjectif,
                economies: masseSalariale - coutScenario
            };
            
            scenarios.push(scenario);
        });
        
        return scenarios;
    }

    analyzeRisquesRHFromPlanning(planningData) {
        const risques = [];
        const { service, employes, totalHeures } = planningData;
        
        // Risque 1: Sous-effectif basé sur le planning réel
        const effectifNecessaire = Math.ceil(totalHeures / 35);
        if (employes.length < effectifNecessaire) {
            risques.push({
                type: 'danger',
                niveau: 'Élevé',
                description: `Sous-effectif : ${employes.length}/${effectifNecessaire} employés`,
                impact: 'Risque de surcharge et turnover',
                recommandation: 'Recruter des employés supplémentaires'
            });
        }
        
        // Risque 2: Manque de seniors
        const niveaux = this.analyzeNiveaux(employes);
        if (niveaux.senior < 1 && employes.length > 2) {
            risques.push({
                type: 'warning',
                niveau: 'Moyen',
                description: 'Aucun employé senior',
                impact: 'Manque de supervision et expertise',
                recommandation: 'Promouvoir ou recruter des seniors'
            });
        }
        
        // Risque 3: Coût horaire élevé basé sur les données réelles
        const coutHoraireMoyen = employes.reduce((sum, emp) => sum + emp.salaireHoraire, 0) / employes.length;
        if (coutHoraireMoyen > 25) {
            risques.push({
                type: 'warning',
                niveau: 'Moyen',
                description: `Coût horaire élevé : ${coutHoraireMoyen.toFixed(2)}€/h`,
                impact: 'Rentabilité compromise',
                recommandation: 'Optimiser la structure salariale'
            });
        }
        
        // Risque 4: Manque de flexibilité
        const employes35h = employes.filter(emp => emp.disponibilite && emp.disponibilite.heuresAnnuelContractuelles === 1820);
        if (employes35h.length === 0) {
            risques.push({
                type: 'info',
                niveau: 'Faible',
                description: 'Aucun employé 35h',
                impact: 'Flexibilité limitée pour les pics',
                recommandation: 'Diversifier les contrats'
            });
        }
        
        return risques;
    }

    calculateAdvancedSimulation(periode, tauxCharges, caEstime, margeObjectif) {
        // Calcul des heures totales des services
        const totalHeuresServices = this.services.reduce((total, service) => {
            const heuresSemaine = this.calculateHeuresSemaine(service);
            return total + heuresSemaine.haute + heuresSemaine.basse;
        }, 0);

        // Calcul des coûts employés
        const totalCoutEmployes = this.employes.reduce((total, employe) => {
            return total + (employe.salaireHoraire * employe.heuresSemaineContractuelles * 4.33 * periode);
        }, 0);

        // Calculs financiers
        const chargesSociales = totalCoutEmployes * (tauxCharges / 100);
        const coutTotal = totalCoutEmployes + chargesSociales;
        const coutHoraireMoyen = totalHeuresServices > 0 ? coutTotal / totalHeuresServices : 0;
        
        // Analyses de rentabilité
        const margeBrute = caEstime - coutTotal;
        const margeBrutePourcentage = caEstime > 0 ? (margeBrute / caEstime) * 100 : 0;
        const objectifMarge = (caEstime * margeObjectif) / 100;
        const ecartMarge = margeBrute - objectifMarge;
        
        // Indicateurs de performance
        const ratioCoutCA = caEstime > 0 ? (coutTotal / caEstime) * 100 : 0;
        const productiviteHoraire = totalHeuresServices > 0 ? caEstime / totalHeuresServices : 0;
        
        // Répartition des coûts
        const repartitionCouts = {
            salaires: totalCoutEmployes,
            charges: chargesSociales,
            total: coutTotal
        };

        return {
            periode: periode,
            tauxCharges: tauxCharges,
            caEstime: caEstime,
            margeObjectif: margeObjectif,
            totalHeuresServices: totalHeuresServices,
            totalCoutEmployes: totalCoutEmployes,
            chargesSociales: chargesSociales,
            coutTotal: coutTotal,
            coutHoraireMoyen: coutHoraireMoyen,
            margeBrute: margeBrute,
            margeBrutePourcentage: margeBrutePourcentage,
            objectifMarge: objectifMarge,
            ecartMarge: ecartMarge,
            ratioCoutCA: ratioCoutCA,
            productiviteHoraire: productiviteHoraire,
            repartitionCouts: repartitionCouts,
            alertes: this.generateFinancialAlertes(totalHeuresServices, totalCoutEmployes, coutHoraireMoyen, margeBrutePourcentage, ratioCoutCA)
        };
    }

    generateAlertes(heures, cout, coutHoraire) {
        const alertes = [];
        
        if (heures === 0) {
            alertes.push('⚠️ Aucun service configuré avec des horaires');
        }
        
        if (cout === 0) {
            alertes.push('⚠️ Aucun employé configuré');
        }
        
        if (coutHoraire > 50) {
            alertes.push('⚠️ Coût horaire élevé (>50€/h)');
        }
        
        return alertes;
    }

    calculateHCRCost(heures) {
        const tauxMoyen = this.employes.length > 0 
            ? this.employes.reduce((sum, emp) => sum + emp.taux, 0) / this.employes.length 
            : 0;
        return heures * tauxMoyen;
    }

    displayFinancialSimulationResults(results) {
        const simulationResults = document.getElementById('simulation-results');
        if (!simulationResults) return;

        const periodeLabels = {
            1: '1 mois',
            3: '3 mois (trimestre)',
            6: '6 mois (semestre)',
            12: '12 mois (année)'
        };

        simulationResults.innerHTML = `
            <div class="financial-analysis">
                <div class="analysis-header">
                    <h4><i class="fas fa-chart-pie"></i> Analyse Financière - ${periodeLabels[results.periode]}</h4>
                    <div class="analysis-summary">
                        <div class="summary-item ${results.margeBrutePourcentage >= results.margeObjectif ? 'positive' : 'negative'}">
                            <span class="summary-label">Marge brute</span>
                            <span class="summary-value">${results.margeBrutePourcentage.toFixed(1)}%</span>
                    </div>
                        <div class="summary-item">
                            <span class="summary-label">Objectif</span>
                            <span class="summary-value">${results.margeObjectif}%</span>
                </div>
                        <div class="summary-item">
                            <span class="summary-label">Écart</span>
                            <span class="summary-value ${results.ecartMarge >= 0 ? 'positive' : 'negative'}">${results.ecartMarge.toFixed(0)}€</span>
                    </div>
                </div>
                </div>

                <div class="financial-grid">
                    <div class="financial-card revenue">
                        <div class="card-header">
                            <i class="fas fa-euro-sign"></i>
                            <h5>Chiffre d'affaires</h5>
            </div>
                        <div class="card-content">
                            <div class="card-value">${results.caEstime.toLocaleString()}€</div>
                            <div class="card-period">sur ${periodeLabels[results.periode]}</div>
                </div>
                    </div>

                    <div class="financial-card costs">
                        <div class="card-header">
                            <i class="fas fa-calculator"></i>
                            <h5>Coûts totaux</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${results.coutTotal.toLocaleString()}€</div>
                            <div class="card-breakdown">
                                <span>Salaires: ${results.repartitionCouts.salaires.toLocaleString()}€</span>
                                <span>Charges: ${results.repartitionCouts.charges.toLocaleString()}€</span>
                            </div>
                        </div>
                    </div>

                    <div class="financial-card margin">
                        <div class="card-header">
                            <i class="fas fa-chart-line"></i>
                            <h5>Marge brute</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value ${results.margeBrute >= 0 ? 'positive' : 'negative'}">${results.margeBrute.toLocaleString()}€</div>
                            <div class="card-percentage">${results.margeBrutePourcentage.toFixed(1)}% du CA</div>
                        </div>
                    </div>

                    <div class="financial-card productivity">
                        <div class="card-header">
                            <i class="fas fa-tachometer-alt"></i>
                            <h5>Productivité</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${results.productiviteHoraire.toFixed(2)}€/h</div>
                            <div class="card-detail">CA par heure travaillée</div>
                        </div>
                    </div>
                </div>

                <div class="financial-details">
                    <div class="detail-section">
                        <h6><i class="fas fa-chart-bar"></i> Indicateurs de performance</h6>
                        <div class="indicators-grid">
                            <div class="indicator">
                                <span class="indicator-label">Ratio coûts/CA</span>
                                <span class="indicator-value">${results.ratioCoutCA.toFixed(1)}%</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Coût horaire moyen</span>
                                <span class="indicator-value">${results.coutHoraireMoyen.toFixed(2)}€/h</span>
                            </div>
                            <div class="indicator">
                                <span class="indicator-label">Heures totales</span>
                                <span class="indicator-value">${results.totalHeuresServices.toLocaleString()}h</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h6><i class="fas fa-exclamation-triangle"></i> Alertes et recommandations</h6>
                        <div class="alerts-container">
                            ${results.alertes.map(alerte => `
                                <div class="alert-item">
                                    <i class="fas ${alerte.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}"></i>
                                    <span>${alerte.message}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    generateFinancialAlertes(heures, cout, coutHoraire, margePourcentage, ratioCoutCA) {
        const alertes = [];
        
        if (heures === 0) {
            alertes.push({
                type: 'warning',
                message: 'Aucun service configuré avec des horaires'
            });
        }
        
        if (cout === 0) {
            alertes.push({
                type: 'warning',
                message: 'Aucun employé configuré'
            });
        }
        
        if (coutHoraire > 50) {
            alertes.push({
                type: 'warning',
                message: 'Coût horaire élevé (>50€/h) - Vérifiez les salaires'
            });
        }
        
        if (margePourcentage < 0) {
            alertes.push({
                type: 'danger',
                message: 'Marge négative - Analysez vos coûts et votre CA'
            });
        } else if (margePourcentage < 10) {
            alertes.push({
                type: 'warning',
                message: 'Marge faible (<10%) - Optimisez vos coûts'
            });
        }
        
        if (ratioCoutCA > 80) {
            alertes.push({
                type: 'warning',
                message: 'Ratio coûts/CA élevé (>80%) - Risque de rentabilité'
            });
        }
        
        if (margePourcentage >= 30) {
            alertes.push({
                type: 'success',
                message: 'Excellente rentabilité - Marge supérieure à 30%'
            });
        }
        
        return alertes;
    }

    // ===== TABLEAU DE BORD =====
    generateDashboard() {
        const mois = parseInt(document.getElementById('dashboard-mois').value);
        if (!mois) {
            this.showNotification('Veuillez sélectionner un mois', 'error');
            return;
        }

        const data = this.calculateDashboardData(mois);
        this.displayDashboard(data);
        
        this.showNotification('Tableau de bord généré avec succès !', 'success');
    }

    calculateDashboardData(mois) {
        const totalServices = this.services.length;
        const totalEmployes = this.employes.length;
        const totalHeures = this.services.reduce((total, service) => {
            const heures = this.calculateHeuresSemaine(service);
            return total + heures.haute + heures.basse;
        }, 0);
        const coutMoyen = this.employes.length > 0 
            ? this.employes.reduce((sum, emp) => sum + emp.taux, 0) / this.employes.length 
            : 0;

        return {
            mois: mois,
            totalServices: totalServices,
            totalEmployes: totalEmployes,
            totalHeures: totalHeures,
            coutMoyen: coutMoyen,
            servicesParCategorie: this.groupServicesByCategory(),
            employesParNiveau: this.groupEmployesByLevel()
        };
    }

    groupServicesByCategory() {
        const groups = {};
        this.services.forEach(service => {
            const category = service.category;
            groups[category] = (groups[category] || 0) + 1;
        });
        return groups;
    }

    groupEmployesByLevel() {
        const groups = {};
        this.employes.forEach(employe => {
            const niveau = employe.niveau;
            groups[niveau] = (groups[niveau] || 0) + 1;
        });
        return groups;
    }

    displayDashboard(data) {
        const dashboardResults = document.getElementById('dashboard-results');
        if (!dashboardResults) return;

        const moisLabels = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        dashboardResults.innerHTML = `
            <div class="dashboard-summary">
                <h4>Tableau de bord - ${moisLabels[data.mois - 1]}</h4>
                <div class="dashboard-stats">
                    <div class="stat-card">
                        <h5>Services</h5>
                        <span class="stat-value">${data.totalServices}</span>
            </div>
                    <div class="stat-card">
                        <h5>Employés</h5>
                        <span class="stat-value">${data.totalEmployes}</span>
                    </div>
                    <div class="stat-card">
                        <h5>Heures totales</h5>
                        <span class="stat-value">${data.totalHeures}h</span>
                </div>
                    <div class="stat-card">
                        <h5>Coût moyen</h5>
                        <span class="stat-value">${data.coutMoyen.toFixed(2)}€/h</span>
                    </div>
                </div>
                <div class="dashboard-details">
                    <div class="services-by-category">
                        <h5>Services par catégorie:</h5>
                        ${Object.entries(data.servicesParCategorie).map(([category, count]) => 
                            `<div class="category-item">${this.getCategoryLabel(category)}: ${count}</div>`
                        ).join('')}
                    </div>
                    <div class="employes-by-level">
                        <h5>Employés par niveau:</h5>
                        ${Object.entries(data.employesParNiveau).map(([niveau, count]) => 
                            `<div class="level-item">${niveau}: ${count}</div>`
                        ).join('')}
                </div>
                    </div>
                </div>
        `;
    }

    // ===== UTILITAIRES =====
    parseTime(timeString) {
        if (!timeString || typeof timeString !== 'string') {
            console.log('❌ parseTime: timeString invalide:', timeString);
            return null;
        }
        
        const parts = timeString.split(':');
        if (parts.length !== 2) {
            console.log('❌ parseTime: format invalide:', timeString);
            return null;
        }
        
        const hours = parseInt(parts[0], 10);
        const minutes = parseInt(parts[1], 10);
        
        if (isNaN(hours) || isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
            console.log('❌ parseTime: heures/minutes invalides:', hours, minutes);
            return null;
        }
        
        return hours * 60 + minutes;
    }

    calculateDuree(debut, fin) {
        const debutMinutes = this.parseTime(debut);
        const finMinutes = this.parseTime(fin);
        return (finMinutes - debutMinutes) / 60;
    }

    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // ===== GESTION DES SIMULATIONS =====
    saveSimulation(simulation) {
        const simulations = JSON.parse(localStorage.getItem('gestPrevSimulations') || '[]');
        simulation.id = Date.now();
        simulation.date = new Date().toISOString();
        simulation.nom = simulation.nom || `Simulation ${new Date().toLocaleDateString()}`;
        simulations.push(simulation);
        localStorage.setItem('gestPrevSimulations', JSON.stringify(simulations));
        this.showNotification('Simulation sauvegardée avec succès !', 'success');
    }

    // ===== GESTION DES SCÉNARIOS =====
    saveCurrentScenario() {
        const scenarioName = prompt('Nom du scénario :');
        if (!scenarioName) return;

        const currentScenario = {
            id: this.generateId(),
            name: scenarioName,
            date: new Date().toISOString(),
            services: [...this.services],
            employes: [...this.employes],
            planning: [...this.planning],
            config: {
                legalRules: this.legalRules,
                vacationPeriods: this.vacationPeriods
            }
        };

        // Sauvegarder dans localStorage
        const scenarios = JSON.parse(localStorage.getItem('gestPrevScenarios') || '[]');
        scenarios.push(currentScenario);
        localStorage.setItem('gestPrevScenarios', JSON.stringify(scenarios));

        this.showNotification(`Scénario "${scenarioName}" sauvegardé avec succès !`, 'success');
        this.displayScenariosList();
    }

    loadScenario(scenarioId) {
        const scenarios = JSON.parse(localStorage.getItem('gestPrevScenarios') || '[]');
        const scenario = scenarios.find(s => s.id === scenarioId);
        
        if (!scenario) {
            this.showNotification('Scénario non trouvé', 'error');
            return;
        }

        // Confirmer le chargement
        if (!confirm(`Charger le scénario "${scenario.name}" ? Cela remplacera les données actuelles.`)) {
            return;
        }

        // Charger les données du scénario
        this.services = [...scenario.services];
        this.employes = [...scenario.employes];
        this.planning = [...scenario.planning];
        this.legalRules = { ...this.legalRules, ...scenario.config.legalRules };
        this.vacationPeriods = { ...this.vacationPeriods, ...scenario.config.vacationPeriods };

        // Sauvegarder et mettre à jour l'affichage
        this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
        this.displayServices();
        this.displayEmployes();
        this.updateAllSelects();

        this.showNotification(`Scénario "${scenario.name}" chargé avec succès !`, 'success');
    }

    deleteScenario(scenarioId) {
        const scenarios = JSON.parse(localStorage.getItem('gestPrevScenarios') || '[]');
        const updatedScenarios = scenarios.filter(s => s.id !== scenarioId);
        localStorage.setItem('gestPrevScenarios', JSON.stringify(updatedScenarios));

        this.showNotification('Scénario supprimé avec succès !', 'info');
        this.displayScenariosList();
    }

    displayScenariosList() {
        const scenariosContainer = document.getElementById('scenarios-list');
        if (!scenariosContainer) return;

        const scenarios = JSON.parse(localStorage.getItem('gestPrevScenarios') || '[]');

        if (scenarios.length === 0) {
            scenariosContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-save" style="font-size: 2rem; color: var(--medium-gray); margin-bottom: 1rem;"></i>
                    <p>Aucun scénario sauvegardé</p>
                    <small>Créez un scénario pour le sauvegarder ici</small>
                </div>
            `;
            return;
        }

        scenariosContainer.innerHTML = scenarios.map(scenario => {
            const date = new Date(scenario.date);
            const servicesCount = scenario.services.length;
            const employesCount = scenario.employes.length;

            return `
                <div class="scenario-item" data-scenario-id="${scenario.id}">
                    <div class="scenario-header">
                        <div class="scenario-info">
                            <h5>${scenario.name}</h5>
                            <small>Créé le ${date.toLocaleDateString('fr-FR')}</small>
                        </div>
                        <div class="scenario-stats">
                            <span class="stat-badge">
                                <i class="fas fa-cogs"></i> ${servicesCount} services
                            </span>
                            <span class="stat-badge">
                                <i class="fas fa-users"></i> ${employesCount} employés
                            </span>
                        </div>
                    </div>
                    <div class="scenario-actions">
                        <button class="btn btn-sm btn-primary" onclick="gestPrev.loadScenario('${scenario.id}')">
                            <i class="fas fa-download"></i> Charger
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="gestPrev.deleteScenario('${scenario.id}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }

    loadSimulations() {
        return JSON.parse(localStorage.getItem('gestPrevSimulations') || '[]');
    }

    deleteSimulation(simulationId) {
        const simulations = this.loadSimulations();
        const updatedSimulations = simulations.filter(s => s.id !== simulationId);
        localStorage.setItem('gestPrevSimulations', JSON.stringify(updatedSimulations));
        this.showNotification('Simulation supprimée avec succès !', 'info');
    }

    // ===== CALCUL DES HEURES RESTANTES =====
    calculateAvailableHours(employe, semaine) {
        const heuresContractuelles = employe.disponibilite.heuresHebdoStandard;
        const heuresAffectees = this.getHeuresAffectees(employe, semaine);
        return Math.max(0, heuresContractuelles - heuresAffectees);
    }

    getHeuresAffectees(employe, semaine) {
        // Calculer les heures déjà affectées à l'employé pour cette semaine
        let heuresAffectees = 0;
        
        // Parcourir tous les services où l'employé est affecté
        employe.servicesAttribues.forEach(serviceId => {
            const service = this.services.find(s => s.id === serviceId);
            if (service) {
                // Calculer les heures du service pour cette semaine
                const heuresService = this.calculateServiceHoursForWeek(service, semaine);
                // Répartir proportionnellement entre les employés du service
                const employesService = this.employes.filter(e => e.servicesAttribues.includes(serviceId));
                const heuresParEmploye = heuresService / employesService.length;
                heuresAffectees += heuresParEmploye;
            }
        });
        
        return Math.round(heuresAffectees * 10) / 10;
    }

    calculateServiceHoursForWeek(service, semaine) {
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        let totalHours = 0;
        
        const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        joursSemaine.forEach(jour => {
            const horaires = service.horairesParJour[jour];
            if (horaires && horaires[saison] && horaires[saison].ouverture && horaires[saison].fermeture) {
                const debut = this.parseTime(horaires[saison].ouverture);
                const fin = this.parseTime(horaires[saison].fermeture);
                
                if (debut !== null && fin !== null) {
                    let duree = (fin - debut) / 60;
                    if (duree < 0) duree += 24;
                    totalHours += duree;
                }
            }
        });
        
        return Math.round(totalHours * 10) / 10;
    }

    // ===== MODES DE GESTION =====
    setEmployeMode(employeId, mode) {
        const employe = this.employes.find(e => e.id === employeId);
        if (employe) {
            employe.modeGestion = mode;
            this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
            this.showNotification(`Mode ${mode} activé pour ${employe.prenom} ${employe.nom}`, 'info');
        }
    }

    getEmployeMode(employeId) {
        const employe = this.employes.find(e => e.id === employeId);
        return employe ? employe.modeGestion : 'semi-auto';
    }

    // ===== LOGIQUE DE COUVERTURE 100% =====
    optimizeCoverage(service, employes) {
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        const horairesService = this.calculateServiceHoursForWeek(service, 1);
        
        // Calculer les heures disponibles par employé
        const employesDisponibilite = employes.map(emp => ({
            employe: emp,
            heuresDisponibles: this.calculateAvailableHours(emp, 1),
            heuresAffectees: this.getHeuresAffectees(emp, 1),
            mode: emp.modeGestion
        }));

        // Trier par disponibilité (plus disponible en premier)
        employesDisponibilite.sort((a, b) => b.heuresDisponibles - a.heuresDisponibles);

        // Calculer la couverture optimale
        const resultat = {
            couverture: 0,
            repartition: [],
            alertes: []
        };

        let heuresRestantes = horairesService;
        let heuresUtilisees = 0;

        // Répartir les heures selon les modes de gestion
        employesDisponibilite.forEach(item => {
            if (heuresRestantes <= 0) return;

            const heuresAAllouer = Math.min(item.heuresDisponibles, heuresRestantes);
            
            if (heuresAAllouer > 0) {
                resultat.repartition.push({
                    employe: item.employe,
                    heuresAllouees: heuresAAllouer,
                    mode: item.mode,
                    pourcentage: (heuresAAllouer / horairesService) * 100
                });
                
                heuresUtilisees += heuresAAllouer;
                heuresRestantes -= heuresAAllouer;
            }
        });

        // Calculer la couverture finale
        resultat.couverture = (heuresUtilisees / horairesService) * 100;

        // Générer les alertes
        if (resultat.couverture < 100) {
            resultat.alertes.push({
                type: 'warning',
                message: `Couverture insuffisante : ${resultat.couverture.toFixed(1)}%. Il manque ${heuresRestantes.toFixed(1)}h pour atteindre 100%.`
            });
        } else if (resultat.couverture > 100) {
            resultat.alertes.push({
                type: 'info',
                message: `Couverture excessive : ${resultat.couverture.toFixed(1)}%. Surplus de ${Math.abs(heuresRestantes).toFixed(1)}h.`
            });
        }

        // Vérifier les contraintes légales
        resultat.repartition.forEach(item => {
            const heuresTotal = item.heuresAffectees + item.heuresAllouees;
            if (heuresTotal > 46) {
                resultat.alertes.push({
                    type: 'danger',
                    message: `${item.employe.prenom} ${item.employe.nom} : Dépassement de la limite hebdomadaire (${heuresTotal.toFixed(1)}h > 46h)`
                });
            }
        });

        return resultat;
    }

    // ===== VALIDATION DES CONTRAINTES LÉGALES =====
    validateLegalConstraints(employe, heuresSupplementaires) {
        const alertes = [];
        
        // Vérifier la limite hebdomadaire (46h)
        const heuresTotal = employe.disponibilite.heuresHebdoStandard + heuresSupplementaires;
        if (heuresTotal > 46) {
            alertes.push({
                type: 'danger',
                message: `Dépassement de la limite hebdomadaire : ${heuresTotal.toFixed(1)}h > 46h`
            });
        }

        // Vérifier la limite journalière (11h)
        const heuresMaxJour = Math.max(...Object.values(employe.horaires).map(h => {
            if (!h.actif) return 0;
            const debut = this.parseTime(h.debut);
            const fin = this.parseTime(h.fin);
            return fin > debut ? (fin - debut) / 60 : ((fin + 24) - debut) / 60;
        }));
        
        if (heuresMaxJour > 11) {
            alertes.push({
                type: 'danger',
                message: `Dépassement de la limite journalière : ${heuresMaxJour.toFixed(1)}h > 11h`
            });
        }

        // Vérifier les pauses obligatoires
        const heuresSansPause = employe.disponibilite.heuresHebdoStandard;
        if (heuresSansPause > 6) {
            alertes.push({
                type: 'warning',
                message: `Pause obligatoire de 20min après 6h de travail`
            });
        }

        return alertes;
    }

    // ===== AFFICHAGE DE L'HISTORIQUE DES SIMULATIONS =====
    displaySimulationsHistory() {
        const simulations = this.loadSimulations();
        const container = document.getElementById('simulations-history');
        if (!container) return;
        
        if (simulations.length === 0) {
            container.innerHTML = '<p class="no-simulations">Aucune simulation sauvegardée</p>';
            container.style.display = 'block';
            return;
        }
        
        let html = '<h6><i class="fas fa-history"></i> Historique des simulations</h6>';
        html += '<div class="simulations-list">';
        
        simulations.forEach(simulation => {
            const date = new Date(simulation.date).toLocaleDateString();
            const time = new Date(simulation.date).toLocaleTimeString();
            
            html += `
                <div class="simulation-item" data-simulation-id="${simulation.id}">
                    <div class="simulation-header">
                        <div class="simulation-info">
                            <h6>${simulation.nom}</h6>
                            <span class="simulation-date">${date} à ${time}</span>
                        </div>
                        <div class="simulation-stats">
                            <span class="coverage-badge ${this.getCoverageClass(simulation.coverage)}">
                                ${simulation.coverage}% couverture
                            </span>
                            <span class="cost-badge">
                                ${simulation.estimatedCost.toLocaleString()}€/an
                            </span>
                        </div>
                    </div>
                    <div class="simulation-details">
                        <span>Service: ${simulation.service}</span>
                        <span>Employés: ${simulation.employes.length}</span>
                        <span>Heures: ${simulation.selectedHours}h/semaine</span>
                    </div>
                    <div class="simulation-actions">
                        <button class="btn btn-sm btn-primary" onclick="gestPrev.loadSimulation('${simulation.id}')">
                            <i class="fas fa-eye"></i> Voir
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="gestPrev.exportSimulation('${simulation.id}')">
                            <i class="fas fa-download"></i> Exporter
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="gestPrev.deleteSimulation('${simulation.id}')">
                            <i class="fas fa-trash"></i> Supprimer
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
        
        // Masquer la prévisualisation si elle était affichée
        const previewContainer = document.getElementById('planning-preview');
        if (previewContainer) {
            previewContainer.style.display = 'none';
        }
    }

    loadSimulation(simulationId) {
        const simulations = this.loadSimulations();
        const simulation = simulations.find(s => s.id === simulationId);
        if (!simulation) {
            this.showNotification('Simulation non trouvée', 'error');
            return;
        }
        
        // Charger les données de la simulation
        this.loadSimulationData(simulation);
        this.showNotification(`Simulation "${simulation.nom}" chargée`, 'success');
    }

    loadSimulationData(simulation) {
        // Sélectionner le service
        const serviceSelect = document.getElementById('planning-service');
        if (serviceSelect) {
            const service = this.services.find(s => s.name === simulation.service);
            if (service) {
                serviceSelect.value = service.id;
            }
        }
        
        // Sélectionner les employés
        simulation.employes.forEach(employeId => {
            const checkbox = document.querySelector(`[data-employe-id="${employeId}"]`);
            if (checkbox) {
                checkbox.checked = true;
            }
        });
        
        // Mettre à jour l'affichage
        this.updateEmployesAnalysis();
    }

    exportSimulation(simulationId) {
        const simulations = this.loadSimulations();
        const simulation = simulations.find(s => s.id === simulationId);
        if (!simulation) {
            this.showNotification('Simulation non trouvée', 'error');
            return;
        }
        
        // Exporter en JSON
        const dataStr = JSON.stringify(simulation, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${simulation.nom}.json`;
        link.click();
        URL.revokeObjectURL(url);
        
        this.showNotification('Simulation exportée avec succès !', 'success');
    }

    showNotification(message, type = 'info') {
        // Supprimer les notifications existantes
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="${this.getNotificationIcon(type)}"></i>
            <span>${message}</span>
            </div>
        `;

        document.body.appendChild(notification);

        // Animation d'entrée
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // Auto-suppression après 5 secondes
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    getNotificationIcon(type) {
        const icons = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }

    getNotificationColor(type) {
        const colors = {
            'success': '#28a745',
            'error': '#dc3545',
            'warning': '#ffc107',
            'info': '#17a2b8'
        };
        return colors[type] || colors.info;
    }

    // ===== NAVIGATION =====
    switchModule(module) {
        // Mettre à jour les boutons
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${module}"]`).classList.add('active');

        // Afficher le contenu du module
        document.querySelectorAll('.module-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${module}-module`).classList.add('active');

        // Notification de changement de module
        const moduleNames = {
            'rh': 'Ressources Humaines',
            'financier': 'Financier',
            'infrastructure': 'Infrastructure',
            'commercial': 'Commercial',
            'environnement': 'Environnement',
            'operationnel': 'Opérationnel'
        };
        
        const moduleName = moduleNames[module] || module;
        this.showNotification(`Module ${moduleName} activé avec succès !`, 'info');
    }

    switchTab(tab) {
        // Mettre à jour les onglets
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Afficher la section correspondante
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(tab).classList.add('active');

        // Notification de changement d'onglet
        const tabNames = {
            'rh-presentation': 'Présentation',
            'rh-services': 'Services',
            'rh-employes': 'Employés',
            'rh-planning': 'Planning',
            'rh-simulation': 'Simulation',
            'rh-configuration': 'Configuration',
            'rh-dashboard': 'Tableau de bord'
        };
        
        const tabName = tabNames[tab] || tab;
        this.showNotification(`Section ${tabName} activée avec succès !`, 'info');
    }

    setupPlanningEventListeners() {
        // Bouton de génération de planning
        const generatePlanningBtn = document.getElementById('generate-planning');
        if (generatePlanningBtn) {
            generatePlanningBtn.addEventListener('click', () => {
                this.generatePlanning();
            });
        }

        // Bouton d'optimisation automatique
        const optimizePlanningBtn = document.getElementById('optimize-planning');
        if (optimizePlanningBtn) {
            optimizePlanningBtn.addEventListener('click', () => {
                this.optimizePlanning();
            });
        }

        // Bouton d'export
        const exportPlanningBtn = document.getElementById('export-planning');
        if (exportPlanningBtn) {
            exportPlanningBtn.addEventListener('click', () => {
                this.exportPlanning();
            });
        }

        // Navigation des semaines
        const prevWeekBtn = document.getElementById('prev-week');
        const nextWeekBtn = document.getElementById('next-week');
        const weekInput = document.getElementById('planning-week');

        if (prevWeekBtn && weekInput) {
            prevWeekBtn.addEventListener('click', () => {
                this.navigateWeek(-1);
            });
        }

        if (nextWeekBtn && weekInput) {
            nextWeekBtn.addEventListener('click', () => {
                this.navigateWeek(1);
            });
        }

        // Initialiser la semaine courante
        this.initializeCurrentWeek();

        // Gestion des sélections d'employés
        this.setupEmployeSelection();
    }

    initializeCurrentWeek() {
        const weekInput = document.getElementById('planning-week');
        if (weekInput) {
            const now = new Date();
            const year = now.getFullYear();
            const week = this.getWeekNumber(now);
            weekInput.value = `${year}-W${week.toString().padStart(2, '0')}`;
        }
    }

    getWeekNumber(date) {
        const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
        const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
        return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
    }

    navigateWeek(direction) {
        const weekInput = document.getElementById('planning-week');
        if (!weekInput.value) {
            this.initializeCurrentWeek();
            return;
        }

        // Notification de navigation
        const directionText = direction > 0 ? 'suivante' : 'précédente';
        this.showNotification(`Semaine ${directionText} sélectionnée !`, 'info');

        const [year, week] = weekInput.value.split('-W');
        let currentYear = parseInt(year);
        let currentWeek = parseInt(week);

        currentWeek += direction;

        if (currentWeek > 52) {
            currentWeek = 1;
            currentYear++;
        } else if (currentWeek < 1) {
            currentWeek = 52;
            currentYear--;
        }

        weekInput.value = `${currentYear}-W${currentWeek.toString().padStart(2, '0')}`;
    }

    setupEmployeSelection() {
        const serviceSelect = document.getElementById('planning-service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', () => {
                this.updateEmployeSelection();
            });
        }
    }

    updateEmployeSelection() {
        const serviceId = document.getElementById('planning-service').value;
        const employesSelector = document.querySelector('.employes-selector');
        
        if (!employesSelector || !serviceId) return;

        const service = this.services.find(s => s.id === serviceId);
        if (!service) return;

        // Filtrer les employés pour ce service
        const employesService = this.employes.filter(emp => 
            emp.services.includes(serviceId) && emp.statut === 'actif'
        );

        employesSelector.innerHTML = employesService.map(employe => `
            <div class="employe-selector-item">
                <input type="checkbox" id="emp-${employe.id}" name="planning-employes" value="${employe.id}">
                <label for="emp-${employe.id}">
                    <div class="employe-info">
                        <div class="employe-name">${employe.prenom} ${employe.nom}</div>
                        <div class="employe-details">
                            ${employe.niveau} - ${employe.salaireHoraire}€/h
                        </div>
                    </div>
                </label>
            </div>
        `).join('');
    }

    exportPlanning() {
        const timelineContainer = document.getElementById('planning-timeline');
        if (!timelineContainer) return;

        // Créer un contenu exportable
        const content = timelineContainer.innerText;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = 'planning-rh.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        this.showNotification('Planning exporté avec succès !', 'success');
        this.showNotification('Fichier téléchargé automatiquement', 'info');
    }

    setupSimulationEventListeners() {
        // Bouton de simulation
        const runSimulationBtn = document.getElementById('run-simulation');
        if (runSimulationBtn) {
            runSimulationBtn.addEventListener('click', () => {
                this.runSimulation();
            });
        }
    }

    setupDashboardEventListeners() {
        // Bouton de tableau de bord
        const generateDashboardBtn = document.getElementById('generate-dashboard');
        if (generateDashboardBtn) {
            generateDashboardBtn.addEventListener('click', () => {
                this.generateDashboard();
            });
        }
    }

    // ===== SIMULATION ANNUELLE AVEC RÈGLES LÉGALES =====
    
    // Configuration des règles légales
    legalRules = {
        heuresJour: 7.8,
        heuresSemaine: 39,
        heuresMois: 169,
        heuresAn: 1787,
        maxJour: 10,
        maxSemaine: 48,
        heuresSupplementaires: 220,
        congesPayes: 25,
        joursFeries: 11,
        reposHebdo: 24,
        pauses: {
            moins6h: 0,
            plus6h: 20,
            plus9h: 30
        }
    };

    // Configuration des vacances Zone A (Guyane)
    vacationPeriods = {
        toussaint: { debut: '2024-10-21', fin: '2024-11-06' },
        noel: { debut: '2024-12-18', fin: '2025-01-03' },
        carnaval: { debut: '2025-02-10', fin: '2025-02-26' },
        paques: { debut: '2025-04-08', fin: '2025-04-24' },
        ete: { debut: '2025-07-06', fin: '2025-09-01' }
    };

    // Initialisation des règles légales
    initializeLegalRules() {
        // Charger les règles depuis localStorage
        const savedRules = localStorage.getItem('gestPrevLegalRules');
        if (savedRules) {
            this.legalRules = { ...this.legalRules, ...JSON.parse(savedRules) };
        }

        // Mettre à jour les champs
        this.updateLegalRulesFields();
        
        // Event listeners pour les modifications
        this.setupLegalRulesEventListeners();
    }

    updateLegalRulesFields() {
        const fields = [
            'rule-heures-jour', 'rule-heures-semaine', 'rule-heures-mois', 'rule-heures-an',
            'rule-max-jour', 'rule-max-semaine', 'rule-heures-sup', 'rule-conges', 'rule-repos'
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const ruleKey = fieldId.replace('rule-', '').replace('-', '');
                if (this.legalRules[ruleKey] !== undefined) {
                    field.value = this.legalRules[ruleKey];
                }
            }
        });

        // Calculer automatiquement les heures/mois et heures/an
        this.calculateDerivedRules();
    }

    calculateDerivedRules() {
        const heuresSemaine = parseFloat(document.getElementById('rule-heures-semaine')?.value || 39);
        const heuresMois = heuresSemaine * 4.33; // 52 semaines / 12 mois
        const heuresAn = heuresSemaine * 45.82; // 52 semaines - congés

        document.getElementById('rule-heures-mois').value = Math.round(heuresMois);
        document.getElementById('rule-heures-an').value = Math.round(heuresAn);

        this.legalRules.heuresMois = Math.round(heuresMois);
        this.legalRules.heuresAn = Math.round(heuresAn);
    }

    setupLegalRulesEventListeners() {
        console.log('🔧 Configuration des event listeners pour les règles légales...');
        
        // Event listeners pour les champs modifiables
        const modifiableFields = [
            'rule-heures-jour', 'rule-heures-semaine', 'rule-max-jour', 
            'rule-max-semaine', 'rule-heures-sup', 'rule-conges', 'rule-repos'
        ];

        modifiableFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('change', () => {
                    this.updateLegalRules();
                });
            }
        });

        // Boutons d'action
        const saveRulesBtn = document.getElementById('save-rules');
        const resetRulesBtn = document.getElementById('reset-rules');
        const validateRulesBtn = document.getElementById('validate-rules');

        console.log('🔍 Boutons trouvés:', {
            saveRulesBtn: !!saveRulesBtn,
            resetRulesBtn: !!resetRulesBtn,
            validateRulesBtn: !!validateRulesBtn
        });

        if (saveRulesBtn) {
            saveRulesBtn.addEventListener('click', () => {
                console.log('💾 Clic sur Sauvegarder');
                this.saveLegalRules();
            });
        }

        if (resetRulesBtn) {
            resetRulesBtn.addEventListener('click', () => {
                console.log('🔄 Clic sur Restaurer');
                this.resetLegalRules();
            });
        }

        if (validateRulesBtn) {
            validateRulesBtn.addEventListener('click', () => {
                console.log('✅ Clic sur Valider');
                this.validateLegalRules();
            });
        }

        console.log('✅ Event listeners pour les règles légales configurés');
    }

    updateLegalRules() {
        const fields = [
            'rule-heures-jour', 'rule-heures-semaine', 'rule-max-jour', 
            'rule-max-semaine', 'rule-heures-sup', 'rule-conges', 'rule-repos'
        ];

        fields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                const ruleKey = fieldId.replace('rule-', '').replace('-', '');
                const value = parseFloat(field.value) || 0;
                this.legalRules[ruleKey] = value;
            }
        });

        this.calculateDerivedRules();
    }

    saveLegalRules() {
        localStorage.setItem('gestPrevLegalRules', JSON.stringify(this.legalRules));
        this.showNotification('Configuration 39h sauvegardée avec succès !', 'success');
    }

    resetLegalRules() {
        this.legalRules = {
            heuresJour: 7.8,
            heuresSemaine: 39,
            heuresMois: 169,
            heuresAn: 1787,
            maxJour: 10,
            maxSemaine: 48,
            heuresSupplementaires: 220,
            congesPayes: 25,
            joursFeries: 11,
            reposHebdo: 24,
            pauses: {
                moins6h: 0,
                plus6h: 20,
                plus9h: 30
            }
        };
        
        this.updateLegalRulesFields();
        localStorage.removeItem('gestPrevLegalRules');
        this.showNotification('Configuration 39h restaurée avec succès !', 'info');
    }

    validateLegalRules() {
        const errors = [];
        const warnings = [];

        // Vérifications de cohérence
        if (this.legalRules.heuresJour > this.legalRules.maxJour) {
            errors.push('Heures/jour ne peut pas dépasser le maximum/jour');
        }

        if (this.legalRules.heuresSemaine > this.legalRules.maxSemaine) {
            errors.push('Heures/semaine ne peut pas dépasser le maximum/semaine');
        }

        if (this.legalRules.heuresJour * 5 > this.legalRules.heuresSemaine) {
            warnings.push('Heures/jour × 5 jours > Heures/semaine');
        }

        if (this.legalRules.reposHebdo < 24) {
            warnings.push('Repos hebdomadaire minimum 24h consécutives');
        }

        // Afficher les résultats
        if (errors.length > 0) {
            this.showNotification(`Erreurs détectées : ${errors.join(', ')}`,'error');
        } else if (warnings.length > 0) {
            this.showNotification(`Avertissements : ${warnings.join(', ')}`,'warning');
        } else {
            this.showNotification('Configuration 39h validée avec succès !', 'success');
        }
    }

    // ===== SIMULATION ANNUELLE =====
    
    runAnnualSimulation() {
        console.log('🚀 Lancement de la simulation RH...');
        
        const serviceSelect = document.getElementById('simulation-service');
        const viewSelect = document.getElementById('simulation-view');
        const periodeSelect = document.getElementById('simulation-periode');
        
        console.log('🔍 Éléments trouvés:', {
            serviceSelect: !!serviceSelect,
            viewSelect: !!viewSelect,
            periodeSelect: !!periodeSelect
        });
        
        const serviceId = serviceSelect?.value;
        const viewType = viewSelect?.value;
        const periode = parseInt(periodeSelect?.value || 12);
        
        console.log('📊 Paramètres:', { serviceId, viewType, periode });

        if (!serviceId) {
            this.showNotification('Veuillez sélectionner un service', 'error');
            return;
        }

        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            this.showNotification('Service non trouvé', 'error');
            return;
        }
        
        console.log('✅ Service trouvé:', service.name);

        const simulation = this.calculateAnnualSimulation(service, viewType, periode);
        console.log('📈 Simulation calculée:', simulation);
        
        this.displayAnnualTimeline(simulation);
        
        this.showNotification('Simulation RH terminée avec succès !', 'success');
    }

    calculateAnnualSimulation(service, viewType, periode = 12) {
        let employes = [];
        
        // Filtrer les employés selon le type de vue
        switch (viewType) {
            case 'all':
                employes = this.employes.filter(emp => 
                    emp.services.includes(service.id) && emp.statut === 'actif'
                );
                break;
            case 'selected':
                const multiselect = document.querySelector('.custom-multiselect');
                if (multiselect) {
                    const selectedIds = this.getSelectedEmployesFromMultiselect(multiselect);
                    employes = this.employes.filter(emp => 
                        selectedIds.includes(emp.id) && emp.services.includes(service.id) && emp.statut === 'actif'
                    );
                }
                break;
            default:
                employes = this.employes.filter(emp => 
                    emp.services.includes(service.id) && emp.statut === 'actif'
                );
        }

        const simulation = {
            service: service,
            employes: employes,
            periode: periode,
            mois: [],
            statistiques: {
                heuresTotales: 0,
                coutTotal: 0,
                heuresHauteSaison: 0,
                heuresBasseSaison: 0,
                couverture: 0
            }
        };

        // Calculer pour chaque mois de la période
        for (let mois = 1; mois <= periode; mois++) {
            const moisData = this.calculateMonthData(service, employes, mois);
            simulation.mois.push(moisData);
            
            simulation.statistiques.heuresTotales += moisData.heuresTotales;
            simulation.statistiques.coutTotal += moisData.coutTotal;
            simulation.statistiques.heuresHauteSaison += moisData.heuresHauteSaison;
            simulation.statistiques.heuresBasseSaison += moisData.heuresBasseSaison;
        }

        simulation.statistiques.couverture = this.calculateCoverage(simulation);
        
        return simulation;
    }

    calculateMonthData(service, employes, mois) {
        const joursMois = new Date(2024, mois, 0).getDate();
        const heuresOuverture = this.calculateServiceHours(service, mois);
        const isHighSeason = this.isHighSeasonMonth(mois);
        
        const heuresParEmploye = this.legalRules.heuresMois;
        const employesNecessaires = Math.ceil(heuresOuverture / heuresParEmploye);
        
        const employesUtilises = employes.slice(0, employesNecessaires);
        const heuresTotales = employesUtilises.length * heuresParEmploye;
        const coutTotal = employesUtilises.reduce((total, emp) => 
            total + (emp.salaireHoraire * heuresParEmploye), 0);

        return {
            mois: mois,
            jours: joursMois,
            heuresOuverture: heuresOuverture,
            heuresTotales: heuresTotales,
            coutTotal: coutTotal,
            employesUtilises: employesUtilises.length,
            heuresHauteSaison: isHighSeason ? heuresTotales : 0,
            heuresBasseSaison: isHighSeason ? 0 : heuresTotales,
            isHighSeason: isHighSeason
        };
    }

    calculateServiceHours(service, mois) {
        // Calculer les heures d'ouverture du service pour le mois
        let heuresMois = 0;
        
        // Simuler 30 jours par mois pour simplifier
        for (let jour = 1; jour <= 30; jour++) {
            const date = new Date(2024, mois - 1, jour);
            const jourSemaine = date.getDay(); // 0 = Dimanche, 1 = Lundi, etc.
            const jourNom = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'][jourSemaine];
            
            const horairesJour = service.horairesParJour[jourNom];
            if (horairesJour && !horairesJour.fermeHaute && !horairesJour.fermeBasse) {
                const isHighSeason = this.isHighSeasonMonth(mois);
                const horaires = isHighSeason ? horairesJour.haute : horairesJour.basse;
                
                if (horaires) {
                    const debut = this.parseTime(horaires.ouverture);
                    const fin = this.parseTime(horaires.fermeture);
                    const heuresJour = (fin - debut) / 60;
                    heuresMois += heuresJour;
                }
            }
        }
        
        return heuresMois;
    }

    isHighSeasonMonth(mois) {
        // Déterminer si le mois est en haute saison
        const highSeasonMonths = [7, 8]; // Juillet-Août (été)
        
        // Mois avec vacances scolaires (Zone A Guyane) - CONSIDÉRÉS COMME HAUTE SAISON
        const vacationMonths = [10, 11, 12, 1, 2, 4]; // Toussaint, Noël, Carnaval, Pâques
        
        // Tous les mois de vacances sont haute saison
        return highSeasonMonths.includes(mois) || vacationMonths.includes(mois);
    }

    calculateCoverage(simulation) {
        const heuresNecessaires = simulation.statistiques.heuresTotales;
        const heuresDisponibles = simulation.employes.length * this.legalRules.heuresAn;
        
        return Math.min(100, Math.round((heuresDisponibles / heuresNecessaires) * 100));
    }

    displayAnnualTimeline(simulation) {
        console.log('📊 Affichage de la timeline annuelle...');
        
        const resultsContainer = document.getElementById('annual-simulation-results');
        console.log('📦 Container résultats trouvé:', !!resultsContainer);
        
        if (!resultsContainer) {
            console.log('❌ Container résultats non trouvé');
            return;
        }

        const moisLabels = [
            'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
            'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
        ];

        // Calculs de masse salariale
        const tauxCharges = parseFloat(document.getElementById('simulation-taux-charges')?.value || 25);
        const masseSalarialeBrute = simulation.statistiques.coutTotal;
        const chargesSociales = masseSalarialeBrute * (tauxCharges / 100);
        const masseSalarialeTotale = masseSalarialeBrute + chargesSociales;
        
        // Analyses RH
        const coutMoyenParEmploye = simulation.employes.length > 0 ? masseSalarialeTotale / simulation.employes.length : 0;
        const heuresMoyennesParEmploye = simulation.employes.length > 0 ? simulation.statistiques.heuresTotales / simulation.employes.length : 0;
        const coutHoraireMoyen = simulation.statistiques.heuresTotales > 0 ? masseSalarialeTotale / simulation.statistiques.heuresTotales : 0;

        const periodeLabels = {
            1: '1 mois',
            3: '3 mois (trimestre)',
            6: '6 mois (semestre)',
            12: '12 mois (année)'
        };

        resultsContainer.innerHTML = `
            <div class="rh-analysis">
                <div class="analysis-header">
                    <h4><i class="fas fa-users"></i> Analyse RH - ${simulation.service.name}</h4>
                    <div class="analysis-summary">
                        <div class="summary-item">
                            <span class="summary-label">Période</span>
                            <span class="summary-value">${periodeLabels[simulation.periode]}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Employés</span>
                            <span class="summary-value">${simulation.employes.length}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Masse salariale</span>
                            <span class="summary-value">${masseSalarialeTotale.toLocaleString()}€</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Couverture</span>
                            <span class="summary-value">${simulation.statistiques.couverture}%</span>
                        </div>
                    </div>
                </div>

                <div class="rh-grid">
                    <div class="rh-card workforce">
                        <div class="card-header">
                            <i class="fas fa-users"></i>
                            <h5>Effectifs</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${simulation.employes.length}</div>
                            <div class="card-detail">employés actifs</div>
                        </div>
                    </div>

                    <div class="rh-card salary">
                        <div class="card-header">
                            <i class="fas fa-euro-sign"></i>
                            <h5>Masse salariale</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${masseSalarialeTotale.toLocaleString()}€</div>
                            <div class="card-breakdown">
                                <span>Salaire: ${masseSalarialeBrute.toLocaleString()}€</span>
                                <span>Charges: ${chargesSociales.toLocaleString()}€</span>
                            </div>
                        </div>
                    </div>

                    <div class="rh-card hours">
                        <div class="card-header">
                            <i class="fas fa-clock"></i>
                            <h5>Heures totales</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${simulation.statistiques.heuresTotales.toLocaleString()}h</div>
                            <div class="card-detail">${heuresMoyennesParEmploye.toFixed(0)}h/employé</div>
                        </div>
                    </div>

                    <div class="rh-card cost">
                        <div class="card-header">
                            <i class="fas fa-calculator"></i>
                            <h5>Coût horaire</h5>
                        </div>
                        <div class="card-content">
                            <div class="card-value">${coutHoraireMoyen.toFixed(2)}€/h</div>
                            <div class="card-detail">Coût moyen par heure</div>
                        </div>
                    </div>
                </div>

                <div class="rh-details">
                    <div class="detail-section">
                        <h6><i class="fas fa-chart-bar"></i> Répartition par saison</h6>
                        <div class="season-breakdown">
                            <div class="season-item">
                                <span class="season-label">Haute saison</span>
                                <span class="season-value">${simulation.statistiques.heuresHauteSaison.toLocaleString()}h (${((simulation.statistiques.heuresHauteSaison / simulation.statistiques.heuresTotales) * 100).toFixed(1)}%)</span>
                            </div>
                            <div class="season-item">
                                <span class="season-label">Basse saison</span>
                                <span class="season-value">${simulation.statistiques.heuresBasseSaison.toLocaleString()}h (${((simulation.statistiques.heuresBasseSaison / simulation.statistiques.heuresTotales) * 100).toFixed(1)}%)</span>
                            </div>
                        </div>
                    </div>

                    <div class="detail-section">
                        <h6><i class="fas fa-calendar-alt"></i> Timeline ${periodeLabels[simulation.periode]}</h6>
                        
                        ${simulation.periode === 12 ? `
                            <!-- Timeline Semestre 1 (Janvier-Juin) -->
                            <div class="timeline-semester">
                                <h6 class="semester-title">Semestre 1 : Janvier - Juin</h6>
                                <div class="timeline-annual-grid" style="grid-template-columns: 200px repeat(6, 1fr);">
                                    <div class="timeline-annual-cell header">Employés</div>
                                    ${moisLabels.slice(0, 6).map(mois => `
                                        <div class="timeline-annual-cell header">${mois}</div>
                                    `).join('')}
                                    
                                    ${simulation.employes.map(employe => `
                                        <div class="timeline-annual-cell employe">${employe.prenom} ${employe.nom}</div>
                                        ${simulation.mois.slice(0, 6).map(moisData => {
                                            const heuresEmploye = this.legalRules.heuresMois;
                                            const isOvertime = heuresEmploye > this.legalRules.heuresMois;
                                            const isUnderutilized = heuresEmploye < this.legalRules.heuresMois * 0.8;
                                            
                                            let cellClass = 'timeline-annual-cell hours';
                                            if (moisData.isHighSeason) cellClass += ' high-season';
                                            else cellClass += ' low-season';
                                            if (isOvertime) cellClass += ' overtime';
                                            if (isUnderutilized) cellClass += ' underutilized';
                                            
                                            return `
                                                <div class="${cellClass}">
                                                    ${heuresEmploye}h
                                                    ${this.calculateBreakTime(heuresEmploye)}
                                                </div>
                                            `;
                                        }).join('')}
                                    `).join('')}
                                </div>
                            </div>

                            <!-- Timeline Semestre 2 (Juillet-Décembre) -->
                            <div class="timeline-semester">
                                <h6 class="semester-title">Semestre 2 : Juillet - Décembre</h6>
                                <div class="timeline-annual-grid" style="grid-template-columns: 200px repeat(6, 1fr);">
                                    <div class="timeline-annual-cell header">Employés</div>
                                    ${moisLabels.slice(6, 12).map(mois => `
                                        <div class="timeline-annual-cell header">${mois}</div>
                                    `).join('')}
                                    
                                    ${simulation.employes.map(employe => `
                                        <div class="timeline-annual-cell employe">${employe.prenom} ${employe.nom}</div>
                                        ${simulation.mois.slice(6, 12).map(moisData => {
                                            const heuresEmploye = this.legalRules.heuresMois;
                                            const isOvertime = heuresEmploye > this.legalRules.heuresMois;
                                            const isUnderutilized = heuresEmploye < this.legalRules.heuresMois * 0.8;
                                            
                                            let cellClass = 'timeline-annual-cell hours';
                                            if (moisData.isHighSeason) cellClass += ' high-season';
                                            else cellClass += ' low-season';
                                            if (isOvertime) cellClass += ' overtime';
                                            if (isUnderutilized) cellClass += ' underutilized';
                                            
                                            return `
                                                <div class="${cellClass}">
                                                    ${heuresEmploye}h
                                                    ${this.calculateBreakTime(heuresEmploye)}
                                                </div>
                                            `;
                                        }).join('')}
                                    `).join('')}
                                </div>
                            </div>
                        ` : `
                            <!-- Timeline unique pour les autres périodes -->
                            <div class="timeline-annual-grid" style="grid-template-columns: 200px repeat(${simulation.periode}, 1fr);">
                                <div class="timeline-annual-cell header">Employés</div>
                                ${moisLabels.slice(0, simulation.periode).map(mois => `
                                    <div class="timeline-annual-cell header">${mois}</div>
                                `).join('')}
                                
                                ${simulation.employes.map(employe => `
                                    <div class="timeline-annual-cell employe">${employe.prenom} ${employe.nom}</div>
                                    ${simulation.mois.slice(0, simulation.periode).map(moisData => {
                                        const heuresEmploye = this.legalRules.heuresMois;
                                        const isOvertime = heuresEmploye > this.legalRules.heuresMois;
                                        const isUnderutilized = heuresEmploye < this.legalRules.heuresMois * 0.8;
                                        
                                        let cellClass = 'timeline-annual-cell hours';
                                        if (moisData.isHighSeason) cellClass += ' high-season';
                                        else cellClass += ' low-season';
                                        if (isOvertime) cellClass += ' overtime';
                                        if (isUnderutilized) cellClass += ' underutilized';
                                        
                                        return `
                                            <div class="${cellClass}">
                                                ${heuresEmploye}h
                                                ${this.calculateBreakTime(heuresEmploye)}
                                            </div>
                                        `;
                                    }).join('')}
                                `).join('')}
                            </div>
                        `}
                    </div>
                </div>

                <div class="rh-alerts">
                    <h6><i class="fas fa-exclamation-triangle"></i> Alertes RH</h6>
                    <div class="alerts-container">
                        ${this.generateRHAlertes(simulation, masseSalarialeTotale, coutHoraireMoyen).map(alerte => `
                            <div class="alert-item ${alerte.type}">
                                <i class="fas ${alerte.icon}"></i>
                                <span>${alerte.message}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }

    calculateBreakTime(heures) {
        if (heures <= 6) return '';
        if (heures <= 9) return '<br><small>Pause 20min</small>';
        return '<br><small>Pause 30min</small>';
    }

    // ===== EVENT LISTENERS POUR LA SIMULATION ANNUELLE =====
    
    setupAnnualSimulationEventListeners() {
        console.log('🔧 Configuration des event listeners simulation annuelle...');
        
        const runAnnualSimulationBtn = document.getElementById('run-annual-simulation');
        console.log('🎯 Bouton simulation annuelle trouvé:', !!runAnnualSimulationBtn);
        
        if (runAnnualSimulationBtn) {
            runAnnualSimulationBtn.addEventListener('click', () => {
                console.log('🖱️ Clic sur bouton simulation annuelle');
                this.runAnnualSimulation();
            });
        }

        // Mise à jour du sélecteur de service
        const simulationServiceSelect = document.getElementById('simulation-service');
        console.log('📋 Sélecteur service simulation trouvé:', !!simulationServiceSelect);
        
        if (simulationServiceSelect) {
            simulationServiceSelect.addEventListener('change', () => {
                console.log('🔄 Changement sélecteur service simulation');
                this.updateSimulationServiceSelect();
            });
        }
        
        console.log('✅ Event listeners simulation annuelle configurés');
    }

    updateSimulationServiceSelect() {
        this.updateServiceSelect('simulation-service');
    }

    // ===== GESTION DES TYPES DE SIMULATION =====
    
    setupSimulationTypeEventListeners() {
        // Event listeners pour les boutons de déroulement des simulations
        document.addEventListener('click', (e) => {
            if (e.target.closest('.simulation-toggle')) {
                const toggleBtn = e.target.closest('.simulation-toggle');
                const simulationCard = toggleBtn.closest('.simulation-type-card');
                
                if (simulationCard) {
                    this.toggleSimulationType(simulationCard);
                }
            }
        });
    }

    toggleSimulationType(simulationCard) {
        const content = simulationCard.querySelector('.simulation-type-content');
        const toggleBtn = simulationCard.querySelector('.simulation-toggle');
        const icon = toggleBtn.querySelector('i');
        
        // Fermer toutes les autres cartes
        document.querySelectorAll('.simulation-type-card').forEach(card => {
            if (card !== simulationCard) {
                card.classList.remove('active');
                const otherContent = card.querySelector('.simulation-type-content');
                const otherBtn = card.querySelector('.simulation-toggle');
                const otherIcon = otherBtn.querySelector('i');
                
                otherContent.style.display = 'none';
                otherBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ouvrir';
            }
        });
        
        // Toggle la carte actuelle
        if (simulationCard.classList.contains('active')) {
            simulationCard.classList.remove('active');
            content.style.display = 'none';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-down"></i> Ouvrir';
        } else {
            simulationCard.classList.add('active');
            content.style.display = 'block';
            toggleBtn.innerHTML = '<i class="fas fa-chevron-up"></i> Fermer';
            
            // Mettre à jour les sélecteurs de services
            this.updateAllSimulationServiceSelects();
        }
    }

    updateAllSimulationServiceSelects() {
        // Mettre à jour tous les sélecteurs de services dans les simulations
        const serviceSelects = [
            'simulation-service',
            'planning-service',
            'employe-services'
        ];
        
        serviceSelects.forEach(selectId => {
            this.updateServiceSelect(selectId);
        });
        
        // Mettre à jour le sélecteur d'employés
        this.updateSimulationEmployesSelect();
    }

    updateServiceSelect(selectId) {
        const select = document.getElementById(selectId);
        if (!select) return;

        // Sauvegarder la valeur sélectionnée
        const currentValue = select.value;
        
        // Vider et remplir le sélecteur
        select.innerHTML = '<option value="">Sélectionner un service...</option>';
        
        this.services.forEach(service => {
            const option = document.createElement('option');
            option.value = service.id;
            option.textContent = service.name;
            select.appendChild(option);
        });
        
        // Restaurer la valeur sélectionnée si elle existe encore
        if (currentValue && this.services.find(s => s.id === currentValue)) {
            select.value = currentValue;
        }
    }

    // ===== SYSTÈME D'EXPORT GLOBAL =====
    
    setupExportEventListeners() {
        // Gestionnaire pour le bouton de synchronisation
        const syncBtn = document.getElementById('sync-btn');
        if (syncBtn) {
            syncBtn.addEventListener('click', () => {
                this.forceDataSync();
            });
        }
        
        const exportBtn = document.getElementById('export-btn');
        const exportDropdown = document.querySelector('.export-dropdown');
        
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.toggleExportDropdown();
            });
        }
        
        // Event listeners pour les options d'export
        document.addEventListener('click', (e) => {
            if (e.target.closest('.export-option')) {
                const option = e.target.closest('.export-option');
                const format = option.dataset.format;
                this.exportData(format);
            }
        });
        
        // Fermer le dropdown en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.export-controls')) {
                this.closeExportDropdown();
            }
        });
    }

    setupBackupEventListeners() {
        const backupManagerBtn = document.getElementById('backup-manager-btn');
        
        if (backupManagerBtn) {
            backupManagerBtn.addEventListener('click', () => {
                this.showBackupManager();
            });
        }
    }
    
    toggleExportDropdown() {
        const dropdown = document.querySelector('.export-dropdown');
        if (dropdown) {
            const isVisible = dropdown.style.display !== 'none';
            if (isVisible) {
                this.closeExportDropdown();
            } else {
                this.openExportDropdown();
            }
        }
    }
    
    openExportDropdown() {
        const dropdown = document.querySelector('.export-dropdown');
        if (dropdown) {
            dropdown.style.display = 'block';
        }
    }
    
    closeExportDropdown() {
        const dropdown = document.querySelector('.export-dropdown');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    exportData(format) {
        this.closeExportDropdown();
        
        // Déterminer les données à exporter selon le module actif
        const activeModule = document.querySelector('.module-btn.active');
        const moduleName = activeModule ? activeModule.dataset.module : 'rh';
        
        let data = {};
        let filename = '';
        
        switch (moduleName) {
            case 'rh':
                data = {
                    services: this.services,
                    employes: this.employes,
                    planning: this.planning,
                    legalRules: this.legalRules,
                    vacationPeriods: this.vacationPeriods
                };
                filename = `gest-prev-rh-${new Date().toISOString().split('T')[0]}`;
                break;
            default:
                data = { message: 'Module non implémenté' };
                filename = `gest-prev-${moduleName}-${new Date().toISOString().split('T')[0]}`;
        }
        
        switch (format) {
            case 'excel':
                this.exportToExcel(data, filename);
                break;
            case 'pdf':
                this.exportToPDF(data, filename);
                break;
            case 'word':
                this.exportToWord(data, filename);
                break;
            case 'csv':
                this.exportToCSV(data, filename);
                break;
            case 'json':
                this.exportToJSON(data, filename);
                break;
        }
    }
    
    exportToExcel(data, filename) {
        // Simulation d'export Excel (nécessiterait une librairie comme SheetJS)
        this.showNotification('Export Excel en cours de développement...', 'info');
        console.log('Export Excel:', data);
    }
    
    exportToPDF(data, filename) {
        // Simulation d'export PDF (nécessiterait une librairie comme jsPDF)
        this.showNotification('Export PDF en cours de développement...', 'info');
        console.log('Export PDF:', data);
    }
    
    exportToWord(data, filename) {
        // Simulation d'export Word
        this.showNotification('Export Word en cours de développement...', 'info');
        console.log('Export Word:', data);
    }
    
    exportToCSV(data, filename) {
        // Export CSV simple
        let csvContent = '';
        
        // Services
        if (data.services && data.services.length > 0) {
            csvContent += 'Services\n';
            csvContent += 'Nom,Catégorie,Statut\n';
            data.services.forEach(service => {
                csvContent += `${service.name},${service.category},${service.statut}\n`;
            });
            csvContent += '\n';
        }
        
        // Employés
        if (data.employes && data.employes.length > 0) {
            csvContent += 'Employés\n';
            csvContent += 'Prénom,Nom,Niveau,Salaire horaire,Statut\n';
            data.employes.forEach(employe => {
                csvContent += `${employe.prenom},${employe.nom},${employe.niveau},${employe.salaireHoraire},${employe.statut}\n`;
            });
        }
        
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.csv`;
        link.click();
        
        this.showNotification('Export CSV terminé avec succès !', 'success');
    }
    
    exportToJSON(data, filename) {
        // Export JSON
        const jsonContent = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonContent], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${filename}.json`;
        link.click();
        
        this.showNotification('Export JSON terminé avec succès !', 'success');
    }

    // ===== GESTION DES EMPLOYÉS DANS LA SIMULATION =====
    
    updateSimulationEmployesSelect() {
        const multiselect = document.querySelector('.custom-multiselect');
        if (!multiselect) return;

        // Mettre à jour les options du sélecteur personnalisé
        this.updateMultiselectOptions(multiselect);
    }

    // ===== GESTION DU SÉLECTEUR D'EMPLOYÉS PERSONNALISÉ =====
    
    setupCustomMultiselect() {
        const multiselect = document.querySelector('.custom-multiselect');
        if (!multiselect) return;

        const header = multiselect.querySelector('.multiselect-header');
        const dropdown = multiselect.querySelector('.multiselect-dropdown');
        const searchInput = multiselect.querySelector('.multiselect-search-input');
        const optionsContainer = multiselect.querySelector('.multiselect-options');
        const selectedContainer = multiselect.querySelector('.multiselect-selected');
        const placeholder = multiselect.querySelector('.multiselect-placeholder');
        
        let selectedEmployes = [];

        // Toggle dropdown
        header.addEventListener('click', () => {
            this.toggleMultiselectDropdown(multiselect);
        });

        // Recherche
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filterMultiselectOptions(multiselect, e.target.value);
            });
        }

        // Actions
        const selectAllBtn = multiselect.querySelector('.multiselect-select-all');
        const clearAllBtn = multiselect.querySelector('.multiselect-clear-all');

        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', () => {
                this.selectAllMultiselectOptions(multiselect);
            });
        }

        if (clearAllBtn) {
            clearAllBtn.addEventListener('click', () => {
                this.clearAllMultiselectOptions(multiselect);
            });
        }

        // Fermer en cliquant ailleurs
        document.addEventListener('click', (e) => {
            if (!multiselect.contains(e.target)) {
                this.closeMultiselectDropdown(multiselect);
            }
        });
    }

    toggleMultiselectDropdown(multiselect) {
        const dropdown = multiselect.querySelector('.multiselect-dropdown');
        const header = multiselect.querySelector('.multiselect-header');
        const isOpen = dropdown.style.display !== 'none';

        if (isOpen) {
            this.closeMultiselectDropdown(multiselect);
        } else {
            this.openMultiselectDropdown(multiselect);
        }
    }

    openMultiselectDropdown(multiselect) {
        const dropdown = multiselect.querySelector('.multiselect-dropdown');
        const header = multiselect.querySelector('.multiselect-header');
        const searchInput = multiselect.querySelector('.multiselect-search-input');

        dropdown.style.display = 'block';
        header.classList.add('active');

        // Focus sur la recherche
        if (searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }

        // Mettre à jour les options
        this.updateMultiselectOptions(multiselect);
    }

    closeMultiselectDropdown(multiselect) {
        const dropdown = multiselect.querySelector('.multiselect-dropdown');
        const header = multiselect.querySelector('.multiselect-header');

        dropdown.style.display = 'none';
        header.classList.remove('active');
    }

    updateMultiselectOptions(multiselect) {
        const optionsContainer = multiselect.querySelector('.multiselect-options');
        const selectedContainer = multiselect.querySelector('.multiselect-selected');
        const placeholder = multiselect.querySelector('.multiselect-placeholder');

        // Vider les options
        optionsContainer.innerHTML = '';

        // Ajouter les employés
        this.employes.forEach(employe => {
            const option = document.createElement('div');
            option.className = 'multiselect-option';
            option.dataset.value = employe.id;

            const isSelected = this.isEmployeSelectedInMultiselect(multiselect, employe.id);
            if (isSelected) {
                option.classList.add('selected');
            }

            option.innerHTML = `
                <input type="checkbox" ${isSelected ? 'checked' : ''}>
                <span class="multiselect-option-label">${employe.prenom} ${employe.nom}</span>
                <span class="multiselect-option-role">(${employe.niveau})</span>
            `;

            option.addEventListener('click', () => {
                this.toggleMultiselectOption(multiselect, employe.id);
            });

            optionsContainer.appendChild(option);
        });

        // Mettre à jour l'affichage des sélections
        this.updateMultiselectSelectedDisplay(multiselect);
    }

    toggleMultiselectOption(multiselect, employeId) {
        const option = multiselect.querySelector(`[data-value="${employeId}"]`);
        const checkbox = option.querySelector('input[type="checkbox"]');
        const isSelected = checkbox.checked;

        if (isSelected) {
            this.removeEmployeFromMultiselect(multiselect, employeId);
        } else {
            this.addEmployeToMultiselect(multiselect, employeId);
        }

        this.updateMultiselectSelectedDisplay(multiselect);
    }

    addEmployeToMultiselect(multiselect, employeId) {
        const employe = this.employes.find(e => e.id === employeId);
        if (!employe) return;

        const selectedContainer = multiselect.querySelector('.multiselect-selected');
        const tag = document.createElement('div');
        tag.className = 'multiselect-tag';
        tag.dataset.value = employeId;
        tag.innerHTML = `
            <span>${employe.prenom} ${employe.nom}</span>
            <span class="multiselect-tag-remove" onclick="this.parentElement.remove()">×</span>
        `;

        selectedContainer.appendChild(tag);
    }

    removeEmployeFromMultiselect(multiselect, employeId) {
        const tag = multiselect.querySelector(`.multiselect-tag[data-value="${employeId}"]`);
        if (tag) {
            tag.remove();
        }
    }

    isEmployeSelectedInMultiselect(multiselect, employeId) {
        return multiselect.querySelector(`.multiselect-tag[data-value="${employeId}"]`) !== null;
    }

    updateMultiselectSelectedDisplay(multiselect) {
        const selectedContainer = multiselect.querySelector('.multiselect-selected');
        const placeholder = multiselect.querySelector('.multiselect-placeholder');
        const selectedTags = selectedContainer.querySelectorAll('.multiselect-tag');

        if (selectedTags.length === 0) {
            placeholder.textContent = 'Sélectionner des employés...';
        } else if (selectedTags.length === 1) {
            placeholder.textContent = `${selectedTags.length} employé sélectionné`;
        } else {
            placeholder.textContent = `${selectedTags.length} employés sélectionnés`;
        }
    }

    filterMultiselectOptions(multiselect, searchTerm) {
        const options = multiselect.querySelectorAll('.multiselect-option');
        const searchLower = searchTerm.toLowerCase();

        options.forEach(option => {
            const label = option.querySelector('.multiselect-option-label').textContent.toLowerCase();
            const role = option.querySelector('.multiselect-option-role').textContent.toLowerCase();
            
            if (label.includes(searchLower) || role.includes(searchLower)) {
                option.style.display = 'flex';
            } else {
                option.style.display = 'none';
            }
        });
    }

    selectAllMultiselectOptions(multiselect) {
        const options = multiselect.querySelectorAll('.multiselect-option');
        let count = 0;
        
        options.forEach(option => {
            const employeId = option.dataset.value;
            if (!this.isEmployeSelectedInMultiselect(multiselect, employeId)) {
                this.addEmployeToMultiselect(multiselect, employeId);
                option.classList.add('selected');
                option.querySelector('input[type="checkbox"]').checked = true;
                count++;
            }
        });
        
        this.updateMultiselectSelectedDisplay(multiselect);
        
        if (count > 0) {
            this.showNotification(`${count} employé(s) sélectionné(s) avec succès !`, 'info');
        }
    }

    clearAllMultiselectOptions(multiselect) {
        const selectedContainer = multiselect.querySelector('.multiselect-selected');
        const options = multiselect.querySelectorAll('.multiselect-option');
        const selectedCount = selectedContainer.querySelectorAll('.multiselect-tag').length;
        
        selectedContainer.innerHTML = '';
        options.forEach(option => {
            option.classList.remove('selected');
            option.querySelector('input[type="checkbox"]').checked = false;
        });
        
        this.updateMultiselectSelectedDisplay(multiselect);
        
        if (selectedCount > 0) {
            this.showNotification(`${selectedCount} employé(s) désélectionné(s) avec succès !`, 'info');
        }
    }

    getSelectedEmployesFromMultiselect(multiselect) {
        const tags = multiselect.querySelectorAll('.multiselect-tag');
        return Array.from(tags).map(tag => tag.dataset.value);
    }

    generateRHAlertes(simulation, masseSalarialeTotale, coutHoraireMoyen) {
        const alertes = [];
        
        // Alertes sur les effectifs
        if (simulation.employes.length === 0) {
            alertes.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                message: 'Aucun employé assigné à ce service'
            });
        } else if (simulation.employes.length < 2) {
            alertes.push({
                type: 'info',
                icon: 'fa-info-circle',
                message: 'Effectif réduit - Vérifiez la couverture du service'
            });
        }
        
        // Alertes sur la couverture
        if (simulation.statistiques.couverture < 50) {
            alertes.push({
                type: 'danger',
                icon: 'fa-times-circle',
                message: 'Couverture insuffisante (<50%) - Recrutement nécessaire'
            });
        } else if (simulation.statistiques.couverture > 120) {
            alertes.push({
                type: 'warning',
                icon: 'fa-exclamation-triangle',
                message: 'Sur-effectif détecté (>120%) - Optimisation possible'
            });
        }
        
        // Alertes sur la masse salariale
        if (masseSalarialeTotale > 100000) {
            alertes.push({
                type: 'warning',
                icon: 'fa-euro-sign',
                message: 'Masse salariale élevée - Vérifiez les salaires'
            });
        }
        
        // Alertes sur le coût horaire
        if (coutHoraireMoyen > 50) {
            alertes.push({
                type: 'warning',
                icon: 'fa-calculator',
                message: 'Coût horaire élevé (>50€/h) - Optimisation des coûts'
            });
        }
        
        // Alertes sur les heures
        if (simulation.statistiques.heuresTotales === 0) {
            alertes.push({
                type: 'warning',
                icon: 'fa-clock',
                message: 'Aucune heure de service configurée'
            });
        }
        
        // Alertes positives
        if (simulation.statistiques.couverture >= 80 && simulation.statistiques.couverture <= 100) {
            alertes.push({
                type: 'success',
                icon: 'fa-check-circle',
                message: 'Couverture optimale - Effectif bien dimensionné'
            });
        }
        
        if (coutHoraireMoyen < 30) {
            alertes.push({
                type: 'success',
                icon: 'fa-thumbs-up',
                message: 'Coût horaire maîtrisé - Bonne optimisation'
            });
        }
        
        return alertes;
    }

    // ===== NOUVELLES FONCTIONS POUR LES MODIFICATIONS EMPLOYÉS =====

    // Gestion du sélecteur de type de contrat (35h/39h)
    setupEmployeTypeHeuresHandler() {
        const typeHeuresSelect = document.getElementById('employe-type-heures');
        if (typeHeuresSelect) {
            typeHeuresSelect.addEventListener('change', (e) => {
                this.toggleEmployeHoursConfig(e.target.value);
            });
        }
    }

    // Basculer entre les configurations 35h et 39h
    toggleEmployeHoursConfig(type) {
        const config35h = document.getElementById('config-35h');
        const config39h = document.getElementById('config-39h');
        
        if (type === '35') {
            config35h.style.display = 'block';
            config39h.style.display = 'none';
            this.updateEmployeHoursFromConfig('35');
        } else {
            config35h.style.display = 'none';
            config39h.style.display = 'block';
            this.updateEmployeHoursFromConfig('39');
        }
    }

    // Mettre à jour les heures employé depuis la configuration
    updateEmployeHoursFromConfig(type) {
        if (type === '35') {
            // Récupérer les valeurs de la configuration 35h
            const heuresJour = document.getElementById('rule-heures-jour-35')?.value || 7.0;
            const heuresSemaine = document.getElementById('rule-heures-semaine-35')?.value || 35;
            const heuresAn = document.getElementById('rule-heures-an-35')?.value || 1820;
            const conges = document.getElementById('rule-conges-35')?.value || 25;
            const rtt = document.getElementById('rule-rtt-35')?.value || 0;

            // Mettre à jour les champs employé
            const heuresAnInput = document.getElementById('employe-heures-annuel-35');
            const congesInput = document.getElementById('employe-conges-35');
            const rttInput = document.getElementById('employe-rtt-35');

            if (heuresAnInput) heuresAnInput.value = heuresAn;
            if (congesInput) congesInput.value = conges;
            if (rttInput) rttInput.value = rtt;
        } else {
            // Récupérer les valeurs de la configuration 39h
            const heuresJour = document.getElementById('rule-heures-jour')?.value || 7.8;
            const heuresSemaine = document.getElementById('rule-heures-semaine')?.value || 39;
            const heuresAn = document.getElementById('rule-heures-an')?.value || 2028;
            const conges = document.getElementById('rule-conges')?.value || 25;
            const rtt = document.getElementById('rule-rtt')?.value || 0;

            // Mettre à jour les champs employé
            const heuresAnInput = document.getElementById('employe-heures-annuel-39');
            const congesInput = document.getElementById('employe-conges-39');
            const rttInput = document.getElementById('employe-rtt-39');

            if (heuresAnInput) heuresAnInput.value = heuresAn;
            if (congesInput) congesInput.value = conges;
            if (rttInput) rttInput.value = rtt;
        }
    }

    // Initialiser les règles légales pour 35h
    initializeLegalRules35() {
        // Configuration par défaut pour 35h
        const defaultRules35 = {
            heuresJour: 7.0,
            heuresSemaine: 35,
            heuresMois: 151.67,
            heuresAn: 1820,
            maxJour: 10,
            maxSemaine: 48,
            heuresSup: 220,
            conges: 25,
            repos: 24
        };

        // Charger depuis localStorage ou utiliser les valeurs par défaut
        const savedRules35 = localStorage.getItem('gestPrevLegalRules35');
        const rules35 = savedRules35 ? JSON.parse(savedRules35) : defaultRules35;

        // Mettre à jour les champs
        Object.keys(rules35).forEach(key => {
            const element = document.getElementById(`rule-${key}-35`);
            if (element) {
                element.value = rules35[key];
            }
        });

        // Calculer les valeurs dérivées
        this.calculateDerivedRules35();
    }

    // Calculer les valeurs dérivées pour 35h
    calculateDerivedRules35() {
        const heuresJour = parseFloat(document.getElementById('rule-heures-jour-35')?.value || 7.0);
        const heuresSemaine = parseFloat(document.getElementById('rule-heures-semaine-35')?.value || 35);

        // Calculer heures/mois (35h × 52 semaines ÷ 12 mois)
        const heuresMois = (heuresSemaine * 52) / 12;
        const heuresAn = heuresSemaine * 52;

        // Mettre à jour les champs calculés
        const heuresMoisElement = document.getElementById('rule-heures-mois-35');
        const heuresAnElement = document.getElementById('rule-heures-an-35');

        if (heuresMoisElement) heuresMoisElement.value = heuresMois.toFixed(2);
        if (heuresAnElement) heuresAnElement.value = heuresAn;
    }

    // Sauvegarder les règles légales 35h
    saveLegalRules35() {
        const rules35 = {
            heuresJour: parseFloat(document.getElementById('rule-heures-jour-35')?.value || 7.0),
            heuresSemaine: parseFloat(document.getElementById('rule-heures-semaine-35')?.value || 35),
            heuresMois: parseFloat(document.getElementById('rule-heures-mois-35')?.value || 151.67),
            heuresAn: parseFloat(document.getElementById('rule-heures-an-35')?.value || 1820),
            maxJour: parseInt(document.getElementById('rule-max-jour-35')?.value || 10),
            maxSemaine: parseInt(document.getElementById('rule-max-semaine-35')?.value || 48),
            heuresSup: parseInt(document.getElementById('rule-heures-sup-35')?.value || 220),
            conges: parseInt(document.getElementById('rule-conges-35')?.value || 25),
            repos: parseInt(document.getElementById('rule-repos-35')?.value || 24)
        };

        localStorage.setItem('gestPrevLegalRules35', JSON.stringify(rules35));
        this.showNotification('Configuration 35h sauvegardée avec succès !', 'success');
    }

    // Event listeners pour les règles légales 35h
    setupLegalRules35EventListeners() {
        // Sauvegarder
        const saveBtn35 = document.getElementById('save-rules-35');
        if (saveBtn35) {
            saveBtn35.addEventListener('click', () => {
                this.saveLegalRules35();
            });
        }

        // Restaurer
        const resetBtn35 = document.getElementById('reset-rules-35');
        if (resetBtn35) {
            resetBtn35.addEventListener('click', () => {
                this.resetLegalRules35();
            });
        }

        // Valider
        const validateBtn35 = document.getElementById('validate-rules-35');
        if (validateBtn35) {
            validateBtn35.addEventListener('click', () => {
                this.validateLegalRules35();
            });
        }

        // Calcul automatique lors de la modification des champs
        const calculableFields35 = [
            'rule-heures-jour-35',
            'rule-heures-semaine-35'
        ];

        calculableFields35.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field) {
                field.addEventListener('input', () => {
                    this.calculateDerivedRules35();
                });
            }
        });
    }

    // Restaurer les règles légales 35h
    resetLegalRules35() {
        const defaultRules35 = {
            heuresJour: 7.0,
            heuresSemaine: 35,
            heuresMois: 151.67,
            heuresAn: 1820,
            maxJour: 10,
            maxSemaine: 48,
            heuresSup: 220,
            conges: 25,
            repos: 24
        };

        Object.keys(defaultRules35).forEach(key => {
            const element = document.getElementById(`rule-${key}-35`);
            if (element) {
                element.value = defaultRules35[key];
            }
        });

        this.calculateDerivedRules35();
        this.showNotification('Configuration 35h restaurée avec succès !', 'info');
    }

    // Valider les règles légales 35h
    validateLegalRules35() {
        const heuresJour = parseFloat(document.getElementById('rule-heures-jour-35')?.value || 0);
        const heuresSemaine = parseFloat(document.getElementById('rule-heures-semaine-35')?.value || 0);
        const maxJour = parseInt(document.getElementById('rule-max-jour-35')?.value || 0);
        const maxSemaine = parseInt(document.getElementById('rule-max-semaine-35')?.value || 0);

        const errors = [];

        if (heuresJour <= 0 || heuresJour > 12) {
            errors.push('Heures/jour doit être entre 0 et 12');
        }

        if (heuresSemaine !== 35) {
            errors.push('Heures/semaine doit être exactement 35 pour ce type de contrat');
        }

        if (maxJour < heuresJour) {
            errors.push('Maximum heures/jour doit être supérieur aux heures/jour');
        }

        if (maxSemaine < heuresSemaine) {
            errors.push('Maximum heures/semaine doit être supérieur aux heures/semaine');
        }

        if (errors.length > 0) {
            this.showNotification('Erreurs de validation : ' + errors.join(', '), 'error');
            return false;
        }

        this.showNotification('Configuration 35h validée avec succès !', 'success');
        return true;
    }

    // ===== NOUVELLES FONCTIONS POUR LE PLANNING AMÉLIORÉ =====

    // Initialisation des nouvelles fonctionnalités
    setupEnhancedPlanningHandlers() {
        // Mettre à jour l'analyse quand le service change
        const serviceSelect = document.getElementById('planning-service');
        if (serviceSelect) {
            serviceSelect.addEventListener('change', () => {
                this.updateEmployesAnalysis();
                this.checkEmployesAlerts();
            });
        }
    }

    // Gestion du mode de génération
    setupPlanningModeHandler() {
        const modeInputs = document.querySelectorAll('input[name="planning-mode"]');
        modeInputs.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handlePlanningModeChange(e.target.value);
            });
        });
    }

    handlePlanningModeChange(mode) {
        const semiManualElements = document.querySelectorAll('.semi-manual-only');
        const autoElements = document.querySelectorAll('.auto-only');
        
        if (mode === 'semi-manuel') {
            semiManualElements.forEach(el => el.style.display = 'block');
            autoElements.forEach(el => el.style.display = 'none');
            this.showNotification('Mode semi-manuel activé : Créez 2 semaines de référence', 'info');
        } else {
            semiManualElements.forEach(el => el.style.display = 'none');
            autoElements.forEach(el => el.style.display = 'block');
            this.showNotification('Mode automatique activé : Génération intelligente', 'info');
        }
    }

    // Gestion des filtres d'employés
    setupEmployesFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.handleEmployesFilter(btn.dataset.filter);
            });
        });
    }

    handleEmployesFilter(filter) {
        // Mettre à jour les boutons actifs
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
        
        // Filtrer les employés selon le critère
        this.filterEmployesByCriteria(filter);
    }

    filterEmployesByCriteria(criteria) {
        const employesContainer = document.getElementById('employes-available');
        const employes = this.employes;
        
        let filteredEmployes = employes;
        
        switch(criteria) {
            case 'service':
                const selectedService = document.getElementById('planning-service').value;
                filteredEmployes = employes.filter(emp => 
                    emp.servicesAttribues.includes(selectedService)
                );
                break;
            case 'contract':
                filteredEmployes = employes.filter(emp => 
                    emp.disponibilite?.heuresAnnuelContractuelles === 1820 // 35h
                );
                break;
            case 'level':
                filteredEmployes = employes.filter(emp => 
                    emp.niveau === 'III' || emp.niveau === 'IV' || emp.niveau === 'V'
                );
                break;
            default:
                filteredEmployes = employes;
        }
        
        this.displayFilteredEmployes(filteredEmployes);
    }

    displayFilteredEmployes(employes) {
        const container = document.getElementById('employes-available');
        container.innerHTML = '';
        
        employes.forEach(employe => {
            const employeElement = this.createEmployeElement(employe);
            container.appendChild(employeElement);
        });
    }

    createEmployeElement(employe) {
        const div = document.createElement('div');
        div.className = 'employe-item';
        div.dataset.employeId = employe.id;
        
        const contractType = employe.disponibilite?.heuresAnnuelContractuelles === 1820 ? '35h' : '39h';
        
        div.innerHTML = `
            <div class="employe-info">
                <div class="employe-name">${employe.prenom} ${employe.nom}</div>
                <div class="employe-details">
                    ${contractType} - Niveau ${employe.niveau} - ${employe.typeContrat}
                </div>
            </div>
            <div class="employe-actions">
                <button class="employe-btn add" onclick="gestPrev.addEmployeToSelection('${employe.id}')">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        return div;
    }

    // Gestion de la sélection d'employés
    addEmployeToSelection(employeId) {
        const employe = this.employes.find(e => e.id === employeId);
        if (!employe) return;
        
        // Ajouter à la liste des sélectionnés
        this.addToSelectedEmployes(employe);
        
        // Mettre à jour les statistiques
        this.updateEmployesAnalysis();
        
        // Vérifier les alertes
        this.checkEmployesAlerts();
        
        this.showNotification(`${employe.prenom} ${employe.nom} ajouté à la sélection`, 'success');
    }

    addToSelectedEmployes(employe) {
        const container = document.getElementById('employes-selected');
        
        const div = document.createElement('div');
        div.className = 'employe-item selected';
        div.dataset.employeId = employe.id;
        
        const contractType = employe.disponibilite?.heuresAnnuelContractuelles === 1820 ? '35h' : '39h';
        
        div.innerHTML = `
            <div class="employe-info">
                <div class="employe-name">${employe.prenom} ${employe.nom}</div>
                <div class="employe-details">
                    ${contractType} - Niveau ${employe.niveau}
                </div>
            </div>
            <div class="employe-actions">
                <button class="employe-btn remove" onclick="gestPrev.removeEmployeFromSelection('${employe.id}')">
                    <i class="fas fa-minus"></i>
                </button>
            </div>
        `;
        
        container.appendChild(div);
    }

    removeEmployeFromSelection(employeId) {
        const employe = this.employes.find(e => e.id === employeId);
        if (!employe) return;
        
        // Supprimer de la liste des sélectionnés
        const selectedElement = document.querySelector(`[data-employe-id="${employeId}"].selected`);
        if (selectedElement) {
            selectedElement.remove();
        }
        
        // Mettre à jour les statistiques
        this.updateEmployesAnalysis();
        
        // Vérifier les alertes
        this.checkEmployesAlerts();
        
        this.showNotification(`${employe.prenom} ${employe.nom} retiré de la sélection`, 'info');
    }

    // Analyse en temps réel
    updateEmployesAnalysis() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        
        if (!service) return;
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        // Calculer les statistiques
        const totalHours = this.calculateTotalHours(serviceData);
        const selectedHours = this.calculateSelectedHours(selectedEmployes);
        const recommendedCount = this.calculateRecommendedCount(totalHours);
        const estimatedCost = this.calculateEstimatedCost(selectedEmployes);
        
        // Calculer le pourcentage de couverture
        const coveragePercentage = totalHours > 0 ? Math.round((selectedHours / totalHours) * 100) : 0;
        
        // Mettre à jour l'affichage
        document.getElementById('selected-count').textContent = selectedEmployes.length;
        document.getElementById('recommended-count').textContent = recommendedCount;
        document.getElementById('hours-to-cover').textContent = `${totalHours}h`;
        document.getElementById('estimated-cost').textContent = `${estimatedCost.toLocaleString()}€`;
        
        // Afficher le pourcentage de couverture
        const coverageElement = document.getElementById('coverage-percentage');
        if (coverageElement) {
            coverageElement.textContent = `${coveragePercentage}%`;
            coverageElement.className = `coverage-percentage ${this.getCoverageClass(coveragePercentage)}`;
        }
        
        // Mettre à jour les alertes avec analyse poussée
        this.checkEmployesAlerts();
    }

    getCoverageClass(percentage) {
        if (percentage < 80) return 'coverage-low';
        if (percentage <= 100) return 'coverage-good';
        if (percentage <= 120) return 'coverage-high';
        return 'coverage-excessive';
    }

    checkEmployesAlerts() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        
        if (!service) return;
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        const alerts = [];
        
        // Calculs de base
        const totalHours = this.calculateTotalHoursBySaison(serviceData, saison);
        const selectedHours = this.calculateSelectedHours(selectedEmployes);
        const recommendedCount = this.calculateRecommendedCount(totalHours);
        const coveragePercentage = totalHours > 0 ? Math.round((selectedHours / totalHours) * 100) : 0;
        
        // === ANALYSE PUSSÉE DE LA COUVERTURE ===
        
        // 1. Couverture insuffisante (< 80%)
        if (coveragePercentage < 80) {
            const manqueHeures = Math.round(totalHours - selectedHours);
            const manqueEmployes = Math.ceil(manqueHeures / 160); // 160h/mois par employé
            
            alerts.push({
                type: 'danger',
                message: `Couverture critique : ${coveragePercentage}% (${selectedHours}h/${totalHours}h)`,
                details: `Il manque ${manqueHeures}h (${manqueEmployes} employé(s) supplémentaire(s) recommandé(s))`,
                icon: 'fas fa-exclamation-triangle',
                priority: 'haute',
                action: 'Ajouter des employés'
            });
        }
        
        // 2. Couverture excessive (> 120%)
        else if (coveragePercentage > 120) {
            const surplusHeures = Math.round(selectedHours - totalHours);
            const surplusEmployes = Math.ceil(surplusHeures / 160);
            const coutSurplus = Math.round(surplusHeures * 15); // 15€/h estimé
            
            alerts.push({
                type: 'warning',
                message: `Sur-couverture détectée : ${coveragePercentage}% (${selectedHours}h/${totalHours}h)`,
                details: `${surplusHeures}h en surplus (${surplusEmployes} employé(s) en trop) - Coût estimé : ${coutSurplus.toLocaleString()}€/mois`,
                icon: 'fas fa-chart-line',
                priority: 'moyenne',
                action: 'Réduire l\'effectif'
            });
        }
        
        // 3. Couverture optimale (80-100%)
        else if (coveragePercentage >= 80 && coveragePercentage <= 100) {
            alerts.push({
                type: 'success',
                message: `Couverture optimale : ${coveragePercentage}%`,
                details: `Excellent équilibre entre besoins et ressources`,
                icon: 'fas fa-check-circle',
                priority: 'basse',
                action: 'Maintenir'
            });
        }
        
        // 4. Couverture légèrement élevée (100-120%)
        else if (coveragePercentage > 100 && coveragePercentage <= 120) {
            const surplusHeures = Math.round(selectedHours - totalHours);
            alerts.push({
                type: 'info',
                message: `Couverture élevée : ${coveragePercentage}%`,
                details: `${surplusHeures}h de marge de sécurité`,
                icon: 'fas fa-info-circle',
                priority: 'basse',
                action: 'Surveiller'
            });
        }
        
        // === ANALYSE DE L'EFFECTIF ===
        
        // 5. Effectif insuffisant
        if (selectedEmployes.length < recommendedCount) {
            const manque = recommendedCount - selectedEmployes.length;
            alerts.push({
                type: 'danger',
                message: `Effectif insuffisant : ${selectedEmployes.length}/${recommendedCount} employés`,
                details: `Il manque ${manque} employé(s) pour couvrir les besoins`,
                icon: 'fas fa-users',
                priority: 'haute',
                action: 'Recruter'
            });
        }
        
        // 6. Sur-effectif
        else if (selectedEmployes.length > recommendedCount + 2) {
            const surplus = selectedEmployes.length - recommendedCount;
            const coutSurplus = Math.round(surplus * 2500); // 2500€/mois par employé
            
            alerts.push({
                type: 'warning',
                message: `Sur-effectif : ${selectedEmployes.length} employés pour ${recommendedCount} nécessaires`,
                details: `${surplus} employé(s) en trop - Coût estimé : ${coutSurplus.toLocaleString()}€/mois`,
                icon: 'fas fa-user-minus',
                priority: 'moyenne',
                action: 'Réduire l\'effectif'
            });
        }
        
        // === ANALYSE DES COMPÉTENCES ===
        
        // 7. Répartition des niveaux
        const niveaux = this.analyzeNiveaux(selectedEmployes);
        if (niveaux.senior < 1 && selectedEmployes.length > 2) {
            alerts.push({
                type: 'warning',
                message: 'Manque de seniors',
                details: 'Aucun employé senior (niveau IV-V) - Risque de supervision',
                icon: 'fas fa-user-tie',
                priority: 'moyenne',
                action: 'Ajouter un senior'
            });
        }
        
        // 8. Répartition des contrats
        const contrats = this.analyzeContrats(selectedEmployes);
        if (contrats['35h'] === 0 && contrats['39h'] > 0) {
            alerts.push({
                type: 'info',
                message: 'Flexibilité limitée',
                details: 'Aucun employé 35h - Flexibilité réduite pour les pics d\'activité',
                icon: 'fas fa-clock',
                priority: 'basse',
                action: 'Diversifier les contrats'
            });
        }
        
        // === ANALYSE ÉCONOMIQUE ===
        
        // 9. Coût par heure
        const coutParHeure = totalHours > 0 ? Math.round(estimatedCost / totalHours) : 0;
        if (coutParHeure > 25) {
            alerts.push({
                type: 'warning',
                message: `Coût élevé : ${coutParHeure}€/h`,
                details: `Coût horaire au-dessus de la moyenne (25€/h)`,
                icon: 'fas fa-euro-sign',
                priority: 'moyenne',
                action: 'Optimiser les coûts'
            });
        }
        
        // Afficher les alertes
        this.displayEmployesAlerts(alerts);
        
        // Gérer les suggestions d'auto-complétion
        if (selectedEmployes.length < recommendedCount) {
            this.showAutoCompletionSuggestions(recommendedCount - selectedEmployes.length);
        } else {
            this.hideAutoCompletionSuggestions();
        }
    }

    analyzeNiveaux(employes) {
        const niveaux = { 'I': 0, 'II': 0, 'III': 0, 'IV': 0, 'V': 0, 'senior': 0 };
        
        employes.forEach(employe => {
            const niveau = employe.niveau;
            if (niveaux.hasOwnProperty(niveau)) {
                niveaux[niveau]++;
            }
            if (niveau === 'IV' || niveau === 'V') {
                niveaux.senior++;
            }
        });
        
        return niveaux;
    }

    analyzeContrats(employes) {
        const contrats = { '35h': 0, '39h': 0 };
        
        employes.forEach(employe => {
            const heures = employe.disponibilite?.heuresAnnuelContractuelles || 2028;
            if (heures === 1820) {
                contrats['35h']++;
            } else {
                contrats['39h']++;
            }
        });
        
        return contrats;
    }

    calculateTotalHours(service) {
        let totalHours = 0;
        const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        
        joursSemaine.forEach(jour => {
            const horaires = service.horairesParJour[jour];
            if (horaires && horaires[saison] && horaires[saison].ouverture && horaires[saison].fermeture) {
                const debut = this.parseTime(horaires[saison].ouverture);
                const fin = this.parseTime(horaires[saison].fermeture);
                
                if (debut !== null && fin !== null) {
                    let duree = (fin - debut) / 60; // Convertir en heures
                    
                    // Gérer le cas où la fermeture est le lendemain (ex: 23h00 à 02h00)
                    if (duree < 0) {
                        duree += 24;
                    }
                    
                    totalHours += duree;
                }
            }
        });
        
        // Retourner les heures par semaine (pas par an)
        return Math.round(totalHours);
    }

    calculateSelectedHours(employes) {
        return employes.reduce((total, emp) => {
            // Utiliser les heures hebdomadaires contractuelles de l'employé
            const heuresHebdo = emp.disponibilite?.heuresSemaineContractuelles || 35;
            return total + heuresHebdo;
        }, 0);
    }

    calculateRecommendedCount(totalHours) {
        const heuresParEmploye = 35; // Base sur 35h
        return Math.ceil(totalHours / heuresParEmploye) + 1; // +1 pour les remplacements
    }

    calculateEstimatedCost(employes) {
        return employes.reduce((total, emp) => {
            const tauxHoraire = emp.tauxHoraireBrut || 15;
            const heuresHebdo = emp.disponibilite?.heuresSemaineContractuelles || 35;
            // Calculer le coût hebdomadaire puis multiplier par 52 semaines
            return total + (tauxHoraire * heuresHebdo * 52 * 1.45); // Avec charges
        }, 0);
    }

    getSelectedEmployes() {
        // Récupérer les employés sélectionnés via les checkboxes
        const selectedCheckboxes = document.querySelectorAll('.employe-checkbox:checked');
        return Array.from(selectedCheckboxes).map(checkbox => {
            const employeId = checkbox.dataset.employeId;
            return this.employes.find(e => e.id === employeId);
        }).filter(Boolean);
    }

    clearAllEmployeSelections() {
        // Décocher toutes les checkboxes
        const checkboxes = document.querySelectorAll('.employe-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Vider la liste des sélectionnés
        const selectedList = document.querySelector('.selected-employes-list');
        if (selectedList) {
            selectedList.innerHTML = '';
        }
        
        // Mettre à jour les statistiques
        this.updateEmployesAnalysis();
        
        this.showNotification('Sélection des employés réinitialisée', 'info');
    }

    // Gestion des alertes
    displayEmployesAlerts(alerts) {
        const container = document.getElementById('employes-alerts');
        if (!container) {
            console.log('❌ Container employes-alerts non trouvé');
            return;
        }
        
        if (alerts.length === 0) {
            container.innerHTML = '<p class="no-alerts">Aucune alerte - Configuration optimale</p>';
            return;
        }
        
        // Trier les alertes par priorité
        const priorityOrder = { 'haute': 1, 'moyenne': 2, 'basse': 3 };
        alerts.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
        
        let html = '<h6><i class="fas fa-exclamation-triangle"></i> Alertes et recommandations</h6>';
        html += '<div class="alerts-list">';
        
        alerts.forEach(alert => {
            html += `
                <div class="alert-item ${alert.type} ${alert.priority}" data-alert-type="${alert.type}">
                    <div class="alert-header">
                        <div class="alert-icon">
                            <i class="${alert.icon}"></i>
                        </div>
                        <div class="alert-content">
                            <div class="alert-title">${alert.message}</div>
                            ${alert.details ? `<div class="alert-details">${alert.details}</div>` : ''}
                        </div>
                        <div class="alert-priority ${alert.priority}">
                            ${alert.priority.toUpperCase()}
                        </div>
                    </div>
                    <div class="alert-actions">
                        <button class="btn btn-sm btn-primary" onclick="gestPrev.handleAlertAction('${alert.action}')">
                            ${alert.action}
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }

    // Suggestions d'auto-complétion
    showAutoCompletionSuggestions(count) {
        const container = document.getElementById('auto-completion-suggestions');
        const suggestionsList = document.getElementById('suggestions-list');
        
        // Trouver les employés non sélectionnés
        const selectedIds = this.getSelectedEmployes().map(e => e.id);
        const availableEmployes = this.employes.filter(e => !selectedIds.includes(e.id));
        
        // Trier par pertinence (niveau, type de contrat, etc.)
        const suggestions = this.rankEmployesByRelevance(availableEmployes, count);
        
        suggestionsList.innerHTML = '';
        suggestions.forEach(employe => {
            const suggestionElement = document.createElement('div');
            suggestionElement.className = 'suggestion-item';
            suggestionElement.onclick = () => this.addEmployeToSelection(employe.id);
            
            const contractType = employe.disponibilite?.heuresAnnuelContractuelles === 1820 ? '35h' : '39h';
            
            suggestionElement.innerHTML = `
                <i class="fas fa-user-plus"></i>
                <span>${employe.prenom} ${employe.nom} (${contractType} - Niveau ${employe.niveau})</span>
            `;
            
            suggestionsList.appendChild(suggestionElement);
        });
        
        container.style.display = 'block';
    }

    hideAutoCompletionSuggestions() {
        document.getElementById('auto-completion-suggestions').style.display = 'none';
    }

    rankEmployesByRelevance(employes, count) {
        // Algorithme de classement par pertinence
        return employes
            .sort((a, b) => {
                // Priorité 1 : Niveau (plus élevé = mieux)
                const niveauA = parseInt(a.niveau.replace(/\D/g, ''));
                const niveauB = parseInt(b.niveau.replace(/\D/g, ''));
                if (niveauA !== niveauB) return niveauB - niveauA;
                
                // Priorité 2 : Type de contrat (35h préféré)
                const contractA = a.disponibilite?.heuresAnnuelContractuelles === 1820 ? 1 : 0;
                const contractB = b.disponibilite?.heuresAnnuelContractuelles === 1820 ? 1 : 0;
                if (contractA !== contractB) return contractB - contractA;
                
                // Priorité 3 : Nom alphabétique
                return a.nom.localeCompare(b.nom);
            })
            .slice(0, count);
    }

    // Prévisualisation
    setupPreviewHandler() {
        const previewBtn = document.getElementById('preview-planning');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showPlanningPreview();
            });
        }
    }

    showPlanningPreview() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        
        if (!service || selectedEmployes.length === 0) {
            this.showNotification('Veuillez sélectionner un service et des employés', 'error');
            return;
        }
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        // Calculer les statistiques de prévisualisation
        const totalHours = this.calculateTotalHours(serviceData);
        const selectedHours = this.calculateSelectedHours(selectedEmployes);
        const estimatedCost = this.calculateEstimatedCost(selectedEmployes);
        const coverage = Math.min(100, Math.round((selectedHours / totalHours) * 100));
        
        // Mettre à jour l'affichage
        document.getElementById('preview-effectif').textContent = selectedEmployes.length;
        document.getElementById('preview-heures').textContent = `${selectedHours}h`;
        document.getElementById('preview-cout').textContent = `${estimatedCost.toLocaleString()}€`;
        document.getElementById('preview-couverture').textContent = `${coverage}%`;
        
        // Afficher la prévisualisation
        document.getElementById('planning-preview').style.display = 'block';
        
        this.showNotification('Prévisualisation générée avec succès !', 'success');
    }

    // ===== NOUVELLES FONCTIONS POUR L'INTERFACE SIMPLIFIÉE =====

    // Initialisation de l'interface simplifiée
    setupSimplifiedPlanningHandlers() {
        console.log('🚀 Initialisation de l\'interface planning simplifiée...');
        
        // Gestion des boutons de saison
        this.setupSaisonButtons();
        
        // Gestion des filtres d'employés
        this.setupEmployesFilters();
        
        // Gestion de la sélection d'employés
        this.setupEmployeSelectionHandlers();
        
        // Gestion des suggestions d'auto-complétion
        this.setupAutoCompletionHandlers();
        
        // Gestion des actions de planning
        this.setupPlanningActions();
        
        // Initialisation de l'analyse
        this.updateEmployesAnalysis();
        
        console.log('✅ Interface planning simplifiée initialisée');
        this.showNotification('Interface planning simplifiée initialisée', 'success');
    }

    // Gestion des boutons de saison
    setupSaisonButtons() {
        const saisonButtons = document.querySelectorAll('.btn-saison');
        saisonButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Retirer la classe active de tous les boutons
                saisonButtons.forEach(b => b.classList.remove('active'));
                // Ajouter la classe active au bouton cliqué
                btn.classList.add('active');
                
                const saison = btn.dataset.saison;
                this.handleSaisonChange(saison);
            });
        });
    }

    handleSaisonChange(saison) {
        // Mettre à jour l'analyse selon la saison
        this.updateEmployesAnalysis();
        this.checkEmployesAlerts();
        
        this.showNotification(`Saison ${saison === 'haute' ? 'haute' : 'basse'} sélectionnée`, 'info');
    }

    // Gestion de la sélection d'employés
    setupEmployeSelectionHandlers() {
        // Charger les employés disponibles
        this.loadAvailableEmployesSimplified();
        
        // Event listeners pour les boutons d'ajout/suppression
        document.addEventListener('click', (e) => {
            if (e.target.closest('.employe-btn.add')) {
                const employeId = e.target.closest('.employe-item').dataset.employeId;
                this.addEmployeToSelectionSimplified(employeId);
            } else if (e.target.closest('.employe-btn.remove')) {
                const employeId = e.target.closest('.employe-item').dataset.employeId;
                this.removeEmployeFromSelectionSimplified(employeId);
            }
        });
    }

    loadAvailableEmployesSimplified() {
        const container = document.getElementById('employes-available');
        if (!container) {
            console.log('❌ Container employes-available non trouvé');
            return;
        }
        
        const checkboxList = container.querySelector('.employes-checkbox-list');
        if (!checkboxList) {
            console.log('❌ Container checkboxes non trouvé');
            return;
        }
        
        console.log('📋 Chargement des employés disponibles:', this.employes.length);
        checkboxList.innerHTML = '';
        
        if (this.employes.length === 0) {
            checkboxList.innerHTML = '<p class="no-employes">Aucun employé disponible</p>';
            return;
        }
        
        this.employes.forEach((employe, index) => {
            console.log(`📝 Création checkbox pour employé ${index + 1}:`, employe);
            const checkboxElement = this.createEmployeCheckbox(employe);
            checkboxList.appendChild(checkboxElement);
        });
        
        // Ajouter les event listeners pour les checkboxes
        this.setupCheckboxListeners();
        
        console.log('✅ Employés chargés dans le container');
    }

    createEmployeCheckbox(employe) {
        const div = document.createElement('div');
        div.className = 'employe-checkbox-item';
        
        const contractType = employe.disponibilite?.heuresAnnuelContractuelles === 1820 ? '35h' : '39h';
        
        div.innerHTML = `
            <label class="employe-checkbox-label">
                <input type="checkbox" class="employe-checkbox" data-employe-id="${employe.id}" data-employe-name="${employe.prenom} ${employe.nom}">
                <div class="employe-checkbox-info">
                    <div class="employe-name">${employe.prenom} ${employe.nom}</div>
                    <div class="employe-details">
                        ${contractType} - Niveau ${employe.niveau} - ${employe.typeContrat}
                    </div>
                </div>
            </label>
        `;
        
        return div;
    }

    setupCheckboxListeners() {
        // Supprimer les anciens listeners pour éviter les doublons
        const checkboxes = document.querySelectorAll('.employe-checkbox');
        checkboxes.forEach(checkbox => {
            // Cloner l'élément pour supprimer tous les listeners
            const newCheckbox = checkbox.cloneNode(true);
            checkbox.parentNode.replaceChild(newCheckbox, checkbox);
        });
        
        // Ajouter les nouveaux listeners
        const newCheckboxes = document.querySelectorAll('.employe-checkbox');
        newCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const employeId = e.target.dataset.employeId;
                const employeName = e.target.dataset.employeName;
                const isChecked = e.target.checked;
                
                console.log('🖱️ Checkbox changée:', employeName, isChecked ? 'cochée' : 'décochée');
                
                if (isChecked) {
                    this.addEmployeToSelectionCheckbox(employeId, employeName);
                } else {
                    this.removeEmployeFromSelectionCheckbox(employeId, employeName);
                }
            });
        });
        
        console.log(`✅ ${newCheckboxes.length} checkboxes configurées`);
    }

    addEmployeToSelectionCheckbox(employeId, employeName) {
        const employe = this.employes.find(e => e.id === employeId);
        if (!employe) return;
        
        // Vérifier si l'employé n'est pas déjà dans la liste sélectionnée
        const selectedList = document.querySelector('.selected-employes-list');
        const existingElement = selectedList.querySelector(`[data-employe-id="${employeId}"]`);
        if (existingElement) {
            console.log('⚠️ Employé déjà sélectionné:', employeName);
            return;
        }
        
        // Ajouter à la liste des sélectionnés
        const selectedElement = this.createSelectedEmployeElement(employe);
        selectedList.appendChild(selectedElement);
        
        // S'assurer que la checkbox est cochée
        const checkbox = document.querySelector(`input[type="checkbox"][data-employe-id="${employeId}"]`);
        if (checkbox) {
            checkbox.checked = true;
            console.log('✅ Checkbox cochée pour:', employeName);
        }
        
        // Mettre à jour les statistiques
        this.updateEmployesAnalysis();
        
        // Vérifier les alertes
        this.checkEmployesAlerts();
        
        this.showNotification(`${employeName} ajouté à la sélection`, 'success');
    }

    removeEmployeFromSelectionCheckbox(employeId, employeName) {
        // Supprimer de la liste des sélectionnés
        const selectedElement = document.querySelector(`.selected-employe-item[data-employe-id="${employeId}"]`);
        if (selectedElement) {
            selectedElement.remove();
            console.log('✅ Employé retiré de la sélection:', employeName);
        }
        
        // Décocher la checkbox correspondante
        const checkbox = document.querySelector(`input[type="checkbox"][data-employe-id="${employeId}"]`);
        if (checkbox) {
            checkbox.checked = false;
            console.log('✅ Checkbox décochée pour:', employeName);
        }
        
        // Mettre à jour les statistiques
        this.updateEmployesAnalysis();
        
        // Vérifier les alertes
        this.checkEmployesAlerts();
        
        this.showNotification(`${employeName} retiré de la sélection`, 'info');
    }

    createSelectedEmployeElement(employe) {
        const div = document.createElement('div');
        div.className = 'selected-employe-item';
        div.dataset.employeId = employe.id;
        
        const contractType = employe.disponibilite?.heuresAnnuelContractuelles === 1820 ? '35h' : '39h';
        
        div.innerHTML = `
            <div class="selected-employe-info">
                <div class="employe-name">${employe.prenom} ${employe.nom}</div>
                <div class="employe-details">
                    ${contractType} - Niveau ${employe.niveau}
                </div>
            </div>
            <button class="remove-employe-btn" onclick="gestPrev.removeEmployeFromSelectionCheckbox('${employe.id}', '${employe.prenom} ${employe.nom}')">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        return div;
    }

    // Gestion des suggestions d'auto-complétion
    setupAutoCompletionHandlers() {
        const applySuggestionsBtn = document.getElementById('apply-suggestions');
        const ignoreSuggestionsBtn = document.getElementById('ignore-suggestions');
        
        if (applySuggestionsBtn) {
            applySuggestionsBtn.addEventListener('click', () => {
                this.applyAllSuggestions();
            });
        }
        
        if (ignoreSuggestionsBtn) {
            ignoreSuggestionsBtn.addEventListener('click', () => {
                this.hideAutoCompletionSuggestions();
            });
        }
    }

    applyAllSuggestions() {
        const suggestions = document.querySelectorAll('.suggestion-item');
        let appliedCount = 0;
        
        suggestions.forEach(suggestion => {
            const employeId = suggestion.dataset.employeId;
            if (employeId) {
                this.addEmployeToSelectionSimplified(employeId);
                appliedCount++;
            }
        });
        
        this.hideAutoCompletionSuggestions();
        this.showNotification(`${appliedCount} employé(s) ajouté(s) automatiquement`, 'success');
    }

    // Gestion des actions de planning
    setupPlanningActions() {
        const generateBtn = document.getElementById('generate-planning');
        const optimizeBtn = document.getElementById('optimize-planning');
        const previewBtn = document.getElementById('preview-planning');
        
        if (generateBtn) {
            generateBtn.addEventListener('click', () => {
                this.generateSimplifiedPlanning();
            });
        }
        
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeSimplifiedPlanning();
            });
        }
        
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showSimplifiedPreview();
            });
        }
    }

    generateSimplifiedPlanning() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        
        if (!service || selectedEmployes.length === 0) {
            this.showNotification('Veuillez sélectionner un service et des employés', 'warning');
            return;
        }
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        // Générer le planning annuel
        const planningAnnuel = this.generatePlanningAnnuel(serviceData, selectedEmployes, saison);
        
        // Sauvegarder les données du planning pour la simulation RH
        const planningData = {
            service: serviceData,
            employes: selectedEmployes,
            saison: saison,
            totalHeures: planningAnnuel.totalHours,
            masseSalariale: this.calculateMasseSalarialeFromPlanning(selectedEmployes, planningAnnuel.totalHours),
            planningAnnuel: planningAnnuel,
            generatedAt: new Date().toISOString()
        };
        
        // Sauvegarder dans le localStorage
        localStorage.setItem('currentPlanning', JSON.stringify(planningData));
        
        // Afficher les résultats
        this.displaySimplifiedPlanningResults(planningAnnuel);
        
        this.showNotification('Planning annuel généré avec succès ! La simulation RH peut maintenant utiliser ces données.', 'success');
    }

    generatePlanningAnnuel(service, employes, saison) {
        const planning = {
            service: service.name,
            saison: saison,
            employes: employes,
            totalHours: this.calculateTotalHoursBySaison(service, saison),
            planningSemaines: [],
            statistiques: {}
        };
        
        // Générer 52 semaines (1 année)
        for (let semaine = 1; semaine <= 52; semaine++) {
            const planningSemaine = this.generatePlanningSemaine(service, employes, saison, semaine);
            planning.planningSemaines.push(planningSemaine);
        }
        
        // Calculer les statistiques annuelles
        planning.statistiques = this.calculateStatistiquesAnnuelles(planning);
        
        return planning;
    }

    generatePlanningSemaine(service, employes, saison, numeroSemaine) {
        const planningSemaine = {
            numero: numeroSemaine,
            jours: [],
            totalHeures: 0,
            employesUtilises: []
        };
        
        const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        joursSemaine.forEach((jour, index) => {
            const horaires = service.horairesParJour[jour];
            if (horaires && horaires[saison] && horaires[saison].ouverture && horaires[saison].fermeture) {
                const debut = this.parseTime(horaires[saison].ouverture);
                const fin = this.parseTime(horaires[saison].fermeture);
                
                if (debut !== null && fin !== null) {
                    let duree = (fin - debut) / 60; // Convertir en heures
                    if (duree < 0) duree += 24;
                    
                    // Calculer les pauses obligatoires
                    const pauses = this.calculatePauses(duree);
                    
                    // Répartir les employés selon la durée
                    const employesNecessaires = Math.max(1, Math.ceil(duree / 8));
                    const employesDisponibles = employes.slice(0, employesNecessaires);
                    
                    const planningJour = {
                        jour: jour,
                        ouverture: horaires[saison].ouverture,
                        fermeture: horaires[saison].fermeture,
                        duree: Math.round(duree * 10) / 10,
                        pauses: pauses,
                        employes: employesDisponibles.map(e => ({
                            id: e.id,
                            nom: `${e.prenom} ${e.nom}`,
                            heures: Math.round((duree / employesDisponibles.length) * 10) / 10,
                            debut: horaires[saison].ouverture,
                            fin: horaires[saison].fermeture,
                            pauses: pauses
                        }))
                    };
                    
                    planningSemaine.jours.push(planningJour);
                    planningSemaine.totalHeures += duree;
                    planningSemaine.employesUtilises.push(...employesDisponibles.map(e => e.id));
                }
            }
        });
        
        // Dédupliquer les employés utilisés
        planningSemaine.employesUtilises = [...new Set(planningSemaine.employesUtilises)];
        
        return planningSemaine;
    }

    calculatePauses(duree) {
        const pauses = [];
        
        // Pause de 20 minutes après 6h de travail
        if (duree > 6) {
            pauses.push({
                type: 'obligatoire',
                duree: 20,
                description: 'Pause de 20min après 6h de travail'
            });
        }
        
        // Pause déjeuner de 1h si plus de 4h
        if (duree > 4) {
            pauses.push({
                type: 'dejeuner',
                duree: 60,
                description: 'Pause déjeuner de 1h'
            });
        }
        
        // Pause de 15 minutes toutes les 4h
        const nombrePauses = Math.floor(duree / 4);
        for (let i = 1; i <= nombrePauses; i++) {
            pauses.push({
                type: 'reguliere',
                duree: 15,
                description: `Pause de 15min (${i}/${nombrePauses})`
            });
        }
        
        return pauses;
    }

    generatePlanningDetails(planningSemaine) {
        if (!planningSemaine || !planningSemaine.jours) {
            return '<p>Aucun planning disponible</p>';
        }
        
        let html = '<div class="planning-semaine">';
        html += `<h6>Semaine ${planningSemaine.numero} - ${planningSemaine.totalHeures.toFixed(1)}h total</h6>`;
        html += '<div class="semaine-jours">';
        
        planningSemaine.jours.forEach(jour => {
            html += `
                <div class="jour-item">
                    <div class="jour-nom">
                        <strong>${this.capitalizeFirst(jour.jour)}</strong>
                    </div>
                    <div class="jour-heures">
                        <span class="heures-total">${jour.duree}h</span>
                        <span class="heures-detail">${jour.ouverture} - ${jour.fermeture}</span>
                    </div>
                    <div class="jour-employes">
                        ${jour.employes.map(emp => `
                            <div class="employe-planning">
                                <span class="employe-nom">${emp.nom}</span>
                                <span class="employe-heures">${emp.heures}h</span>
                                <div class="employe-horaires">
                                    <small>${emp.debut} - ${emp.fin}</small>
                                </div>
                                ${emp.pauses.length > 0 ? `
                                    <div class="employe-pauses">
                                        ${emp.pauses.map(pause => `
                                            <span class="pause-badge ${pause.type}">
                                                ${pause.duree}min
                                            </span>
                                        `).join('')}
                                    </div>
                                ` : ''}
                            </div>
                        `).join('')}
                    </div>
                    ${jour.pauses.length > 0 ? `
                        <div class="jour-pauses">
                            <strong>Pauses :</strong>
                            ${jour.pauses.map(pause => `
                                <span class="pause-item ${pause.type}">
                                    ${pause.description}
                                </span>
                            `).join('')}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        
        html += '</div></div>';
        return html;
    }

    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    calculateStatistiquesAnnuelles(planning) {
        const stats = {
            totalHeuresAnnuelles: 0,
            totalHeuresParEmploye: {},
            moyenneHeuresSemaine: 0,
            semainesActives: 0,
            employesUtilises: new Set()
        };
        
        planning.planningSemaines.forEach(semaine => {
            if (semaine.totalHeures > 0) {
                stats.totalHeuresAnnuelles += semaine.totalHeures;
                stats.semainesActives++;
                
                semaine.jours.forEach(jour => {
                    jour.employes.forEach(employe => {
                        if (!stats.totalHeuresParEmploye[employe.id]) {
                            stats.totalHeuresParEmploye[employe.id] = 0;
                        }
                        stats.totalHeuresParEmploye[employe.id] += employe.heures;
                        stats.employesUtilises.add(employe.id);
                    });
                });
            }
        });
        
        // Calculer la moyenne par semaine
        stats.moyenneHeuresSemaine = stats.semainesActives > 0 ? Math.round((stats.totalHeuresAnnuelles / stats.semainesActives) * 10) / 10 : 0;
        stats.employesUtilises = Array.from(stats.employesUtilises);
        
        return stats;
    }

    displaySimplifiedPlanningResults(planning) {
        const container = document.getElementById('planning-results');
        if (!container) {
            console.log('❌ Container planning-results non trouvé');
            return;
        }
        
        let html = `
            <div class="planning-results-content">
                <div class="planning-header">
                    <h4><i class="fas fa-calendar-alt"></i> Planning Annuel - ${planning.service}</h4>
                    <div class="planning-meta">
                        <span class="badge badge-primary">${planning.saison.toUpperCase()}</span>
                        <span class="badge badge-info">${planning.employes.length} employés</span>
                        <span class="badge badge-success">${planning.totalHours}h/semaine</span>
                    </div>
                </div>
                
                <div class="planning-summary">
                    <div class="summary-item">
                        <i class="fas fa-clock"></i>
                        <div>
                            <h6>Heures annuelles</h6>
                            <p>${planning.statistiques.totalHeuresAnnuelles.toLocaleString()}h</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-calendar-week"></i>
                        <div>
                            <h6>Semaines actives</h6>
                            <p>${planning.statistiques.semainesActives}/52</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-users"></i>
                        <div>
                            <h6>Employés utilisés</h6>
                            <p>${planning.statistiques.employesUtilises.length}</p>
                        </div>
                    </div>
                    <div class="summary-item">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <h6>Moyenne/semaine</h6>
                            <p>${planning.statistiques.moyenneHeuresSemaine}h</p>
                        </div>
                    </div>
                </div>
                
                <div class="planning-details">
                    <h5><i class="fas fa-clock"></i> Détails du Planning - Semaine 1</h5>
                    <div class="planning-semaines">
                        ${this.generatePlanningDetails(planning.planningSemaines[0])}
                    </div>
                </div>
                
                <div class="timeline-container">
                    <div class="timeline-header">
                        <h5><i class="fas fa-chart-bar"></i> Timeline 12 mois (année)</h5>
                    </div>
                    
                    <div class="timeline-content">
                        <div class="timeline-sidebar">
                            <div class="season-distribution">
                                <h6>Répartition par saison</h6>
                                <div class="season-stats">
                                    <div class="season-item haute-saison">
                                        <div class="season-label">Haute saison</div>
                                        <div class="season-hours">${this.calculateHauteSaisonHours(planning)}h</div>
                                        <div class="season-percentage">(${this.calculateHauteSaisonPercentage(planning)}%)</div>
                                    </div>
                                    <div class="season-item basse-saison">
                                        <div class="season-label">Basse saison</div>
                                        <div class="season-hours">${this.calculateBasseSaisonHours(planning)}h</div>
                                        <div class="season-percentage">(${this.calculateBasseSaisonPercentage(planning)}%)</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div class="timeline-main">
                            <div class="timeline-table">
                                <div class="timeline-header-row">
                                    <div class="timeline-employee-header">Employés</div>
                                    ${this.generateMonthHeaders()}
                                </div>
                                ${this.generateTimelineRows(planning)}
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="planning-actions">
                    <button class="btn btn-primary" onclick="gestPrev.exportPlanningAnnuel()">
                        <i class="fas fa-download"></i> Exporter
                    </button>
                    <button class="btn btn-secondary" onclick="gestPrev.printPlanningAnnuel()">
                        <i class="fas fa-print"></i> Imprimer
                    </button>
                </div>
            </div>
        `;
        
        container.innerHTML = html;
        container.style.display = 'block';
    }

    generateMonthHeaders() {
        const mois = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        return mois.map((mois, index) => {
            const isHauteSaison = this.isHauteSaisonMonth(index + 1);
            const semestre = index < 6 ? 'semestre-1' : 'semestre-2';
            return `<div class="timeline-month-header ${isHauteSaison ? 'haute-saison' : 'basse-saison'} ${semestre}">${mois}</div>`;
        }).join('');
    }

    generateTimelineRows(planning) {
        return planning.employes.map(employe => {
            const employeId = employe.id;
            const employeName = `${employe.prenom} ${employe.nom}`;
            
            let row = `<div class="timeline-employee-row">
                <div class="timeline-employee-name">${employeName}</div>`;
            
            // Générer les données pour chaque mois
            for (let mois = 1; mois <= 12; mois++) {
                const heuresMois = this.calculateEmployeHoursForMonth(planning, employeId, mois);
                const isHauteSaison = this.isHauteSaisonMonth(mois);
                const semestre = mois <= 6 ? 'semestre-1' : 'semestre-2';
                
                row += `
                    <div class="timeline-cell ${isHauteSaison ? 'haute-saison' : 'basse-saison'} ${semestre}">
                        <div class="cell-hours">${heuresMois}h</div>
                        <div class="cell-pause">Pause</div>
                        <div class="cell-duration">30min</div>
                    </div>`;
            }
            
            row += '</div>';
            return row;
        }).join('');
    }

    calculateHauteSaisonHours(planning) {
        // Calculer les heures de haute saison (mois 1-2, 7-10)
        const hauteSaisonMonths = [1, 2, 7, 8, 9, 10];
        let totalHours = 0;
        
        hauteSaisonMonths.forEach(mois => {
            const semainesMois = this.getSemainesForMonth(mois);
            semainesMois.forEach(semaineNum => {
                const semaine = planning.planningSemaines.find(s => s.numero === semaineNum);
                if (semaine) {
                    totalHours += semaine.totalHeures;
                }
            });
        });
        
        return Math.round(totalHours);
    }

    calculateBasseSaisonHours(planning) {
        // Calculer les heures de basse saison (mois 3-6, 11-12)
        const basseSaisonMonths = [3, 4, 5, 6, 11, 12];
        let totalHours = 0;
        
        basseSaisonMonths.forEach(mois => {
            const semainesMois = this.getSemainesForMonth(mois);
            semainesMois.forEach(semaineNum => {
                const semaine = planning.planningSemaines.find(s => s.numero === semaineNum);
                if (semaine) {
                    totalHours += semaine.totalHeures;
                }
            });
        });
        
        return Math.round(totalHours);
    }

    calculateHauteSaisonPercentage(planning) {
        const hauteSaisonHours = this.calculateHauteSaisonHours(planning);
        const basseSaisonHours = this.calculateBasseSaisonHours(planning);
        const totalHours = hauteSaisonHours + basseSaisonHours;
        
        return totalHours > 0 ? Math.round((hauteSaisonHours / totalHours) * 100) : 0;
    }

    calculateBasseSaisonPercentage(planning) {
        return 100 - this.calculateHauteSaisonPercentage(planning);
    }

    isHauteSaisonMonth(mois) {
        // Haute saison : Janvier, Février, Juillet, Août, Septembre, Octobre
        return [1, 2, 7, 8, 9, 10].includes(mois);
    }

    getSemainesForMonth(mois) {
        // Retourner les numéros de semaines pour un mois donné
        const semainesParMois = {
            1: [1, 2, 3, 4], 2: [5, 6, 7, 8], 3: [9, 10, 11, 12], 4: [13, 14, 15, 16],
            5: [17, 18, 19, 20], 6: [21, 22, 23, 24], 7: [25, 26, 27, 28], 8: [29, 30, 31, 32],
            9: [33, 34, 35, 36], 10: [37, 38, 39, 40], 11: [41, 42, 43, 44], 12: [45, 46, 47, 48]
        };
        return semainesParMois[mois] || [];
    }

    calculateEmployeHoursForMonth(planning, employeId, mois) {
        const semainesMois = this.getSemainesForMonth(mois);
        let totalHours = 0;
        
        semainesMois.forEach(semaineNum => {
            const semaine = planning.planningSemaines.find(s => s.numero === semaineNum);
            if (semaine) {
                semaine.jours.forEach(jour => {
                    const employeJour = jour.employes.find(e => e.id === employeId);
                    if (employeJour) {
                        totalHours += employeJour.heures;
                    }
                });
            }
        });
        
        return Math.round(totalHours);
    }

    optimizeSimplifiedPlanning() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        
        if (!service || selectedEmployes.length === 0) {
            this.showNotification('Veuillez sélectionner un service et des employés', 'warning');
            return;
        }
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        // Générer les optimisations
        const optimisations = this.generateOptimisations(serviceData, selectedEmployes, saison);
        
        // Afficher les optimisations
        this.displayOptimisations(optimisations);
    }

    generateOptimisations(service, employes, saison) {
        const optimisations = [];
        const totalHours = this.calculateTotalHoursBySaison(service, saison);
        const selectedHours = this.calculateSelectedHours(employes);
        const recommendedCount = this.calculateRecommendedCount(totalHours);
        
        // Optimisation 1: Effectif insuffisant
        if (employes.length < recommendedCount) {
            const manque = recommendedCount - employes.length;
            optimisations.push({
                id: 'effectif-insuffisant',
                type: 'warning',
                titre: 'Effectif insuffisant',
                description: `Il manque ${manque} employé(s) pour couvrir les ${totalHours}h nécessaires`,
                impact: `+${manque} employé(s) requis`,
                action: 'Ajouter des employés',
                priorite: 'haute'
            });
        }
        
        // Optimisation 2: Sur-effectif
        if (employes.length > recommendedCount + 2) {
            const surplus = employes.length - recommendedCount;
            optimisations.push({
                id: 'sur-effectif',
                type: 'info',
                titre: 'Sur-effectif détecté',
                description: `${surplus} employé(s) en trop pour les besoins`,
                impact: `-${surplus} employé(s) possible`,
                action: 'Réduire l\'effectif',
                priorite: 'moyenne'
            });
        }
        
        // Optimisation 3: Couverture horaire insuffisante
        if (selectedHours < totalHours * 0.8) {
            const manqueHeures = Math.round(totalHours - selectedHours);
            optimisations.push({
                id: 'couverture-insuffisante',
                type: 'danger',
                titre: 'Couverture horaire insuffisante',
                description: `${selectedHours}h disponibles pour ${totalHours}h nécessaires`,
                impact: `+${manqueHeures}h à couvrir`,
                action: 'Augmenter les heures',
                priorite: 'haute'
            });
        }
        
        // Optimisation 4: Fermeture anticipée
        const heuresParJour = totalHours / 7; // Approximation
        if (heuresParJour > 10) {
            optimisations.push({
                id: 'fermeture-anticipée',
                type: 'suggestion',
                titre: 'Fermeture anticipée possible',
                description: `Fermer 30min plus tôt permettrait de réduire l'effectif`,
                impact: '-1 employé possible',
                action: 'Fermer 30min plus tôt',
                priorite: 'basse'
            });
        }
        
        // Optimisation 5: Répartition optimale
        if (employes.length >= 3) {
            optimisations.push({
                id: 'repartition-optimale',
                type: 'suggestion',
                titre: 'Répartition optimale',
                description: 'Répartir les heures de manière plus équitable',
                impact: 'Meilleure répartition',
                action: 'Optimiser la répartition',
                priorite: 'moyenne'
            });
        }
        
        return optimisations;
    }

    displayOptimisations(optimisations) {
        const container = document.getElementById('optimisations-container');
        if (!container) {
            console.log('❌ Container optimisations non trouvé');
            return;
        }
        
        if (optimisations.length === 0) {
            container.innerHTML = '<p class="no-optimisations">Aucune optimisation nécessaire</p>';
            return;
        }
        
        let html = '<h6><i class="fas fa-magic"></i> Optimisations suggérées</h6>';
        html += '<div class="optimisations-list">';
        
        optimisations.forEach(optimisation => {
            html += `
                <div class="optimisation-item ${optimisation.type}" data-optimisation-id="${optimisation.id}">
                    <div class="optimisation-header">
                        <div class="optimisation-icon">
                            <i class="fas ${this.getOptimisationIcon(optimisation.type)}"></i>
                        </div>
                        <div class="optimisation-info">
                            <h6>${optimisation.titre}</h6>
                            <p>${optimisation.description}</p>
                        </div>
                        <div class="optimisation-priority ${optimisation.priorite}">
                            ${optimisation.priorite.toUpperCase()}
                        </div>
                    </div>
                    <div class="optimisation-details">
                        <div class="optimisation-impact">
                            <strong>Impact:</strong> ${optimisation.impact}
                        </div>
                        <div class="optimisation-actions">
                            <button class="btn btn-sm btn-primary" onclick="gestPrev.applyOptimisation('${optimisation.id}')">
                                ${optimisation.action}
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="gestPrev.ignoreOptimisation('${optimisation.id}')">
                                Ignorer
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Afficher le container
        container.style.display = 'block';
    }

    getOptimisationIcon(type) {
        const icons = {
            'warning': 'fa-exclamation-triangle',
            'danger': 'fa-times-circle',
            'info': 'fa-info-circle',
            'suggestion': 'fa-lightbulb'
        };
        return icons[type] || 'fa-info-circle';
    }

    applyOptimisation(optimisationId) {
        console.log('🔧 Application de l\'optimisation:', optimisationId);
        
        switch (optimisationId) {
            case 'effectif-insuffisant':
                this.showAutoCompletionSuggestions(1);
                break;
            case 'sur-effectif':
                this.showNotification('Optimisation appliquée: effectif réduit', 'success');
                break;
            case 'couverture-insuffisante':
                this.showNotification('Optimisation appliquée: heures augmentées', 'success');
                break;
            case 'fermeture-anticipée':
                this.showNotification('Optimisation appliquée: fermeture anticipée', 'success');
                break;
            case 'repartition-optimale':
                this.showNotification('Optimisation appliquée: répartition optimisée', 'success');
                break;
        }
        
        // Masquer l'optimisation appliquée
        const optimisationElement = document.querySelector(`[data-optimisation-id="${optimisationId}"]`);
        if (optimisationElement) {
            optimisationElement.style.display = 'none';
        }
    }

    ignoreOptimisation(optimisationId) {
        console.log('❌ Optimisation ignorée:', optimisationId);
        
        // Masquer l'optimisation ignorée
        const optimisationElement = document.querySelector(`[data-optimisation-id="${optimisationId}"]`);
        if (optimisationElement) {
            optimisationElement.style.display = 'none';
        }
        
        this.showNotification('Optimisation ignorée', 'info');
    }

    showSimplifiedPreview() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        
        if (!service || selectedEmployes.length === 0) {
            this.showNotification('Veuillez sélectionner un service et des employés', 'error');
            return;
        }
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        // Calculer les statistiques de prévisualisation avec optimisation de couverture
        const totalHours = this.calculateTotalHours(serviceData);
        const selectedHours = this.calculateSelectedHours(selectedEmployes);
        const estimatedCost = this.calculateEstimatedCost(selectedEmployes);
        
        // Optimiser la couverture
        const optimisation = this.optimizeCoverage(serviceData, selectedEmployes);
        const coverage = Math.round(optimisation.couverture);
        
        // Calculer les heures restantes par employé
        const heuresRestantes = selectedEmployes.map(emp => ({
            employe: emp,
            heuresDisponibles: this.calculateAvailableHours(emp, 1), // Semaine 1
            heuresAffectees: this.getHeuresAffectees(emp, 1)
        }));
        
        // Mettre à jour l'affichage
        document.getElementById('preview-effectif').textContent = selectedEmployes.length;
        document.getElementById('preview-heures').textContent = `${selectedHours}h/semaine`;
        document.getElementById('preview-cout').textContent = `${estimatedCost.toLocaleString()}€/an`;
        document.getElementById('preview-couverture').textContent = `${coverage}%`;
        
        // Afficher les heures restantes
        this.displayAvailableHours(heuresRestantes);
        
        // Afficher les alertes d'optimisation
        this.displayOptimisationAlerts(optimisation.alertes);
        
        // Masquer l'historique des simulations s'il était affiché
        const historyContainer = document.getElementById('simulations-history');
        if (historyContainer) {
            historyContainer.style.display = 'none';
        }
        
        // Afficher la prévisualisation
        document.getElementById('planning-preview').style.display = 'block';
        
        // Proposer de sauvegarder la simulation
        this.proposeSaveSimulation({
            service: serviceData.name,
            employes: selectedEmployes.map(e => e.id),
            totalHours,
            selectedHours,
            estimatedCost,
            coverage,
            date: new Date().toISOString()
        });
        
        this.showNotification('Prévisualisation générée avec succès !', 'success');
    }

    displayAvailableHours(heuresRestantes) {
        const container = document.getElementById('available-hours-container');
        if (!container) return;
        
        let html = '<h6><i class="fas fa-clock"></i> Heures disponibles par employé</h6>';
        html += '<div class="available-hours-list">';
        
        heuresRestantes.forEach(item => {
            const employe = item.employe;
            const heuresDisponibles = item.heuresDisponibles;
            const heuresAffectees = item.heuresAffectees;
            
            html += `
                <div class="available-hours-item">
                    <div class="employe-info">
                        <strong>${employe.prenom} ${employe.nom}</strong>
                        <span class="mode-badge ${employe.modeGestion}">${employe.modeGestion}</span>
                    </div>
                    <div class="hours-info">
                        <span class="heures-affectees">Affectées: ${heuresAffectees}h</span>
                        <span class="heures-disponibles">Disponibles: ${heuresDisponibles}h</span>
                    </div>
                    <div class="mode-actions">
                        <button class="btn btn-sm btn-outline-primary" onclick="gestPrev.setEmployeMode('${employe.id}', 'manuel')">
                            Manuel
                        </button>
                        <button class="btn btn-sm btn-outline-secondary" onclick="gestPrev.setEmployeMode('${employe.id}', 'semi-auto')">
                            Semi-auto
                        </button>
                        <button class="btn btn-sm btn-outline-success" onclick="gestPrev.setEmployeMode('${employe.id}', 'auto')">
                            Auto
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }

    proposeSaveSimulation(simulationData) {
        const saveButton = document.getElementById('save-simulation-btn');
        if (saveButton) {
            saveButton.style.display = 'block';
            saveButton.onclick = () => {
                const nom = prompt('Nom de la simulation :', `Simulation ${new Date().toLocaleDateString()}`);
                if (nom) {
                    simulationData.nom = nom;
                    this.saveSimulation(simulationData);
                }
            };
        }
    }

    displayOptimisationAlerts(alertes) {
        const container = document.getElementById('optimisation-alerts');
        if (!container) return;
        
        if (alertes.length === 0) {
            container.style.display = 'none';
            return;
        }
        
        let html = '<h6><i class="fas fa-exclamation-triangle"></i> Alertes d\'optimisation</h6>';
        html += '<div class="optimisation-alerts-list">';
        
        alertes.forEach(alerte => {
            html += `
                <div class="optimisation-alerte ${alerte.type}">
                    <i class="fas ${this.getAlertIcon(alerte.type)}"></i>
                    <span>${alerte.message}</span>
                </div>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        container.style.display = 'block';
    }

    getAlertIcon(type) {
        switch (type) {
            case 'danger': return 'fa-exclamation-circle';
            case 'warning': return 'fa-exclamation-triangle';
            case 'info': return 'fa-info-circle';
            case 'success': return 'fa-check-circle';
            default: return 'fa-info-circle';
        }
    }

    // Mise à jour de l'analyse avec la saison
    updateEmployesAnalysis() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        
        if (!service) return;
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        // Calculer les statistiques selon la saison
        const totalHours = this.calculateTotalHoursBySaison(serviceData, saison);
        const selectedHours = this.calculateSelectedHours(selectedEmployes);
        const recommendedCount = this.calculateRecommendedCount(totalHours);
        const estimatedCost = this.calculateEstimatedCost(selectedEmployes);
        
        // Calculer le pourcentage de couverture
        const coveragePercentage = totalHours > 0 ? Math.round((selectedHours / totalHours) * 100) : 0;
        
        // Mettre à jour l'affichage
        document.getElementById('selected-count').textContent = selectedEmployes.length;
        document.getElementById('recommended-count').textContent = recommendedCount;
        document.getElementById('hours-to-cover').textContent = `${totalHours}h`;
        document.getElementById('estimated-cost').textContent = `${estimatedCost.toLocaleString()}€`;
        
        // Afficher le pourcentage de couverture
        const coverageElement = document.getElementById('coverage-percentage');
        if (coverageElement) {
            coverageElement.textContent = `${coveragePercentage}%`;
            coverageElement.className = `coverage-percentage ${this.getCoverageClass(coveragePercentage)}`;
        }
        
        // Mettre à jour les alertes avec analyse poussée
        this.checkEmployesAlerts();
    }

    calculateTotalHoursBySaison(service, saison) {
        let totalHours = 0;
        const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        console.log('🔍 Calcul des heures pour service:', service.name, 'saison:', saison);
        console.log('📅 Horaires du service:', service.horairesParJour);
        
        if (!service.horairesParJour) {
            console.log('❌ Aucun horaire configuré pour ce service');
            return 0;
        }
        
        joursSemaine.forEach(jour => {
            const horaires = service.horairesParJour[jour];
            console.log(`📊 Vérification ${jour}:`, horaires);
            
            if (horaires && horaires[saison]) {
                const horaireSaison = horaires[saison];
                console.log(`📊 ${jour} ${saison}:`, horaireSaison);
                
                // Vérifier si le jour est fermé
                if (horaires[`ferme${saison.charAt(0).toUpperCase() + saison.slice(1)}`]) {
                    console.log(`🚫 ${jour} ${saison}: fermé`);
                    return;
                }
                
                if (horaireSaison && horaireSaison.ouverture && horaireSaison.fermeture) {
                    // Utiliser parseTime qui retourne des minutes
                    const debutMinutes = this.parseTime(horaireSaison.ouverture);
                    const finMinutes = this.parseTime(horaireSaison.fermeture);
                    
                    console.log(`⏰ ${jour} ${saison}: ${horaireSaison.ouverture} -> ${debutMinutes}min, ${horaireSaison.fermeture} -> ${finMinutes}min`);
                    
                    if (debutMinutes !== null && finMinutes !== null) {
                        let duree = (finMinutes - debutMinutes) / 60; // Convertir en heures
                        
                        // Gérer le cas où la fermeture est le lendemain (ex: 23h00 à 02h00)
                        if (duree < 0) {
                            duree += 24;
                        }
                        
                        totalHours += duree;
                        console.log(`✅ ${jour} ${saison}: ${horaireSaison.ouverture}-${horaireSaison.fermeture} = ${duree}h`);
                    } else {
                        console.log(`❌ ${jour} ${saison}: Impossible de parser les heures`);
                    }
                } else {
                    console.log(`❌ ${jour} ${saison}: Horaires manquants ou incomplets`);
                }
            } else {
                console.log(`❌ ${jour} ${saison}: Aucun horaire pour cette saison`);
            }
        });
        
        console.log(`✅ Total heures ${saison}: ${totalHours}h`);
        return Math.round(totalHours);
    }

    // Vérification des alertes avec la saison
    checkEmployesAlerts() {
        const selectedEmployes = this.getSelectedEmployes();
        const service = document.getElementById('planning-service').value;
        const saison = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        
        if (!service) return;
        
        const serviceData = this.services.find(s => s.id === service);
        if (!serviceData) return;
        
        const alerts = [];
        
        // Calculs de base
        const totalHours = this.calculateTotalHoursBySaison(serviceData, saison);
        const selectedHours = this.calculateSelectedHours(selectedEmployes);
        const recommendedCount = this.calculateRecommendedCount(totalHours);
        const coveragePercentage = totalHours > 0 ? Math.round((selectedHours / totalHours) * 100) : 0;
        
        // === ANALYSE PUSSÉE DE LA COUVERTURE ===
        
        // 1. Couverture insuffisante (< 80%)
        if (coveragePercentage < 80) {
            const manqueHeures = Math.round(totalHours - selectedHours);
            const manqueEmployes = Math.ceil(manqueHeures / 160); // 160h/mois par employé
            
            alerts.push({
                type: 'danger',
                message: `Couverture critique : ${coveragePercentage}% (${selectedHours}h/${totalHours}h)`,
                details: `Il manque ${manqueHeures}h (${manqueEmployes} employé(s) supplémentaire(s) recommandé(s))`,
                icon: 'fas fa-exclamation-triangle',
                priority: 'haute',
                action: 'Ajouter des employés'
            });
        }
        
        // 2. Couverture excessive (> 120%)
        else if (coveragePercentage > 120) {
            const surplusHeures = Math.round(selectedHours - totalHours);
            const surplusEmployes = Math.ceil(surplusHeures / 160);
            const coutSurplus = Math.round(surplusHeures * 15); // 15€/h estimé
            
            alerts.push({
                type: 'warning',
                message: `Sur-couverture détectée : ${coveragePercentage}% (${selectedHours}h/${totalHours}h)`,
                details: `${surplusHeures}h en surplus (${surplusEmployes} employé(s) en trop) - Coût estimé : ${coutSurplus.toLocaleString()}€/mois`,
                icon: 'fas fa-chart-line',
                priority: 'moyenne',
                action: 'Réduire l\'effectif'
            });
        }
        
        // 3. Couverture optimale (80-100%)
        else if (coveragePercentage >= 80 && coveragePercentage <= 100) {
            alerts.push({
                type: 'success',
                message: `Couverture optimale : ${coveragePercentage}%`,
                details: `Excellent équilibre entre besoins et ressources`,
                icon: 'fas fa-check-circle',
                priority: 'basse',
                action: 'Maintenir'
            });
        }
        
        // 4. Couverture légèrement élevée (100-120%)
        else if (coveragePercentage > 100 && coveragePercentage <= 120) {
            const surplusHeures = Math.round(selectedHours - totalHours);
            alerts.push({
                type: 'info',
                message: `Couverture élevée : ${coveragePercentage}%`,
                details: `${surplusHeures}h de marge de sécurité`,
                icon: 'fas fa-info-circle',
                priority: 'basse',
                action: 'Surveiller'
            });
        }
        
        // === ANALYSE DE L'EFFECTIF ===
        
        // 5. Effectif insuffisant
        if (selectedEmployes.length < recommendedCount) {
            const manque = recommendedCount - selectedEmployes.length;
            alerts.push({
                type: 'danger',
                message: `Effectif insuffisant : ${selectedEmployes.length}/${recommendedCount} employés`,
                details: `Il manque ${manque} employé(s) pour couvrir les besoins`,
                icon: 'fas fa-users',
                priority: 'haute',
                action: 'Recruter'
            });
        }
        
        // 6. Sur-effectif
        else if (selectedEmployes.length > recommendedCount + 2) {
            const surplus = selectedEmployes.length - recommendedCount;
            const coutSurplus = Math.round(surplus * 2500); // 2500€/mois par employé
            
            alerts.push({
                type: 'warning',
                message: `Sur-effectif : ${selectedEmployes.length} employés pour ${recommendedCount} nécessaires`,
                details: `${surplus} employé(s) en trop - Coût estimé : ${coutSurplus.toLocaleString()}€/mois`,
                icon: 'fas fa-user-minus',
                priority: 'moyenne',
                action: 'Réduire l\'effectif'
            });
        }
        
        // === ANALYSE DES COMPÉTENCES ===
        
        // 7. Répartition des niveaux
        const niveaux = this.analyzeNiveaux(selectedEmployes);
        if (niveaux.senior < 1 && selectedEmployes.length > 2) {
            alerts.push({
                type: 'warning',
                message: 'Manque de seniors',
                details: 'Aucun employé senior (niveau IV-V) - Risque de supervision',
                icon: 'fas fa-user-tie',
                priority: 'moyenne',
                action: 'Ajouter un senior'
            });
        }
        
        // 8. Répartition des contrats
        const contrats = this.analyzeContrats(selectedEmployes);
        if (contrats['35h'] === 0 && contrats['39h'] > 0) {
            alerts.push({
                type: 'info',
                message: 'Flexibilité limitée',
                details: 'Aucun employé 35h - Flexibilité réduite pour les pics d\'activité',
                icon: 'fas fa-clock',
                priority: 'basse',
                action: 'Diversifier les contrats'
            });
        }
        
        // === ANALYSE ÉCONOMIQUE ===
        
        // 9. Coût par heure
        const coutParHeure = totalHours > 0 ? Math.round(estimatedCost / totalHours) : 0;
        if (coutParHeure > 25) {
            alerts.push({
                type: 'warning',
                message: `Coût élevé : ${coutParHeure}€/h`,
                details: `Coût horaire au-dessus de la moyenne (25€/h)`,
                icon: 'fas fa-euro-sign',
                priority: 'moyenne',
                action: 'Optimiser les coûts'
            });
        }
        
        // Afficher les alertes
        this.displayEmployesAlerts(alerts);
        
        // Gérer les suggestions d'auto-complétion
        if (selectedEmployes.length < recommendedCount) {
            this.showAutoCompletionSuggestions(recommendedCount - selectedEmployes.length);
        } else {
            this.hideAutoCompletionSuggestions();
        }
    }

    // ===== GÉNÉRATION DE PLANNING DÉTAILLÉ AVEC HEURES ET PAUSES =====
    generateDetailedPlanning() {
        const serviceSelect = document.getElementById('planning-service');
        const saisonActive = document.querySelector('.btn-saison.active')?.dataset.saison || 'haute';
        const selectedEmployes = this.getSelectedEmployes();

        if (!serviceSelect || !serviceSelect.value) {
            this.showNotification('Veuillez sélectionner un service', 'error');
            return;
        }

        if (selectedEmployes.length === 0) {
            this.showNotification('Veuillez sélectionner au moins un employé', 'error');
            return;
        }

        const service = this.services.find(s => s.id === serviceSelect.value);
        const employes = this.employes.filter(e => selectedEmployes.includes(e.id));

        // Générer le planning détaillé
        const planning = this.generateDetailedPlanningData(service, employes, saisonActive);
        this.displayDetailedPlanning(planning);
        
        this.showNotification('Planning détaillé généré avec succès !', 'success');
    }

    generateDetailedPlanningData(service, employes, saison) {
        const planning = {
            service: service,
            employes: employes,
            saison: saison,
            semaines: []
        };

        // Générer planning pour 4 semaines en détail
        for (let semaine = 1; semaine <= 4; semaine++) {
            const planningSemaine = this.generateDetailedWeekPlanning(service, employes, saison, semaine);
            planning.semaines.push(planningSemaine);
        }

        return planning;
    }

    generateDetailedWeekPlanning(service, employes, saison, numeroSemaine) {
        const planningSemaine = {
            numero: numeroSemaine,
            jours: []
        };

        const joursSemaine = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        joursSemaine.forEach((jour, index) => {
            const horairesJour = service.horairesParJour[jour];
            const planningJour = {
                nom: jour,
                horaires: horairesJour,
                shifts: []
            };

            if (horairesJour && horairesJour[saison] && !horairesJour[`ferme${saison.charAt(0).toUpperCase() + saison.slice(1)}`]) {
                const horaires = horairesJour[saison];
                const shifts = this.calculateDetailedShifts(horaires, employes, jour);
                planningJour.shifts = shifts;
            }

            planningSemaine.jours.push(planningJour);
        });

        return planningSemaine;
    }

    calculateDetailedShifts(horaires, employes, jour) {
        const shifts = [];
        const debut = this.parseTime(horaires.ouverture);
        const fin = this.parseTime(horaires.fermeture);
        const dureeTotale = (fin - debut) / 60;

        // Répartir les employés selon leur mode de gestion
        const employesManuel = employes.filter(emp => emp.modeGestion === 'manuel');
        const employesSemiAuto = employes.filter(emp => emp.modeGestion === 'semi-auto');
        const employesAuto = employes.filter(emp => emp.modeGestion === 'auto');

        // Créer des créneaux détaillés
        const creneaux = this.createDetailedCreneaux(debut, fin, dureeTotale);

        creneaux.forEach((creneau, index) => {
            // Assigner un employé selon le mode de gestion
            let employe = null;
            if (employesManuel.length > 0 && index < employesManuel.length) {
                employe = employesManuel[index];
            } else if (employesSemiAuto.length > 0) {
                employe = employesSemiAuto[index % employesSemiAuto.length];
            } else if (employesAuto.length > 0) {
                employe = employesAuto[index % employesAuto.length];
            }

            if (employe) {
                const pauses = this.calculatePauses(creneau.duree);
                shifts.push({
                    employe: employe,
                    debut: creneau.debut,
                    fin: creneau.fin,
                    duree: creneau.duree,
                    pauses: pauses,
                    type: this.getShiftType(creneau.duree)
                });
            }
        });

        return shifts;
    }

    createDetailedCreneaux(debut, fin, dureeTotale) {
        const creneaux = [];
        let heureActuelle = debut;

        // Créer des créneaux de 4-6 heures maximum
        while (heureActuelle < fin) {
            const dureeCreneau = Math.min(6, fin - heureActuelle);
            const finCreneau = heureActuelle + dureeCreneau;

            creneaux.push({
                debut: this.formatTime(heureActuelle),
                fin: this.formatTime(finCreneau),
                duree: dureeCreneau / 60
            });

            heureActuelle = finCreneau;
        }

        return creneaux;
    }

    formatTime(minutes) {
        const heures = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${heures.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    // ===== AFFICHAGE DÉTAILLÉ DU PLANNING =====
    displayDetailedPlanning(planning) {
        const planningContainer = document.getElementById('planning-results');
        if (!planningContainer) return;

        const planningHTML = this.generateDetailedPlanningHTML(planning);
        planningContainer.innerHTML = planningHTML;
    }

    generateDetailedPlanningHTML(planning) {
        return `
            <div class="planning-results-content">
                <div class="planning-header">
                    <h4>
                        <i class="fas fa-calendar-alt"></i>
                        Planning détaillé - ${planning.service.name}
                    </h4>
                    <div class="planning-meta">
                        <span class="badge badge-primary">${planning.saison === 'haute' ? 'Haute saison' : 'Basse saison'}</span>
                        <span class="badge badge-info">${planning.employes.length} employés</span>
                    </div>
                </div>

                <div class="planning-summary">
                    ${this.generatePlanningSummary(planning)}
                </div>

                <div class="planning-details">
                    ${this.generateDetailedTimeline(planning)}
                </div>

                <div class="planning-actions">
                    <button class="btn btn-primary" onclick="gestPrev.saveCurrentScenario()">
                        <i class="fas fa-save"></i> Sauvegarder ce scénario
                    </button>
                    <button class="btn btn-secondary" onclick="gestPrev.exportPlanning()">
                        <i class="fas fa-download"></i> Exporter
                    </button>
                </div>
            </div>
        `;
    }

    generatePlanningSummary(planning) {
        const totalHeures = planning.semaines.reduce((total, semaine) => {
            return total + semaine.jours.reduce((jourTotal, jour) => {
                return jourTotal + jour.shifts.reduce((shiftTotal, shift) => {
                    return shiftTotal + shift.duree;
                }, 0);
            }, 0);
        }, 0);

        const totalPauses = planning.semaines.reduce((total, semaine) => {
            return total + semaine.jours.reduce((jourTotal, jour) => {
                return jourTotal + jour.shifts.reduce((shiftTotal, shift) => {
                    return shiftTotal + shift.pauses.reduce((pauseTotal, pause) => {
                        return pauseTotal + pause.duree;
                    }, 0);
                }, 0);
            }, 0);
        }, 0);

        return `
            <div class="summary-item">
                <i class="fas fa-clock"></i>
                <div>
                    <h6>Heures totales</h6>
                    <p>${totalHeures.toFixed(1)}h</p>
                </div>
            </div>
            <div class="summary-item">
                <i class="fas fa-coffee"></i>
                <div>
                    <h6>Pauses totales</h6>
                    <p>${totalPauses.toFixed(1)}h</p>
                </div>
            </div>
            <div class="summary-item">
                <i class="fas fa-users"></i>
                <div>
                    <h6>Employés actifs</h6>
                    <p>${planning.employes.length}</p>
                </div>
            </div>
        `;
    }

    generateDetailedTimeline(planning) {
        return `
            <div class="planning-semaines">
                ${planning.semaines.map(semaine => this.generateSemaineHTML(semaine)).join('')}
            </div>
        `;
    }

    generateSemaineHTML(semaine) {
        return `
            <div class="planning-semaine">
                <h6>Semaine ${semaine.numero}</h6>
                <div class="semaine-jours">
                    ${semaine.jours.map(jour => this.generateJourHTML(jour)).join('')}
                </div>
            </div>
        `;
    }

    generateJourHTML(jour) {
        if (jour.shifts.length === 0) {
            return `
                <div class="jour-item ferme">
                    <div class="jour-nom">${this.capitalizeFirst(jour.nom)}</div>
                    <div class="jour-heures">Fermé</div>
                </div>
            `;
        }

        const totalHeures = jour.shifts.reduce((total, shift) => total + shift.duree, 0);
        const totalPauses = jour.shifts.reduce((total, shift) => {
            return total + shift.pauses.reduce((pauseTotal, pause) => pauseTotal + pause.duree, 0);
        }, 0);

        return `
            <div class="jour-item">
                <div class="jour-nom">${this.capitalizeFirst(jour.nom)}</div>
                <div class="jour-heures">
                    <div class="heures-total">${totalHeures.toFixed(1)}h</div>
                    <div class="heures-detail">
                        ${jour.shifts.map(shift => `
                            <div class="shift-detail">
                                <span class="employe-nom">${shift.employe.prenom} ${shift.employe.nom}</span>
                                <span class="shift-horaires">${shift.debut}-${shift.fin}</span>
                                <span class="shift-duree">${shift.duree.toFixed(1)}h</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="jour-pauses">
                    ${jour.shifts.map(shift => `
                        <div class="employe-pauses">
                            <span class="employe-nom">${shift.employe.prenom} ${shift.employe.nom}</span>
                            ${shift.pauses.map(pause => `
                                <span class="pause-badge ${pause.type}">${pause.description}</span>
                            `).join('')}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ===== FONCTIONS DE SIMULATION RH AVANCÉE =====
    calculateAdvancedRHSimulationFromPlanning(planningData, periode, tauxCharges, caEstime, margeObjectif) {
        // === DONNÉES DU PLANNING RÉEL ===
        const { service, employes, totalHeures, masseSalariale } = planningData;
        
        // === ANALYSE DES COMPÉTENCES ET NIVEAUX ===
        const analyseCompetences = this.analyzeCompetences();
        const analyseNiveaux = this.analyzeNiveaux(employes);
        const analyseContrats = this.analyzeContrats(employes);
        
        // === CALCULS RH BASÉS SUR LE PLANNING RÉEL ===
        const totalHeuresServices = totalHeures; // Heures réelles du planning
        const totalCoutEmployes = masseSalariale; // Masse salariale réelle du planning

        // === GESTION DES CONGÉS ET REPOS ===
        const gestionConges = this.calculateGestionCongesFromPlanning(employes, periode);
        
        // === ROTATION ET FLEXIBILITÉ ===
        const rotationEquipes = this.calculateRotationEquipesFromPlanning(service, employes);
        
        // === INDICATEURS DE PERFORMANCE RH ===
        const indicateursRH = this.calculateIndicateursRHFromPlanning(totalHeuresServices, totalCoutEmployes, employes);
        
        // === SIMULATIONS DE SCÉNARIOS ===
        const scenarios = this.generateRHScenariosFromPlanning(planningData, periode, tauxCharges, caEstime, margeObjectif);
        
        // === ANALYSE DES RISQUES RH ===
        const analyseRisques = this.analyzeRisquesRHFromPlanning(planningData);
        
        // === CALCULS FINANCIERS AVANCÉS ===
        const chargesSociales = totalCoutEmployes * (tauxCharges / 100);
        const coutTotal = totalCoutEmployes + chargesSociales;
        const coutHoraireMoyen = totalHeuresServices > 0 ? coutTotal / totalHeuresServices : 0;
        
        const margeBrute = caEstime - coutTotal;
        const margeBrutePourcentage = caEstime > 0 ? (margeBrute / caEstime) * 100 : 0;
        const objectifMarge = (caEstime * margeObjectif) / 100;
        const ecartMarge = margeBrute - objectifMarge;
        
        const ratioCoutCA = caEstime > 0 ? (coutTotal / caEstime) * 100 : 0;
        const productiviteHoraire = totalHeuresServices > 0 ? caEstime / totalHeuresServices : 0;

        return {
            // === DONNÉES DE BASE ===
            periode: periode,
            tauxCharges: tauxCharges,
            caEstime: caEstime,
            margeObjectif: margeObjectif,
            totalHeuresServices: totalHeuresServices,
            totalCoutEmployes: totalCoutEmployes,
            chargesSociales: chargesSociales,
            coutTotal: coutTotal,
            
            // === DONNÉES DU PLANNING ===
            planningData: planningData,
            
            // === ANALYSES RH ===
            analyseCompetences: analyseCompetences,
            analyseNiveaux: analyseNiveaux,
            analyseContrats: analyseContrats,
            gestionConges: gestionConges,
            rotationEquipes: rotationEquipes,
            indicateursRH: indicateursRH,
            analyseRisques: analyseRisques,
            
            // === SCÉNARIOS ===
            scenarios: scenarios,
            
            // === INDICATEURS FINANCIERS ===
            coutHoraireMoyen: coutHoraireMoyen,
            margeBrute: margeBrute,
            margeBrutePourcentage: margeBrutePourcentage,
            objectifMarge: objectifMarge,
            ecartMarge: ecartMarge,
            ratioCoutCA: ratioCoutCA,
            productiviteHoraire: productiviteHoraire,
            
            // === ALERTES ===
            alertes: this.generateAdvancedRHAlertes(analyseCompetences, analyseRisques, indicateursRH, margeBrutePourcentage, ratioCoutCA)
        };
    }

    calculateAdvancedRHSimulation(periode, tauxCharges, caEstime, margeObjectif) {
        // === ANALYSE DES COMPÉTENCES ET NIVEAUX ===
        const analyseCompetences = this.analyzeCompetences();
        const analyseNiveaux = this.analyzeNiveaux(this.employes);
        const analyseContrats = this.analyzeContrats(this.employes);
        
        // === CALCULS RH AVANCÉS ===
        const totalHeuresServices = this.services.reduce((total, service) => {
            const heuresSemaine = this.calculateHeuresSemaine(service);
            return total + heuresSemaine.haute + heuresSemaine.basse;
        }, 0);

        const totalCoutEmployes = this.employes.reduce((total, employe) => {
            return total + (employe.salaireHoraire * employe.disponibilite.heuresAnnuelContractuelles * periode / 12);
        }, 0);

        // === GESTION DES CONGÉS ET REPOS ===
        const gestionConges = this.calculateGestionConges(periode);
        
        // === ROTATION ET FLEXIBILITÉ ===
        const rotationEquipes = this.calculateRotationEquipes();
        
        // === INDICATEURS DE PERFORMANCE RH ===
        const indicateursRH = this.calculateIndicateursRH(totalHeuresServices, totalCoutEmployes);
        
        // === SIMULATIONS DE SCÉNARIOS ===
        const scenarios = this.generateRHScenarios(periode, tauxCharges, caEstime, margeObjectif);
        
        // === ANALYSE DES RISQUES RH ===
        const analyseRisques = this.analyzeRisquesRH();
        
        // === CALCULS FINANCIERS AVANCÉS ===
        const chargesSociales = totalCoutEmployes * (tauxCharges / 100);
        const coutTotal = totalCoutEmployes + chargesSociales;
        const coutHoraireMoyen = totalHeuresServices > 0 ? coutTotal / totalHeuresServices : 0;
        
        const margeBrute = caEstime - coutTotal;
        const margeBrutePourcentage = caEstime > 0 ? (margeBrute / caEstime) * 100 : 0;
        const objectifMarge = (caEstime * margeObjectif) / 100;
        const ecartMarge = margeBrute - objectifMarge;
        
        const ratioCoutCA = caEstime > 0 ? (coutTotal / caEstime) * 100 : 0;
        const productiviteHoraire = totalHeuresServices > 0 ? caEstime / totalHeuresServices : 0;

        return {
            // === DONNÉES DE BASE ===
            periode: periode,
            tauxCharges: tauxCharges,
            caEstime: caEstime,
            margeObjectif: margeObjectif,
            totalHeuresServices: totalHeuresServices,
            totalCoutEmployes: totalCoutEmployes,
            chargesSociales: chargesSociales,
            coutTotal: coutTotal,
            
            // === ANALYSES RH ===
            analyseCompetences: analyseCompetences,
            analyseNiveaux: analyseNiveaux,
            analyseContrats: analyseContrats,
            gestionConges: gestionConges,
            rotationEquipes: rotationEquipes,
            indicateursRH: indicateursRH,
            analyseRisques: analyseRisques,
            
            // === SCÉNARIOS ===
            scenarios: scenarios,
            
            // === INDICATEURS FINANCIERS ===
            coutHoraireMoyen: coutHoraireMoyen,
            margeBrute: margeBrute,
            margeBrutePourcentage: margeBrutePourcentage,
            objectifMarge: objectifMarge,
            ecartMarge: ecartMarge,
            ratioCoutCA: ratioCoutCA,
            productiviteHoraire: productiviteHoraire,
            
            // === ALERTES ===
            alertes: this.generateAdvancedRHAlertes(analyseCompetences, analyseRisques, indicateursRH, margeBrutePourcentage, ratioCoutCA)
        };
    }

    analyzeCompetences() {
        const competences = {};
        
        this.employes.forEach(employe => {
            if (employe.competences) {
                employe.competences.forEach(competence => {
                    if (!competences[competence]) {
                        competences[competence] = {
                            count: 0,
                            employes: [],
                            niveauMoyen: 0
                        };
                    }
                    competences[competence].count++;
                    competences[competence].employes.push(employe);
                    competences[competence].niveauMoyen += this.getNiveauValue(employe.niveau);
                });
            }
        });

        // Calculer les niveaux moyens
        Object.keys(competences).forEach(competence => {
            competences[competence].niveauMoyen = competences[competence].niveauMoyen / competences[competence].count;
        });

        return competences;
    }

    getNiveauValue(niveau) {
        const niveaux = {
            'Stagiaire': 1,
            'Employé': 2,
            'Chef d\'équipe': 3,
            'Chef de service': 4,
            'Manager': 5
        };
        return niveaux[niveau] || 2;
    }

    calculateGestionConges(periode) {
        const totalEmployes = this.employes.length;
        const joursCongesParEmploye = 25; // Congés payés
        const joursReposHebdo = 104; // 52 semaines * 2 jours
        const joursFeries = 11;
        
        const totalJoursConges = totalEmployes * joursCongesParEmploye;
        const totalJoursRepos = totalEmployes * joursReposHebdo;
        const totalJoursFeries = totalEmployes * joursFeries;
        
        const joursDisponibles = 365 * periode;
        const joursNonDisponibles = totalJoursConges + totalJoursRepos + totalJoursFeries;
        const tauxDisponibilite = ((joursDisponibles - joursNonDisponibles) / joursDisponibles) * 100;
        
        return {
            totalJoursConges: totalJoursConges,
            totalJoursRepos: totalJoursRepos,
            totalJoursFeries: totalJoursFeries,
            joursDisponibles: joursDisponibles,
            joursNonDisponibles: joursNonDisponibles,
            tauxDisponibilite: tauxDisponibilite,
            repartition: {
                congés: totalJoursConges,
                repos: totalJoursRepos,
                fériés: totalJoursFeries,
                travail: joursDisponibles - joursNonDisponibles
            }
        };
    }

    calculateRotationEquipes() {
        const rotation = {
            hauteSaison: {
                effectifNecessaire: 0,
                effectifDisponible: 0,
                tauxRotation: 0,
                flexibilite: 0
            },
            basseSaison: {
                effectifNecessaire: 0,
                effectifDisponible: 0,
                tauxRotation: 0,
                flexibilite: 0
            }
        };

        // Calculer les besoins par saison
        this.services.forEach(service => {
            const heuresHaute = this.calculateHeuresSemaine(service).haute;
            const heuresBasse = this.calculateHeuresSemaine(service).basse;
            
            rotation.hauteSaison.effectifNecessaire += Math.ceil(heuresHaute / 35);
            rotation.basseSaison.effectifNecessaire += Math.ceil(heuresBasse / 35);
        });

        // Calculer la disponibilité
        const employesFlexibles = this.employes.filter(emp => emp.disponibilite.heuresAnnuelContractuelles === 1820);
        const employesStandard = this.employes.filter(emp => emp.disponibilite.heuresAnnuelContractuelles === 2028);
        
        rotation.hauteSaison.effectifDisponible = this.employes.length;
        rotation.basseSaison.effectifDisponible = this.employes.length;
        
        // Calculer les taux de rotation
        rotation.hauteSaison.tauxRotation = rotation.hauteSaison.effectifNecessaire > 0 
            ? (rotation.hauteSaison.effectifDisponible / rotation.hauteSaison.effectifNecessaire) * 100 
            : 0;
        rotation.basseSaison.tauxRotation = rotation.basseSaison.effectifNecessaire > 0 
            ? (rotation.basseSaison.effectifDisponible / rotation.basseSaison.effectifNecessaire) * 100 
            : 0;
        
        // Calculer la flexibilité
        rotation.hauteSaison.flexibilite = (employesFlexibles.length / this.employes.length) * 100;
        rotation.basseSaison.flexibilite = (employesFlexibles.length / this.employes.length) * 100;

        return rotation;
    }

    calculateIndicateursRH(totalHeures, totalCout) {
        const totalEmployes = this.employes.length;
        const heuresParEmploye = totalHeures / totalEmployes;
        const coutParEmploye = totalCout / totalEmployes;
        const productiviteEmploye = totalHeures > 0 ? totalCout / totalHeures : 0;
        
        // Taux de turnover estimé (industrie hôtelière)
        const tauxTurnover = 25; // 25% par an
        
        // Coût de recrutement moyen
        const coutRecrutement = 3000; // € par recrutement
        const recrutementsAnnuels = Math.ceil(totalEmployes * (tauxTurnover / 100));
        const coutRecrutementTotal = recrutementsAnnuels * coutRecrutement;
        
        // Coût de formation
        const coutFormationParEmploye = 1500; // € par an
        const coutFormationTotal = totalEmployes * coutFormationParEmploye;
        
        // Indice de satisfaction estimé
        const satisfaction = this.calculateSatisfactionEmployes();
        
        return {
            totalEmployes: totalEmployes,
            heuresParEmploye: heuresParEmploye,
            coutParEmploye: coutParEmploye,
            productiviteEmploye: productiviteEmploye,
            tauxTurnover: tauxTurnover,
            coutRecrutementTotal: coutRecrutementTotal,
            coutFormationTotal: coutFormationTotal,
            satisfaction: satisfaction,
            coutRHTotal: totalCout + coutRecrutementTotal + coutFormationTotal
        };
    }

    calculateSatisfactionEmployes() {
        let satisfaction = 0;
        let facteurs = 0;
        
        // Facteur 1: Équilibre travail/vie
        const heuresMoyennes = this.employes.reduce((sum, emp) => sum + emp.disponibilite.heuresSemaineContractuelles, 0) / this.employes.length;
        const satisfactionEquilibre = heuresMoyennes <= 35 ? 90 : heuresMoyennes <= 39 ? 75 : 60;
        satisfaction += satisfactionEquilibre;
        facteurs++;
        
        // Facteur 2: Diversité des compétences
        const competences = this.analyzeCompetences();
        const diversiteCompetences = Object.keys(competences).length;
        const satisfactionDiversite = Math.min(90, diversiteCompetences * 15);
        satisfaction += satisfactionDiversite;
        facteurs++;
        
        // Facteur 3: Niveaux de responsabilité
        const niveaux = this.analyzeNiveaux(this.employes);
        const satisfactionNiveaux = niveaux.senior > 0 ? 85 : 60;
        satisfaction += satisfactionNiveaux;
        facteurs++;
        
        return satisfaction / facteurs;
    }

    generateRHScenarios(periode, tauxCharges, caEstime, margeObjectif) {
        const scenarios = [];
        
        // Scénario 1: Optimisation des coûts
        const scenarioOptimisation = {
            nom: "Optimisation des coûts",
            description: "Réduction des coûts RH de 15%",
            impact: {
                coutReduction: 0.15,
                productivite: 1.05,
                satisfaction: 0.95
            }
        };
        
        // Scénario 2: Amélioration de la productivité
        const scenarioProductivite = {
            nom: "Amélioration de la productivité",
            description: "Formation et optimisation des processus",
            impact: {
                coutReduction: 0.05,
                productivite: 1.20,
                satisfaction: 1.10
            }
        };
        
        // Scénario 3: Flexibilité maximale
        const scenarioFlexibilite = {
            nom: "Flexibilité maximale",
            description: "Plus d'employés 35h et rotation",
            impact: {
                coutReduction: 0.10,
                productivite: 1.15,
                satisfaction: 1.15
            }
        };
        
        // Calculer les impacts pour chaque scénario
        [scenarioOptimisation, scenarioProductivite, scenarioFlexibilite].forEach(scenario => {
            const coutBase = this.employes.reduce((total, emp) => {
                return total + (emp.salaireHoraire * emp.disponibilite.heuresAnnuelContractuelles * periode / 12);
            }, 0);
            
            const coutScenario = coutBase * (1 - scenario.impact.coutReduction);
            const chargesScenario = coutScenario * (tauxCharges / 100);
            const coutTotalScenario = coutScenario + chargesScenario;
            
            const margeScenario = caEstime - coutTotalScenario;
            const margePourcentageScenario = caEstime > 0 ? (margeScenario / caEstime) * 100 : 0;
            
            scenario.resultats = {
                coutReduction: scenario.impact.coutReduction * 100,
                margePourcentage: margePourcentageScenario,
                ecartObjectif: margePourcentageScenario - margeObjectif,
                economies: coutBase - coutScenario
            };
            
            scenarios.push(scenario);
        });
        
        return scenarios;
    }

    analyzeRisquesRH() {
        const risques = [];
        
        // Risque 1: Sous-effectif
        const totalHeures = this.services.reduce((total, service) => {
            const heuresSemaine = this.calculateHeuresSemaine(service);
            return total + heuresSemaine.haute + heuresSemaine.basse;
        }, 0);
        
        const effectifNecessaire = Math.ceil(totalHeures / 35);
        if (this.employes.length < effectifNecessaire) {
            risques.push({
                type: 'danger',
                niveau: 'Élevé',
                description: `Sous-effectif : ${this.employes.length}/${effectifNecessaire} employés`,
                impact: 'Risque de surcharge et turnover',
                recommandation: 'Recruter des employés supplémentaires'
            });
        }
        
        // Risque 2: Manque de seniors
        const niveaux = this.analyzeNiveaux(this.employes);
        if (niveaux.senior < 1 && this.employes.length > 2) {
            risques.push({
                type: 'warning',
                niveau: 'Moyen',
                description: 'Aucun employé senior',
                impact: 'Manque de supervision et expertise',
                recommandation: 'Promouvoir ou recruter des seniors'
            });
        }
        
        // Risque 3: Coût horaire élevé
        const coutHoraireMoyen = this.employes.reduce((sum, emp) => sum + emp.salaireHoraire, 0) / this.employes.length;
        if (coutHoraireMoyen > 25) {
            risques.push({
                type: 'warning',
                niveau: 'Moyen',
                description: `Coût horaire élevé : ${coutHoraireMoyen.toFixed(2)}€/h`,
                impact: 'Rentabilité compromise',
                recommandation: 'Optimiser la structure salariale'
            });
        }
        
        // Risque 4: Manque de flexibilité
        const employes35h = this.employes.filter(emp => emp.disponibilite.heuresAnnuelContractuelles === 1820);
        if (employes35h.length === 0) {
            risques.push({
                type: 'info',
                niveau: 'Faible',
                description: 'Aucun employé 35h',
                impact: 'Flexibilité limitée pour les pics',
                recommandation: 'Diversifier les contrats'
            });
        }
        
        return risques;
    }

    generateAdvancedRHAlertes(analyseCompetences, analyseRisques, indicateursRH, margePourcentage, ratioCoutCA) {
        const alertes = [];
        
        // Alertes basées sur les compétences
        Object.entries(analyseCompetences).forEach(([competence, data]) => {
            if (data.count === 1) {
                alertes.push({
                    type: 'warning',
                    message: `Compétence critique : ${competence}`,
                    details: `Seulement 1 employé maîtrise cette compétence`,
                    icon: 'fas fa-exclamation-triangle',
                    priorite: 'moyenne'
                });
            }
        });
        
        // Alertes basées sur les risques
        analyseRisques.forEach(risque => {
            alertes.push({
                type: risque.type,
                message: risque.description,
                details: risque.impact,
                icon: 'fas fa-shield-alt',
                priorite: risque.niveau === 'Élevé' ? 'haute' : risque.niveau === 'Moyen' ? 'moyenne' : 'basse'
            });
        });
        
        // Alertes basées sur les indicateurs RH
        if (indicateursRH.satisfaction < 70) {
            alertes.push({
                type: 'warning',
                message: 'Satisfaction employés faible',
                details: `${indicateursRH.satisfaction.toFixed(1)}% - Risque de turnover`,
                icon: 'fas fa-user-friends',
                priorite: 'moyenne'
            });
        }
        
        if (indicateursRH.tauxTurnover > 20) {
            alertes.push({
                type: 'danger',
                message: 'Taux de turnover élevé',
                details: `${indicateursRH.tauxTurnover}% - Coût de recrutement important`,
                icon: 'fas fa-user-times',
                priorite: 'haute'
            });
        }
        
        // Alertes financières
        if (margePourcentage < margeObjectif) {
            alertes.push({
                type: 'danger',
                message: 'Marge insuffisante',
                details: `${margePourcentage.toFixed(1)}% vs ${margeObjectif}% objectif`,
                icon: 'fas fa-chart-line',
                priorite: 'haute'
            });
        }
        
        if (ratioCoutCA > 60) {
            alertes.push({
                type: 'warning',
                message: 'Ratio coût/CA élevé',
                details: `${ratioCoutCA.toFixed(1)}% - Optimisation nécessaire`,
                icon: 'fas fa-euro-sign',
                priorite: 'moyenne'
            });
        }
        
        return alertes;
    }

    displayAdvancedRHResults(results) {
        const simulationResults = document.getElementById('simulation-results');
        if (!simulationResults) return;

        const periodeLabels = {
            1: '1 mois',
            3: '3 mois (trimestre)',
            6: '6 mois (semestre)',
            12: '12 mois (année)'
        };

        // Vérifier si les données proviennent d'un planning réel
        const isFromPlanning = results.planningData;
        const planningInfo = isFromPlanning ? `
            <div class="planning-info">
                <h5><i class="fas fa-calendar-check"></i> Données basées sur le planning réel</h5>
                <div class="planning-details">
                    <span><strong>Service :</strong> ${results.planningData.service?.name || 'N/A'}</span>
                    <span><strong>Employés :</strong> ${results.planningData.employes?.length || 0}</span>
                    <span><strong>Heures totales :</strong> ${results.totalHeuresServices.toLocaleString()}h</span>
                    <span><strong>Masse salariale :</strong> ${results.totalCoutEmployes.toLocaleString()}€</span>
                    <span><strong>Saison :</strong> ${results.planningData.saison || 'N/A'}</span>
                    <span><strong>Généré le :</strong> ${new Date(results.planningData.generatedAt || Date.now()).toLocaleDateString('fr-FR')}</span>
                </div>
            </div>
        ` : `
            <div class="planning-alert warning">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Attention : Cette simulation utilise des données estimées. Pour des résultats plus précis, générez d'abord un planning.</span>
            </div>
        `;

        simulationResults.innerHTML = `
            <div class="advanced-rh-analysis">
                <div class="analysis-header">
                    <h4><i class="fas fa-users-cog"></i> Analyse RH Avancée - ${periodeLabels[results.periode]}</h4>
                    ${planningInfo}
                    <div class="analysis-summary">
                        <div class="summary-item ${results.margeBrutePourcentage >= results.margeObjectif ? 'positive' : 'negative'}">
                            <span class="summary-label">Marge brute</span>
                            <span class="summary-value">${results.margeBrutePourcentage.toFixed(1)}%</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Effectif</span>
                            <span class="summary-value">${results.indicateursRH.totalEmployes}</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Satisfaction</span>
                            <span class="summary-value">${results.indicateursRH.satisfaction.toFixed(1)}%</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Coût/h</span>
                            <span class="summary-value">${results.coutHoraireMoyen.toFixed(2)}€</span>
                        </div>
                    </div>
                </div>

                <div class="rh-analysis-grid">
                    <!-- Analyse des compétences -->
                    <div class="rh-card competences">
                        <div class="card-header">
                            <i class="fas fa-brain"></i>
                            <h5>Analyse des compétences</h5>
                        </div>
                        <div class="card-content">
                            ${this.generateCompetencesHTML(results.analyseCompetences)}
                        </div>
                    </div>

                    <!-- Gestion des congés -->
                    <div class="rh-card conges">
                        <div class="card-header">
                            <i class="fas fa-calendar-alt"></i>
                            <h5>Gestion des congés</h5>
                        </div>
                        <div class="card-content">
                            <div class="conges-stats">
                                <div class="stat-item">
                                    <span class="stat-label">Taux disponibilité</span>
                                    <span class="stat-value">${results.gestionConges.tauxDisponibilite.toFixed(1)}%</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-label">Jours congés total</span>
                                    <span class="stat-value">${results.gestionConges.totalJoursConges}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Rotation des équipes -->
                    <div class="rh-card rotation">
                        <div class="card-header">
                            <i class="fas fa-sync-alt"></i>
                            <h5>Rotation des équipes</h5>
                        </div>
                        <div class="card-content">
                            ${this.generateRotationHTML(results.rotationEquipes)}
                        </div>
                    </div>

                    <!-- Indicateurs RH -->
                    <div class="rh-card indicateurs">
                        <div class="card-header">
                            <i class="fas fa-chart-bar"></i>
                            <h5>Indicateurs RH</h5>
                        </div>
                        <div class="card-content">
                            ${this.generateIndicateursHTML(results.indicateursRH)}
                        </div>
                    </div>

                    <!-- Scénarios -->
                    <div class="rh-card scenarios">
                        <div class="card-header">
                            <i class="fas fa-route"></i>
                            <h5>Scénarios d'optimisation</h5>
                        </div>
                        <div class="card-content">
                            ${this.generateScenariosHTML(results.scenarios)}
                        </div>
                    </div>

                    <!-- Analyse des risques -->
                    <div class="rh-card risques">
                        <div class="card-header">
                            <i class="fas fa-shield-alt"></i>
                            <h5>Analyse des risques</h5>
                        </div>
                        <div class="card-content">
                            ${this.generateRisquesHTML(results.analyseRisques)}
                        </div>
                    </div>
                </div>

                <!-- Alertes -->
                <div class="rh-alerts">
                    <h6><i class="fas fa-exclamation-triangle"></i> Alertes et recommandations</h6>
                    <div class="alerts-list">
                        ${results.alertes.map(alerte => `
                            <div class="alert-item ${alerte.type}">
                                <i class="${alerte.icon}"></i>
                                <div class="alert-content">
                                    <span class="alert-title">${alerte.message}</span>
                                    <span class="alert-details">${alerte.details}</span>
                                </div>
                                <span class="alert-priority ${alerte.priorite}">${alerte.priorite}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <!-- Actions recommandées -->
                <div class="rh-actions">
                    <button class="btn btn-primary" onclick="gestPrev.saveCurrentScenario()">
                        <i class="fas fa-save"></i> Sauvegarder ce scénario
                    </button>
                    <button class="btn btn-secondary" onclick="gestPrev.exportRHReport()">
                        <i class="fas fa-download"></i> Exporter le rapport
                    </button>
                    <button class="btn btn-outline-primary" onclick="gestPrev.generateOptimizationPlan()">
                        <i class="fas fa-magic"></i> Plan d'optimisation
                    </button>
                </div>
            </div>
        `;
    }

    generateCompetencesHTML(competences) {
        if (Object.keys(competences).length === 0) {
            return '<p class="no-data">Aucune compétence définie</p>';
        }

        return `
            <div class="competences-list">
                ${Object.entries(competences).map(([competence, data]) => `
                    <div class="competence-item">
                        <div class="competence-header">
                            <span class="competence-name">${competence}</span>
                            <span class="competence-count">${data.count} employé(s)</span>
                        </div>
                        <div class="competence-details">
                            <span class="niveau-moyen">Niveau moyen: ${data.niveauMoyen.toFixed(1)}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateRotationHTML(rotation) {
        return `
            <div class="rotation-stats">
                <div class="season-rotation">
                    <h6>Haute saison</h6>
                    <div class="rotation-metrics">
                        <span>Nécessaire: ${rotation.hauteSaison.effectifNecessaire}</span>
                        <span>Disponible: ${rotation.hauteSaison.effectifDisponible}</span>
                        <span class="taux-rotation">Taux: ${rotation.hauteSaison.tauxRotation.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="season-rotation">
                    <h6>Basse saison</h6>
                    <div class="rotation-metrics">
                        <span>Nécessaire: ${rotation.basseSaison.effectifNecessaire}</span>
                        <span>Disponible: ${rotation.basseSaison.effectifDisponible}</span>
                        <span class="taux-rotation">Taux: ${rotation.basseSaison.tauxRotation.toFixed(1)}%</span>
                    </div>
                </div>
            </div>
        `;
    }

    generateIndicateursHTML(indicateurs) {
        return `
            <div class="indicateurs-stats">
                <div class="stat-item">
                    <span class="stat-label">Heures/employé</span>
                    <span class="stat-value">${indicateurs.heuresParEmploye.toFixed(1)}h</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Coût/employé</span>
                    <span class="stat-value">${indicateurs.coutParEmploye.toLocaleString()}€</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Turnover</span>
                    <span class="stat-value">${indicateurs.tauxTurnover}%</span>
                </div>
                <div class="stat-item">
                    <span class="stat-label">Satisfaction</span>
                    <span class="stat-value">${indicateurs.satisfaction.toFixed(1)}%</span>
                </div>
            </div>
        `;
    }

    generateScenariosHTML(scenarios) {
        return `
            <div class="scenarios-list">
                ${scenarios.map(scenario => `
                    <div class="scenario-item">
                        <div class="scenario-header">
                            <h6>${scenario.nom}</h6>
                            <span class="scenario-impact">+${scenario.resultats.coutReduction.toFixed(1)}% économies</span>
                        </div>
                        <p class="scenario-description">${scenario.description}</p>
                        <div class="scenario-metrics">
                            <span class="metric">Marge: ${scenario.resultats.margePourcentage.toFixed(1)}%</span>
                            <span class="metric">Écart: ${scenario.resultats.ecartObjectif.toFixed(1)}%</span>
                            <span class="metric">Économies: ${scenario.resultats.economies.toLocaleString()}€</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    generateRisquesHTML(risques) {
        if (risques.length === 0) {
            return '<p class="no-data">Aucun risque identifié</p>';
        }

        return `
            <div class="risques-list">
                ${risques.map(risque => `
                    <div class="risque-item ${risque.type}">
                        <div class="risque-header">
                            <span class="risque-niveau">${risque.niveau}</span>
                            <span class="risque-description">${risque.description}</span>
                        </div>
                        <div class="risque-details">
                            <span class="risque-impact">Impact: ${risque.impact}</span>
                            <span class="risque-recommandation">Recommandation: ${risque.recommandation}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    exportRHReport() {
        // Fonction pour exporter le rapport RH
        this.showNotification('Fonction d\'export en cours de développement', 'info');
    }

    generateOptimizationPlan() {
        // Fonction pour générer un plan d'optimisation
        this.showNotification('Plan d\'optimisation en cours de génération', 'info');
    }

    // ===== EXPORT/IMPORT DE DONNÉES =====
    
    exportAllData() {
        try {
            const exportData = {
                version: '2.0.0',
                timestamp: new Date().toISOString(),
                services: this.services,
                employes: this.employes,
                planning: this.planning,
                scenarios: this.scenarios || [],
                simulations: this.simulations || [],
                currentPlanning: localStorage.getItem('currentPlanning')
            };
            
            const dataStr = JSON.stringify(exportData, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `gest-prev-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            this.showNotification('Export des données réussi', 'success');
        } catch (error) {
            console.error('❌ Erreur lors de l\'export:', error);
            this.showNotification('Erreur lors de l\'export des données', 'error');
        }
    }

    importData(file) {
        try {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const importData = JSON.parse(e.target.result);
                    
                    // Vérifier la version
                    if (importData.version && importData.version !== '2.0.0') {
                        this.showNotification('Version des données incompatible. Migration en cours...', 'warning');
                    }
                    
                    // Sauvegarder avant import
                    this.createBackup();
                    
                    // Importer les données
                    this.services = importData.services || [];
                    this.employes = importData.employes || [];
                    this.planning = importData.planning || [];
                    this.scenarios = importData.scenarios || [];
                    this.simulations = importData.simulations || [];
                    
                    if (importData.currentPlanning) {
                        localStorage.setItem('currentPlanning', importData.currentPlanning);
                    }
                    
                    // Sauvegarder les données importées
                    this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
                    
                    // Recharger l'interface
                    this.displayServices();
                    this.displayEmployes();
                    this.displayScenariosList();
                    
                    this.showNotification('Import des données réussi', 'success');
                } catch (error) {
                    console.error('❌ Erreur lors du parsing des données:', error);
                    this.showNotification('Format de fichier invalide', 'error');
                }
            };
            reader.readAsText(file);
        } catch (error) {
            console.error('❌ Erreur lors de l\'import:', error);
            this.showNotification('Erreur lors de l\'import des données', 'error');
        }
    }

    // ===== GESTION DES SAUVEGARDES =====
    
    showBackupManager() {
        const backupKeys = Object.keys(localStorage).filter(key => key.startsWith('gestPrevBackup_'));
        const backups = backupKeys.map(key => {
            try {
                const backupData = JSON.parse(localStorage.getItem(key));
                return {
                    key: key,
                    timestamp: backupData.timestamp,
                    date: new Date(backupData.timestamp).toLocaleString('fr-FR'),
                    services: backupData.services?.length || 0,
                    employes: backupData.employes?.length || 0
                };
            } catch (error) {
                return null;
            }
        }).filter(backup => backup !== null).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        const modal = document.createElement('div');
        modal.className = 'backup-manager-modal';
        modal.innerHTML = `
            <div class="backup-manager-content">
                <div class="backup-manager-header">
                    <h3><i class="fas fa-shield-alt"></i> Gestionnaire de sauvegardes</h3>
                    <button class="close-btn" onclick="this.closest('.backup-manager-modal').remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="backup-manager-body">
                    <div class="backup-actions">
                        <button class="btn btn-primary" onclick="gestPrev.exportAllData()">
                            <i class="fas fa-download"></i> Exporter toutes les données
                        </button>
                        <label class="btn btn-secondary">
                            <i class="fas fa-upload"></i> Importer des données
                            <input type="file" accept=".json" onchange="gestPrev.handleFileImport(event)" style="display: none;">
                        </label>
                        <button class="btn btn-warning" onclick="gestPrev.createBackup(); this.disabled = true; setTimeout(() => this.disabled = false, 2000);">
                            <i class="fas fa-save"></i> Créer une sauvegarde
                        </button>
                    </div>
                    <div class="backups-list">
                        <h4>Sauvegardes disponibles (${backups.length})</h4>
                        ${backups.length === 0 ? '<p>Aucune sauvegarde disponible</p>' : ''}
                        ${backups.map(backup => `
                            <div class="backup-item">
                                <div class="backup-info">
                                    <span class="backup-date">${backup.date}</span>
                                    <span class="backup-stats">
                                        ${backup.services} services, ${backup.employes} employés
                                    </span>
                                </div>
                                <div class="backup-actions">
                                    <button class="btn btn-sm btn-primary" onclick="gestPrev.restoreFromSpecificBackup('${backup.key}')">
                                        <i class="fas fa-undo"></i> Restaurer
                                    </button>
                                    <button class="btn btn-sm btn-danger" onclick="gestPrev.deleteBackup('${backup.key}')">
                                        <i class="fas fa-trash"></i> Supprimer
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (file) {
            this.importData(file);
        }
    }

    restoreFromSpecificBackup(backupKey) {
        try {
            const backupData = JSON.parse(localStorage.getItem(backupKey));
            if (backupData) {
                // Sauvegarder avant restauration
                this.createBackup();
                
                this.services = backupData.services || [];
                this.employes = backupData.employes || [];
                this.planning = backupData.planning || [];
                this.scenarios = backupData.scenarios || [];
                this.simulations = backupData.simulations || [];
                
                if (backupData.currentPlanning) {
                    localStorage.setItem('currentPlanning', backupData.currentPlanning);
                }
                
                this.saveToLocalStorage(); this.syncWithCloud().then(() => console.log(" Synchronisation cloud r�ussie\)).catch((error) => console.error(" Erreur synchronisation cloud:\, error));
                
                // Recharger l'interface
                this.displayServices();
                this.displayEmployes();
                this.displayScenariosList();
                
                this.showNotification('Restauration réussie depuis la sauvegarde', 'success');
                
                // Fermer le modal
                const modal = document.querySelector('.backup-manager-modal');
                if (modal) modal.remove();
            }
        } catch (error) {
            console.error('❌ Erreur lors de la restauration:', error);
            this.showNotification('Erreur lors de la restauration', 'error');
        }
    }

    deleteBackup(backupKey) {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette sauvegarde ?')) {
            localStorage.removeItem(backupKey);
            this.showNotification('Sauvegarde supprimée', 'success');
            this.showBackupManager(); // Recharger la liste
        }
    }

    // Fonction pour afficher les détails du planning dans la simulation RH
    displayPlanningDetailsInRH(planningData) {
        if (!planningData) return '';
        
        const { service, employes, saison, totalHeures, masseSalariale, planningAnnuel } = planningData;
        
        return `
            <div class="planning-data-card">
                <div class="planning-data-header">
                    <i class="fas fa-chart-line"></i>
                    <h6>Détails du planning utilisé</h6>
                </div>
                <div class="planning-data-grid">
                    <div class="planning-data-item">
                        <span class="planning-data-label">Service</span>
                        <span class="planning-data-value">${service?.name || 'N/A'}</span>
                    </div>
                    <div class="planning-data-item">
                        <span class="planning-data-label">Employés</span>
                        <span class="planning-data-value">${employes?.length || 0}</span>
                    </div>
                    <div class="planning-data-item">
                        <span class="planning-data-label">Saison</span>
                        <span class="planning-data-value">${saison || 'N/A'}</span>
                    </div>
                    <div class="planning-data-item">
                        <span class="planning-data-label">Heures totales</span>
                        <span class="planning-data-value">${totalHeures?.toLocaleString() || 0}h</span>
                    </div>
                    <div class="planning-data-item">
                        <span class="planning-data-label">Masse salariale</span>
                        <span class="planning-data-value">${masseSalariale?.toLocaleString() || 0}€</span>
                    </div>
                    <div class="planning-data-item">
                        <span class="planning-data-label">Coût/h moyen</span>
                        <span class="planning-data-value">${totalHeures > 0 ? (masseSalariale / totalHeures).toFixed(2) : 0}€</span>
                    </div>
                </div>
            </div>
        `;
    }

}

// Initialisation
const gestPrev = new GestPrev();

// ===== MÉTHODE GLOBALE POUR FORCE DÉCONNEXION =====
// Cette méthode peut être appelée depuis la console du navigateur
// Exemple: window.gestPrevApp.forceLogout()
window.gestPrevApp = {
    forceLogout: function() {
        console.log('🚨 Force déconnexion globale déclenchée...');
        if (window.gestPrev && typeof window.gestPrev.forceLogout === 'function') {
            window.gestPrev.forceLogout();
        } else {
            console.error('❌ Instance gestPrev non disponible');
            // Fallback: nettoyage manuel
            localStorage.clear();
            document.cookie.split(";").forEach(function(c) { 
                document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
            });
            window.location.reload(true);
        }
    },
    clearCache: function() {
        console.log('🧹 Nettoyage du cache...');
        if (window.gestPrev && typeof window.gestPrev.clearBrowserCache === 'function') {
            window.gestPrev.clearBrowserCache();
            window.gestPrev.reloadCSS();
        }
        window.location.reload(true);
    },
    forceDataSync: function() {
        console.log('🔄 Synchronisation forcée des données...');
        if (window.gestPrev && typeof window.gestPrev.forceDataSync === 'function') {
            window.gestPrev.forceDataSync();
        } else {
            console.error('❌ Instance gestPrev non disponible');
            // Fallback: rechargement manuel
            window.location.reload(true);
        }
    }
};

// Rendre l'instance accessible globalement
window.gestPrev = gestPrev;

document.addEventListener('DOMContentLoaded', () => {
    gestPrev.init();
});
