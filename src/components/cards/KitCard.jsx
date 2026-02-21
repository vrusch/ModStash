import React, { useMemo } from "react";
import {
  Package,
  Folder,
  ShoppingCart,
  Skull,
  Trophy,
  Palette,
  Layers,
  Paperclip,
  History,
  ShoppingBag,
  Trash2,
  Hammer,
  Image as ImageIcon,
} from "lucide-react";
import { safeRender } from "../../utils/helpers";

/**
 * Karta zobrazující model (Kit) v seznamu (Kitník, Na stole, Hotovo, Nákupní seznam).
 * Zobrazuje stav stavby, chybějící barvy/doplňky a přílohy.
 *
 * @param {Object} props
 * @param {Object} props.kit - Data modelu.
 * @param {Function} [props.onClick] - Handler kliknutí na kartu.
 * @param {string} [props.projectName] - Název projektu, ke kterému model patří.
 * @param {Function} [props.onBuy] - Handler pro nákupní seznam.
 * @param {Function} [props.onDelete] - Handler pro smazání modelu (zobrazí se jen u wishlistu).
 * @param {Array} [props.allPaints] - Seznam všech barev (pro výpočet, zda máme barvy na model).
 * @param {Function} [props.onOpenPaints] - Handler pro rychlé otevření barev modelu.
 * @param {Function} [props.onOpenDetail] - Handler pro otevření konkrétní záložky detailu (paints, parts, files).
 * @param {Function} [props.onOpenProject] - Handler pro proklik na detail projektu.
 * @returns {JSX.Element}
 */
const KitCard = React.memo(
  ({
    kit,
    onClick,
    projectName,
    onBuy,
    onDelete,
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

    // Logic for Badges
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

    const hasPhotos = !!kit.buildAlbumUrl;

    const isReadyToBuild = useMemo(() => {
      if (["finished", "scrap", "wishlist"].includes(kit.status)) return false;

      const paints = kit.paints || [];
      const accessories = kit.accessories || [];

      if (paints.length === 0 && accessories.length === 0) return false;

      const accessoriesReady = accessories.every((a) => a.status === "owned");
      const paintsReady = paints.every((p) => {
        const stock = allPaints?.find((ap) => ap.id === p.id);
        return stock && ["in_stock", "low"].includes(stock.status);
      });

      return accessoriesReady && paintsReady;
    }, [kit, allPaints]);

    return (
      <div
        onClick={() => onClick && onClick(kit)}
        className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${st.border} relative group`}
      >
        <div className="flex justify-between items-stretch">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-bold bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700 whitespace-nowrap">
                {safeRender(kit.scale)}
              </span>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider truncate">
                {safeRender(kit.brand)}{" "}
                {kit.catNum && `• ${safeRender(kit.catNum)}`}
              </span>
            </div>
            <h3 className="font-bold text-white leading-tight truncate text-xs">
              {kit.subject ? (
                <>
                  {safeRender(kit.subject)}
                  <span className="text-slate-400 text-xs font-normal ml-1.5">
                    {safeRender(kit.name)}
                  </span>
                </>
              ) : (
                safeRender(kit.name)
              )}
            </h3>

            <div className="flex items-center gap-2 mt-2">
              {projectName && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenProject) onOpenProject(kit.projectId);
                  }}
                  className="flex items-center gap-1.5 text-xs text-blue-400 font-medium hover:underline cursor-pointer min-w-0"
                >
                  <Folder size={14} className="shrink-0" />{" "}
                  <span className="truncate">{safeRender(projectName)}</span>
                </div>
              )}
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

          <div className="ml-2 flex flex-col items-end shrink-0 gap-1 justify-between">
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
                  <div className="flex flex-col items-end gap-1">
                    {st.icon}
                    {kit.status === "wishlist" && onDelete && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(kit.id);
                        }}
                        className="text-slate-600 hover:text-red-500 p-1 rounded hover:bg-red-500/10 transition-colors"
                        title="Odstranit ze seznamu"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                )}
              </>
            )}
            <div className="flex items-center gap-2 mt-1">
              {/* Ready to Build Badge */}
              {isReadyToBuild && (
                <div
                  className="flex items-center gap-1 text-xs font-bold rounded px-1.5 py-0.5 border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                  title="Připraveno ke stavbě (Máte všechny barvy a doplňky)"
                >
                  <Hammer size={12} />
                  <span className="hidden sm:inline">Ready</span>
                </div>
              )}

              {/* Paints Badge */}
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

              {/* Accessories Badge */}
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

              {/* Photos Badge */}
              {hasPhotos && (
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onOpenDetail) onOpenDetail(kit, "build");
                  }}
                  className="flex items-center gap-1.5 text-xs font-bold rounded px-1.5 py-0.5 border cursor-pointer hover:opacity-80 transition-opacity bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                >
                  <ImageIcon size={12} />
                  <span className="hidden sm:inline">Album</span>
                </div>
              )}

              {/* Files Badge */}
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
        </div>
      </div>
    );
  },
);

export default KitCard;
