/**
 * src/data/paints/PaintAPI.js
 * (Dříve index.js)
 * Centrální rozcestník pro data barev.
 *
 * UMOŽŇUJE DVA REŽIMY:
 * 1. "Flat" (Pro vyhledávání/sklad) - Vrací všechny barvy značky najednou.
 * 2. "Hierarchical" (Pro zadávání) - Umožňuje vybrat Značku -> Řadu -> Barvu.
 *
 * REFACTOR: Plně dynamické načítání pomocí import.meta.glob
 */

// --- 1. DYNAMICKÉ NAČTENÍ DAT ---

// Načte všechny .json soubory v aktuální složce A PODSLOŽKÁCH
const modules = import.meta.glob("./**/*.json", { eager: true });

const catalogs = {};
const specs = {};
const brandsSet = new Set();
const folderNames = {}; // Mapování: Brand ID -> Název složky (pro hezké názvy)

// Soubory, které nejsou katalogy barev ani specifikace
const IGNORED_FILES = ["brands", "catalog", "package"];

// Mapování pro hezčí názvy (zachování původního UX)
const DISPLAY_NAMES = {
  gunze: "Gunze (Mr. Hobby)",
  tamiya: "Tamiya",
  vallejo: "Vallejo",
};

// Mapování pro hezčí názvy řad (zachování původního UX)
const SERIES_NAMES = {
  master: "Hlavní katalog",
  C: "Mr. Color (C) - Lacquer",
  H: "Aqueous Hobby Color (H) - Akryl",
  GX: "Mr. Color GX",
  MC: "Mr. Metal Color",
  SF: "Mr. Surfacer / Primer",
  // Vallejo
  model_color: "Model Color (MC)",
  panzer_aces: "Panzer Aces",
  surface_primer: "Surface Primer",
  metal_color: "Metal Color",
  mecha_color: "Mecha Color",
  game_air: "Game Air (GA)",
  model_air: "Model Air (MA)",
  game_color: "Game Color (GC)",
  // AK Interactive
  real_colors: "Real Colors (RC)",
  "3rd_gen": "3rd Gen Acrylics",
  xtreme_metal: "Xtreme Metal",
};

for (const path in modules) {
  // path je např. "./gunze_C.json" nebo "./AK Interactive/ak_real_colors.json"
  const parts = path.split("/");
  const fileName = parts.pop().replace(".json", "");

  // Zjistíme název složky (pokud je soubor v podsložce)
  // parts[0] je ".", parts[1] je název složky (pokud existuje)
  const folderName = parts.length >= 2 ? parts[1] : null;

  if (IGNORED_FILES.includes(fileName)) continue;

  const content = modules[path].default || modules[path];

  if (fileName.endsWith("_spec")) {
    // Specifikace: {brand}_spec.json
    const brand = fileName.replace("_spec", "");
    specs[brand] = content;
    brandsSet.add(brand);
    if (folderName) folderNames[brand] = folderName;
  } else {
    // Katalog: {brand}_{series}.json nebo {brand}.json
    let brand, series;
    if (fileName.includes("_")) {
      const partsName = fileName.split("_");
      brand = partsName[0];
      series = partsName.slice(1).join("_");
    } else {
      brand = fileName;
      series = "master";
    }

    if (!catalogs[brand]) catalogs[brand] = {};
    catalogs[brand][series] = content;
    brandsSet.add(brand);
    if (folderName) folderNames[brand] = folderName;
  }
}

// --- 2. DEFINICE ZNAČEK A ŘAD ---

/**
 * Mapa všech dostupných značek (Brand ID -> Brand Name).
 * @type {Object.<string, string>}
 */
export const BRANDS = Array.from(brandsSet).reduce((acc, brand) => {
  acc[brand.toUpperCase()] = brand;
  return acc;
}, {});

// Mapování: Která značka má jaké pod-řady (pro Select Box v modalu)
const SERIES_MAP = {};
for (const brand of brandsSet) {
  const brandSeries = catalogs[brand] ? Object.keys(catalogs[brand]) : [];
  SERIES_MAP[brand] = brandSeries.map((seriesId) => ({
    id: seriesId,
    name:
      SERIES_NAMES[seriesId] ||
      (seriesId === "master" ? "Main Catalog" : seriesId),
  }));
}

