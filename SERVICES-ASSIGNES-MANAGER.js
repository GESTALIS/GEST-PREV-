// ===== SERVICES-ASSIGNES-MANAGER.js - GESTIONNAIRE DES SERVICES ASSIGNÉS =====
// Ce module gère la mise à jour dynamique des services assignés

console.log('🔧 SERVICES-ASSIGNES-MANAGER.js - Initialisation du gestionnaire des services assignés');

class ServicesAssignesManager {
    constructor() {
        this.isInitialized = false;
        this.updateQueue = []; // Pour gérer les mises à jour en attente
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🔧 Initialisation du gestionnaire des services assignés');
        this.setupEventListeners();
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Écouter l'ouverture du formulaire employé
        const showEmployeFormBtn = document.getElementById('show-employe-form');
        if (showEmployeFormBtn) {
            showEmployeFormBtn.addEventListener('click', () => {
                console.log('�� Formulaire employé ouvert, mise à jour des services...');
                setTimeout(() => {
                    this.updateServicesCheckboxes();
                }, 100);
            });
        }

        // Écouter les nouveaux services ajoutés
        if (window.eventManager) {
            window.eventManager.on('SERVICE_ADDED', (service) => {
                console.log('➕ Nouveau service ajouté, mise à jour des checkboxes:', service.nom);
                this.updateServicesCheckboxes();
            });

            window.eventManager.on('SERVICE_DELETED', (serviceId) => {
                console.log('��️ Service supprimé, mise à jour des checkboxes:', serviceId);
                this.updateServicesCheckboxes();
            });

            window.eventManager.on('UPDATE_SERVICES_LIST', () => {
                console.log('�� Liste des services mise à jour');
                this.updateServicesCheckboxes();
            });
        }

        // Mise à jour initiale
        this.updateServicesCheckboxes();
    }

    updateServicesCheckboxes() {
        console.log('🔄 Mise à jour des checkboxes de services...');
        
        // Récupérer les services depuis le DataManager ou localStorage
        let services = [];
        
        if (window.dataManager) {
            services = window.dataManager.getServices();
        } else {
            try {
                const servicesData = localStorage.getItem('gestPrevServices');
                if (servicesData) {
                    services = JSON.parse(servicesData);
                }
            } catch (error) {
                console.error('❌ Erreur lors de la récupération des services:', error);
            }
        }
        
        console.log('📋 Services trouvés:', services.length);
        
        // Trouver tous les conteneurs de services assignés
        const containers = document.querySelectorAll('.services-assignes-container');
        
        containers.forEach(container => {
            this.updateContainer(container, services);
        });
    }

    updateContainer(container, services) {
        // Vider le conteneur
        container.innerHTML = '';
        
        // Ajouter les services comme checkboxes
        services.forEach(service => {
            const label = document.createElement('label');
            label.className = 'checkbox-label';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.name = 'services-assignes';
            checkbox.value = service.nom;
            
            const span = document.createElement('span');
            span.textContent = `${service.nom} (${service.categorie})`;
            
            label.appendChild(checkbox);
            label.appendChild(span);
            
            container.appendChild(label);
        });
        
        console.log(`✅ ${services.length} services ajoutés aux checkboxes dans le conteneur`);
    }

    // Méthode pour forcer la mise à jour
    forceUpdate() {
        console.log('�� Forçage de la mise à jour des services assignés...');
        this.updateServicesCheckboxes();
    }

    // Méthode pour vérifier l'état des checkboxes
    checkServicesCheckboxes() {
        const checkboxes = document.querySelectorAll('input[name="services-assignes"]');
        console.log('📋 Nombre de checkboxes de services:', checkboxes.length);
        
        const checkedServices = [];
        checkboxes.forEach(checkbox => {
            if (checkbox.checked) {
                checkedServices.push(checkbox.value);
            }
            console.log(`- ${checkbox.value}: ${checkbox.checked ? 'coché' : 'non coché'}`);
        });
        
        console.log('✅ Services cochés:', checkedServices);
        return checkedServices;
    }

