import React, { useState } from "react";
import {
  Box,
  Layers,
  Hammer,
  CheckCircle2,
  Calendar,
  PauseCircle,
  ShoppingCart,
  ChevronDown,
  ChevronUp,
  Palette,
} from "lucide-react";
import { safeRender } from "../../utils/helpers";

/**
 * Karta projektu sdružujícího více modelů.
 * Zobrazuje název, status a seznam přiřazených modelů.
 *
 * @param {Object} props
 * @param {Object} props.project - Data projektu.
 * @param {string} props.project.id - Unikátní ID projektu.
 * @param {string} props.project.name - Název projektu.
 * @param {string} props.project.status - Stav projektu (active, finished, atd.).
 * @param {string} [props.project.description] - Popis projektu.
 * @param {Function} [props.onClick] - Handler kliknutí na kartu.
 * @param {Array<Object>} props.kits - Seznam všech modelů (pro vyfiltrování těch, které patří do projektu).
 * @param {Function} [props.onKitClick] - Handler pro otevření detailu konkrétního modelu.
 * @param {Function} [props.onOpenDetail] - Handler pro přímé otevření modalu modelu.
 * @returns {JSX.Element}
 */
const ProjectCard = ({ project, onClick, kits, onKitClick, onOpenDetail }) => {
  const [isExpanded, setIsExpanded] = useState(project.status !== "finished");
  const projectKits = kits.filter((k) => k.projectId === project.id);
  const finishedKits = projectKits.filter(
    (k) => k.status === "finished",
  ).length;
  const totalKits = projectKits.length;

  // Výpočet unikátních barev v projektu (sjednocení ze všech modelů)
  const uniquePaintsCount = new Set(
    projectKits.flatMap((k) => k.paints?.map((p) => p.id) || []),
  ).size;

  // Výpočet celkového postupu projektu (průměr postupu modelů)
  const totalProgress =
    totalKits > 0
      ? Math.round(
          projectKits.reduce((acc, k) => {
            if (k.status === "finished") return acc + 100;
            if (k.status === "wip") return acc + (k.progress || 0);
            return acc;
          }, 0) / totalKits,
        )
      : 0;

  const getStatusConfig = (s) => {
    switch (s) {
      case "active":
        return {
          border: "border-l-orange-500",
          text: "text-orange-400",
          bg: "bg-orange-500/10",
          icon: <Hammer size={14} />,
          label: "Aktivní",
        };
      case "finished":
        return {
          border: "border-l-green-500 opacity-70",
          text: "text-green-400",
          bg: "bg-green-500/10",
          icon: <CheckCircle2 size={14} />,
          label: "Dokončeno",
        };
      case "planned":
        return {
          border: "border-l-blue-500",
          text: "text-blue-400",
          bg: "bg-blue-500/10",
          icon: <Calendar size={14} />,
          label: "Plánováno",
        };
      case "hold":
        return {
          border: "border-l-red-500",
          text: "text-red-400",
          bg: "bg-red-500/10",
          icon: <PauseCircle size={14} />,
          label: "Pozastaveno",
        };
      default:
        return {
          border: "border-l-slate-700",
          text: "text-slate-400",
          bg: "bg-slate-800",
          icon: null,
          label: s,
        };
    }
  };

  const st = getStatusConfig(project.status);

  return (
    <div
      onClick={() => onClick && onClick(project)}
      className={`bg-slate-800 rounded-lg p-3 mb-2 shadow-sm hover:bg-slate-750 cursor-pointer transition-all border border-slate-700 border-l-4 ${st.border} relative group`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-sm text-white group-hover:text-blue-400 transition-colors uppercase tracking-wide">
            {project.name}
          </h3>
          <div className="flex items-center gap-2 mt-1">
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded uppercase font-bold flex items-center gap-1 ${st.bg} ${st.text}`}
            >
              {st.icon} {st.label}
            </span>
            {project.status === "active" && (
              <span className="text-[10px] font-mono text-slate-500">
                {totalProgress}%
              </span>
            )}
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-3 line-clamp-2 min-h-[1.5em]">
        {project.description || "Bez popisu"}
      </p>

      {/* Progress Bar */}
      {project.status === "active" && (
        <div className="w-full h-1 bg-slate-700 rounded-full mb-3 overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all duration-500"
            style={{ width: `${totalProgress}%` }}
          ></div>
        </div>
      )}

      {/* Seznam modelů (Mini Kit Cards) */}
      {isExpanded && (
        <div className="space-y-1 mb-3 animate-in slide-in-from-top-1 fade-in duration-200">
          {projectKits.map((k) => {
            let borderClass = "border-l-slate-600";
            let bgClass = "bg-slate-900/50 hover:bg-slate-800";
            let icon = null;

            switch (k.status) {
              case "finished":
                borderClass = "border-l-green-500 opacity-70";
                bgClass = "bg-green-500/10 hover:bg-green-500/20";
                icon = <CheckCircle2 size={12} className="text-green-500" />;
                break;
              case "wip":
                borderClass = "border-l-orange-500";
                bgClass = "bg-orange-500/10 hover:bg-orange-500/20";
                break;
              case "new":
                borderClass = "border-l-blue-500";
                bgClass = "bg-blue-500/10 hover:bg-blue-500/20";
                icon = <Box size={12} className="text-blue-500" />;
                break;
              case "wishlist":
                borderClass = "border-l-purple-500 border-dashed";
                bgClass = "bg-purple-500/10 hover:bg-purple-500/20";
                icon = <ShoppingCart size={12} className="text-purple-500" />;
                break;
              case "scrap":
                borderClass = "border-l-slate-500 grayscale";
                bgClass = "bg-slate-500/10 hover:bg-slate-500/20";
                icon = <Box size={12} className="text-slate-500" />;
                break;
              default:
                borderClass = "border-l-slate-600";
            }

            return (
              <div
                key={k.id}
                onClick={(e) => {
                  e.stopPropagation();
                  if (onOpenDetail) onOpenDetail(k);
                  else if (onKitClick) onKitClick(k);
                }}
                className={`flex items-center justify-between p-1.5 rounded border border-slate-700/50 border-l-2 ${borderClass} ${bgClass} text-xs cursor-pointer transition-colors`}
              >
                <div className="truncate mr-2 flex-1">
                  <span className="font-bold text-slate-300 mr-1 text-[11px] uppercase">
                    {safeRender(k.subject)}
                  </span>
                  <span className="text-slate-500">{safeRender(k.name)}</span>
                </div>
                <div className="shrink-0">
                  {k.status === "wip" ? (
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-1 bg-slate-700 rounded-full">
                        <div
                          className="h-full bg-orange-500 rounded-full"
                          style={{ width: `${k.progress || 0}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    icon
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer Stats */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
            <Box size={14} className="text-blue-400" />
            <span>
              {finishedKits}/{totalKits}{" "}
              <span className="text-[10px] font-normal text-slate-500">
                Hotovo
              </span>
            </span>
          </div>
          {project.accessories?.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Layers size={14} className="text-purple-400" />
              <span>
                {project.accessories.length}{" "}
                <span className="text-[10px] font-normal text-slate-500">
                  Doplňků
                </span>
              </span>
            </div>
          )}
          {uniquePaintsCount > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
              <Palette size={14} className="text-pink-400" />
              <span>
                {uniquePaintsCount}{" "}
                <span className="text-[10px] font-normal text-slate-500">
                  Barev
                </span>
              </span>
            </div>
          )}
        </div>
        {projectKits.length > 0 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="text-slate-500 hover:text-slate-300 p-1 rounded hover:bg-slate-700/50 transition-colors"
            title={isExpanded ? "Skrýt modely" : "Zobrazit modely"}
          >
            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;
