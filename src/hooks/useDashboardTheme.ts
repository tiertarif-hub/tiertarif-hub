import { useSetting } from "@/hooks/useSettings";

export type DashboardTheme = "light" | "dark";

export function useDashboardTheme(): DashboardTheme {
  return useSetting<DashboardTheme>("dashboard_theme", "dark");
}
