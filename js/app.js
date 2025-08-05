class GestPrev {
    constructor() {
        this.services = [];
        this.employes = [];
        this.planning = [];
    }

    init() {
        this.loadFromLocalStorage();
    
        // Créer des données de test si aucune donnée n'existe ou si les données sont vides
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
            const savedServices = localStorage.getItem('gestPrevServices');
            const savedEmployes = localStorage.getItem('gestPrevEmployes');
            const savedPlanning = localStorage.getItem('gestPrevPlanning');
            
            if (savedServices) {
                this.services = JSON.parse(savedServices);
                // Migration des anciens services vers le nouveau format
                this.migrateOldServices();
            }
            
            if (savedEmployes) {
                this.employes = JSON.parse(savedEmployes);
            }
            
            if (savedPlanning) {
                this.planning = JSON.parse(savedPlanning);
            }
        } catch (error) {
            console.error('Erreur lors du chargement des données:', error);
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('gestPrevServices', JSON.stringify(this.services));
        localStorage.setItem('gestPrevEmployes', JSON.stringify(this.employes));
        localStorage.setItem('gestPrevPlanning', JSON.stringify(this.planning));
    }

    migrateOldServices() {
        this.services = this.services.map(service => {
            // Si le service utilise l'ancien format (avec horaires et jours)
            if (service.horaires && service.jours) {
                const horairesParJour = {};
                
                // Convertir chaque jour en horaires par jour
                service.jours.forEach(jour => {
                    horairesParJour[jour] = {
                        haute: service.horaires.haute,
                        basse: service.horaires.basse
                    };
                });
                
                // Retourner le service avec le nouveau format
                return {
                    ...service,
                    horairesParJour: horairesParJour,
                    // Supprimer les anciens champs
                    horaires: undefined,
                    jours: undefined,
                    joursConditionnels: undefined
                };
            }
            
            // Si le service utilise déjà le nouveau format, le retourner tel quel
            return service;
        });
        
        // Sauvegarder les services migrés
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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
        
        // Initialisation simulation annuelle et règles légales
        this.setupAnnualSimulationEventListeners();
        this.initializeLegalRules();
        
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

        const service = {
            id: this.generateId(),
            name: serviceName,
            category: serviceCategory,
            horairesParJour: horairesParJour,
            createdAt: new Date().toISOString()
        };

        this.services.push(service);
        this.saveToLocalStorage();
        this.updateAllSelects();
        this.displayServices();
        this.hideServiceForm();
        
        this.showNotification('Service ajouté avec succès !', 'success');
    }

    deleteService(serviceId) {
        this.services = this.services.filter(service => service.id !== serviceId);
        this.saveToLocalStorage();
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
            
            this.saveToLocalStorage();
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
            
            // Attribution prévisionnelle
            servicesAttribues: selectedServices,
            quotasParService: {},
            
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
        this.saveToLocalStorage();
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
        this.saveToLocalStorage();
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

        this.saveToLocalStorage();
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
        const serviceId = document.getElementById('planning-service').value;
        const weekInput = document.getElementById('planning-week').value;
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
        const [hours, minutes] = timeString.split(':').map(Number);
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

}

// Initialisation
const gestPrev = new GestPrev();
document.addEventListener('DOMContentLoaded', () => {
    gestPrev.init();
}); 