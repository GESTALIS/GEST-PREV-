// ===== UI-MANAGER.js - GESTIONNAIRE D'INTERFACE ISOLÉ =====
// Ce module gère uniquement l'affichage, sans logique métier

console.log('🎨 UI-MANAGER.js - Initialisation du gestionnaire d\'interface');

class UIManager {
    constructor() {
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🎨 Initialisation du gestionnaire d\'interface');
        this.setupEventListeners();
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Écouter les événements de données
        if (window.eventManager) {
            window.eventManager.on('DATA_LOADED', (data) => {
                this.displayServices(data.services);
                this.displayEmployes(data.employes);
            });

            window.eventManager.on('UPDATE_SERVICES_LIST', () => {
                if (window.dataManager) {
                    const services = window.dataManager.getServices();
                    this.displayServices(services);
                }
            });

            window.eventManager.on('UPDATE_EMPLOYES_LIST', () => {
                if (window.dataManager) {
                    const employes = window.dataManager.getEmployes();
                    this.displayEmployes(employes);
                }
            });

            window.eventManager.on('SERVICE_ADDED', (service) => {
                this.addServiceToDisplay(service);
            });

            window.eventManager.on('EMPLOYE_ADDED', (employe) => {
                this.addEmployeToDisplay(employe);
            });

            window.eventManager.on('SERVICE_DELETED', (serviceId) => {
                this.removeServiceFromDisplay(serviceId);
            });

            window.eventManager.on('EMPLOYE_DELETED', (employeId) => {
                this.removeEmployeFromDisplay(employeId);
            });
        }