    // Méthode pour cocher/décocher des services
    setServicesChecked(servicesToCheck) {
        const checkboxes = document.querySelectorAll('input[name="services-assignes"]');
        
        checkboxes.forEach(checkbox => {
            checkbox.checked = servicesToCheck.includes(checkbox.value);
        });
        
        console.log('✅ Services cochés/décochés:', servicesToCheck);
    }

    // Méthode pour obtenir les services assignés d'un employé
    getEmployeServices(employeId) {
        if (window.dataManager) {
            const employe = window.dataManager.getEmployeById(employeId);
            return employe ? employe.servicesAssignes : [];
        }
        return [];
    }

    // Méthode pour mettre à jour les services d'un employé
    updateEmployeServices(employeId, services) {
        if (window.dataManager) {
            window.dataManager.updateEmploye(employeId, { servicesAssignes: services });
            console.log('✅ Services de l\'employé mis à jour:', { employeId, services });
        }
    }

    // Méthode pour ajouter un service à un employé
    addServiceToEmploye(employeId, serviceName) {
        if (window.dataManager) {
            const employe = window.dataManager.getEmployeById(employeId);
            if (employe) {
                if (!employe.servicesAssignes.includes(serviceName)) {
                    employe.servicesAssignes.push(serviceName);
                    window.dataManager.updateEmploye(employeId, employe);
                    console.log('✅ Service ajouté à l\'employé:', { employeId, serviceName });
                }
            }
        }
    }

    // Méthode pour retirer un service d'un employé
    removeServiceFromEmploye(employeId, serviceName) {
        if (window.dataManager) {
            const employe = window.dataManager.getEmployeById(employeId);
            if (employe) {
                employe.servicesAssignes = employe.servicesAssignes.filter(service => service !== serviceName);
                window.dataManager.updateEmploye(employeId, employe);
                console.log('✅ Service retiré de l\'employé:', { employeId, serviceName });
            }
        }
    }

    // Méthode pour obtenir des statistiques
    getStats() {
        const checkboxes = document.querySelectorAll('input[name="services-assignes"]');
        const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
        
        return {
            totalServices: checkboxes.length,
            checkedServices: checkedCount,
            containers: document.querySelectorAll('.services-assignes-container').length
        };
    }

    // Méthode pour nettoyer les checkboxes orphelines
    cleanupOrphanedCheckboxes() {
        const checkboxes = document.querySelectorAll('input[name="services-assignes"]');
        const availableServices = window.dataManager ? window.dataManager.getServices() : [];
        const availableServiceNames = availableServices.map(s => s.nom);
        
        let removedCount = 0;
        checkboxes.forEach(checkbox => {
            if (!availableServiceNames.includes(checkbox.value)) {
                checkbox.parentElement.remove();
                removedCount++;
            }
        });
        
        if (removedCount > 0) {
            console.log(`🧹 ${removedCount} checkboxes orphelines supprimées`);
        }
        
        return removedCount;
    }
}

// Instance globale
window.servicesAssignesManager = new ServicesAssignesManager();

// Initialiser quand l'EventManager est prêt
if (window.eventManager) {
    window.eventManager.on('DOM_READY', () => {
        window.servicesAssignesManager.init();
    });
} else {
    // Fallback si l'EventManager n'est pas disponible
    document.addEventListener('DOMContentLoaded', () => {
        window.servicesAssignesManager.init();
    });
}

// Fonctions utilitaires globales
window.forceUpdateServicesAssignes = () => window.servicesAssignesManager.forceUpdate();
window.checkServicesAssignes = () => window.servicesAssignesManager.checkServicesCheckboxes();
window.getServicesAssignesStats = () => window.servicesAssignesManager.getStats();
window.cleanupOrphanedServices = () => window.servicesAssignesManager.cleanupOrphanedCheckboxes(); 