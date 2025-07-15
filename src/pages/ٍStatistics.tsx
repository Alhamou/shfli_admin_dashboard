import storageController from "@/controllers/storageController";
import { RefreshCwIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
  getUserStats,
  getJobStats,
  getAdStats,
} from "@/services/restApiServices";
import { Stat } from "@/interfaces";

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
};

export function StatisticsPage() {
  const { t, i18n } = useTranslation();

  // Stats data
  const [usersStats, setUsersStats] = useState<StatData | null>(null);
  const [adsStats, setAdsStats] = useState<StatData | null>(null);
  const [jobsStats, setJobsStats] = useState<StatData | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    users: false,
    ads: false,
    jobs: false,
  });

  // Load initial data from localStorage or fetch if empty
  useEffect(() => {
    const loadInitialData = async () => {
      const savedUsers = storageController.get<StatData>(STATS_KEYS.USERS);
      const savedAds = storageController.get<StatData>(STATS_KEYS.ADS);
      const savedJobs = storageController.get<StatData>(STATS_KEYS.JOBS);

      if (!savedUsers) await fetchUsersStats();
      else setUsersStats(savedUsers);

      if (!savedAds) await fetchAdsStats();
      else setAdsStats(savedAds);

      if (!savedJobs) await fetchJobsStats();
      else setJobsStats(savedJobs);
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
        const dayName = date.toLocaleDateString(i18n.language, {
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return t("statistics.never");
    return new Date(dateString).toLocaleString(i18n.language);
  };

  const getCurrentDateKey = () => {
    const today = new Date();
    return today.toISOString().split("T")[0]; // Returns YYYY-MM-DD format
  };

  const getCurrentDayName = () => {
    return new Date().toLocaleDateString(i18n.language, {
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
      dayName: new Date(date).toLocaleDateString(i18n.language, {
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
        {t("statistics.statisticsDashboard")}
      </h1>

      {/* Current Stats Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Users */}
        <StatSection
          title={t("statistics.users")}
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
          title={t("statistics.ads")}
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
          title={t("statistics.jobs")}
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
      </div>

      {/* Last 9 Days Stats Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Users History */}
        <StatSection
          title={t("statistics.usersHistory")}
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
          title={t("statistics.adsHistory")}
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
          title={t("statistics.jobsHistory")}
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
  type: "users" | "ads" | "jobs";
  formatDate: (date?: string) => string;
  showBtn: boolean;
}) {
  const { t } = useTranslation();
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
                  {t("statistics.refreshing")}
                </>
              ) : (
                <>
                  <RefreshCwIcon className="h-4 w-4" />
                  {t("statistics.refresh")}
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
              ? t("statistics.loading")
              : t("statistics.noDataAvailable")}
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
  type: "users" | "ads" | "jobs";
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
