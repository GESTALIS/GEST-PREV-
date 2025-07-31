// ===== GESTION DE L'ARCHITECTURE MODULAIRE =====

class ModuleManager {
    constructor() {
        this.currentModule = 'rh';
        this.init();
    }

    init() {
        this.setupModuleNavigation();
        this.setupInternalNavigation();
    }

    // ===== NAVIGATION DES MODULES =====
    setupModuleNavigation() {
        const moduleButtons = document.querySelectorAll('.module-btn');
        
        moduleButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                if (button.disabled) return;
                
                const moduleId = button.dataset.module;
                this.switchModule(moduleId);
            });
        });
    }

    switchModule(moduleId) {
        // Mettre à jour les boutons
        document.querySelectorAll('.module-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-module="${moduleId}"]`).classList.add('active');

        // Mettre à jour le contenu
        document.querySelectorAll('.module-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`module-${moduleId}`).classList.add('active');

        // Mettre à jour le footer
        document.querySelectorAll('.footer-module').forEach(footerModule => {
            footerModule.classList.remove('active');
        });
        document.querySelectorAll('.footer-module')[this.getModuleIndex(moduleId)].classList.add('active');

        this.currentModule = moduleId;
        
        // Réinitialiser la navigation interne
        this.resetInternalNavigation();
    }

    getModuleIndex(moduleId) {
        const modules = ['rh', 'financier', 'infrastructure', 'commercial', 'environnement', 'operationnel'];
        return modules.indexOf(moduleId);
    }

    // ===== NAVIGATION INTERNE =====
    setupInternalNavigation() {
        const internalNavLinks = document.querySelectorAll('.internal-nav-link');
        
        internalNavLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Retirer la classe active de tous les liens
                internalNavLinks.forEach(l => l.classList.remove('active'));
                
                // Ajouter la classe active au lien cliqué
                link.classList.add('active');
                
                // Afficher la section correspondante
                const targetId = link.getAttribute('href').substring(1);
                this.showSection(targetId);
            });
        });
    }

    showSection(sectionId) {
        // Masquer toutes les sections
        document.querySelectorAll('.module-section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Afficher la section cible
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
    }

    resetInternalNavigation() {
        // Réinitialiser à la première section
        const firstLink = document.querySelector('.internal-nav-link');
        if (firstLink) {
            document.querySelectorAll('.internal-nav-link').forEach(l => l.classList.remove('active'));
            firstLink.classList.add('active');
            
            const firstSection = document.querySelector('.module-section');
            if (firstSection) {
                document.querySelectorAll('.module-section').forEach(s => s.classList.remove('active'));
                firstSection.classList.add('active');
            }
        }
    }

    // ===== UTILITAIRES =====
    getCurrentModule() {
        return this.currentModule;
    }

    isModuleActive(moduleId) {
        return this.currentModule === moduleId;
    }
}

// ===== INITIALISATION =====
let moduleManager;

document.addEventListener('DOMContentLoaded', () => {
    moduleManager = new ModuleManager();
});

// ===== FONCTIONS GLOBALES =====
function switchToModule(moduleId) {
    if (moduleManager) {
        moduleManager.switchModule(moduleId);
    }
}

function getCurrentModule() {
    return moduleManager ? moduleManager.getCurrentModule() : 'rh';
} 