import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// --- TYPES ---

export interface ForumThread {
  id: string;
  title: string;
  slug: string;
  content: string;
  author_name: string;
  category_id: string | null;
  views: number; 
  view_count?: number; 
  is_pinned: boolean;
  is_locked: boolean;
  is_answered: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  seo_title?: string;
  seo_description?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  last_activity_at?: string;
  admin_notes?: string;
  status?: string;
  raw_html_content?: string;
  reply_count?: number; 
  is_liked_by_user?: boolean;
  likes_count?: number;
  show_ad?: boolean;
  ad_type?: string;
  ad_image_url?: string;
  ad_image_alt?: string;
  ad_link_url?: string;
  ad_html_code?: string;
  ad_cta_text?: string;
}

export interface ForumThreadWritePayload {
  title: string;
  slug: string;
  content: string;
  author_name: string;
  category_id: string | null;
  seo_title?: string;
  seo_description?: string;
  featured_image_url?: string;
  featured_image_alt?: string;
  last_activity_at?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_answered?: boolean;
  is_active?: boolean;
  admin_notes?: string;
  status?: string;
  raw_html_content?: string;
  show_ad?: boolean;
  ad_type?: string;
  ad_image_url?: string;
  ad_image_alt?: string;
  ad_link_url?: string;
  ad_html_code?: string;
  ad_cta_text?: string;
}

export interface ForumThreadUpdatePayload extends Partial<ForumThreadWritePayload> {
  id: string;
}

export interface ForumCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  thread_count?: number;
  // SEO & Ads
  seo_title?: string;
  seo_description?: string;
  ad_enabled?: boolean;
  assigned_ad_id?: string;
  ad_image_url?: string;
  ad_link_url?: string;
  ad_html_code?: string;
  ad_headline?: string;
  ad_subheadline?: string;
  ad_cta_text?: string;
}

export interface ForumReply {
  id: string;
  thread_id: string;
  content: string;
  author_name: string;
  author_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  is_spam: boolean;
}

export interface ForumReplyWithLikes extends ForumReply {
  like_count: number;
  user_has_liked: boolean;
}

// --- HOOKS ---

export const useForumCategories = (includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ["forum-categories", includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("forum_categories")
        .select("*, forum_threads(count)")
        .order("sort_order");
        
      if (!includeInactive) {
          query = query.eq("is_active", true);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      
      return data.map(cat => ({
        ...cat,
        thread_count: cat.forum_threads?.[0]?.count || 0
      })) as ForumCategory[];
    },
  });
};

export const useForumThreads = (categorySlug?: string, includeInactive: boolean = false) => {
  return useQuery({
    queryKey: ["forum-threads", categorySlug, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from("forum_threads")
        .select("*, forum_replies(count)")
        .order("is_pinned", { ascending: false })
        .order("created_at", { ascending: false });

      if (!includeInactive) {
          query = query.eq("is_active", true);
      }

      if (categorySlug) {
        const { data: cat } = await supabase.from("forum_categories").select("id").eq("slug", categorySlug).single();
        if (cat) {
          query = query.eq("category_id", cat.id);
        } else {
          return [];
        }
      }

      const { data, error } = await query;
      if (error) throw error;

      return data.map(thread => ({
        ...thread,
        views: thread.views || 0,
        reply_count: thread.forum_replies?.[0]?.count || 0
      })) as ForumThread[];
    },
  });
};

export const useForumThread = (slug: string) => {
  return useQuery({
    queryKey: ["forum-thread", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("*")
        .eq("slug", slug)
        .eq("is_active", true)
        .single();

      if (error) throw error;
      return data as ForumThread;
    },
    enabled: !!slug,
  });
};

