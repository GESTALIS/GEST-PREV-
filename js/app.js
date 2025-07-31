class GestPrev {
    constructor() {
        this.services = [];
        this.employes = [];
        this.planning = [];
    }

    init() {
        this.loadFromLocalStorage();
        this.setupEventListeners();
        this.setupCheckboxHandlers();
        this.updateAllSelects();
        this.displayServices();
        this.displayEmployes();
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

    // ===== GESTION DES ÉVÉNEMENTS =====
    setupEventListeners() {
        // Formulaire d'ajout de service
        const serviceForm = document.getElementById('service-form');
        if (serviceForm) {
            serviceForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addService();
            });
        }

        // Formulaire d'ajout d'employé
        const employeForm = document.getElementById('employe-form');
        if (employeForm) {
            employeForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addEmploye();
            });
        }

        // Bouton de génération de planning
        const generatePlanningBtn = document.getElementById('generate-planning');
        if (generatePlanningBtn) {
            generatePlanningBtn.addEventListener('click', () => {
                this.generatePlanning();
            });
        }

        // Bouton de simulation
        const runSimulationBtn = document.getElementById('run-simulation');
        if (runSimulationBtn) {
            runSimulationBtn.addEventListener('click', () => {
                this.runSimulation();
            });
        }

        // Bouton de tableau de bord
        const generateDashboardBtn = document.getElementById('generate-dashboard');
        if (generateDashboardBtn) {
            generateDashboardBtn.addEventListener('click', () => {
                this.generateDashboard();
            });
        }

        // Navigation des modules
        const moduleButtons = document.querySelectorAll('.module-btn');
        moduleButtons.forEach(button => {
            button.addEventListener('click', () => {
                const module = button.dataset.module;
                this.switchModule(module);
            });
        });

        // Navigation des onglets
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const tab = button.dataset.tab;
                this.switchTab(tab);
            });
        });

        // Boutons d'affichage/masquage du formulaire de service
        const showServiceFormBtn = document.getElementById('show-service-form');
        if (showServiceFormBtn) {
            showServiceFormBtn.addEventListener('click', () => {
                this.showServiceForm();
            });
        }

        const cancelServiceFormBtn = document.getElementById('cancel-service-form');
        if (cancelServiceFormBtn) {
            cancelServiceFormBtn.addEventListener('click', () => {
                this.hideServiceForm();
            });
        }

        // Gestion des sélections multiples
        const multiSelects = document.querySelectorAll('select[multiple]');
        multiSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.updateCoverageStatus(select);
            });
        });
    }

    showServiceForm() {
        const form = document.getElementById('service-form');
        const showBtn = document.getElementById('show-service-form');
        if (form && showBtn) {
            form.style.display = 'block';
            showBtn.style.display = 'none';
            form.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    hideServiceForm() {
        const form = document.getElementById('service-form');
        const showBtn = document.getElementById('show-service-form');
        if (form && showBtn) {
            form.style.display = 'none';
            showBtn.style.display = 'inline-flex';
            form.reset();
            // Réinitialiser le bouton si on était en mode édition
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-plus"></i> Ajouter le service';
                delete submitBtn.dataset.editId;
            }
        }
    }

    // ===== GESTIONNAIRES DE CHECKBOXES =====
    setupCheckboxHandlers() {
        // Gestionnaires pour les checkboxes "Fermé"
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('ferme-checkbox')) {
                this.handleFermeCheckbox(e.target);
            }
        });

        // Gestionnaires pour les checkboxes "Même horaires que basse saison"
        document.addEventListener('change', (e) => {
            if (e.target.classList.contains('meme-basse-checkbox')) {
                this.handleMemeBasseCheckbox(e.target);
            }
        });
    }

    handleFermeCheckbox(checkbox) {
        const seasonHoursDay = checkbox.closest('.season-hours-day');
        const timeInputs = seasonHoursDay.querySelector('.time-inputs');
        const inputs = timeInputs.querySelectorAll('input[type="time"]');
        
        if (checkbox.checked) {
            // Désactiver et vider les champs de temps
            inputs.forEach(input => {
                input.disabled = true;
                input.value = '';
            });
            seasonHoursDay.classList.add('ferme');
        } else {
            // Réactiver les champs de temps
            inputs.forEach(input => {
                input.disabled = false;
            });
            seasonHoursDay.classList.remove('ferme');
        }
    }

    handleMemeBasseCheckbox(checkbox) {
        const seasonHoursDay = checkbox.closest('.season-hours-day');
        const dayCard = seasonHoursDay.closest('.day-hours-card');
        const basseSeason = dayCard.querySelector('.season-hours-day:last-child');
        const hauteSeason = dayCard.querySelector('.season-hours-day:first-child');
        
        if (checkbox.checked) {
            // Copier les horaires de la basse saison vers la haute saison
            const basseInputs = basseSeason.querySelectorAll('input[type="time"]');
            const hauteInputs = hauteSeason.querySelectorAll('input[type="time"]');
            
            basseInputs.forEach((input, index) => {
                if (input.value) {
                    hauteInputs[index].value = input.value;
                    hauteInputs[index].disabled = true;
                }
            });
            
            hauteSeason.classList.add('meme-basse');
        } else {
            // Réactiver les champs de la haute saison
            const hauteInputs = hauteSeason.querySelectorAll('input[type="time"]');
            hauteInputs.forEach(input => {
                input.disabled = false;
            });
            
            hauteSeason.classList.remove('meme-basse');
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
            const fermeHaute = formData.get(`${jour}-haute-ferme`) === 'on';
            const fermeBasse = formData.get(`${jour}-basse-ferme`) === 'on';
            const memeBasse = formData.get(`${jour}-haute-meme-basse`) === 'on';
            
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
                    fermeBasse: fermeBasse,
                    memeBasse: memeBasse
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
        form.reset();
        
        this.showNotification('Service ajouté avec succès !', 'success');
    }

    deleteService(serviceId) {
        this.services = this.services.filter(service => service.id !== serviceId);
        this.saveToLocalStorage();
        this.updateAllSelects();
        this.displayServices();
        this.showNotification('Service supprimé', 'info');
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
            
            // Remplir les checkboxes
            if (horaires.fermeHaute) {
                form.querySelector(`[name="${jour}-haute-ferme"]`).checked = true;
            }
            if (horaires.fermeBasse) {
                form.querySelector(`[name="${jour}-basse-ferme"]`).checked = true;
            }
            if (horaires.memeBasse) {
                form.querySelector(`[name="${jour}-haute-meme-basse"]`).checked = true;
            }
        });

        // Changer le bouton pour indiquer qu'on modifie
        const submitBtn = form.querySelector('button[type="submit"]');
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Modifier le service';
        submitBtn.dataset.editId = serviceId;
        
        // Afficher le formulaire
        this.showServiceForm();
        
        this.showNotification('Service chargé pour modification', 'info');
    }

    updateService(serviceId) {
        const form = document.getElementById('service-form');
        const formData = new FormData(form);
        
        const serviceName = formData.get('service-name');
        const serviceCategory = formData.get('service-category');
        
        // Récupération des horaires jour par jour (même logique que addService)
        const horairesParJour = {};
        const jours = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
        
        jours.forEach(jour => {
            const ouvertureHaute = formData.get(`${jour}-haute-ouverture`);
            const fermetureHaute = formData.get(`${jour}-haute-fermeture`);
            const ouvertureBasse = formData.get(`${jour}-basse-ouverture`);
            const fermetureBasse = formData.get(`${jour}-basse-fermeture`);
            const fermeHaute = formData.get(`${jour}-haute-ferme`) === 'on';
            const fermeBasse = formData.get(`${jour}-basse-ferme`) === 'on';
            const memeBasse = formData.get(`${jour}-haute-meme-basse`) === 'on';
            
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
                    fermeBasse: fermeBasse,
                    memeBasse: memeBasse
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
        
        return Object.entries(horairesParJour).map(([jour, horaires]) => {
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

    // ===== GESTION DES EMPLOYÉS =====
    addEmploye() {
        const form = document.getElementById('employe-form');
        const formData = new FormData(form);

        const employe = {
            id: this.generateId(),
            nom: formData.get('employe-nom'),
            quota: parseInt(formData.get('employe-quota')),
            taux: parseFloat(formData.get('employe-taux')),
            categorie: formData.get('employe-categorie'),
            echelon: formData.get('employe-echelon'),
            niveau: formData.get('employe-niveau'),
            services: Array.from(form.querySelector('#employe-services').selectedOptions).map(option => option.value),
            createdAt: new Date().toISOString()
        };

        if (!employe.nom || !employe.categorie || !employe.echelon || !employe.niveau) {
            this.showNotification('Veuillez remplir tous les champs obligatoires', 'error');
            return;
        }

        this.employes.push(employe);
        this.saveToLocalStorage();
        this.updateAllSelects();
        this.displayEmployes();
        form.reset();
        
        this.showNotification('Employé ajouté avec succès !', 'success');
    }

    deleteEmploye(employeId) {
        this.employes = this.employes.filter(employe => employe.id !== employeId);
        this.saveToLocalStorage();
        this.updateAllSelects();
        this.displayEmployes();
        this.showNotification('Employé supprimé', 'info');
    }

    displayEmployes() {
        const employesList = document.getElementById('employes-list');
        if (!employesList) return;

        if (this.employes.length === 0) {
            employesList.innerHTML = '<div class="empty-state"><p>Aucun employé configuré</p></div>';
            return;
        }

        employesList.innerHTML = this.employes.map(employe => {
            const servicesLabels = employe.services.map(serviceId => {
                const service = this.services.find(s => s.id === serviceId);
                return service ? service.name : 'Service inconnu';
            }).join(', ');

            return `
                <div class="employe-item" data-employe-id="${employe.id}">
                        <div class="employe-header">
                        <div class="employe-info">
                            <h4>${employe.nom}</h4>
                            <span class="employe-category">${employe.categorie} - Éch. ${employe.echelon}</span>
                        </div>
                        <div class="employe-actions">
                            <button class="delete-btn" onclick="gestPrev.deleteEmploye('${employe.id}')">
                                <i class="fas fa-trash"></i> Supprimer
                            </button>
                            </div>
                            </div>
                    <div class="employe-details">
                        <div class="employe-stats">
                            <span><strong>Quota:</strong> ${employe.quota}h/semaine</span>
                            <span><strong>Taux:</strong> ${employe.taux}€/h</span>
                            <span><strong>Niveau:</strong> ${employe.niveau}</span>
                            </div>
                        <div class="employe-services">
                            <strong>Services:</strong> ${servicesLabels || 'Aucun service assigné'}
                            </div>
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

    // ===== GESTION DU PLANNING =====
    generatePlanning() {
        const serviceId = document.getElementById('planning-service').value;
        const saison = document.getElementById('planning-saison').value;
        const employeId = document.getElementById('planning-test-quota').value;
        const couverture = parseInt(document.getElementById('planning-coverage').value);

        if (!serviceId || !saison) {
            this.showNotification('Veuillez sélectionner un service et une saison', 'error');
            return;
        }

        const service = this.services.find(s => s.id === serviceId);
        if (!service) {
            this.showNotification('Service non trouvé', 'error');
            return;
        }

        const planning = this.createPlanning(service, saison);
        this.displayPlanning(planning);
        
        this.showNotification('Planning généré avec succès !', 'success');
    }

    createPlanning(service, saison) {
        const planning = {
            service: service.name,
            saison: saison,
            jours: []
        };

        Object.entries(service.horairesParJour).forEach(([jour, horaires]) => {
            const horairesSaison = horaires[saison];
            if (horairesSaison) {
                planning.jours.push({
                    jour: jour,
                    ouverture: horairesSaison.ouverture,
                    fermeture: horairesSaison.fermeture,
                    duree: this.calculateDuree(horairesSaison.ouverture, horairesSaison.fermeture)
                });
            }
        });

        return planning;
    }

    displayPlanning(planning) {
        const planningResults = document.getElementById('planning-results');
        if (!planningResults) return;

        const totalHeures = planning.jours.reduce((total, jour) => total + jour.duree, 0);

        planningResults.innerHTML = `
            <div class="planning-summary">
                <h4>Planning - ${planning.service} (${planning.saison === 'haute' ? 'Haute' : 'Basse'} saison)</h4>
                <p><strong>Total heures par semaine:</strong> ${totalHeures}h</p>
                </div>
            <div class="planning-details">
                        ${planning.jours.map(jour => `
                    <div class="planning-jour">
                        <strong>${jour.jour.charAt(0).toUpperCase() + jour.jour.slice(1)}</strong>
                        <span>${jour.ouverture} - ${jour.fermeture}</span>
                        <span class="duree">(${jour.duree}h)</span>
                    </div>
                        `).join('')}
            </div>
        `;
    }

    updateCoverageStatus(select) {
        const selectedOptions = Array.from(select.selectedOptions);
        const coverageInput = document.getElementById('planning-coverage');
        
        if (coverageInput && selectedOptions.length > 0) {
            coverageInput.value = Math.max(1, Math.min(10, selectedOptions.length));
        }
    }

    // ===== SIMULATION =====
    runSimulation() {
        const periode = parseInt(document.getElementById('simulation-periode').value);
        const tauxCharges = parseFloat(document.getElementById('simulation-taux-charges').value);

        if (!periode || !tauxCharges) {
            this.showNotification('Veuillez remplir tous les champs', 'error');
            return;
        }
        
        const results = this.calculateAdvancedSimulation(periode, tauxCharges);
        this.displayAdvancedSimulationResults(results);
        
        this.showNotification('Simulation terminée !', 'success');
    }

    calculateAdvancedSimulation(periode, tauxCharges) {
        const totalHeuresServices = this.services.reduce((total, service) => {
            const heuresSemaine = this.calculateHeuresSemaine(service);
            return total + heuresSemaine.haute + heuresSemaine.basse;
        }, 0);

        const totalCoutEmployes = this.employes.reduce((total, employe) => {
            return total + (employe.quota * employe.taux * 4.33 * periode); // 4.33 semaines par mois
        }, 0);

        const chargesSociales = totalCoutEmployes * (tauxCharges / 100);
        const coutTotal = totalCoutEmployes + chargesSociales;
        const coutHoraireMoyen = totalHeuresServices > 0 ? coutTotal / totalHeuresServices : 0;

        return {
            periode: periode,
            tauxCharges: tauxCharges,
            totalHeuresServices: totalHeuresServices,
            totalCoutEmployes: totalCoutEmployes,
            chargesSociales: chargesSociales,
            coutTotal: coutTotal,
            coutHoraireMoyen: coutHoraireMoyen,
            alertes: this.generateAlertes(totalHeuresServices, totalCoutEmployes, coutHoraireMoyen)
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

    displayAdvancedSimulationResults(results) {
        const simulationResults = document.getElementById('simulation-results');
        if (!simulationResults) return;

        simulationResults.innerHTML = `
            <div class="simulation-summary">
                <h4>Simulation sur ${results.periode} mois</h4>
                <div class="simulation-stats">
                    <div class="stat-item">
                        <strong>Total heures services:</strong> ${results.totalHeuresServices}h
                    </div>
                    <div class="stat-item">
                        <strong>Coût employés:</strong> ${results.totalCoutEmployes.toFixed(2)}€
                </div>
                    <div class="stat-item">
                        <strong>Charges sociales:</strong> ${results.chargesSociales.toFixed(2)}€
                    </div>
                    <div class="stat-item">
                        <strong>Coût total:</strong> ${results.coutTotal.toFixed(2)}€
                </div>
                    <div class="stat-item">
                        <strong>Coût horaire moyen:</strong> ${results.coutHoraireMoyen.toFixed(2)}€/h
                </div>
            </div>
            ${results.alertes.length > 0 ? `
                    <div class="simulation-alertes">
                        <h5>Alertes:</h5>
                        ${results.alertes.map(alerte => `<div class="alerte">${alerte}</div>`).join('')}
                </div>
            ` : ''}
            </div>
        `;
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
        
        this.showNotification('Tableau de bord généré !', 'success');
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
    }
}

// Initialisation
const gestPrev = new GestPrev();
document.addEventListener('DOMContentLoaded', () => {
    gestPrev.init();
}); 