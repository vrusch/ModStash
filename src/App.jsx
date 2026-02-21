import React, { useState, useEffect } from "react";
import {
  Package,
  Folder,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  Layers,
  ShoppingBag,
  Paintbrush,
  Trash2,
  Palette,
  X,
} from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import ConfirmModal from "./components/ui/ConfirmModal";
import { AppLogo } from "./components/ui/Icons";
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

const APP_VERSION = import.meta.env.PACKAGE_VERSION || "Dev";

// ==========================================
// 🧩 SUB-KOMPONENTY (UI Elements)
// ==========================================

// ==========================================
// 🚀 HLAVNÍ APLIKACE (App)
// ==========================================

/**
 * Hlavní komponenta aplikace.
 *
 * Slouží jako kořenový prvek pro správu stavu UI (modaly, aktivní položky) a propojení
 * datové vrstvy (useInventory) s prezentační logikou (useAppLogic).
 *
 * Zajišťuje:
 * - Inicializaci autentizace (useAuth).
 * - Načítání dat z Firestore (useInventory).
 * - Směrování pohledů (Kits, Projects, Paints, Shopping).
 * - Zobrazení globálních modalů (Detail, Settings, Confirm).
 *
 * @returns {JSX.Element} Kořenový element aplikace.
 */
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
  const [filterByPaintId, setFilterByPaintId] = useState(null);

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

  // PWA Update Logic: Detekce nové verze a výzva k aktualizaci
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error("SW registration error", error);
    },
  });

  useEffect(() => {
    if (needRefresh) {
      requestConfirm(
        "Aktualizace k dispozici",
        "Byla nalezena nová verze aplikace. Chcete ji načíst nyní?",
        () => updateServiceWorker(true),
        false,
        "Aktualizovat",
      );
    }
  }, [needRefresh]);

  const handleManualUpdateCheck = async () => {
    if (needRefresh) {
      updateServiceWorker(true);
      return;
    }
    if ("serviceWorker" in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg) {
        reg.update();
        requestConfirm(
          "Kontrola aktualizací",
          "Probíhá kontrola nové verze na pozadí. Pokud bude nalezena, aplikace vás vyzve k obnovení.",
          null,
          false,
          "Rozumím",
          false,
        );
      } else {
        requestConfirm(
          "Info",
          "Aktualizace nejsou v tomto režimu dostupné (SW nenalezen).",
          null,
          false,
          "Rozumím",
          false,
        );
      }
    }
  };

  // Reset filtru při změně pohledu (pokud odejdu z kitů)
  useEffect(() => {
    if (logic.view !== "kits") {
      setFilterByPaintId(null);
    }
  }, [logic.view]);

  const handleShowPaintUsage = (paint) => {
    const usedInKits = kits.filter((k) =>
      k.paints?.some((p) => p.id === paint.id),
    );
    if (usedInKits.length === 1) {
      // Pokud je jen jeden, rovnou otevřeme detail
      setIsNewKit(false);
      setActiveKit(usedInKits[0]);
    } else if (usedInKits.length > 1) {
      // Pokud jich je víc, přepneme na seznam a vyfiltrujem
      setFilterByPaintId(paint.id);
      if (logic.setView) logic.setView("kits");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <style>{`
          @keyframes progress { 0% { width: 0%; } 100% { width: 90%; } }
          .animate-progress { animation: progress 2s ease-out forwards; }
        `}</style>
        <div className="mb-8 animate-in zoom-in duration-500">
          <AppLogo className="h-24 w-auto drop-shadow-2xl" />
        </div>
        <div className="w-48 h-1 bg-slate-800 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-blue-500 animate-progress"></div>
        </div>
        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest animate-pulse">
          Načítám KitHub...
        </p>
      </div>
    );

  return (
    <div className="flex flex-col h-[100dvh] w-full overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* HEADER */}
      <div className="shrink-0 z-50 relative">
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
      </div>

      {/* CONTENT */}
      <main className="flex-1 overflow-y-auto overscroll-y-contain pb-24 p-2 sm:p-4 bg-slate-900/50">
        <div className="max-w-md mx-auto space-y-6">
          {logic.view === "kits" && (
            <>
              {filterByPaintId && (
                <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-lg mb-4 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full border border-slate-600"
                      style={{
                        backgroundColor: paints.find(
                          (p) => p.id === filterByPaintId,
                        )?.hex,
                      }}
                    ></div>
                    <span className="text-sm text-blue-200">
                      Modely s barvou:{" "}
                      <strong>
                        {paints.find((p) => p.id === filterByPaintId)?.name}
                      </strong>
                    </span>
                  </div>
                  <button
                    onClick={() => setFilterByPaintId(null)}
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
              {Object.entries(logic.groupedKits).map(([key, list]) => {
                const filteredList = filterByPaintId
                  ? list.filter((k) =>
                      k.paints?.some((p) => p.id === filterByPaintId),
                    )
                  : list;

                return (
                  filteredList.length > 0 && (
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
                          ({filteredList.length})
                        </h2>
                      </div>
                      {filteredList.map((k) => (
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
                          onDelete={(id) => deleteItem("kits", id)}
                        />
                      ))}
                    </section>
                  )
                );
              })}
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
                    onKitClick={(k) => handleOpenKitDetail(k)}
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
                        allKits={kits}
                        allPaints={paints}
                        onShowUsage={handleShowPaintUsage}
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
                        allKits={kits}
                        allPaints={paints}
                        onShowUsage={handleShowPaintUsage}
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
                    <ShoppingBag
                      size={48}
                      className="mx-auto mb-2 opacity-20"
                    />
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
                        allKits={kits}
                        allPaints={paints}
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
      </main>

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
          activeUid={activeUid}
          onSetManualId={setManualDataUid}
          appVersion={APP_VERSION}
          onCheckUpdates={handleManualUpdateCheck}
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
          allKits={kits}
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
