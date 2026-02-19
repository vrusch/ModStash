import React, { useState } from "react";
import {
  Package,
  Folder,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  Layers,
  Loader2,
  ShoppingBag,
  Paintbrush,
  Trash2,
  Palette,
} from "lucide-react";
import brandsData from "./data/brands.json";
import masterCatalog from "./data/catalog.json";
import ConfirmModal from "./components/ui/ConfirmModal";
import KitCard from "./components/cards/KitCard";
import PaintCard from "./components/cards/PaintCard";
import ProjectCard from "./components/cards/ProjectCard";
import ShoppingAccessoryCard from "./components/cards/ShoppingAccessoryCard";
import SettingsModal from "./components/modals/SettingsModal";
import ProjectDetailModal from "./components/modals/ProjectDetailModal";
import LanguageModal from "./components/modals/LanguageModal";
import KitDetailModal from "./components/modals/KitDetailModal";
import PaintDetailModal from "./components/modals/PaintDetailModal";
import { useAuth } from "./hooks/useAuth";
import { useInventory } from "./hooks/useInventory";
import { useAppLogic } from "./hooks/useAppLogic";
import AppHeader from "./components/layout/AppHeader";

// ==========================================
// 🔧 KONFIGURACE A KONSTANTY
// ==========================================

//const APP_VERSION = "v2.29.9-refactoring-phase 6";

const BRANDS = brandsData;
const MASTER_CATALOG = masterCatalog;
const APP_VERSION = import.meta.env.PACKAGE_VERSION || "Dev";

// ==========================================
// 🧩 SUB-KOMPONENTY (UI Elements)
// ==========================================

// ==========================================
// 🚀 HLAVNÍ APLIKACE (App)
// ==========================================

