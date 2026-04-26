import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useCategories } from "@/hooks/useCategories";
import { useProjects } from "@/hooks/useProjects";
import { useAdminSettings, useUpdateSetting } from "@/hooks/useSettings";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  FileBox,
  Mail,
  Link2,
  MousePointer,
  Download,
  Activity,
  Globe,
  Eye,
  MessageSquare,
  Calendar as CalendarIcon,
  MonitorPlay,
  Layers,
  ExternalLink,
  TrendingUp,
  Percent,
  Zap,
  MapPin,
  GitBranch,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import type { Json } from "@/integrations/supabase/types";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
} from "recharts";
import { format } from "date-fns";
import { de } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { getCountryMeta } from "@/lib/countries";

// --- FETCH FUNCTIONS ---
async function fetchSubscribers() {
  const { data, error } = await supabase
    .from("subscribers")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

async function fetchRedirects() {
  const { data, error } = await supabase
    .from("redirects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data || [];
}

// --- COLORS ---
const COLORS = [
  "#0E1F53",
  "#FF8400",
  "#2563EB",
  "#14B8A6",
  "#8B5CF6",
  "#F59E0B",
  "#22C55E",
  "#EC4899",
];

const SYSTEM_PAGE_LABELS: Record<string, string> = {
  home: "Startseite",
  "top-apps": "Top Apps",
  "categories-overview": "Kategorien",
  "forum-index": "Forum Übersicht",
};

const TYPE_LABELS: Record<string, string> = {
  page: "System",
  category: "Kategorie",
  comparison: "Vergleich",
  forum: "Forum",
  project: "Affiliate",
};

const TRAFFIC_TABLE_PAGE_SIZE = 10;
const PROJECT_PULSE_LIMIT = 12;
const PULSE_PAGE_SIZE = 5;

type TrafficItem = {
  name: string;
  type: string;
  count: number;
  last_date: string;
  displayName: string;
  typeLabel: string;
  total_all_time: number;
};

type CountryStat = {
  code: string;
  name: string;
  flag: string;
  isUnknown: boolean;
  value: number;
  percent: number;
};

type GithubPulseCommit = {
  sha: string;
  message: string;
  authorName: string;
  authorLogin: string | null;
  committedAt: string;
  url: string;
};

// --- URL HELPER ---
const getPublicUrl = (type: string, id: string) => {
  const baseUrl = window.location.origin;

  switch (type) {
    case "page":
      if (id === "home") return `${baseUrl}/`;
      if (id === "top-apps") return `${baseUrl}/top-apps`;
      if (id === "categories-overview") return `${baseUrl}/kategorien`;
      if (id === "forum-index") return `${baseUrl}/forum`;
      return `${baseUrl}/${id}`;

    case "category":
    case "comparison":
      return `${baseUrl}/${id}`;

    case "forum":
      if (id === "forum-index") return `${baseUrl}/forum`;
      return `${baseUrl}/forum/${id}`;

    default:
      return baseUrl;
  }
};

const formatProjectPulseDate = (value: string) => {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unbekannt";
  }

  return format(date, "dd.MM.yyyy · HH:mm", { locale: de });
};

export default function AdminDashboard() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [trafficPages, setTrafficPages] = useState<Record<string, number>>({});
  const [pulsePage, setPulsePage] = useState(1);

  const { data: categories = [] } = useCategories(true);
  const { data: projects = [] } = useProjects(true);
  const { data: settings } = useAdminSettings();
  const updateSetting = useUpdateSetting();

  // 1. PERIOD STATS (Unique Views aus page_views_analytics)
  const { data: rawAnalytics = [] } = useQuery({
    queryKey: ["analytics-period", dateRange],
    queryFn: async () => {
      if (!dateRange?.from) return [];

      const fromStr = format(dateRange.from, "yyyy-MM-dd");
      const toStr = dateRange.to
        ? format(dateRange.to, "yyyy-MM-dd")
        : fromStr;

      const { data, error } = await supabase
        .from("page_views_analytics")
        .select("page_name, page_type, country, view_date")
        .gte("view_date", fromStr)
        .lte("view_date", toStr);

      if (error) throw error;
      return data || [];
    },
  });

  // 2. ALL TIME STATS
  const { data: allTimeStats = [] } = useQuery({
    queryKey: ["daily-stats-alltime"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("daily_stats")
        .select("item_id, type, count");

      if (error) throw error;
      return data || [];
    },
  });

  const { data: subscribers = [] } = useQuery({
    queryKey: ["subscribers"],
    queryFn: fetchSubscribers,
  });

  const { data: redirects = [] } = useQuery({
    queryKey: ["redirects"],
    queryFn: fetchRedirects,
  });

  const {
    data: projectPulse = [],
    isLoading: isProjectPulseLoading,
    isFetching: isProjectPulseFetching,
    isError: isProjectPulseError,
    error: projectPulseError,
    refetch: refetchProjectPulse,
  } = useQuery<GithubPulseCommit[]>({
    queryKey: ["github-pulse"],
    staleTime: 1000 * 60 * 5,
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("github-pulse", {
        body: { perPage: PROJECT_PULSE_LIMIT },
      });

      if (error) throw error;

      return Array.isArray((data as { commits?: GithubPulseCommit[] } | null)?.commits)
        ? ((data as { commits: GithubPulseCommit[] }).commits || [])
        : [];
    },
  });

  const allTimeMap = useMemo(() => {
    return allTimeStats.reduce((acc: Record<string, number>, curr: any) => {
      const key = `${curr.item_id}_${curr.type}`;
      acc[key] = (acc[key] || 0) + curr.count;
      return acc;
    }, {});
  }, [allTimeStats]);

  const trafficList = useMemo<TrafficItem[]>(() => {
    const categoryNameBySlug = new Map(
      categories.map((cat: any) => [cat.slug, cat.name])
    );
    const projectNameById = new Map(
      projects.map((project: any) => [project.id, project.name])
    );

    const map = rawAnalytics.reduce((acc: Record<string, any>, curr: any) => {
      const key = `${curr.page_name}_${curr.page_type}`;

      if (!acc[key]) {
        acc[key] = {
          name: curr.page_name,
          type: curr.page_type,
          count: 0,
          last_date: curr.view_date,
        };
      }

      acc[key].count += 1;

      if (new Date(curr.view_date) > new Date(acc[key].last_date)) {
        acc[key].last_date = curr.view_date;
      }

      return acc;
    }, {});

    return Object.values(map)
      .map((item: any) => {
        let displayName = item.name;

        if (item.type === "page") {
          displayName = SYSTEM_PAGE_LABELS[item.name] ?? item.name;
        }

        if (item.type === "category" || item.type === "comparison") {
          displayName = categoryNameBySlug.get(item.name) ?? item.name;
        }

        if (item.type === "project") {
          displayName = projectNameById.get(item.name) ?? item.name;
        }

        return {
          ...item,
          displayName,
          typeLabel: TYPE_LABELS[item.type] ?? item.type,
          total_all_time: allTimeMap[`${item.name}_${item.type}`] || item.count,
        };
      })
      .sort((a: any, b: any) => b.count - a.count);
  }, [rawAnalytics, allTimeMap, categories, projects]);

  const countryStats = useMemo<CountryStat[]>(() => {
    const total = rawAnalytics.length;

    const map = rawAnalytics.reduce((acc: Record<string, number>, curr: any) => {
      const meta = getCountryMeta(curr.country);
      acc[meta.code] = (acc[meta.code] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(map)
      .map(([code, value]) => {
        const meta = getCountryMeta(code);
        const count = Number(value);

        return {
          code: meta.code,
          name: meta.name,
          flag: meta.flag,
          isUnknown: meta.isUnknown,
          value: count,
          percent: total > 0 ? Number(((count / total) * 100).toFixed(1)) : 0,
        };
      })
      .sort((a, b) => b.value - a.value);
  }, [rawAnalytics]);

  const topCountry = countryStats[0] ?? null;
  const visibleCountryStats = countryStats.slice(0, 6);

  const periodProjectClicks = rawAnalytics.filter(
    (s: any) => s.page_type === "project"
  ).length;

  const periodPageViews = rawAnalytics.filter((s: any) =>
    ["page", "category", "comparison", "forum"].includes(s.page_type)
  ).length;

  const totalAllTimeViews = Object.values(allTimeMap).reduce(
    (sum: number, val: number) => sum + val,
    0
  );

  const conversionRate =
    periodPageViews > 0
      ? ((periodProjectClicks / periodPageViews) * 100).toFixed(1)
      : "0.0";

  const activeProjects = projects.filter((p: any) => p.is_active).length;
  const activeCategories = categories.filter((c: any) => c.is_active).length;

  const periodLeads = subscribers.filter((s: any) => {
    if (!dateRange?.from) return false;

    const subDate = new Date(s.created_at);
    const end = dateRange.to || dateRange.from;
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);

    return subDate >= dateRange.from && subDate <= endOfDay;
  }).length;

  const categoryPerformance = useMemo(() => {
    return categories
      .map((cat: any) => {
        const catProjectIds = projects
          .filter((p: any) => p.category_id === cat.id)
          .map((p: any) => p.id);

        const clicks = rawAnalytics.filter(
          (s: any) =>
            s.page_type === "project" && catProjectIds.includes(s.page_name)
        ).length;

        return { name: cat.name, value: clicks };
      })
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [categories, projects, rawAnalytics]);

  const visibleCategoryPerformance = categoryPerformance.slice(0, 6);
  const topCategory = categoryPerformance[0] ?? null;

  const topPage =
    trafficList.find((item) =>
      ["page", "category", "comparison", "forum"].includes(item.type)
    ) ?? null;

  const topContentItems = useMemo(() => {
    return trafficList
      .filter((item) => ["page", "category", "comparison"].includes(item.type))
      .slice(0, 5);
  }, [trafficList]);

  const forumSlugs = useMemo(() => {
    return [
      ...new Set(
        trafficList
          .filter((item) => item.type === "forum" && item.name !== "forum-index")
          .map((item) => item.name)
      ),
    ];
  }, [trafficList]);

  const { data: periodForumThreads = [] } = useQuery({
    queryKey: ["period-forum-threads", forumSlugs],
    enabled: forumSlugs.length > 0,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("forum_threads")
        .select("slug, title")
        .in("slug", forumSlugs);

      if (error) throw error;
      return data || [];
    },
  });

  const topForumItems = useMemo(() => {
    const threadTitleBySlug = new Map(
      periodForumThreads.map((thread: any) => [thread.slug, thread.title])
    );

    return trafficList
      .filter((item) => item.type === "forum")
      .map((item) => ({
        ...item,
        displayName:
          item.name === "forum-index"
            ? "Forum Übersicht"
            : threadTitleBySlug.get(item.name) ?? item.displayName,
      }))
      .slice(0, 5);
  }, [trafficList, periodForumThreads]);

  async function handleToggle(key: string, value: boolean) {
    try {
      await updateSetting.mutateAsync({
        key,
        value: value as unknown as Json,
      });
      toast({ title: "Einstellung gespeichert" });
    } catch (error) {
      toast({
        title: "Fehler",
        description: "Speichern fehlgeschlagen",
        variant: "destructive",
      });
    }
  }

  const toggles = [
    {
      key: "newsletter_active",
      label: "Newsletter aktiv",
      description: "Anzeige auf allen Seiten",
    },
    {
      key: "top_bar_active",
      label: "Top-Bar aktiv",
      description: "Leiste ganz oben",
    },
    {
      key: "popup_active",
      label: "Popup aktiv",
      description: "Exit-Intent Layer",
    },
  ];

  const analyticsFound =
    settings?.global_analytics_code ||
    (settings as any)?.google_analytics_id ||
    (settings as any)?.google_search_console_verification;

  const totalPulsePages = Math.max(1, Math.ceil(projectPulse.length / PULSE_PAGE_SIZE));
  const currentPulsePage = Math.min(pulsePage, totalPulsePages);
  const pulseStartIndex = (currentPulsePage - 1) * PULSE_PAGE_SIZE;
  const pulseEndIndex = pulseStartIndex + PULSE_PAGE_SIZE;
  const paginatedPulse = projectPulse.slice(pulseStartIndex, pulseEndIndex);

  const TrafficTable = ({
    data,
    totalViewsContext,
    paginationKey,
  }: {
    data: TrafficItem[];
    totalViewsContext: number;
    paginationKey: string;
  }) => {

    const sumPeriod = data.reduce((acc, item) => acc + item.count, 0);
    const sumAllTime = data.reduce(
      (acc, item) => acc + item.total_all_time,
      0
    );

    const totalPages = Math.max(1, Math.ceil(data.length / TRAFFIC_TABLE_PAGE_SIZE));
    const currentPageValue = trafficPages[paginationKey] ?? 1;
    const currentPage = Math.min(currentPageValue, totalPages);
    const pageStartIndex = (currentPage - 1) * TRAFFIC_TABLE_PAGE_SIZE;
    const pageEndIndex = pageStartIndex + TRAFFIC_TABLE_PAGE_SIZE;
    const paginatedData = data.slice(pageStartIndex, pageEndIndex);

    return (
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50/90">
              <TableRow>
                <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#0E1F53]">
                  Seite / Ziel
                </TableHead>
                <TableHead className="px-6 py-4 text-xs font-black uppercase tracking-[0.18em] text-[#0E1F53]">
                  Typ
                </TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-[#0E1F53]">
                  Anteil
                </TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-[#FF8400]">
                  Views (Zeitraum)
                </TableHead>
                <TableHead className="px-6 py-4 text-right text-xs font-black uppercase tracking-[0.18em] text-slate-500">
                  Views (Gesamt)
                </TableHead>
                <TableHead className="px-6 py-4 text-right">Live</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {data.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="h-28 text-center italic text-slate-400"
                  >
                    Keine Daten verfügbar.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((item) => {
                  const share =
                    totalViewsContext > 0
                      ? (item.count / totalViewsContext) * 100
                      : 0;

                  return (
                    <TableRow
                      key={`${item.name}-${item.type}`}
                      className="group border-t border-slate-100 transition-colors hover:bg-slate-50/60"
                    >
                      <TableCell>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">
                            {item.displayName}
                          </div>
                          <div className="mt-1 truncate text-xs font-medium text-slate-400">
                            {item.name}
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        <Badge
                          className={cn(
                            "border-none px-3 py-0.5 font-bold text-white",
                            item.type === "project"
                              ? "bg-green-600"
                              : item.type === "page"
                              ? "bg-blue-600"
                              : item.type === "category"
                              ? "bg-purple-600"
                              : item.type === "comparison"
                              ? "bg-amber-600"
                              : item.type === "forum"
                              ? "bg-indigo-600"
                              : "bg-slate-500"
                          )}
                        >
                          {item.typeLabel}
                        </Badge>
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className="w-8 text-[10px] font-mono text-slate-400">
                            {share.toFixed(0)}%
                          </span>
                          <Progress
                            value={share}
                            className="h-1.5 w-12 bg-slate-100"
                          />
                        </div>
                      </TableCell>

                      <TableCell className="text-right text-base font-black text-slate-900">
                        {item.count}
                      </TableCell>

                      <TableCell className="text-right font-mono text-xs italic text-slate-400">
                        {item.total_all_time}
                      </TableCell>

                      <TableCell className="px-6 py-4 text-right">
                        {item.type !== "project" && (
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-9 w-9 rounded-xl border border-slate-200 opacity-60 transition-all group-hover:opacity-100"
                            asChild
                          >
                            <a
                              href={getPublicUrl(item.type, item.name)}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>

            {data.length > 0 && (
              <TableFooter className="bg-slate-50/90 font-black text-slate-900">
                <TableRow>
                  <TableCell colSpan={2}>ZUSAMMENFASSUNG</TableCell>
                  <TableCell className="px-6 py-4 text-right">-</TableCell>
                  <TableCell className="text-right text-primary">
                    {sumPeriod}
                  </TableCell>
                  <TableCell className="text-right font-normal text-slate-500">
                    {sumAllTime}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </div>

        {data.length > TRAFFIC_TABLE_PAGE_SIZE && (
          <div className="flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
              Einträge {pageStartIndex + 1}-{Math.min(pageEndIndex, data.length)} von {data.length}
            </div>

            <div className="flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  setTrafficPages((prev) => ({
                    ...prev,
                    [paginationKey]: Math.max(currentPage - 1, 1),
                  }))
                }
                disabled={currentPage === 1}
              >
                Zurück
              </Button>

              <div className="min-w-[120px] text-center text-sm font-black text-[#0E1F53]">
                Seite {currentPage} von {totalPages}
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() =>
                  setTrafficPages((prev) => ({
                    ...prev,
                    [paginationKey]: Math.min(currentPage + 1, totalPages),
                  }))
                }
                disabled={currentPage === totalPages}
              >
                Weiter
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 animate-in fade-in duration-500 pb-20">
      {/* HEADER SECTION */}
      <div className="flex flex-col gap-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <h2 className="font-display text-3xl font-black tracking-tight text-[#0E1F53]">
            Kommando-Zentrale
          </h2>
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <CalendarIcon className="w-4 h-4 text-primary" />
            Zeitraum:
            <span className="font-bold text-primary bg-primary/5 px-2 py-0.5 rounded">
              {dateRange?.from
                ? dateRange.to
                  ? `${format(dateRange.from, "dd.MM.yy")} - ${format(
                      dateRange.to,
                      "dd.MM.yy"
                    )}`
                  : format(dateRange.from, "dd.MM.yy")
                : "Heute"}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className="h-12 w-[280px] justify-start rounded-xl border-slate-200 bg-white text-left font-bold text-[#0E1F53] shadow-sm"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd.MM.yyyy")} -{" "}
                      {format(dateRange.to, "dd.MM.yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd.MM.yyyy")
                  )
                ) : (
                  <span>Datum wählen</span>
                )}
              </Button>
            </PopoverTrigger>

            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                locale={de}
                disabled={(date) => date > new Date()}
              />
            </PopoverContent>
          </Popover>

          <div
            className={`px-4 py-2 rounded-full text-xs font-black uppercase border flex items-center gap-2 ${
              analyticsFound
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : "bg-orange-50 text-[#FF8400] border-orange-200"
            }`}
          >
            <div
              className={`w-2 h-2 rounded-full ${
                analyticsFound
                  ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                  : "bg-orange-500 animate-pulse"
              }`}
            ></div>
            Status: {analyticsFound ? "Live" : "Check"}
          </div>
        </div>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-6">
        <Card className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Views (Zeitraum)
            </CardTitle>
            <MonitorPlay className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">
              {periodPageViews}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Unique Views im Zeitraum
            </p>
          </CardContent>
        </Card>

        <Card className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Klicks (Zeitraum)
            </CardTitle>
            <MousePointer className="w-5 h-5 text-green-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">
              {periodProjectClicks}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Outbound Conversions
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black uppercase tracking-[0.18em] text-[#FF8400]">
              Conversion Rate
            </CardTitle>
            <Percent className="w-5 h-5 text-[#FF8400]" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-[#FF8400]">
              {conversionRate}%
            </div>
            <p className="mt-2 text-[10px] italic text-[#FF8400]/70">
              Klicks pro View
            </p>
          </CardContent>
        </Card>

        <Card className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Aktive Projekte
            </CardTitle>
            <FileBox className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-black text-slate-900">
              {activeProjects}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              Aktuell gelistet
            </p>
          </CardContent>
        </Card>

        <Card className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Top-Land
            </CardTitle>
            <MapPin className="w-5 h-5 text-cyan-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="text-3xl">{topCountry?.flag ?? "🌍"}</span>
              <div className="min-w-0">
                <div className="text-lg font-black text-slate-900 truncate">
                  {topCountry?.name ?? "Keine Daten"}
                </div>
                <p className="text-[10px] text-slate-400 mt-1 italic">
                  {topCountry
                    ? `${topCountry.value} Views`
                    : "Noch keine Herkunftsdaten"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group rounded-2xl border border-slate-200 bg-white shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-black text-slate-400 uppercase tracking-widest">
              Top-Seite
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-violet-500 group-hover:scale-110 transition-transform" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-black text-slate-900 truncate">
              {topPage?.displayName ?? "Keine Daten"}
            </div>
            <p className="text-[10px] text-slate-400 mt-2 italic">
              {topPage
                ? `${topPage.count} Views im Zeitraum`
                : "Noch keine Seitenaufrufe"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* MAIN TRAFFIC MONITOR */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="bg-slate-50/80 border-b border-slate-100 p-8">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900">
                <Layers className="w-6 h-6 text-primary" />
                Traffic & Performance Monitor
              </CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Analyse aller Besucherströme inklusive All-Time Statistiken.
              </CardDescription>
            </div>

            <div className="bg-white border border-slate-200 px-4 py-2 rounded-xl shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase block leading-none mb-1">
                Views Gesamt (Historie)
              </span>
              <span className="text-lg font-black text-slate-900">
                {totalAllTimeViews}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-6 flex h-auto w-full justify-start overflow-x-auto rounded-2xl border border-slate-200 bg-slate-100 p-1.5">
              <TabsTrigger
                value="all"
                className="rounded-xl px-6 py-2.5 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#FF8400] data-[state=active]:shadow-sm"
              >
                Alles
              </TabsTrigger>
              <TabsTrigger
                value="pages"
                className="rounded-xl px-6 py-2.5 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#FF8400] data-[state=active]:shadow-sm"
              >
                System
              </TabsTrigger>
              <TabsTrigger
                value="comparisons"
                className="rounded-xl px-6 py-2.5 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#FF8400] data-[state=active]:shadow-sm"
              >
                Vergleiche
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="rounded-xl px-6 py-2.5 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#FF8400] data-[state=active]:shadow-sm"
              >
                Kategorien
              </TabsTrigger>
              <TabsTrigger
                value="forum"
                className="rounded-xl px-6 py-2.5 font-bold text-slate-600 data-[state=active]:bg-white data-[state=active]:text-[#FF8400] data-[state=active]:shadow-sm"
              >
                Forum
              </TabsTrigger>
              <TabsTrigger
                value="outbound"
                className="rounded-xl px-6 py-2.5 font-bold text-green-700 data-[state=active]:bg-white data-[state=active]:text-[#FF8400] data-[state=active]:shadow-sm"
              >
                Affiliate Klicks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-0 focus-visible:ring-0">
              <TrafficTable
                data={trafficList}
                totalViewsContext={periodPageViews + periodProjectClicks}
                paginationKey="all"
              />
            </TabsContent>

            <TabsContent value="pages" className="mt-0 focus-visible:ring-0">
              <TrafficTable
                data={trafficList.filter((i) => i.type === "page")}
                totalViewsContext={periodPageViews}
                paginationKey="pages"
              />
            </TabsContent>

            <TabsContent
              value="comparisons"
              className="mt-0 focus-visible:ring-0"
            >
              <TrafficTable
                data={trafficList.filter((i) => i.type === "comparison")}
                totalViewsContext={periodPageViews}
                paginationKey="comparisons"
              />
            </TabsContent>

            <TabsContent value="categories" className="mt-0 focus-visible:ring-0">
              <TrafficTable
                data={trafficList.filter((i) => i.type === "category")}
                totalViewsContext={periodPageViews}
                paginationKey="categories"
              />
            </TabsContent>

            <TabsContent value="forum" className="mt-0 focus-visible:ring-0">
              <TrafficTable
                data={trafficList.filter((i) => i.type === "forum")}
                totalViewsContext={periodPageViews}
                paginationKey="forum"
              />
            </TabsContent>

            <TabsContent value="outbound" className="mt-0 focus-visible:ring-0">
              <div className="mb-6 flex items-center gap-4 rounded-2xl border border-orange-200 bg-orange-50 p-4 text-sm font-bold text-[#FF8400] shadow-sm">
                <TrendingUp className="w-5 h-5 text-[#FF8400]" />
                Welche Partner generieren aktuell den meisten Umsatz?
              </div>
              <TrafficTable
                data={trafficList.filter((i) => i.type === "project")}
                totalViewsContext={periodProjectClicks}
                paginationKey="outbound"
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT COLUMN: CHARTS */}
        <div className="lg:col-span-2 space-y-8">
          {/* PERFORMANCE CHART */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-6">
              <CardTitle className="flex items-center gap-3 text-xl font-black text-[#0E1F53]">
                <Activity className="w-5 h-5 text-[#FF8400]" />
                Performance Distribution
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Anteil der Klicks nach Kategorie
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {categoryPerformance.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-8 items-center">
                  <div className="relative h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryPerformance}
                          cx="50%"
                          cy="50%"
                          outerRadius={110}
                          innerRadius={74}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={3}
                        >
                          {categoryPerformance.map((entry, index) => (
                            <Cell
                              key={`category-cell-${entry.name}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <RechartsTooltip
                          formatter={(value: any, name: any) => [
                            `${value} Klicks`,
                            name,
                          ]}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">
                        {periodProjectClicks}
                      </span>
                      <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">
                        Klicks
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {visibleCategoryPerformance.map((item, index) => {
                      const percent =
                        periodProjectClicks > 0
                          ? Number(
                              ((item.value / periodProjectClicks) * 100).toFixed(1)
                            )
                          : 0;

                      return (
                        <div
                          key={item.name}
                          className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                        >
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className="w-3 h-3 rounded-full shrink-0"
                                style={{
                                  backgroundColor: COLORS[index % COLORS.length],
                                }}
                              />
                              <div className="min-w-0">
                                <div className="font-black text-slate-900 truncate">
                                  {item.name}
                                </div>
                                <div className="text-xs font-bold text-slate-400 uppercase">
                                  Kategorie
                                </div>
                              </div>
                            </div>

                            <div className="text-right shrink-0">
                              <div className="font-black text-slate-900">
                                {item.value}
                              </div>
                              <div className="text-xs font-bold text-slate-400">
                                {percent}%
                              </div>
                            </div>
                          </div>

                          <Progress
                            value={percent}
                            className="mt-3 h-2 bg-slate-200"
                          />
                        </div>
                      );
                    })}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Kategorien aktiv
                        </div>
                        <div className="mt-2 text-2xl font-black text-slate-900">
                          {activeCategories}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Top-Kategorie
                        </div>
                        <div className="mt-2 text-sm font-black text-slate-900 truncate">
                          {topCategory?.name ?? "Keine Daten"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[300px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-muted-foreground">
                  <Globe className="w-12 h-12 opacity-10" />
                  <p className="font-bold text-slate-300 uppercase tracking-widest">
                    Keine Daten verfügbar
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* LÄNDER VERTEILUNG CHART */}
          <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-6">
              <CardTitle className="flex items-center gap-3 text-xl font-black text-[#0E1F53]">
                <MapPin className="w-5 h-5 text-[#FF8400]" />
                Länder-Verteilung
              </CardTitle>
              <CardDescription className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                Herkunft deiner Besucher
              </CardDescription>
            </CardHeader>

            <CardContent className="p-6">
              {countryStats.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-[320px,1fr] gap-8 items-center">
                  <div className="relative h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={countryStats}
                          cx="50%"
                          cy="50%"
                          outerRadius={100}
                          innerRadius={68}
                          paddingAngle={4}
                          dataKey="value"
                          stroke="#ffffff"
                          strokeWidth={3}
                        >
                          {countryStats.map((entry, index) => (
                            <Cell
                              key={`country-cell-${entry.code}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>

                        <RechartsTooltip
                          formatter={(value: any, _name: any, entry: any) => [
                            `${value} Views`,
                            `${entry?.payload?.flag ?? ""} ${
                              entry?.payload?.name ?? ""
                            }`,
                          ]}
                          contentStyle={{
                            borderRadius: "16px",
                            border: "1px solid #e2e8f0",
                            boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.08)",
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-black text-slate-900">
                        {periodPageViews}
                      </span>
                      <span className="text-[11px] uppercase tracking-widest text-slate-400 font-black">
                        Views
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {visibleCountryStats.map((country) => (
                      <div
                        key={country.code}
                        className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="text-2xl leading-none">
                              {country.flag}
                            </div>

                            <div className="min-w-0">
                              <div className="font-black text-slate-900 truncate">
                                {country.name}
                              </div>
                              <div className="text-xs font-bold text-slate-400 uppercase">
                                {country.code === "UNKNOWN"
                                  ? "Proxy / Lokal / unbekannt"
                                  : country.code}
                              </div>
                            </div>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-black text-slate-900">
                              {country.value}
                            </div>
                            <div className="text-xs font-bold text-slate-400">
                              {country.percent}%
                            </div>
                          </div>
                        </div>

                        <Progress
                          value={country.percent}
                          className="mt-3 h-2 bg-slate-200"
                        />
                      </div>
                    ))}

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Länder erkannt
                        </div>
                        <div className="mt-2 text-2xl font-black text-slate-900">
                          {countryStats.filter((item) => !item.isUnknown).length}
                        </div>
                      </div>

                      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Top-Anteil
                        </div>
                        <div className="mt-2 text-2xl font-black text-slate-900">
                          {topCountry ? `${topCountry.percent}%` : "0%"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-[260px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-muted-foreground">
                  <Globe className="w-12 h-12 opacity-10" />
                  <p className="font-bold text-slate-300 uppercase tracking-widest">
                    Warten auf Daten...
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: QUICK ACTIONS & EXPORT */}
        <div className="space-y-8 h-full">
          <Card className="rounded-2xl border border-slate-200 bg-white shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg font-black text-[#0E1F53]">
                <Zap className="h-5 w-5 rounded-full text-[#FF8400]" />
                Schnellzugriff
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
              {toggles.map((toggle) => (
                <div
                  key={toggle.key}
                  className="flex items-center justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 transition-colors hover:bg-white"
                >
                  <div className="space-y-0.5">
                    <Label className="text-sm font-black text-slate-700">
                      {toggle.label}
                    </Label>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">
                      {toggle.description}
                    </p>
                  </div>
                  <Switch
                    checked={settings?.[toggle.key] === true}
                    onCheckedChange={(c) => handleToggle(toggle.key, c)}
                  />
                </div>
              ))}

              <div className="grid grid-cols-3 gap-3 pt-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Mail className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest">
                      Leads
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">
                    {periodLeads}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Link2 className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest">
                      Redirects
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">
                    {redirects.length}
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex items-center gap-2 text-slate-400">
                    <Activity className="w-4 h-4" />
                    <span className="text-[10px] uppercase font-black tracking-widest">
                      Länder
                    </span>
                  </div>
                  <div className="mt-3 text-2xl font-black text-slate-900">
                    {countryStats.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border border-[#0E1F53]/10 bg-[#0E1F53] text-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Download className="w-6 h-6 text-white" />
                <CardTitle className="text-lg font-black text-white">
                  Leads-Export
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Exportiere alle Newsletter-Leads inklusive Quelle und Datum als
                strukturierte CSV.
              </p>

              <Button
                variant="default"
                className="h-14 w-full rounded-2xl border-none bg-[#FF8400] font-black text-white shadow-lg shadow-[#FF8400]/20 transition-all hover:bg-[#e67800] active:scale-95"
                onClick={() => {
                  const csv =
                    "Email,Quelle,Datum\n" +
                    subscribers
                      .map(
                        (s: any) =>
                          `"${s.email}","${
                            s.source_page || "Direkt"
                          }","${new Date(s.created_at).toLocaleDateString()}"`
                      )
                      .join("\n");

                  const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `rankscout_leads_${
                    new Date().toISOString().split("T")[0]
                  }.csv`;
                  link.click();

                  toast({
                    title: "CSV Exportiert",
                    description: "Leads erfolgreich heruntergeladen.",
                  });
                }}
              >
                Leads CSV Exportieren
              </Button>
            </CardContent>
          </Card>

          <Card className="overflow-hidden rounded-2xl border border-[#0E1F53]/10 bg-[#10265f] text-white shadow-sm">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <Activity className="w-6 h-6 text-blue-400" />
                <CardTitle className="text-lg font-black text-white">
                  Analytics-Export
                </CardTitle>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Exportiere die bereinigten Unique Views inklusive Herkunftsland
                als CSV.
              </p>

              <Button
                variant="default"
                className="h-14 w-full rounded-2xl border-none bg-[#FF8400] font-black text-white shadow-lg shadow-[#FF8400]/20 transition-all hover:bg-[#e67800] active:scale-95"
                onClick={() => {
                  const csv =
                    "Seite,Typ,Landcode,Land,Datum\n" +
                    rawAnalytics
                      .map((a: any) => {
                        const country = getCountryMeta(a.country);
                        return `"${a.page_name}","${a.page_type}","${country.code}","${country.name}","${a.view_date}"`;
                      })
                      .join("\n");

                  const blob = new Blob([csv], {
                    type: "text/csv;charset=utf-8;",
                  });
                  const link = document.createElement("a");
                  link.href = URL.createObjectURL(blob);
                  link.download = `rankscout_analytics_${
                    new Date().toISOString().split("T")[0]
                  }.csv`;
                  link.click();

                  toast({
                    title: "CSV Exportiert",
                    description: "Analytics erfolgreich heruntergeladen.",
                  });
                }}
              >
                Analytics Daten (Unique)
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CONTENT INTELLIGENCE */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100 group overflow-hidden">
          <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <Globe className="w-5 h-5 text-[#0E1F53] group-hover:animate-pulse" />
              Meistgelesen (Zeitraum)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {topContentItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-10 text-center font-medium">
                  Keine Daten für diesen Zeitraum.
                </p>
              ) : (
                topContentItems.map((item) => (
                  <div
                    key={`${item.type}-${item.name}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all hover:border-orange-200 hover:bg-white"
                  >
                    <div className="flex flex-col min-w-0 max-w-[72%]">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">
                        Seite
                      </span>
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {item.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {item.typeLabel}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-[#FF8400]">
                        <Eye className="w-3 h-3" />
                        {item.count}
                      </span>

                      <Button size="icon" variant="ghost" asChild>
                        <a
                          href={getPublicUrl(item.type, item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-none bg-white rounded-3xl ring-1 ring-slate-100 group overflow-hidden">
          <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-6">
            <CardTitle className="flex items-center gap-2 text-lg font-black">
              <MessageSquare className="w-5 h-5 text-[#FF8400] group-hover:animate-bounce" />
              Heiß diskutiert (Zeitraum)
            </CardTitle>
          </CardHeader>

          <CardContent className="p-6">
            <div className="space-y-4">
              {topForumItems.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-10 text-center font-medium">
                  Keine Forum-Aktivität im Zeitraum.
                </p>
              ) : (
                topForumItems.map((item) => (
                  <div
                    key={`${item.type}-${item.name}`}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-4 transition-all hover:border-orange-200 hover:bg-white"
                  >
                    <div className="flex flex-col min-w-0 max-w-[72%]">
                      <span className="text-xs font-black text-slate-400 uppercase tracking-tighter mb-1">
                        Thread / Forum
                      </span>
                      <span className="text-sm font-bold text-slate-700 truncate">
                        {item.displayName}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase mt-1">
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-black text-[#FF8400]">
                        <Eye className="w-3 h-3" />
                        {item.count}
                      </span>

                      <Button size="icon" variant="ghost" asChild>
                        <a
                          href={getPublicUrl(item.type, item.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* PROJEKT-PULSE */}
      <Card className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <CardHeader className="border-b border-slate-200 bg-slate-50/80 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2 text-lg font-black text-[#0E1F53]">
                <GitBranch className="h-5 w-5 text-[#FF8400]" />
                Projekt-Pulse - Letzte System-Updates
              </CardTitle>
              <CardDescription className="text-sm text-slate-500">
                Die letzten {PROJECT_PULSE_LIMIT} Commits laufen sicher über eine Supabase Edge Function.
              </CardDescription>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Badge className="border-none bg-emerald-100 px-3 py-1 text-emerald-700">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" />
                Token bleibt serverseitig
              </Badge>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-xl"
                onClick={() => refetchProjectPulse()}
                disabled={isProjectPulseFetching}
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", isProjectPulseFetching && "animate-spin")} />
                Aktualisieren
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6">
          {isProjectPulseLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5"
                >
                  <div className="h-4 w-3/4 rounded bg-slate-200" />
                  <div className="mt-3 h-3 w-1/2 rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : isProjectPulseError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm font-medium text-red-700">
              Commit-Feed konnte nicht geladen werden: {projectPulseError instanceof Error ? projectPulseError.message : "Unbekannter Fehler"}
            </div>
          ) : projectPulse.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 text-sm font-medium text-slate-500">
              Noch keine Commit-Daten verfügbar. Prüfe GITHUB_ACCESS_TOKEN sowie GITHUB_REPO_OWNER und GITHUB_REPO_NAME in den Edge-Function-Secrets.
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {paginatedPulse.map((commit, index) => (
                  <div key={commit.sha} className="relative pl-8">
                    {index !== paginatedPulse.length - 1 && (
                      <span className="absolute left-[7px] top-6 h-[calc(100%+8px)] w-px bg-slate-200" />
                    )}

                    <span className="absolute left-0 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#FF8400] text-white shadow-sm">
                      <GitBranch className="h-3 w-3" />
                    </span>

                    <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-5 transition-colors hover:border-orange-200 hover:bg-white">
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="min-w-0">
                          <a
                            href={commit.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-base font-black text-[#0E1F53] transition-colors hover:text-[#FF8400]"
                          >
                            {commit.message}
                          </a>

                          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">
                            <span>{formatProjectPulseDate(commit.committedAt)}</span>
                            <span className="text-slate-300">•</span>
                            <span>{commit.authorName}</span>
                            {commit.authorLogin && (
                              <>
                                <span className="text-slate-300">•</span>
                                <span>@{commit.authorLogin}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <Badge className="w-fit border border-slate-200 bg-white px-3 py-1 font-mono text-xs text-slate-600">
                          {commit.sha.slice(0, 7)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {projectPulse.length > PULSE_PAGE_SIZE && (
                <div className="mt-4 flex flex-col gap-3 border-t border-slate-200 bg-slate-50/70 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
                    Einträge {pulseStartIndex + 1}-{Math.min(pulseEndIndex, projectPulse.length)} von {projectPulse.length}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() => setPulsePage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPulsePage === 1}
                    >
                      Zurück
                    </Button>

                    <div className="min-w-[120px] text-center text-sm font-black text-[#0E1F53]">
                      Seite {currentPulsePage} von {totalPulsePages}
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="rounded-xl"
                      onClick={() =>
                        setPulsePage((prev) => Math.min(prev + 1, totalPulsePages))
                      }
                      disabled={currentPulsePage === totalPulsePages}
                    >
                      Weiter
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}