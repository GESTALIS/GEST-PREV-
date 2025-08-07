# 🧪 GUIDE DE TEST - SYNCHRONISATION ENTRE UTILISATEURS

## 🎯 OBJECTIF
Tester la synchronisation en temps réel des données entre 2 utilisateurs sur GitHub Pages.

## 📋 PROTOCOLE DE TEST

### **Étape 1 : Préparation**
1. **Ouvrir 2 onglets/ordinateurs différents**
2. **URL** : `https://gestalis.github.io/GEST-PREV-/`
3. **Utilisateur 1** : `rh` / `rh2024`
4. **Utilisateur 2** : `ca` / `ca2024`

### **Étape 2 : Test de synchronisation**

#### **🔍 Test 1 : Ajout de service par RH**
1. **Utilisateur RH** :
   - Se connecte avec `rh` / `rh2024`
   - Va dans le module **RH**
   - Clique sur "Ajouter un service"
   - Remplit le formulaire :
     - Nom : "Service Test RH"
     - Catégorie : "Restauration"
     - Configure les horaires (ex: Lundi 8h-18h)
   - Clique sur "Ajouter le service"
   - **Vérifie** : Le service apparaît dans la liste

2. **Utilisateur CA** :
   - Se connecte avec `ca` / `ca2024`
   - Va dans le module **RH**
   - **Vérifie** : Le service "Service Test RH" doit être visible
   - **Si visible** : ✅ Synchronisation réussie
   - **Si non visible** : ❌ Problème de synchronisation

#### **🔍 Test 2 : Suppression par CA**
1. **Utilisateur CA** :
   - Trouve le service "Service Test RH"
   - Clique sur le bouton "Supprimer"
   - Confirme la suppression
   - **Vérifie** : Le service disparaît de la liste

2. **Utilisateur RH** :
   - **Vérifie** : Le service "Service Test RH" doit avoir disparu
   - **Si disparu** : ✅ Synchronisation réussie
   - **Si toujours visible** : ❌ Problème de synchronisation

#### **🔍 Test 3 : Ajout d'employé par CA**
1. **Utilisateur CA** :
   - Va dans le module **RH**
   - Clique sur "Ajouter un employé"
   - Remplit le formulaire :
     - Nom : "Employé Test CA"
     - Prénom : "Test"
     - Niveau : "Débutant"
     - Contrat : "CDI"
   - Clique sur "Ajouter l'employé"
   - **Vérifie** : L'employé apparaît dans la liste

2. **Utilisateur RH** :
   - **Vérifie** : L'employé "Employé Test CA" doit être visible
   - **Si visible** : ✅ Synchronisation réussie
   - **Si non visible** : ❌ Problème de synchronisation

### **Étape 3 : Vérification des logs**

#### **🔍 Console du navigateur**
1. **Ouvrir la console** (F12)
2. **Chercher les messages** :
   - ✅ `"Synchronisation cloud réussie"`
   - ✅ `"Données universelles synchronisées avec tous les utilisateurs"`
   - ❌ `"Erreur synchronisation cloud"`

#### **🔍 Notifications**
1. **Vérifier les notifications** :
   - ✅ `"Service ajouté et synchronisé avec tous les utilisateurs !"`
   - ✅ `"Données universelles sauvegardées et partagées avec tous les utilisateurs"`

### **Étape 4 : Test de robustesse**

#### **🔍 Test avec rechargement**
1. **Utilisateur RH** : Ajoute un service
2. **Utilisateur CA** : Recharge la page (F5)
3. **Vérifie** : Le service doit être visible après rechargement

#### **🔍 Test avec déconnexion/reconnexion**
1. **Utilisateur RH** : Ajoute un service
2. **Utilisateur CA** : Se déconnecte puis se reconnecte
3. **Vérifie** : Le service doit être visible après reconnexion

## 🚨 DÉPANNAGE

### **Problème : Synchronisation ne fonctionne pas**
1. **Vérifier la console** pour les erreurs
2. **Vérifier l'URL** : `https://gestalis.github.io/GEST-PREV-/`
3. **Vérifier la connexion internet**
4. **Essayer de recharger la page**

### **Problème : Données ne s'affichent pas**
1. **Vérifier les logs** dans la console
2. **Vérifier les notifications**
3. **Essayer de cliquer sur "Synchroniser"** (si disponible)

## 📊 RÉSULTATS ATTENDUS

### **✅ Synchronisation réussie**
- Les données ajoutées par un utilisateur sont visibles par l'autre
- Les données supprimées par un utilisateur disparaissent pour l'autre
- Les notifications confirment la synchronisation
- Les logs montrent "Synchronisation cloud réussie"

### **❌ Synchronisation échouée**
- Les données ne sont pas partagées entre utilisateurs
- Les erreurs apparaissent dans la console
- Les notifications indiquent des problèmes

## 🎯 CRITÈRES DE SUCCÈS

1. **Test 1** : Service ajouté par RH visible par CA ✅
2. **Test 2** : Service supprimé par CA disparu pour RH ✅
3. **Test 3** : Employé ajouté par CA visible par RH ✅
4. **Logs** : Messages de synchronisation réussie ✅
5. **Notifications** : Confirmations de synchronisation ✅

## 📞 SUPPORT

En cas de problème :
1. **Vérifier la console** (F12) pour les erreurs
2. **Tester avec un autre navigateur**
3. **Vérifier la connexion internet**
4. **Contacter l'équipe de développement** 