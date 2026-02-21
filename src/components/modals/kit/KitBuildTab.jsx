import React, { useState } from "react";
import {
  Hammer,
  Plus,
  Trash2,
  Image as ImageIcon,
  ExternalLink,
} from "lucide-react";

const KitBuildTab = ({ data, setData }) => {
  const [newTodo, setNewTodo] = useState("");

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

  return (
    <div className="space-y-4 p-4">
      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 shadow-inner">
        <div className="flex justify-between items-end mb-4 px-1">
          <div>
            <span className="text-[10px] font-bold text-orange-500 block tracking-wider mb-1">
              DOKONČENO
            </span>
            <span className="text-4xl font-bold text-white leading-none">
              {data.progress}
              <span className="text-sm text-slate-500 font-normal ml-1">%</span>
            </span>
          </div>
          <Hammer size={24} className="text-slate-700 mb-1" />
        </div>
        <input
          type="range"
          min="0"
          max="100"
          step="5"
          value={data.progress}
          onChange={(e) =>
            setData({ ...data, progress: Number(e.target.value) })
          }
          className="w-full cursor-pointer"
        />
      </div>

      {/* FOTOGALERIE (Stavba Lite) */}
      <div className="bg-slate-800 p-3 rounded-xl border border-slate-700/50">
        <h4 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2">
          <ImageIcon size={14} className="text-blue-400" /> Fotogalerie stavby
          (Album)
        </h4>
        <div className="flex gap-2">
          <input
            className="flex-1 bg-slate-900 border border-slate-600 rounded p-2 text-xs text-white placeholder-slate-600 focus:border-blue-500 outline-none transition-colors"
            placeholder="URL odkazu na album (Google Photos, Facebook, Rajče...)"
            value={data.buildAlbumUrl || ""}
            onChange={(e) =>
              setData({ ...data, buildAlbumUrl: e.target.value })
            }
          />
          {data.buildAlbumUrl && (
            <a
              href={data.buildAlbumUrl}
              target="_blank"
              rel="noreferrer"
              className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded border border-blue-500 transition-colors flex items-center gap-2"
              title="Otevřít album"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
        <p className="text-[10px] text-slate-500 mt-2 italic">
          Zde můžete vložit odkaz na externí galerii, kde dokumentujete stavbu.
        </p>
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
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default KitBuildTab;
