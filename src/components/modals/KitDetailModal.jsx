import React, { useState, useMemo } from "react";
import {
  Box,
  X,
  FileText,
  Palette,
  Layers,
  Hammer,
  Lock,
  Save,
  Loader2,
} from "lucide-react";
import KitInfoTab from "./kit/KitInfoTab";
import KitPaintsTab from "./kit/KitPaintsTab";
import KitResourcesTab from "./kit/KitResourcesTab";
import KitBuildTab from "./kit/KitBuildTab";
import ConfirmModal from "../ui/ConfirmModal";

/**
 * Modální okno pro detail modelu (Editace) nebo vytvoření nového modelu.
 * Obsahuje záložky: Info, Barvy, Doplňky, Stavba, Přílohy.
 *
 * @param {Object} props
 * @param {Object} props.kit - Data modelu.
 * @param {Function} props.onClose - Handler pro zavření modalu.
 * @param {Function} props.onSave - Handler pro uložení modelu.
 * @param {Array} props.projects - Seznam projektů (pro přiřazení modelu).
 * @param {Array} props.allPaints - Seznam všech barev (pro výběr barev k modelu).
 * @param {Array} props.allKits - Seznam všech modelů (pro detekci duplicit).
 * @param {Function} props.onQuickCreatePaint - Handler pro rychlé vytvoření chybějící barvy.
 * @param {Object} [props.preferences] - Uživatelské preference.
 * @param {string} [props.initialTab] - Počáteční aktivní záložka (default: "info").
 * @returns {JSX.Element}
 */
const KitDetailModal = ({
  kit,
  onClose,
  onSave,
  projects,
  allPaints,
  allKits,
  onQuickCreatePaint,
  preferences,
  initialTab = "info",
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [data, setData] = useState({
    ...kit,
    accessories: kit.accessories || [],
    paints: kit.paints || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  const isBuildLocked = data.status !== "wip";
  const isFormValid = data.brand && data.subject && data.scale;

  const isReadyToBuild = useMemo(() => {
    if (["finished", "scrap", "wishlist"].includes(data.status)) return false;

    const paints = data.paints || [];
    const accessories = data.accessories || [];

    if (paints.length === 0 && accessories.length === 0) return false;

    const accessoriesReady = accessories.every((a) => a.status === "owned");
    const paintsReady = paints.every((p) => {
      const stock = allPaints?.find((ap) => ap.id === p.id);
      return stock && ["in_stock", "low"].includes(stock.status);
    });

    return accessoriesReady && paintsReady;
  }, [data, allPaints]);

  const hasChanges = useMemo(() => {
    const initialData = {
      ...kit,
      accessories: kit.accessories || [],
      paints: kit.paints || [],
    };
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, kit]);

  const handleSaveWrapper = async () => {
    setIsSaving(true);
    try {
      const validPaints = (data.paints || []).filter((pLink) =>
        allPaints.some((ap) => ap.id === pLink.id),
      );

      // Sanitizace dat před uložením (Firestore nesmí dostat undefined)
      const dataToSave = {
        ...data,
        paints: validPaints,
        image: data.image ?? null,
        year: data.year ?? null,
        ean: data.ean ?? null,
        markings: data.markings ?? null,
        marketplace: data.marketplace ?? null,
        scalematesUrl: data.scalematesUrl ?? null,
        notes: data.notes ?? null,
      };

      await onSave(dataToSave);
      onClose();
    } catch (e) {
      console.error("Chyba při ukládání:", e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    if (hasChanges) {
      setShowCloseConfirm(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <ConfirmModal
        isOpen={showCloseConfirm}
        title="Neuložené změny"
        message="Máte neuložené změny. Opravdu chcete zavřít okno? Změny budou ztraceny."
        confirmText="Zahodit změny"
        isDestructive={true}
        onConfirm={onClose}
        onCancel={() => setShowCloseConfirm(false)}
      />
      <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
        <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 flex flex-col h-[90vh] shadow-2xl">
          <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex flex-col gap-3 rounded-t-xl">
            <div className="flex justify-between items-start">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                <Box size={16} /> {kit.id ? "Detail modelu" : "Nový model"}
                {isReadyToBuild && (
                  <span
                    className="flex items-center gap-1 text-[10px] font-bold rounded px-1.5 py-0.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ml-2"
                    title="Připraveno ke stavbě (Máte všechny barvy a doplňky)"
                  >
                    <Hammer size={12} /> Ready
                  </span>
                )}
              </h3>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-white p-1 bg-slate-800 rounded-full hover:bg-slate-700"
              >
                <X size={20} />
              </button>
            </div>
          </div>
          <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto">
            {["info", "paints", "resources", "build"].map((tab) => (
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
                {tab === "resources" && <Layers size={16} />}
                {tab === "build" &&
                  (isBuildLocked ? <Lock size={14} /> : <Hammer size={16} />)}
                <span className="capitalize hidden sm:inline">
                  {tab === "build"
                    ? "Stavba"
                    : tab === "resources"
                      ? "Zdroje"
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
              <KitInfoTab
                data={data}
                setData={setData}
                projects={projects}
                allKits={allKits}
                preferences={preferences}
              />
            )}
            {activeTab === "paints" && (
              <KitPaintsTab
                data={data}
                setData={setData}
                allPaints={allPaints}
                onQuickCreatePaint={onQuickCreatePaint}
              />
            )}
            {activeTab === "resources" && (
              <KitResourcesTab data={data} setData={setData} />
            )}
            {activeTab === "build" && !isBuildLocked && (
              <KitBuildTab data={data} setData={setData} />
            )}
          </div>
          <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end rounded-b-xl">
            <button
              onClick={() => isFormValid && hasChanges && handleSaveWrapper()}
              disabled={!isFormValid || isSaving || !hasChanges}
              className={`px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2 transition-all ${isFormValid && !isSaving && hasChanges ? "bg-blue-600 hover:bg-blue-500 text-white" : "bg-slate-700 text-slate-500 cursor-not-allowed"}`}
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

export default KitDetailModal;
