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
        
        // Charger les données
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
        
        this.showNotification('Application GEST PREV chargée avec succès !', 'success');
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
                    
                    // Masquer l'overlay d'authentification
                    const authOverlay = document.getElementById('auth-overlay');
                    if (authOverlay) {
                        authOverlay.style.display = 'none';
                        authOverlay.style.visibility = 'hidden';
                        authOverlay.style.opacity = '0';
                        authOverlay.style.zIndex = '-1';
                        authOverlay.style.pointerEvents = 'none';
                    }
                    
                    // Afficher le contenu principal
                    const mainHeader = document.querySelector('.main-header');
                    const moduleBanner = document.querySelector('.module-banner');
                    const mainContent = document.querySelector('.main-content');
                    
                    if (mainHeader) {
                        mainHeader.style.display = 'block';
                        mainHeader.style.visibility = 'visible';
                        mainHeader.style.opacity = '1';
                    }
                    if (moduleBanner) {
                        moduleBanner.style.display = 'block';
                        moduleBanner.style.visibility = 'visible';
                        moduleBanner.style.opacity = '1';
                    }
                    if (mainContent) {
                        mainContent.style.display = 'block';
                        mainContent.style.visibility = 'visible';
                        mainContent.style.opacity = '1';
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
            
            // Masquer l'overlay d'authentification de manière forcée
            const authOverlay = document.getElementById('auth-overlay');
            if (authOverlay) {
                authOverlay.style.display = 'none';
                authOverlay.style.visibility = 'hidden';
                authOverlay.style.opacity = '0';
                authOverlay.style.zIndex = '-1';
                authOverlay.style.pointerEvents = 'none';
            }
            
            // Afficher le contenu principal de manière forcée
            const mainHeader = document.querySelector('.main-header');
            const moduleBanner = document.querySelector('.module-banner');
            const mainContent = document.querySelector('.main-content');
            
            if (mainHeader) {
                mainHeader.style.display = 'block';
                mainHeader.style.visibility = 'visible';
                mainHeader.style.opacity = '1';
            }
            if (moduleBanner) {
                moduleBanner.style.display = 'block';
                moduleBanner.style.visibility = 'visible';
                moduleBanner.style.opacity = '1';
            }
            if (mainContent) {
                mainContent.style.display = 'block';
                mainContent.style.visibility = 'visible';
                mainContent.style.opacity = '1';
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

    // Méthodes de base nécessaires
    loadFromLocalStorage() {
        try {
            const savedServices = localStorage.getItem('gestPrevServices');
            const savedEmployes = localStorage.getItem('gestPrevEmployes');
            const savedPlanning = localStorage.getItem('gestPrevPlanning');
            
            if (savedServices) {
                this.services = JSON.parse(savedServices);
            }
            if (savedEmployes) {
                this.employes = JSON.parse(savedEmployes);
            }
            if (savedPlanning) {
                this.planning = JSON.parse(savedPlanning);
            }
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('gestPrevServices', JSON.stringify(this.services));
            localStorage.setItem('gestPrevEmployes', JSON.stringify(this.employes));
            localStorage.setItem('gestPrevPlanning', JSON.stringify(this.planning));
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
        }
    }

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
                services: ['service-1'],
                createdAt: new Date().toISOString()
            }
        ];

        // Sauvegarder les données de test
        this.saveToLocalStorage();
    }

    ensureDefaultConfiguration() {
        // Configuration par défaut
        const config = {
            defaultModule: 'rh',
            defaultSection: 'rh-presentation',
            defaultTab: 'rh-presentation',
            timestamp: Date.now()
        };
        localStorage.setItem('gestPrevConfig', JSON.stringify(config));
    }

    setupEventListeners() {
        console.log('🔧 Configuration des event listeners...');
    }

    setupCheckboxHandlers() {
        console.log('🔧 Configuration des checkbox handlers...');
    }

    updateAllSelects() {
        console.log('🔧 Mise à jour des selects...');
    }

    displayServices() {
        console.log('🔧 Affichage des services...');
    }

    displayEmployes() {
        console.log('🔧 Affichage des employés...');
    }

    initializePlanningDisplay() {
        console.log('🔧 Initialisation de l\'affichage du planning...');
    }

    showNotification(message, type = 'info') {
        console.log(`📢 ${type.toUpperCase()}: ${message}`);
        // Ici vous pouvez ajouter l'affichage des notifications
    }
}

// Initialisation de l'application
const gestPrev = new GestPrev();
document.addEventListener('DOMContentLoaded', () => {
    gestPrev.init();
});
