import React from "react";
import { AlertTriangle, Wand2 } from "lucide-react";
import { safeRender } from "../../utils/helpers";

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

export default ConfirmModal;