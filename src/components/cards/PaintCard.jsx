import React from "react";
import {
  CheckCircle2,
  AlertCircle,
  FlaskConical,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { safeRender } from "../../utils/helpers";

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

export default PaintCard;