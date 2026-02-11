import React, { useState, useEffect, useMemo } from "react";
import {
  Package,
  Folder,
  Plus,
  Search,
  Filter,
  X,
  Save,
  Trash2,
  ExternalLink,
  Paperclip,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  Archive,
  FileText,
  ChevronRight,
  Calendar,
  Layers,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  BookOpen,
  Download,
  Edit,
  Link2,
  Unlink,
  History,
  Cloud,
  CloudOff,
  Loader2,
  AlertTriangle,
  Copy,
  Settings,
  Lock,
  CloudCog,
  Skull,
  Trophy,
  Upload,
  FileJson,
} from "lucide-react";

// Firebase importy
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  setDoc,
  writeBatch,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
} from "firebase/auth";

// ==========================================
// 🔧 KONFIGURACE FIREBASE (Modelářský Deník)
// ==========================================

const APP_VERSION = "v2.3.8-rollback_to_google_auth";

// Pomocná funkce pro bezpečné čtení env proměnných
const getEnv = (key) => {
  try {
    if (import.meta && import.meta.env && import.meta.env[key])
      return import.meta.env[key];
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env && process.env[key])
      return process.env[key];
  } catch (e) {}
  return "";
};

const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
};

// Pokud jsme v Canvas prostředí, přepíšeme config injektovanými hodnotami
if (typeof __firebase_config !== "undefined") {
  Object.assign(firebaseConfig, JSON.parse(__firebase_config));
}

// Inicializace
let app, auth, db;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("OFFLINE MODE: API Key nenalezen.");
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// Výchozí data pro ukázku
const DEMO_KITS = [];
const DEMO_PROJECTS = [];

// ==========================================
// 🧩 KOMPONENTY
// ==========================================

