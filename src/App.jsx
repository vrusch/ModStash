import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Package,
  Folder,
  Plus,
  Search,
  X,
  Save,
  Trash2,
  ExternalLink,
  Paperclip,
  CheckSquare,
  Hammer,
  ShoppingCart,
  Box,
  FileText,
  Layers,
  Link as LinkIcon,
  Check,
  Image as ImageIcon,
  BookOpen,
  Download,
  Link2,
  Unlink,
  History,
  Cloud,
  Loader2,
  AlertTriangle,
  Copy,
  Lock,
  CloudCog,
  Skull,
  Trophy,
  Upload,
  FileJson,
  Database,
  RefreshCw,
  LogIn,
  LogOut,
  User,
  Ghost,
  WifiOff,
  Key,
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
  serverTimestamp,
  setDoc,
  writeBatch,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";

// ==========================================
// 🔧 KONFIGURACE A KONSTANTY
// ==========================================

const APP_VERSION = "v2.3.7-final-debug";

// Pomocné funkce
const getEnv = (key) => {
  try {
    return (
      import.meta?.env?.[key] ||
      (typeof process !== "undefined" ? process.env?.[key] : "") ||
      ""
    );
  } catch (e) {
    return "";
  }
};

// Normalizace vstupů
const Normalizer = {
  brand: (val) =>
    val && val.length > 0 ? val.charAt(0).toUpperCase() + val.slice(1) : val,
  name: (val) => (val ? val.toLowerCase() : val),
};

// Firebase Config
// POZOR: Vite vyžaduje prefix VITE_ pro proměnné prostředí
const firebaseConfig = {
  apiKey: getEnv("VITE_FIREBASE_API_KEY"),
  authDomain: getEnv("VITE_FIREBASE_AUTH_DOMAIN"),
  projectId: getEnv("VITE_FIREBASE_PROJECT_ID"),
  storageBucket: getEnv("VITE_FIREBASE_STORAGE_BUCKET"),
  messagingSenderId: getEnv("VITE_FIREBASE_MESSAGING_SENDER_ID"),
  appId: getEnv("VITE_FIREBASE_APP_ID"),
};

if (typeof __firebase_config !== "undefined") {
  try {
    Object.assign(firebaseConfig, JSON.parse(__firebase_config));
  } catch (e) {
    console.warn("Config parse error");
  }
}

// Inicializace Firebase
let app, auth, db;
let initError = null;

try {
  // Kontrola, zda máme API Key (kritické pro inicializaci)
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    initError = "Chybí API Key (Zkontrolujte VITE_ prefix na Vercelu)";
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
  initError = error.message;
}

// ==========================================
// 🧩 SUB-KOMPONENTY
// ==========================================

