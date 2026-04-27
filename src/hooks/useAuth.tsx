import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

/**
 * SECURITY NOTICE:
 * The `isAdmin` state in this context is for UI CONVENIENCE ONLY.
 * It is used to conditionally render admin UI elements and should NEVER
 * be trusted for actual authorization decisions.
 * 
 * ALL admin operations MUST be protected by:
 * 1. Server-side role verification and Supabase RLS policies
 * 2. Row Level Security (RLS) policies using has_role() function
 * 
 * The AdminLayout component properly validates admin access server-side
 * before rendering admin content. Any component using isAdmin must also
 * ensure that the underlying data operations are protected by RLS policies.
 * 
 * Client-side state can be manipulated via browser DevTools - never trust it
 * for security-critical decisions.
 */
interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  /** 
   * @deprecated For UI convenience only. DO NOT use for authorization.
   * All admin operations must be verified server-side via RLS policies.
   */
  isAdmin: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // NOTE: isAdmin is for UI rendering only. Server-side RLS validates all admin operations.
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Defer profile check with setTimeout
        if (session?.user) {
          setTimeout(() => {
            checkAdminStatus(session.user.id);
          }, 0);
        } else {
          setIsAdmin(false);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        checkAdminStatus(session.user.id);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Checks admin status for UI rendering purposes only.
   * SECURITY: This is NOT a security gate. All admin operations are protected by:
   * 1. AdminLayout's server-side role check
   * 2. RLS policies on all admin tables using has_role() function
   * 
   * Even if this state is manipulated client-side, server-side RLS will block
   * unauthorized data access attempts.
   */
  async function checkAdminStatus(userId: string) {
    // Check user_roles table for ADMIN role - for UI convenience only
    // Actual authorization is enforced server-side via RLS policies
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .eq("role", "ADMIN")
      .maybeSingle();
    
    setIsAdmin(!!data);
  }

  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error as Error | null };
  }

  async function signUp(email: string, password: string) {
    const redirectUrl = `${window.location.origin}/`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });
    return { error: error as Error | null };
  }

  async function signOut() {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isAdmin,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
