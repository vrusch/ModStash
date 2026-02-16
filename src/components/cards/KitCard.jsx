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
} from "lucide-react";
import { safeRender } from "../../utils/helpers";

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

export default KitCard;