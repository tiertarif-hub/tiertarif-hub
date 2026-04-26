import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CategoryProject {
  id: string;
  category_id: string;
  project_id: string;
  sort_order: number;
  created_at: string;
}

export function useCategoryProjects(categoryId: string | undefined) {
  return useQuery({
    queryKey: ["category-projects", categoryId],
    queryFn: async () => {
      if (!categoryId) return [];
      const { data, error } = await supabase
        .from("category_projects")
        .select("*")
        .eq("category_id", categoryId)
        .order("sort_order");
      if (error) throw error;
      return data as CategoryProject[];
    },
    enabled: !!categoryId,
  });
}

export function useUpdateCategoryProjects() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      categoryId,
      projectIds,
    }: {
      categoryId: string;
      projectIds: string[];
    }) => {
      // Delete existing assignments
      const { error: deleteError } = await supabase
        .from("category_projects")
        .delete()
        .eq("category_id", categoryId);
      if (deleteError) throw deleteError;

      // Insert new assignments
      if (projectIds.length > 0) {
        const inserts = projectIds.map((project_id, index) => ({
          category_id: categoryId,
          project_id,
          sort_order: index,
        }));
        const { error: insertError } = await supabase
          .from("category_projects")
          .insert(inserts);
        if (insertError) throw insertError;
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["category-projects", variables.categoryId] });
      queryClient.invalidateQueries({ queryKey: ["category-projects"] });
    },
  });
}
