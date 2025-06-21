import { Tool } from "@/types/tools";

interface SidebarProps {
  tools: Tool[];
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

export default function Sidebar({ tools, activeTool, onToolSelect }: SidebarProps) {
  const categories = [
    { id: "Mathematics", name: "Mathematics" },
    { id: "Text Tools", name: "Text Tools" },
    { id: "Generators", name: "Generators" },
    { id: "System", name: "System" }
  ];

  const getToolsByCategory = (category: string) => {
    return tools.filter(tool => tool.category === category);
  };

  return (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <i className="fas fa-toolbox text-white text-sm"></i>
          </div>
          <div>
            <h1 className="font-semibold text-lg">Toolbox Pro</h1>
            <p className="text-xs text-slate-500">Utility Suite</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 overflow-y-auto">
        <div className="space-y-2">
          {categories.map(category => {
            const categoryTools = getToolsByCategory(category.id);
            if (categoryTools.length === 0) return null;

            return (
              <div key={category.id} className="mb-4">
                <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-2">
                  {category.name}
                </h3>
                <ul className="space-y-1">
                  {categoryTools.map(tool => (
                    <li key={tool.id}>
                      <button
                        onClick={() => onToolSelect(tool)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                          activeTool.id === tool.id
                            ? "bg-primary text-white"
                            : "hover:bg-slate-100"
                        }`}
                      >
                        <i className={`fas fa-${tool.icon} w-4`}></i>
                        <span className="font-medium">{tool.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>v1.0.0</span>
          <button className="hover:text-slate-700 transition-colors">
            <i className="fas fa-cog"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
