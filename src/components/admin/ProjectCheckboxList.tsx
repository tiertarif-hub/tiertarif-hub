import { useEffect, useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useProjects } from "@/hooks/useProjects";
import { Loader2, GripVertical } from "lucide-react";

interface ProjectCheckboxListProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export default function ProjectCheckboxList({ selectedIds, onChange }: ProjectCheckboxListProps) {
  const { data: projects = [], isLoading } = useProjects(true);
  const [orderedIds, setOrderedIds] = useState<string[]>(selectedIds);

  useEffect(() => {
    setOrderedIds(selectedIds);
  }, [selectedIds]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  // Filter to only dating-relevant projects
  const datingProjects = projects.filter(
    (p) => p.is_active && !["bet365", "vulkan-vegas"].includes(p.slug)
  );

  function handleToggle(projectId: string) {
    if (orderedIds.includes(projectId)) {
      const newIds = orderedIds.filter((id) => id !== projectId);
      setOrderedIds(newIds);
      onChange(newIds);
    } else {
      const newIds = [...orderedIds, projectId];
      setOrderedIds(newIds);
      onChange(newIds);
    }
  }

  function moveUp(projectId: string) {
    const index = orderedIds.indexOf(projectId);
    if (index <= 0) return;
    const newIds = [...orderedIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    setOrderedIds(newIds);
    onChange(newIds);
  }

  function moveDown(projectId: string) {
    const index = orderedIds.indexOf(projectId);
    if (index === -1 || index >= orderedIds.length - 1) return;
    const newIds = [...orderedIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    setOrderedIds(newIds);
    onChange(newIds);
  }

  // Show selected first, then unselected
  const sortedProjects = [...datingProjects].sort((a, b) => {
    const aSelected = orderedIds.includes(a.id);
    const bSelected = orderedIds.includes(b.id);
    if (aSelected && !bSelected) return -1;
    if (!aSelected && bSelected) return 1;
    if (aSelected && bSelected) {
      return orderedIds.indexOf(a.id) - orderedIds.indexOf(b.id);
    }
    return 0;
  });

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
      {sortedProjects.map((project) => {
        const isSelected = orderedIds.includes(project.id);
        const selectedIndex = orderedIds.indexOf(project.id);
        
        return (
          <div
            key={project.id}
            className={`flex items-center gap-3 p-2 rounded-lg transition-colors ${
              isSelected ? "bg-primary/10 border border-primary/20" : "hover:bg-muted"
            }`}
          >
            {isSelected && (
              <div className="flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => moveUp(project.id)}
                  disabled={selectedIndex === 0}
                  className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                >
                  <GripVertical className="w-3 h-3 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => moveDown(project.id)}
                  disabled={selectedIndex === orderedIds.length - 1}
                  className="p-0.5 hover:bg-muted rounded disabled:opacity-30"
                >
                  <GripVertical className="w-3 h-3" />
                </button>
              </div>
            )}
            
            <Checkbox
              id={`project-${project.id}`}
              checked={isSelected}
              onCheckedChange={() => handleToggle(project.id)}
            />
            
            <div className="flex items-center gap-2 flex-1 min-w-0">
              {project.logo_url && (
                <img
                  src={project.logo_url}
                  alt=""
                  className="w-6 h-6 rounded object-cover"
                />
              )}
              <Label
                htmlFor={`project-${project.id}`}
                className="cursor-pointer truncate"
              >
                {project.name}
              </Label>
            </div>
            
            {isSelected && (
              <span className="text-xs text-muted-foreground">#{selectedIndex + 1}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
