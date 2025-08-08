// ===== CORRECTION AUTHENTIFICATION - SUPPRESSION DES UTILISATEURS DE TEST =====
// Ce fichier supprime les utilisateurs de test pour permettre un accès libre au développement

document.addEventListener('DOMContentLoaded', function() {
    // Attendre que la classe GestPrev soit définie
    const checkGestPrev = setInterval(() => {
        if (window.gestPrev && window.gestPrev.constructor.name === 'GestPrev') {
            clearInterval(checkGestPrev);
            
            // Remplacer la méthode handleLogin par une version qui accepte n'importe quel identifiant/mot de passe
            window.gestPrev.handleLogin = function() {
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                // ACCÈS LIBRE POUR LE DÉVELOPPEMENT - Accepter n'importe quel identifiant/mot de passe
                if (username && password) {
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
                    
                    this.showNotification(`Connexion réussie ! Bienvenue ${username} dans GEST PREV.`, 'success');
                } else {
                    this.showNotification('Veuillez saisir un identifiant et un mot de passe.', 'error');
                    
                    // Vider le champ mot de passe en cas d'erreur
                    const passwordField = document.getElementById('password');
                    if (passwordField) passwordField.value = '';
                }
            };
            
            console.log('✅ Authentification libre activée - Accès ouvert pour le développement');
        }
    }, 100);
});
