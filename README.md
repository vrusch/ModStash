Release verze v2.30.0 přináší **kompletní architektonický přepis (refactoring)** celé aplikace. Cílem bylo odstranit technický dluh, rozbít monolitický kód a připravit aplikaci na snadnější vývoj nových funkcí.

Z uživatelského hlediska zůstává funkčnost a vzhled beze změny (1:1 parita), ale aplikace je nyní stabilnější a připravená na škálování.

---

## 🏗 Hlavní změny v architektuře

### 1. Rozbití Monolitu (`App.jsx`)

- **Původní stav:** Jeden soubor `App.jsx` o velikosti **3300+ řádků**. Obsahoval konfiguraci, data, UI, logiku i modaly.
- **Nový stav:** Hlavní soubor má nyní cca **445 řádků** a slouží pouze jako orchestrátor (layout a routing).
- **Výsledek:** Zlepšení čitelnosti kódu o 85 % a zrychlení vývojového cyklu.

### 2. Zavedení Custom Hooks (Logic Layer)

Veškerá aplikační logika byla vyčleněna do samostatných hooků:

- `useAuth`: Správa přihlášení, uživatele a online/offline stavu.
- `useInventory`: CRUD operace (Create, Read, Update, Delete) pro modely, barvy a projekty. Komunikace s Firebase.
- `useAppLogic`: Filtrování, vyhledávání, řazení a výpočty statistik pro dashboard.

### 3. Modularizace UI Komponent

Uživatelské rozhraní bylo rozděleno na atomické části:

- **Karty:** `KitCard`, `PaintCard`, `ProjectCard`, `ShoppingAccessoryCard`.
- **Modaly:** `KitDetailModal`, `PaintDetailModal`, `ProjectDetailModal`, `SettingsModal`.
- **UI Prvky:** `FormElements` (Inputy, Selecty), `Icons`, `AppHeader`.

### 4. Správa Dat a Konfigurace

- **Data:** Statická data (Katalog barev, Značky) přesunuta do JSON souborů v `src/data/`.
- **Utils:** Pomocné funkce (`Normalizer`, `safeRender`) přesunuty do `src/utils/`.
- **Config:** Inicializace Firebase přesunuta do `src/config/`.


## 📋 Changelog
Všechny podstatné změny v tomto projektu naleznete v souboru [CHANGELOG.md](./CHANGELOG.md).

---

## 📂 Nová struktura projektu

```text
src/
├── components/
│   ├── cards/       # Karty (Kit, Paint, Project...)
│   ├── layout/      # AppHeader, Layouty
│   ├── modals/      # Velké editační modaly
│   └── ui/          # Základní prvky (Inputy, Ikony)
├── config/          # Firebase config
├── data/            # JSON katalogy (brands, colors)
├── hooks/           # useAuth, useInventory, useAppLogic
├── utils/           # Pomocné funkce
└── App.jsx          # Hlavní vstupní bod (Layout only)

```
kithub
├─ CHANGELOG.md
├─ index.html
├─ package-lock.json
├─ package.json
├─ project_tree.md
├─ public
│  └─ favicon.png
├─ README.md
├─ release_notes_v2.30.0
├─ roadmap.md
├─ src
│  ├─ App.jsx
│  ├─ components
│  │  ├─ cards
│  │  │  ├─ KitCard.jsx
│  │  │  ├─ PaintCard.jsx
│  │  │  ├─ ProjectCard.jsx
│  │  │  └─ ShoppingAccessoryCard.jsx
│  │  ├─ layout
│  │  │  └─ AppHeader.jsx
│  │  ├─ modals
│  │  │  ├─ KitDetailModal.jsx
│  │  │  ├─ LanguageModal.jsx
│  │  │  ├─ PaintDetailModal.jsx
│  │  │  ├─ ProjectDetailModal.jsx
│  │  │  └─ SettingsModal.jsx
│  │  └─ ui
│  │     ├─ ConfirmModal.jsx
│  │     ├─ FormElements.jsx
│  │     └─ Icons.jsx
│  ├─ config
│  │  └─ firebase.js
│  ├─ data
│  │  ├─ brands.json
│  │  ├─ catalog.json
│  │  └─ paints
│  │     ├─ gunze_C.json
│  │     ├─ gunze_GX.json
│  │     ├─ gunze_H.json
│  │     ├─ gunze_MC.json
│  │     ├─ gunze_SF.json
│  │     ├─ gunze_spec.json
│  │     ├─ kit_brands.json
│  │     ├─ PaintAPI.js
│  │     ├─ tamiya_LP.json
│  │     ├─ tamiya_other.json
│  │     ├─ tamiya_spec.json
│  │     ├─ tamiya_X.json
│  │     └─ tamiya_XF.json
│  ├─ hooks
│  │  ├─ useAppLogic.js
│  │  ├─ useAuth.js
│  │  └─ useInventory.js
│  ├─ index.css
│  ├─ main.jsx
│  └─ utils
│     ├─ helpers.js
│     └─ normalizers.js
└─ vite.config.js

```