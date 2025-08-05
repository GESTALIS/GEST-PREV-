// ===== HEURES-CALCUL-MANAGER.js - GESTIONNAIRE DES CALCULS D'HEURES =====
// Ce module gère les calculs automatiques d'heures pour les employés

console.log('🧮 HEURES-CALCUL-MANAGER.js - Initialisation du gestionnaire des calculs d\'heures');

class HeuresCalculManager {
    constructor() {
        this.isInitialized = false;
        this.rules = {
            '35h': {
                fixe: { heuresAnnuel: 1820, heuresMoyenne: 35 },
                modulable: { heuresAnnuel: 1607, heuresMoyenne: 30.9 }
            },
            '39h': {
                fixe: { heuresAnnuel: 2028, heuresMoyenne: 39 },
                modulable: { heuresAnnuel: 2028, heuresMoyenne: 39 }
            }
        };
    }

    init() {
        if (this.isInitialized) return;
        
        console.log('🧮 Initialisation du gestionnaire des calculs d\'heures');
        this.setupEventListeners();
        this.isInitialized = true;
    }

    setupEventListeners() {
        // Écouter les changements sur les formulaires d'employés
        document.addEventListener('change', (event) => {
            if (event.target.name === 'employe-heures-semaine' || 
                event.target.name === 'employe-modulation') {
                this.updateHeuresCalcul();
            }
        });

        // Écouter les changements sur les formulaires de configuration
        document.addEventListener('change', (event) => {
            if (event.target.name === 'heures-semaine' || 
                event.target.name === 'modulation') {
                this.updateConfigCalcul();
            }
        });

        // Écouter les nouveaux employés ajoutés
        if (window.eventManager) {
            window.eventManager.on('EMPLOYE_ADDED', (employe) => {
                this.calculateEmployeHeures(employe);
            });

            window.eventManager.on('EMPLOYE_UPDATED', (employe) => {
                this.calculateEmployeHeures(employe);
            });
        }
    }

    updateHeuresCalcul() {
        console.log('🧮 Mise à jour des calculs d\'heures...');
        
        const heuresSemaineSelect = document.querySelector('select[name="employe-heures-semaine"]');
        const modulationSelect = document.querySelector('select[name="employe-modulation"]');
        const heuresMoyenneInput = document.querySelector('input[name="employe-heures-moyenne"]');
        const heuresAnnuelInput = document.querySelector('input[name="employe-heures-annuel"]');
        
        if (!heuresSemaineSelect || !modulationSelect || !heuresMoyenneInput || !heuresAnnuelInput) {
            console.log('⚠️ Champs de calcul non trouvés');
            return;
        }
        
        const heuresSemaine = parseInt(heuresSemaineSelect.value) || 39;
        const modulation = modulationSelect.value || 'Non';
        
        console.log('📊 Heures/semaine:', heuresSemaine, 'Modulation:', modulation);
        
        const result = this.calculateHeures(heuresSemaine, modulation);
        
        // Mettre à jour les champs
        heuresAnnuelInput.value = result.heuresAnnuel;
        heuresMoyenneInput.value = result.heuresMoyenne;
        
        console.log('✅ Calculs d\'heures mis à jour:', result);
        
        // Émettre un événement
        if (window.eventManager) {
            window.eventManager.emit('HEURES_CALCULATED', result);
        }
    }

    updateConfigCalcul() {
        console.log('🧮 Mise à jour des calculs de configuration...');
        
        const heuresSemaineSelect = document.querySelector('select[name="heures-semaine"]');
        const modulationSelect = document.querySelector('select[name="modulation"]');
        const heuresAnnuelInput = document.querySelector('input[name="heures-annuel"]');
        
        if (!heuresSemaineSelect || !modulationSelect || !heuresAnnuelInput) {
            console.log('⚠️ Champs de configuration non trouvés');
            return;
        }
        
        const heuresSemaine = parseInt(heuresSemaineSelect.value) || 39;
        const modulation = modulationSelect.value || 'Non';
        
        const result = this.calculateHeures(heuresSemaine, modulation);
        
        // Mettre à jour le champ
        heuresAnnuelInput.value = result.heuresAnnuel;
        
        console.log('✅ Calculs de configuration mis à jour:', result);
    }

    calculateHeures(heuresSemaine, modulation) {
        const modulationType = modulation === 'Oui' ? 'modulable' : 'fixe';
        const ruleKey = heuresSemaine.toString();
        
        if (this.rules[ruleKey] && this.rules[ruleKey][modulationType]) {
            return this.rules[ruleKey][modulationType];
        }
        
        // Valeur par défaut
        return {
            heuresAnnuel: 2028,
            heuresMoyenne: 39
        };
    }

    calculateEmployeHeures(employe) {
        console.log('🧮 Calcul des heures pour l\'employé:', employe.nom);
        
        const result = this.calculateHeures(employe.heuresSemaine, employe.modulation);
        
        // Mettre à jour l'employé
        employe.heuresAnnuel = result.heuresAnnuel;
        employe.heuresMoyenne = result.heuresMoyenne;
        
        console.log('✅ Heures calculées pour', employe.nom, ':', result);
        
        // Sauvegarder si le DataManager est disponible
        if (window.dataManager) {
            window.dataManager.updateEmploye(employe.id, employe);
        }
        
        return result;
    }

    // Méthodes utilitaires
    getRules() {
        return this.rules;
    }

    addRule(heuresSemaine, modulationType, heuresAnnuel, heuresMoyenne) {
        if (!this.rules[heuresSemaine]) {
            this.rules[heuresSemaine] = {};
        }
        
        this.rules[heuresSemaine][modulationType] = {
            heuresAnnuel: heuresAnnuel,
            heuresMoyenne: heuresMoyenne
        };
        
        console.log('✅ Nouvelle règle ajoutée:', { heuresSemaine, modulationType, heuresAnnuel, heuresMoyenne });
    }

    validateCalcul(heuresSemaine, heuresAnnuel) {
        const isValid = heuresSemaine > 0 && heuresAnnuel > 0;
        
        if (!isValid) {
            console.warn('⚠️ Calcul invalide:', { heuresSemaine, heuresAnnuel });
        }
        
        return isValid;
    }

    // Méthode pour recalculer tous les employés
    recalculateAllEmployes() {
        console.log('🧮 Recalcul de tous les employés...');
        
        if (window.dataManager) {
            const employes = window.dataManager.getEmployes();
            employes.forEach(employe => {
                this.calculateEmployeHeures(employe);
            });
            
            console.log('✅ Tous les employés recalculés');
        }
    }

    // Méthode pour obtenir des statistiques
    getCalculStats() {
        const stats = {
            totalRules: Object.keys(this.rules).length,
            rules: this.rules
        };
        
        return stats;
    }
}

// Instance globale
window.heuresCalculManager = new HeuresCalculManager();

// Initialiser quand l'EventManager est prêt
if (window.eventManager) {
    window.eventManager.on('DOM_READY', () => {
        window.heuresCalculManager.init();
    });
} else {
    // Fallback si l'EventManager n'est pas disponible
    document.addEventListener('DOMContentLoaded', () => {
        window.heuresCalculManager.init();
    });
}

// Fonctions utilitaires globales
window.recalculateAllHeures = () => window.heuresCalculManager.recalculateAllEmployes();
window.getHeuresRules = () => window.heuresCalculManager.getRules();
window.getHeuresStats = () => window.heuresCalculManager.getCalculStats(); 