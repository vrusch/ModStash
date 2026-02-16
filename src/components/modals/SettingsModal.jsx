import React, { useState, useEffect } from "react";
import {
  Cloud,
  X,
  User,
  WifiOff,
  Ghost,
  Loader2,
  LogOut,
  Wand2,
  RefreshCw,
  Check,
  Copy,
  Database,
  Download,
  Upload,
} from "lucide-react";
import { GoogleIcon } from "../ui/Icons";
import { auth } from "../../config/firebase";
import {
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const SettingsModal = ({
  user,
  onClose,
  kits,
  projects,
  paints,
  onImport,
  activeUid,
  onSetManualId,
  appVersion,
  masterCatalog,
}) => {
  const [copied, setCopied] = useState(false);
  const [importing, setImporting] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [manualIdInput, setManualIdInput] = useState(activeUid || "");
  useEffect(() => {
    setManualIdInput(activeUid || "");
  }, [activeUid]);
  const handleExport = () => {
    const data = {
      version: appVersion,
      exportedAt: new Date().toISOString(),
      kits,
      projects,
      paints,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
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
  const handleImportClick = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    onImport(file);
    e.target.value = "";
  };
  const copyToClipboard = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(user.uid);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };
  const handleAuth = async (type) => {
    if (!auth) return;
    setAuthLoading(true);
    setAuthError(null);
    try {
      if (type === "google")
        await signInWithPopup(auth, new GoogleAuthProvider());
      else if (type === "anon") await signInAnonymously(auth);
      else if (type === "logout") {
        await signOut(auth);
      }
    } catch (e) {
      setAuthError(e.code + ": " + e.message);
    } finally {
      setAuthLoading(false);
    }
  };
  const getDisplayName = () =>
    !user
      ? "Nepřihlášen (Offline)"
      : user.isAnonymous
        ? "Anonymní uživatel"
        : user.displayName || `ID: ${user.uid.substring(0, 6)}...`;
  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden h-[90vh]">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Cloud className="text-blue-400" size={20} /> Nastavení Cloudu
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <div className="flex items-center gap-3 mb-3">
              <div
                className={`p-2 rounded-full ${!user ? "bg-slate-700 text-slate-400" : user.isAnonymous ? "bg-orange-500/20 text-orange-400" : "bg-green-500/20 text-green-400"}`}
              >
                {user ? <User size={20} /> : <WifiOff size={20} />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1">
                  {user?.providerData?.[0]?.providerId === "google.com" ? (
                    <>
                      Přihlášen přes <GoogleIcon className="w-3 h-3" /> jako
                    </>
                  ) : (
                    "Přihlášen jako"
                  )}
                </p>
                <p className="text-sm text-white font-medium truncate">
                  {getDisplayName()}
                </p>
              </div>
            </div>
            <div className="space-y-2">
              {(!user || user.isAnonymous) && (
                <button
                  onClick={() => handleAuth("google")}
                  disabled={authLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <GoogleIcon className="w-4 h-4" /> Přihlásit se přes Google
                </button>
              )}
              {authError && (
                <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-3 rounded text-xs break-words">
                  <strong>Chyba přihlášení</strong>
                  <br />
                  {authError}
                </div>
              )}
              {!user && (
                <button
                  onClick={() => handleAuth("anon")}
                  disabled={authLoading}
                  className="w-full bg-slate-700 hover:bg-slate-600 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                >
                  <Ghost size={16} /> Anonymní login
                </button>
              )}
              {user && (
                <button
                  onClick={() => handleAuth("logout")}
                  disabled={authLoading}
                  className="w-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 py-2 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
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
          </div>
          <div className="p-3 bg-slate-900 border border-slate-700 rounded-xl flex items-center gap-3">
            <div className="bg-blue-600/20 p-2 rounded-full text-blue-400">
              <Wand2 size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Master Katalog</h4>
              <p className="text-xs text-slate-500">
                Obsahuje{" "}
                <span className="text-blue-400 font-mono font-bold">
                  {Object.keys(masterCatalog || {}).length}
                </span>{" "}
                ukázkových barev (Offline).
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ID Deníku / Skladu
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg p-3 text-[10px] font-mono text-slate-300 break-all outline-none focus:border-blue-500 transition-colors"
                value={manualIdInput}
                onChange={(e) => setManualIdInput(e.target.value)}
                placeholder="Zadejte ID..."
              />
              {manualIdInput !== activeUid && (
                <button
                  onClick={() => onSetManualId(manualIdInput)}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-3 rounded-lg flex items-center justify-center animate-in fade-in"
                  title="Načíst tento sklad"
                >
                  <RefreshCw size={20} />
                </button>
              )}
              <button
                onClick={copyToClipboard}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 p-3 rounded-lg"
                title="Kopírovat ID"
              >
                {copied ? (
                  <Check size={20} className="text-green-500" />
                ) : (
                  <Copy size={20} />
                )}
              </button>
            </div>
            <p className="text-[10px] text-slate-600 italic">
              Změnou ID se připojíte k jinému skladu (např. synchronizace mezi
              zařízenímí).
            </p>
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
                  onChange={handleImportClick}
                  className="hidden"
                  disabled={importing}
                />
              </label>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <span className="text-xs text-slate-600">{appVersion}</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;