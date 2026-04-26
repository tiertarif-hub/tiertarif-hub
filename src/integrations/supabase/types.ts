export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      blog_posts: {
        Row: {
          author_name: string
          category: string | null
          content: string
          created_at: string | null
          excerpt: string | null
          featured_image: string | null
          id: string
          is_featured: boolean | null
          is_published: boolean | null
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          read_time: number | null
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          author_name?: string
          category?: string | null
          content: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          author_name?: string
          category?: string | null
          content?: string
          created_at?: string | null
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          is_featured?: boolean | null
          is_published?: boolean | null
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          read_time?: number | null
          slug?: string
          title?: string
          updated_at?: string | null
        }
      }
      categories: {
        Row: {
          analytics_code: string | null
          banner_override: string | null
          button_text: string | null
          color_theme: string | null
          comparison_title: string | null
          comparison_widget_code: string | null
          comparison_widget_config: Json | null
          comparison_widget_type: string | null
          created_at: string | null
          custom_css: string | null
          custom_html: string | null
          custom_html_override: string | null
          description: string | null
          features_title: string | null
          footer_copyright_text: string | null
          footer_site_name: string | null
          h1_title: string | null
          hero_badge_text: string | null
          hero_cta_text: string | null
          hero_headline: string | null
          hero_pretitle: string | null
          icon: string | null
          id: string
          intro_title: string | null
          is_active: boolean
          is_city: boolean | null
          long_content_bottom: string | null
          long_content_top: string | null
          meta_description: string | null
          meta_title: string | null
          name: string
          project_cta_text: string | null
          site_name: string | null
          slug: string
          sort_order: number
          sticky_cta_link: string | null
          sticky_cta_text: string | null
          template: string | null
          theme: Database["public"]["Enums"]["category_theme"] | null
          updated_at: string | null
        }
        Insert: {
          analytics_code?: string | null
          banner_override?: string | null
          button_text?: string | null
          color_theme?: string | null
          comparison_title?: string | null
          comparison_widget_code?: string | null
          comparison_widget_config?: Json | null
          comparison_widget_type?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_html?: string | null
          custom_html_override?: string | null
          description?: string | null
          features_title?: string | null
          footer_copyright_text?: string | null
          footer_site_name?: string | null
          h1_title?: string | null
          hero_badge_text?: string | null
          hero_cta_text?: string | null
          hero_headline?: string | null
          hero_pretitle?: string | null
          icon?: string | null
          id?: string
          intro_title?: string | null
          is_active?: boolean
          is_city?: boolean | null
          long_content_bottom?: string | null
          long_content_top?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name: string
          project_cta_text?: string | null
          site_name?: string | null
          slug: string
          sort_order?: number
          sticky_cta_link?: string | null
          sticky_cta_text?: string | null
          template?: string | null
          theme?: Database["public"]["Enums"]["category_theme"] | null
          updated_at?: string | null
        }
        Update: {
          analytics_code?: string | null
          banner_override?: string | null
          button_text?: string | null
          color_theme?: string | null
          comparison_title?: string | null
          comparison_widget_code?: string | null
          comparison_widget_config?: Json | null
          comparison_widget_type?: string | null
          created_at?: string | null
          custom_css?: string | null
          custom_html?: string | null
          custom_html_override?: string | null
          description?: string | null
          features_title?: string | null
          footer_copyright_text?: string | null
          footer_site_name?: string | null
          h1_title?: string | null
          hero_badge_text?: string | null
          hero_cta_text?: string | null
          hero_headline?: string | null
          hero_pretitle?: string | null
          icon?: string | null
          id?: string
          intro_title?: string | null
          is_active?: boolean
          is_city?: boolean | null
          long_content_bottom?: string | null
          long_content_top?: string | null
          meta_description?: string | null
          meta_title?: string | null
          name?: string
          project_cta_text?: string | null
          site_name?: string | null
          slug?: string
          sort_order?: number
          sticky_cta_link?: string | null
          sticky_cta_text?: string | null
          template?: string | null
          theme?: Database["public"]["Enums"]["category_theme"] | null
          updated_at?: string | null
        }
      }
      category_faqs: {
        Row: {
          answer: string
          category_id: string
          created_at: string | null
          id: string
          question: string
          sort_order: number
        }
        Insert: {
          answer: string
          category_id: string
          created_at?: string | null
          id?: string
          question: string
          sort_order?: number
        }
        Update: {
          answer?: string
          category_id?: string
          created_at?: string | null
          id?: string
          question?: string
          sort_order?: number
        }
      }
      category_footer_links: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          is_popular: boolean | null
          name: string
          sort_order: number
          url: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          is_popular?: boolean | null
          name: string
          sort_order?: number
          url: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          is_popular?: boolean | null
          name?: string
          sort_order?: number
          url?: string
        }
      }
      category_legal_links: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          name: string
          sort_order: number
          url: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          name: string
          sort_order?: number
          url: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          name?: string
          sort_order?: number
          url?: string
        }
      }
      category_projects: {
        Row: {
          category_id: string
          created_at: string | null
          project_id: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string | null
          project_id: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string | null
          project_id?: string
          sort_order?: number
        }
      }
      forum_posts: {
        Row: {
          author_id: string | null
          content: string
          created_at: string | null
          id: string
          thread_id: string
          updated_at: string | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string | null
          id?: string
          thread_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string | null
          id?: string
          thread_id?: string
          updated_at?: string | null
        }
      }
      forum_threads: {
        Row: {
          ad_cta_text: string | null
          ad_html_code: string | null
          ad_image_alt: string | null
          ad_image_url: string | null
          ad_link_url: string | null
          ad_type: string | null
          admin_notes: string | null
          author_id: string | null
          author_name: string | null
          category_id: string | null
          content: string
          created_at: string | null
          featured_image_alt: string | null
          featured_image_url: string | null
          id: string
          is_active: boolean | null
          is_answered: boolean | null
          is_locked: boolean | null
          is_pinned: boolean | null
          last_activity_at: string | null
          raw_html_content: string | null
          seo_description: string | null
          seo_title: string | null
          show_ad: boolean | null
          slug: string
          status: string | null
          title: string
          updated_at: string | null
          views: number | null
        }
        Insert: {
          ad_cta_text?: string | null
          ad_html_code?: string | null
          ad_image_alt?: string | null
          ad_image_url?: string | null
          ad_link_url?: string | null
          ad_type?: string | null
          admin_notes?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_answered?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          raw_html_content?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_ad?: boolean | null
          slug: string
          status?: string | null
          title: string
          updated_at?: string | null
          views?: number | null
        }
        Update: {
          ad_cta_text?: string | null
          ad_html_code?: string | null
          ad_image_alt?: string | null
          ad_image_url?: string | null
          ad_link_url?: string | null
          ad_type?: string | null
          admin_notes?: string | null
          author_id?: string | null
          author_name?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          featured_image_alt?: string | null
          featured_image_url?: string | null
          id?: string
          is_active?: boolean | null
          is_answered?: boolean | null
          is_locked?: boolean | null
          is_pinned?: boolean | null
          last_activity_at?: string | null
          raw_html_content?: string | null
          seo_description?: string | null
          seo_title?: string | null
          show_ad?: boolean | null
          slug?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          views?: number | null
        }
      }
      leads: {
        Row: {
          click_id: string | null
          country: string | null
          created_at: string | null
          id: string
          project_id: string | null
          referrer: string | null
          status: string | null
          user_agent: string | null
        }
        Insert: {
          click_id?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          referrer?: string | null
          status?: string | null
          user_agent?: string | null
        }
        Update: {
          click_id?: string | null
          country?: string | null
          created_at?: string | null
          id?: string
          project_id?: string | null
          referrer?: string | null
          status?: string | null
          user_agent?: string | null
        }
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          display_name: string | null
          id: string
          is_admin: boolean | null
          is_moderator: boolean | null
          reputation: number | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id: string
          is_admin?: boolean | null
          is_moderator?: boolean | null
          reputation?: number | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          display_name?: string | null
          id?: string
          is_admin?: boolean | null
          is_moderator?: boolean | null
          reputation?: number | null
          updated_at?: string | null
          username?: string | null
        }
      }
      projects: {
        Row: {
          affiliate_link: string
          badge_text: string | null
          category_id: string | null
          country_scope: Database["public"]["Enums"]["country_scope"]
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean
          logo_url: string | null
          name: string
          pros_list: Json | null
          cons_list: Json | null
          rating: number
          short_description: string | null
          slug: string
          tags: string[] | null
          updated_at: string | null
        }
        Insert: {
          affiliate_link: string
          badge_text?: string | null
          category_id?: string | null
          country_scope?: Database["public"]["Enums"]["country_scope"]
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name: string
          pros_list?: Json | null
          cons_list?: Json | null
          rating?: number
          short_description?: string | null
          slug: string
          tags?: string[] | null
          updated_at?: string | null
        }
        Update: {
          affiliate_link?: string
          badge_text?: string | null
          category_id?: string | null
          country_scope?: Database["public"]["Enums"]["country_scope"]
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean
          logo_url?: string | null
          name?: string
          pros_list?: Json | null
          cons_list?: Json | null
          rating?: number
          short_description?: string | null
          slug?: string
          tags?: string[] | null
          updated_at?: string | null
        }
      }
      redirects: {
        Row: {
          clicks: number | null
          created_at: string | null
          id: string
          is_active: boolean | null
          last_clicked_at: string | null
          source_path: string
          target_url: string
          updated_at: string | null
        }
        Insert: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_clicked_at?: string | null
          source_path: string
          target_url: string
          updated_at?: string | null
        }
        Update: {
          clicks?: number | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_clicked_at?: string | null
          source_path?: string
          target_url?: string
          updated_at?: string | null
        }
      }
      seo_redirects: {
        Row: {
          created_at: string
          entity_id: string
          entity_table: "categories" | "projects"
          id: string
          is_active: boolean
          is_automatic: boolean
          is_locked: boolean
          redirect_code: number
          source_path: string
          target_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_table: "categories" | "projects"
          id?: string
          is_active?: boolean
          is_automatic?: boolean
          is_locked?: boolean
          redirect_code?: number
          source_path: string
          target_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_table?: "categories" | "projects"
          id?: string
          is_active?: boolean
          is_automatic?: boolean
          is_locked?: boolean
          redirect_code?: number
          source_path?: string
          target_path?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          created_at: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      category_theme: ["DATING", "ADULT", "CASINO", "GENERIC"]
      country_scope: ["AT", "DE", "DACH", "EU"]
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}