// --- 3. EXPORT API FUNKCÍ ---

/**
 * 1. ZÍSKÁNÍ BAREV (Různé úrovně detailu)
 */

/**
 * Vrátí kompletní katalog všech barev napříč všemi značkami a řadami.
 * Slouží pro globální vyhledávání.
 * @returns {Object} Mapa všech barev {id: data}.
 */
export const getMasterCatalog = () => {
  let allPaints = {};
  for (const brand in catalogs) {
    for (const series in catalogs[brand]) {
      Object.assign(allPaints, catalogs[brand][series]);
    }
  }
  return allPaints;
};

/**
 * Vrátí všechny barvy dané značky (sloučené ze všech jejích řad).
 * @param {string} brandId - ID značky (např. "gunze", "tamiya").
 * @returns {Object} Mapa barev dané značky.
 */
export const getBrandPaints = (brandId) => {
  const brandCatalogs = catalogs[brandId];
  if (!brandCatalogs) return {};
  // Sloučení všech řad dané značky
  return Object.values(brandCatalogs).reduce(
    (acc, series) => Object.assign(acc, series),
    {},
  );
};

/**
 * Vrátí barvy konkrétní řady dané značky.
 * Pokud řada neexistuje, vrátí všechny barvy značky jako fallback.
 * @param {string} brandId - ID značky.
 * @param {string} seriesId - ID řady (např. "C", "H", "LP").
 * @returns {Object} Mapa barev.
 */
export const getSpecificSeries = (brandId, seriesId) => {
  const brandCatalogs = catalogs[brandId];
  if (!brandCatalogs) return {};

  if (seriesId && brandCatalogs[seriesId]) {
    return brandCatalogs[seriesId];
  }

  // Fallback: vrátí vše od značky (pokud série neexistuje nebo není zadána)
  return getBrandPaints(brandId);
};

/**
 * 2. ZÍSKÁNÍ STRUKTURY (Pro Select Boxy)
 */

/**
 * Vrátí seznam dostupných řad pro danou značku.
 * @param {string} brandId - ID značky.
 * @returns {Array<{id: string, name: string}>} Seznam řad.
 */
export const getSeriesList = (brandId) => {
  return SERIES_MAP[brandId] || [];
};

/**
 * 3. SPECIFIKACE A INFO
 */

/**
 * Vrátí technické specifikace pro danou značku (typy barev, ředidla, bezpečnost).
 * @param {string} brandId - ID značky.
 * @returns {Object} Specifikace.
 */
export const getSpecs = (brandId) => {
  return specs[brandId] || {};
};

/**
 * Najde správnou specifikaci (typ barvy) pro konkrétní řadu.
 * Využívá pole "codes" v definici specifikace (např. ["X", "XF"] -> acrylic).
 *
 * @param {string} brandId - ID značky (např. "tamiya").
 * @param {string} seriesId - ID řady (např. "XF", "LP").
 * @returns {Object|null} Specifikace barvy nebo null, pokud nenalezeno.
 */
export const getSpecForSeries = (brandId, seriesId) => {
  const brandSpecs = specs[brandId];
  if (!brandSpecs) return null;

  // Projde všechny typy (acrylic, lacquer...) a hledá shodu v poli codes
  for (const typeKey in brandSpecs) {
    const typeData = brandSpecs[typeKey];
    if (typeData.codes && typeData.codes.includes(seriesId)) {
      return { type: typeKey, ...typeData };
    }
  }
  return null;
};

/**
 * Vrátí seznam všech podporovaných výrobců barev.
 * @returns {Array<{id: string, name: string}>} Seznam výrobců.
 */
export const getManufacturers = () => {
  return Array.from(brandsSet).map((id) => ({
    id,
    // 1. Manuální název (Gunze)
    // 2. Název složky (AK Interactive)
    // 3. Fallback (Tamiya)
    name:
      DISPLAY_NAMES[id] ||
      folderNames[id] ||
      id.charAt(0).toUpperCase() + id.slice(1),
  }));
};

export default {
  BRANDS,
  getMasterCatalog,
  getBrandPaints,
  getSpecificSeries,
  getSeriesList,
  getSpecs,
  getSpecForSeries,
  getManufacturers,
};
