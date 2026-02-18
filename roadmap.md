Fáze 1: "Úklid a Architektura" (Priorita: NEJVYŠŠÍ)
Cíl: Zbavit se dluhu dříve, než začneme stavět další patro.

Refactoring Barev (To, co jsme začali):

Přesun souborů: V project*tree.md vidím, že gunze*\*.json a tamiya.json jsou v kořeni data/. Musíme je přesunout do data/paints/.

Implementace index.js: Vytvoření toho "API", které jsi chtěl. To vyřeší i budoucí výkon aplikace.

Normalizace: Sjednocení klíčů (aby se nestalo, že jednou je to type: "Akryl" a podruhé type: "Aqueous").

Oprava Kritických Bugů (z BUGFIX.txt):

Scroll & Layout: Oprava "zajíždění pod header" a dvojitých scrollbarů. To je UX zabiják.

Mobile Modal: Oprava přetékání Settings modalu na mobilu.

Tlačítko Uložit: Oprava logiky, kdy je tlačítko aktivní hned po otevření (Paint/Project modal).

Badge "Použito v modelech":

Vrácení funkcionality, která zmizela. Propojení detailu barvy se seznamem projektů.

Fáze 2: "UX Vylepšení - Pryč s dlouhou nudlí" (Priorita: VYSOKÁ)
Cíl: Aplikace musí být použitelná, i když tam bude 500 položek.

Seskupování (Accordions):

Implementace "Group by Brand" v seznamu barev (jak píšeš v ROZVOJ.txt). Místo 100 řádků budeš mít 5 rozbalovacích výrobců.

To samé zvážit pro Nákupní seznam.

Filtry a Řazení:

Dokončení filtrů v nákupech.

Uložení stavu filtrů do localStorage (aby si aplikace pamatovala, co jsi měl otevřené).

Fáze 3: "Nové moduly - Chemie a Média" (Priorita: STŘEDNÍ)
Cíl: Rozšíření možností aplikace.

Chemie a Spotřebák (Odpověď na tvou otázku):

Návrh řešení: Nedělat novou hlavní záložku v menu, ale rozšířit "Inventory".

Karty: Stejně jako máš Kits a Paints, přidáme Supplies.

Logika: Je to velmi podobné barvám (Výrobce, Název, Typ, Skladem), takže to může sdílet 90 % kódu (Modal, Karta).

Design: Bude to jen další přepínač nahoře: [Modely] [Barvy] [Chemie].

Box Art (Fotky krabic):

Do KitDetailModal přidat pole pro URL obrázku.

Zobrazit náhled na KitCard.

Build Log (Lite verze):

Jak jsem psal v ROZVOJ.txt – zatím jen pole pro vložení odkazu na externí album (Google Photos/Rajče). Žádné nahrávání fotek do DB.

Fáze 4: "Dokumentace a Finalizace" (Priorita: NÍZKÁ/PRŮBĚŽNÁ)
Dokumentace:

Vygenerování README pro GitHub (Tech stack).

Nápověda pro uživatele (vysvětlení ikon, workflow).

Jazyky:

Dotáhnutí přepínání jazyků (už máme základ, jen to aplikovat všude).

Odpověď na tvůj dotaz k index.js (API)
Ano, tvá představa je správná. Soubor src/data/paints/index.js bude fungovat jako "chytrá brána".

Jak to bude fungovat technicky:

Input: Komponenta si řekne: "Chci jen barvy Tamiya".

Process: index.js načte pouze tamiya.json (díky dynamickým importům v moderním JS to jde optimalizovat) a vrátí je.

Output: Komponenta dostane JSON.

Proč je to super pro tvůj projekt:

Škálovatelnost: Až přidáš "Chemii", bude to jen další JSON (např. consumables.json) a index.js ho bude umět vrátit.

Výkon: Nebudeš mít v paměti telefonu objekt s 5000 položkami, když si prohlížíš jen 20 barev.

Co teď? (Action Plan)
Navrhuji tento postup pro nejbližší hodinu:

Uděláme Fázi 1 - Bod 1 (Refactoring Data):

Fyzicky přesuneme gunze\_\*.json a tamiya.json do složky paints.

Vytvoříme ten index.js tak, aby uměl vracet data (API styl).

Upravíme aplikaci, aby data četla z nového místa (to bude chvilku "rozbité", než to přepojíme).
