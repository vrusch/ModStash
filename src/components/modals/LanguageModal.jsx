import React from "react";
import { X, Check } from "lucide-react";
import { CzechFlag, USUKFlag, SpanishFlag, GermanFlag } from "../ui/Icons";

const languages = [
  { code: "cs", name: "Čeština", Flag: CzechFlag },
  { code: "en", name: "English", Flag: USUKFlag },
  { code: "es", name: "Español", Flag: SpanishFlag },
  { code: "de", name: "Deutsch", Flag: GermanFlag },
];

const LanguageModal = ({ activeLanguage, onSelectLanguage, onClose }) => {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-xs overflow-hidden animate-in zoom-in-95">
        <div className="bg-slate-800 p-4 border-b border-slate-700 flex justify-between items-center">
          <h3 className="font-bold text-white">Vyberte jazyk</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="p-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                onSelectLanguage(lang.code);
                onClose();
              }}
              className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
                activeLanguage === lang.code
                  ? "bg-blue-600/20 border border-blue-500/30"
                  : "hover:bg-slate-800 border border-transparent"
              }`}
            >
              <div className="flex items-center gap-3">
                <lang.Flag className="w-6 h-4 rounded shadow-sm" />
                <span
                  className={`text-sm font-medium ${
                    activeLanguage === lang.code
                      ? "text-blue-400"
                      : "text-slate-300"
                  }`}
                >
                  {lang.name}
                </span>
              </div>
              {activeLanguage === lang.code && (
                <Check size={16} className="text-blue-400" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LanguageModal;
