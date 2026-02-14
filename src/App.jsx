import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
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
  Filter,
  XCircle,
  ClipboardCopy,
  ShoppingBag,
  ArrowRight,
  Paintbrush,
  Palette,
  Droplets,
  AlertCircle,
  Wand2,
  Info,
  CheckCircle2,
  Ban,
  ChevronRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FlaskConical,
} from "lucide-react";
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
  query,
  where,
  getDoc,
} from "firebase/firestore";
import {
  getAuth,
  signInAnonymously,
  signInWithCustomToken,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";

// ==========================================
// 🔧 KONFIGURACE A KONSTANTY
// ==========================================

const APP_VERSION = "v2.27.11-syntax-fixed";

const safeRender = (value) => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") return JSON.stringify(value);
  return value;
};

const GoogleIcon = ({ className }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 4.6c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.09 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
);

const MASTER_CATALOG = {
  // Tamiya
  TAMIYA_XF1: {
    displayCode: "XF-1",
    name: "Flat Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  TAMIYA_XF2: {
    displayCode: "XF-2",
    name: "Flat White",
    type: "Akryl",
    finish: "Matná",
    hex: "#f2f2f2",
  },
  TAMIYA_X1: {
    displayCode: "X-1",
    name: "Black",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#000000",
  },
  TAMIYA_X2: {
    displayCode: "X-2",
    name: "White",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  // Gunze
  GUNZE_H1: {
    displayCode: "H1",
    name: "White",
    type: "Akryl",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  GUNZE_C1: {
    displayCode: "C1",
    name: "White",
    type: "Lacquer",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  GUNZE_C33: {
    displayCode: "C33",
    name: "Flat Black",
    type: "Lacquer",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  // AK Interactive
  AKINTERACTIVE_RC001: {
    displayCode: "RC001",
    name: "Flat Black",
    type: "Lacquer",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  AKINTERACTIVE_AK11001: {
    displayCode: "AK11001",
    name: "White",
    type: "Akryl",
    finish: "Matná",
    hex: "#ffffff",
  },
  // Vallejo
  VALLEJO_70950: {
    displayCode: "70.950",
    name: "Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#000000",
  },
  VALLEJO_71001: {
    displayCode: "71.001",
    name: "White",
    type: "Akryl",
    finish: "Matná",
    hex: "#fdfdfd",
  },
  // MRP
  MRP_1: {
    displayCode: "MRP-1",
    name: "White",
    type: "Lacquer",
    finish: "Lesklá",
    hex: "#ffffff",
  },
  MRP_5: {
    displayCode: "MRP-5",
    name: "Black",
    type: "Lacquer",
    finish: "Lesklá",
    hex: "#000000",
  },
  // Ammo
  AMMO_046: {
    displayCode: "A.MIG-046",
    name: "Matt Black",
    type: "Akryl",
    finish: "Matná",
    hex: "#1a1a1a",
  },
  // Hataka
  HATAKA_C001: {
    displayCode: "C001",
    name: "Black",
    type: "Lacquer",
    finish: "Matná",
    hex: "#000000",
  },
};

const BRANDS = [
  "Tamiya",
  "Gunze",
  "MRP",
  "AK Interactive",
  "Ammo by MIG",
  "Hataka",
  "Vallejo",
];

const Normalizer = {
  brand: (val) =>
    val && val.length > 0
      ? val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
      : val,
  name: (val) => (val ? val.toLowerCase() : val),
  code: (val) => (val ? val.toUpperCase() : val),
  search: (val) => (val ? val.toLowerCase().replace(/[^a-z0-9]/g, "") : ""),
  generateId: (brand, code) => {
    if (!brand || !code) return null;
    return `${brand.toUpperCase().replace(/\s+/g, "").replace(/\./g, "")}_${code.toUpperCase().replace(/[\s\-\.]/g, "")}`;
  },
};

const getEnv = (key) => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env)
      return import.meta.env[key] || "";
  } catch (e) {}
  try {
    if (typeof process !== "undefined" && process.env)
      return process.env[key] || "";
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
if (typeof __firebase_config !== "undefined") {
  try {
    Object.assign(firebaseConfig, JSON.parse(__firebase_config));
  } catch (e) {
    console.warn("Config parse error");
  }
}

let app, auth, db;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  }
} catch (error) {
  console.error("Firebase Init Error:", error);
}

// ==========================================
// 🧩 SUB-KOMPONENTY (UI Elements)
// ==========================================

const ConfirmModal = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Ano",
  cancelText = "Ne",
  isDestructive = false,
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95">
        <div className="p-4 text-center">
          <div
            className={`mx-auto w-12 h-12 rounded-full flex items-center justify-center mb-3 ${isDestructive ? "bg-red-500/20 text-red-500" : "bg-blue-500/20 text-blue-500"}`}
          >
            {isDestructive ? <AlertTriangle size={24} /> : <Wand2 size={24} />}
          </div>
          <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
          <p className="text-sm text-slate-400">{safeRender(message)}</p>
        </div>
        <div className="flex border-t border-slate-800">
          <button
            onClick={onCancel}
            className="flex-1 py-3 text-sm font-bold text-slate-400 hover:bg-slate-800 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-3 text-sm font-bold border-l border-slate-800 transition-colors ${isDestructive ? "text-red-500 hover:bg-red-500/10" : "text-blue-500 hover:bg-blue-500/10"}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

const FloatingInput = ({
  label,
  value,
  onChange,
  placeholder,
  className = "",
  classNameInput = "",
  labelColor = "text-slate-500",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <label
      className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
    >
      {label}
    </label>
    <input
      className={`w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors placeholder-slate-700 italic ${classNameInput}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      {...props}
    />
  </div>
);

const FloatingTextarea = ({
  label,
  value,
  onChange,
  className = "",
  labelColor = "text-slate-500",
  height = "h-24",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <label
      className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
    >
      {label}
    </label>
    <textarea
      className={`w-full bg-slate-950 text-sm text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors resize-none ${height}`}
      value={value}
      onChange={onChange}
      {...props}
    />
  </div>
);

const FloatingSelect = ({
  label,
  value,
  onChange,
  options,
  className = "",
  labelColor = "text-slate-500",
  ...props
}) => (
  <div className={`relative ${className}`}>
    <label
      className={`absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 ${labelColor}`}
    >
      {label}
    </label>
    <select
      className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
      value={value}
      onChange={onChange}
      {...props}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`text-[10px] font-bold px-2 py-1 rounded border transition-all whitespace-nowrap ${active ? "bg-blue-600 border-blue-500 text-white shadow-sm" : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"}`}
  >
    {label}
  </button>
);

const KitCard = React.memo(
  ({
    kit,
    onClick,
    projectName,
    onBuy,
    allPaints,
    onOpenPaints,
    onOpenDetail,
    onOpenProject,
  }) => {
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
    const st = getStatusStyle(kit.status);

    const missingPaintsCount = useMemo(() => {
      if (!kit.paints || !allPaints) return 0;
      return kit.paints.filter((p) => {
        const paintInStock = allPaints.find((ap) => ap.id === p.id);
        return !paintInStock || paintInStock.status !== "in_stock";
      }).length;
    }, [kit.paints, allPaints]);
    const hasPaintsAssigned = kit.paints && kit.paints.length > 0;

    const totalPaints = kit.paints?.length || 0;
    const ownedPaints =
      kit.paints?.filter((p) => {
        const paintInStock = allPaints?.find((ap) => ap.id === p.id);
        return paintInStock && paintInStock.status === "in_stock";
      }).length || 0;
    const isPaintsComplete = totalPaints > 0 && ownedPaints === totalPaints;
    const totalAcc = kit.accessories?.length || 0;
    const ownedAcc =
      kit.accessories?.filter((a) => a.status === "owned").length || 0;
    const hasAcc = totalAcc > 0;
    const hasFiles =
      (kit.scalematesUrl ? 1 : 0) + (kit.attachments?.length || 0) > 0;
    const filesCount =
      (kit.scalematesUrl ? 1 : 0) + (kit.attachments?.length || 0);

    return (
      <div
        onClick={() => onClick && onClick(kit)}
        className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${st.border} relative group`}
      >
        <div className="flex justify-between items-start">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                {safeRender(kit.scale)}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                {safeRender(kit.brand)}{" "}
                {kit.catNum && `• ${safeRender(kit.catNum)}`}
              </span>
            </div>
            <h3 className="font-bold text-slate-100 leading-tight truncate text-base">
              {kit.subject ? (
                <>
                  {safeRender(kit.subject)}
                  <span className="text-slate-400 text-xs font-bold ml-1.5 opacity-80">
                    {safeRender(kit.name)}
                  </span>
                </>
              ) : (
                safeRender(kit.name)
              )}
            </h3>

            <div className="flex flex-wrap justify-between items-center gap-2 mt-2">
              <div>
                {projectName && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenProject) onOpenProject(kit.projectId);
                    }}
                    className="flex items-center gap-1.5 text-xs text-blue-400 font-medium hover:underline cursor-pointer"
                  >
                    <Folder size={14} />{" "}
                    <span className="truncate">{safeRender(projectName)}</span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2">
                {hasPaintsAssigned &&
                  kit.status !== "finished" &&
                  kit.status !== "scrap" && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenDetail) onOpenDetail(kit, "paints");
                        else if (onOpenPaints) onOpenPaints(kit);
                      }}
                      className={`flex items-center gap-1.5 text-xs font-bold rounded px-1.5 py-0.5 border cursor-pointer hover:opacity-80 transition-opacity ${isPaintsComplete ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"}`}
                    >
                      <Palette size={12} />
                      <span>
                        {ownedPaints}/{totalPaints}
                      </span>
                    </div>
                  )}
                {hasAcc &&
                  kit.status !== "finished" &&
                  kit.status !== "scrap" && (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onOpenDetail) onOpenDetail(kit, "parts");
                      }}
                      className="flex items-center gap-1.5 text-xs font-bold rounded px-1.5 py-0.5 border cursor-pointer hover:opacity-80 transition-opacity bg-blue-500/10 text-blue-400 border-blue-500/20"
                    >
                      <Layers size={12} />
                      <span>
                        {ownedAcc}/{totalAcc}
                      </span>
                    </div>
                  )}
                {hasFiles && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onOpenDetail) onOpenDetail(kit, "files");
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold rounded px-1.5 py-0.5 border cursor-pointer hover:opacity-80 transition-opacity bg-slate-700/50 text-slate-300 border-slate-600"
                  >
                    <Paperclip size={12} />
                    <span>{filesCount}</span>
                  </div>
                )}
              </div>
            </div>
            {!projectName && kit.legacyProject && (
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2 italic">
                <History size={14} />{" "}
                <span className="truncate">
                  Ex: {safeRender(kit.legacyProject)}
                </span>
              </div>
            )}
          </div>
          <div className="ml-2 flex flex-col items-end shrink-0 gap-1">
            {onBuy ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuy(kit);
                }}
                className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
              >
                <ShoppingBag size={20} />
              </button>
            ) : (
              <>
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
                  st.icon
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  },
);

