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
        const tabButtons = document.querySelectorAll('.tab-btn');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Retirer la classe active de tous les boutons
                tabButtons.forEach(btn => btn.classList.remove('active'));
                
                // Ajouter la classe active au bouton cliqué
                button.classList.add('active');
                
                // Afficher la section correspondante
                const targetId = button.dataset.tab;
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
        const firstTab = document.querySelector('.tab-btn');
        if (firstTab) {
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            firstTab.classList.add('active');
            
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
    
    // ===== CONFIGURATION VERROUILLÉE =====
    // S'assurer que le module RH est actif par défaut
    const rhModule = document.getElementById('rh-module');
    if (rhModule) {
        rhModule.classList.add('active');
    }
    
    // S'assurer que la section PRÉSENTATION est active par défaut
    const presentationSection = document.getElementById('rh-presentation');
    if (presentationSection) {
        presentationSection.classList.add('active');
    }
    
    // S'assurer que le bouton PRÉSENTATION est actif
    const presentationTab = document.querySelector('[data-tab="rh-presentation"]');
    if (presentationTab) {
        presentationTab.classList.add('active');
    }
    
    // ===== SAUVEGARDE AUTOMATIQUE DE LA CONFIGURATION =====
    const config = {
        defaultModule: 'rh',
        defaultSection: 'rh-presentation',
        defaultTab: 'rh-presentation',
        timestamp: Date.now()
    };
    
    // Sauvegarder la configuration
    localStorage.setItem('gestPrevConfig', JSON.stringify(config));
    
    // ===== RESTAURATION AUTOMATIQUE EN CAS DE PROBLÈME =====
    setTimeout(() => {
        // Vérifier que la présentation est bien affichée
        const currentSection = document.querySelector('.module-section.active');
        if (!currentSection || currentSection.id !== 'rh-presentation') {
            console.log('Restauration automatique de la configuration...');
            
            // Masquer toutes les sections
            document.querySelectorAll('.module-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // Afficher la présentation
            const presentation = document.getElementById('rh-presentation');
            if (presentation) {
                presentation.classList.add('active');
            }
            
            // Activer l'onglet présentation
            document.querySelectorAll('.tab-btn').forEach(tab => tab.classList.remove('active'));
            const presTab = document.querySelector('[data-tab="rh-presentation"]');
            if (presTab) {
                presTab.classList.add('active');
            }
        }
    }, 100);
    
    // Initialiser l'application GEST PREV
    if (window.gestPrevApp) {
        window.gestPrevApp.init();
    }
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