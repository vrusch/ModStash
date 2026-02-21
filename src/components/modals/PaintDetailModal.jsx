import React, { useState, useEffect, useMemo } from "react";
import {
  FlaskConical,
  Palette,
  X,
  Ban,
  Wand2,
  Plus,
  Trash2,
  Droplets,
  Box,
  Save,
  Loader2,
  Check,
  ChevronRight,
  Info,
  Lock,
  Sparkles,
  ShieldAlert,
  Search,
} from "lucide-react";
import {
  FloatingInput,
  FloatingTextarea,
  FloatingSelect,
} from "../ui/FormElements";
import { Normalizer } from "../../utils/normalizers";
// Importujeme nové dynamické API
import PaintAPI from "../../data/paints/PaintAPI";
import ConfirmModal from "../ui/ConfirmModal";

// Pomocné funkce pro míchání barev (Hex <-> RGB)
/**
 * Převede HEX kód barvy na RGB objekt.
 * Používá se pro výpočet výsledné barvy při míchání.
 *
 * @param {string} hex - Hexadecimální řetězec (např. "#ff0000" nebo "#f00").
 * @returns {{r: number, g: number, b: number} | null} Objekt s RGB složkami nebo null při chybě.
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
};

/**
 * Převede RGB složky zpět na HEX řetězec.
 *
 * @param {number} r - Červená složka (0-255).
 * @param {number} g - Zelená složka (0-255).
 * @param {number} b - Modrá složka (0-255).
 * @returns {string} Hexadecimální řetězec (např. "#ff0000").
 */
const rgbToHex = (r, g, b) => {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
};

/**
 * Modální okno pro detail barvy (Editace) nebo vytvoření nové barvy.
 * Řeší i míchání vlastních odstínů (Mix) a validaci vůči skladu.
 *
 * @param {Object} props
 * @param {Object} props.paint - Data editované barvy (nebo prázdný objekt pro novou).
 * @param {string} [props.paint.id] - ID barvy (pokud existuje, jde o editaci).
 * @param {string} [props.paint.brand] - Výrobce barvy.
 * @param {string} [props.paint.code] - Kód barvy.
 * @param {string} [props.paint.name] - Název barvy.
 * @param {boolean} [props.paint.isMix] - Zda jde o míchanou barvu.
 * @param {Array} [props.paint.mixParts] - Složení mixu (pokud isMix=true).
 * @param {Function} props.onClose - Handler pro zavření modalu.
 * @param {Function} props.onSave - Handler pro uložení barvy (create/update).
 * @param {Array<Object>} props.existingPaints - Seznam existujících barev (pro validaci duplicit a výběr do mixu).
 * @param {Array<Object>} [props.allKits] - Seznam modelů (pro zobrazení použití barvy).
 * @returns {JSX.Element}
 */
