// ===== DATA-MANAGER.js - GESTIONNAIRE DE DONNÉES ISOLÉ =====
// Ce module gère uniquement les données, sans toucher à l'UI

console.log('💾 DATA-MANAGER.js - Initialisation du gestionnaire de données');

class DataManager {
    constructor() {
        this.services = [];
        this.employes = [];
        this.config = {};
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('💾 Initialisation du gestionnaire de données');
        this.loadFromLocalStorage();
        this.ensureDefaultData();
        this.isInitialized = true;
        
        // Émettre l'événement de données chargées
        if (window.eventManager) {
            window.eventManager.emit('DATA_LOADED', {
                services: this.services,
                employes: this.employes,
                config: this.config
            });
        }
    }

    loadFromLocalStorage() {
        try {
            const servicesData = localStorage.getItem('gestPrevServices');
            const employesData = localStorage.getItem('gestPrevEmployes');
            const configData = localStorage.getItem('gestPrevConfig');

            if (servicesData) {
                this.services = JSON.parse(servicesData);
                console.log('📋 Services chargés:', this.services.length);
            }

            if (employesData) {
                this.employes = JSON.parse(employesData);
                console.log('👥 Employés chargés:', this.employes.length);
            }

            if (configData) {
                this.config = JSON.parse(configData);
                console.log('⚙️ Configuration chargée');
            }

        } catch (error) {
            console.error('❌ Erreur lors du chargement:', error);
        }
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem('gestPrevServices', JSON.stringify(this.services));
            localStorage.setItem('gestPrevEmployes', JSON.stringify(this.employes));
            localStorage.setItem('gestPrevConfig', JSON.stringify(this.config));
            console.log('💾 Données sauvegardées');
        } catch (error) {
            console.error('❌ Erreur lors de la sauvegarde:', error);
        }
    }

    ensureDefaultData() {
        if (this.services.length === 0) {
            this.createDefaultServices();
        }
        
        if (this.employes.length === 0) {
            this.createDefaultEmployes();
        }
        
        if (Object.keys(this.config).length === 0) {
            this.createDefaultConfig();
        }
    }

    createDefaultServices() {
        this.services = [
            {
                id: 1,
                nom: 'Réception',
                categorie: 'Accueil',
                description: 'Service de réception et accueil des clients',
                horaires: {
                    lundi: { haute: '08:00-18:00', basse: '09:00-17:00' },
                    mardi: { haute: '08:00-18:00', basse: '09:00-17:00' },
                    mercredi: { haute: '08:00-18:00', basse: '09:00-17:00' },
                    jeudi: { haute: '08:00-18:00', basse: '09:00-17:00' },
                    vendredi: { haute: '08:00-18:00', basse: '09:00-17:00' },
                    samedi: { haute: '08:00-18:00', basse: '09:00-17:00' },
                    dimanche: { haute: '08:00-18:00', basse: '09:00-17:00' }
                }
            },
            {
                id: 2,
                nom: 'Restaurant',
                categorie: 'Restauration',
                description: 'Service de restauration',
                horaires: {
                    lundi: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' },
                    mardi: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' },
                    mercredi: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' },
                    jeudi: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' },
                    vendredi: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' },
                    samedi: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' },
                    dimanche: { haute: '12:00-14:00,19:00-22:00', basse: '12:00-14:00,19:00-21:00' }
                }
            },
            {
                id: 3,
                nom: 'Spa',
                categorie: 'Bien-être',
                description: 'Service de spa et bien-être',
                horaires: {
                    lundi: { haute: '10:00-19:00', basse: '10:00-18:00' },
                    mardi: { haute: '10:00-19:00', basse: '10:00-18:00' },
                    mercredi: { haute: '10:00-19:00', basse: '10:00-18:00' },
                    jeudi: { haute: '10:00-19:00', basse: '10:00-18:00' },
                    vendredi: { haute: '10:00-19:00', basse: '10:00-18:00' },
                    samedi: { haute: '10:00-19:00', basse: '10:00-18:00' },
                    dimanche: { haute: '10:00-19:00', basse: '10:00-18:00' }
                }
            }
        ];
        console.log('📋 Services par défaut créés');
    }

    createDefaultEmployes() {
        this.employes = [
            {
                id: 1,
                nom: 'Dupont',
                prenom: 'Marie',
                niveau: 'II',
                typeContrat: 'CDI',
                heuresSemaine: 39,
                modulation: 'Oui',
                heuresMoyenne: 39,
                heuresAnnuel: 2028,
                servicesAssignes: ['Réception'],
                coutHoraire: 15.50
            },
            {
                id: 2,
                nom: 'Martin',
                prenom: 'Pierre',
                niveau: 'III',
                typeContrat: 'CDI',
                heuresSemaine: 39,
                modulation: 'Oui',
                heuresMoyenne: 39,
                heuresAnnuel: 2028,
                servicesAssignes: ['Restaurant'],
                coutHoraire: 16.80
            },
            {
                id: 3,
                nom: 'Bernard',
                prenom: 'Sophie',
                niveau: 'I',
                typeContrat: 'CDI',
                heuresSemaine: 35,
                modulation: 'Non',
                heuresMoyenne: 35,
                heuresAnnuel: 1820,
                servicesAssignes: ['Spa'],
                coutHoraire: 14.20
            }
        ];
        console.log('👥 Employés par défaut créés');
    }

    createDefaultConfig() {
        this.config = {
            heuresSemaine: 39,
            heuresJour: 7.8,
            modulation: 'Oui',
            heuresAnnuel: 2028,
            maxHeuresSemaine: 44,
            minHeuresSemaine: 35,
            maxHeuresJour: 10,
            heuresSupplementaires: 0
        };
        console.log('⚙️ Configuration par défaut créée');
    }

    // Méthodes pour ajouter des données
    addService(service) {
        service.id = Date.now();
        this.services.push(service);
        this.saveToLocalStorage();
        
        if (window.eventManager) {
            window.eventManager.emit('SERVICE_ADDED', service);
        }
        
        return service;
    }

    addEmploye(employe) {
        employe.id = Date.now();
        this.employes.push(employe);
        this.saveToLocalStorage();
        
        if (window.eventManager) {
            window.eventManager.emit('EMPLOYE_ADDED', employe);
        }
        
        return employe;
    }

    // Méthodes pour supprimer des données
    deleteService(serviceId) {
        this.services = this.services.filter(service => service.id !== serviceId);
        this.saveToLocalStorage();
        
        if (window.eventManager) {
            window.eventManager.emit('SERVICE_DELETED', serviceId);
        }
        
        console.log('🗑️ Service supprimé:', serviceId);
    }

    deleteEmploye(employeId) {
        this.employes = this.employes.filter(employe => employe.id !== employeId);
        this.saveToLocalStorage();
        
        if (window.eventManager) {
            window.eventManager.emit('EMPLOYE_DELETED', employeId);
        }
        
        console.log('🗑️ Employé supprimé:', employeId);
    }

    // Méthodes pour récupérer des données
    getServices() {
        return [...this.services];
    }

    getEmployes() {
        return [...this.employes];
    }

    getConfig() {
        return { ...this.config };
    }

    // Méthodes pour mettre à jour des données
    updateService(serviceId, updatedService) {
        const index = this.services.findIndex(service => service.id === serviceId);
        if (index !== -1) {
            this.services[index] = { ...this.services[index], ...updatedService };
            this.saveToLocalStorage();
            
            if (window.eventManager) {
                window.eventManager.emit('SERVICE_UPDATED', this.services[index]);
            }
            
            console.log('✏️ Service mis à jour:', serviceId);
        }
    }

    updateEmploye(employeId, updatedEmploye) {
        const index = this.employes.findIndex(employe => employe.id === employeId);
        if (index !== -1) {
            this.employes[index] = { ...this.employes[index], ...updatedEmploye };
            this.saveToLocalStorage();
            
            if (window.eventManager) {
                window.eventManager.emit('EMPLOYE_UPDATED', this.employes[index]);
            }
            
            console.log('✏️ Employé mis à jour:', employeId);
        }
    }

    // Méthodes utilitaires
    getServiceById(serviceId) {
        return this.services.find(service => service.id === serviceId);
    }

    getEmployeById(employeId) {
        return this.employes.find(employe => employe.id === employeId);
    }

    getServicesByCategory(category) {
        return this.services.filter(service => service.categorie === category);
    }

    getEmployesByService(serviceName) {
        return this.employes.filter(employe => 
            employe.servicesAssignes.includes(serviceName)
        );
    }

    // Sauvegarde de sécurité
    createBackup() {
        const backup = {
            services: this.services,
            employes: this.employes,
            config: this.config,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('gestPrevBackup_' + Date.now(), JSON.stringify(backup));
        console.log('💾 Sauvegarde créée');
        
        return backup;
    }

    restoreFromBackup(backupData) {
        if (backupData.services) this.services = backupData.services;
        if (backupData.employes) this.employes = backupData.employes;
        if (backupData.config) this.config = backupData.config;
        
        this.saveToLocalStorage();
        
        if (window.eventManager) {
            window.eventManager.emit('DATA_RESTORED', backupData);
        }
        
        console.log('�� Données restaurées depuis la sauvegarde');
    }
}

// Instance globale
window.dataManager = new DataManager();

// Initialiser quand l'EventManager est prêt
if (window.eventManager) {
    window.eventManager.on('DOM_READY', () => {
        window.dataManager.init();
    });
} else {
    // Fallback si l'EventManager n'est pas disponible
    document.addEventListener('DOMContentLoaded', () => {
        window.dataManager.init();
    });
}

// Fonctions utilitaires globales
window.getServices = () => window.dataManager.getServices();
window.getEmployes = () => window.dataManager.getEmployes();
window.getConfig = () => window.dataManager.getConfig();
window.createBackup = () => window.dataManager.createBackup(); 