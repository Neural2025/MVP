import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface UserStats {
  linesAnalyzed: number;
  languagesUsed: number;
  apisSupported: number;
  accuracyRate: number;
  totalAnalyses: number;
  totalTests: number;
  totalBugReports: number;
}

interface StatsUpdate {
  linesOfCode?: number;
  language?: string;
  analysisSuccess?: boolean;
  testGenerated?: boolean;
  bugReportCreated?: boolean;
}

export const useStatsTracking = () => {
  const [stats, setStats] = useState<UserStats>({
    linesAnalyzed: 0,
    languagesUsed: 0,
    apisSupported: 5,
    accuracyRate: 0,
    totalAnalyses: 0,
    totalTests: 0,
    totalBugReports: 0
  });

  const [isLoading, setIsLoading] = useState(true);
  const [languages, setLanguages] = useState<Set<string>>(new Set());

  // Fetch initial stats
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');

      // If no token, use default stats for demo
      if (!token || token === 'null' || token === 'undefined') {
        const defaultStats = {
          linesAnalyzed: 50000,
          languagesUsed: 30,
          apisSupported: 5,
          accuracyRate: 99,
          totalAnalyses: 1250,
          totalTests: 850,
          totalBugReports: 125
        };
        setStats(defaultStats);
        animateCounters(defaultStats);
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/user/stats', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);

        // Animate counters
        animateCounters(data.stats);
      } else {
        // Use default stats if API fails
        const defaultStats = {
          linesAnalyzed: 50000,
          languagesUsed: 30,
          apisSupported: 5,
          accuracyRate: 99,
          totalAnalyses: 1250,
          totalTests: 850,
          totalBugReports: 125
        };
        setStats(defaultStats);
        animateCounters(defaultStats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Use default stats on error
      const defaultStats = {
        linesAnalyzed: 50000,
        languagesUsed: 30,
        apisSupported: 5,
        accuracyRate: 99,
        totalAnalyses: 1250,
        totalTests: 850,
        totalBugReports: 125
      };
      setStats(defaultStats);
      animateCounters(defaultStats);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Animate counter values
  const animateCounters = (targetStats: UserStats) => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;
    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats(prevStats => ({
        ...prevStats,
        linesAnalyzed: Math.floor(targetStats.linesAnalyzed * progress),
        languagesUsed: Math.floor(targetStats.languagesUsed * progress),
        accuracyRate: Math.floor(targetStats.accuracyRate * progress),
        totalAnalyses: Math.floor(targetStats.totalAnalyses * progress),
        totalTests: Math.floor(targetStats.totalTests * progress),
        totalBugReports: Math.floor(targetStats.totalBugReports * progress)
      }));

      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(targetStats);
      }
    }, stepDuration);
  };

  // Update stats when user performs actions
  const updateStats = useCallback(async (update: StatsUpdate) => {
    try {
      // Update local state immediately for better UX
      setStats(prevStats => {
        const newStats = { ...prevStats };

        if (update.linesOfCode) {
          newStats.linesAnalyzed += update.linesOfCode;
        }

        if (update.language) {
          const newLanguages = new Set(languages);
          if (!newLanguages.has(update.language)) {
            newLanguages.add(update.language);
            setLanguages(newLanguages);
            newStats.languagesUsed = newLanguages.size;
          }
        }

        if (update.analysisSuccess !== undefined) {
          newStats.totalAnalyses += 1;
          // Recalculate accuracy rate
          const successRate = update.analysisSuccess ? 1 : 0;
          newStats.accuracyRate = Math.round(
            ((newStats.accuracyRate * (newStats.totalAnalyses - 1)) + successRate) / newStats.totalAnalyses * 100
          );
        }

        if (update.testGenerated) {
          newStats.totalTests += 1;
        }

        if (update.bugReportCreated) {
          newStats.totalBugReports += 1;
        }

        return newStats;
      });

      // Show notification for significant milestones
      checkMilestones(update);

    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  }, [languages]);

  // Check for milestones and show notifications
  const checkMilestones = (update: StatsUpdate) => {
    if (update.linesOfCode && stats.linesAnalyzed > 0) {
      const newTotal = stats.linesAnalyzed + update.linesOfCode;

      // Check for line milestones
      const milestones = [100, 500, 1000, 5000, 10000, 50000, 100000];
      const passedMilestone = milestones.find(
        milestone => stats.linesAnalyzed < milestone && newTotal >= milestone
      );

      if (passedMilestone) {
        toast.success(`🎉 Milestone reached! ${passedMilestone.toLocaleString()}+ lines analyzed!`, {
          duration: 5000
        });
      }
    }

    if (update.language && !languages.has(update.language)) {
      const newLanguageCount = languages.size + 1;

      if (newLanguageCount === 5) {
        toast.success('🌟 Polyglot! You\'ve analyzed code in 5 different languages!');
      } else if (newLanguageCount === 10) {
        toast.success('🚀 Language Master! 10 programming languages conquered!');
      } else if (newLanguageCount % 5 === 0) {
        toast.success(`💫 Amazing! ${newLanguageCount} programming languages mastered!`);
      }
    }

    if (update.testGenerated && stats.totalTests > 0) {
      const newTotal = stats.totalTests + 1;

      if (newTotal === 10) {
        toast.success('🧪 Test Automation Expert! 10 test suites generated!');
      } else if (newTotal === 50) {
        toast.success('🏆 Testing Champion! 50 test suites created!');
      } else if (newTotal === 100) {
        toast.success('🎯 Testing Legend! 100 test suites generated!');
      }
    }
  };

  // Track code analysis
  const trackCodeAnalysis = useCallback((code: string, language: string, success: boolean) => {
    const linesOfCode = code.split('\n').length;
    updateStats({
      linesOfCode,
      language,
      analysisSuccess: success
    });
  }, [updateStats]);

  // Track test generation
  const trackTestGeneration = useCallback((language: string) => {
    updateStats({
      language,
      testGenerated: true
    });
  }, [updateStats]);

  // Track bug report creation
  const trackBugReport = useCallback(() => {
    updateStats({
      bugReportCreated: true
    });
  }, [updateStats]);

  // Initialize stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    isLoading,
    fetchStats,
    updateStats,
    trackCodeAnalysis,
    trackTestGeneration,
    trackBugReport,
    animateCounters
  };
};

export default useStatsTracking;