// --- KARTA MODELU ---
const KitCard = React.memo(({ kit, onClick, projectName }) => {
  const getStatusStyle = (s) => {
    switch (s) {
      case "new":
        return {
          border: "border-l-blue-500",
          icon: <Package size={18} className="text-blue-400" />,
        };
      case "wip":
        return { border: "border-l-orange-500", icon: null };
      case "finished":
        return {
          border: "border-l-green-500 opacity-70",
          icon: <Trophy size={18} className="text-green-500" />,
        };
      case "wishlist":
        return {
          border: "border-l-purple-500 border-dashed",
          icon: <ShoppingCart size={18} className="text-purple-400" />,
        };
      case "scrap":
        return {
          border: "border-l-slate-600 opacity-50 grayscale",
          icon: <Skull size={18} className="text-slate-500" />,
        };
      default:
        return { border: "border-slate-700", icon: null };
    }
  };

  const statusStyle = getStatusStyle(kit.status);

  return (
    <div
      onClick={() => onClick(kit)}
      className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${statusStyle.border} relative group`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
              {kit.scale}
            </span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
              {kit.brand} {kit.catNum && `• ${kit.catNum}`}
            </span>
          </div>

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
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 italic">
              <History size={14} />{" "}
              <span className="truncate">Ex: {kit.legacyProject}</span>
            </div>
          )}
        </div>

        <div className="ml-2 flex flex-col items-end shrink-0 gap-1">
          {kit.status === "wip" ? (
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
          ) : (
            statusStyle.icon
          )}

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
});

// --- SETTINGS MODAL ---
const SettingsModal = ({ user, onClose, kits, projects }) => {
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [migrationStatus, setMigrationStatus] = useState("");

  // Export dat
  const handleExport = () => {
    const dataToExport = {
      version: APP_VERSION,
      exportedAt: new Date().toISOString(),
      kits,
      projects,
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

  // Import dat
  const handleImport = async (e) => {
    const file = e.target.files[0];
    if (
      !file ||
      !confirm("Pozor! Import přepíše data se stejným ID. Chcete pokračovat?")
    )
      return;

    try {
      setImporting(true);
      const text = await file.text();
      const data = JSON.parse(text);
      if (!data.kits && !data.projects)
        throw new Error("Neplatná struktura dat.");

      const batch = db ? writeBatch(db) : null;
      let count = 0;

      if (!user || !db) {
        alert("Pro import dat musíte být online a přihlášeni.");
        setImporting(false);
        return;
      }

      data.kits?.forEach((kit) => {
        if (kit.id) {
          batch.set(
            doc(
              db,
              "artifacts",
              "model-diary",
              "users",
              user.uid,
              "kits",
              kit.id.toString(),
            ),
            kit,
          );
          count++;
        }
      });
      data.projects?.forEach((proj) => {
        if (proj.id) {
          batch.set(
            doc(
              db,
              "artifacts",
              "model-diary",
              "users",
              user.uid,
              "projects",
              proj.id.toString(),
            ),
            proj,
          );
          count++;
        }
      });

      if (count > 0) {
        await batch.commit();
        alert(`Obnoveno ${count} položek.`);
        onClose();
      } else alert("Žádná data k importu.");
    } catch (err) {
      alert("Chyba importu: " + err.message);
    } finally {
      setImporting(false);
      e.target.value = "";
    }
  };

  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // --- GOOGLE LOGIN ---
  const handleGoogleLogin = async () => {
    if (!auth) {
      alert(
        `CHYBA: Aplikace nevidí API klíče.\n\nDiagnostika:\nApiKey: ${firebaseConfig.apiKey ? "OK" : "CHYBÍ"}\nAuth: ${!!auth}\n\nUjistěte se, že proměnné na Vercelu začínají na "VITE_".`,
      );
      return;
    }

    const oldUid = user?.uid;
    const isAnonymous = user?.isAnonymous;
    const provider = new GoogleAuthProvider();

    try {
      setAuthLoading(true);
      const result = await signInWithPopup(auth, provider);
      const newUser = result.user;

      // Migrace dat
      if (isAnonymous && oldUid && newUser.uid !== oldUid) {
        if (kits.length > 0 || projects.length > 0) {
          if (
            confirm(
              `Chcete přenést ${kits.length} modelů a ${projects.length} projektů z anonymního účtu na tento Google účet?`,
            )
          ) {
            setMigrationStatus("Probíhá přesun dat...");
            await migrateData(oldUid, newUser.uid);
            setMigrationStatus("Hotovo!");
          }
        }
      }
    } catch (error) {
      console.error("Login failed", error);
      let msg = error.message;
      if (error.code === "auth/unauthorized-domain") {
        msg = `Firebase blokuje tuto doménu.\n\nJděte do Firebase Console -> Authentication -> Settings -> Authorized Domains\nA přidejte tam: ${window.location.hostname}`;
      } else if (error.code === "auth/operation-not-allowed") {
        msg = `Google přihlášení není povoleno.\n\nJděte do Firebase Console -> Authentication -> Sign-in method\nA povolte "Google".`;
      }
      alert("Přihlášení selhalo:\n" + msg);
    } finally {
      setAuthLoading(false);
    }
  };

  // --- ANONYMOUS LOGIN ---
  const handleAnonymousLogin = async () => {
    if (!auth) {
      alert(
        `CHYBA: Aplikace nevidí API klíče.\n\nDiagnostika:\nApiKey: ${firebaseConfig.apiKey ? "OK" : "CHYBÍ"}\nAuth: ${!!auth}\n\nUjistěte se, že proměnné na Vercelu začínají na "VITE_".`,
      );
      return;
    }

    try {
      setAuthLoading(true);
      await signInAnonymously(auth);
    } catch (e) {
      alert("Chyba přihlášení: " + e.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const migrateData = async (sourceUid, targetUid) => {
    if (!db) return;
    const batch = writeBatch(db);
    let count = 0;

    kits.forEach((kit) => {
      const newRef = doc(
        db,
        "artifacts",
        "model-diary",
        "users",
        targetUid,
        "kits",
        kit.id.toString(),
      );
      batch.set(newRef, kit);
      count++;
    });
    projects.forEach((proj) => {
      const newRef = doc(
        db,
        "artifacts",
        "model-diary",
        "users",
        targetUid,
        "projects",
        proj.id.toString(),
      );
      batch.set(newRef, proj);
      count++;
    });

    if (count > 0) await batch.commit();
  };

  const handleLogout = async () => {
    if (!auth) return;
    setAuthLoading(true);
    try {
      await signOut(auth);
    } catch (error) {
      alert("Chyba při odhlašování: " + error.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const getDisplayName = () => {
    if (!user) return "Nepřihlášen (Offline)";
    if (user.isAnonymous) return "Anonymní uživatel";
    if (user.email) return user.email;
    return `Uživatel (ID: ${user.uid.substring(0, 6)}...)`;
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
          {/* USER IDENTITY SECTION */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-full ${!user ? "bg-slate-700 text-slate-400" : user.isAnonymous ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}
              >
                {user ? <User size={20} /> : <WifiOff size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-bold uppercase">
                  Přihlášen jako
                </p>
                <p className="text-sm text-white font-medium truncate">
                  {getDisplayName()}
                </p>
              </div>
            </div>

            {!user ? (
              <div className="space-y-2">
                <button
                  onClick={handleGoogleLogin}
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  {authLoading ? (
                    <Loader2 className="animate-spin" size={16} />
                  ) : (
                    <LogIn size={16} />
                  )}{" "}
                  Přihlásit přes Google
                </button>
                <button
                  onClick={handleAnonymousLogin}
                  disabled={authLoading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Ghost size={16} /> Zkusit anonymní (Cloud)
                </button>
              </div>
            ) : user.isAnonymous ? (
              <button
                onClick={handleGoogleLogin}
                disabled={authLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {authLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <LogIn size={16} />
                )}{" "}
                {migrationStatus || "Přejít na Google účet"}
              </button>
            ) : (
              <button
                onClick={handleLogout}
                disabled={authLoading}
                className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                {authLoading ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <LogOut size={16} />
                )}{" "}
                Odhlásit se
              </button>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ID Deníku
            </label>
            <div className="flex gap-2">
              <code className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm font-mono text-slate-300 break-all">
                {user?.uid || "Lokální režim"}
              </code>
              <button
                onClick={copyToClipboard}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-3 rounded-lg"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
          </div>

          <div
            className={`p-4 rounded-xl border ${user ? "bg-blue-900/20 border-blue-500/20" : "bg-orange-900/10 border-orange-500/20"}`}
          >
            <h4
              className={`font-bold mb-1 flex items-center gap-2 ${user ? "text-blue-400" : "text-orange-400"}`}
            >
              <RefreshCw size={16} /> Status synchronizace
            </h4>
            <p className="text-sm text-slate-300/80">
              {user
                ? "Data se ukládají do cloudu."
                : "Offline režim. Data jsou pouze v tomto prohlížeči."}
            </p>
          </div>

          <div className="border-t border-slate-800 pt-4">
            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Database size={18} className="text-orange-400" /> Správa dat
            </h4>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleExport}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-3 rounded-xl flex flex-col items-center gap-2 transition-all active:scale-95"
              >
                <Download size={24} className="text-blue-400" />
                <span className="text-xs font-bold">Exportovat</span>
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
                  {importing ? "Importuji..." : "Importovat"}
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
          </div>

          {/* DIAGNOSTIKA PRO VERCEL */}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-[10px] text-slate-500 font-mono mb-1">
              DIAGNOSTIKA PŘIPOJENÍ:
            </p>
            <div className="text-[10px] bg-slate-950 p-2 rounded text-slate-400 font-mono space-y-1">
              <div className="flex justify-between">
                <span>API KEY:</span>
                <span
                  className={
                    firebaseConfig.apiKey ? "text-green-500" : "text-red-500"
                  }
                >
                  {firebaseConfig.apiKey
                    ? "NALEZEN"
                    : "CHYBÍ (Zkontrolujte VITE_ prefix)"}
                </span>
              </div>
              <div className="flex justify-between">
                <span>AUTH INIT:</span>
                <span className={auth ? "text-green-500" : "text-red-500"}>
                  {auth ? "OK" : "SELHALO"}
                </span>
              </div>
              {initError && (
                <div className="text-red-500 mt-1">{initError}</div>
              )}
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <span className="text-xs text-slate-600">{APP_VERSION}</span>
        </div>
      </div>
    </div>
  );
};

// --- PROJECT DETAIL MODAL ---
const ProjectDetailModal = ({
  project,
  onClose,
  onSave,
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

  const projectKits = useMemo(
    () => allKits.filter((k) => k.projectId === project.id),
    [allKits, project.id],
  );
  const availableKits = useMemo(
    () => allKits.filter((k) => !k.projectId),
    [allKits],
  );

  const handleCreateWishlist = () => {
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
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-xs text-slate-500 mb-1">
                  Popis
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white h-24 resize-none outline-none"
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
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white outline-none"
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
                        onClick={() =>
                          confirm("Odebrat model z projektu?") &&
                          onUpdateKitLink(k.id, null)
                        }
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
                          {k.subject} {k.name} ({k.scale})
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
                {showAddWishlist && (
                  <div className="mt-3 p-2 bg-slate-900 rounded border border-slate-700 animate-in slide-in-from-top-2 space-y-2">
                    <div className="space-y-2">
                      <input
                        className="w-full bg-slate-800 border border-slate-600 rounded p-1.5 text-xs text-white"
                        placeholder="Předloha / Typ"
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
                        placeholder="Název"
                        value={newWishlistKit.name}
                        onChange={(e) =>
                          setNewWishlistKit({
                            ...newWishlistKit,
                            name: Normalizer.name(e.target.value),
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
                            brand: Normalizer.brand(e.target.value),
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
                      onClick={handleCreateWishlist}
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

// --- KIT DETAIL MODAL ---
const KitDetailModal = ({ kit, onClose, onSave, projects }) => {
  const [activeTab, setActiveTab] = useState("info");
  const [data, setData] = useState({ ...kit });
  const [newTodo, setNewTodo] = useState("");
  const [newAttachment, setNewAttachment] = useState({
    name: "",
    url: "",
    type: "manual",
  });

  const isScaleValid = (s) => !s || /^\d+\/\d+$/.test(s);
  const isBuildLocked = data.status !== "wip";

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

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-2xl rounded-xl border border-slate-700 flex flex-col max-h-[95vh] shadow-2xl">
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
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-950 text-sm text-white border border-slate-700 rounded px-3 py-2 outline-none"
                value={data.brand}
                onChange={(e) =>
                  setData({ ...data, brand: Normalizer.brand(e.target.value) })
                }
                placeholder="Výrobce"
              />
              <input
                className={`w-20 text-center bg-slate-950 text-sm text-white border ${isScaleValid(data.scale) ? "border-slate-700" : "border-red-500"} rounded px-3 py-2 outline-none`}
                value={data.scale}
                onChange={(e) => setData({ ...data, scale: e.target.value })}
                placeholder="1/48"
              />
              <input
                className="w-24 text-center bg-slate-950 text-sm text-white border border-slate-700 rounded px-3 py-2 outline-none"
                value={data.catNum}
                onChange={(e) => setData({ ...data, catNum: e.target.value })}
                placeholder="Kat. č."
              />
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] text-blue-400 font-bold z-10">
                  Předloha
                </label>
                <input
                  className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2 outline-none"
                  value={data.subject || ""}
                  onChange={(e) =>
                    setData({ ...data, subject: e.target.value })
                  }
                  placeholder="F-16C"
                />
              </div>
              <div className="relative flex-[1.5]">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] text-slate-500 font-bold z-10">
                  Název
                </label>
                <input
                  className="w-full bg-slate-950 text-xs font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none"
                  value={data.name}
                  onChange={(e) =>
                    setData({ ...data, name: Normalizer.name(e.target.value) })
                  }
                  placeholder="tiger meet"
                />
              </div>
            </div>
          </div>
        </div>
        <div className="flex border-b border-slate-800 bg-slate-950">
          {["info", "build", "files"].map((tab) => (
            <button
              key={tab}
              onClick={() =>
                (!isBuildLocked || tab !== "build") && setActiveTab(tab)
              }
              disabled={tab === "build" && isBuildLocked}
              className={`flex-1 py-3 text-sm font-medium flex justify-center items-center gap-2 ${activeTab === tab ? "text-blue-400 border-b-2 border-blue-400" : tab === "build" && isBuildLocked ? "text-slate-700 cursor-not-allowed" : "text-slate-500 hover:text-slate-300"}`}
            >
              {tab === "info" && <FileText size={16} />}
              {tab === "build" &&
                (isBuildLocked ? <Lock size={14} /> : <Hammer size={16} />)}
              {tab === "files" && <Paperclip size={16} />}
              <span className="capitalize hidden sm:inline">
                {tab === "files"
                  ? "Přílohy"
                  : tab === "build"
                    ? "Stavba"
                    : "Info"}
              </span>
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-4 bg-slate-900">
          {activeTab === "info" && (
            <div className="space-y-4">
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
                <label className="block text-xs text-slate-500 mb-1">
                  Poznámky
                </label>
                <textarea
                  className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm text-white h-32 outline-none"
                  value={data.notes}
                  onChange={(e) => setData({ ...data, notes: e.target.value })}
                />
              </div>
            </div>
          )}
          {activeTab === "build" && !isBuildLocked && (
            <div className="space-y-4">
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
                  <LinkIcon size={16} /> Knihovna odkazů
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
        <div className="p-4 border-t border-slate-800 bg-slate-800/50 flex justify-end rounded-b-xl">
          <button
            onClick={() => onSave(data)}
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
// 🚀 HLAVNÍ APLIKACE (App)
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

  // --- FIREBASE SYNC ---
  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }

    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== "undefined" && __initial_auth_token)
          await signInWithCustomToken(auth, __initial_auth_token);
        else await signInAnonymously(auth);
      } catch (e) {
        console.error("Auth Error:", e);
        setLoading(false);
      }
    };
    initAuth();

    return onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setLoading(false);
        return;
      }

      const unsubKits = onSnapshot(
        collection(
          db,
          "artifacts",
          "model-diary",
          "users",
          currentUser.uid,
          "kits",
        ),
        (snap) => setKits(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      );
      const unsubProjs = onSnapshot(
        collection(
          db,
          "artifacts",
          "model-diary",
          "users",
          currentUser.uid,
          "projects",
        ),
        (snap) => {
          setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
          setLoading(false);
        },
      );

      return () => {
        unsubKits();
        unsubProjs();
      };
    });
  }, []);

  // --- LOGIKA UKLÁDÁNÍ ---
  const handleSaveItem = async (
    collectionName,
    itemData,
    isNew,
    setList,
    list,
  ) => {
    const dataToSave = { ...itemData };
    if (collectionName === "kits" && dataToSave.projectId)
      dataToSave.legacyProject = null;

    // Optimistický update nebo Offline režim
    if (!db || !user) {
      if (isNew)
        setList([...list, { ...dataToSave, id: Date.now().toString() }]);
      else setList(list.map((i) => (i.id === dataToSave.id ? dataToSave : i)));
    } else if (user) {
      const colRef = collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        user.uid,
        collectionName,
      );
      if (isNew) {
        const { id, ...cleanData } = dataToSave; // Odstranit dočasné ID
        await addDoc(colRef, { ...cleanData, createdAt: serverTimestamp() });
      } else {
        const { id, ...cleanData } = dataToSave;
        await updateDoc(doc(colRef, dataToSave.id), cleanData);
      }
    }
    if (collectionName === "kits") setActiveKit(null);
    else setActiveProject(null);
  };

  const deleteItem = async (collectionName, id, list, setList) => {
    if (!confirm("Opravdu smazat?")) return;
    if (!db || !user) setList(list.filter((i) => i.id !== id));
    else if (user)
      await deleteDoc(
        doc(
          db,
          "artifacts",
          "model-diary",
          "users",
          user.uid,
          collectionName,
          id,
        ),
      );
    if (collectionName === "kits") setActiveKit(null);
    else setActiveProject(null);
  };

  // --- FILTROVÁNÍ ---
  const filteredKits = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return kits.filter((k) =>
      (k.name + k.brand + (k.subject || ""))
        .toLowerCase()
        .includes(lowerSearch),
    );
  }, [kits, searchTerm]);

  const groupedKits = useMemo(
    () => ({
      wip: filteredKits.filter((k) => k.status === "wip"),
      new: filteredKits.filter((k) => k.status === "new"),
      wishlist: filteredKits.filter((k) => k.status === "wishlist"),
      finished: filteredKits.filter((k) => k.status === "finished"),
      scrap: filteredKits.filter((k) => k.status === "scrap"),
    }),
    [filteredKits],
  );

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
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 shadow-md">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <img
                src="favicon.png"
                alt="Logo"
                className="w-10 h-10 rounded-xl shadow-lg border border-slate-600 object-cover"
              />
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Modelářský Deník
              </h1>
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
                  if (view === "kits") {
                    setIsNewKit(true);
                    setActiveKit({
                      status: "new",
                      brand: "",
                      catNum: "",
                      scale: "",
                      name: "",
                      projectId: null,
                      progress: 0,
                      todo: [],
                      accessories: [],
                    });
                  } else {
                    setIsNewProject(true);
                    setActiveProject({ status: "active", accessories: [] });
                  }
                }}
                className="bg-blue-600 p-2 rounded-full shadow text-white hover:bg-blue-500"
              >
                <Plus size={24} />
              </button>
            </div>
          </div>
          <div className="flex bg-slate-950 p-1 rounded-lg mb-3">
            <button
              onClick={() => setView("kits")}
              className={`flex-1 py-2 text-sm font-bold rounded flex gap-2 justify-center ${view === "kits" ? "bg-slate-700 text-white" : "text-slate-500"}`}
            >
              <Box size={16} /> Sklad
            </button>
            <button
              onClick={() => setView("projects")}
              className={`flex-1 py-2 text-sm font-bold rounded flex gap-2 justify-center ${view === "projects" ? "bg-slate-700 text-white" : "text-slate-500"}`}
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
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-9 pr-4 text-sm outline-none focus:border-blue-500"
                placeholder="Hledat model..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          <div className="flex justify-between px-1 text-[10px] text-slate-500">
            <div className="flex gap-1">
              <Cloud size={10} /> ID:{" "}
              <span className="font-mono text-blue-400">
                {user?.uid?.substring(0, 8) || "..."}
              </span>
            </div>
            <div className={db ? "text-green-500" : "text-orange-500"}>
              {db ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {view === "kits" ? (
          <>
            {Object.entries(groupedKits).map(
              ([key, list]) =>
                list.length > 0 && (
                  <section key={key}>
                    <h2
                      className={`text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2 ${key === "wip" ? "text-orange-400" : key === "new" ? "text-blue-400" : key === "finished" ? "text-green-600" : key === "scrap" ? "text-slate-600" : "text-purple-400"}`}
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
                      )}
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
                      />
                    ))}
                  </section>
                ),
            )}
            {filteredKits.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno.</p>
              </div>
            )}
          </>
        ) : (
          projects.map((p) => (
            <div
              key={p.id}
              onClick={() => {
                setIsNewProject(false);
                setActiveProject(p);
              }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-white group-hover:text-blue-400">
                  {p.name}
                </h3>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${p.status === "active" ? "bg-orange-500/20 text-orange-400" : p.status === "finished" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"}`}
                >
                  {p.status}
                </span>
              </div>
              <p className="text-sm text-slate-400 mb-4 truncate">
                {p.description || "Bez popisu"}
              </p>
              <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                  <Box size={12} /> Modely:
                </h4>
                {kits.filter((k) => k.projectId === p.id).length > 0 ? (
                  kits
                    .filter((k) => k.projectId === p.id)
                    .map((k) => (
                      <div
                        key={k.id}
                        className="text-sm text-slate-300 truncate"
                      >
                        • {k.subject} {k.name}
                      </div>
                    ))
                ) : (
                  <p className="text-xs text-slate-600 italic">Prázdno.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* MODALS */}
      {activeKit && (
        <KitDetailModal
          kit={activeKit}
          projects={projects}
          onClose={() => setActiveKit(null)}
          onSave={(d) => handleSaveItem("kits", d, isNewKit, setKits, kits)}
          onDelete={(id) => deleteItem("kits", id, kits, setKits)}
        />
      )}
      {activeProject && (
        <ProjectDetailModal
          project={activeProject}
          allKits={kits}
          onClose={() => setActiveProject(null)}
          onSave={(d) =>
            handleSaveItem("projects", d, isNewProject, setProjects, projects)
          }
          onUpdateKitLink={(kid, pid) =>
            handleSaveItem(
              "kits",
              {
                ...kits.find((k) => k.id === kid),
                projectId: pid,
                legacyProject: null,
              },
              false,
              setKits,
              kits,
            )
          }
          onCreateWishlistKit={(d) =>
            handleSaveItem("kits", d, true, setKits, kits)
          }
        />
      )}
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