        // Écouter les clics sur les boutons
        this.setupButtonListeners();
    }

    setupButtonListeners() {
        // Boutons de suppression et modification
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('delete-service')) {
                const serviceId = parseInt(e.target.getAttribute('data-id'));
                console.log('🗑️ Suppression service demandée:', serviceId);
                
                if (window.eventManager) {
                    window.eventManager.emit('DELETE_SERVICE_REQUESTED', serviceId);
                }
            }
            
            if (e.target.classList.contains('edit-service')) {
                const serviceId = parseInt(e.target.getAttribute('data-id'));
                console.log('✏️ Modification service demandée:', serviceId);
                
                if (window.eventManager) {
                    window.eventManager.emit('EDIT_SERVICE_REQUESTED', serviceId);
                }
            }

            if (e.target.classList.contains('delete-employe')) {
                const employeId = parseInt(e.target.getAttribute('data-id'));
                console.log('🗑️ Suppression employé demandée:', employeId);
                
                if (window.eventManager) {
                    window.eventManager.emit('DELETE_EMPLOYE_REQUESTED', employeId);
                }
            }
            
            if (e.target.classList.contains('edit-employe')) {
                const employeId = parseInt(e.target.getAttribute('data-id'));
                console.log('✏️ Modification employé demandée:', employeId);
                
                if (window.eventManager) {
                    window.eventManager.emit('EDIT_EMPLOYE_REQUESTED', employeId);
                }
            }
        });

        // Navigation
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = link.getAttribute('data-section');
                this.showSection(section);
            });
        });

        // Boutons pour afficher/masquer les formulaires
        this.setupFormButtons();
    }

    setupFormButtons() {
        const showServiceFormBtn = document.getElementById('show-service-form');
        const hideServiceFormBtn = document.getElementById('hide-service-form');
        const showEmployeFormBtn = document.getElementById('show-employe-form');
        const hideEmployeFormBtn = document.getElementById('hide-employe-form');
        
        if (showServiceFormBtn) {
            showServiceFormBtn.addEventListener('click', () => {
                this.showServiceForm();
            });
        }
        
        if (hideServiceFormBtn) {
            hideServiceFormBtn.addEventListener('click', () => {
                this.hideServiceForm();
            });
        }
        
        if (showEmployeFormBtn) {
            showEmployeFormBtn.addEventListener('click', () => {
                this.showEmployeForm();
            });
        }
        
        if (hideEmployeFormBtn) {
            hideEmployeFormBtn.addEventListener('click', () => {
                this.hideEmployeForm();
            });
        }
    }

    displayServices(services) {
        const servicesList = document.getElementById('services-list');
        if (!servicesList) return;

        servicesList.innerHTML = '';
        
        services.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.className = 'service-card';
            serviceCard.innerHTML = `
                <h3>${service.nom}</h3>
                <p><strong>Catégorie:</strong> ${service.categorie}</p>
                <p><strong>Description:</strong> ${service.description}</p>
                <div class="service-horaires">
                    <h4>Horaires:</h4>
                    <div class="horaires-grid">
                        <div class="jour">
                            <strong>Lundi:</strong>
                            <span class="haute-saison">${service.horaires.lundi.haute}</span>
                            <span class="basse-saison">${service.horaires.lundi.basse}</span>
                        </div>
                        <div class="jour">
                            <strong>Mardi:</strong>
                            <span class="haute-saison">${service.horaires.mardi.haute}</span>
                            <span class="basse-saison">${service.horaires.mardi.basse}</span>
                        </div>
                        <div class="jour">
                            <strong>Mercredi:</strong>
                            <span class="haute-saison">${service.horaires.mercredi.haute}</span>
                            <span class="basse-saison">${service.horaires.mercredi.basse}</span>
                        </div>
                        <div class="jour">
                            <strong>Jeudi:</strong>
                            <span class="haute-saison">${service.horaires.jeudi.haute}</span>
                            <span class="basse-saison">${service.horaires.jeudi.basse}</span>
                        </div>
                        <div class="jour">
                            <strong>Vendredi:</strong>
                            <span class="haute-saison">${service.horaires.vendredi.haute}</span>
                            <span class="basse-saison">${service.horaires.vendredi.basse}</span>
                        </div>
                        <div class="jour">
                            <strong>Samedi:</strong>
                            <span class="haute-saison">${service.horaires.samedi.haute}</span>
                            <span class="basse-saison">${service.horaires.samedi.basse}</span>
                        </div>
                        <div class="jour">
                            <strong>Dimanche:</strong>
                            <span class="haute-saison">${service.horaires.dimanche.haute}</span>
                            <span class="basse-saison">${service.horaires.dimanche.basse}</span>
                        </div>
                    </div>
                </div>
                <div class="service-actions">
                    <button class="edit-service" data-id="${service.id}">Modifier</button>
                    <button class="delete-service" data-id="${service.id}">Supprimer</button>
                </div>
            `;
            servicesList.appendChild(serviceCard);
        });
        
        console.log('✅ Services affichés:', services.length);
    }

    displayEmployes(employes) {
        const employesList = document.getElementById('employes-list');
        if (!employesList) return;

        employesList.innerHTML = '';
        
        employes.forEach(employe => {
            const employeCard = document.createElement('div');
            employeCard.className = 'employe-card';
            employeCard.innerHTML = `
                <h3>${employe.prenom} ${employe.nom}</h3>
                <p><strong>Niveau:</strong> ${employe.niveau}</p>
                <p><strong>Type de contrat:</strong> ${employe.typeContrat}</p>
                <p><strong>Heures/semaine:</strong> ${employe.heuresSemaine}h</p>
                <p><strong>Modulation:</strong> ${employe.modulation}</p>
                <p><strong>Heures moyennes/semaine:</strong> ${employe.heuresMoyenne}h</p>
                <p><strong>Heures annuelles:</strong> ${employe.heuresAnnuel}h</p>
                <p><strong>Services assignés:</strong> ${employe.servicesAssignes.join(', ')}</p>
                <p><strong>Coût horaire:</strong> ${employe.coutHoraire}€</p>
                <div class="employe-actions">
                    <button class="edit-employe" data-id="${employe.id}">Modifier</button>
                    <button class="delete-employe" data-id="${employe.id}">Supprimer</button>
                </div>
            `;
            employesList.appendChild(employeCard);
        });
        
        console.log('✅ Employés affichés:', employes.length);
    }

    addServiceToDisplay(service) {
        const servicesList = document.getElementById('services-list');
        if (!servicesList) return;

        const serviceCard = document.createElement('div');
        serviceCard.className = 'service-card';
        serviceCard.innerHTML = `
            <h3>${service.nom}</h3>
            <p><strong>Catégorie:</strong> ${service.categorie}</p>
            <p><strong>Description:</strong> ${service.description}</p>
            <div class="service-actions">
                <button class="edit-service" data-id="${service.id}">Modifier</button>
                <button class="delete-service" data-id="${service.id}">Supprimer</button>
            </div>
        `;
        servicesList.appendChild(serviceCard);
        
        console.log('✅ Nouveau service ajouté à l\'affichage:', service.nom);
    }

    addEmployeToDisplay(employe) {
        const employesList = document.getElementById('employes-list');
        if (!employesList) return;

        const employeCard = document.createElement('div');
        employeCard.className = 'employe-card';
        employeCard.innerHTML = `
            <h3>${employe.prenom} ${employe.nom}</h3>
            <p><strong>Niveau:</strong> ${employe.niveau}</p>
            <p><strong>Type de contrat:</strong> ${employe.typeContrat}</p>
            <p><strong>Heures/semaine:</strong> ${employe.heuresSemaine}h</p>
            <p><strong>Modulation:</strong> ${employe.modulation}</p>
            <p><strong>Heures moyennes/semaine:</strong> ${employe.heuresMoyenne}h</p>
            <p><strong>Heures annuelles:</strong> ${employe.heuresAnnuel}h</p>
            <p><strong>Services assignés:</strong> ${employe.servicesAssignes.join(', ')}</p>
            <p><strong>Coût horaire:</strong> ${employe.coutHoraire}€</p>
            <div class="employe-actions">
                <button class="edit-employe" data-id="${employe.id}">Modifier</button>
                <button class="delete-employe" data-id="${employe.id}">Supprimer</button>
            </div>
        `;
        employesList.appendChild(employeCard);
        
        console.log('✅ Nouvel employé ajouté à l\'affichage:', employe.nom);
    }

    removeServiceFromDisplay(serviceId) {
        const serviceCard = document.querySelector(`[data-id="${serviceId}"]`).closest('.service-card');
        if (serviceCard) {
            serviceCard.remove();
            console.log('✅ Service supprimé de l\'affichage:', serviceId);
        }
    }

    removeEmployeFromDisplay(employeId) {
        const employeCard = document.querySelector(`[data-id="${employeId}"]`).closest('.employe-card');
        if (employeCard) {
            employeCard.remove();
            console.log('✅ Employé supprimé de l\'affichage:', employeId);
        }
    }

    showSection(sectionName) {
        // Masquer toutes les sections
        document.querySelectorAll('.section').forEach(section => {
            section.style.display = 'none';
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.style.display = 'block';
        }

        // Mettre à jour la navigation active
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }

    showServiceForm() {
        const form = document.getElementById('service-form-container');
        if (form) {
            form.style.display = 'block';
        }
    }

    hideServiceForm() {
        const form = document.getElementById('service-form-container');
        if (form) {
            form.style.display = 'none';
            const serviceForm = document.getElementById('service-form');
            if (serviceForm) {
                serviceForm.reset();
            }
        }
    }

    showEmployeForm() {
        const form = document.getElementById('employe-form-container');
        if (form) {
            form.style.display = 'block';
        }
    }

    hideEmployeForm() {
        const form = document.getElementById('employe-form-container');
        if (form) {
            form.style.display = 'none';
            const employeForm = document.getElementById('employe-form');
            if (employeForm) {
                employeForm.reset();
            }
        }
    }
}

// Instance globale
window.uiManager = new UIManager();

// Initialiser quand l'EventManager est prêt
if (window.eventManager) {
    window.eventManager.on('DOM_READY', () => {
        window.uiManager.init();
    });
} else {
    // Fallback si l'EventManager n'est pas disponible
    document.addEventListener('DOMContentLoaded', () => {
        window.uiManager.init();
    });
} 