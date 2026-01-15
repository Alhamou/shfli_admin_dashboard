import { Card, CardContent, CardHeader } from "@/components/ui/card";
import storageController from "@/controllers/storageController";
import { Stat } from "@/interfaces";
import {
    getAdStats,
    getJobStats,
    getSoldStats,
    getUserStats,
} from "@/services/restApiServices";
import { BarChart3, Briefcase, Package, RefreshCw, ShoppingCart, Users } from "lucide-react";
import { useEffect, useState } from "react";

type DaysOfTheWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

type StatData = {
  [date: string]: number;
} & {
  lastUpdated?: string;
};

const STATS_KEYS = {
  USERS: "stats_users",
  ADS: "stats_ads",
  JOBS: "stats_jobs",
  SOLD: "stats_sold",
};

// Color classes for different stat types - Premium styling
const statColors = {
  users: {
    bg: "bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-950/50 dark:to-blue-900/30",
    border: "border-blue-200/50 dark:border-blue-800/50",
    text: "text-blue-600 dark:text-blue-400",
    icon: "bg-blue-500 dark:bg-blue-600",
  },
  ads: {
    bg: "bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/50 dark:to-emerald-900/30",
    border: "border-emerald-200/50 dark:border-emerald-800/50",
    text: "text-emerald-600 dark:text-emerald-400",
    icon: "bg-emerald-500 dark:bg-emerald-600",
  },
  jobs: {
    bg: "bg-gradient-to-br from-purple-50 to-purple-100/50 dark:from-purple-950/50 dark:to-purple-900/30",
    border: "border-purple-200/50 dark:border-purple-800/50",
    text: "text-purple-600 dark:text-purple-400",
    icon: "bg-purple-500 dark:bg-purple-600",
  },
  sold: {
    bg: "bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-950/50 dark:to-amber-900/30",
    border: "border-amber-200/50 dark:border-amber-800/50",
    text: "text-amber-600 dark:text-amber-400",
    icon: "bg-amber-500 dark:bg-amber-600",
  },
};

const statIcons = {
  users: Users,
  ads: Package,
  jobs: Briefcase,
  sold: ShoppingCart,
};

export function StatisticsPage() {
  // Stats data
  const [usersStats, setUsersStats] = useState<StatData | null>(null);
  const [adsStats, setAdsStats] = useState<StatData | null>(null);
  const [jobsStats, setJobsStats] = useState<StatData | null>(null);
  const [soldStats, setSoldStats] = useState<StatData | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    users: false,
    ads: false,
    jobs: false,
    sold: false,
  });

  // Load initial data from localStorage or fetch if empty
  useEffect(() => {
    const loadInitialData = async () => {
      const savedUsers = storageController.get<StatData>(STATS_KEYS.USERS);
      const savedAds = storageController.get<StatData>(STATS_KEYS.ADS);
      const savedJobs = storageController.get<StatData>(STATS_KEYS.JOBS);
      const savedSold = storageController.get<StatData>(STATS_KEYS.SOLD);

      if (!savedUsers) await fetchUsersStats();
      else setUsersStats(savedUsers);

      if (!savedAds) await fetchAdsStats();
      else setAdsStats(savedAds);

      if (!savedJobs) await fetchJobsStats();
      else setJobsStats(savedJobs);

      if (!savedSold) await fetchSoldStats();
      else setSoldStats(savedSold);
    };

    loadInitialData();
  }, []);

  const fetchStats = async (
    apiCall: () => Promise<Stat[]>,
    key: string,
    setter: (data: StatData) => void
  ) => {
    try {
      setLoading((prev) => ({ ...prev, [key]: true }));
      const response = await apiCall();

      // Convert the array response to an object with dates as keys
      const statsData: StatData = {};
      response.forEach((item) => {
        const date = new Date(item.label);
        const dayName = date.toLocaleDateString("ar", {
          weekday: "short",
        }) as DaysOfTheWeek;
        statsData[item.label] = item.count;
        statsData[dayName] = item.count; // Also store by day name for easy access
      });

      statsData.lastUpdated = new Date().toISOString();
      storageController.set(
        STATS_KEYS[key.toUpperCase() as keyof typeof STATS_KEYS],
        statsData
      );
      setter(statsData);
    } finally {
      setLoading((prev) => ({ ...prev, [key]: false }));
    }
  };

  const fetchUsersStats = () =>
    fetchStats(getUserStats, "users", setUsersStats);
  const fetchAdsStats = () => fetchStats(getAdStats, "ads", setAdsStats);
  const fetchJobsStats = () => fetchStats(getJobStats, "jobs", setJobsStats);
  const fetchSoldStats = () => fetchStats(getSoldStats, "sold", setSoldStats);

  const formatDate = (dateString?: string) => {
    if (!dateString) return "أبداً";
    return new Date(dateString).toLocaleString("ar");
  };

  const getCurrentDateKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
  };

  const getCurrentDayName = () => {
    return new Date().toLocaleDateString("ar", {
      weekday: "short",
    }) as DaysOfTheWeek;
  };

  // Get the last 9 days data in reverse chronological order
  const getLastNineDaysData = (stats: StatData | null) => {
    if (!stats) return [];

    // Filter out the day names and lastUpdated from the stats
    const dateKeys = Object.keys(stats).filter(
      (key) => key.match(/^\d{4}-\d{2}-\d{2}$/) && key !== "lastUpdated"
    );

    // Sort dates in descending order and take the first 9
    const sortedDates = dateKeys
      .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
      .slice(0, 9);

    return sortedDates.map((date) => ({
      date,
      dayName: new Date(date).toLocaleDateString("ar", {
        weekday: "short",
      }),
      value: stats[date],
    }));
  };

  const currentDateKey = getCurrentDateKey();
  const currentDayName = getCurrentDayName();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-lg shadow-primary/25">
          <BarChart3 className="h-5 w-5 text-primary-foreground" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">لوحة الإحصائيات</h1>
          <p className="text-sm text-muted-foreground">
            إحصائيات النظام والتقارير اليومية
          </p>
        </div>
      </div>

      {/* Current Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="المستخدمين"
          value={usersStats?.[currentDateKey] || usersStats?.[currentDayName] || 0}
          stat={usersStats}
          loading={loading.users}
          onRefresh={fetchUsersStats}
          type="users"
          formatDate={formatDate}
        />
        <StatCard
          title="الإعلانات"
          value={adsStats?.[currentDateKey] || adsStats?.[currentDayName] || 0}
          stat={adsStats}
          loading={loading.ads}
          onRefresh={fetchAdsStats}
          type="ads"
          formatDate={formatDate}
        />
        <StatCard
          title="الوظائف"
          value={jobsStats?.[currentDateKey] || jobsStats?.[currentDayName] || 0}
          stat={jobsStats}
          loading={loading.jobs}
          onRefresh={fetchJobsStats}
          type="jobs"
          formatDate={formatDate}
        />
        <StatCard
          title="المبيعات"
          value={soldStats?.[currentDateKey] || soldStats?.[currentDayName] || 0}
          stat={soldStats}
          loading={loading.sold}
          onRefresh={fetchSoldStats}
          type="sold"
          formatDate={formatDate}
        />
      </div>

      {/* History Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users History */}
        <StatHistoryCard
          title="سجل المستخدمين"
          stat={usersStats}
          loading={loading.users}
          onRefresh={fetchUsersStats}
          type="users"
          formatDate={formatDate}
          currentDayName={currentDayName}
          getLastNineDaysData={getLastNineDaysData}
        />

        {/* Ads History */}
        <StatHistoryCard
          title="سجل الإعلانات"
          stat={adsStats}
          loading={loading.ads}
          onRefresh={fetchAdsStats}
          type="ads"
          formatDate={formatDate}
          currentDayName={currentDayName}
          getLastNineDaysData={getLastNineDaysData}
        />

        {/* Jobs History */}
        <StatHistoryCard
          title="سجل الوظائف"
          stat={jobsStats}
          loading={loading.jobs}
          onRefresh={fetchJobsStats}
          type="jobs"
          formatDate={formatDate}
          currentDayName={currentDayName}
          getLastNineDaysData={getLastNineDaysData}
        />

        {/* Sold History */}
        <StatHistoryCard
          title="سجل المبيعات"
          stat={soldStats}
          loading={loading.sold}
          onRefresh={fetchSoldStats}
          type="sold"
          formatDate={formatDate}
          currentDayName={currentDayName}
          getLastNineDaysData={getLastNineDaysData}
        />
      </div>
    </div>
  );
}

