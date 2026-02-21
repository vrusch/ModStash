import React from "react";
import { ShoppingBag, ArrowRight } from "lucide-react";

/**
 * Jednoduchá karta pro doplněk v nákupním seznamu.
 *
 * @param {Object} props
 * @param {Object} props.accessory - Data doplňku.
 * @param {string} props.accessory.name - Název doplňku.
 * @param {string} props.accessory.parentName - Název modelu/projektu, ke kterému doplněk patří.
 * @param {Function} [props.onBuy] - Handler pro označení jako koupené (přesun do skladu).
 * @returns {JSX.Element}
 */
const ShoppingAccessoryCard = ({ accessory, onBuy }) => {
  return (
    <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 flex justify-between items-center group">
      <div className="min-w-0 flex-1 pr-2">
        <p className="text-xs font-bold text-white truncate">
          {accessory.name}
        </p>
        <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
          <ArrowRight size={10} /> pro:{" "}
          <span className="text-blue-400 font-medium truncate">
            {accessory.parentName}
          </span>
        </p>
      </div>
      <button
        onClick={() => onBuy && onBuy(accessory)}
        className="bg-green-600 hover:bg-green-500 text-white p-2 rounded-lg shadow-lg flex items-center justify-center transition-all active:scale-95"
        title="Označit jako koupené"
      >
        <ShoppingBag size={20} />
      </button>
    </div>
  );
};

export default ShoppingAccessoryCard;