const PaintDetailModal = ({
  paint,
  onClose,
  onSave,
  existingPaints,
  allKits,
  preferences,
}) => {
  // --- 1. INITIALIZATION & STATE ---

  // Pokud má barva ID, jde o editaci (Detail). Pokud ne, je to Nová barva.
  const isEditMode = !!paint.id;

  const [data, setData] = useState({
    brand: "",
    code: "",
    name: "",
    type: "acrylic",
    finish: "Matná",
    status: "in_stock",
    hex: "#999999",
    notes: "",
    thinner: "",
    ratioPaint: 60,
    ratioThinner: 40,
    isMix: false,
    mixParts: [],
    ...paint,
  });

  // Stavy pro hierarchický výběr (pouze pro režim Nová barva)
  const [selectedSeries, setSelectedSeries] = useState("");
  const [availableSeries, setAvailableSeries] = useState([]);

  // UI stavy
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateError, setDuplicateError] = useState(null);
  const [statusToast, setStatusToast] = useState(false);
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState(null);

  // Omnibox / Global Search States
  const [omniboxQuery, setOmniboxQuery] = useState("");
  const [omniboxResults, setOmniboxResults] = useState([]);
  const [isManualEntry, setIsManualEntry] = useState(false);

  // Stav pro přidávání do mixu
  const [newMixPart, setNewMixPart] = useState({ paintId: "", ratio: 1 });

  // --- 2. LOGIKA (EFFECTS) ---

  // A) Načtení řad (pouze pokud měníme značku u nové barvy)
  /**
   * Načte dostupné produktové řady (Series) pro vybranou značku.
   * Spouští se pouze při změně značky.
   */
  useEffect(() => {
    if (data.brand) {
      const series = PaintAPI.getSeriesList(data.brand);
      setAvailableSeries(series);
    } else {
      setAvailableSeries([]);
    }
  }, [data.brand]);

  // B) SPECIFIKACE: Získání info o typu barvy (Akryl, Lacquer...)
  const currentSpec = useMemo(() => {
    if (!data.brand || !data.type) return null;
    // Získáme specifikace pro danou značku (např. tamiya_spec.json) z API
    const allSpecs = PaintAPI.getSpecs(data.brand);
    // Vrátíme konkrétní typ (např. klíč "Akryl")
    return allSpecs ? allSpecs[data.type] : null;
  }, [data.brand, data.type]);

  // C) AUTO-FILL: Doplnění ředidla podle specifikace
  useEffect(() => {
    // Vyplníme jen u nové barvy a jen když je pole prázdné
    if (currentSpec && currentSpec.thinner && !data.thinner && !isEditMode) {
      setData((prev) => ({ ...prev, thinner: currentSpec.thinner }));
    }
  }, [currentSpec, isEditMode]); // eslint-disable-line react-hooks/exhaustive-deps

  // C2) AUTO-FILL RATIO: Načtení výchozího poměru z preferencí
  useEffect(() => {
    if (!isEditMode && data.brand && data.type && preferences?.paintRatios) {
      const key = `${data.brand}|${data.type}`;
      const savedRatio = preferences.paintRatios[key];
      if (savedRatio) {
        setData((prev) => ({
          ...prev,
          ratioPaint: savedRatio.paint,
          ratioThinner: savedRatio.thinner,
        }));
      }
    }
  }, [data.brand, data.type, isEditMode, preferences]);

  // D0) GLOBAL OMNIBOX SEARCH (Prohledává všechny značky)
  useEffect(() => {
    if (isEditMode || isManualEntry || data.isMix || omniboxQuery.length < 2) {
      setOmniboxResults([]);
      return;
    }

    const query = omniboxQuery.toLowerCase().replace(/[\s\-\.]/g, "");
    const results = [];
    const brands = PaintAPI.getManufacturers();

    // Projdeme všechny značky a jejich barvy
    for (const brand of brands) {
      const paints = PaintAPI.getBrandPaints(brand.id);
      if (!paints) continue;

      for (const [key, paintVal] of Object.entries(paints)) {
        const codeClean = (paintVal.displayCode || key)
          .toLowerCase()
          .replace(/[\s\-\.]/g, "");
        const nameClean = (paintVal.name || "").toLowerCase();

        if (codeClean.includes(query) || nameClean.includes(query)) {
          const owned = existingPaints.find(
            (p) =>
              p.brand.toLowerCase() === brand.id.toLowerCase() &&
              p.code.toLowerCase().replace(/[\s\-\.]/g, "") === codeClean,
          );

          // Detekce typu podle prefixu (stejná logika jako v KitPaintsTab)
          const rawCode = paintVal.displayCode || key;
          const seriesMatch = rawCode.match(/^([A-Za-z]+)/);
          const seriesPrefix = seriesMatch ? seriesMatch[1] : "";
          const spec = PaintAPI.getSpecForSeries(brand.id, seriesPrefix);

          results.push({
            ...paintVal,
            id: key, // Klíč z JSONu (např. XF-1)
            brandName: brand.name, // Display name značky
            brandId: brand.id, // ID značky
            displayCode: paintVal.displayCode || key,
            owned: !!owned,
            ownedStatus: owned?.status,
            detectedType: spec ? spec.type : null,
          });
        }
        // Optimalizace: Max 5 výsledků na značku, celkem max 20
        if (results.length > 50) break;
      }
      if (results.length > 20) break;
    }

    setOmniboxResults(results);
  }, [omniboxQuery, isEditMode, isManualEntry, data.isMix, existingPaints]);

  // D) NAŠEPTÁVAČ (Autocomplete)
  useEffect(() => {
    // Našeptáváme jen pro: Novou barvu, Není Mix, Máme značku, Píšeme kód
    if (
      !data.isMix &&
      data.brand &&
      data.code &&
      !isEditMode &&
      isManualEntry && // Jen v manuálním režimu
      !suggestionSelected
    ) {
      const searchCode = data.code.toUpperCase().replace(/[\s\-\.]/g, "");

      // Zjistíme, kde hledat (konkrétní řada vs. celá značka)
      const sourceData = selectedSeries
        ? PaintAPI.getSpecificSeries(data.brand, selectedSeries)
        : PaintAPI.getBrandPaints(data.brand);

      // Filtrujeme (podle kódu i názvu) - ošetříme undefined
      const entries = sourceData ? Object.entries(sourceData) : [];

      const matches = entries
        .filter(([key, val]) => {
          const valCode = (val.displayCode || "")
            .toUpperCase()
            .replace(/[\s\-\.]/g, "");
          const valName = (val.name || "").toUpperCase();
          return valCode.includes(searchCode) || valName.includes(searchCode);
        })
        .slice(0, 10); // Max 10 výsledků

      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [
    data.brand,
    data.code,
    selectedSeries,
    isEditMode,
    data.isMix,
    suggestionSelected,
    isManualEntry,
  ]);

  // E) VALIDACE DUPLICIT (jen u nové barvy, abychom nepřidali to samé dvakrát)
  useEffect(() => {
    if (!isEditMode && data.brand && data.code && existingPaints) {
      const cleanBrand = data.brand.toLowerCase();
      const cleanCode = data.code.toLowerCase().replace(/[\s\-\.]/g, "");
      const duplicate = existingPaints.find(
        (p) =>
          p.brand.toLowerCase() === cleanBrand &&
          p.code.toLowerCase().replace(/[\s\-\.]/g, "") === cleanCode,
      );
      setDuplicateError(
        duplicate
          ? `Tuto barvu už máte ve skladu (${duplicate.status === "in_stock" ? "Skladem" : duplicate.status}).`
          : null,
      );
    }
  }, [data.brand, data.code, existingPaints, isEditMode]);

  // F) DETEKCE ZMĚN (pro tlačítko Uložit)
  const hasChanges = useMemo(() => {
    const normalize = (obj) => JSON.stringify(obj);
    const initialData = {
      brand: "",
      code: "",
      name: "",
      type: "acrylic",
      finish: "Matná",
      status: "in_stock",
      hex: "#999999",
      notes: "",
      thinner: "",
      ratioPaint: 60,
      ratioThinner: 40,
      isMix: false,
      mixParts: [],
      ...paint,
    };
    return normalize(data) !== normalize(initialData);
  }, [data, paint]);

  // G) POUŽITÍ V MODELECH
  const usage = useMemo(() => {
    if (!allKits) return [];
    return allKits.filter((k) => k.paints?.some((kp) => kp.id === paint.id));
  }, [allKits, paint.id]);

  // H) AUTO-CALC MIX COLOR (Vypočítat barvu mixu)
  /**
   * Automaticky vypočítá výslednou barvu (HEX) mixu na základě ingrediencí.
   * Používá vážený průměr RGB hodnot podle poměru (ratio).
   */
  useEffect(() => {
    if (!data.isMix || !data.mixParts || data.mixParts.length === 0) return;

    let totalR = 0;
    let totalG = 0;
    let totalB = 0;
    let totalWeight = 0;

    data.mixParts.forEach((part) => {
      const ingredient = existingPaints.find((p) => p.id === part.paintId);
      if (ingredient && ingredient.hex) {
        const rgb = hexToRgb(ingredient.hex);
        if (rgb) {
          const weight = Number(part.ratio) || 0;
          totalR += rgb.r * weight;
          totalG += rgb.g * weight;
          totalB += rgb.b * weight;
          totalWeight += weight;
        }
      }
    });

    if (totalWeight > 0) {
      const avgHex = rgbToHex(
        Math.round(totalR / totalWeight),
        Math.round(totalG / totalWeight),
        Math.round(totalB / totalWeight),
      );
      if (avgHex !== data.hex) {
        setData((prev) => ({ ...prev, hex: avgHex }));
      }
    }
  }, [data.mixParts, data.isMix, existingPaints]); // eslint-disable-line react-hooks/exhaustive-deps

  // --- 3. HANDLERS ---

  const handleSelectOmniboxResult = (result) => {
    setData({
      ...data,
      brand: result.brandId,
      code: result.displayCode,
      name: result.name,
      type: result.detectedType || result.type || "acrylic",
      finish: result.finish || "Matná",
      hex: result.hex || data.hex,
      thinner: result.thinner || "",
    });
    setOmniboxQuery("");
    setIsManualEntry(true); // Přepneme do "manuálního" zobrazení (formulář), ale už vyplněného
  };

  const handleSelectSuggestion = ([key, val]) => {
    // Pokus o detekci typu při výběru z našeptávače
    const rawCode = val.displayCode || key;
    const seriesMatch = rawCode.match(/^([A-Za-z]+)/);
    const seriesPrefix = seriesMatch ? seriesMatch[1] : "";
    const spec = PaintAPI.getSpecForSeries(data.brand, seriesPrefix);

    const newData = {
      ...data,
      code: val.displayCode || data.code,
      name: val.name,
      type: spec ? spec.type : val.type || "acrylic",
      finish: val.finish,
      hex: val.hex || data.hex,
    };

    setData(newData);
    setShowSuggestions(false);
    setSuggestionSelected(true);
  };

  const handleRatioChange = (type, value) => {
    if (value === "") {
      setData((d) => ({ ...d, ratioPaint: "", ratioThinner: "" }));
      return;
    }
    const num = parseInt(value);
    if (isNaN(num)) return;
    if (num > 100) return;
    if (type === "paint")
      setData((d) => ({ ...d, ratioPaint: num, ratioThinner: 100 - num }));
    else setData((d) => ({ ...d, ratioThinner: num, ratioPaint: 100 - num }));
  };

  const handleSaveWrapper = async () => {
    setIsSaving(true);
    try {
      await onSave(data);
      onClose();
    } catch (e) {
      console.error("Chyba při ukládání:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setConfirmConfig({
        title: "Neuložené změny",
        message:
          "Máte neuložené změny. Opravdu chcete zavřít okno? Změny budou ztraceny.",
        confirmText: "Zahodit změny",
        isDestructive: true,
        onConfirm: onClose,
      });
    } else {
      onClose();
    }
  };

  const handleDeleteMixPart = (idx) => {
    setConfirmConfig({
      title: "Odstranit složku",
      message: "Opravdu chcete odstranit tuto barvu z mixu?",
      confirmText: "Odstranit",
      isDestructive: true,
      onConfirm: () => {
        setData((prev) => ({
          ...prev,
          mixParts: prev.mixParts.filter((_, i) => i !== idx),
        }));
        setConfirmConfig(null);
      },
    });
  };

  const addMixPart = () => {
    if (!newMixPart.paintId || newMixPart.ratio <= 0) return;
    const selectedPaint = existingPaints.find(
      (p) => p.id === newMixPart.paintId,
    );
    if (!selectedPaint) return;

    // Pokud přidáváme barvu, která není skladem, a status ještě není "empty", zobrazíme toast
    if (selectedPaint.status !== "in_stock" && data.status !== "empty") {
      setStatusToast(true);
      setTimeout(() => setStatusToast(false), 4000);
    }

    setData((prev) => ({
      ...prev,
      mixParts: [
        ...(prev.mixParts || []),
        {
          ...newMixPart,
          name: selectedPaint.name,
          code: selectedPaint.code,
          brand: selectedPaint.brand,
        },
      ],
      status: selectedPaint.status !== "in_stock" ? "empty" : prev.status,
    }));
    setNewMixPart({ paintId: "", ratio: 1 });
  };

  const isFormValid =
    data.name &&
    (data.isMix
      ? data.mixParts && data.mixParts.length > 0
      : data.brand && data.code) &&
    !duplicateError;

  // --- 4. RENDER ---

  return (
    <>
      {confirmConfig && (
        <ConfirmModal
          isOpen={true}
          title={confirmConfig.title}
          message={confirmConfig.message}
          confirmText={confirmConfig.confirmText}
          isDestructive={confirmConfig.isDestructive}
          onConfirm={confirmConfig.onConfirm}
          onCancel={() => setConfirmConfig(null)}
        />
      )}
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
        <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
          {/* HLAVIČKA */}
          <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center rounded-t-xl">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              {data.isMix ? (
                <FlaskConical size={20} className="text-purple-400" />
              ) : (
                <Palette size={20} className="text-blue-400" />
              )}{" "}
              {isEditMode ? "Detail barvy" : "Nová barva"}
            </h3>
            <button
              onClick={handleClose}
              className="text-slate-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>

          {/* Toast Notifikace o změně statusu */}
          {statusToast && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full shadow-xl border border-slate-600 flex items-center gap-2 z-50 animate-in slide-in-from-top-5 fade-in">
              <Info size={16} className="text-blue-400" />
              <span className="text-xs font-bold">
                Status změněn na "Jen recept" (chybí barva).
              </span>
            </div>
          )}

          {/* OBSAH */}
          <div className="p-4 space-y-4 flex-1 overflow-y-auto bg-slate-900 relative">
            {/* Chybová hláška */}
            {duplicateError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-pulse font-bold">
                <Ban size={16} className="shrink-0 text-red-500" />
                {duplicateError}
              </div>
            )}

            {/* --- SEKCE A: IDENTIFIKACE PRODUKTU --- */}

            {/* REŽIM EDITACE: ZAMČENO */}
            {isEditMode ? (
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  <Lock size={12} /> Identifikace produktu (Fixní)
                </div>
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center font-bold text-white shadow-sm border border-slate-700"
                    style={{
                      backgroundColor:
                        data.hex !== "#999999" ? data.hex : undefined,
                    }}
                  >
                    {data.isMix ? (
                      <FlaskConical size={18} />
                    ) : (
                      data.code.substring(0, 2)
                    )}
                  </div>
                  <div>
                    <div className="text-white font-bold text-lg leading-none">
                      {data.code}
                    </div>
                    <div className="text-slate-400 text-sm">{data.brand}</div>
                  </div>
                </div>
              </div>
            ) : (
              /* REŽIM NOVÁ BARVA: EDITAČNÍ POLE */
              <>
                {/* Přepínač Mix - viditelný jen u nové barvy nebo když už to je mix */}
                {(!isEditMode || data.isMix) && (
                  <button
                    className={`flex items-center gap-2 mb-2 p-2 bg-slate-800/50 rounded border border-slate-700 transition-colors ${
                      isEditMode
                        ? "opacity-50 cursor-default"
                        : "cursor-pointer hover:bg-slate-800"
                    }`}
                    onClick={() => {
                      if (!isEditMode) {
                        setData((d) => ({
                          ...d,
                          isMix: !d.isMix,
                          brand: !d.isMix ? "Vlastní Mix" : "",
                          code: !d.isMix
                            ? "MIX-" + Date.now().toString().slice(-4)
                            : "",
                          name: !d.isMix && !d.name ? "Nový Mix" : d.name,
                        }));
                      }
                    }}
                  >
                    <div
                      className={`w-4 h-4 rounded border flex items-center justify-center ${data.isMix ? "bg-purple-500 border-purple-500" : "border-slate-500"}`}
                    >
                      {data.isMix && <Check size={12} className="text-white" />}
                    </div>
                    <span
                      className={`text-sm font-bold ${data.isMix ? "text-purple-400" : "text-slate-400"}`}
                    >
                      🧪 Vytvořit vlastní Mix (Míchaná barva)
                    </span>
                  </button>
                )}

                {/* OMNIBOX SEARCH (Výchozí stav pro novou barvu) */}
                {!data.isMix && !isManualEntry && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                        <Search className="text-slate-500" size={20} />
                      </div>
                      <input
                        autoFocus
                        type="text"
                        className="w-full bg-slate-950 border border-blue-500/50 rounded-xl py-4 pl-10 pr-4 text-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-xl"
                        placeholder="Hledat barvu (např. XF-1, Gunze Black)..."
                        value={omniboxQuery}
                        onChange={(e) => setOmniboxQuery(e.target.value)}
                      />
                      {/* Omnibox Results Dropdown */}
                      {omniboxResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden ring-1 ring-white/10 max-h-64 overflow-y-auto">
                          {omniboxResults.map((res) => (
                            <button
                              key={`${res.brandId}-${res.id}`}
                              onClick={() => handleSelectOmniboxResult(res)}
                              className="w-full text-left p-3 hover:bg-blue-600/20 hover:text-blue-100 border-b border-slate-800 last:border-0 flex items-center gap-3 group transition-colors"
                            >
                              <div
                                className="w-6 h-6 rounded shadow-sm border border-slate-600 shrink-0"
                                style={{ backgroundColor: res.hex || "#000" }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-white group-hover:text-blue-300">
                                    {res.displayCode}
                                  </span>
                                  <span className="text-slate-400 text-xs truncate group-hover:text-blue-200">
                                    {res.name}
                                  </span>
                                </div>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="block text-[10px] font-bold text-slate-500 uppercase group-hover:text-blue-300">
                                  {res.brandName}
                                </span>
                                <span className="block text-[9px] text-slate-600 group-hover:text-blue-400">
                                  {res.type}
                                </span>
                                {res.owned && (
                                  <span className="block text-[9px] font-bold text-emerald-500 mt-0.5">
                                    {res.ownedStatus === "in_stock"
                                      ? "✅ SKLADEM"
                                      : "🛒 V SEZNAMU"}
                                  </span>
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-center">
                      <span className="text-xs text-slate-500">nebo</span>
                      <button
                        onClick={() => setIsManualEntry(true)}
                        className="ml-2 text-xs font-bold text-blue-400 hover:underline"
                      >
                        Zadat ručně (pokud není v katalogu)
                      </button>
                    </div>
                  </div>
                )}

                {/* MANUAL ENTRY FORM (Zobrazí se po výběru nebo kliknutí na "Zadat ručně") */}
                {!data.isMix && isManualEntry && (
                  <div className="space-y-3 animate-in slide-in-from-top-2">
                    <div className="flex justify-end">
                      <button
                        onClick={() => {
                          setIsManualEntry(false);
                          setOmniboxQuery("");
                        }}
                        className="text-[10px] text-slate-500 hover:text-white flex items-center gap-1"
                      >
                        <Search size={10} /> Zpět na vyhledávání
                      </button>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex-1 relative">
                        <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 text-blue-400">
                          Výrobce/Znaka
                        </label>
                        <select
                          className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                          value={data.brand}
                          onChange={(e) => {
                            setData({
                              ...data,
                              brand: e.target.value,
                              code: "",
                            });
                            setSelectedSeries("");
                          }}
                        >
                          <option value="">-- Vyber --</option>
                          {PaintAPI.getManufacturers().map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {availableSeries.length > 0 && (
                        <div className="flex-1 relative animate-in fade-in">
                          <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 text-slate-400">
                            Řada
                          </label>
                          <select
                            className="w-full bg-slate-950 text-sm text-slate-200 border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                            value={selectedSeries}
                            onChange={(e) => setSelectedSeries(e.target.value)}
                          >
                            <option value="">Všechny řady</option>
                            {availableSeries.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    <div className="relative">
                      <FloatingInput
                        label={
                          selectedSeries ? `Kód (${selectedSeries}) *` : "Kód *"
                        }
                        value={data.code}
                        onChange={(e) => {
                          setData({
                            ...data,
                            code: Normalizer.code(e.target.value),
                          });
                          setSuggestionSelected(false);
                        }}
                        placeholder="Zadejte kód (např. XF-1)..."
                        labelColor="text-blue-400"
                        disabled={!data.brand}
                      />

                      {/* Autocomplete Dropdown */}
                      {showSuggestions && (
                        <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg mt-1 z-50 shadow-xl max-h-48 overflow-y-auto">
                          <div className="p-2 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-700 bg-slate-900/50 sticky top-0">
                            Nalezeno v katalogu:
                          </div>
                          {suggestions.map(([key, val]) => (
                            <div
                              key={key}
                              onClick={() => handleSelectSuggestion([key, val])}
                              className="p-2 hover:bg-blue-600/20 hover:text-blue-300 cursor-pointer text-xs flex items-center gap-3 border-b border-slate-700/50 last:border-0"
                            >
                              <div
                                className="w-4 h-4 rounded-full border border-slate-600 shadow-sm"
                                style={{ backgroundColor: val.hex || "#000" }}
                              />
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-sm">
                                  {val.displayCode}
                                </span>
                              </div>
                              <span className="text-slate-300 truncate ml-auto font-medium">
                                {val.name}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* --- SEKCE B: UŽIVATELSKÁ DATA --- */}

            <FloatingInput
              label="Název / Odstín *"
              value={data.name}
              onChange={(e) =>
                setData({ ...data, name: Normalizer.name(e.target.value) })
              }
              placeholder={data.isMix ? "Můj stínovací mix" : "flat black"}
              labelColor={data.isMix ? "text-purple-400" : "text-blue-400"}
            />

            <div className="flex gap-3">
              <FloatingSelect
                className="flex-1"
                label="Typ"
                value={data.type}
                onChange={(e) => setData({ ...data, type: e.target.value })}
                options={[
                  { value: "acrylic", label: "💧 Akryl" },
                  { value: "enamel", label: "🛢️ Enamel" },
                  { value: "lacquer", label: "☣️ Lacquer" },
                  { value: "oil", label: "🎨 Olej" },
                  { value: "pigment", label: "🏜️ Pigment" },
                  { value: "primer", label: "🛡️ Primer" },
                ]}
              />
              <FloatingSelect
                className="flex-1"
                label="Povrch"
                value={data.finish}
                onChange={(e) => setData({ ...data, finish: e.target.value })}
                options={[
                  { value: "Matná", label: "Matná" },
                  { value: "Polomat", label: "Polomat" },
                  { value: "Lesklá", label: "Lesklá" },
                  { value: "Kovová", label: "Kovová" },
                  { value: "Perleťová", label: "Perleťová" },
                  { value: "Transparentní", label: "Transparentní" },
                ]}
              />
              <FloatingSelect
                className="flex-1"
                label="Status"
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                options={
                  data.isMix
                    ? [
                        { value: "in_stock", label: "✅ Mám namícháno" },
                        { value: "low", label: "⚠️ Dochází" },
                        { value: "empty", label: "🧪 Jen recept" },
                      ]
                    : [
                        { value: "in_stock", label: "✅ Skladem" },
                        { value: "low", label: "⚠️ Dochází" },
                        { value: "wanted", label: "🛒 Koupit" },
                      ]
                }
              />
            </div>

            {/* INFO BOX SPECIFIKACÍ */}
            {currentSpec && (
              <div className="bg-blue-950/30 border border-blue-500/20 rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start gap-3 mb-3">
                  <div className="bg-blue-500/10 p-2 rounded-lg text-blue-400 shrink-0 border border-blue-500/10">
                    <Info size={20} />
                  </div>
                  <div>
                    <h4 className="text-blue-400 font-bold text-sm">
                      {currentSpec.title}
                    </h4>
                    <p className="text-slate-400 text-xs italic mt-1 leading-relaxed">
                      {currentSpec.description}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-3 border-t border-blue-500/10">
                  {currentSpec.bestFor && (
                    <div className="flex items-start gap-2">
                      <Sparkles size={14} className="text-amber-400 shrink-0" />
                      <span className="text-[10px] text-slate-300 leading-tight">
                        <strong className="text-slate-500 block mb-0.5">
                          Použití
                        </strong>
                        {currentSpec.bestFor}
                      </span>
                    </div>
                  )}
                  {currentSpec.safety && (
                    <div className="flex items-start gap-2">
                      <ShieldAlert
                        size={14}
                        className="text-red-400 shrink-0"
                      />
                      <span className="text-[10px] text-slate-300 leading-tight">
                        <strong className="text-slate-500 block mb-0.5">
                          Bezpečnost
                        </strong>
                        {currentSpec.safety}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* MIX INGREDIENCE */}
            {data.isMix && (
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2">
                  <FlaskConical size={14} /> Receptura{" "}
                  <span className="text-slate-500 normal-case ml-auto">
                    (Celkem:{" "}
                    {data.mixParts?.reduce(
                      (acc, p) => acc + (Number(p.ratio) || 0),
                      0,
                    )}{" "}
                    dílů)
                  </span>
                </h4>
                <div className="flex gap-2 mb-2">
                  <select
                    className="flex-1 bg-slate-950 border border-slate-600 rounded text-xs text-white p-2"
                    value={newMixPart.paintId}
                    onChange={(e) =>
                      setNewMixPart({ ...newMixPart, paintId: e.target.value })
                    }
                  >
                    <option value="">-- Přidat barvu --</option>
                    {existingPaints
                      .filter((p) => !p.isMix)
                      .map((p) => {
                        const icon =
                          p.status === "in_stock"
                            ? "✅"
                            : p.status === "low"
                              ? "⚠️"
                              : p.status === "wanted"
                                ? "🛒"
                                : "❌";
                        return (
                          <option key={p.id} value={p.id}>
                            {icon} {p.brand} {p.code} {p.name}
                          </option>
                        );
                      })}
                  </select>
                  <input
                    type="number"
                    min="1"
                    className="w-16 bg-slate-950 border border-slate-600 rounded text-xs text-white p-2 text-center"
                    placeholder="Díly"
                    value={newMixPart.ratio}
                    onChange={(e) =>
                      setNewMixPart({
                        ...newMixPart,
                        ratio: parseInt(e.target.value) || 0,
                      })
                    }
                  />
                  <button
                    onClick={addMixPart}
                    disabled={!newMixPart.paintId}
                    className="bg-purple-600 text-white p-2 rounded disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                <div className="space-y-1">
                  {data.mixParts?.map((part, idx) => {
                    const partPaint = existingPaints.find(
                      (p) => p.id === part.paintId,
                    );
                    const isMissing =
                      partPaint && partPaint.status !== "in_stock";

                    return (
                      <div
                        key={idx}
                        className={`flex justify-between items-center bg-slate-900 p-2 rounded border text-xs ${
                          isMissing ? "border-red-500/30" : "border-slate-700"
                        }`}
                      >
                        <span className="flex items-center gap-1 flex-wrap">
                          <span className="font-bold text-purple-400">
                            {part.ratio} dílů
                          </span>{" "}
                          <span className="text-slate-600">-</span>
                          <span
                            className={
                              isMissing ? "text-red-400" : "text-slate-300"
                            }
                          >
                            {part.brand} {part.code} {part.name}
                          </span>
                          {isMissing && (
                            <span className="text-[9px] font-bold text-red-500 bg-red-500/10 px-1 rounded uppercase ml-1">
                              Chybí
                            </span>
                          )}
                        </span>
                        <button
                          onClick={() => handleDeleteMixPart(idx)}
                          className="text-slate-500 hover:text-red-400"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ŘEDĚNÍ */}
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700/50 space-y-4">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Droplets size={14} className="text-blue-400" /> Ředění
              </h4>

              <FloatingInput
                className="w-full"
                label="Doporučené ředidlo"
                value={data.thinner || ""}
                onChange={(e) => setData({ ...data, thinner: e.target.value })}
                placeholder="Např. Tamiya X-20A"
              />

              {/* Visual Calculator Panel (Slider Redesign) */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                {/* 1. Textová vizualizace */}
                <div className="flex justify-between items-end mb-4 px-1">
                  <div className="text-left">
                    <span className="text-[10px] font-bold text-amber-500 block tracking-wider mb-1">
                      BARVA
                    </span>
                    <span className="text-3xl font-bold text-white leading-none">
                      {data.ratioPaint}
                      <span className="text-sm text-slate-500 font-normal ml-1">
                        %
                      </span>
                    </span>
                  </div>

                  {/* Separator / Icon */}
                  <div className="pb-2 text-slate-700">
                    <Droplets size={24} className="opacity-20" />
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] font-bold text-blue-500 block tracking-wider mb-1">
                      ŘEDIDLO
                    </span>
                    <span className="text-3xl font-bold text-white leading-none">
                      {data.ratioThinner}
                      <span className="text-sm text-slate-500 font-normal ml-1">
                        %
                      </span>
                    </span>
                  </div>
                </div>

                {/* 2. Slider */}
                <div className="relative h-8 mb-6 flex items-center">
                  {/* Track Background */}
                  <div className="absolute inset-x-0 h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${data.ratioPaint}%` }}
                      className="bg-amber-500 h-full transition-all duration-100"
                    />
                    <div className="bg-blue-500 flex-1 h-full transition-all duration-100" />
                  </div>
                  {/* Input Range */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={data.ratioPaint}
                    onChange={(e) => handleRatioChange("paint", e.target.value)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* Custom Thumb (Visual only - follows position) */}
                  <div
                    className="absolute h-6 w-6 bg-white rounded-full shadow-lg border-2 border-slate-900 pointer-events-none transition-all duration-100 flex items-center justify-center"
                    style={{
                      left: `calc(${data.ratioPaint}% - 12px)`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  </div>
                </div>

                {/* 3. Presety */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: "1:2", val: 33, title: "Wash" },
                    { label: "1:1", val: 50, title: "Standard" },
                    { label: "2:1", val: 67, title: "Sytá" },
                    { label: "3:1", val: 75, title: "Hustá" },
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => handleRatioChange("paint", preset.val)}
                      className={`py-2 rounded-lg text-xs font-bold transition-all border flex flex-col items-center gap-1 ${
                        Math.abs(data.ratioPaint - preset.val) < 3
                          ? "bg-slate-800 text-white border-slate-600 shadow-sm"
                          : "bg-transparent text-slate-500 border-slate-800 hover:bg-slate-900 hover:text-slate-300"
                      }`}
                    >
                      <span>{preset.label}</span>
                      <span className="text-[8px] font-normal opacity-70 uppercase tracking-wide">
                        {preset.title}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Color Preview */}
            <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
              <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
                Odstín (Preview)
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="color"
                  value={data.hex}
                  onChange={(e) => setData({ ...data, hex: e.target.value })}
                  className="w-12 h-12 rounded cursor-pointer border-none bg-transparent"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={data.hex}
                    onChange={(e) => setData({ ...data, hex: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white uppercase outline-none focus:border-blue-500"
                    placeholder="#000000"
                  />
                </div>
              </div>
            </div>

            {/* POUŽITÍ V MODELECH */}
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
                <Box size={14} className="text-purple-400" /> Použití v modelech
              </h4>
              {usage.length > 0 ? (
                <div className="space-y-1">
                  {usage.map((k) => (
                    <div
                      key={k.id}
                      className="text-xs text-slate-300 flex items-center gap-2 bg-slate-900 p-2 rounded"
                    >
                      <ChevronRight size={10} className="text-slate-500" />
                      <span className="font-bold">{k.subject}</span>
                      <span>{k.name}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-600 italic">
                  Tato barva není přiřazena k žádnému modelu.
                </p>
              )}
            </div>

            <div className="pt-2">
              <FloatingTextarea
                label="Poznámky"
                value={data.notes || ""}
                onChange={(e) => setData({ ...data, notes: e.target.value })}
                height="h-24"
                labelColor="text-orange-400"
              />
            </div>
          </div>

          {/* FOOTER */}
          <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end rounded-b-xl">
            <button
              onClick={() => isFormValid && hasChanges && handleSaveWrapper()}
              disabled={!isFormValid || isSaving || !hasChanges}
              className={`px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all ${
                isFormValid && hasChanges && !isSaving
                  ? "bg-blue-600 hover:bg-blue-500 text-white"
                  : "bg-slate-700 text-slate-500 cursor-not-allowed"
              }`}
            >
              {isSaving ? (
                <Loader2 className="animate-spin" size={18} />
              ) : (
                <Save size={18} />
              )}{" "}
              Uložit
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaintDetailModal;
