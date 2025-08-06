# 🚀 Guide de déploiement Netlify

## Étape 1 : Créer un compte Netlify

1. Allez sur https://netlify.com
2. Cliquez sur "Sign up"
3. Choisissez "Sign up with GitHub"
4. Autorisez Netlify à accéder à vos repos

## Étape 2 : Connecter le repository

1. Cliquez sur "New site from Git"
2. Sélectionnez "GitHub"
3. Cherchez `GESTALIS/GEST-PREV-`
4. Cliquez sur le repository

## Étape 3 : Configuration

**Build settings :**
- Build command : `(laissez vide)`
- Publish directory : `.`

**Cliquez sur "Deploy site"**

## Étape 4 : URL personnalisée (optionnel)

1. Allez dans "Site settings"
2. "Change site name"
3. Entrez : `gest-prev` (ou autre nom disponible)
4. Votre URL sera : `https://gest-prev.netlify.app`

## Étape 5 : Test

1. Ouvrez votre URL Netlify
2. Connectez-vous avec :
   - **Admin** : `admin` / `gestprev2024`
   - **RH** : `rh` / `rh2024`
   - **CA** : `ca` / `ca2024`

## Avantages

- ✅ Déploiement immédiat (2-3 minutes)
- ✅ Synchronisation automatique avec GitHub
- ✅ HTTPS automatique
- ✅ URL personnalisable
- ✅ Fonctionne avec dépôts privés
- ✅ Pas de configuration complexe

## Mise à jour automatique

Chaque fois que vous poussez sur GitHub :
1. Netlify détecte automatiquement les changements
2. Redéploie automatiquement le site
3. Votre site est toujours à jour 