# 🔄 Guide de Synchronisation des Données - GEST PREV

## 📋 Problème résolu

**Problème initial :** Les utilisateurs RH et CA ne voyaient pas les mêmes données car chaque navigateur stockait ses propres données localement.

**Solution :** Système de synchronisation des données partagées entre tous les utilisateurs.

## 🎯 Comment ça fonctionne maintenant

### ✅ **Données partagées**
- **Services** : Ajoutés par Admin, CA ou RH, visibles par tous
- **Employés** : Ajoutés par Admin, CA ou RH, visibles par tous  
- **Planning** : Créé par Admin, CA ou RH, visible par tous
- **Scénarios** : Créés par Admin, CA ou RH, visibles par tous
- **Simulations** : Créées par Admin, CA ou RH, visibles par tous

### 🔄 **Synchronisation automatique**
- Les données sont automatiquement synchronisées lors de la connexion
- Chaque modification est immédiatement partagée
- Notifications de confirmation de synchronisation

## 🛠️ Comment utiliser la synchronisation

### 1. **Synchronisation automatique**
- Se connecter avec les identifiants Admin, RH ou CA
- Les données sont automatiquement chargées et synchronisées
- Une notification confirme la synchronisation

### 2. **Synchronisation manuelle**
- Cliquer sur le bouton **"Synchroniser"** dans l'en-tête
- Ou utiliser la console : `window.gestPrevApp.forceDataSync()`

### 3. **Vérification de la synchronisation**
- Les notifications confirment la synchronisation
- Les données sont mises à jour en temps réel
- L'affichage se rafraîchit automatiquement

## 📊 Exemple d'utilisation

### **Scénario 1 : Utilisateur CA ajoute des services**
1. L'utilisateur CA se connecte avec `ca` / `ca2024`
2. Il ajoute 2 nouveaux services
3. Les services sont automatiquement sauvegardés et partagés
4. L'utilisateur RH se connecte avec `rh` / `rh2024`
5. Il voit immédiatement les 2 nouveaux services ajoutés par CA

### **Scénario 2 : Utilisateur RH supprime des employés**
1. L'utilisateur RH se connecte
2. Il supprime 3 employés
3. Les suppressions sont automatiquement synchronisées
4. L'utilisateur CA se connecte
5. Il voit que les 3 employés ont été supprimés

### **Scénario 3 : Utilisateur Admin modifie des données**
1. L'utilisateur Admin se connecte avec `admin` / `gestprev2024`
2. Il modifie les horaires d'un service
3. Les modifications sont automatiquement synchronisées
4. Les utilisateurs RH et CA voient les nouvelles horaires

## 🔧 Commandes utiles

### **Console du navigateur :**
```javascript
// Forcer la synchronisation
window.gestPrevApp.forceDataSync()

// Voir les données actuelles
console.log('Services:', window.gestPrev.services)
console.log('Employés:', window.gestPrev.employes)

// Forcer la déconnexion
window.gestPrevApp.forceLogout()
```

## ⚠️ Points importants

### **Données partagées :**
- ✅ Services (ajoutés par Admin, CA ou RH)
- ✅ Employés (ajoutés par Admin, CA ou RH)
- ✅ Planning (créé par Admin, CA ou RH)
- ✅ Scénarios et simulations

### **Données personnelles :**
- 🔒 Authentification (chaque utilisateur garde sa session)
- 🔒 Préférences d'affichage
- 🔒 Historique de navigation

## 👥 Utilisateurs et accès

### **Identifiants disponibles :**
- **Admin** : `admin` / `gestprev2024` (accès complet)
- **RH** : `rh` / `rh2024` (module RH)
- **CA** : `ca` / `ca2024` (module CA)

### **Rôles et permissions :**
- **Admin** : Accès complet à tous les modules et données
- **RH** : Accès au module RH et aux données partagées
- **CA** : Accès au module CA et aux données partagées

## 🚀 Avantages

1. **Collaboration en temps réel** : Les modifications sont immédiatement visibles
2. **Pas de conflits** : Les données sont partagées de manière cohérente
3. **Simplicité** : Synchronisation automatique, pas d'action manuelle requise
4. **Sécurité** : Chaque utilisateur garde ses identifiants personnels
5. **Flexibilité** : L'admin peut intervenir sur tous les modules

## 🔍 Dépannage

### **Si les données ne se synchronisent pas :**
1. Cliquer sur le bouton "Synchroniser"
2. Vérifier la console pour les erreurs
3. Utiliser `window.gestPrevApp.forceDataSync()`
4. Recharger la page si nécessaire

### **Si les données sont corrompues :**
1. Utiliser le système de sauvegarde
2. Restaurer une sauvegarde récente
3. Contacter l'administrateur si nécessaire

---

**💡 Conseil :** Utilisez le bouton "Synchroniser" régulièrement pour vous assurer que vous avez les dernières données de vos collègues. 