import storageController from "@/controllers/storageController";
import { Stat } from "@/interfaces";
import {
    getAdStats,
    getJobStats,
    getSoldStats,
    getUserStats,
} from "@/services/restApiServices";
import { RefreshCwIcon } from "lucide-react";
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

// Color classes for different stat types
const statColors = {
  users: {
    bg: "bg-blue-100 dark:bg-blue-900/30",
    border: "border-blue-300 dark:border-blue-700",
    text: "text-blue-600 dark:text-blue-400",
  },
  ads: {
    bg: "bg-green-100 dark:bg-green-900/30",
    border: "border-green-300 dark:border-green-700",
    text: "text-green-600 dark:text-green-400",
  },
  jobs: {
    bg: "bg-purple-100 dark:bg-purple-900/30",
    border: "border-purple-300 dark:border-purple-700",
    text: "text-purple-600 dark:text-purple-400",
  },
  sold: {
    bg: "bg-amber-100 dark:bg-amber-900/30",
    border: "border-amber-300 dark:border-amber-700",
    text: "text-amber-600 dark:text-amber-400",
  },
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
    <div className={`container mx-auto px-4 py-8`}>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        لوحة إحصائيات النظام
      </h1>

      {/* Current Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        {/* Users */}
        <StatSection
          title="المستخدمين"
          stat={usersStats}
          loading={loading.users}
          onRefresh={fetchUsersStats}
          type="users"
          formatDate={formatDate}
          showBtn={false}
        >
          {usersStats && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.users.text}>
                {usersStats[currentDateKey] || usersStats[currentDayName] || 0}
              </span>
            </div>
          )}
        </StatSection>

        {/* Ads */}
        <StatSection
          title="الإعلانات"
          stat={adsStats}
          loading={loading.ads}
          onRefresh={fetchAdsStats}
          type="ads"
          formatDate={formatDate}
          showBtn={false}
        >
          {adsStats && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.ads.text}>
                {adsStats[currentDateKey] || adsStats[currentDayName] || 0}
              </span>
            </div>
          )}
        </StatSection>

        {/* Jobs */}
        <StatSection
          title="الوظائف"
          stat={jobsStats}
          loading={loading.jobs}
          onRefresh={fetchJobsStats}
          type="jobs"
          formatDate={formatDate}
          showBtn={false}
        >
          {jobsStats && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.jobs.text}>
                {jobsStats[currentDateKey] || jobsStats[currentDayName] || 0}
              </span>
            </div>
          )}
        </StatSection>

        {/* Sold Items */}
        <StatSection
          title="المبيعات"
          stat={soldStats}
          loading={loading.sold}
          onRefresh={fetchSoldStats}
          type="sold"
          formatDate={formatDate}
          showBtn={false}
        >
          {soldStats && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.sold.text}>
                {soldStats[currentDateKey] || soldStats[currentDayName] || 0}
              </span>
            </div>
          )}
        </StatSection>
      </div>

      {/* Last 9 Days Stats Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Users History */}
        <StatSection
          title="سجل المستخدمين"
          stat={usersStats}
          loading={loading.users}
          onRefresh={fetchUsersStats}
          type="users"
          formatDate={formatDate}
          showBtn
        >
          {usersStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getLastNineDaysData(usersStats).map(
                ({ date, dayName, value }) => (
                  <StatCard
                    key={date}
                    label={dayName}
                    value={value}
                    type="users"
                    highlight={dayName === currentDayName}
                  />
                )
              )}
            </div>
          )}
        </StatSection>

        {/* Ads History */}
        <StatSection
          title="سجل الإعلانات"
          stat={adsStats}
          loading={loading.ads}
          onRefresh={fetchAdsStats}
          type="ads"
          formatDate={formatDate}
          showBtn
        >
          {adsStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getLastNineDaysData(adsStats).map(({ date, dayName, value }) => (
                <StatCard
                  key={date}
                  label={dayName}
                  value={value}
                  type="ads"
                  highlight={dayName === currentDayName}
                />
              ))}
            </div>
          )}
        </StatSection>

        {/* Jobs History */}
        <StatSection
          title="سجل الوظائف"
          stat={jobsStats}
          loading={loading.jobs}
          onRefresh={fetchJobsStats}
          type="jobs"
          formatDate={formatDate}
          showBtn
        >
          {jobsStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getLastNineDaysData(jobsStats).map(
                ({ date, dayName, value }) => (
                  <StatCard
                    key={date}
                    label={dayName}
                    value={value}
                    type="jobs"
                    highlight={dayName === currentDayName}
                  />
                )
              )}
            </div>
          )}
        </StatSection>
        {/* Sold History */}
        <StatSection
          title="سجل المبيعات"
          stat={soldStats}
          loading={loading.sold}
          onRefresh={fetchSoldStats}
          type="sold"
          formatDate={formatDate}
          showBtn
        >
          {soldStats && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {getLastNineDaysData(soldStats).map(
                ({ date, dayName, value }) => (
                  <StatCard
                    key={date}
                    label={dayName}
                    value={value}
                    type="sold"
                    highlight={dayName === currentDayName}
                  />
                )
              )}
            </div>
          )}
        </StatSection>
      </div>
    </div>
  );
}

function StatSection({
  title,
  stat,
  loading,
  onRefresh,
  children,
  type,
  formatDate,
  showBtn,
}: {
  title: string;
  stat: any;
  loading: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  type: "users" | "ads" | "jobs" | "sold";
  formatDate: (date?: string) => string;
  showBtn: boolean;
}) {
  return (
    <div
      className={`rounded-lg shadow p-6 transition-colors duration-200 ${statColors[type].bg} ${statColors[type].border} border`}
    >
      <div className={`flex flex-col sm:flex-row justify-between gap-4 mb-4`}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
          {title}
        </h2>
        <div className={`flex items-center gap-2`}>
          {stat?.lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(stat.lastUpdated)}
            </span>
          )}
          {showBtn && (
            <button
              onClick={onRefresh}
              disabled={loading}
              className={`px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-900 transition-colors duration-200 flex items-center gap-1.5`}
            >
              {loading ? (
                <>
                  <RefreshCwIcon className="animate-spin h-4 w-4" />
                  جاري التحديث...
                </>
              ) : (
                <>
                  <RefreshCwIcon className="h-4 w-4" />
                  تحديث
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {stat ? (
        children
      ) : (
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            {loading
              ? "جاري التحميل..."
              : "لا توجد بيانات متاحة"}
          </p>
        </div>
      )}
    </div>
  );
}

// Reusable StatCard component (unchanged)
function StatCard({
  label,
  value,
  type,
  highlight = false,
}: {
  label: string;
  value: number;
  type: "users" | "ads" | "jobs" | "sold";
  highlight?: boolean;
}) {
  return (
    <div
      className={`border rounded-lg p-3 transition-all duration-200 ${
        highlight
          ? `border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30`
          : `${statColors[type].border} ${statColors[type].bg}`
      }`}
    >
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {label}
      </h3>
      <p className={`text-2xl font-bold ${statColors[type].text}`}>{value}</p>
    </div>
  );
}
