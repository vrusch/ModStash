import React, { useState, useEffect, useMemo } from "react";
import {
  Palette,
  Trash2,
  Search,
  Plus,
  Check,
  ShoppingCart,
  Package,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import PaintAPI from "../../../data/paints/PaintAPI";

const KitPaintsTab = ({ data, setData, allPaints, onQuickCreatePaint }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [expandedBrands, setExpandedBrands] = useState({});

  // Search Effect (Omnibox Logic)
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(() => {
      const q = query.toLowerCase().replace(/[\s\-\.]/g, "");
      const searchResults = [];
      const brands = PaintAPI.getManufacturers();

      // Prohledáváme globální katalog
      for (const brand of brands) {
        const paints = PaintAPI.getBrandPaints(brand.id);
        if (!paints) continue;

        for (const [key, paintVal] of Object.entries(paints)) {
          const codeClean = (paintVal.displayCode || key)
            .toLowerCase()
            .replace(/[\s\-\.]/g, "");
          const nameClean = (paintVal.name || "").toLowerCase();

          if (codeClean.includes(q) || nameClean.includes(q)) {
            // Zkontrolujeme, zda už barvu máme ve skladu
            const localPaint = allPaints.find(
              (p) =>
                p.brand.toLowerCase() === brand.id.toLowerCase() &&
                p.code.toLowerCase().replace(/[\s\-\.]/g, "") === codeClean,
            );

            // Pokus o detekci typu a specifikace podle prefixu kódu (např. "XF" z "XF-1")
            const rawCode = paintVal.displayCode || key;
            const seriesMatch = rawCode.match(/^([A-Za-z]+)/); // Vezme písmena na začátku (XF, C, H...)
            const seriesPrefix = seriesMatch ? seriesMatch[1] : "";
            const spec = PaintAPI.getSpecForSeries(brand.id, seriesPrefix);

            searchResults.push({
              ...paintVal,
              id: key, // Catalog ID (e.g. XF-1)
              brandId: brand.id,
              brandName: brand.name,
              displayCode: paintVal.displayCode || key,
              localPaint: localPaint, // Pokud existuje, obsahuje ID a status z DB
              detectedType: spec ? spec.type : null,
              detectedThinner: spec ? spec.thinner : null,
            });
          }
          if (searchResults.length > 20) break;
        }
        if (searchResults.length > 20) break;
      }
      setResults(searchResults);
      setIsSearching(false);
    }, 300); // Debounce

    return () => clearTimeout(timeoutId);
  }, [query, allPaints]);

  const handleSelectResult = (res) => {
    let paintIdToAdd;

    if (res.localPaint) {
      // Barvu už máme, použijeme její ID
      paintIdToAdd = res.localPaint.id;
    } else {
      // Barvu nemáme -> Vytvoříme ji v nákupním seznamu (wanted)
      const newPaint = {
        brand: res.brandId,
        code: res.displayCode,
        name: res.name,
        // Použijeme detekovaný typ ze specifikace, jinak fallback na "acrylic"
        type: res.detectedType || res.type || "acrylic",
        finish: res.finish || "Matná",
        status: "wanted",
        hex: res.hex || "#999999",
        thinner: res.detectedThinner || res.thinner || "",
      };
      // Funkce vrátí ID nově vytvořené barvy
      paintIdToAdd = onQuickCreatePaint(newPaint);
    }

    // Přidáme barvu k modelu, pokud tam ještě není
    if (!data.paints?.some((p) => p.id === paintIdToAdd)) {
      setData((prev) => ({
        ...prev,
        paints: [...(prev.paints || []), { id: paintIdToAdd, note: "" }],
      }));
    }

    setQuery("");
    setResults([]);
  };

  const handleRemovePaint = (paintId) => {
    setData((prev) => ({
      ...prev,
      paints: prev.paints.filter((p) => p.id !== paintId),
    }));
  };

  const handleUpdatePaintNote = (paintId, note) => {
    setData((prev) => ({
      ...prev,
      paints: prev.paints.map((p) => (p.id === paintId ? { ...p, note } : p)),
    }));
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "in_stock":
        return <Package size={14} className="text-green-400" />;
      case "low":
        return <AlertTriangle size={14} className="text-yellow-400" />;
      case "wanted":
        return <ShoppingCart size={14} className="text-purple-400" />;
      default:
        return <AlertTriangle size={14} className="text-slate-500" />;
    }
  };

  // Grouping logic for Accordions
  const groupedPaints = useMemo(() => {
    if (!data.paints || data.paints.length === 0) return {};

    const groups = {};
    data.paints.forEach((paintLink) => {
      let fullPaint = allPaints.find((p) => p.id === paintLink.id);
      if (!fullPaint) {
        fullPaint = {
          id: paintLink.id,
          code: "???",
          name: "Neznámá barva",
          hex: "#333",
          status: "unknown",
          brand: "Ostatní",
        };
      }
      const brandName = fullPaint.brand || "Ostatní";
      if (!groups[brandName]) groups[brandName] = [];
      groups[brandName].push({ link: paintLink, detail: fullPaint });
    });
    return groups;
  }, [data.paints, allPaints]);

  const toggleBrand = (brand) => {
    setExpandedBrands((prev) => ({
      ...prev,
      [brand]: !prev[brand], // Toggle state (undefined = collapsed? No, let's make default expanded)
    }));
  };

  return (
    <div className="p-4 h-full flex flex-col space-y-4">
      {/* OMNIBOX SEARCH */}
      <div className="relative z-20">
        <div className="relative">
          <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
            <Search className="text-slate-500" size={16} />
          </div>
          <input
            type="text"
            className="w-full bg-slate-950 border border-blue-500/30 rounded-xl py-3 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-lg"
            placeholder="Přidat barvu (např. XF-1)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {isSearching && (
            <div className="absolute inset-y-0 right-3 flex items-center">
              <Loader2 className="animate-spin text-blue-500" size={16} />
            </div>
          )}
        </div>

        {/* RESULTS DROPDOWN */}
        {results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden ring-1 ring-white/10 max-h-60 overflow-y-auto animate-in fade-in zoom-in-95">
            {results.map((res) => (
              <button
                key={`${res.brandId}-${res.id}`}
                onClick={() => handleSelectResult(res)}
                className="w-full text-left p-2 hover:bg-blue-600/20 hover:text-blue-100 border-b border-slate-800 last:border-0 flex items-center gap-3 group transition-colors"
              >
                <div
                  className="w-5 h-5 rounded shadow-sm border border-slate-600 shrink-0"
                  style={{ backgroundColor: res.hex || "#000" }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm group-hover:text-blue-300">
                      {res.displayCode}
                    </span>
                    <span className="text-slate-400 text-xs truncate group-hover:text-blue-200">
                      {res.name}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {res.brandName}{" "}
                    {res.detectedType ? `• ${res.detectedType}` : ""}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  {res.localPaint ? (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      {res.localPaint.status === "in_stock" ? (
                        <>
                          <Check size={10} /> MÁM
                        </>
                      ) : (
                        <>
                          <ShoppingCart size={10} /> SEZNAM
                        </>
                      )}
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded">
                      <Plus size={10} /> PŘIDAT
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* LIST OF PAINTS */}
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
          <Palette size={14} className="text-blue-400" /> Barvy modelu (
          {data.paints?.length || 0})
        </h4>
      </div>

      <div className="space-y-2 flex-1 overflow-y-auto">
        {Object.keys(groupedPaints).length > 0 ? (
          Object.entries(groupedPaints).map(([brand, items]) => {
            // Defaultně rozbaleno, pokud není explicitně false
            const isExpanded = expandedBrands[brand] !== false;

            return (
              <div
                key={brand}
                className="border border-slate-700 rounded-lg overflow-hidden bg-slate-800/30"
              >
                <button
                  onClick={() => toggleBrand(brand)}
                  className="w-full flex items-center justify-between p-2 bg-slate-800 hover:bg-slate-700 transition-colors"
                >
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                    {brand}
                    <span className="bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded text-[10px]">
                      {items.length}
                    </span>
                  </span>
                  {isExpanded ? (
                    <ChevronUp size={14} className="text-slate-500" />
                  ) : (
                    <ChevronDown size={14} className="text-slate-500" />
                  )}
                </button>

                {isExpanded && (
                  <div className="p-2 space-y-2 bg-slate-900/30 border-t border-slate-700">
                    {items.map(({ link, detail }, idx) => (
                      <div
                        key={`${link.id}_${idx}`}
                        className="bg-slate-800 p-2 rounded border border-slate-700 flex flex-col gap-2 group hover:border-slate-600 transition-colors"
                      >
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="relative">
                              <div
                                className="w-8 h-8 rounded border border-slate-600 shadow-sm"
                                style={{ backgroundColor: detail.hex }}
                              ></div>
                              <div className="absolute -bottom-1 -right-1 bg-slate-900 rounded-full p-0.5 border border-slate-700">
                                {getStatusIcon(detail.status)}
                              </div>
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-bold text-white truncate">
                                  {detail.code}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 truncate">
                                {detail.name}
                              </div>
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemovePaint(link.id)}
                            className="text-slate-600 hover:text-red-400 p-2 transition-colors"
                            title="Odebrat z modelu"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        <input
                          className="w-full bg-slate-900/50 border border-slate-700/50 rounded px-2 py-1 text-[11px] text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500/50 focus:bg-slate-900 transition-all"
                          placeholder="Poznámka (např. trup, kokpit...)"
                          value={link.note || ""}
                          onChange={(e) =>
                            handleUpdatePaintNote(link.id, e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="text-center py-10 text-slate-600 italic flex flex-col items-center gap-2">
            <Palette size={32} className="opacity-20" />
            <p>Zatím žádné přiřazené barvy.</p>
            <p className="text-xs opacity-50">
              Použijte vyhledávání nahoře pro přidání.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default KitPaintsTab;
