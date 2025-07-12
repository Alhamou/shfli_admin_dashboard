import storageController from '@/controllers/storageController';
import { RefreshCwIcon } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

type DaysOfTheWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

// Types for our data
type DailyStats = {
  count: number;
  lastUpdated?: string;
};

type WeeklyStats = {
  [day in DaysOfTheWeek]: number;
} & {
  lastUpdated?: string;
};

const STATS_KEYS = {
  DAILY_USERS: 'stats_daily_users',
  DAILY_ADS: 'stats_daily_ads',
  DAILY_JOBS: 'stats_daily_jobs',
  WEEKLY_USERS: 'stats_weekly_users',
  WEEKLY_ADS: 'stats_weekly_ads',
  WEEKLY_JOBS: 'stats_weekly_jobs'
};

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"] as const;

// Color classes for different stat types
const statColors = {
  users: {
    bg: 'bg-blue-100 dark:bg-blue-900/30',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-600 dark:text-blue-400'
  },
  ads: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-600 dark:text-green-400'
  },
  jobs: {
    bg: 'bg-purple-100 dark:bg-purple-900/30',
    border: 'border-purple-300 dark:border-purple-700',
    text: 'text-purple-600 dark:text-purple-400'
  }
};

export function StatisticsPage() {
  const { t, i18n } = useTranslation();

  // Daily stats
  const [dailyUsers, setDailyUsers] = useState<DailyStats | null>(null);
  const [dailyAds, setDailyAds] = useState<DailyStats | null>(null);
  const [dailyJobs, setDailyJobs] = useState<DailyStats | null>(null);

  // Weekly stats
  const [weeklyUsers, setWeeklyUsers] = useState<WeeklyStats | null>(null);
  const [weeklyAds, setWeeklyAds] = useState<WeeklyStats | null>(null);
  const [weeklyJobs, setWeeklyJobs] = useState<WeeklyStats | null>(null);

  // Loading states
  const [loading, setLoading] = useState({
    dailyUsers: false,
    dailyAds: false,
    dailyJobs: false,
    weeklyUsers: false,
    weeklyAds: false,
    weeklyJobs: false
  });

  // Load initial data from localStorage or fetch if empty
  useEffect(() => {
    const loadInitialData = async () => {
      // Daily stats
      const savedDailyUsers = storageController.get<DailyStats>(STATS_KEYS.DAILY_USERS);
      const savedDailyAds = storageController.get<DailyStats>(STATS_KEYS.DAILY_ADS);
      const savedDailyJobs = storageController.get<DailyStats>(STATS_KEYS.DAILY_JOBS);

      // Weekly stats
      const savedWeeklyUsers = storageController.get<WeeklyStats>(STATS_KEYS.WEEKLY_USERS);
      const savedWeeklyAds = storageController.get<WeeklyStats>(STATS_KEYS.WEEKLY_ADS);
      const savedWeeklyJobs = storageController.get<WeeklyStats>(STATS_KEYS.WEEKLY_JOBS);

      // Set or fetch data
      if (!savedDailyUsers) await fetchDailyUsers();
      else setDailyUsers(savedDailyUsers);

      if (!savedDailyAds) await fetchDailyAds();
      else setDailyAds(savedDailyAds);

      if (!savedDailyJobs) await fetchDailyJobs();
      else setDailyJobs(savedDailyJobs);

      if (!savedWeeklyUsers) await fetchWeeklyUsers();
      else setWeeklyUsers(savedWeeklyUsers);

      if (!savedWeeklyAds) await fetchWeeklyAds();
      else setWeeklyAds(savedWeeklyAds);

      if (!savedWeeklyJobs) await fetchWeeklyJobs();
      else setWeeklyJobs(savedWeeklyJobs);
    };

    loadInitialData();
  }, []);

  // Mock API fetch functions
  const fetchDailyUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, dailyUsers: true }));
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: DailyStats = {
        count: Math.floor(Math.random() * 1000),
        lastUpdated: new Date().toISOString()
      };
      storageController.set(STATS_KEYS.DAILY_USERS, mockData);
      setDailyUsers(mockData);
    } finally {
      setLoading(prev => ({ ...prev, dailyUsers: false }));
    }
  };

  const fetchDailyAds = async () => {
    try {
      setLoading(prev => ({ ...prev, dailyAds: true }));
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: DailyStats = {
        count: Math.floor(Math.random() * 500),
        lastUpdated: new Date().toISOString()
      };
      storageController.set(STATS_KEYS.DAILY_ADS, mockData);
      setDailyAds(mockData);
    } finally {
      setLoading(prev => ({ ...prev, dailyAds: false }));
    }
  };

  const fetchDailyJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, dailyJobs: true }));
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: DailyStats = {
        count: Math.floor(Math.random() * 300),
        lastUpdated: new Date().toISOString()
      };
      storageController.set(STATS_KEYS.DAILY_JOBS, mockData);
      setDailyJobs(mockData);
    } finally {
      setLoading(prev => ({ ...prev, dailyJobs: false }));
    }
  };

  const fetchWeeklyUsers = async () => {
    try {
      setLoading(prev => ({ ...prev, weeklyUsers: true }));
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: WeeklyStats = daysOfWeek.reduce((acc, day) => {
        acc[day] = Math.floor(Math.random() * 500);
        return acc;
      }, {} as WeeklyStats);
      mockData.lastUpdated = new Date().toISOString();
      storageController.set(STATS_KEYS.WEEKLY_USERS, mockData);
      setWeeklyUsers(mockData);
    } finally {
      setLoading(prev => ({ ...prev, weeklyUsers: false }));
    }
  };

  const fetchWeeklyAds = async () => {
    try {
      setLoading(prev => ({ ...prev, weeklyAds: true }));
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: WeeklyStats = daysOfWeek.reduce((acc, day) => {
        acc[day] = Math.floor(Math.random() * 250);
        return acc;
      }, {} as WeeklyStats);
      mockData.lastUpdated = new Date().toISOString();
      storageController.set(STATS_KEYS.WEEKLY_ADS, mockData);
      setWeeklyAds(mockData);
    } finally {
      setLoading(prev => ({ ...prev, weeklyAds: false }));
    }
  };

  const fetchWeeklyJobs = async () => {
    try {
      setLoading(prev => ({ ...prev, weeklyJobs: true }));
      await new Promise(resolve => setTimeout(resolve, 800));
      const mockData: WeeklyStats = daysOfWeek.reduce((acc, day) => {
        acc[day] = Math.floor(Math.random() * 150);
        return acc;
      }, {} as WeeklyStats);
      mockData.lastUpdated = new Date().toISOString();
      storageController.set(STATS_KEYS.WEEKLY_JOBS, mockData);
      setWeeklyJobs(mockData);
    } finally {
      setLoading(prev => ({ ...prev, weeklyJobs: false }));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return t('statistics.never');
    return new Date(dateString).toLocaleString(i18n.language);
  };

  const currentDay = new Date().toLocaleDateString(i18n.language, { weekday: 'short' }) as DaysOfTheWeek;

  return (
    <div className={`container mx-auto px-4 py-8`}>
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
        {t('statistics.statisticsDashboard')}
      </h1>

      {/* Daily Stats Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        {/* Daily Users */}
        <StatSection
          title={t('statistics.dailyUsers')}
          stat={dailyUsers}
          loading={loading.dailyUsers}
          onRefresh={fetchDailyUsers}
          type="users"
          formatDate={formatDate}
        >
          {dailyUsers && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.users.text}>{dailyUsers.count}</span>
            </div>
          )}
        </StatSection>

        {/* Daily Ads */}
        <StatSection
          title={t('statistics.dailyAds')}
          stat={dailyAds}
          loading={loading.dailyAds}
          onRefresh={fetchDailyAds}
          type="ads"
          formatDate={formatDate}
        >
          {dailyAds && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.ads.text}>{dailyAds.count}</span>
            </div>
          )}
        </StatSection>

        {/* Daily Jobs */}
        <StatSection
          title={t('statistics.dailyJobs')}
          stat={dailyJobs}
          loading={loading.dailyJobs}
          onRefresh={fetchDailyJobs}
          type="jobs"
          formatDate={formatDate}
        >
          {dailyJobs && (
            <div className="text-5xl font-bold py-4 text-center">
              <span className={statColors.jobs.text}>{dailyJobs.count}</span>
            </div>
          )}
        </StatSection>
      </div>

      {/* Weekly Stats Sections */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Weekly Users */}
        <StatSection
          title={t('statistics.weeklyUsers')}
          stat={weeklyUsers}
          loading={loading.weeklyUsers}
          onRefresh={fetchWeeklyUsers}
          type="users"
          formatDate={formatDate}
        >
          {weeklyUsers && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {daysOfWeek.map((day) => (
                <StatCard
                  key={day}
                  label={t(day.toLowerCase())}
                  value={weeklyUsers[day] ?? 0}
                  type="users"
                  highlight={day === currentDay}
                />
              ))}
            </div>
          )}
        </StatSection>

        {/* Weekly Ads */}
        <StatSection
          title={t('statistics.weeklyAds')}
          stat={weeklyAds}
          loading={loading.weeklyAds}
          onRefresh={fetchWeeklyAds}
          type="ads"
          formatDate={formatDate}
        >
          {weeklyAds && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {daysOfWeek.map((day) => (
                <StatCard
                  key={day}
                  label={t(day.toLowerCase())}
                  value={weeklyAds[day] ?? 0}
                  type="ads"
                  highlight={day === currentDay}
                />
              ))}
            </div>
          )}
        </StatSection>

        {/* Weekly Jobs */}
        <StatSection
          title={t('statistics.weeklyJobs')}
          stat={weeklyJobs}
          loading={loading.weeklyJobs}
          onRefresh={fetchWeeklyJobs}
          type="jobs"
          formatDate={formatDate}
        >
          {weeklyJobs && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-3">
              {daysOfWeek.map((day) => (
                <StatCard
                  key={day}
                  label={t(day.toLowerCase())}
                  value={weeklyJobs[day] ?? 0}
                  type="jobs"
                  highlight={day === currentDay}
                />
              ))}
            </div>
          )}
        </StatSection>
      </div>
    </div>
  );
}

