import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Code,
  TestTube,
  Activity,
  Bug,
  Plus,
  Download,
  Brain,
  Database,
  Globe,
  ArrowUp,
  Target,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";

// Define interfaces for types
interface User {
  name: string;
  role: string;
}

interface AuthContext {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

interface Stats {
  linesAnalyzed: number;
  languagesUsed: number;
  apisSupported: number;
  accuracyRate: number;
  totalAnalyses: number;
  totalTests: number;
  totalBugReports: number;
}

interface BugReport {
  id?: string;
  title?: string;
  description?: string;
  severity?: string;
  status?: string;
  createdAt?: string;
  language?: string;
  [key: string]: any; // Allow additional properties
}

interface TestResult {
  id?: string;
  purpose?: string;
  language?: string;
  timestamp?: string;
  tests?: string | object;
}

interface Activity {
  id: string;
  type: string;
  description: string;
  time: string;
  icon: LucideIcon; // Use LucideIcon type
}

interface AnalysisHistoryItem {
  id?: string;
  language?: string;
  timestamp?: string;
}

interface TestHistoryItem {
  id?: string;
  language?: string;
  timestamp?: string;
}

const Dashboard: React.FC = () => {
  const { isAuthenticated, isLoading, user } = useAuth() as AuthContext;

  // Only allow PO (Product Owner/Manager)
  const allowedRoles = [
    'po', 'product_owner', 'product owner', 'productowner', 'product manager', 'productmanager', 'pm', 'owner', 'manager', 'product_manager'
  ];
  if (!user || !allowedRoles.includes(user.role?.toLowerCase())) {
    return <Navigate to="/" replace />;
  }
  const [stats, setStats] = useState<Stats>({
    linesAnalyzed: 0,
    languagesUsed: 0,
    apisSupported: 5,
    accuracyRate: 0,
    totalAnalyses: 0,
    totalTests: 0,
    totalBugReports: 0,
  });
  const [isPageLoaded, setIsPageLoaded] = useState<boolean>(false);
  const [bugReports, setBugReports] = useState<BugReport[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 500);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const element = entry.target as HTMLElement;
            element.style.opacity = "1";
            element.style.transform = "translateY(0) scale(1)";
          }
        });
      },
      { threshold: 0.1, rootMargin: "50px" }
    );

    setTimeout(() => {
      const elementsToObserve = document.querySelectorAll(
        ".animate-on-scroll, .stat-card, .chart-card, .report-card"
      );
      elementsToObserve.forEach((el) => observer.observe(el));
    }, 600);

    fetchUserStats();
    fetchBugReports();
    fetchTestResults();
    fetchRecentActivity();

    const refreshInterval = setInterval(() => {
      fetchUserStats();
      fetchBugReports();
      fetchTestResults();
      fetchRecentActivity();
    }, 30000);

    return () => {
      clearTimeout(timer);
      clearInterval(refreshInterval);
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "dashboard-refresh") {
        fetchUserStats();
        fetchBugReports();
        fetchTestResults();
        fetchRecentActivity();
        localStorage.removeItem("dashboard-refresh");
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        const defaultStats: Stats = {
          linesAnalyzed: 0,
          languagesUsed: 0,
          apisSupported: 5,
          accuracyRate: 0,
          totalAnalyses: 0,
          totalTests: 0,
          totalBugReports: 0,
        };
        setStats(defaultStats);
        animateCounters(defaultStats);
        return;
      }

      const response = await fetch("/api/user/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: { stats: Stats } = await response.json();
        setStats(data.stats);
        animateCounters(data.stats);
      } else {
        const defaultStats: Stats = {
          linesAnalyzed: 0,
          languagesUsed: 0,
          apisSupported: 5,
          accuracyRate: 0,
          totalAnalyses: 0,
          totalTests: 0,
          totalBugReports: 0,
        };
        setStats(defaultStats);
        animateCounters(defaultStats);
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error);
      const defaultStats: Stats = {
        linesAnalyzed: 0,
        languagesUsed: 0,
        apisSupported: 5,
        accuracyRate: 0,
        totalAnalyses: 0,
        totalTests: 0,
        totalBugReports: 0,
      };
      setStats(defaultStats);
      animateCounters(defaultStats);
    }
  };

  const fetchBugReports = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setBugReports([]);
        return;
      }

      const response = await fetch("/api/bug-reports", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: { data: { bugReports: BugReport[] } } = await response.json();
        setBugReports(data.data?.bugReports?.slice(0, 5) || []);
      } else {
        setBugReports([]);
      }
    } catch (error) {
      console.error("Failed to fetch bug reports:", error);
      setBugReports([]);
    }
  };

  const fetchTestResults = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setTestResults([]);
        return;
      }

      const response = await fetch("/api/test-history", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: { data: TestResult[] } = await response.json();
        setTestResults(data.data?.slice(0, 5) || []);
      } else {
        setTestResults([]);
      }
    } catch (error) {
      console.error("Failed to fetch test results:", error);
      setTestResults([]);
    }
  };

  const fetchRecentActivity = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setRecentActivity([]);
        return;
      }

      const [analysisResponse, testResponse, bugResponse] = await Promise.allSettled([
        fetch("/api/analysis-history?limit=3", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/test-history?limit=3", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("/api/bug-reports?limit=3", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const activities: Activity[] = [];

      if (analysisResponse.status === "fulfilled" && analysisResponse.value.ok) {
        const data: { data: AnalysisHistoryItem[] } = await analysisResponse.value.json();
        data.data?.forEach((item) => {
          activities.push({
            id: `analysis-${item.id || Date.now()}`,
            type: "analysis",
            description: `Code analysis completed for ${item.language || "unknown"} code`,
            time: item.timestamp ? new Date(item.timestamp).toLocaleString() : new Date().toLocaleString(),
            icon: Brain,
          });
        });
      }

      if (testResponse.status === "fulfilled" && testResponse.value.ok) {
        const data: { data: TestHistoryItem[] } = await testResponse.value.json();
        data.data?.forEach((item) => {
          activities.push({
            id: `test-${item.id || Date.now()}`,
            type: "test",
            description: `Test suite generated for ${item.language || "unknown"} code`,
            time: item.timestamp ? new Date(item.timestamp).toLocaleString() : new Date().toLocaleString(),
            icon: TestTube,
          });
        });
      }

      if (bugResponse.status === "fulfilled" && bugResponse.value.ok) {
        const data: { data: { bugReports: BugReport[] } } = await bugResponse.value.json();
        data.data?.bugReports?.forEach((item) => {
          activities.push({
            id: `bug-${item.id || Date.now()}`,
            type: "bug",
            description: `Bug report: ${item.title || "Bug analysis completed"}`,
            time: item.createdAt ? new Date(item.createdAt).toLocaleString() : new Date().toLocaleString(),
            icon: Bug,
          });
        });
      }

      activities.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());
      setRecentActivity(activities.slice(0, 5));
    } catch (error) {
      console.error("Failed to fetch recent activity:", error);
      setRecentActivity([]);
    }
  };

  const animateCounters = (targetStats: Stats) => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setStats({
        linesAnalyzed: Math.floor(targetStats.linesAnalyzed * progress),
        languagesUsed: Math.floor(targetStats.languagesUsed * progress),
        apisSupported: Math.floor(targetStats.apisSupported * progress),
        accuracyRate: Math.floor(targetStats.accuracyRate * progress),
        totalAnalyses: Math.floor(targetStats.totalAnalyses * progress),
        totalTests: Math.floor(targetStats.totalTests * progress),
        totalBugReports: Math.floor(targetStats.totalBugReports * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
        setStats(targetStats);
      }
    }, stepDuration);
  };

  const exportToPDF = async (type: "test-suite" | "bug-report", data: BugReport | TestResult) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("No authentication token found");
        return;
      }

      const response = await fetch("/api/export/pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, data }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${type}_report_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success("PDF exported successfully!");
      } else {
        toast.error("Failed to export PDF");
      }
    } catch (error) {
      toast.error("Export failed");
      console.error("Export error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
            <div
              className="absolute inset-0 w-20 h-20 border-4 border-pink-500/30 border-b-pink-500 rounded-full animate-spin mx-auto"
              style={{ animationDirection: "reverse", animationDuration: "1.5s" }}
            ></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Loading Dashboard</h2>
          <p className="text-purple-300 animate-pulse">Preparing your analytics...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white ${
        isPageLoaded ? "animate-fade-in" : "opacity-0"
      }`}
    >
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-20 w-32 h-32 bg-purple-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-blue-500/10 rounded-full animate-float-delayed"></div>
        <div className="absolute top-1/2 left-10 w-16 h-16 bg-pink-500/10 rounded-full animate-float"></div>
        <div className="absolute bottom-1/3 left-1/3 w-20 h-20 bg-cyan-500/10 rounded-full animate-float-delayed"></div>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-6 py-8">
        <div className={`mb-12 text-center ${isPageLoaded ? "animate-slide-in-top" : "opacity-0"}`}>
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent animate-gradient">
            AI QA Dashboard
          </h1>
          <p className="text-xl text-gray-300 mb-2">
            Welcome back, <span className="text-purple-400 font-semibold">{user?.name || "User"}</span>
          </p>
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 text-sm">
            {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : "User"} Dashboard
          </Badge>
        </div>

        <div ref={statsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            {
              title: "Lines of Code Analyzed",
              value: stats.linesAnalyzed,
              suffix: "+",
              icon: Code,
              color: "from-blue-500 to-cyan-500",
              trend: "+12%",
            },
            {
              title: "Programming Languages",
              value: stats.languagesUsed,
              suffix: "+",
              icon: Globe,
              color: "from-green-500 to-emerald-500",
              trend: "+3",
            },
            {
              title: "AI APIs Supported",
              value: stats.apisSupported,
              suffix: "+",
              icon: Database,
              color: "from-purple-500 to-pink-500",
              trend: "Stable",
            },
            {
              title: "Accuracy Rate",
              value: stats.accuracyRate,
              suffix: "%",
              icon: Target,
              color: "from-orange-500 to-red-500",
              trend: "+5%",
            },
          ].map((stat, index) => {
            const Icon = stat.icon as LucideIcon;
            return (
              <Card
                key={stat.title}
                className={`stat-card animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color}`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex items-center text-sm text-green-400">
                      <ArrowUp className="h-4 w-4 mr-1" />
                      {stat.trend}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-400">{stat.title}</p>
                    <p className="text-3xl font-bold text-white">
                      {stat.value.toLocaleString()}
                      {stat.suffix}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Tabs defaultValue="overview" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600">
              Overview
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-green-600">
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            <Card className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Activity className="h-5 w-5" />
                  Team Metrics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-blue-700">{stats.coverage || 0}%</span>
                    <span className="text-gray-700 mt-2">Code Coverage</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-green-700">{stats.bugsFixedByDev || 0}</span>
                    <span className="text-gray-700 mt-2">Bugs Fixed by Developer</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-pink-700">{stats.bugsFoundByTester || 0}</span>
                    <span className="text-gray-700 mt-2">Bugs Found by Tester</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-purple-700">{stats.totalBugReports || 0}</span>
                    <span className="text-gray-700 mt-2">Total Bug Reports</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-8">
            <Card className="animate-on-scroll opacity-0 translate-y-10 transition-all duration-700 bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Brain className="h-5 w-5" />
                  Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-blue-700">{stats.linesAnalyzed || 0}</span>
                    <span className="text-gray-700 mt-2">Lines of Code Analyzed</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-green-700">{stats.languagesUsed || 0}</span>
                    <span className="text-gray-700 mt-2">Languages Used</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-yellow-700">{stats.accuracyRate || 0}%</span>
                    <span className="text-gray-700 mt-2">Analysis Accuracy</span>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6 flex flex-col items-center">
                    <span className="text-2xl font-bold text-pink-700">{stats.totalAnalyses || 0}</span>
                    <span className="text-gray-700 mt-2">Total Analyses</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;