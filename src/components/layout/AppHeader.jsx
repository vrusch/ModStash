import React from "react";
import {
  Package,
  Folder,
  Plus,
  ShoppingCart,
  Box,
  Cloud,
  CloudCog,
  Search,
  Filter,
  XCircle,
  Paintbrush,
  Wifi,
  WifiOff,
} from "lucide-react";
import {
  AppLogo,
  CzechFlag,
  USUKFlag,
  SpanishFlag,
  GermanFlag,
} from "../ui/Icons";
import { FilterChip } from "../ui/FormElements";

/**
 * Hlavní hlavička aplikace.
 * Obsahuje logo, navigaci mezi pohledy (Kits, Projects, Paints, Shopping),
 * vyhledávání, filtrování a globální akce (nastavení, přidání položky).
 *
 * @param {Object} props
 * @param {Object} props.logic - Objekt s aplikační logikou (view, setView, searchTerm, setSearchTerm, atd.).
 * @param {Function} props.setShowSettings - Setter pro zobrazení modalu nastavení.
 * @param {Function} props.setIsNewKit - Setter pro indikaci nového modelu.
 * @param {Function} props.setActiveKit - Setter pro nastavení aktivního modelu (pro editaci/nový).
 * @param {Function} props.setIsNewProject - Setter pro indikaci nového projektu.
 * @param {Function} props.setActiveProject - Setter pro nastavení aktivního projektu.
 * @param {Function} props.setIsNewPaint - Setter pro indikaci nové barvy.
 * @param {Function} props.setActivePaint - Setter pro nastavení aktivní barvy.
 * @param {string} [props.activeUid] - ID aktuálně přihlášeného uživatele (pro zobrazení).
 * @param {boolean} props.isOnline - Indikátor online/offline stavu.
 * @param {Function} props.onShowAlert - Funkce pro zobrazení globálního alertu/toastu.
 * @param {string} props.language - Kód aktuálního jazyka (en, cs, es, de).
 * @param {Function} props.setShowLanguageModal - Setter pro zobrazení modalu výběru jazyka.
 * @returns {JSX.Element}
 */