export default function App() {
  const [showSettings, setShowSettings] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [language, setLanguage] = useState("cs");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDestructive: false,
    confirmText: "Ano",
    showCancel: true,
  });
  const [activeKit, setActiveKit] = useState(null);
  const [isNewKit, setIsNewKit] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [activePaint, setActivePaint] = useState(null);
  const [isNewPaint, setIsNewPaint] = useState(false);

  const requestConfirm = (
    title,
    message,
    onConfirm,
    isDestructive = false,
    confirmText = "Ano",
    showCancel = true,
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        if (onConfirm) onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      isDestructive,
      confirmText,
      showCancel,
    });
  };

  const { user, loading, isOnline, activeUid, setManualDataUid } = useAuth();
  const {
    kits,
    projects,
    paints,
    saveItem,
    deleteItem,
    markAsBought,
    importData,
    quickCreatePaint,
    buyAccessory,
  } = useInventory(user, activeUid, requestConfirm);

  const logic = useAppLogic(kits, projects, paints);

  // --- HANDLERS ---
  const handleOpenKitPaints = (kit) => {
    setIsNewKit(false);
    setActiveKit({ ...kit, initialTab: "paints" });
  };
  const handleOpenKitDetail = (kit, tab = "info") => {
    setIsNewKit(false);
    setActiveKit({ ...kit, initialTab: tab });
  };
  const handleOpenProjectDetail = (projId) => {
    const proj = projects.find((p) => p.id === projId);
    if (proj) {
      setIsNewProject(false);
      setActiveProject(proj);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
        <p>Načítám...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      {/* HEADER */}
      <AppHeader
        logic={logic}
        setShowSettings={setShowSettings}
        setIsNewKit={setIsNewKit}
        setActiveKit={setActiveKit}
        setIsNewProject={setIsNewProject}
        setActiveProject={setActiveProject}
        setIsNewPaint={setIsNewPaint}
        setActivePaint={setActivePaint}
        activeUid={activeUid}
        isOnline={isOnline}
        onShowAlert={(msg) =>
          requestConfirm("Info", msg, null, false, "Rozumím", false)
        }
        language={language}
        setShowLanguageModal={setShowLanguageModal}
      />

      {/* CONTENT */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {logic.view === "kits" && (
          <>
            {Object.entries(logic.groupedKits).map(
              ([key, list]) =>
                list.length > 0 && (
                  <section key={key}>
                    <div className="flex justify-between items-center mb-2">
                      <h2
                        className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${key === "wip" ? "text-orange-400" : key === "new" ? "text-blue-400" : key === "finished" ? "text-green-600" : key === "scrap" ? "text-slate-600" : "text-purple-400"}`}
                      >
                        {key === "wip" ? (
                          <Hammer size={12} />
                        ) : key === "new" ? (
                          <Box size={12} />
                        ) : key === "finished" ? (
                          <CheckSquare size={12} />
                        ) : key === "scrap" ? (
                          <Trash2 size={12} />
                        ) : (
                          <ShoppingCart size={12} />
                        )}{" "}
                        {key === "wip"
                          ? "Na stole"
                          : key === "new"
                            ? "V kitníku"
                            : key === "finished"
                              ? "Hotovo"
                              : key === "scrap"
                                ? "Vrakoviště"
                                : "Nákupní seznam"}{" "}
                        ({list.length})
                      </h2>
                    </div>
                    {list.map((k) => (
                      <KitCard
                        key={k.id}
                        kit={k}
                        onClick={() => {
                          setIsNewKit(false);
                          setActiveKit(k);
                        }}
                        projectName={
                          projects.find((p) => p.id === k.projectId)?.name
                        }
                        allPaints={paints}
                        onOpenDetail={handleOpenKitDetail}
                        onOpenProject={handleOpenProjectDetail}
                      />
                    ))}
                  </section>
                ),
            )}
            {logic.filteredKits.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno (nebo skryto filtrem).</p>
              </div>
            )}
          </>
        )}

        {logic.view === "projects" && (
          <>
            {logic.filteredProjects.length > 0 ? (
              logic.filteredProjects.map((p) => (
                <ProjectCard
                  key={p.id}
                  project={p}
                  onClick={() => {
                    setIsNewProject(false);
                    setActiveProject(p);
                  }}
                  kits={kits}
                />
              ))
            ) : (
              <div className="text-center text-slate-500 py-10">
                <Folder size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno (nebo skryto filtrem).</p>
              </div>
            )}
          </>
        )}

        {logic.view === "paints" && (
          <div className="space-y-6">
            {logic.groupedPaints.inventory.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <Package size={12} /> Mám ve skladu (
                    {logic.groupedPaints.inventory.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {logic.groupedPaints.inventory.map((paint) => (
                    <PaintCard
                      key={paint.id}
                      paint={paint}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(paint);
                      }}
                      onDelete={(id) => deleteItem("paints", id)}
                    />
                  ))}
                </div>
              </section>
            )}
            {logic.groupedPaints.wishlist.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart size={12} /> Nákupní seznam (
                    {logic.groupedPaints.wishlist.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {logic.groupedPaints.wishlist.map((paint) => (
                    <PaintCard
                      key={paint.id}
                      paint={paint}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(paint);
                      }}
                      onDelete={(id) => deleteItem("paints", id)}
                    />
                  ))}
                </div>
              </section>
            )}
            {logic.filteredPaints.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Palette size={48} className="mx-auto mb-2 opacity-20" />
                <p>Žádné barvy (nebo skryto filtrem).</p>
              </div>
            )}
          </div>
        )}

        {logic.view === "shopping" && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 text-center">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-center gap-2">
                <ShoppingCart size={24} className="text-orange-400" /> Nákupní
                seznam
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Interaktivní seznam. Kliknutím na tašku{" "}
                <ShoppingBag size={12} className="inline" /> přesunete položku
                do skladu (koupeno).
              </p>
            </div>
            {logic.shoppingList.kits.length === 0 &&
              logic.shoppingList.accessories.length === 0 &&
              logic.shoppingList.paints.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Váš nákupní seznam je prázdný.</p>
                </div>
              )}
            {logic.shoppingList.kits.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Box size={14} /> Chybějící Modely
                </h3>
                {logic.shoppingList.kits.map((k) => (
                  <KitCard
                    key={k.id}
                    kit={k}
                    onClick={() => {
                      setIsNewKit(false);
                      setActiveKit(k);
                    }}
                    projectName={
                      projects.find((p) => p.id === k.projectId)?.name
                    }
                    onBuy={(item) => markAsBought(item, "kit")}
                    allPaints={paints}
                    onOpenDetail={handleOpenKitDetail}
                  />
                ))}
              </div>
            )}
            {logic.shoppingList.paints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Paintbrush size={14} /> Barvy a Chemie
                </h3>
                <div className="space-y-1">
                  {logic.shoppingList.paints.map((p) => (
                    <PaintCard
                      key={p.id}
                      paint={p}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(p);
                      }}
                      onBuy={(item) => markAsBought(item, "paint")}
                    />
                  ))}
                </div>
              </div>
            )}
            {logic.shoppingList.accessories.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers size={14} /> Chybějící Doplňky
                </h3>
                <div className="space-y-2">
                  {logic.shoppingList.accessories.map((acc, index) => (
                    <ShoppingAccessoryCard
                      key={`${acc.id}-${index}`}
                      accessory={acc}
                      onBuy={buyAccessory}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* CONFIRMATION MODAL */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={confirmModal.onConfirm}
        onCancel={() => setConfirmModal((prev) => ({ ...prev, isOpen: false }))}
        isDestructive={confirmModal.isDestructive}
        confirmText={confirmModal.confirmText}
        showCancel={confirmModal.showCancel}
      />

      {/* MODALS */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          kits={kits}
          projects={projects}
          paints={paints}
          onImport={importData}
          activeUid={activeUid}
          onSetManualId={setManualDataUid}
          appVersion={APP_VERSION}
          masterCatalog={MASTER_CATALOG}
        />
      )}
      {showLanguageModal && (
        <LanguageModal
          activeLanguage={language}
          onSelectLanguage={setLanguage}
          onClose={() => setShowLanguageModal(false)}
        />
      )}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          allKits={kits}
          onClose={() => setActiveProject(null)}
          onSave={(d) => saveItem("projects", d, isNewProject)}
          onUpdateKitLink={(kid, pid) =>
            saveItem(
              "kits",
              {
                ...kits.find((k) => k.id === kid),
                projectId: pid,
                legacyProject: null,
              },
              false,
            )
          }
          onCreateWishlistKit={(d) => saveItem("kits", d, true)}
          onAddWishlistKit={() => {
            setIsNewKit(true);
            setActiveKit({
              status: "wishlist",
              projectId: activeProject.id,
              brand: "",
              scale: "",
              name: "",
              accessories: [],
              todo: [],
            });
          }}
        />
      )}
      {activeKit && (
        <KitDetailModal
          kit={activeKit}
          projects={projects}
          allPaints={paints}
          onQuickCreatePaint={quickCreatePaint}
          onClose={() => setActiveKit(null)}
          onSave={(d) => saveItem("kits", d, isNewKit)}
          onDelete={(id) => {
            deleteItem("kits", id);
            setActiveKit(null);
          }}
          initialTab={activeKit.initialTab}
        />
      )}
      {activePaint && (
        <PaintDetailModal
          paint={activePaint}
          existingPaints={paints}
          allKits={kits}
          onClose={() => setActivePaint(null)}
          onSave={(d) => saveItem("paints", d, isNewPaint)}
          onDelete={(id) => {
            deleteItem("paints", id);
            setActivePaint(null);
          }}
        />
      )}
    </div>
  );
}
