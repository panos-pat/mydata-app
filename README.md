# myDATA — Έκδοση Αποδείξεων B2C

Web app για έκδοση αποδείξεων μέσω ΑΑΔΕ myDATA API.  
Τρέχει ως PWA — λειτουργεί σαν native app στο Android.

## Deploy στο Vercel (5 λεπτά)

### 1. Ανέβασε στο GitHub
```bash
git init
git add .
git commit -m "init"
git remote add origin https://github.com/YOUR_USERNAME/mydata-app.git
git push -u origin main
```

### 2. Σύνδεσε με Vercel
- Πήγαινε στο [vercel.com](https://vercel.com) → New Project
- Import το GitHub repo
- **Framework Preset:** Other
- **Output Directory:** `public`
- Deploy!

Το Vercel ανιχνεύει αυτόματα το `/api/send.js` ως serverless function.

## Δομή αρχείων

```
mydata-app/
├── public/
│   └── index.html      # Frontend (React)
├── api/
│   └── send.js         # Serverless proxy → ΑΑΔΕ
├── vercel.json         # CORS headers config
└── package.json
```

## Πώς λειτουργεί

```
Android Browser
    → vercel.app (index.html)
    → vercel.app/api/send  ← same domain, no CORS
    → mydata-dev.azure-api.net (ΑΑΔΕ TEST)
```

## PWA — Εγκατάσταση στο Android

1. Άνοιξε το URL στον Chrome
2. Μενού (⋮) → **"Προσθήκη στην αρχική οθόνη"**
3. Εμφανίζεται σαν app χωρίς address bar

## Credentials

Τα στοιχεία (AADE User ID, Subscription Key, ΑΦΜ) αποθηκεύονται στο `localStorage` του browser — δεν φεύγουν πουθενά.
