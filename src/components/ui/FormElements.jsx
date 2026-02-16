import React from "react";

export const FloatingInput = ({
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

export const FloatingTextarea = ({
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

export const FloatingSelect = ({
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

export const FilterChip = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`text-[10px] font-bold px-2 py-1 rounded border transition-all whitespace-nowrap ${
      active
        ? "bg-blue-600 border-blue-500 text-white shadow-sm"
        : "bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-600"
    }`}
  >
    {label}
  </button>
);