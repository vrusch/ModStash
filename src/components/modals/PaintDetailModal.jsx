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
} from "lucide-react";
import {
  FloatingInput,
  FloatingTextarea,
  FloatingSelect,
} from "../ui/FormElements";
import { Normalizer } from "../../utils/normalizers";
// Importujeme nové dynamické API
import PaintAPI from "../../data/paints/PaintAPI";

const PaintDetailModal = ({
  paint,
  onClose,
  onSave,
  existingPaints,
  allKits,
}) => {
  // --- 1. INITIALIZATION & STATE ---

  // Pokud má barva ID, jde o editaci (Detail). Pokud ne, je to Nová barva.
  const isEditMode = !!paint.id;

  const [data, setData] = useState({
    brand: "",
    code: "",
    name: "",
    type: "Akryl",
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

  // Stav pro přidávání do mixu
  const [newMixPart, setNewMixPart] = useState({ paintId: "", ratio: 1 });

  // --- 2. LOGIKA (EFFECTS) ---

  // A) Načtení řad (pouze pokud měníme značku u nové barvy)
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

  // D) NAŠEPTÁVAČ (Autocomplete)
  useEffect(() => {
    // Našeptáváme jen pro: Novou barvu, Není Mix, Máme značku, Píšeme kód
    if (!data.isMix && data.brand && data.code && !isEditMode) {
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
  }, [data.brand, data.code, selectedSeries, isEditMode, data.isMix]);

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
      type: "Akryl",
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

  // --- 3. HANDLERS ---

  const handleSelectSuggestion = ([key, val]) => {
    setData((prev) => ({
      ...prev,
      code: val.displayCode || prev.code,
      name: val.name,
      type: val.type, // Změna typu triggerne načtení specifikací (Info box)
      finish: val.finish,
      hex: val.hex || prev.hex,
    }));
    setShowSuggestions(false);
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

  const addMixPart = () => {
    if (!newMixPart.paintId || newMixPart.ratio <= 0) return;
    const selectedPaint = existingPaints.find(
      (p) => p.id === newMixPart.paintId,
    );
    if (!selectedPaint) return;

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
    }));
    setNewMixPart({ paintId: "", ratio: 1 });
  };

  const isFormValid =
    data.name && (data.isMix || (data.brand && data.code)) && !duplicateError;

  // --- 4. RENDER ---

  return (
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
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

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
              <div className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase">
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
                <div
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
                    🧪 Vlastní Mix / Míchaná barva
                  </span>
                </div>
              )}

              {!data.isMix && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                  <div className="flex gap-3">
                    <div className="flex-1 relative">
                      <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 text-blue-400">
                        Výrobce/Značka
                      </label>
                      <select
                        className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 appearance-none cursor-pointer"
                        value={data.brand}
                        onChange={(e) => {
                          setData({ ...data, brand: e.target.value, code: "" });
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
                        selectedSeries ? `Kód (${selectedSeries}) *` : "Kód"
                      }
                      value={data.code}
                      onChange={(e) =>
                        setData({
                          ...data,
                          code: Normalizer.code(e.target.value),
                        })
                      }
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
            label="Odstín"
            value={data.name}
            onChange={(e) =>
              setData({ ...data, name: Normalizer.name(e.target.value) })
            }
            placeholder={data.isMix ? "Můj stínovací mix" : "flat black"}
            labelColor={data.isMix ? "text-purple-400" : "text-blue-400"}
            disabled={isEditMode}
          />

          <div className="flex gap-3">
            <FloatingSelect
              className="flex-1"
              label="Typ"
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
              options={[
                { value: "Akryl", label: "💧 Akryl" },
                { value: "Enamel", label: "🛢️ Enamel" },
                { value: "Lacquer", label: "☣️ Lacquer" },
                { value: "Olej", label: "🎨 Olej" },
                { value: "Pigment", label: "🏜️ Pigment" },
                { value: "Primer", label: "🛡️ Primer" },
              ]}
              disabled={isEditMode}
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
              disabled={isEditMode}
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
                      { value: "empty", label: "❌ Prázdné" },
                      { value: "wanted", label: "🛒 Koupit" },
                    ]
              }
            />
          </div>

          {/* INFO BOX SPECIFIKACÍ */}
          {currentSpec && (
            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-3 animate-in fade-in slide-in-from-top-1">
              <h4 className="text-blue-300 text-xs font-bold mb-1 flex items-center gap-1">
                <Info size={12} /> {currentSpec.title}
              </h4>
              <p className="text-slate-400 text-[11px] italic leading-tight mb-2">
                {currentSpec.description}
              </p>
              <div className="flex flex-col gap-1">
                {currentSpec.bestFor && (
                  <div className="flex items-start gap-2">
                    <Sparkles size={10} className="text-yellow-500 mt-0.5" />
                    <span className="text-[10px] text-slate-300">
                      <span className="font-bold text-slate-500">Použití:</span>{" "}
                      {currentSpec.bestFor}
                    </span>
                  </div>
                )}
                {currentSpec.safety && (
                  <div className="flex items-start gap-2">
                    <ShieldAlert size={10} className="text-orange-500 mt-0.5" />
                    <span className="text-[10px] text-slate-300">
                      <span className="font-bold text-slate-500">Safety:</span>{" "}
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
                <FlaskConical size={14} /> Receptura
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
                    .filter((p) => p.status === "in_stock")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} {p.code} {p.name}
                      </option>
                    ))}
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
                {data.mixParts?.map((part, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700 text-xs"
                  >
                    <span>
                      <span className="font-bold text-purple-400">
                        {part.ratio} dílů
                      </span>{" "}
                      - {part.brand} {part.code} {part.name}
                    </span>
                    <button
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          mixParts: prev.mixParts.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ŘEDĚNÍ */}
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Droplets size={14} className="text-blue-400" /> Ředění
            </h4>
            <div className="flex gap-3 items-end">
              <FloatingInput
                className="flex-[2]"
                label="Doporučené ředidlo"
                value={data.thinner || ""}
                onChange={(e) => setData({ ...data, thinner: e.target.value })}
                placeholder="Např. Tamiya X-20A"
                disabled={isEditMode}
              />
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 h-[42px]">
                <div className="text-center">
                  <label className="text-[8px] text-slate-500 font-bold block">
                    BARVA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                    placeholder="60"
                    value={data.ratioPaint}
                    onChange={(e) => handleRatioChange("paint", e.target.value)}
                  />
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="text-center">
                  <label className="text-[8px] text-slate-500 font-bold block">
                    ŘEDIDLO
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                    placeholder="40"
                    value={data.ratioThinner}
                    onChange={(e) =>
                      handleRatioChange("thinner", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Preview */}
          {!isEditMode && (
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
          )}

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
  );
};

export default PaintDetailModal;
