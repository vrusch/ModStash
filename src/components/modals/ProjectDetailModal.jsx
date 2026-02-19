import React, { useState, useMemo } from "react";
import {
  Folder,
  X,
  Box,
  ShoppingCart,
  Unlink,
  Link2,
  Layers,
  Check,
  Link as LinkIcon,
  Plus,
  Trash2,
  Loader2,
  Save,
} from "lucide-react";
import {
  FloatingInput,
  FloatingSelect,
  FloatingTextarea,
} from "../ui/FormElements";
import { safeRender } from "../../utils/helpers";

const ProjectDetailModal = ({
  project,
  onClose,
  onSave,
  allKits,
  onUpdateKitLink,
  onAddWishlistKit,
}) => {
  const [data, setData] = useState({ accessories: [], ...project });
  const [activeTab, setActiveTab] = useState("info");
  const [isSaving, setIsSaving] = useState(false);
  const [showLinkKit, setShowLinkKit] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState("");
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });

  const projectKits = useMemo(
    () => allKits.filter((k) => k.projectId === project.id),
    [allKits, project.id],
  );
  const availableKits = useMemo(
    () => allKits.filter((k) => !k.projectId),
    [allKits],
  );

  const hasChanges = useMemo(() => {
    const initialData = { accessories: [], ...project };
    return JSON.stringify(data) !== JSON.stringify(initialData);
  }, [data, project]);

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
  const isFormValid = data.name && data.name.trim().length > 0;
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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col h-[90vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Folder size={20} className="text-blue-400" />{" "}
            {project.id ? "Upravit projekt" : "Nový projekt"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="flex border-b border-slate-800 bg-slate-950">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "info" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500"}`}
          >
            Info
          </button>
          <button
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-3 text-sm font-medium ${activeTab === "content" ? "text-orange-400 border-b-2 border-orange-400" : "text-slate-500"}`}
          >
            Modely a Doplňky
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto bg-slate-900">
          {activeTab === "info" && (
            <div className="space-y-4 pt-2">
              <FloatingInput
                label="Název projektu *"
                value={data.name}
                onChange={(e) => setData({ ...data, name: e.target.value })}
                placeholder="Můj projekt"
                labelColor="text-blue-400"
              />
              <FloatingSelect
                label="Stav"
                value={data.status}
                onChange={(e) => setData({ ...data, status: e.target.value })}
                options={[
                  { value: "planned", label: "📅 Plánováno" },
                  { value: "active", label: "🔥 Aktivní" },
                  { value: "finished", label: "✅ Dokončeno" },
                  { value: "hold", label: "⏸️ Pozastaveno" },
                ]}
              />
              <FloatingTextarea
                label="Popis"
                value={data.description}
                onChange={(e) =>
                  setData({ ...data, description: e.target.value })
                }
                height="h-32"
              />
              <p className="text-[10px] text-blue-400/50 font-bold">
                * tyto údaje jsou povinné
              </p>
            </div>
          )}
          {activeTab === "content" && (
            <>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Box size={14} /> Modely v projektu
                </h4>
                <div className="space-y-2 mb-3">
                  {projectKits.map((k) => (
                    <div
                      key={k.id}
                      className="flex justify-between items-center bg-slate-800 p-2 rounded border border-slate-700"
                    >
                      <div className="flex items-center gap-2 overflow-hidden">
                        {k.status === "wishlist" && (
                          <ShoppingCart
                            size={14}
                            className="text-purple-400 shrink-0"
                          />
                        )}
                        <span className="text-sm truncate">
                          {k.subject ? (
                            <span className="font-bold mr-1">
                              {safeRender(k.subject)}
                            </span>
                          ) : null}
                          {safeRender(k.name)}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {safeRender(k.scale)}
                        </span>
                      </div>
                      <button
                        onClick={() => onUpdateKitLink(k.id, null)}
                        className="text-slate-600 hover:text-red-400 p-1"
                      >
                        <Unlink size={16} />
                      </button>
                    </div>
                  ))}
                  {projectKits.length === 0 && (
                    <p className="text-xs text-slate-600 italic">
                      Žádné modely.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setShowLinkKit(!showLinkKit);
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <Link2 size={14} /> Připojit ze skladu
                  </button>
                  <button
                    onClick={onAddWishlistKit}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <ShoppingCart size={14} /> Přidat do nákupu
                  </button>
                </div>
                {showLinkKit && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-700 animate-in slide-in-from-top-2">
                    <div className="mb-2 text-[10px] text-slate-500 italic">
                      Zobrazují se pouze modely, které nejsou v jiném projektu.
                    </div>
                    <select
                      className="w-full bg-slate-800 text-white text-xs p-2 rounded mb-2 border border-slate-600"
                      value={selectedKitId}
                      onChange={(e) => setSelectedKitId(e.target.value)}
                    >
                      <option value="">-- Vyber model ze skladu --</option>
                      {availableKits.map((k) => (
                        <option key={k.id} value={k.id}>
                          {safeRender(k.subject)} {safeRender(k.name)} (
                          {safeRender(k.scale)})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => {
                        onUpdateKitLink(selectedKitId, project.id);
                        setShowLinkKit(false);
                        setSelectedKitId("");
                      }}
                      disabled={!selectedKitId}
                      className="w-full bg-blue-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                    >
                      Připojit
                    </button>
                  </div>
                )}
              </div>
              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} /> Doplňky projektu
                </h4>
                <div className="mb-3 p-2 bg-slate-900 rounded border border-slate-700">
                  <input
                    className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                    placeholder="Název"
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
                          <ShoppingCart
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
                              <LinkIcon size={10} /> Odkaz
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          setData({
                            ...data,
                            accessories: data.accessories.filter(
                              (a) => a.id !== acc.id,
                            ),
                          })
                        }
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
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
  );
};

export default ProjectDetailModal;
