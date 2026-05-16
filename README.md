# Photo Studio AI

Mini SaaS : transforme une photo de jeu en photo produit studio pour 1€ (3 images generees).

## Stack
- Next.js (frontend + API routes)
- Stripe (paiement 1€)
- Replicate / flux-kontext-pro (generation IA)
- Vercel (hebergement)

## Deploiement sur Vercel

### 1. Upload sur GitHub
- Cree un nouveau repo sur github.com
- Glisse le dossier du projet dedans (ou via GitHub Desktop)

### 2. Importe sur Vercel
- Va sur vercel.com
- "New Project" → importe ton repo GitHub
- Framework: Next.js (detecte automatiquement)

### 3. Variables d'environnement sur Vercel
Dans les settings du projet Vercel, ajoute ces variables :

```
STRIPE_SECRET_KEY=sk_test_51TXWArPPH...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51TXWArPPH...
REPLICATE_API_TOKEN=r8_Che...
NEXT_PUBLIC_URL=https://TON-PROJET.vercel.app
```

### 4. Deploie !
Vercel deploie automatiquement. Remplace NEXT_PUBLIC_URL par ton URL Vercel.

## Test du paiement Stripe
En mode test, utilise la carte : `4242 4242 4242 4242` / date future / CVC: 123

## Passer en production
1. Remplace les cles sk_test_ et pk_test_ par les cles live dans Stripe
2. Met a jour les variables d'env sur Vercel
3. Active ton compte Stripe (renseigne ton RIB)
