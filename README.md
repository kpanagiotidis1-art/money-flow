# Money Flow

A calm, minimalist financial awareness app. Mobile-first, monochrome, intentional.

---

## Setup

### 1. Create a new React app (if you haven't yet)

```bash
npx create-react-app money-flow
cd money-flow
```

### 2. Copy these files

Replace the contents of `src/` with the files from this project:

```
src/
├── index.js                    ← replace the existing one
├── index.css                   ← replace the existing one
├── App.jsx                     ← replace App.js with this (or rename)
├── data/
│   └── config.js
├── hooks/
│   └── useMoneyFlow.js
├── components/
│   ├── BottomNav.jsx
│   ├── AddSheet.jsx
│   ├── MiniChart.jsx
│   └── TransactionRow.jsx
└── screens/
    ├── HomeScreen.jsx
    ├── FlowScreen.jsx
    ├── SubsScreen.jsx
    └── InsightsScreen.jsx
```

> If your project has `App.js` instead of `App.jsx`, either rename it or
> update the import in `index.js` to `import App from './App.jsx'`.

### 3. Start the app

```bash
npm start
```

Your browser will open at http://localhost:3000

---

## How the code is structured

| File | What it does |
|------|-------------|
| `hooks/useMoneyFlow.js` | **All data lives here.** Reads/writes localStorage. Computes totals, trends, insights. |
| `data/config.js` | Categories, currency symbol, labels. Easy to edit. |
| `App.jsx` | Root component. Handles which tab is active and whether AddSheet is open. |
| `screens/` | One file per screen. Each receives `data` from `useMoneyFlow`. |
| `components/` | Small reusable pieces used across screens. |
| `index.css` | All styles. Uses CSS variables for easy theming. |

---

## Adding features later

- **New category**: add an entry to `CATEGORIES` in `data/config.js`
- **New screen**: create a file in `screens/`, add a tab to `BottomNav`, add a case in `App.jsx`
- **Change currency**: update `CURRENCY` in `data/config.js`
- **Clear all data**: open browser DevTools → Application → Local Storage → delete `moneyflow_v1`