// Reusable StatSection component
function StatSection({
  title,
  stat,
  loading,
  onRefresh,
  children,
  type,
  formatDate
}: {
  title: string;
  stat: any;
  loading: boolean;
  onRefresh: () => void;
  children: React.ReactNode;
  type: 'users' | 'ads' | 'jobs';
  formatDate: (date?: string) => string;
}) {
    const {t} = useTranslation()
  return (
    <div className={`rounded-lg shadow p-6 transition-colors duration-200 ${statColors[type].bg} ${statColors[type].border} border`}>
      <div className={`flex flex-col sm:flex-row justify-between gap-4 mb-4`}>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">{title}</h2>
        <div className={`flex items-center gap-2`}>
          {stat?.lastUpdated && (
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {formatDate(stat.lastUpdated)}
            </span>
          )}
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`px-3 py-1.5 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:disabled:bg-blue-900 transition-colors duration-200 flex items-center gap-1.5`}
          >
            {loading ? (
              <>
                <RefreshCwIcon className="animate-spin h-4 w-4" />
                {t('statistics.refreshing')}
              </>
            ) : (
              <>
                <RefreshCwIcon className="h-4 w-4" />
                {t('statistics.refresh')}
              </>
            )}
          </button>
        </div>
      </div>

      {stat ? (
        children
      ) : (
        <div className="h-32 flex items-center justify-center">
          <p className="text-gray-500 dark:text-gray-400">
            {loading ? t('statistics.loading') : t('statistics.noDataAvailable')}
          </p>
        </div>
      )}
    </div>
  );
}

// Reusable StatCard component
function StatCard({
  label,
  value,
  type,
  highlight = false
}: {
  label: string;
  value: number;
  type: 'users' | 'ads' | 'jobs';
  highlight?: boolean;
}) {
  return (
    <div className={`border rounded-lg p-3 transition-all duration-200 ${
      highlight
        ? `border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30`
        : `${statColors[type].border} ${statColors[type].bg}`
    }`}>
      <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</h3>
      <p className={`text-2xl font-bold ${statColors[type].text}`}>{value}</p>
    </div>
  );
}