const PaintCard = React.memo(
  ({ paint, onClick, onDelete, onBuy, allPaints }) => {
    const getStatusStyle = (s) => {
      switch (s) {
        case "in_stock":
          return "border-l-green-500";
        case "low":
          return "border-l-orange-500";
        case "wanted":
          return "border-l-purple-500";
        case "empty":
          return "border-l-red-500";
        default:
          return "border-l-slate-700";
      }
    };

    let mixStatusIcon = null;
    let mixStatusColor = "";
    if (paint.isMix && paint.status !== "in_stock" && allPaints) {
      const missingIngredients = (paint.mixParts || []).filter((part) => {
        const ingredient = allPaints.find((p) => p.id === part.paintId);
        return !ingredient || ingredient.status !== "in_stock";
      });
      if (
        missingIngredients.length === 0 &&
        (paint.mixParts || []).length > 0
      ) {
        mixStatusIcon = <CheckCircle2 size={14} />;
        mixStatusColor = "text-yellow-400";
      } else {
        mixStatusIcon = <AlertCircle size={14} />;
        mixStatusColor = "text-red-500";
      }
    }

    return (
      <div
        onClick={() => onClick && onClick(paint)}
        className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${getStatusStyle(paint.status)} flex items-center justify-between group`}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          <div
            className="w-8 h-8 rounded-full shadow-inner border border-slate-600 shrink-0 flex items-center justify-center bg-slate-900"
            style={{ backgroundColor: paint.hex || "#999" }}
            title={paint.hex}
          >
            {paint.isMix && (
              <FlaskConical size={14} className="text-white opacity-50" />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                {safeRender(paint.brand)}
              </span>
              <span
                className={`text-xs ${paint.isMix ? "text-slate-500 font-normal" : "font-bold text-white"} truncate`}
              >
                {safeRender(paint.code)}
              </span>
            </div>
            <p
              className={`truncate ${paint.isMix ? "text-sm font-bold text-white" : "text-xs text-slate-400"}`}
            >
              {safeRender(paint.name)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-2">
          {onBuy ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBuy(paint);
              }}
              className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
            >
              <ShoppingBag size={20} />
            </button>
          ) : (
            <>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase flex items-center gap-1 ${mixStatusColor ? "bg-slate-900 border border-slate-700 " + mixStatusColor : paint.status === "in_stock" ? "bg-green-500/10 text-green-500" : paint.status === "low" ? "bg-orange-500/10 text-orange-500" : paint.status === "wanted" ? "bg-purple-500/10 text-purple-500" : "bg-red-500/10 text-red-500"}`}
                >
                  {mixStatusIcon ? (
                    <>
                      {mixStatusIcon}
                      {mixStatusColor === "text-yellow-400"
                        ? "Namíchat"
                        : "Chybí složky"}
                    </>
                  ) : paint.status === "in_stock" ? (
                    paint.isMix ? (
                      "Mám namícháno"
                    ) : (
                      "Skladem"
                    )
                  ) : paint.status === "low" ? (
                    "Dochází"
                  ) : paint.status === "wanted" ? (
                    "Koupit"
                  ) : (
                    "Prázdné"
                  )}
                </span>
                <span className="text-[10px] text-slate-600">
                  {paint.isMix ? "Vlastní Mix" : safeRender(paint.type)}
                </span>
              </div>
              {onDelete && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(paint.id);
                  }}
                  className="text-slate-600 hover:text-red-500 p-2 rounded-full hover:bg-red-500/10 transition-colors ml-1"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);