export const useRelatedThreads = ({
  categoryId,
  currentThreadId,
  limit = 3,
}: {
  categoryId?: string | null;
  currentThreadId?: string | null;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["forum-related-threads", categoryId, currentThreadId, limit],
    queryFn: async () => {
      if (!categoryId) return [] as ForumThread[];

      let query = supabase
        .from("forum_threads")
        .select("*, forum_replies(count)")
        .eq("category_id", categoryId)
        .eq("is_active", true)
        .order("updated_at", { ascending: false })
        .limit(limit + (currentThreadId ? 1 : 0));

      if (currentThreadId) {
        query = query.neq("id", currentThreadId);
      }

      const { data, error } = await query;
      if (error) throw error;

      return (data || []).slice(0, limit).map(thread => ({
        ...thread,
        views: thread.views || 0,
        reply_count: thread.forum_replies?.[0]?.count || 0,
        last_activity_at: thread.updated_at || thread.created_at,
      })) as ForumThread[];
    },
    enabled: !!categoryId,
  });
};

export const useIncrementThreadView = () => {
  return useMutation({
    mutationFn: async (threadId: string) => {
      const { error } = await supabase.rpc('increment_thread_view', { t_id: threadId });
      if (error) throw error;
    }
  });
};

export const useThreadReplies = (threadId: string, userId?: string) => {
  return useQuery({
    queryKey: ["thread-replies", threadId, userId],
    queryFn: async () => {
      if (!threadId) return [];
      
      const { data: replies, error } = await supabase
        .from("forum_replies")
        .select("*")
        .eq("thread_id", threadId)
        .eq("is_active", true)
        .order("created_at", { ascending: true });

      if (error) throw error;

      const replyIds = replies.map(r => r.id);
      
      const { data: counts } = await supabase
        .from("forum_reply_likes")
        .select("reply_id");
        
      let userLikes: string[] = [];
      if (userId) {
        const { data: ul } = await supabase
          .from("forum_reply_likes")
          .select("reply_id")
          .eq("user_id", userId);
        if (ul) userLikes = ul.map(u => u.reply_id);
      }

      return replies.map(reply => {
        const likeCount = counts?.filter(c => c.reply_id === reply.id).length || 0;
        const hasLiked = userLikes.includes(reply.id);
        return {
          ...reply,
          like_count: likeCount,
          user_has_liked: hasLiked
        } as ForumReplyWithLikes;
      });
    },
    enabled: !!threadId,
  });
};

export const useCreateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (thread: ForumThreadWritePayload) => {
      const { data, error } = await supabase.from("forum_threads").insert([thread]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
};

export const useUpdateThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: ForumThreadUpdatePayload) => {
      const { error } = await supabase.from("forum_threads").update(updates).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
      queryClient.invalidateQueries({ queryKey: ["forum-thread"] });
    },
  });
};

export const useDeleteThread = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("forum_threads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["forum-threads"] });
    },
  });
};

export const useCreateReply = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reply: { thread_id: string; content: string; author_name: string }) => {
      const { data, error } = await supabase.from("forum_replies").insert([{ ...reply, is_active: false, is_spam: false }]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread-replies"] });
    },
  });
};

export const useToggleLike = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ replyId, userId, isLiked }: { replyId: string; userId: string; isLiked: boolean }) => {
      if (isLiked) {
        await supabase.from("forum_reply_likes").delete().eq("reply_id", replyId).eq("user_id", userId);
      } else {
        await supabase.from("forum_reply_likes").insert([{ reply_id: replyId, user_id: userId }]);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["thread-replies"] });
    },
  });
};

export const generateSlug = (text: string) => {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
};

export const useCreateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (c:any) => supabase.from("forum_categories").insert([c]), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-categories"] }) }) };
export const useUpdateCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async ({id, ...u}:any) => supabase.from("forum_categories").update(u).eq("id", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-categories"] }) }) };
export const useDeleteCategory = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async (id:string) => supabase.from("forum_categories").delete().eq("id", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-categories"] }) }) };
export const useAllReplies = () => useQuery({ queryKey: ["forum-all-replies"], queryFn: async () => (await supabase.from("forum_replies").select("*")).data || [] });
export const useUpdateReply = () => { const qc = useQueryClient(); return useMutation({ mutationFn: async ({id, ...u}:any) => supabase.from("forum_replies").update(u).eq("id", id), onSuccess: () => qc.invalidateQueries({ queryKey: ["forum-all-replies"] }) }) };