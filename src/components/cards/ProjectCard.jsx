import React from "react";
import { Box } from "lucide-react";
import { safeRender } from "../../utils/helpers";

const ProjectCard = ({ project, onClick, kits }) => {
  const projectKits = kits.filter((k) => k.projectId === project.id);

  return (
    <div
      onClick={() => onClick && onClick(project)}
      className="bg-slate-800 border border-slate-700 rounded-xl p-4 cursor-pointer hover:border-slate-500 transition-colors group mb-4"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-lg text-white group-hover:text-blue-400">
          {project.name}
        </h3>
        <span
          className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${project.status === "active" ? "bg-orange-500/20 text-orange-400" : project.status === "finished" ? "bg-green-500/20 text-green-400" : "bg-slate-700 text-slate-300"}`}
        >
          {project.status}
        </span>
      </div>
      <p className="text-sm text-slate-400 mb-4 truncate">
        {project.description || "Bez popisu"}
      </p>
      <div className="bg-slate-900/50 rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
          <Box size={12} /> Modely:
        </h4>
        {projectKits.length > 0 ? (
          projectKits.map((k) => (
            <div key={k.id} className="text-sm text-slate-300 truncate">
              • {safeRender(k.subject)} {safeRender(k.name)}
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-600 italic">Prázdno.</p>
        )}
      </div>
    </div>
  );
};

export default ProjectCard;