// --- SETTINGS MODAL ---
const SettingsModal = ({
  user,
  onClose,
  kits,
  projects,
  paints,
  onImport,
  activeUid,
  onSetManualId,
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
      version: APP_VERSION,
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
                  {Object.keys(MASTER_CATALOG).length}
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

// --- KIT DETAIL MODAL ---
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
                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${selectedBrand === "Vlastní Mix" ? "bg-purple-600 text-white border-purple-500 shadow-lg scale-105" : "bg-slate-800 text-slate-400 border-slate-700"}`}
                  >
                    🧪 Mixy
                  </button>
                  {BRANDS.map((brand) => (
                    <button
                      key={brand}
                      onClick={() =>
                        setSelectedBrand(brand === selectedBrand ? "" : brand)
                      }
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${selectedBrand === brand ? "bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50 scale-105" : "bg-slate-800 text-slate-400 border-slate-700 hover:border-slate-500 hover:text-slate-200"}`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto bg-slate-900 relative">
                {selectedBrand ? (
                  <div className="p-3">
                    <div className="sticky top-0 z-10 bg-slate-900 pb-3">
                      <div className="relative">
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
                    </div>
                    <div className="space-y-4">
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
                      {rackPaints.inventory.length === 0 &&
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
                          if (!fullPaint)
                            fullPaint = {
                              id: paintLink.id,
                              brand: "Neznámý",
                              code: "???",
                              name: "Neznámá barva (Smazáno)",
                              hex: "#333333",
                              status: "scrap",
                              isOrphan: true,
                            };
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
                                  {!fullPaint.isOrphan ? (
                                    <span
                                      className={`text-[9px] px-1.5 rounded font-bold uppercase ${fullPaint.status === "in_stock" ? "text-green-500" : fullPaint.status === "low" ? "text-orange-500" : "text-red-500"}`}
                                    >
                                      {fullPaint.status === "in_stock"
                                        ? "OK"
                                        : "Koupit"}
                                    </span>
                                  ) : (
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
              {selectedBrand && (
                <button
                  onClick={() => setSelectedBrand("")}
                  className="absolute bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500 text-white shadow-xl shadow-slate-900/50 p-4 rounded-full font-bold flex items-center justify-center transition-transform hover:scale-105 active:scale-95 animate-in zoom-in"
                  title="Hotovo / Zpět k receptu"
                >
                  <Check size={24} />
                </button>
              )}
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

// --- PAINT DETAIL MODAL (s Mix funkcí a Striktním Výběrem) ---
const PaintDetailModal = ({
  paint,
  onClose,
  onSave,
  existingPaints,
  allKits,
}) => {
  const [data, setData] = useState({
    brand: "",
    code: "",
    name: "",
    type: "Akryl",
    finish: "Matná",
    status: "in_stock",
    hex: "#999999",
    notes: "",
    thinner: "",
    ratioPaint: 60,
    ratioThinner: 40,
    isMix: false,
    mixParts: [],
    ...paint,
  });
  const [isSaving, setIsSaving] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [duplicateError, setDuplicateError] = useState(null);

  // Mix state
  const [newMixPart, setNewMixPart] = useState({ paintId: "", ratio: 1 });

  const usage = useMemo(() => {
    if (!allKits) return [];
    return allKits.filter((k) => k.paints?.some((kp) => kp.id === paint.id));
  }, [allKits, paint.id]);

  useEffect(() => {
    if (data.brand && data.code && existingPaints) {
      const cleanBrand = data.brand.toLowerCase();
      const cleanCode = data.code.toLowerCase().replace(/[\s\-\.]/g, "");
      const duplicate = existingPaints.find(
        (p) =>
          p.id !== paint.id &&
          p.brand.toLowerCase() === cleanBrand &&
          p.code.toLowerCase().replace(/[\s\-\.]/g, "") === cleanCode,
      );
      setDuplicateError(
        duplicate
          ? `Tuto barvu už máte ve skladu (${duplicate.status === "in_stock" ? "Skladem" : duplicate.status}).`
          : null,
      );
    }
  }, [data.brand, data.code, existingPaints, paint.id]);

  useEffect(() => {
    if (!data.isMix && data.brand && data.code && !paint.id) {
      const searchBrand = data.brand.toUpperCase().replace(/\s+/g, "");
      const searchCode = data.code.toUpperCase().replace(/[\s\-\.]/g, "");
      const matches = Object.entries(MASTER_CATALOG).filter(
        ([key, val]) => key.startsWith(searchBrand) && key.includes(searchCode),
      );
      setSuggestions(matches);
      setShowSuggestions(matches.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [data.brand, data.code, paint.id, data.isMix]);

  const handleSelectSuggestion = ([key, val]) => {
    setData((prev) => ({
      ...prev,
      code: val.displayCode || prev.code,
      name: val.name,
      type: val.type,
      finish: val.finish,
      hex: val.hex,
    }));
    setShowSuggestions(false);
  };
  const isFormValid =
    data.name && (data.isMix || (data.brand && data.code)) && !duplicateError;
  const handleRatioChange = (type, value) => {
    if (value === "") {
      setData((d) => ({ ...d, ratioPaint: "", ratioThinner: "" }));
      return;
    }
    const num = parseInt(value);
    if (isNaN(num)) return;
    if (num > 100) return;
    if (type === "paint")
      setData((d) => ({ ...d, ratioPaint: num, ratioThinner: 100 - num }));
    else setData((d) => ({ ...d, ratioThinner: num, ratioPaint: 100 - num }));
  };
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

  // Mix logic
  const addMixPart = () => {
    if (!newMixPart.paintId || newMixPart.ratio <= 0) return;
    const selectedPaint = existingPaints.find(
      (p) => p.id === newMixPart.paintId,
    );
    if (!selectedPaint) return;
    setData((prev) => ({
      ...prev,
      mixParts: [
        ...(prev.mixParts || []),
        {
          ...newMixPart,
          name: selectedPaint.name,
          code: selectedPaint.code,
          brand: selectedPaint.brand,
        },
      ],
    }));
    setNewMixPart({ paintId: "", ratio: 1 });
  };

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 w-full max-w-lg rounded-xl border border-slate-700 shadow-2xl flex flex-col max-h-[95vh]">
        <div className="p-4 border-b border-slate-800 bg-slate-800/50 flex justify-between items-center rounded-t-xl">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            {data.isMix ? (
              <FlaskConical size={20} className="text-purple-400" />
            ) : (
              <Palette size={20} className="text-blue-400" />
            )}{" "}
            {paint.id ? "Upravit barvu" : "Nová barva"}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        <div className="p-4 space-y-4 flex-1 overflow-y-auto bg-slate-900 relative">
          {duplicateError && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-300 px-3 py-2 rounded-lg text-xs flex items-center gap-2 animate-pulse font-bold">
              <Ban size={16} className="shrink-0 text-red-500" /> Nelze uložit
              duplikát: {duplicateError}
            </div>
          )}

          <div
            className="flex items-center gap-2 mb-2 p-2 bg-slate-800/50 rounded border border-slate-700 cursor-pointer"
            onClick={() =>
              setData((d) => ({
                ...d,
                isMix: !d.isMix,
                brand: !d.isMix ? "Vlastní Mix" : "",
                code: !d.isMix ? "MIX-" + Date.now().toString().slice(-4) : "",
              }))
            }
          >
            <div
              className={`w-4 h-4 rounded border flex items-center justify-center ${data.isMix ? "bg-purple-500 border-purple-500" : "border-slate-500"}`}
            >
              {data.isMix && <Check size={12} className="text-white" />}
            </div>
            <span
              className={`text-sm font-bold ${data.isMix ? "text-purple-400" : "text-slate-400"}`}
            >
              🧪 Vlastní Mix / Míchaná barva
            </span>
          </div>

          {!data.isMix && (
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <label className="absolute -top-2 left-2 px-1 bg-slate-900 text-[10px] font-bold z-10 text-blue-400">
                  Značka *
                </label>
                <select
                  className="w-full bg-slate-950 text-sm font-bold text-white border border-slate-700 rounded px-3 py-2.5 outline-none focus:border-blue-500 transition-colors appearance-none cursor-pointer"
                  value={data.brand}
                  onChange={(e) => setData({ ...data, brand: e.target.value })}
                >
                  <option value="">-- Vyber --</option>
                  {BRANDS.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1 relative">
                <FloatingInput
                  label="Kód *"
                  value={data.code}
                  onChange={(e) =>
                    setData({ ...data, code: Normalizer.code(e.target.value) })
                  }
                  placeholder="XF-1"
                  labelColor="text-blue-400"
                />
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 bg-slate-800 border border-slate-600 rounded-lg mt-1 z-50 shadow-xl max-h-40 overflow-y-auto">
                    <div className="p-2 text-[10px] text-slate-400 font-bold uppercase border-b border-slate-700 bg-slate-900/50">
                      Nalezeno v katalogu:
                    </div>
                    {suggestions.map(([key, val]) => (
                      <div
                        key={key}
                        onClick={() => handleSelectSuggestion([key, val])}
                        className="p-2 hover:bg-blue-600/20 hover:text-blue-300 cursor-pointer text-xs flex items-center gap-2 transition-colors border-b border-slate-700/50 last:border-0"
                      >
                        <Wand2 size={12} className="text-purple-400" />
                        <span className="font-bold text-white">
                          {val.displayCode}
                        </span>
                        <span className="text-slate-300 truncate">
                          {val.name}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <FloatingInput
            label="Název / Odstín *"
            value={data.name}
            onChange={(e) =>
              setData({ ...data, name: Normalizer.name(e.target.value) })
            }
            placeholder={data.isMix ? "Můj stínovací mix" : "flat black"}
            labelColor={data.isMix ? "text-purple-400" : "text-blue-400"}
          />

          <div className="flex gap-3">
            <FloatingSelect
              className="flex-1"
              label="Typ"
              value={data.type}
              onChange={(e) => setData({ ...data, type: e.target.value })}
              options={[
                { value: "Akryl", label: "💧 Akryl" },
                { value: "Enamel", label: "🛢️ Enamel" },
                { value: "Lacquer", label: "☣️ Lacquer" },
                { value: "Olej", label: "🎨 Olej" },
                { value: "Pigment", label: "🏜️ Pigment" },
              ]}
            />
            <FloatingSelect
              className="flex-1"
              label="Povrch"
              value={data.finish}
              onChange={(e) => setData({ ...data, finish: e.target.value })}
              options={[
                { value: "Matná", label: "Matná" },
                { value: "Polomat", label: "Polomat" },
                { value: "Lesklá", label: "Lesklá" },
                { value: "Kovová", label: "Kovová" },
                { value: "Transparentní", label: "Transparentní" },
              ]}
            />
            {/* ZMĚNA: Přidána možnost "Dochází" pro Mixy */}
            <FloatingSelect
              className="flex-1"
              label="Status"
              value={data.status}
              onChange={(e) => setData({ ...data, status: e.target.value })}
              options={
                data.isMix
                  ? [
                      { value: "in_stock", label: "✅ Mám namícháno" },
                      { value: "low", label: "⚠️ Dochází" },
                      { value: "empty", label: "🧪 Jen recept" },
                    ]
                  : [
                      { value: "in_stock", label: "✅ Skladem" },
                      { value: "low", label: "⚠️ Dochází" },
                      { value: "empty", label: "❌ Prázdné" },
                      { value: "wanted", label: "🛒 Koupit" },
                    ]
              }
            />
          </div>

          {data.isMix && (
            <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
              <h4 className="text-xs font-bold text-purple-400 uppercase mb-2 flex items-center gap-2">
                <FlaskConical size={14} /> Receptura (Ingredience)
              </h4>
              <div className="flex gap-2 mb-2">
                <select
                  className="flex-1 bg-slate-950 border border-slate-600 rounded text-xs text-white p-2"
                  value={newMixPart.paintId}
                  onChange={(e) =>
                    setNewMixPart({ ...newMixPart, paintId: e.target.value })
                  }
                >
                  <option value="">-- Vyber barvu ze skladu --</option>
                  {existingPaints
                    .filter((p) => p.status === "in_stock")
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.brand} {p.code} {p.name}
                      </option>
                    ))}
                </select>
                <input
                  type="number"
                  min="1"
                  className="w-16 bg-slate-950 border border-slate-600 rounded text-xs text-white p-2 text-center"
                  placeholder="Díly"
                  value={newMixPart.ratio}
                  onChange={(e) =>
                    setNewMixPart({
                      ...newMixPart,
                      ratio: parseInt(e.target.value) || 0,
                    })
                  }
                />
                <button
                  onClick={addMixPart}
                  disabled={!newMixPart.paintId}
                  className="bg-purple-600 text-white p-2 rounded disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="space-y-1">
                {data.mixParts?.map((part, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700 text-xs"
                  >
                    <span>
                      <span className="font-bold text-purple-400">
                        {part.ratio} dílů
                      </span>{" "}
                      - {part.brand} {part.code} {part.name}
                    </span>
                    <button
                      onClick={() =>
                        setData((prev) => ({
                          ...prev,
                          mixParts: prev.mixParts.filter((_, i) => i !== idx),
                        }))
                      }
                      className="text-slate-500 hover:text-red-400"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!data.mixParts || data.mixParts.length === 0) && (
                  <p className="text-[10px] text-slate-500 italic text-center">
                    Zatím žádné ingredience.
                  </p>
                )}
              </div>
            </div>
          )}

          {!data.isMix && (
            <p className="text-[10px] text-blue-400/50 font-bold -mt-2 mb-2">
              * tyto údaje jsou povinné (značka, kód, název)
            </p>
          )}

          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Droplets size={14} className="text-blue-400" /> Ředění
            </h4>
            <div className="flex gap-3 items-end">
              <FloatingInput
                className="flex-[2]"
                label="Ředidlo"
                value={data.thinner || ""}
                onChange={(e) => setData({ ...data, thinner: e.target.value })}
                placeholder="Např. Tamiya X-20A"
              />
              <div className="flex items-center gap-1 bg-slate-900 border border-slate-700 rounded px-2 py-1 h-[42px]">
                <div className="text-center">
                  <label className="text-[8px] text-slate-500 font-bold block">
                    BARVA
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                    placeholder="60"
                    value={data.ratioPaint}
                    onChange={(e) => handleRatioChange("paint", e.target.value)}
                  />
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="text-center">
                  <label className="text-[8px] text-slate-500 font-bold block">
                    ŘEDIDLO
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    className="w-8 bg-transparent text-center text-sm font-bold text-white outline-none appearance-none"
                    placeholder="40"
                    value={data.ratioThinner}
                    onChange={(e) =>
                      handleRatioChange("thinner", e.target.value)
                    }
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-2">
              Odstín (Preview)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                value={data.hex}
                onChange={(e) => setData({ ...data, hex: e.target.value })}
                className="w-12 h-12 rounded cursor-pointer border-none bg-transparent"
              />
              <div className="flex-1">
                <input
                  type="text"
                  value={data.hex}
                  onChange={(e) => setData({ ...data, hex: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-sm font-mono text-white uppercase outline-none focus:border-blue-500"
                  placeholder="#000000"
                />
                <p className="text-[10px] text-slate-500 mt-1">
                  Klikni na čtvereček nebo vlož kód.
                </p>
              </div>
            </div>
          </div>
          <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
              <Box size={14} className="text-purple-400" /> Použití v modelech
            </h4>
            {usage.length > 0 ? (
              <div className="space-y-1">
                {usage.map((k) => (
                  <div
                    key={k.id}
                    className="text-xs text-slate-300 flex items-center gap-2 bg-slate-900 p-2 rounded"
                  >
                    <ChevronRight size={10} className="text-slate-500" />
                    <span className="font-bold">{k.subject}</span>
                    <span>{k.name}</span>
                    {k.paints?.find((p) => p.id === paint.id)?.note && (
                      <span className="text-[10px] text-slate-500 italic ml-auto">
                        ({k.paints.find((p) => p.id === paint.id).note})
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 italic">
                Tato barva není přiřazena k žádnému modelu.
              </p>
            )}
          </div>
          <div className="pt-2">
            <FloatingTextarea
              label="Poznámky (např. chování v pistoli)"
              value={data.notes || ""}
              onChange={(e) => setData({ ...data, notes: e.target.value })}
              height="h-24"
              labelColor="text-orange-400"
            />
          </div>
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

// ==========================================
// 🚀 HLAVNÍ APLIKACE (App)
// ==========================================

export default function App() {
  const [view, setView] = useState("kits");
  const [kits, setKits] = useState([]);
  const [projects, setProjects] = useState([]);
  const [paints, setPaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: null,
    isDestructive: false,
  });
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    scales: [],
    brands: [],
    kitStatuses: [],
    projectStatuses: [],
    paintBrands: [],
    paintTypes: [],
  });
  const [manualDataUid, setManualDataUid] = useState(null);
  const [activeKit, setActiveKit] = useState(null);
  const [isNewKit, setIsNewKit] = useState(false);
  const [activeProject, setActiveProject] = useState(null);
  const [isNewProject, setIsNewProject] = useState(false);
  const [activePaint, setActivePaint] = useState(null);
  const [isNewPaint, setIsNewPaint] = useState(false);
  const activeUid = manualDataUid || user?.uid;

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        setKits([]);
        setProjects([]);
        setPaints([]);
      }
      if (currentUser) setLoading(false);
    });
    const initAuth = async () => {
      try {
        await auth.authStateReady();
        if (!auth.currentUser) {
          if (
            typeof __initial_auth_token !== "undefined" &&
            __initial_auth_token
          )
            await signInWithCustomToken(auth, __initial_auth_token);
          else await signInAnonymously(auth);
        }
      } catch (e) {
        console.error("Auth Error:", e);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
    return () => unsubAuth();
  }, []);

  useEffect(() => {
    if (!user || !db || !activeUid) return;
    setLoading(true);
    const handleError = (err) => {
      setLoading(false);
      if (err.code !== "permission-denied")
        console.error("Snapshot error:", err);
    };
    const unsubKits = onSnapshot(
      collection(db, "artifacts", "model-diary", "users", activeUid, "kits"),
      (snap) => setKits(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      handleError,
    );
    const unsubProjs = onSnapshot(
      collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        activeUid,
        "projects",
      ),
      (snap) => setProjects(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      handleError,
    );
    const unsubPaints = onSnapshot(
      collection(db, "artifacts", "model-diary", "users", activeUid, "paints"),
      (snap) => {
        setPaints(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      handleError,
    );
    return () => {
      unsubKits();
      unsubProjs();
      unsubPaints();
    };
  }, [user, activeUid]);

  const requestConfirm = (title, message, onConfirm, isDestructive = false) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm: () => {
        onConfirm();
        setConfirmModal((prev) => ({ ...prev, isOpen: false }));
      },
      isDestructive,
    });
  };
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

  const handleSaveItem = async (
    collectionName,
    itemData,
    isNew,
    setList,
    list,
  ) => {
    const dataToSave = { ...itemData };
    if (dataToSave.initialTab) delete dataToSave.initialTab;
    if (collectionName === "kits" && dataToSave.projectId)
      dataToSave.legacyProject = null;
    let customId = null;
    if (collectionName === "paints") {
      customId = Normalizer.generateId(dataToSave.brand, dataToSave.code);
      if (customId) dataToSave.id = customId;
    }
    if (!db || !user) {
      const finalId = customId || dataToSave.id || Date.now().toString();
      if (isNew) {
        if (collectionName === "paints" && list.some((i) => i.id === finalId))
          setList(
            list.map((i) =>
              i.id === finalId ? { ...dataToSave, id: finalId } : i,
            ),
          );
        else setList([...list, { ...dataToSave, id: finalId }]);
      } else
        setList(list.map((i) => (i.id === dataToSave.id ? dataToSave : i)));
      return finalId;
    } else if (user && activeUid) {
      const colRef = collection(
        db,
        "artifacts",
        "model-diary",
        "users",
        activeUid,
        collectionName,
      );
      if (collectionName === "paints" && customId) {
        await setDoc(
          doc(colRef, customId),
          { ...dataToSave, createdAt: serverTimestamp() },
          { merge: true },
        );
        return customId;
      } else {
        if (isNew) {
          const { id, ...cleanData } = dataToSave;
          const ref = await addDoc(colRef, {
            ...cleanData,
            createdAt: serverTimestamp(),
          });
          return ref.id;
        } else {
          const { id, ...cleanData } = dataToSave;
          await updateDoc(doc(colRef, dataToSave.id), cleanData);
          return dataToSave.id;
        }
      }
    }
  };

  const handleQuickCreatePaint = (newPaintData) => {
    const id =
      Normalizer.generateId(newPaintData.brand, newPaintData.code) ||
      Date.now().toString();
    handleSaveItem("paints", { ...newPaintData, id }, true, setPaints, paints);
    return id;
  };
  const deleteItem = async (collectionName, id, list, setList) => {
    requestConfirm(
      "Opravdu smazat?",
      "Tato akce je nevratná. Položka bude trvale odstraněna.",
      async () => {
        if (!db || !user) setList(list.filter((i) => i.id !== id));
        else if (user && activeUid)
          await deleteDoc(
            doc(
              db,
              "artifacts",
              "model-diary",
              "users",
              activeUid,
              collectionName,
              id,
            ),
          );
        if (collectionName === "kits") setActiveKit(null);
        else if (collectionName === "projects") setActiveProject(null);
        else setActivePaint(null);
      },
      true,
    );
  };

  const handleImportRequest = (file) => {
    requestConfirm(
      "Import dat",
      "Pozor! Import přepíše všechna data se stejným ID. Opravdu chcete pokračovat?",
      async () => {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          if (!data.kits && !data.projects && !data.paints)
            throw new Error("Neplatná struktura dat.");
          const batch = db ? writeBatch(db) : null;
          let count = 0;
          if (!user || !db) {
            alert("Pro import dat musíte být online a přihlášeni.");
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
          data.paints?.forEach((paint) => {
            const id =
              paint.id ||
              Normalizer.generateId(paint.brand, paint.code) ||
              Date.now().toString();
            batch.set(
              doc(
                db,
                "artifacts",
                "model-diary",
                "users",
                user.uid,
                "paints",
                id,
              ),
              { ...paint, id },
            );
            count++;
          });
          if (count > 0) {
            await batch.commit();
            alert(`Obnoveno ${count} položek.`);
            setShowSettings(false);
          } else alert("Žádná data k importu.");
        } catch (err) {
          alert("Chyba importu: " + err.message);
        }
      },
      true,
    );
  };

  const shoppingList = useMemo(() => {
    const wishlistKits = kits.filter((k) => k.status === "wishlist");
    const kitAccessories = kits
      .filter((k) => k.status !== "finished")
      .flatMap((k) =>
        (k.accessories || [])
          .filter((a) => a.status === "wanted")
          .map((a) => ({
            ...a,
            parentId: k.id,
            parentName: `${k.brand} ${k.subject || ""} ${k.name}`,
            parentType: "kit",
          })),
      );
    const projectAccessories = projects
      .filter((p) => p.status !== "finished")
      .flatMap((p) =>
        (p.accessories || [])
          .filter((a) => a.status === "wanted")
          .map((a) => ({
            ...a,
            parentId: p.id,
            parentName: p.name,
            parentType: "project",
          })),
      );

    // ZMĚNA: Mixy se nikdy neobjeví v nákupním seznamu (protože !p.isMix)
    const wishlistPaints = paints.filter(
      (p) => !p.isMix && (p.status === "wanted" || p.status === "low"),
    );

    return {
      kits: wishlistKits,
      accessories: [...kitAccessories, ...projectAccessories],
      paints: wishlistPaints,
    };
  }, [kits, projects, paints]);

  const handleMarkAsBought = (item, type) => {
    requestConfirm(
      "Označit jako koupené?",
      `Položka "${item.name || item.brand}" se přesune do skladu.`,
      async () => {
        if (type === "kit")
          await handleSaveItem(
            "kits",
            { ...item, status: "new" },
            false,
            setKits,
            kits,
          );
        else if (type === "paint")
          await handleSaveItem(
            "paints",
            { ...item, status: "in_stock" },
            false,
            setPaints,
            paints,
          );
      },
    );
  };
  const handleBuyAccessory = (acc) => {
    requestConfirm(
      "Koupeno?",
      `Označit doplněk "${acc.name}" jako koupený?`,
      async () => {
        const collectionName = acc.parentType === "kit" ? "kits" : "projects";
        const parentItem = (acc.parentType === "kit" ? kits : projects).find(
          (i) => i.id === acc.parentId,
        );
        if (parentItem) {
          const updatedAccessories = parentItem.accessories.map((a) =>
            a.id === acc.id ? { ...a, status: "owned" } : a,
          );
          await handleSaveItem(
            collectionName,
            { ...parentItem, accessories: updatedAccessories },
            false,
            acc.parentType === "kit" ? setKits : setProjects,
            acc.parentType === "kit" ? kits : projects,
          );
        }
      },
    );
  };

  const availableScales = useMemo(
    () => [...new Set(kits.map((k) => k.scale).filter(Boolean))].sort(),
    [kits],
  );
  const availableBrands = useMemo(
    () => [...new Set(kits.map((k) => k.brand).filter(Boolean))].sort(),
    [kits],
  );
  const availablePaintBrands = useMemo(
    () => [...new Set(paints.map((p) => p.brand).filter(Boolean))].sort(),
    [paints],
  );
  const availablePaintTypes = useMemo(
    () => [...new Set(paints.map((p) => p.type).filter(Boolean))].sort(),
    [paints],
  );

  const toggleFilter = (type, value) => {
    setActiveFilters((prev) => {
      const current = prev[type];
      const next = current.includes(value)
        ? current.filter((i) => i !== value)
        : [...current, value];
      return { ...prev, [type]: next };
    });
  };
  const clearFilters = () =>
    setActiveFilters({
      scales: [],
      brands: [],
      kitStatuses: [],
      projectStatuses: [],
      paintBrands: [],
      paintTypes: [],
    });
  const hasActiveFilters = Object.values(activeFilters).some(
    (arr) => arr.length > 0,
  );

  const filteredKits = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return kits.filter(
      (k) =>
        (k.name + k.brand + (k.subject || ""))
          .toLowerCase()
          .includes(lowerSearch) &&
        (activeFilters.scales.length === 0 ||
          activeFilters.scales.includes(k.scale)) &&
        (activeFilters.brands.length === 0 ||
          activeFilters.brands.includes(k.brand)) &&
        (activeFilters.kitStatuses.length === 0 ||
          activeFilters.kitStatuses.includes(k.status)),
    );
  }, [kits, searchTerm, activeFilters]);

  const filteredProjects = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerSearch) &&
        (activeFilters.projectStatuses.length === 0 ||
          activeFilters.projectStatuses.includes(p.status)),
    );
  }, [projects, searchTerm, activeFilters]);

  const filteredPaints = useMemo(() => {
    const lowerSearch = searchTerm.toLowerCase();
    return paints.filter(
      (p) =>
        (p.name + p.code + p.brand).toLowerCase().includes(lowerSearch) &&
        (activeFilters.paintBrands.length === 0 ||
          activeFilters.paintBrands.includes(p.brand)) &&
        (activeFilters.paintTypes.length === 0 ||
          activeFilters.paintTypes.includes(p.type)),
    );
  }, [paints, searchTerm, activeFilters]);

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
  const groupedPaints = useMemo(
    () => ({
      inventory: filteredPaints.filter((p) =>
        ["in_stock", "low", "empty"].includes(p.status),
      ),
      wishlist: filteredPaints.filter((p) => p.status === "wanted"),
    }),
    [filteredPaints],
  );

  if (loading)
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400">
        <Loader2 size={48} className="animate-spin mb-4 text-blue-500" />
        <p>Načítám...</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 overflow-y-scroll">
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
                  } else if (view === "projects") {
                    setIsNewProject(true);
                    setActiveProject({ status: "active", accessories: [] });
                  } else if (view === "paints") {
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
                    alert(
                      "Pro přidání položky přepněte na Sklad, Barvy nebo Projekty.",
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
              onClick={() => setView("kits")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "kits" ? "bg-slate-700 text-white" : "text-slate-500"}`}
            >
              <Box size={16} /> Modely
            </button>
            <button
              onClick={() => setView("projects")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "projects" ? "bg-slate-700 text-white" : "text-slate-500"}`}
            >
              <Folder size={16} /> Projekty
            </button>
            <button
              onClick={() => setView("paints")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "paints" ? "bg-slate-700 text-blue-400" : "text-slate-500"}`}
            >
              <Paintbrush size={16} /> Barvy
            </button>
            <button
              onClick={() => setView("shopping")}
              className={`flex-1 py-2 px-2 text-sm font-bold rounded flex gap-2 justify-center items-center whitespace-nowrap ${view === "shopping" ? "bg-slate-700 text-orange-400" : "text-slate-500"}`}
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
                  view === "kits"
                    ? "Hledat model..."
                    : view === "paints"
                      ? "Hledat barvu..."
                      : "Hledat..."
                }
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => view !== "shopping" && setShowFilter(!showFilter)}
              className={`p-2 w-10 h-10 rounded-lg border flex items-center justify-center transition-opacity shrink-0 ${view === "shopping" ? "opacity-0 pointer-events-none border-transparent bg-transparent" : showFilter || hasActiveFilters ? "bg-blue-600 border-blue-500 text-white" : "bg-slate-800 border-slate-700 text-slate-400"}`}
            >
              <Filter size={20} />
            </button>
          </div>
          {/* FILTER PANEL */}
          {showFilter && view !== "shopping" && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-3 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-xs font-bold text-slate-500 uppercase">
                  Filtrování
                </h4>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-[10px] text-red-400 flex items-center gap-1 hover:underline"
                  >
                    <XCircle size={12} /> Zrušit vše
                  </button>
                )}
              </div>
              {view === "kits" ? (
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
                            active={activeFilters.kitStatuses.includes(s)}
                            onClick={() => toggleFilter("kitStatuses", s)}
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
                      {availableScales.map((s) => (
                        <FilterChip
                          key={s}
                          label={s}
                          active={activeFilters.scales.includes(s)}
                          onClick={() => toggleFilter("scales", s)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Výrobce
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availableBrands.map((b) => (
                        <FilterChip
                          key={b}
                          label={b}
                          active={activeFilters.brands.includes(b)}
                          onClick={() => toggleFilter("brands", b)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : view === "paints" ? (
                <div className="space-y-3">
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Výrobce barvy
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availablePaintBrands.map((b) => (
                        <FilterChip
                          key={b}
                          label={b}
                          active={activeFilters.paintBrands.includes(b)}
                          onClick={() => toggleFilter("paintBrands", b)}
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-600 font-bold block mb-1">
                      Typ barvy
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {availablePaintTypes.map((t) => (
                        <FilterChip
                          key={t}
                          label={t}
                          active={activeFilters.paintTypes.includes(t)}
                          onClick={() => toggleFilter("paintTypes", t)}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <span className="text-[10px] text-slate-600 font-bold block mb-1">
                    Stav projektu
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {["planned", "active", "finished", "hold"].map((s) => (
                      <FilterChip
                        key={s}
                        label={s}
                        active={activeFilters.projectStatuses.includes(s)}
                        onClick={() => toggleFilter("projectStatuses", s)}
                      />
                    ))}
                  </div>
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
            <div className={db ? "text-green-500" : "text-orange-500"}>
              {db ? "Online" : "Offline"}
            </div>
          </div>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-6">
        {view === "kits" && (
          <>
            {Object.entries(groupedKits).map(
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
            {filteredKits.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Package size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno (nebo skryto filtrem).</p>
              </div>
            )}
          </>
        )}

        {view === "projects" && (
          <>
            {filteredProjects.length > 0 ? (
              filteredProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => {
                    setIsNewProject(false);
                    setActiveProject(p);
                  }}
                  className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors group mb-4"
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
                            • {safeRender(k.subject)} {safeRender(k.name)}
                          </div>
                        ))
                    ) : (
                      <p className="text-xs text-slate-600 italic">Prázdno.</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-slate-500 py-10">
                <Folder size={48} className="mx-auto mb-2 opacity-20" />
                <p>Prázdno (nebo skryto filtrem).</p>
              </div>
            )}
          </>
        )}

        {view === "paints" && (
          <div className="space-y-6">
            {groupedPaints.inventory.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-2">
                    <Package size={12} /> Mám ve skladu (
                    {groupedPaints.inventory.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {groupedPaints.inventory.map((paint) => (
                    <PaintCard
                      key={paint.id}
                      paint={paint}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(paint);
                      }}
                      onDelete={(id) =>
                        deleteItem("paints", id, paints, setPaints)
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            {groupedPaints.wishlist.length > 0 && (
              <section>
                <div className="flex justify-between items-center mb-2">
                  <h2 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                    <ShoppingCart size={12} /> Nákupní seznam (
                    {groupedPaints.wishlist.length})
                  </h2>
                </div>
                <div className="space-y-2">
                  {groupedPaints.wishlist.map((paint) => (
                    <PaintCard
                      key={paint.id}
                      paint={paint}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(paint);
                      }}
                      onDelete={(id) =>
                        deleteItem("paints", id, paints, setPaints)
                      }
                    />
                  ))}
                </div>
              </section>
            )}
            {filteredPaints.length === 0 && (
              <div className="text-center text-slate-500 py-10">
                <Palette size={48} className="mx-auto mb-2 opacity-20" />
                <p>Žádné barvy (nebo skryto filtrem).</p>
              </div>
            )}
          </div>
        )}

        {view === "shopping" && (
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
            {shoppingList.kits.length === 0 &&
              shoppingList.accessories.length === 0 &&
              shoppingList.paints.length === 0 && (
                <div className="text-center text-slate-500 py-10">
                  <ShoppingBag size={48} className="mx-auto mb-2 opacity-20" />
                  <p>Váš nákupní seznam je prázdný.</p>
                </div>
              )}
            {shoppingList.kits.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Box size={14} /> Chybějící Modely
                </h3>
                {shoppingList.kits.map((k) => (
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
                    onBuy={(item) => handleMarkAsBought(item, "kit")}
                    allPaints={paints}
                    onOpenDetail={handleOpenKitDetail}
                  />
                ))}
              </div>
            )}
            {shoppingList.paints.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Paintbrush size={14} /> Barvy a Chemie
                </h3>
                <div className="space-y-1">
                  {shoppingList.paints.map((p) => (
                    <PaintCard
                      key={p.id}
                      paint={p}
                      onClick={() => {
                        setIsNewPaint(false);
                        setActivePaint(p);
                      }}
                      onBuy={(item) => handleMarkAsBought(item, "paint")}
                    />
                  ))}
                </div>
              </div>
            )}
            {shoppingList.accessories.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Layers size={14} /> Chybějící Doplňky
                </h3>
                <div className="space-y-2">
                  {shoppingList.accessories.map((acc, index) => (
                    <div
                      key={`${acc.id}-${index}`}
                      className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="text-sm font-bold text-white truncate">
                          {acc.name}
                        </p>
                        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <ArrowRight size={10} /> pro:{" "}
                          <span className="text-blue-400 font-medium truncate">
                            {acc.parentName}
                          </span>
                        </p>
                      </div>
                      <button
                        onClick={() => handleBuyAccessory(acc)}
                        className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
                        title="Označit jako koupené"
                      >
                        <ShoppingBag size={20} />
                      </button>
                    </div>
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
      />

      {/* MODALS */}
      {showSettings && (
        <SettingsModal
          user={user}
          onClose={() => setShowSettings(false)}
          kits={kits}
          projects={projects}
          paints={paints}
          onImport={handleImportRequest}
          activeUid={activeUid}
          onSetManualId={setManualDataUid}
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
          onQuickCreatePaint={handleQuickCreatePaint}
          onClose={() => setActiveKit(null)}
          onSave={(d) => handleSaveItem("kits", d, isNewKit, setKits, kits)}
          onDelete={(id) => deleteItem("kits", id, kits, setKits)}
          initialTab={activeKit.initialTab}
        />
      )}
      {activePaint && (
        <PaintDetailModal
          paint={activePaint}
          existingPaints={paints}
          allKits={kits}
          onClose={() => setActivePaint(null)}
          onSave={(d) =>
            handleSaveItem("paints", d, isNewPaint, setPaints, paints)
          }
          onDelete={(id) => deleteItem("paints", id, paints, setPaints)}
        />
      )}
    </div>
  );
}