// Main stat card component
function StatCard({
  title,
  value,
  stat,
  loading,
  onRefresh,
  type,
  formatDate,
}: {
  title: string;
  value: number;
  stat: StatData | null;
  loading: boolean;
  onRefresh: () => void;
  type: "users" | "ads" | "jobs" | "sold";
  formatDate: (date?: string) => string;
}) {
  const Icon = statIcons[type];

  return (
    <Card className={`shadow-sm border ${statColors[type].border} ${statColors[type].bg} overflow-hidden`}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className={`text-4xl font-bold ${statColors[type].text}`}>
              {stat ? value : "—"}
            </p>
            {stat?.lastUpdated && (
              <p className="text-xs text-muted-foreground">
                آخر تحديث: {formatDate(stat.lastUpdated)}
              </p>
            )}
          </div>
          <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${statColors[type].icon} shadow-lg`}>
            <Icon className="h-6 w-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// History card component
function StatHistoryCard({
  title,
  stat,
  loading,
  onRefresh,
  type,
  formatDate,
  currentDayName,
  getLastNineDaysData,
}: {
  title: string;
  stat: StatData | null;
  loading: boolean;
  onRefresh: () => void;
  type: "users" | "ads" | "jobs" | "sold";
  formatDate: (date?: string) => string;
  currentDayName: string;
  getLastNineDaysData: (stats: StatData | null) => { date: string; dayName: string; value: number }[];
}) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <h3 className="font-semibold">{title}</h3>
        <div className="flex items-center gap-2">
          {stat?.lastUpdated && (
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {formatDate(stat.lastUpdated)}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`
              p-2 rounded-lg transition-all duration-200
              ${loading
                ? "bg-muted text-muted-foreground"
                : "bg-primary/10 text-primary hover:bg-primary/20"
              }
            `}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent>
        {stat ? (
          <div className="grid grid-cols-3 gap-3">
            {getLastNineDaysData(stat).map(({ date, dayName, value }) => (
              <div
                key={date}
                className={`
                  p-3 rounded-xl border transition-all duration-200
                  ${dayName === currentDayName
                    ? `${statColors[type].bg} ${statColors[type].border} shadow-sm`
                    : "bg-muted/30 border-border/50"
                  }
                `}
              >
                <p className="text-xs font-medium text-muted-foreground mb-1">{dayName}</p>
                <p className={`text-xl font-bold ${statColors[type].text}`}>{value}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-32 flex items-center justify-center">
            <p className="text-muted-foreground">
              {loading ? "جاري التحميل..." : "لا توجد بيانات متاحة"}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
