# Changelog

## [2.33.0] - 2026-02-21

### Přidáno

- **Stavba:** Možnost přidat odkaz na externí fotoalbum (Google Photos, Rajče...) k modelu (sekce Stavba).
- **Tržiště:** Možnost manuálně přidávat vlastní ceny a obchody k modelu.
- **Barvy:** Nové typy produktů v číselníku: Lepidla, Tmely, Ředidla, Laky, Weathering.
- **Barvy:** Podpora pro barvy AK Interactive a rozšíření specifikací Vallejo (včetně detekce číselných kódů).
- **UI:** Sbalovací skupiny (Accordions) v seznamu barev u modelu pro lepší přehlednost podle výrobců.
- **UI:** Indikátor "Album" na kartě modelu.

### Změněno

- **Design:** Sjednocení a zjemnění typografie na kartách modelů, projektů a doplňků (menší písmo, technický vzhled).
- **Barvy:** Vylepšený algoritmus vyhledávání v našeptávači (lépe řadí krátké kódy jako "H-1").
- **Data:** Automatické načítání JSON souborů barev i z podsložek (umožňuje lepší organizaci dat).
- **UX:** Vypnuto automatické doplňování prohlížeče (`autocomplete="off"`) ve formulářích barev a modelů.

## [2.32.0] - 2026-02-21

### Přidáno

- **Funkce:** Automatická detekce typu barvy a ředidla podle kódu (např. `XF-` -> Akryl).
- **Data:** Standardizace specifikací barev (Tamiya, Gunze) a přidání mapování prefixů kódů.

### Opraveno

- **Dev:** Odstraněny duplicitní klíče v `PaintDetailModal`, které způsobovaly varování při buildu.

## [2.31.2] - 2026-02-20

### Změněno

- **UI:** Optimalizace kitDetailModal, naseptavac

## [2.31.1] - 2026-02-20

### Vývoj

- **Dokumentace:** Kompletní doplnění JSDoc komentářů napříč celou aplikací (komponenty, hooky, utils, API) pro lepší čitelnost a údržbu kódu.
- **Dev:** Zlepšení typové kontroly a nápovědy v IDE díky detailním definicím props a návratových hodnot.

## [2.31.0] - 2026-02-19

### Přidáno

- **UI:** Implementován "App-like" layout s fixní hlavičkou a uzamčeným scrollováním (eliminuje "rubber-banding" efekt na mobilních zařízeních).
- **Barvy:** Přidána možnost filtrovat modely podle použité barvy kliknutím na badge "Použito v modelech".
- **Barvy:** Nová logika pro Mixy – karty nyní zobrazují dostupnost ingrediencí (Namíchat / Chybí složky / Jen recept).
- **Barvy:** Vizuální kalkulátor ředění (Slider) a automatický výpočet výsledného odstínu mixu v detailu barvy.
- **Dev:** Přidána JSDoc dokumentace pro hlavní komponenty (Karty, Modaly).

### Změněno

- **Barvy:** Sjednocení statusů – odstraněn status "Prázdné" (nyní se chová jako "Koupit").
- **UI:** Redesign karet barev pro lepší čitelnost a sjednocení s kartami modelů.

## [2.30.2] - 2026-02-19

### Opraveno

- **App:** Opravena kritická chyba `ReferenceError: Palette is not defined`, která způsobovala pád aplikace při zobrazení prázdného seznamu barev.

## [2.30.1] - 2026-02-18

### Přidáno

- **Data:** Implementovány technické specifikace pro barvy Tamiya a Gunze (ředidla, bezpečnost, použití) v `src/data/*_spec.json`.
- **Dokumentace:** Přidána dokumentace architektury dat barev (`Architektura dat barev.md`).
- **App:** Přidána globální proměnná `import.meta.env.PACKAGE_VERSION` pro zobrazení verze v aplikaci.

### Změněno

- **Build:** Zvýšen limit varování velikosti chunku ve Vite na 1000 kB (řeší warningy při buildu).
- **Config:** Dynamické načítání verze aplikace z `package.json` do Vite konfigurace.
