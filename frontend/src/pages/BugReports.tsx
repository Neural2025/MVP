import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Bug,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  FileText,
  Code,
  Brain,
  Loader2,
  Upload,
  Github,
  Download,
  Eye,
  XCircle
} from 'lucide-react';
import { toast } from 'sonner';
import useStatsTracking from '@/hooks/useStatsTracking';
import { triggerDashboardRefresh } from '@/utils/dashboardRefresh';

const BugReports = () => {
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { trackBugReport } = useStatsTracking();

  // State for bug analysis
  const [code, setCode] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [purpose, setPurpose] = useState('');
  const [inputMethod, setInputMethod] = useState('paste');
  const [githubUrl, setGithubUrl] = useState('');

  // Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Bug reports history
  const [bugReports, setBugReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [isLoadingReports, setIsLoadingReports] = useState(true);

  // Fetch bug reports from backend
  const fetchBugReports = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || token === 'null') {
        setIsLoadingReports(false);
        return;
      }

      const response = await fetch('/api/bug-reports', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setBugReports(data.data.bugReports || []);
        setFilteredReports(data.data.bugReports || []);
      }
    } catch (error) {
      console.error('Failed to fetch bug reports:', error);
    } finally {
      setIsLoadingReports(false);
    }
  };

  useEffect(() => {
    fetchBugReports();
  }, []);

  // Filter bug reports
  useEffect(() => {
    let filtered = bugReports;

    if (searchTerm) {
      filtered = filtered.filter(report =>
        report.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(report => report.status === statusFilter);
    }

    if (severityFilter !== 'all') {
      filtered = filtered.filter(report => report.severity === severityFilter);
    }

    setFilteredReports(filtered);
  }, [bugReports, searchTerm, statusFilter, severityFilter]);

  // Handle bug analysis
  const handleAnalyzeBugs = async () => {
    if (!code.trim()) {
      toast.error('Please provide code to analyze for bugs');
      return;
    }

    setIsAnalyzing(true);
    setLoadingProgress(0);
    setLoadingStatus('Analyzing code for bugs...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      setLoadingStatus('Scanning for potential bugs and vulnerabilities...');

      const response = await fetch('/api/analyze-bugs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code: code.trim(),
          purpose: purpose.trim(),
          githubUrl: githubUrl.trim(),
          language: selectedLanguage
        }),
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStatus('Bug analysis complete!');

      const result = await response.json();

      if (result.status === 'success') {
        setAnalysisResults(result.data);

        // Track bug report creation
        trackBugReport();

        // Refresh bug reports list
        fetchBugReports();

        // Trigger dashboard refresh
        triggerDashboardRefresh();

        toast.success('🐛 Bug analysis completed successfully!');
      } else {
        toast.error(`❌ Analysis failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ Failed to analyze code for bugs. Please try again.');
      console.error('Bug analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setLoadingProgress(0);
      setLoadingStatus('');
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    let combinedCode = '';
    let fileCount = 0;
    const totalFiles = Array.from(files).filter(file =>
      file.type.includes('text') ||
      file.name.match(/\.(js|jsx|ts|tsx|py|java|cpp|c|cs|php|rb|go|rs|swift|kt|scala|dart|r|pl|lua|hs|erl|ex|clj|fs|vb|m|sh|sql|html|css|xml|json|yaml|toml)$/)
    );

    if (totalFiles.length === 0) {
      toast.error('No supported code files found');
      return;
    }

    toast.info(`📁 Processing ${totalFiles.length} files...`);

    totalFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        combinedCode += `\n\n// ===== File: ${file.name} =====\n${content}`;
        fileCount++;

        if (fileCount === totalFiles.length) {
          setCode(combinedCode);
          toast.success(`🎉 Successfully loaded ${fileCount} files!`);
        }
      };
      reader.readAsText(file);
    });
  };

  // Handle GitHub repository fetch
  const handleGithubFetch = async () => {
    if (!githubUrl.trim()) {
      toast.error('Please enter a GitHub repository URL');
      return;
    }

    toast.info('🔄 Fetching repository...');

    try {
      const response = await fetch('/api/github/fetch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ githubUrl: githubUrl.trim() }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setCode(result.data.combinedCode);
        toast.success(`🎉 Successfully fetched repository! Found ${result.data.fileCount} files.`);
      } else {
        toast.error(`❌ Failed to fetch repository: ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ Failed to fetch repository. Please check the URL and try again.');
      console.error('GitHub fetch error:', error);
    }
  };

  // Export bug report to PDF
  const exportToPDF = async (bugReport) => {
    try {
      const response = await fetch('/api/export/pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type: 'bug-report',
          data: bugReport
        })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bug_report_${bugReport.id}_${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        toast.success('PDF exported successfully!');
      } else {
        toast.error('Failed to export PDF');
      }
    } catch (error) {
      toast.error('Export failed');
      console.error('Export error:', error);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2 animate-pulse">Loading Bug Reports</h2>
          <p className="text-purple-300 animate-pulse">Preparing bug analysis tools...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="container mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent animate-gradient">
            Bug Analysis & Reports
          </h1>
          <p className="text-xl text-gray-300">
            Identify bugs in your code and manage bug reports
          </p>
        </div>

        <Tabs defaultValue="analyze" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 bg-white/10 backdrop-blur-lg">
            <TabsTrigger value="analyze" className="data-[state=active]:bg-red-600">
              <Bug className="mr-2 h-4 w-4" />
              Analyze Code for Bugs
            </TabsTrigger>
            <TabsTrigger value="reports" className="data-[state=active]:bg-red-600">
              <FileText className="mr-2 h-4 w-4" />
              Bug Reports History
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="space-y-6">
            {/* Code Input Section */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Code className="h-6 w-6 text-red-400" />
                  Code Input for Bug Analysis
                </CardTitle>
                <CardDescription className="text-gray-300">
                  Paste your code, upload files, or provide a GitHub repository URL to analyze for bugs
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Input Method Tabs */}
                <Tabs value={inputMethod} onValueChange={setInputMethod}>
                  <TabsList className="grid w-full grid-cols-3 bg-white/10">
                    <TabsTrigger value="paste">
                      <Code className="h-4 w-4 mr-2" />
                      Paste Code
                    </TabsTrigger>
                    <TabsTrigger value="github">
                      <Github className="h-4 w-4 mr-2" />
                      GitHub URL
                    </TabsTrigger>
                    <TabsTrigger value="upload">
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Files
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="paste" className="space-y-4">
                    <div className="relative">
                      <Textarea
                        placeholder="Paste your code here for bug analysis..."
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="min-h-[300px] font-mono text-sm resize-none bg-black/20 border-white/20 text-white"
                      />
                      <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                        {code.length} characters
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="github" className="space-y-4">
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <Github className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          placeholder="https://github.com/username/repository"
                          value={githubUrl}
                          onChange={(e) => setGithubUrl(e.target.value)}
                          className="pl-10 bg-black/20 border-white/20 text-white"
                        />
                      </div>
                      <Button
                        variant="outline"
                        onClick={handleGithubFetch}
                        disabled={!githubUrl.trim()}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        Fetch Repository
                      </Button>
                    </div>
                  </TabsContent>

                  <TabsContent value="upload" className="space-y-4">
                    <div className="border-2 border-dashed border-red-400/50 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
                      <Upload className="h-12 w-12 text-red-400 mx-auto mb-4" />
                      <p className="text-lg font-medium mb-2 text-white">Drop your code files here</p>
                      <p className="text-gray-400 mb-4">or click to browse and select files</p>
                      <input
                        type="file"
                        multiple
                        onChange={handleFileUpload}
                        className="hidden"
                        id="file-upload"
                        accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.swift,.kt,.scala,.dart,.r,.pl,.lua,.hs,.erl,.ex,.clj,.fs,.vb,.m,.sh,.sql,.html,.css,.xml,.json,.yaml,.toml"
                      />
                      <Button
                        variant="outline"
                        onClick={() => document.getElementById('file-upload')?.click()}
                        className="border-red-500 text-red-400 hover:bg-red-500/10"
                      >
                        Choose Files
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>

                {/* Language Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white">Programming Language</label>
                    <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                      <SelectTrigger className="bg-black/20 border-white/20 text-white">
                        <SelectValue placeholder="Select Language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="javascript">JavaScript</SelectItem>
                        <SelectItem value="typescript">TypeScript</SelectItem>
                        <SelectItem value="python">Python</SelectItem>
                        <SelectItem value="java">Java</SelectItem>
                        <SelectItem value="cpp">C++</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="csharp">C#</SelectItem>
                        <SelectItem value="php">PHP</SelectItem>
                        <SelectItem value="ruby">Ruby</SelectItem>
                        <SelectItem value="go">Go</SelectItem>
                        <SelectItem value="rust">Rust</SelectItem>
                        <SelectItem value="swift">Swift</SelectItem>
                        <SelectItem value="kotlin">Kotlin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Purpose Input */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Code Purpose (Optional)</label>
                  <Textarea
                    placeholder="Describe what your code is supposed to do (helps with better bug detection)..."
                    value={purpose}
                    onChange={(e) => setPurpose(e.target.value)}
                    className="min-h-[100px] resize-none bg-black/20 border-white/20 text-white"
                  />
                </div>

                {/* Analyze Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={handleAnalyzeBugs}
                    disabled={isAnalyzing || !code.trim()}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-red-500 via-pink-500 to-purple-500 hover:from-red-600 hover:via-pink-600 hover:to-purple-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Analyzing for Bugs...
                      </>
                    ) : (
                      <>
                        <Bug className="h-5 w-5 mr-2" />
                        Analyze Code for Bugs
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResults && (
              <Card className="bg-white/10 backdrop-blur-lg border-white/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="h-6 w-6 text-yellow-400" />
                    Bug Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analysisResults.bugs && analysisResults.bugs.length > 0 ? (
                      analysisResults.bugs.map((bug, index) => (
                        <div key={index} className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-semibold text-red-400">{bug.type || 'Bug Found'}</h4>
                            <Badge className={`${
                              bug.severity === 'critical' ? 'bg-red-600' :
                              bug.severity === 'high' ? 'bg-orange-600' :
                              bug.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                            }`}>
                              {bug.severity || 'Medium'}
                            </Badge>
                          </div>
                          <p className="text-gray-300 mb-2">{bug.description}</p>
                          {bug.line && (
                            <p className="text-sm text-gray-400">Line: {bug.line}</p>
                          )}
                          {bug.suggestion && (
                            <div className="mt-2 p-2 bg-green-500/10 border border-green-500/20 rounded">
                              <p className="text-sm text-green-400">
                                <strong>Suggestion:</strong> {bug.suggestion}
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-white mb-2">No Bugs Found!</h3>
                        <p className="text-gray-300">Your code looks clean and bug-free.</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur-lg border-white/20">
              <CardContent className="p-4">
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search bug reports..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-black/20 border-white/20 text-white"
                      />
                    </div>
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px] bg-black/20 border-white/20 text-white">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[150px] bg-black/20 border-white/20 text-white">
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Severity</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Bug Reports List */}
            <div className="space-y-4">
              {isLoadingReports ? (
                <div className="text-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-400" />
                  <p className="text-gray-300">Loading bug reports...</p>
                </div>
              ) : filteredReports.length > 0 ? (
                filteredReports.map((report, index) => (
                  <Card key={report.id || index} className="bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/15 transition-colors">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white mb-2">{report.title || 'Bug Report'}</h3>
                          <p className="text-gray-300 text-sm mb-2">{report.description}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                            {report.language && <span>Language: {report.language}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${
                            report.severity === 'critical' ? 'bg-red-600' :
                            report.severity === 'high' ? 'bg-orange-600' :
                            report.severity === 'medium' ? 'bg-yellow-600' : 'bg-blue-600'
                          }`}>
                            {report.severity || 'Medium'}
                          </Badge>
                          <Badge className={`${
                            report.status === 'resolved' ? 'bg-green-600' :
                            report.status === 'in-progress' ? 'bg-blue-600' : 'bg-gray-600'
                          }`}>
                            {report.status || 'Open'}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => exportToPDF(report)}
                            className="border-white/20 text-white hover:bg-white/10"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="text-center py-12">
                  <Bug className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Bug Reports Found</h3>
                  <p className="text-gray-300 mb-4">Start by analyzing your code for bugs in the "Analyze Code" tab.</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Loading Overlay */}
      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-96 shadow-2xl bg-white/10 backdrop-blur-lg border-white/20">
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                <Bug className="h-16 w-16 text-red-400 animate-pulse mx-auto" />
                <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-purple-400 rounded-full blur-xl opacity-30 animate-ping"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-white">
                Analyzing Code for Bugs...
              </h3>
              <p className="text-gray-300 mb-4">{loadingStatus || 'Scanning for potential issues...'}</p>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-red-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default BugReports;
