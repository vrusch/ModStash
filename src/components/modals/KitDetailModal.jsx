import React, { useState, useMemo } from "react";
import {
  Box,
  X,
  FileText,
  Palette,
  Layers,
  Hammer,
  Lock,
  Paperclip,
  Search,
  Check,
  Plus,
  Trash2,
  ArrowRight,
  ExternalLink,
  ImageIcon,
  BookOpen,
  Save,
  Loader2,
  ChevronRight,
  FlaskConical,
  Droplets,
  Package,
  Wand2,
} from "lucide-react";
import {
  FloatingInput,
  FloatingTextarea,
  FloatingSelect,
} from "../ui/FormElements";
import { Normalizer } from "../../utils/normalizers";
import { safeRender } from "../../utils/helpers";
import MASTER_CATALOG from "../../data/catalog.json";
import BRANDS from "../../data/brands.json";

const KitDetailModal = ({
  kit,
  onClose,
  onSave,
  projects,
  allPaints,
  onQuickCreatePaint,
  initialTab = "info",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState({
    ...kit,
    accessories: kit.accessories || [],
    paints: kit.paints || [],
  });
  const [newTodo, setNewTodo] = useState("");
  const [newAttachment, setNewAttachment] = useState({
    name: "",
    url: "",
    type: "manual",
  });
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });
  const [isSaving, setIsSaving] = useState(false);
  const [paintSearch, setPaintSearch] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const isScaleValid = (s) => !s || /^\d+\/\d+$/.test(s);
  const isBuildLocked = data.status !== "wip";
  const isFormValid = data.brand && data.subject && data.scale;

  const addTodo = () => {
    if (newTodo.trim()) {
      setData((d) => ({
        ...d,
        todo: [
          ...(d.todo || []),
          { id: Date.now(), text: newTodo, done: false },
        ],
      }));
      setNewTodo("");
    }
  };
  const addAttachment = () => {
    if (newAttachment.name.trim() && newAttachment.url.trim()) {
      setData({
        ...data,
        attachments: [
          ...(data.attachments || []),
          { id: Date.now(), ...newAttachment },
        ],
      });
      setNewAttachment({ name: "", url: "", type: "manual" });
    }
  };
  const deleteAttachment = (id) => {
    setData({
      ...data,
      attachments: data.attachments.filter((a) => a.id !== id),
    });
  };
  const addAccessory = () => {
    if (!newAccessory.name.trim()) return;
    setData({
      ...data,
      accessories: [
        ...(data.accessories || []),
        { id: Date.now(), ...newAccessory },
      ],
    });
    setNewAccessory({ name: "", status: "owned", url: "" });
  };
  const deleteAccessory = (id) => {
    setData({
      ...data,
      accessories: data.accessories.filter((a) => a.id !== id),
    });
  };
  const handleAddPaint = (paintId) => {
    setData((prev) => {
      if (prev.paints?.some((p) => p.id === paintId)) return prev;
      return {
        ...prev,
        paints: [...(prev.paints || []), { id: paintId, note: "" }],
      };
    });
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

  const rackPaints = useMemo(() => {
    if (!selectedBrand) return { inventory: [], catalog: [] };
    const searchNormalized = Normalizer.search(paintSearch);
    const inventory = allPaints.filter((p) => {
      const isAlreadyAdded = data.paints?.some((kp) => kp.id === p.id);
      const matchesBrand = p.brand === selectedBrand;
      const matchesSearch =
        !paintSearch ||
        Normalizer.search(p.code).includes(searchNormalized) ||
        Normalizer.search(p.name).includes(searchNormalized);
      return !isAlreadyAdded && matchesBrand && matchesSearch;
    });
    const catalog = Object.entries(MASTER_CATALOG).filter(([key, val]) => {
      let brandFromKey = "Jiné";
      if (key.startsWith("TAMIYA")) brandFromKey = "Tamiya";
      else if (key.startsWith("GUNZE")) brandFromKey = "Gunze";
      else if (key.startsWith("AKINTERACTIVE")) brandFromKey = "AK Interactive";
      else if (key.startsWith("VALLEJO")) brandFromKey = "Vallejo";
      else if (key.startsWith("MRP")) brandFromKey = "MRP";
      else if (key.startsWith("AMMO")) brandFromKey = "Ammo by MIG";
      else if (key.startsWith("HATAKA")) brandFromKey = "Hataka";
      const matchesBrand = brandFromKey === selectedBrand;
      const matchesSearch =
        !paintSearch ||
        Normalizer.search(val.displayCode).includes(searchNormalized) ||
        Normalizer.search(val.name).includes(searchNormalized);
      const inInventory = allPaints.some(
        (p) =>
          p.id === Normalizer.generateId(key.split("_")[0], val.displayCode),
      );
      return matchesBrand && matchesSearch && !inInventory;
    });
    return { inventory, catalog };
  }, [allPaints, data.paints, paintSearch, selectedBrand]);

  const handleCatalogAdd = (key, val) => {
    let brand = "Neznámý";
    if (key.startsWith("TAMIYA")) brand = "Tamiya";
    else if (key.startsWith("GUNZE")) brand = "Gunze";
    else if (key.startsWith("AKINTERACTIVE")) brand = "AK Interactive";
    else if (key.startsWith("VALLEJO")) brand = "Vallejo";
    else if (key.startsWith("MRP")) brand = "MRP";
    else if (key.startsWith("AMMO")) brand = "Ammo by MIG";
    else if (key.startsWith("HATAKA")) brand = "Hataka";
    const newId = onQuickCreatePaint({
      brand,
      code: val.displayCode,
      name: val.name,
      type: val.type,
      finish: val.finish,
      hex: val.hex,
      status: "wanted",
    });
    handleAddPaint(newId);
  };
  const handleCustomCreate = () => {
    const newId = onQuickCreatePaint({
      brand: selectedBrand,
      code: paintSearch || "???",
      name: "Nová barva",
      type: "Akryl",
      finish: "Matná",
      hex: "#cccccc",
      status: "wanted",
    });
    handleAddPaint(newId);
  };
  const handleSaveWrapper = async () => {
    setIsSaving(true);
    try {
      const validPaints = (data.paints || []).filter((pLink) =>
        allPaints.some((ap) => ap.id === pLink.id),
      );
      await onSave({ ...data, paints: validPaints });
      onClose();
    } catch (e) {
      console.error("Chyba při ukládání:", e);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 flex flex-col h-[90vh] shadow-2xl">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex flex-col gap-3 rounded-t-xl">
          <div className="flex justify-between items-start">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <Box size={16} /> Detail Modelu
            </h3>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full hover:bg-slate-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="space-y-4 pt-2">
            <div className="grid grid-cols-2 sm:flex gap-3">
              <FloatingInput
                className="col-span-2 sm:flex-1"
                label="Výrobce *"
                value={data.brand}
                onChange={(e) =>
                  setData({ ...data, brand: Normalizer.brand(e.target.value) })
                }
                placeholder="Kinetic"
                labelColor="text-blue-400"
              />
              <FloatingInput
                className="col-span-1 sm:w-20"
                label="Měřítko *"
                value={data.scale}
                onChange={(e) => setData({ ...data, scale: e.target.value })}
                placeholder="1/48"
                labelColor="text-blue-400"
                classNameInput={
                  !isScaleValid(data.scale) ? "border-red-500" : ""
                }
              />
              <FloatingInput
                className="col-span-1 sm:w-24"
                label="Kat. č."
                value={data.catNum}
                onChange={(e) => setData({ ...data, catNum: e.target.value })}
                placeholder="48000"
              />
            </div>
            <div className="flex gap-3">
              <FloatingInput
                className="flex-1"
                label="Předloha *"
                value={data.subject || ""}
                onChange={(e) => setData({ ...data, subject: e.target.value })}
                placeholder="TF-104G"
                labelColor="text-blue-400"
              />
              <FloatingInput
                className="flex-[1.5]"
                label="Název"
                value={data.name}
                onChange={(e) =>
                  setData({ ...data, name: Normalizer.name(e.target.value) })
                }
                placeholder="Starfighter"
              />
            </div>
          </div>
        </div>
        <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto">
          {["info", "paints", "parts", "build", "files"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                (!isBuildLocked || tab !== "build") && setActiveTab(tab)
              }
              disabled={tab === "build" && isBuildLocked}
              className={`flex-1 py-3 px-4 text-sm font-medium flex justify-center items-center gap-2 whitespace-nowrap ${activeTab === tab ? "text-blue-400 border-b-2 border-blue-400" : tab === "build" && isBuildLocked ? "text-slate-700 cursor-not-allowed" : "text-slate-500 hover:text-slate-300"}`}
            >
              {tab === "info" && <FileText size={16} />}
              {tab === "paints" && <Palette size={16} />}
              {tab === "parts" && <Layers size={16} />}
              {tab === "build" &&
                (isBuildLocked ? <Lock size={14} /> : <Hammer size={16} />)}
              {tab === "files" && <Paperclip size={16} />}
              <span className="capitalize hidden sm:inline">
                {tab === "files"
                  ? "Přílohy"
                  : tab === "build"
                    ? "Stavba"
                    : tab === "parts"
                      ? "Doplňky"
                      : tab === "paints"
                        ? "Barvy"
                        : "Info"}
              </span>
            </button>
          ))}
        </div>
        <div
          className={`flex-1 p-0 bg-slate-900 ${activeTab === "paints" ? "overflow-hidden flex flex-col" : "overflow-y-auto"}`}
        >
          {activeTab === "info" && (
            <div className="space-y-4 p-4">
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Status
                </label>
                <select
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none"
                >
                  <option value="new">📦 Skladem</option>
                  <option value="wip">🚧 Rozestavěno</option>
                  <option value="finished">🏆 Hotovo</option>
                  <option value="wishlist">🛒 Chci koupit</option>
                  <option value="scrap">♻️ Vrakoviště</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Projekt
                </label>
                <select
                  value={data.projectId || ""}
                  onChange={(e) =>
                    setData({ ...data, projectId: e.target.value || null })
                  }
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white outline-none"
                >
                  <option value="">-- Žádný --</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <FloatingTextarea
                  label="Poznámky"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  height="h-32"
                />
              </div>
              <p className="text-[10px] text-blue-400/50 font-bold">
                * tyto údaje jsou povinné
              </p>
            </div>
          )}

          {/* --- ZÁLOŽKA BARVY (REGÁLOVÝ DESIGN) --- */}
          {activeTab === "paints" && (
            <div className="flex flex-col h-full relative">
              <div className="bg-slate-950 border-b border-slate-800 p-3 shrink-0">
                <label className="text-[10px] font-bold text-slate-500 uppercase block mb-2">
                  KROK 1: Vyber výrobce
                </label>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  <button
                    onClick={() =>
                      setSelectedBrand(
                        selectedBrand === "Vlastní Mix" ? "" : "Vlastní Mix",
                      )
                    }
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                      selectedBrand === "Vlastní Mix"
                        ? "bg-purple-600 text-white border-purple-500 shadow-lg shadow-purple-900/50 scale-105"
                        : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                    }`}
                  >
                    🧪 Mixy
                  </button>
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() =>
                        setSelectedBrand(brand === selectedBrand ? "" : brand)
                      }
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
                        selectedBrand === brand
                          ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50 scale-105"
                          : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-900 relative">
                {/* POKUD JE VYBRANÁ ZNAČKA -> UKAZUJEME "REGÁL" S BARVAMI */}
                {selectedBrand ? (
                  <div className="p-3">
                    {/* Search Bar v kontextu značky */}
                    <div className="sticky top-0 z-10 bg-slate-900 pb-3">
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Search
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                            size={14}
                          />
                          <input
                            className="w-full bg-slate-800 border border-slate-600 rounded p-2 pl-9 text-xs text-white focus:border-blue-500 outline-none placeholder-slate-500"
                            placeholder={`Hledat v katalogu ${selectedBrand} (kód, název)...`}
                            value={paintSearch}
                            onChange={(e) => setPaintSearch(e.target.value)}
                            autoFocus
                          />
                          {paintSearch && (
                            <button
                              onClick={() => setPaintSearch("")}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                        {/* --- TLAČÍTKO "ZPĚT" (FAJFKA) --- */}
                        <button
                          onClick={() => setSelectedBrand("")}
                          className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg shrink-0 flex items-center justify-center transition-colors"
                          title="Hotovo / Zpět"
                        >
                          <Check size={20} />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedBrand === "Vlastní Mix" ? (
                        /* Sekce pro Mixy v detailu modelu */
                        <div>
                          <h4 className="text-[10px] font-bold text-purple-500 uppercase mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                            <FlaskConical size={10} /> Moje Mixy (
                            {allPaints.filter((p) => p.isMix).length})
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {allPaints
                              .filter(
                                (p) =>
                                  p.isMix &&
                                  (!paintSearch ||
                                    p.name
                                      .toLowerCase()
                                      .includes(paintSearch.toLowerCase())),
                              )
                              .map((p) => (
                                <div
                                  key={p.id}
                                  onClick={() => handleAddPaint(p.id)}
                                  className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-purple-500 p-2 rounded cursor-pointer flex items-center gap-2 transition-colors"
                                >
                                  <div className="w-6 h-6 rounded border border-slate-600 shrink-0 flex items-center justify-center bg-slate-900">
                                    <FlaskConical
                                      size={12}
                                      className="text-white opacity-50"
                                    />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="text-xs font-bold text-white">
                                      {p.code}
                                    </div>
                                    <div className="text-[10px] text-slate-400 truncate">
                                      {p.name}
                                    </div>
                                  </div>
                                  <Plus
                                    size={14}
                                    className="ml-auto text-purple-500"
                                  />
                                </div>
                              ))}
                            {allPaints.filter((p) => p.isMix).length === 0 && (
                              <p className="text-xs text-slate-500 italic col-span-2 text-center">
                                Zatím žádné vlastní mixy.
                              </p>
                            )}
                          </div>
                        </div>
                      ) : (
                        /* Standardní barvy */
                        <>
                          {/* Skladové zásoby */}
                          {rackPaints.inventory.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-green-500 uppercase mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                                <Package size={10} /> Máš skladem (
                                {rackPaints.inventory.length})
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {rackPaints.inventory.map((p) => (
                                  <div
                                    key={p.id}
                                    onClick={() => handleAddPaint(p.id)}
                                    className="bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-blue-500 p-2 rounded cursor-pointer flex items-center gap-2 transition-colors"
                                  >
                                    <div
                                      className="w-6 h-6 rounded border border-slate-600 shrink-0"
                                      style={{ backgroundColor: p.hex }}
                                    ></div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-white">
                                        {p.code}
                                      </div>
                                      <div className="text-[10px] text-slate-400 truncate">
                                        {p.name}
                                      </div>
                                    </div>
                                    <Check
                                      size={14}
                                      className="ml-auto text-green-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Katalog */}
                          {rackPaints.catalog.length > 0 && (
                            <div>
                              <h4 className="text-[10px] font-bold text-purple-400 uppercase mb-2 flex items-center gap-1 border-b border-slate-800 pb-1">
                                <Wand2 size={10} /> Katalog (Přidat do nákupu)
                              </h4>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {rackPaints.catalog.map(([key, val]) => (
                                  <div
                                    key={key}
                                    onClick={() => handleCatalogAdd(key, val)}
                                    className="bg-slate-800/50 hover:bg-slate-800 border border-slate-800 hover:border-purple-500 p-2 rounded cursor-pointer flex items-center gap-2 transition-colors group"
                                  >
                                    <div
                                      className="w-6 h-6 rounded border border-slate-700 shrink-0 opacity-80"
                                      style={{ backgroundColor: val.hex }}
                                    ></div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-bold text-slate-300 group-hover:text-white">
                                        {val.displayCode}
                                      </div>
                                      <div className="text-[10px] text-slate-500 group-hover:text-slate-400 truncate">
                                        {val.name}
                                      </div>
                                    </div>
                                    <Plus
                                      size={14}
                                      className="ml-auto text-slate-600 group-hover:text-purple-400"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </>
                      )}

                      {/* Empty State / Custom Create */}
                      {selectedBrand !== "Vlastní Mix" &&
                        rackPaints.inventory.length === 0 &&
                        rackPaints.catalog.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-xs text-slate-500 mb-2">
                              Žádná shoda v katalogu.
                            </p>
                            <button
                              onClick={handleCustomCreate}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-4 py-2 rounded border border-slate-700"
                            >
                              + Vytvořit vlastní barvu
                            </button>
                          </div>
                        )}
                    </div>
                  </div>
                ) : (
                  /* POKUD NENÍ VYBRÁNA ZNAČKA -> UKAZUJEME RECEPT (SEZNAM PŘIŘAZENÝCH) */
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
                        <Palette size={14} className="text-blue-400" /> Recept
                        modelu ({data.paints?.length || 0})
                      </h4>
                    </div>

                    {data.paints && data.paints.length > 0 ? (
                      <div className="space-y-2 pb-20">
                        {data.paints.map((paintLink, idx) => {
                          let fullPaint = allPaints.find(
                            (p) => p.id === paintLink.id,
                          );
                          if (!fullPaint) {
                            fullPaint = {
                              id: paintLink.id,
                              brand: "Neznámý",
                              code: "???",
                              name: "Neznámá barva (Smazáno)",
                              hex: "#333333",
                              status: "scrap",
                              isOrphan: true,
                            };
                          }

                          return (
                            <div
                              key={`${paintLink.id}_${idx}`}
                              className={`bg-slate-800 p-2 rounded border flex flex-col gap-2 ${fullPaint.isOrphan ? "border-red-500/50 opacity-80" : "border-slate-700"}`}
                            >
                              <div className="flex justify-between items-start">
                                <div className="flex items-center gap-3 overflow-hidden">
                                  <div
                                    className="w-8 h-8 rounded border border-slate-600 shrink-0 shadow-sm flex items-center justify-center bg-slate-900"
                                    style={{ backgroundColor: fullPaint.hex }}
                                  >
                                    {!fullPaint.hex && (
                                      <span className="text-[8px]">?</span>
                                    )}
                                    {fullPaint.isMix && (
                                      <FlaskConical
                                        size={12}
                                        className="text-white opacity-50"
                                      />
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-white">
                                        {fullPaint.code}
                                      </span>
                                      {fullPaint.brand && (
                                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1 rounded border border-slate-800">
                                          {fullPaint.brand}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`text-xs truncate ${fullPaint.isOrphan ? "text-red-400 italic" : "text-slate-400"}`}
                                    >
                                      {fullPaint.name}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex flex-col items-end gap-1">
                                  <button
                                    onClick={() =>
                                      handleRemovePaint(paintLink.id)
                                    }
                                    className="text-slate-600 hover:text-red-400 p-1"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                  {!fullPaint.isOrphan && (
                                    <span
                                      className={`text-[9px] px-1.5 rounded font-bold uppercase ${
                                        fullPaint.status === "in_stock"
                                          ? "text-green-500"
                                          : fullPaint.status === "low"
                                            ? "text-orange-500"
                                            : "text-red-500"
                                      }`}
                                    >
                                      {fullPaint.status === "in_stock"
                                        ? "OK"
                                        : "Koupit"}
                                    </span>
                                  )}
                                  {fullPaint.isOrphan && (
                                    <span className="text-[9px] text-red-500 font-bold uppercase">
                                      CHYBÍ
                                    </span>
                                  )}
                                </div>
                              </div>
                              <input
                                className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 placeholder-slate-600 outline-none focus:border-blue-500"
                                placeholder="Poznámka (např. trup, kokpit...)"
                                value={paintLink.note || ""}
                                onChange={(e) =>
                                  handleUpdatePaintNote(
                                    paintLink.id,
                                    e.target.value,
                                  )
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-slate-600 text-center">
                        <ArrowRight
                          size={32}
                          className="mb-2 opacity-20 -rotate-90"
                        />
                        <p className="text-sm">
                          Vyber nahoře značku a přidej barvy.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "parts" && (
            <div className="space-y-4 p-4">
              <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} /> Doplňky pro tento model
                </h4>
                <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700">
                  <input
                    className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                    placeholder="Název (např. Eduard Plechy)"
                    value={newAccessory.name}
                    onChange={(e) =>
                      setNewAccessory({ ...newAccessory, name: e.target.value })
                    }
                  />
                  <div className="flex gap-2">
                    <select
                      className="bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
                      value={newAccessory.status}
                      onChange={(e) =>
                        setNewAccessory({
                          ...newAccessory,
                          status: e.target.value,
                        })
                      }
                    >
                      <option value="owned">Mám</option>
                      <option value="wanted">Koupit</option>
                    </select>
                    <input
                      className="flex-1 bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white"
                      placeholder="URL obchodu..."
                      value={newAccessory.url}
                      onChange={(e) =>
                        setNewAccessory({
                          ...newAccessory,
                          url: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={addAccessory}
                      className="bg-green-600 text-white px-3 rounded"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.accessories?.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between bg-slate-800 p-2 rounded border border-slate-700"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {acc.status === "owned" ? (
                          <Check
                            size={14}
                            className="text-green-400 shrink-0"
                          />
                        ) : (
                          <Package
                            size={14}
                            className="text-purple-400 shrink-0"
                          />
                        )}
                        <div className="min-w-0">
                          <p className="text-sm text-white truncate">
                            {acc.name}
                          </p>
                          {acc.url && (
                            <a
                              href={acc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                            >
                              <ExternalLink size={10} /> Odkaz
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAccessory(acc.id)}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "build" && !isBuildLocked && (
            <div className="space-y-4 p-4">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
                <div className="flex justify-between items-end mb-4 px-1">
                  <div>
                    <span className="text-[10px] font-bold text-orange-500 block tracking-wider mb-1">
                      DOKONČENO
                    </span>
                    <span className="text-4xl font-bold text-white leading-none">
                      {data.progress}
                      <span className="text-sm text-slate-500 font-normal ml-1">
                        %
                      </span>
                    </span>
                  </div>
                  <Hammer size={24} className="text-slate-700 mb-1" />
                </div>

                {/* Slider */}
                <div className="relative h-8 mb-6 flex items-center">
                  {/* Track */}
                  <div className="absolute inset-x-0 h-3 rounded-full overflow-hidden flex bg-slate-800">
                    <div
                      style={{ width: `${data.progress}%` }}
                      className="bg-orange-500 h-full transition-all duration-100 shadow-[0_0_10px_rgba(249,115,22,0.5)]"
                    />
                  </div>
                  {/* Input */}
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={data.progress}
                    onChange={(e) =>
                      setData({ ...data, progress: Number(e.target.value) })
                    }
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  {/* Thumb */}
                  <div
                    className="absolute h-6 w-6 bg-white rounded-full shadow-lg border-2 border-slate-900 pointer-events-none transition-all duration-100 flex items-center justify-center"
                    style={{
                      left: `calc(${data.progress}% - 12px)`,
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-slate-900 rounded-full" />
                  </div>
                </div>

                {/* Presets */}
                <div className="flex justify-between gap-2">
                  {[0, 25, 50, 75, 100].map((val) => (
                    <button
                      key={val}
                      onClick={() => setData({ ...data, progress: val })}
                      className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all border ${
                        data.progress === val
                          ? "bg-slate-800 text-white border-slate-600 shadow-sm"
                          : "bg-transparent text-slate-500 border-slate-800 hover:bg-slate-900 hover:text-slate-300"
                      }`}
                    >
                      {val}%
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2">Plán</h4>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                    placeholder="Nový úkol..."
                  />
                  <button
                    onClick={addTodo}
                    className="bg-blue-600 text-white p-2 rounded"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-1">
                  {data.todo?.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-2 bg-slate-800/50 p-2 rounded group"
                    >
                      <input
                        type="checkbox"
                        checked={task.done}
                        onChange={() =>
                          setData((d) => ({
                            ...d,
                            todo: d.todo.map((t) =>
                              t.id === task.id ? { ...t, done: !t.done } : t,
                            ),
                          }))
                        }
                        className="rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-0"
                      />
                      <span
                        className={`flex-1 text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}
                      >
                        {task.text}
                      </span>
                      <button
                        onClick={() =>
                          setData((d) => ({
                            ...d,
                            todo: d.todo.filter((t) => t.id !== task.id),
                          }))
                        }
                        className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
          {activeTab === "files" && (
            <div className="space-y-6 p-4">
              <div className="bg-slate-800 p-4 rounded-xl border border-slate-700">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-300">
                    Scalemates
                  </h4>
                  <img
                    src="https://www.scalemates.com/favicon.ico"
                    alt="SM"
                    className="w-4 h-4 opacity-50"
                  />
                </div>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() =>
                      window.open(
                        `https://www.scalemates.com/search.php?q=${encodeURIComponent(data.brand + " " + data.catNum + " " + data.name)}`,
                        "_blank",
                      )
                    }
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs px-3 py-2 rounded border border-blue-500/30 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Search size={14} /> Najít kit
                  </button>
                  <input
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 text-xs text-white"
                    placeholder="URL..."
                    value={data.scalematesUrl || ""}
                    onChange={(e) =>
                      setData({ ...data, scalematesUrl: e.target.value })
                    }
                  />
                </div>
                {data.scalematesUrl && (
                  <a
                    href={data.scalematesUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-center bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded transition-colors"
                  >
                    Otevřít stránku kitu
                  </a>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                  <Paperclip size={16} /> Knihovna odkazů
                </h4>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mb-3">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      className="col-span-2 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                      placeholder="Název"
                      value={newAttachment.name}
                      onChange={(e) =>
                        setNewAttachment({
                          ...newAttachment,
                          name: e.target.value,
                        })
                      }
                    />
                    <select
                      className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white"
                      value={newAttachment.type}
                      onChange={(e) =>
                        setNewAttachment({
                          ...newAttachment,
                          type: e.target.value,
                        })
                      }
                    >
                      <option value="manual">Návod</option>
                      <option value="ref">Fotky</option>
                      <option value="book">Kniha</option>
                      <option value="video">Video</option>
                    </select>
                  </div>
                  <div className="flex gap-2">
                    <input
                      className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white"
                      placeholder="URL..."
                      value={newAttachment.url}
                      onChange={(e) =>
                        setNewAttachment({
                          ...newAttachment,
                          url: e.target.value,
                        })
                      }
                    />
                    <button
                      onClick={addAttachment}
                      className="bg-purple-600 text-white px-4 rounded"
                    >
                      <Plus size={18} />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {data.attachments?.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700 group"
                    >
                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-3 flex-1 overflow-hidden hover:opacity-80 transition-opacity"
                      >
                        <div
                          className={`p-2 rounded shrink-0 ${att.type === "manual" ? "bg-blue-500/20 text-blue-400" : att.type === "ref" ? "bg-green-500/20 text-green-400" : att.type === "book" ? "bg-orange-500/20 text-orange-400" : "bg-slate-700 text-slate-400"}`}
                        >
                          {att.type === "manual" && <FileText size={16} />}
                          {att.type === "ref" && <ImageIcon size={16} />}
                          {att.type === "book" && <BookOpen size={16} />}
                          {att.type === "video" && <ExternalLink size={16} />}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {att.name}
                          </p>
                        </div>
                      </a>
                      <button
                        onClick={() => deleteAttachment(att.id)}
                        className="text-slate-600 hover:text-red-400 p-2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end rounded-b-xl">
          <button
            onClick={() => isFormValid && handleSaveWrapper()}
            disabled={!isFormValid || isSaving}
            className={`px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all ${isFormValid && !isSaving ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
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

export default KitDetailModal;
