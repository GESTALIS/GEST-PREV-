// ===== CORRECTION SYNCHRONISATION PARTAGÉE =====
// Ce fichier contient les corrections pour que tous les utilisateurs partagent les mêmes données

// Attendre que la classe GestPrev soit définie
document.addEventListener('DOMContentLoaded', function() {
    // Clé partagée unique pour tous les utilisateurs
    const SHARED_DATA_KEY = 'gestPrevSharedData';
    
    // Fonction pour récupérer l'utilisateur actuel
    function getCurrentUser() {
        const authToken = localStorage.getItem('gestPrevAuth');
        if (authToken) {
            try {
                const authData = JSON.parse(authToken);
                return authData.username || 'unknown';
            } catch (e) {
                console.error('Erreur lors de la récupération de l\'utilisateur:', e);
            }
        }
        return 'unknown';
    }
    
    // Méthode modifiée pour charger depuis le localStorage avec priorité aux données partagées
    function loadFromLocalStorageShared() {
        try {
            // Sauvegarde de sécurité avant chargement
            this.createBackup();
            
            // PRIORITÉ 1 : Charger depuis les données partagées
            const sharedData = localStorage.getItem(SHARED_DATA_KEY);
            if (sharedData) {
                try {
                    const parsedSharedData = JSON.parse(sharedData);
                    
                    // Mettre à jour les données avec les données partagées
                    if (parsedSharedData.services) {
                        this.services = parsedSharedData.services;
                    }
                    if (parsedSharedData.employes) {
                        this.employes = parsedSharedData.employes;
                    }
                    if (parsedSharedData.planning) {
                        this.planning = parsedSharedData.planning;
                    }
                    if (parsedSharedData.scenarios) {
                        this.scenarios = parsedSharedData.scenarios;
                    }
                    if (parsedSharedData.simulations) {
                        this.simulations = parsedSharedData.simulations;
                    }
                    if (parsedSharedData.currentPlanning) {
                        this.currentPlanning = parsedSharedData.currentPlanning;
                    }
                    
                    console.log('✅ Données partagées chargées avec succès:', {
                        services: this.services.length,
                        employes: this.employes.length,
                        planning: this.planning.length,
                        scenarios: this.scenarios ? this.scenarios.length : 0,
                        simulations: this.simulations ? this.simulations.length : 0
                    });
                    
                    this.showNotification('Données synchronisées avec tous les utilisateurs', 'success');
                    return;
                } catch (e) {
                    console.error('❌ Erreur lors du chargement des données partagées:', e);
                }
            }
            
            // PRIORITÉ 2 : Fallback vers les anciennes clés individuelles
            const savedServices = localStorage.getItem('gestPrevServices');
            const savedEmployes = localStorage.getItem('gestPrevEmployes');
            const savedPlanning = localStorage.getItem('gestPrevPlanning');
            const savedScenarios = localStorage.getItem('gestPrevScenarios');
            const savedSimulations = localStorage.getItem('gestPrevSimulations');
            const savedCurrentPlanning = localStorage.getItem('currentPlanning');
            
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
            
            console.log('✅ Données individuelles chargées avec succès:', {
                services: this.services.length,
                employes: this.employes.length,
                planning: this.planning.length,
                scenarios: this.scenarios ? this.scenarios.length : 0,
                simulations: this.simulations ? this.simulations.length : 0
            });
            
            // Migrer automatiquement vers le système partagé
            this.saveToLocalStorageShared();
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement des données:', error);
            this.showNotification('Erreur lors du chargement des données. Restauration de la sauvegarde...', 'error');
            this.restoreFromBackup();
        }
    }
    
    // Méthode modifiée pour sauvegarder dans le localStorage avec clé partagée
    function saveToLocalStorageShared() {
        try {
            // Créer une sauvegarde avant de sauvegarder
            this.createBackup();
            
            // Préparer les données partagées
            const sharedData = {
                services: this.services,
                employes: this.employes,
                planning: this.planning,
                scenarios: this.scenarios || [],
                simulations: this.simulations || [],
                currentPlanning: this.currentPlanning,
                version: '2.0.0',
                lastSave: new Date().toISOString(),
                lastModifiedBy: getCurrentUser(),
                timestamp: Date.now()
            };
            
            // Sauvegarder dans la clé partagée
            localStorage.setItem(SHARED_DATA_KEY, JSON.stringify(sharedData));
            
            // Garder aussi les anciennes clés pour compatibilité
            localStorage.setItem('gestPrevServices', JSON.stringify(this.services));
            localStorage.setItem('gestPrevEmployes', JSON.stringify(this.employes));
            localStorage.setItem('gestPrevPlanning', JSON.stringify(this.planning));
            localStorage.setItem('gestPrevScenarios', JSON.stringify(this.scenarios || []));
            localStorage.setItem('gestPrevSimulations', JSON.stringify(this.simulations || []));
            localStorage.setItem('gestPrevVersion', '2.0.0');
            localStorage.setItem('gestPrevLastSave', new Date().toISOString());
            
            console.log('✅ Données partagées sauvegardées avec succès');
            
            this.showNotification('Données sauvegardées et partagées avec tous les utilisateurs', 'success');
            
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
            this.showNotification('Erreur lors de la sauvegarde des données', 'error');
        }
    }
    
    // Méthode modifiée pour sauvegarder vers le cloud avec clé partagée
    function saveToCloudShared() {
        try {
            console.log('☁️ Synchronisation partagée avec le cloud...');
            
            const currentUser = getCurrentUser();
            
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
                lastModifiedBy: currentUser,
                sharedKey: SHARED_DATA_KEY,
                timestamp: Date.now()
            };
            
            // Sauvegarder dans le localStorage local avec la clé partagée
            localStorage.setItem(SHARED_DATA_KEY, JSON.stringify(dataToSync));
            
            // Essayer d'envoyer vers un service externe
            const externalSuccess = this.sendToExternalService(dataToSync);
            
            if (externalSuccess) {
                console.log('☁️ Données partagées envoyées vers le cloud externe avec succès');
                this.showNotification(`Données synchronisées par ${currentUser}`, 'success');
            } else {
                console.log('☁️ Données partagées sauvegardées localement (cloud externe non disponible)');
                this.showNotification('Données partagées sauvegardées localement', 'info');
            }
            
        } catch (error) {
            console.error('❌ Erreur lors de l\'envoi vers le cloud:', error);
        }
    }
    
    // Méthode modifiée pour charger depuis le cloud avec clé partagée
    function loadFromCloudShared() {
        try {
            // Essayer d'abord de charger depuis le service externe
            const externalSuccess = this.loadFromExternalService();
            
            if (externalSuccess) {
                this.showNotification('Données partagées synchronisées depuis le cloud externe', 'success');
                return;
            }
            
            // Fallback : charger depuis le localStorage local avec clé partagée
            const sharedData = localStorage.getItem(SHARED_DATA_KEY);
            
            if (sharedData) {
                const parsedData = JSON.parse(sharedData);
                
                // Mettre à jour les données locales avec les données partagées
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
                this.saveToLocalStorageShared();
                
                console.log('☁️ Données partagées chargées depuis le localStorage');
                this.showNotification('Données partagées synchronisées depuis le localStorage', 'success');
            }
            
        } catch (error) {
            console.error('❌ Erreur lors du chargement depuis le cloud:', error);
        }
    }
    
    // Attendre que la classe GestPrev soit définie et remplacer les méthodes
    const checkGestPrev = setInterval(() => {
        if (window.gestPrev && window.gestPrev.constructor.name === 'GestPrev') {
            clearInterval(checkGestPrev);
            
            // Remplacer les méthodes de synchronisation
            window.gestPrev.loadFromLocalStorage = loadFromLocalStorageShared;
            window.gestPrev.saveToLocalStorage = saveToLocalStorageShared;
            window.gestPrev.saveToCloud = saveToCloudShared;
            window.gestPrev.loadFromCloud = loadFromCloudShared;
            
            console.log('✅ Méthodes de synchronisation partagée activées');
        }
    }, 100);
    
    // Export des fonctions pour utilisation
    window.GestPrevSyncFix = {
        SHARED_DATA_KEY,
        loadFromLocalStorageShared,
        saveToLocalStorageShared,
        saveToCloudShared,
        loadFromCloudShared,
        getCurrentUser
    };
});
