import React, { useState, useEffect } from "react";
import {
  Cloud,
  Settings,
  Palette,
  X,
  User,
  WifiOff,
  Ghost,
  Loader2,
  LogOut,
  RefreshCw,
  Check,
  Copy,
} from "lucide-react";
import { GoogleIcon } from "../ui/Icons";
import { auth } from "../../config/firebase";
import {
  signInAnonymously,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

const APP_VERSION = import.meta.env.PACKAGE_VERSION || "Dev";

/**
 * Modální okno nastavení aplikace.
 * Umožňuje správu cloudu (přihlášení/odhlášení), export/import dat a změnu ID skladu.
 *
 * @param {Object} props
 * @param {Object} props.user - Objekt aktuálně přihlášeného uživatele (Firebase User).
 * @param {Function} props.onClose - Handler pro zavření modalu.
 * @param {string} props.activeUid - ID aktuálního skladu/uživatele.
 * @param {Function} props.onSetManualId - Handler pro ruční nastavení ID skladu.
 * @param {Object} props.masterCatalog - Data hlavního katalogu barev (pro info).
 * @returns {JSX.Element}
 */
const SettingsModal = ({
  user,
  onClose,
  activeUid,
  onSetManualId,
  masterCatalog,
}) => {
  const [copied, setCopied] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [manualIdInput, setManualIdInput] = useState(activeUid || "");
  useEffect(() => {
    setManualIdInput(activeUid || "");
  }, [activeUid]);
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
      <div className="bg-slate-900 w-full max-w-md rounded-2xl border border-slate-700 shadow-2xl overflow-hidden h-[90vh] flex flex-col">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="text-slate-400" size={20} /> Nastavení
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-6 flex-1 overflow-y-auto">
          {/* SEKCE: ÚČET */}
          <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3 flex items-center gap-2">
              <Cloud size={14} /> Účet a Synchronizace
            </h3>
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

          {/* SEKCE: ID SKLADU */}
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

          {/* SEKCE: PŘEDVOLBY (Placeholder pro budoucí funkcionalitu) */}
          <div className="border-t border-slate-800 pt-4 opacity-50 pointer-events-none grayscale">
            <h4 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
              <Palette size={18} className="text-purple-400" /> Vzhled a chování
              (Brzy)
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-300">Výchozí pohled</span>
                <span className="text-xs font-bold text-slate-500">Modely</span>
              </div>
              <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg border border-slate-700">
                <span className="text-sm text-slate-300">
                  Kompaktní zobrazení
                </span>
                <div className="w-8 h-4 bg-slate-700 rounded-full relative">
                  <div className="w-4 h-4 bg-slate-500 rounded-full absolute left-0"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="p-4 bg-slate-950 border-t border-slate-800 text-center">
          <span className="text-xs font-bold text-blue-500">
            Verze: {APP_VERSION}
          </span>
          <div className="text-[10px] text-slate-700 mt-1">
            Katalog obsahuje {Object.keys(masterCatalog || {}).length} barev
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