const AppHeader = ({
  logic,
  setShowSettings,
  setIsNewKit,
  setActiveKit,
  setIsNewProject,
  setActiveProject,
  setIsNewPaint,
  setActivePaint,
  activeUid,
  isOnline,
  onShowAlert,
  language,
  setShowLanguageModal,
}) => {
  return (
    <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-md">
      <div className="max-w-md mx-auto px-4 py-4">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <AppLogo className="h-8 md:h-10" />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(true)}
              className="bg-slate-700/50 hover:bg-slate-700 text-blue-300 p-2 rounded-full border border-blue-500/20"
            >
              <CloudCog size={20} />
            </button>
            <button
              onClick={() => {
                if (logic.view === "kits") {
                  setIsNewKit(true);
                  setActiveKit({
                    status: "new",
                    brand: "",
                    catNum: "",
                    scale: "",
                    subject: "",
                    name: "",
                    projectId: null,
                    progress: 0,
                    todo: [],
                    accessories: [],
                  });
                } else if (logic.view === "projects") {
                  setIsNewProject(true);
                  setActiveProject({ status: "active", accessories: [] });
                } else if (logic.view === "paints") {
                  setIsNewPaint(true);
                  setActivePaint({
                    status: "in_stock",
                    brand: "",
                    code: "",
                    name: "",
                    type: "Akryl",
                    finish: "Matná",
                    hex: "#999999",
                    notes: "",
                    thinner: "",
                    ratioPaint: 60,
                    ratioThinner: 40,
                    isMix: false,
                    mixParts: [],
                  });
                } else {
                  onShowAlert(
                    "Pro přidání položky přepněte na Modely, Barvy nebo Projekty.",
                  );
                }
              }}
              className="p-2 rounded-full shadow text-white hover:brightness-110 bg-blue-600"
            >
              <Plus size={24} />
            </button>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-lg mb-3 gap-1 overflow-x-auto">
          <button
            onClick={() => logic.setView("kits")}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${logic.view === "kits" ? "bg-slate-700 text-white" : "text-slate-500"}`}
          >
            <Box size={16} /> Modely
          </button>
          <button
            onClick={() => logic.setView("projects")}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${logic.view === "projects" ? "bg-slate-700 text-white" : "text-slate-500"}`}
          >
            <Folder size={16} /> Projekty
          </button>
          <button
            onClick={() => logic.setView("paints")}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${logic.view === "paints" ? "bg-slate-700 text-blue-400" : "text-slate-500"}`}
          >
            <Paintbrush size={16} /> Barvy
          </button>
          <button
            onClick={() => logic.setView("shopping")}
            className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${logic.view === "shopping" ? "bg-slate-700 text-orange-400" : "text-slate-500"}`}
          >
            <ShoppingCart size={16} /> Nákup
          </button>
        </div>
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              size={16}
            />
            <input
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
              placeholder={
                logic.view === "kits"
                  ? "Hledat model..."
                  : logic.view === "paints"
                    ? "Hledat barvu..."
                    : "Hledat..."
              }
              value={logic.searchTerm}
              onChange={(e) => logic.setSearchTerm(e.target.value)}
            />
          </div>
          <button
            onClick={() => logic.setShowFilter(!logic.showFilter)}
            className={`p-2 w-10 h-10 rounded-lg border flex items-center justify-center transition-opacity shrink-0 ${logic.showFilter || logic.hasActiveFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"}`}
          >
            <Filter size={20} />
          </button>
        </div>
        {/* FILTER PANEL */}
        {logic.showFilter && (
          <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-3 animate-in slide-in-from-top-2">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-xs font-bold text-slate-500 uppercase">
                Filtrování
              </h4>
              {logic.hasActiveFilters && (
                <button
                  onClick={logic.clearFilters}
                  className="text-[10px] text-red-400 flex items-center gap-1 hover:underline"
                >
                  <XCircle size={12} /> Zrušit vše
                </button>
              )}
            </div>
            {logic.view === "kits" ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Stav modelu
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["new", "wip", "finished", "wishlist", "scrap"].map(
                      (s) => (
                        <FilterChip
                          key={s}
                          label={s}
                          active={logic.activeFilters.kitStatuses.includes(s)}
                          onClick={() => logic.toggleFilter("kitStatuses", s)}
                        />
                      ),
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Měřítko
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {logic.availableScales.map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={logic.activeFilters.scales.includes(s)}
                        onClick={() => logic.toggleFilter("scales", s)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Výrobce
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {logic.availableBrands.map((b) => (
                      <FilterChip
                        key={b}
                        label={b}
                        active={logic.activeFilters.brands.includes(b)}
                        onClick={() => logic.toggleFilter("brands", b)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : logic.view === "paints" ? (
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Výrobce barvy
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {logic.availablePaintBrands.map((b) => (
                      <FilterChip
                        key={b}
                        label={b}
                        active={logic.activeFilters.paintBrands.includes(b)}
                        onClick={() => logic.toggleFilter("paintBrands", b)}
                      />
                    ))}
                  </div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Typ barvy
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {logic.availablePaintTypes.map((t) => (
                      <FilterChip
                        key={t}
                        label={t}
                        active={logic.activeFilters.paintTypes.includes(t)}
                        onClick={() => logic.toggleFilter("paintTypes", t)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : logic.view === "projects" ? (
              <div>
                <span className="text-[10px] text-slate-600 font-bold block mb-1">
                  Stav projektu
                </span>
                <div className="flex flex-wrap gap-2">
                  {["planned", "active", "finished", "hold"].map((s) => (
                    <FilterChip
                      key={s}
                      label={s}
                      active={logic.activeFilters.projectStatuses.includes(s)}
                      onClick={() => logic.toggleFilter("projectStatuses", s)}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 italic">
                Filtry pro nákupní seznam zatím nejsou dostupné.
              </div>
            )}
          </div>
        )}
        <div className="flex justify-between px-1 text-[10px] text-slate-500">
          <div className="flex gap-1">
            <Cloud size={10} /> ID:{" "}
            <span className="font-mono text-blue-400">
              {activeUid?.substring(0, 8) || "..."}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`flex items-center gap-1 ${isOnline ? "text-green-500" : "text-orange-500"}`}
            >
              {isOnline ? <Wifi size={12} /> : <WifiOff size={12} />}
              {isOnline ? "Online" : "Offline"}
            </div>
            <button
              onClick={() => setShowLanguageModal(true)}
              className="cursor-pointer hover:scale-110 transition-transform"
              title="Změnit jazyk"
            >
              {language === "en" ? (
                <USUKFlag className="w-4 h-3 rounded shadow-sm" />
              ) : language === "es" ? (
                <SpanishFlag className="w-4 h-3 rounded shadow-sm" />
              ) : language === "de" ? (
                <GermanFlag className="w-4 h-3 rounded shadow-sm" />
              ) : (
                <CzechFlag className="w-4 h-3 rounded shadow-sm" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppHeader;
