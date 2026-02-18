/**
 * src/data/paints/PaintAPI.js
 * (Dříve index.js)
 * Centrální rozcestník pro data barev.
 *
 * UMOŽŇUJE DVA REŽIMY:
 * 1. "Flat" (Pro vyhledávání/sklad) - Vrací všechny barvy značky najednou.
 * 2. "Hierarchical" (Pro zadávání) - Umožňuje vybrat Značku -> Řadu -> Barvu.
 */

// --- 1. IMPORTY DAT ---

// Tamiya
import tamiyaPaints from "./tamiya.json";
import tamiyaSpecs from "./tamiya_spec.json";

// Gunze (Mr. Hobby)
import gunzeC from "./gunze_C.json";
import gunzeH from "./gunze_H.json";
import gunzeGX from "./gunze_GX.json";
import gunzeMC from "./gunze_MC.json";
import gunzeSF from "./gunze_SF.json";
import gunzeSpecs from "./gunze_spec.json";

// --- 2. DEFINICE ZNAČEK A ŘAD ---

export const BRANDS = {
  TAMIYA: "tamiya",
  GUNZE: "gunze",
};

// Mapování: Která značka má jaké pod-řady (pro Select Box v modalu)
const SERIES_MAP = {
  [BRANDS.TAMIYA]: [
    { id: "all", name: "Všechny řady (X, XF, LP...)" }, // Volitelné
    { id: "master", name: "Hlavní katalog" }, // Tamiya máme zatím v jednom souboru
  ],
  [BRANDS.GUNZE]: [
    { id: "C", name: "Mr. Color (C) - Lacquer" },
    { id: "H", name: "Aqueous Hobby Color (H) - Akryl" },
    { id: "GX", name: "Mr. Color GX" },
    { id: "MC", name: "Mr. Metal Color" },
    { id: "SF", name: "Mr. Surfacer / Primer" },
  ],
};

// --- 3. INTERNÍ HELPERY ---

// Sloučení Gunze pro globální hledání
const getMergedGunze = () => ({
  ...gunzeC,
  ...gunzeH,
  ...gunzeGX,
  ...gunzeMC,
  ...gunzeSF,
});

// --- 4. EXPORT API FUNKCÍ ---

/**
 * 1. ZÍSKÁNÍ BAREV (Různé úrovně detailu)
 */

// Vrátí úplně všechno (pro globální hledání napříč aplikací)
export const getMasterCatalog = () => ({
  ...tamiyaPaints,
  ...getMergedGunze(),
});

// Vrátí všechny barvy dané značky (pro filtry ve skladě)
export const getBrandPaints = (brandId) => {
  switch (brandId) {
    case BRANDS.TAMIYA:
      return tamiyaPaints;
    case BRANDS.GUNZE:
      return getMergedGunze();
    default:
      return {};
  }
};

// Vrátí barvy KONKRÉTNÍ ŘADY (Pro Modal: Nová Barva)
// Příklad: getSpecificSeries('gunze', 'H') -> vrátí jen H-ka
export const getSpecificSeries = (brandId, seriesId) => {
  if (brandId === BRANDS.TAMIYA) {
    return tamiyaPaints; // Tamiya zatím nerozdělujeme na soubory
  }
  if (brandId === BRANDS.GUNZE) {
    switch (seriesId) {
      case "C":
        return gunzeC;
      case "H":
        return gunzeH;
      case "GX":
        return gunzeGX;
      case "MC":
        return gunzeMC;
      case "SF":
        return gunzeSF;
      default:
        return getMergedGunze();
    }
  }
  return {};
};

/**
 * 2. ZÍSKÁNÍ STRUKTURY (Pro Select Boxy)
 */

// Vrátí seznam dostupných řad pro danou značku
export const getSeriesList = (brandId) => {
  return SERIES_MAP[brandId] || [];
};

/**
 * 3. SPECIFIKACE A INFO
 */

export const getSpecs = (brandId) => {
  switch (brandId) {
    case BRANDS.TAMIYA:
      return tamiyaSpecs;
    case BRANDS.GUNZE:
      return gunzeSpecs;
    default:
      return {};
  }
};

export const getManufacturers = () => [
  { id: BRANDS.TAMIYA, name: "Tamiya" },
  { id: BRANDS.GUNZE, name: "Gunze (Mr. Hobby)" },
];

export default {
  BRANDS,
  getMasterCatalog,
  getBrandPaints,
  getSpecificSeries,
  getSeriesList,
  getSpecs,
  getManufacturers,
};