// --- HLAVNÍ KARTA MODELU ---
const KitCard = ({ kit, onClick, projectName }) => {
  const getStatusColor = (s) => {
    switch (s) {
      case "new":
        return "border-l-4 border-l-blue-500";
      case "wip":
        return "border-l-4 border-l-orange-500";
      case "finished":
        return "border-l-4 border-l-green-500 opacity-70";
      case "wishlist":
        return "border-l-4 border-l-purple-500 border-dashed";
      case "scrap":
        return "border-l-4 border-l-slate-600 opacity-50 grayscale";
      default:
        return "border-slate-700";
    }
  };

  return (
    <div
      onClick={() => onClick(kit)}
      className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 ${getStatusColor(kit.status)} relative group`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          {" "}
          {/* min-w-0 pro správný truncate */}
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
              {kit.scale}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {kit.brand} {kit.catNum && `• ${kit.catNum}`}
            </span>
          </div>
          {/* HLAVNÍ NÁZEV + VARIANTA (INLINE) */}
          <h3 className="font-bold text-slate-100 leading-tight truncate text-base">
            {kit.subject ? (
              <>
                {kit.subject}
                <span className="text-slate-400 text-xs font-bold ml-1.5 opacity-80">
                  {kit.name}
                </span>
              </>
            ) : (
              kit.name
            )}
          </h3>
          {projectName && (
            <div className="flex items-center gap-1.5 text-xs text-blue-400 mt-2 font-medium">
              <Folder size={14} />{" "}
              <span className="truncate">{projectName}</span>
            </div>
          )}
          {!projectName && kit.legacyProject && (
            <div
              className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 italic"
              title="Tento model byl součástí projektu, který byl smazán."
            >
              <History size={14} />{" "}
              <span className="truncate">Ex-projekt: {kit.legacyProject}</span>
            </div>
          )}
        </div>

        {/* Pravá strana karty - IKONY STAVŮ */}
        <div className="ml-2 flex flex-col items-end shrink-0 gap-1">
          {/* Status Icon */}
          {kit.status === "wip" && (
            <div className="flex flex-col items-end">
              <span className="text-xs font-mono text-orange-400">
                {kit.progress}%
              </span>
              <div className="w-12 h-1 bg-slate-700 rounded-full mt-1">
                <div
                  className="h-full bg-orange-500 rounded-full"
                  style={{ width: `${kit.progress}%` }}
                ></div>
              </div>
            </div>
          )}
          {kit.status === "wishlist" && (
            <ShoppingCart size={18} className="text-purple-400" />
          )}
          {kit.status === "scrap" && (
            <Skull size={18} className="text-slate-500" />
          )}
          {kit.status === "finished" && (
            <Trophy size={18} className="text-green-500" />
          )}
          {kit.status === "new" && (
            <Package size={18} className="text-blue-400" />
          )}

          {/* Attachment Icon */}
          {(kit.scalematesUrl ||
            (kit.attachments && kit.attachments.length > 0)) && (
            <div
              className={`text-slate-600 ${kit.status === "wip" ? "mt-1" : ""}`}
            >
              <Paperclip size={14} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- MODÁLNÍ OKNO NASTAVENÍ / CLOUD IDENTITY ---
const SettingsModal = ({ user, onClose, kits, projects }) => {
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);

  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = () => {
    const dataToExport = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      kits: kits,
      projects: projects,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `model-diary-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (
      !confirm(
        "Pozor! Import dat přepíše existující modely a projekty se stejným ID. Chcete pokračovat?",
      )
    ) {
      e.target.value = ""; // reset input
      return;
    }

    try {
      setImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);

      if (!data.kits && !data.projects) {
        alert(
          "Chyba: Neplatný formát souboru (chybí sekce kits nebo projects).",
        );
        return;
      }

      if (!db || !user) {
        alert("Chyba: Nejste připojeni k databázi.");
        return;
      }

      const batch = writeBatch(db);
      let count = 0;

      // Import Kits
      if (data.kits && Array.isArray(data.kits)) {
        data.kits.forEach((kit) => {
          if (kit.id) {
            const ref = doc(
              db,
              "artifacts",
              "model-diary",
              "users",
              user.uid,
              "kits",
              kit.id.toString(),
            );
            batch.set(ref, kit);
            count++;
          }
        });
      }

      // Import Projects
      if (data.projects && Array.isArray(data.projects)) {
        data.projects.forEach((proj) => {
          if (proj.id) {
            const ref = doc(
              db,
              "artifacts",
              "model-diary",
              "users",
              user.uid,
              "projects",
              proj.id.toString(),
            );
            batch.set(ref, proj);
            count++;
          }
        });
      }

      if (count > 0) {
        await batch.commit();
        alert(`Úspěšně importováno ${count} položek.`);
        onClose();
      } else {
        alert("Nebyly nalezeny žádné platné položky k importu.");
      }
    } catch (err) {
      console.error(err);
      alert("Chyba při importu souboru: " + err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="text-blue-400" size={20} /> Nastavení Cloudu
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ID Deníku (Warehouse ID)
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 break-all">
                {user?.uid || "Nepřipojeno"}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-3 rounded-lg transition-colors relative"
                title="Kopírovat ID"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Toto ID slouží k identifikaci vašich dat v cloudu. Uschovejte ho
              pro případnou synchronizaci na jiném zařízení.
            </p>
          </div>

          <div className="bg-blue-900/20 p-4 rounded-xl border border-blue-500/20">
            <h4 className="font-bold text-blue-400 mb-1 flex items-center gap-2">
              <Cloud size={16} /> Status synchronizace
            </h4>
            <p className="text-sm text-blue-200/80">
              Všechna data jsou automaticky ukládána do cloudu v reálném čase.
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <FileJson size={18} className="text-orange-400" /> Správa dat
              (Záloha)
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <Download size={24} className="text-blue-400" />
                <span className="text-xs font-bold">Exportovat Data</span>
              </button>

              <label
                className={`bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95 cursor-pointer ${importing ? "opacity-50 pointer-events-none" : ""}`}
              >
                {importing ? (
                  <Loader2 size={24} className="animate-spin text-orange-400" />
                ) : (
                  <Upload size={24} className="text-orange-400" />
                )}
                <span className="text-xs font-bold">
                  {importing ? "Importuji..." : "Importovat Data"}
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
            <p className="text-[10px] text-slate-500 mt-2 text-center">
              Export vytvoří soubor JSON se všemi modely a projekty. Import
              tento soubor načte a obnoví data.
            </p>
          </div>
        </div>

        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <span className="text-xs text-slate-600">
            Verze aplikace: {APP_VERSION}
          </span>
        </div>
      </div>
    </div>
  );
};

// --- MODÁLNÍ OKNO DETAILU PROJEKTU ---
const ProjectDetailModal = ({
  project,
  onClose,
  onSave,
  onDelete,
  allKits,
  onUpdateKitLink,
  onCreateWishlistKit,
}) => {
  const [data, setData] = useState({ accessories: [], ...project });
  const [activeTab, setActiveTab] = useState("info");

  const [showLinkKit, setShowLinkKit] = useState(false);
  const [selectedKitId, setSelectedKitId] = useState("");
  const [newWishlistKit, setNewWishlistKit] = useState({
    brand: "",
    name: "",
    scale: "",
    subject: "",
  });
  const [showAddWishlist, setShowAddWishlist] = useState(false);
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });

  const projectKits = allKits.filter((k) => k.projectId === project.id);
  const availableKits = allKits.filter((k) => !k.projectId);

  const handleLinkKit = () => {
    if (selectedKitId) {
      onUpdateKitLink(selectedKitId, project.id);
      setShowLinkKit(false);
      setSelectedKitId("");
    }
  };

  const handleUnlinkKit = (kitId) => {
    if (confirm("Odebrat model z projektu? (Model zůstane ve skladu)")) {
      onUpdateKitLink(kitId, null);
    }
  };

  const handleCreateWishlistKit = () => {
    if (newWishlistKit.name) {
      onCreateWishlistKit({
        ...newWishlistKit,
        status: "wishlist",
        projectId: project.id,
      });
      setNewWishlistKit({ brand: "", name: "", scale: "", subject: "" });
      setShowAddWishlist(false);
    }
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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
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
            <>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Název projektu
                </label>
                <input
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  placeholder="Např. Bitva u Kurska"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Popis
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white h-24 focus:border-blue-500 outline-none resize-none"
                  placeholder="Popis záměru, kontextu..."
                  value={data.description}
                  onChange={(e) =>
                    setData({ ...data, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Stav
                </label>
                <select
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white focus:border-blue-500 outline-none"
                  value={data.status}
                  onChange={(e) => setData({ ...data, status: e.target.value })}
                >
                  <option value="planned">📅 Plánováno</option>
                  <option value="active">🔥 Aktivní</option>
                  <option value="finished">✅ Dokončeno</option>
                  <option value="hold">⏸️ Pozastaveno</option>
                </select>
              </div>
            </>
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
                            <span className="font-bold mr-1">{k.subject}</span>
                          ) : null}
                          {k.name}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">
                          {k.scale}
                        </span>
                      </div>
                      <button
                        onClick={() => handleUnlinkKit(k.id)}
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
                      setShowAddWishlist(false);
                    }}
                    className="bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <Link2 size={14} /> Připojit ze skladu
                  </button>
                  <button
                    onClick={() => {
                      setShowAddWishlist(!showAddWishlist);
                      setShowLinkKit(false);
                    }}
                    className="bg-purple-900/40 hover:bg-purple-900/60 text-purple-300 border border-purple-500/30 text-xs py-2 rounded flex items-center justify-center gap-1"
                  >
                    <ShoppingCart size={14} /> Přidat do nákupu
                  </button>
                </div>
                {showLinkKit && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-700 animate-in slide-in-from-top-2">
                    <select
                      className="w-full bg-slate-800 text-white text-xs p-2 rounded mb-2 border border-slate-600"
                      value={selectedKitId}
                      onChange={(e) => setSelectedKitId(e.target.value)}
                    >
                      <option value="">-- Vyber model ze skladu --</option>
                      {availableKits.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.subject ? `${k.subject} ${k.name}` : k.name} (
                          {k.scale})
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={handleLinkKit}
                      disabled={!selectedKitId}
                      className="w-full bg-blue-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                    >
                      Připojit
                    </button>
                  </div>
                )}
                {showAddWishlist && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-700 animate-in slide-in-from-top-2 space-y-2">
                    <div className="space-y-2">
                      <input
                        className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Předloha / Typ (např. F-16C)"
                        value={newWishlistKit.subject}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            subject: e.target.value,
                          })
                        }
                      />
                      <input
                        className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Název krabice / Varianta"
                        value={newWishlistKit.name}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            name: e.target.value.toLowerCase(),
                          })
                        }
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        className="flex-1 bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Výrobce"
                        value={newWishlistKit.brand}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            brand:
                              e.target.value.charAt(0).toUpperCase() +
                              e.target.value.slice(1),
                          })
                        }
                      />
                      <input
                        className="w-20 bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Měřítko"
                        value={newWishlistKit.scale}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            scale: e.target.value,
                          })
                        }
                      />
                    </div>
                    <button
                      onClick={handleCreateWishlistKit}
                      disabled={!newWishlistKit.name}
                      className="w-full bg-purple-600 text-white text-xs py-1.5 rounded disabled:opacity-50"
                    >
                      Přidat do nákupního seznamu
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-700/50">
                <h4 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                  <Layers size={14} /> Doplňky projektu
                </h4>
                <div className="mb-3 p-2 bg-slate-800 rounded border border-slate-700">
                  <input
                    className="w-full bg-slate-900 border border-slate-600 rounded p-1.5 text-xs text-white mb-2"
                    placeholder="Název (např. Sádra, Podložka)"
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
                      placeholder="URL..."
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
                  {data.accessories &&
                    data.accessories.map((acc) => (
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
                                <LinkIcon size={10} /> Odkaz do obchodu
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
                  {(!data.accessories || data.accessories.length === 0) && (
                    <p className="text-xs text-slate-600 italic">
                      Žádné doplňky projektu.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 border-t border-slate-800 bg-slate-800/30 flex justify-end rounded-b-xl">
          <button
            onClick={() => onSave(data)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg font-bold shadow-lg flex items-center gap-2"
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MODÁLNÍ OKNO DETAILU KITU ---
const KitDetailModal = ({ kit, onClose, onSave, onDelete, projects }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [data, setData] = useState({ ...kit });
  const [newTodo, setNewTodo] = useState("");
  const [newAccessory, setNewAccessory] = useState({
    name: "",
    status: "owned",
    url: "",
  });
  const [newAttachment, setNewAttachment] = useState({
    name: "",
    url: "",
    type: "manual",
  });

  // Validace měřítka
  const isScaleValid = (scaleStr) => {
    if (!scaleStr) return true; // prázdné je validní (nepovinné)
    return /^\d+\/\d+$/.test(scaleStr);
  };

  const handleSave = () => {
    // Pokud není validní měřítko, upozorníme, ale uložíme (nebo zablokujeme?)
    // Zadání znělo "hlídat vstup", vizuální indikace zatím stačí, nebo lze blokovat uložení.
    // Zde nechám uložení, ale UI bude svítit červeně.
    onSave(data);
  };

  const addTodo = () => {
    if (!newTodo.trim()) return;
    setData({
      ...data,
      todo: [
        ...(data.todo || []),
        { id: Date.now(), text: newTodo, done: false },
      ],
    });
    setNewTodo("");
  };
  const toggleTodo = (id) => {
    const updated = data.todo.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t,
    );
    const doneCount = updated.filter((t) => t.done).length;
    const newProgress =
      updated.length > 0 ? Math.round((doneCount / updated.length) * 100) : 0;
    setData({ ...data, todo: updated, progress: newProgress });
  };
  const deleteTodo = (id) => {
    setData({ ...data, todo: data.todo.filter((t) => t.id !== id) });
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

  const addAttachment = () => {
    if (!newAttachment.name.trim() || !newAttachment.url.trim()) return;
    setData({
      ...data,
      attachments: [
        ...(data.attachments || []),
        { id: Date.now(), ...newAttachment },
      ],
    });
    setNewAttachment({ name: "", url: "", type: "manual" });
  };
  const deleteAttachment = (id) => {
    setData({
      ...data,
      attachments: data.attachments.filter((a) => a.id !== id),
    });
  };

  const openScalematesSearch = () => {
    // Hledáme primárně podle předlohy, pokud je, jinak podle názvu
    const searchString = `${data.brand} ${data.catNum} ${data.subject || data.name}`;
    const query = encodeURIComponent(searchString);
    window.open(`https://www.scalemates.com/search.php?q=${query}`, "_blank");
  };

  // Logic pro přístupnost záložky stavba
  const isBuildTabDisabled = data.status !== "wip";

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 flex flex-col max-h-[95vh] shadow-2xl">
        {/* HLAVIČKA DETAILU - PŘEPRACOVANÁ */}
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

          <div className="space-y-3">
            {/* 1. Řádek: Výrobce | Měřítko | Kat. Číslo */}
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-950 text-sm text-white border border-slate-700 rounded px-3 py-2 placeholder-slate-600 focus:border-blue-500 outline-none"
                value={data.brand}
                onChange={(e) => {
                  const val = e.target.value;
                  const capitalized =
                    val.length > 0
                      ? val.charAt(0).toUpperCase() + val.slice(1)
                      : val;
                  setData({ ...data, brand: capitalized });
                }}
                placeholder="Výrobce (např. Eduard)"
              />
              <input
                className={`w-20 text-center bg-slate-950 text-sm text-white border ${isScaleValid(data.scale) ? "border-slate-700" : "border-red-500 text-red-300"} rounded px-3 py-2 placeholder-slate-600 focus:border-blue-500 outline-none`}
                value={data.scale}
                onChange={(e) => setData({ ...data, scale: e.target.value })}
                placeholder="1/48"
                title={
                  isScaleValid(data.scale)
                    ? "Měřítko"
                    : "Zadejte formát číslo/číslo"
                }
              />
              <input
                className="w-24 text-center bg-slate-950 text-sm text-white border border-slate-700 rounded px-3 py-2 placeholder-slate-600 focus:border-blue-500 outline-none"
                value={data.catNum}
                onChange={(e) => setData({ ...data, catNum: e.target.value })}
                placeholder="Kat. č."
              />
            </div>

            {/* 2. Řádek: Předloha a Název vedle sebe */}
            <div className="flex gap-2">
              {/* Předloha */}
              <div className="relative flex-1">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] text-blue-400 font-bold z-10">
                  Předloha / Typ
                </label>
                <input
                  className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2 placeholder-slate-600 focus:border-blue-500 outline-none"
                  value={data.subject || ""}
                  onChange={(e) =>
                    setData({ ...data, subject: e.target.value })
                  }
                  placeholder="např. F-16C"
                />
              </div>

              {/* Název Krabice */}
              <div className="relative flex-[1.5]">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] text-slate-500 font-bold z-10">
                  Název Krabice
                </label>
                <input
                  className="w-full bg-slate-950 text-xs font-bold text-white border border-slate-700 rounded px-3 py-2.5 placeholder-slate-600 focus:border-blue-500 outline-none"
                  value={data.name}
                  onChange={(e) =>
                    setData({ ...data, name: e.target.value.toLowerCase() })
                  }
                  placeholder="např. tiger meet 2010"
                />
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex border-b border-slate-800 bg-slate-950 overflow-x-auto">
          <button
            onClick={() => setActiveTab("info")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "info" ? "text-blue-400 border-b-2 border-blue-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <FileText size={16} />{" "}
            <span className="hidden sm:inline">Info</span>
          </button>

          {/* Tlačítko Stavba - podmíněně aktivní */}
          <button
            onClick={() => !isBuildTabDisabled && setActiveTab("build")}
            disabled={isBuildTabDisabled}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 transition-colors ${
              activeTab === "build"
                ? "text-orange-400 border-b-2 border-orange-400"
                : isBuildTabDisabled
                  ? "text-slate-700 cursor-not-allowed"
                  : "text-slate-500 hover:text-slate-300"
            }`}
            title={
              isBuildTabDisabled
                ? "Dostupné pouze pro modely ve stavu 'Rozestavěno'"
                : ""
            }
          >
            {isBuildTabDisabled ? <Lock size={14} /> : <Hammer size={16} />}
            <span className="hidden sm:inline">Stavba</span>
          </button>

          <button
            onClick={() => setActiveTab("parts")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "parts" ? "text-green-400 border-b-2 border-green-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Layers size={16} />{" "}
            <span className="hidden sm:inline">Doplňky</span>
          </button>
          <button
            onClick={() => setActiveTab("files")}
            className={`flex-1 min-w-[80px] py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === "files" ? "text-purple-400 border-b-2 border-purple-400" : "text-slate-500 hover:text-slate-300"}`}
          >
            <Paperclip size={16} />{" "}
            <span className="hidden sm:inline">Přílohy</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {activeTab === "info" && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs text-slate-500 mb-1">
                    Status
                  </label>
                  <select
                    value={data.status}
                    onChange={(e) =>
                      setData({ ...data, status: e.target.value })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                  >
                    <option value="new">📦 Skladem (Nový)</option>
                    <option value="wip">🚧 Rozestavěno</option>
                    <option value="finished">🏆 Hotovo</option>
                    <option value="wishlist">🛒 Chci koupit</option>
                    <option value="scrap">♻️ Vrakoviště</option>
                  </select>
                  {data.status !== "wip" && (
                    <p className="text-[10px] text-slate-500 mt-1 italic">
                      <Lock size={10} className="inline mr-1" />
                      Pro zpřístupnění záložky "Stavba" přepněte na
                      "Rozestavěno".
                    </p>
                  )}
                </div>

                {/* Projekt */}
                <div>
                  <label className="block text-xs text-slate-500 mb-1 flex items-center gap-2">
                    <Folder size={12} /> Projekt
                  </label>
                  <select
                    value={data.projectId || ""}
                    onChange={(e) =>
                      setData({
                        ...data,
                        projectId: e.target.value
                          ? String(e.target.value)
                          : null,
                      })
                    }
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                  >
                    <option value="">-- Žádný projekt --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Poznámky / Idea
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white h-32"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                  placeholder="Např. Plánuji zimní kamufláž, pozor na geometrii kol..."
                />
              </div>
            </div>
          )}

          {activeTab === "build" && !isBuildTabDisabled && (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <div className="flex justify-between text-xs text-slate-400 mb-2">
                  <span>Postup</span>
                  <span>{data.progress}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={data.progress}
                  onChange={(e) =>
                    setData({ ...data, progress: Number(e.target.value) })
                  }
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                  <CheckSquare size={16} /> Stavební plán
                </h4>
                <div className="flex gap-2 mb-2">
                  <input
                    className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white"
                    placeholder="Přidat úkol (např. Slepit věž)..."
                    value={newTodo}
                    onChange={(e) => setNewTodo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTodo()}
                  />
                  <button
                    onClick={addTodo}
                    className="bg-blue-600 text-white p-2 rounded"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <div className="space-y-1">
                  {data.todo &&
                    data.todo.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center gap-2 bg-slate-800/50 p-2 rounded group"
                      >
                        <input
                          type="checkbox"
                          checked={task.done}
                          onChange={() => toggleTodo(task.id)}
                          className="rounded bg-slate-700 border-slate-600 text-orange-500 focus:ring-0"
                        />
                        <span
                          className={`flex-1 text-sm ${task.done ? "text-slate-500 line-through" : "text-slate-200"}`}
                        >
                          {task.text}
                        </span>
                        <button
                          onClick={() => deleteTodo(task.id)}
                          className="text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    ))}
                  {(!data.todo || data.todo.length === 0) && (
                    <p className="text-xs text-slate-600 text-center py-4">
                      Žádné úkoly. Naplánuj si stavbu!
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "build" && isBuildTabDisabled && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500">
              <Lock size={48} className="mb-4 opacity-50" />
              <p className="text-sm font-medium">Stavební deník je uzamčen.</p>
              <p className="text-xs mt-2 text-slate-600 max-w-xs text-center">
                Tato sekce je dostupná pouze pro modely ve stavu{" "}
                <strong>"Rozestavěno"</strong>. Změňte status modelu v záložce
                Info.
              </p>
            </div>
          )}

          {activeTab === "parts" && (
            <div className="space-y-4">
              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                <h4 className="text-xs font-bold text-slate-400 mb-2">
                  Přidat doplněk
                </h4>
                <input
                  className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white mb-2"
                  placeholder="Název (např. Masky Eduard)"
                  value={newAccessory.name}
                  onChange={(e) =>
                    setNewAccessory({ ...newAccessory, name: e.target.value })
                  }
                />
                <div className="flex gap-2">
                  <select
                    className="bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white"
                    value={newAccessory.status}
                    onChange={(e) =>
                      setNewAccessory({
                        ...newAccessory,
                        status: e.target.value,
                      })
                    }
                  >
                    <option value="owned">Mám</option>
                    <option value="wanted">Chci koupit</option>
                  </select>
                  <input
                    className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                    placeholder="URL (volitelné)"
                    value={newAccessory.url}
                    onChange={(e) =>
                      setNewAccessory({ ...newAccessory, url: e.target.value })
                    }
                  />
                  <button
                    onClick={addAccessory}
                    className="bg-green-600 text-white px-4 rounded"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {data.accessories &&
                  data.accessories.map((acc) => (
                    <div
                      key={acc.id}
                      className="flex items-center justify-between bg-slate-800 p-3 rounded border border-slate-700"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {acc.status === "owned" ? (
                          <div className="text-green-400 bg-green-900/20 p-1.5 rounded">
                            <Check size={14} />
                          </div>
                        ) : (
                          <div className="text-purple-400 bg-purple-900/20 p-1.5 rounded">
                            <ShoppingCart size={14} />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-white truncate">
                            {acc.name}
                          </p>
                          {acc.url && (
                            <a
                              href={acc.url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-xs text-blue-400 flex items-center gap-1 hover:underline"
                            >
                              <LinkIcon size={10} /> Odkaz do obchodu
                            </a>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => deleteAccessory(acc.id)}
                        className="text-slate-600 hover:text-red-400"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {activeTab === "files" && (
            <div className="space-y-6">
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
                <p className="text-xs text-slate-500 mb-3">
                  Zadej odkaz na kit ze Scalemates pro rychlý přístup k recenzím
                  a návodům.
                </p>
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={openScalematesSearch}
                    className="bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 text-xs px-3 py-2 rounded border border-blue-500/30 flex items-center gap-2 whitespace-nowrap"
                  >
                    <Search size={14} /> Najít kit
                  </button>
                  <input
                    className="flex-1 bg-slate-900 border border-slate-600 rounded px-2 text-xs text-white"
                    placeholder="Vlož URL ze Scalemates..."
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
                  <LinkIcon size={16} /> Knihovna odkazů
                </h4>
                <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 mb-3">
                  <div className="grid grid-cols-3 gap-2 mb-2">
                    <input
                      className="col-span-2 bg-slate-900 border border-slate-600 rounded p-2 text-sm text-white"
                      placeholder="Název (např. Návod PDF)"
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
                      placeholder="URL (Google Drive, YouTube, Web...)"
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
                  {data.attachments &&
                    data.attachments.map((att) => (
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
                            <p className="text-[10px] text-slate-500 truncate">
                              {att.url}
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

        <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex justify-end rounded-b-xl">
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded font-bold shadow-lg flex items-center gap-2"
          >
            <Save size={18} /> Uložit
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 🚀 HLAVNÍ APLIKACE
// ==========================================

export default function App() {
  const [view, setView] = useState("kits");
  const [kits, setKits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [activeKit, setActiveKit] = useState(null);
  const [isNewKit, setIsNewKit] = useState(false);

  const [activeProject, setActiveProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);

  // --- FIREBASE AUTH & DATA SYNC ---
  useEffect(() => {
    // Pokud není Firebase inicializované, nenačítáme nic (demo data jsou prázdná)
    if (!auth) {
      setKits(DEMO_KITS);
      setProjects(DEMO_PROJECTS);
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        // Podpora custom tokenu jako v první aplikaci
        if (
          typeof __initial_auth_token !== "undefined" &&
          __initial_auth_token
        ) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Chyba přihlášení:", e);
        setLoading(false);
      }
    };
    initAuth();

    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      // Data posloucháme jen když je uživatel přihlášen
      // Používáme strukturu 'model-diary', aby se data nemíchala s 'modelarsky-sklad-v1'
      const kitsRef = collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        currentUser.uid,
        "kits",
      );
      const projectsRef = collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        currentUser.uid,
        "projects",
      );

      const unsubscribeKits = onSnapshot(kitsRef, (snapshot) => {
        const kitsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setKits(kitsData);
      });

      const unsubscribeProjects = onSnapshot(projectsRef, (snapshot) => {
        const projectsData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProjects(projectsData);
        setLoading(false);
      });

      return () => {
        unsubscribeKits();
        unsubscribeProjects();
      };
    });

    return () => unsubscribeAuth();
  }, []);

  // --- HELPER PRO ZÍSKÁNÍ NÁZVU PROJEKTU ---
  const getProjectName = (projectId) => {
    const proj = projects.find((p) => p.id === projectId);
    return proj ? proj.name : null;
  };

  // --- CRUD FUNCTIONS (Firebase) ---

  const saveToFirestore = async (collectionName, data) => {
    if (!user || !db) return;
    const colRef = collection(
      db,
      "artifacts",
      "model-diary",
      "users",
      user.uid,
      collectionName,
    );

    if (data.id && typeof data.id === "string") {
      // Update existing
      const docRef = doc(
        db,
        "artifacts",
        "model-diary",
        "users",
        user.uid,
        collectionName,
        data.id,
      );
      const { id, ...dataToSave } = data; // remove ID from data
      await updateDoc(docRef, dataToSave);
    } else {
      // Create new
      const { id, ...dataToSave } = data; // remove temporary ID if any
      await addDoc(colRef, { ...dataToSave, createdAt: serverTimestamp() });
    }
  };

  const deleteFromFirestore = async (collectionName, docId) => {
    if (!user || !db) return;
    await deleteDoc(
      doc(
        db,
        "artifacts",
        "model-diary",
        "users",
        user.uid,
        collectionName,
        docId,
      ),
    );
  };

  // --- HANDLERS ---
  const handleSaveKit = async (kitData) => {
    const updatedKitData = { ...kitData };
    if (updatedKitData.projectId) {
      updatedKitData.legacyProject = null;
    }

    // Optimistický update (než se ozve Firebase)
    if (!db) {
      if (isNewKit) setKits([...kits, { ...updatedKitData, id: Date.now() }]);
      else
        setKits(
          kits.map((k) => (k.id === updatedKitData.id ? updatedKitData : k)),
        );
    } else {
      await saveToFirestore("kits", updatedKitData);
    }
    setActiveKit(null);
  };

  const handleDeleteKit = async (id) => {
    if (confirm("Opravdu odstranit tento model?")) {
      if (!db) setKits(kits.filter((k) => k.id !== id));
      else await deleteFromFirestore("kits", id);
      setActiveKit(null);
    }
  };

  const createNewKit = () => {
    setIsNewKit(true);
    setActiveKit({
      status: "new",
      brand: "",
      catNum: "",
      scale: "",
      name: "",
      subject: "",
      projectId: null,
      progress: 0,
      todo: [],
      accessories: [],
      scalematesUrl: "",
      attachments: [],
      notes: "",
      legacyProject: null,
    });
  };

  const handleUpdateKitLink = async (kitId, projectId) => {
    const kit = kits.find((k) => k.id === kitId);
    if (kit) {
      const updatedKit = {
        ...kit,
        projectId: projectId,
        legacyProject: projectId ? null : kit.legacyProject,
      };
      if (!db) {
        setKits(kits.map((k) => (k.id === kitId ? updatedKit : k)));
      } else {
        await saveToFirestore("kits", updatedKit);
      }
    }
  };

  const handleCreateWishlistKit = async (newKitData) => {
    const newKit = {
      ...newKitData,
      status: "wishlist",
      catNum: "",
      progress: 0,
      todo: [],
      accessories: [],
      scalematesUrl: "",
      attachments: [],
      notes: "",
      legacyProject: null,
    };
    if (!db) {
      setKits([...kits, { ...newKit, id: Date.now() }]);
    } else {
      await saveToFirestore("kits", newKit);
    }
  };

  const handleSaveProject = async (projData) => {
    if (!db) {
      if (isNewProject)
        setProjects([...projects, { ...projData, id: Date.now() }]);
      else
        setProjects(projects.map((p) => (p.id === projData.id ? projData : p)));
    } else {
      await saveToFirestore("projects", projData);
    }
    setActiveProject(null);
  };

  const handleDeleteProject = async (id) => {
    const projectToDelete = projects.find((p) => p.id === id);
    const projName = projectToDelete ? projectToDelete.name : "Neznámý projekt";

    if (
      confirm(
        `Smazat projekt "${projName}"? Modely zůstanou a uloží se informace o historii.`,
      )
    ) {
      if (!db) {
        setProjects(projects.filter((p) => p.id !== id));
        setKits(
          kits.map((k) =>
            k.projectId === id
              ? { ...k, projectId: null, legacyProject: projName }
              : k,
          ),
        );
      } else {
        // 1. Smazat projekt
        await deleteFromFirestore("projects", id);
        // 2. Upravit kity (toto by správně mělo být v Cloud Function nebo batch, ale pro jednoduchost zde)
        const linkedKits = kits.filter((k) => k.projectId === id);
        linkedKits.forEach(async (k) => {
          await saveToFirestore("kits", {
            ...k,
            projectId: null,
            legacyProject: projName,
          });
        });
      }
      setActiveProject(null);
    }
  };

  const createNewProject = () => {
    setIsNewProject(true);
    setActiveProject({
      name: "",
      description: "",
      status: "active",
      accessories: [],
    });
  };

  // Filtry
  const filteredKits = useMemo(() => {
    return kits.filter((k) => {
      const searchText = (k.name + k.brand + (k.subject || "")).toLowerCase();
      return searchText.includes(searchTerm.toLowerCase());
    });
  }, [kits, searchTerm]);

  const groupedKits = useMemo(() => {
    return {
      wip: filteredKits.filter((k) => k.status === "wip"),
      new: filteredKits.filter((k) => k.status === "new"),
      wishlist: filteredKits.filter((k) => k.status === "wishlist"),
      finished: filteredKits.filter((k) => k.status === "finished"),
      scrap: filteredKits.filter((k) => k.status === "scrap"), // Přidáno vrakoviště
    };
  }, [filteredKits]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
        <p>Načítám tvůj deník z cloudu...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20">
      {/* HLAVIČKA - PŘEPRACOVANÁ PODLE VZORU 'BARVY' */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <img
                src="favicon.png"
                alt="Logo"
                className="w-10 h-10 rounded-xl shadow-lg border border-slate-600 object-cover"
              />
              <div className="flex flex-col">
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                  Modelářský Deník
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* TLAČÍTKO NASTAVENÍ (vpravo nahoře jako v Barvách) */}
              <button
                onClick={() => setShowSettings(true)}
                className="bg-slate-700/50 hover:bg-slate-700 text-blue-300 p-2 rounded-full border border-blue-500/20"
              >
                <CloudCog size={20} />
              </button>
              {/* TLAČÍTKO PŘIDAT */}
              <button
                onClick={view === "kits" ? createNewKit : createNewProject}
                className="bg-blue-600 p-2 rounded-full shadow text-white hover:bg-blue-500 active:scale-95 transition-transform"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>

          <div className="flex bg-slate-950 p-1 rounded-lg mb-3">
            <button
              onClick={() => setView("kits")}
              className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${view === "kits" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Box size={16} /> Sklad
            </button>
            <button
              onClick={() => setView("projects")}
              className={`flex-1 py-2 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${view === "projects" ? "bg-slate-700 text-white" : "text-slate-500 hover:text-slate-300"}`}
            >
              <Folder size={16} /> Projekty
            </button>
          </div>

          {view === "kits" && (
            <div className="relative mb-3">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                size={16}
              />
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm focus:outline-none focus:border-blue-500"
                placeholder="Hledat model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}

          {/* STATUS ŘÁDEK (ID + ONLINE STATUS) */}
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-1 text-[10px] text-slate-500">
              <Cloud size={10} /> ID:{" "}
              <span className="font-mono text-blue-400">
                {user?.uid ? user.uid.substring(0, 8).toUpperCase() : "..."}
              </span>
            </div>
            <div>
              {db ? (
                <span className="text-[10px] text-green-500 flex items-center gap-1 font-medium">
                  <Cloud size={10} /> Online
                </span>
              ) : (
                <span className="text-[10px] text-orange-500 flex items-center gap-1 font-medium">
                  <AlertTriangle size={10} /> Offline
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* OBSAH - SKLAD */}
      {view === "kits" && (
        <div className="max-w-md mx-auto px-4 py-4 space-y-6">
          {groupedKits.wip.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Hammer size={12} /> Na stole ({groupedKits.wip.length})
              </h2>
              {groupedKits.wip.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.new.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Box size={12} /> V kitníku ({groupedKits.new.length})
              </h2>
              {groupedKits.new.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.wishlist.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                <ShoppingCart size={12} /> Nákupní seznam (
                {groupedKits.wishlist.length})
              </h2>
              {groupedKits.wishlist.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.finished.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-green-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <CheckSquare size={12} /> Hotovo ({groupedKits.finished.length})
              </h2>
              {groupedKits.finished.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {groupedKits.scrap.length > 0 && (
            <section>
              <h2 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-2">
                <Trash2 size={12} /> Vrakoviště ({groupedKits.scrap.length})
              </h2>
              {groupedKits.scrap.map((kit) => (
                <KitCard
                  key={kit.id}
                  kit={kit}
                  onClick={() => {
                    setIsNewKit(false);
                    setActiveKit(kit);
                  }}
                  projectName={getProjectName(kit.projectId)}
                />
              ))}
            </section>
          )}
          {filteredKits.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              <Package size={48} className="mx-auto mb-2 opacity-20" />
              <p>Zatím tu nic není.</p>
            </div>
          )}
        </div>
      )}

      {/* OBSAH - PROJEKTY */}
      {view === "projects" && (
        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {projects.map((project) => {
            const projectKits = kits.filter((k) => k.projectId === project.id);
            return (
              <div
                key={project.id}
                onClick={() => {
                  setIsNewProject(false);
                  setActiveProject(project);
                }}
                className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors group"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-lg text-white group-hover:text-blue-400 transition-colors">
                    {project.name}
                  </h3>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${
                      project.status === "active"
                        ? "bg-orange-500/20 text-orange-400"
                        : project.status === "finished"
                          ? "bg-green-500/20 text-green-400"
                          : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {project.status === "active"
                      ? "Aktivní"
                      : project.status === "finished"
                        ? "Dokončeno"
                        : "Plánováno"}
                  </span>
                </div>
                <p className="text-sm text-slate-400 mb-4">
                  {project.description
                    ? project.description.length > 150
                      ? project.description.substring(0, 150) + "..."
                      : project.description
                    : "Bez popisu"}
                </p>

                <div className="bg-slate-900/50 rounded-lg p-3 space-y-2 mb-3">
                  <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                    <Box size={12} /> Obsahuje stavebnice:
                  </h4>
                  {projectKits.length > 0 ? (
                    projectKits.map((pk) => (
                      <div
                        key={pk.id}
                        className="flex justify-between items-center text-sm p-2 bg-slate-800 rounded border border-slate-700"
                      >
                        <div className="flex items-center gap-2 overflow-hidden">
                          {pk.status === "wishlist" && (
                            <ShoppingCart
                              size={14}
                              className="text-purple-400 shrink-0"
                            />
                          )}
                          <span className="truncate">
                            {pk.subject ? (
                              <span className="font-bold text-slate-300 mr-1">
                                {pk.subject}
                              </span>
                            ) : null}
                            {pk.name}
                          </span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-600 italic">
                      Zatím žádné modely.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* EDIT/ADD MODAL - KITS */}
      {activeKit && (
        <KitDetailModal
          kit={activeKit}
          projects={projects}
          onClose={() => setActiveKit(null)}
          onSave={handleSaveKit}
          onDelete={handleDeleteKit}
        />
      )}

      {/* EDIT/ADD MODAL - PROJECTS */}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
          onSave={handleSaveProject}
          onDelete={handleDeleteProject}
          allKits={kits}
          onUpdateKitLink={handleUpdateKitLink}
          onCreateWishlistKit={handleCreateWishlistKit}
        />
      )}

      {/* SETTINGS MODAL */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          kits={kits}
          projects={projects}
        />
      )}
    </div>
  );
}
