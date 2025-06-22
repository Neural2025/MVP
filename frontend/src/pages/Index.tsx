import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import useStatsTracking from "@/hooks/useStatsTracking";
import { triggerDashboardRefresh } from "@/utils/dashboardRefresh";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Code,
  Upload,
  Github,
  Brain,
  Loader2,
  Moon,
  Sun,
  LogOut,
  Bug,
  Zap,
  Shield
} from "lucide-react";
import { toast } from "sonner";
import { analyzeCode } from "@/lib/api";
import ResultsDashboard from "@/components/ResultsDashboard";
import Navbar from "@/components/Navbar";

const Index = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { trackCodeAnalysis } = useStatsTracking();

  // App state
  const [currentStep, setCurrentStep] = useState('role-selection');
  const [selectedRole, setSelectedRole] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Input states
  const [inputMethod, setInputMethod] = useState('paste');
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [purpose, setPurpose] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Results
  const [analysisResults, setAnalysisResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Initialize role from user data
  useEffect(() => {
    if (user?.role) {
      setSelectedRole(user.role);
      setCurrentStep('main-app');
    }
  }, [user]);

  // Theme toggle
  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
  };

  // Role selection handler
  const handleRoleSelection = (role: string) => {
    setSelectedRole(role);
    setCurrentStep('main-app');
    toast.success(`Welcome, ${role}! Let's analyze some code.`);
  };



  // Handle code analysis (accepts code from textarea/upload or GitHub)
  const handleAnalyze = async () => {
    // Prevent duplicate requests
    if (isAnalyzing) return;

    // Must have at least one code source
    let codeToAnalyze = code.trim();
    const githubUrlToAnalyze = githubUrl.trim();
    if (!codeToAnalyze && !githubUrlToAnalyze) {
      toast.error('Please provide code (paste/upload) or a GitHub repo URL');
      return;
    }

    // Limit code to 2000 lines or 20000 characters (whichever is smaller)
    if (codeToAnalyze) {
      const lines = codeToAnalyze.split('\n');
      if (lines.length > 2000) {
        codeToAnalyze = lines.slice(0, 2000).join('\n');
      }
      if (codeToAnalyze.length > 20000) {
        codeToAnalyze = codeToAnalyze.slice(0, 20000);
      }
    }

    // Purpose and language are required
    if (!purpose.trim()) {
      toast.error('Please describe what your code is supposed to do');
      return;
    }
    if (!selectedLanguage) {
      toast.error('Please select a programming language');
      return;
    }

    setIsAnalyzing(true);
    setLoadingProgress(0);
    setLoadingStatus('Initializing analysis...');

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      setLoadingStatus('Sending code to AI for analysis...');

      // Build request body, omitting empty fields
      const body: Record<string, string> = {
        purpose: purpose.trim(),
        language: selectedLanguage,
      };
      if (codeToAnalyze) body.code = codeToAnalyze;
      if (githubUrlToAnalyze) body.githubUrl = githubUrlToAnalyze;

            const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });
      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStatus('Analysis complete!');

      // Parse response
      const result = await response.json();

      if (result.status === 'success') {
        setAnalysisResults(result.data);
        setShowResults(true);
        trackCodeAnalysis(codeToAnalyze || githubUrlToAnalyze, selectedLanguage, true);
        triggerDashboardRefresh();
        console.log('Analysis results set:', result.data);
        // Debug: log the full analysis result structure
        console.log('DEBUG: Full analysis result:', JSON.stringify(result.data, null, 2));

        // --- Bug Reporting Integration ---
        const categories = [
          { key: 'security', severity: 'high' },
          { key: 'performance', severity: 'medium' },
          { key: 'optimization', severity: 'medium' },
          { key: 'functionality', severity: 'low' }
        ];
        const token = localStorage.getItem('token');
        let bugsReported = 0;
        if (token && result.data) {
          for (const cat of categories) {
            const issues = result.data[cat.key];
            if (Array.isArray(issues) && issues.length > 0) {
              for (const issue of issues) {
                // POST each bug
                fetch('/api/bug-reports', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                  },
                  body: JSON.stringify({
                    title: `${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)} Issue`,
                    description: issue,
                    severity: cat.severity,
                    status: 'open',
                    language: selectedLanguage,
                    source: 'analysis',
                  })
                })
                  .then(async (resp) => {
                    if (!resp.ok) {
                      const errText = await resp.text();
                      toast.error(`Failed to save bug: ${resp.status} ${errText}`);
                      console.error('Bug report POST failed:', resp.status, errText);
                    } else {
                      toast.success('Bug report saved!');
                      console.log('Bug report POST success:', resp.status);
                    }
                  })
                  .catch((err) => {
                    toast.error('Failed to save bug (network error).');
                    console.error('Bug report POST error:', err);
                  });
                bugsReported++;
              }
            }
          }
        }
        if (bugsReported > 0) {
          toast.info(`${bugsReported} bugs reported and saved as 'open'.`);
        }
        // --- End Bug Reporting Integration ---

        toast.success('🎉 Code analysis completed successfully!');
      } else {
        trackCodeAnalysis(codeToAnalyze || githubUrlToAnalyze, selectedLanguage, false);
        toast.error(`❌ Analysis failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ Failed to analyze code. Please try again.');
      console.error('Analysis error:', error);
    } finally {
      setIsAnalyzing(false);
      setLoadingProgress(0);
      setLoadingStatus('');
    }
  };

  // Handle file/folder upload
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
      toast.error('No supported code files found in the selected folder');
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
          toast.success(`🎉 Successfully loaded ${fileCount} files from folder!`);
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
        <div className="text-center">
          <div className="relative">
            <Brain className="h-16 w-16 text-white animate-pulse mx-auto mb-4" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-xl opacity-30 animate-ping"></div>
          </div>
          <p className="text-white text-lg font-medium">Loading AI QA Assistant...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Role Selection Screen
  if (currentStep === 'role-selection') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 flex items-center justify-center p-6">
        <div className="max-w-6xl w-full">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-3 mb-6">
              <Brain className="h-12 w-12 text-white" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                AI QA Assistant
              </h1>
            </div>
            <p className="text-xl text-purple-200 mb-2">Choose Your Role</p>
            <p className="text-purple-300">Select your primary role to get customized AI analysis</p>
          </div>

          {/* Role Cards */}
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Developer */}
            <Card
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20"
              onClick={() => handleRoleSelection('developer')}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">👨‍💻</div>
                <CardTitle className="text-2xl text-white mb-2">Developer</CardTitle>
                <CardDescription className="text-purple-200">
                  Get code corrections, bug analysis, and optimization suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-purple-300">
                  <div className="flex items-center gap-2">
                    <Bug className="h-4 w-4" />
                    <span>Code Review & Bug Detection</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Performance Optimization</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>Best Practices</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tester */}
            <Card
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20"
              onClick={() => handleRoleSelection('tester')}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧪</div>
                <CardTitle className="text-2xl text-white mb-2">Tester</CardTitle>
                <CardDescription className="text-purple-200">
                  Generate comprehensive security assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-purple-300">
                  {/* Add any tester-specific features here if needed */}
                </div>
              </CardContent>
            </Card>
            {/* Product Owner */}
            <Card
              className="group cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-2xl bg-white/10 backdrop-blur-lg border-white/20 hover:bg-white/20"
              onClick={() => handleRoleSelection('product-owner')}
            >
              <CardHeader className="text-center pb-4">
                <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
                <CardTitle className="text-2xl text-white mb-2">Product Owner</CardTitle>
                <CardDescription className="text-purple-200">
                  Get business logic validation and feature analysis reports
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-purple-300">
                  {/* Add any product owner-specific features here if needed */}
                </div>
              </CardContent>
            </Card>
                
          </div>
        </div>
      </div>
    );
  }

  // Main App UI
  return (
    <div className={`min-h-screen transition-all duration-300 ${isDarkMode ? 'dark bg-slate-900' : 'bg-gray-50'}`}>
      {/* Navbar */}
      <Navbar />

      {/* Header */}
      <header className="sticky top-0 z-40 w-full">
        <div className="backdrop-blur-lg bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 border-b border-purple-700/30 shadow-xl">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-indigo-600 dark:text-purple-300" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent dark:from-purple-300 dark:to-pink-300">
                AI QA Assistant
              </span>
            </div>
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="rounded-full ml-4"
              aria-label="Toggle theme"
            >
              {isDarkMode ? <Sun className="h-5 w-5 text-yellow-500" /> : <Moon className="h-5 w-5 text-indigo-600" />}
            </Button>
            {/* User Role/Logout */}
            <div className="flex items-center gap-3 ml-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 text-white">
                <span className="text-2xl">
                  {selectedRole === 'developer' ? '👨‍💻' : selectedRole === 'tester' ? '🧪' : '📊'}
                </span>
                <span className="text-sm font-medium capitalize">{selectedRole}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-red-600 hover:text-red-700"
                aria-label="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        {/* Language Selector below the main header, always visible, with clear background for both modes */}
        <div className="w-full px-0 border-t border-purple-700/20">
          <div className="container mx-auto px-6 py-3 flex justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-md">
            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
              <SelectTrigger className="w-48 bg-white dark:bg-slate-800 border border-purple-400/40 dark:border-purple-900/40 shadow">
                <SelectValue placeholder="Select Language" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-slate-900 border border-purple-500/30 dark:border-purple-800/50">
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
                <SelectItem value="scala">Scala</SelectItem>
                <SelectItem value="dart">Dart</SelectItem>
                <SelectItem value="r">R</SelectItem>
                <SelectItem value="perl">Perl</SelectItem>
                <SelectItem value="lua">Lua</SelectItem>
                <SelectItem value="haskell">Haskell</SelectItem>
                <SelectItem value="erlang">Erlang</SelectItem>
                <SelectItem value="elixir">Elixir</SelectItem>
                <SelectItem value="clojure">Clojure</SelectItem>
                <SelectItem value="fsharp">F#</SelectItem>
                <SelectItem value="vbnet">VB.NET</SelectItem>
                <SelectItem value="objective-c">Objective-C</SelectItem>
                <SelectItem value="shell">Shell</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="powershell">PowerShell</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="sass">SASS/SCSS</SelectItem>
                <SelectItem value="less">LESS</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="toml">TOML</SelectItem>
                <SelectItem value="dockerfile">Dockerfile</SelectItem>
                <SelectItem value="makefile">Makefile</SelectItem>
                <SelectItem value="cmake">CMake</SelectItem>
                <SelectItem value="assembly">Assembly</SelectItem>
                <SelectItem value="cobol">COBOL</SelectItem>
                <SelectItem value="fortran">Fortran</SelectItem>
                <SelectItem value="pascal">Pascal</SelectItem>
                <SelectItem value="delphi">Delphi</SelectItem>
                <SelectItem value="matlab">MATLAB</SelectItem>
                <SelectItem value="octave">Octave</SelectItem>
                <SelectItem value="julia">Julia</SelectItem>
                <SelectItem value="nim">Nim</SelectItem>
                <SelectItem value="crystal">Crystal</SelectItem>
                <SelectItem value="zig">Zig</SelectItem>
                <SelectItem value="v">V</SelectItem>
                <SelectItem value="solidity">Solidity</SelectItem>
                <SelectItem value="vyper">Vyper</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {/* Input Section */}
        <div className="mb-8">
          <Card className="shadow-xl border-0 bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Code className="h-6 w-6 text-emerald-600" />
                Code Input
              </CardTitle>
              <CardDescription>
                Choose your input method and provide your code for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Input Method Tabs */}
              <Tabs value={inputMethod} onValueChange={setInputMethod}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="paste" className="flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Paste Code
                  </TabsTrigger>
                  <TabsTrigger value="github" className="flex items-center gap-2">
                    <Github className="h-4 w-4" />
                    GitHub URL
                  </TabsTrigger>
                  <TabsTrigger value="upload" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Upload .zip
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="paste" className="space-y-4">
                  <div className="relative">
                    <Textarea
                      placeholder="Paste your code here..."
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      className="min-h-[300px] font-mono text-sm resize-none"
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-muted-foreground">
                      {code.length} characters
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="github" className="space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="https://github.com/username/repository"
                        value={githubUrl}
                        onChange={(e) => setGithubUrl(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    <Button
                      variant="outline"
                      onClick={handleGithubFetch}
                      disabled={!githubUrl.trim()}
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Fetch Repository
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-emerald-300 dark:border-emerald-600 rounded-lg p-8 text-center hover:border-emerald-400 transition-colors">
                    <Upload className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
                    <p className="text-lg font-medium mb-2">Drop your project folder here</p>
                    <p className="text-muted-foreground mb-4">or click to browse and select a folder</p>
                    <input
                      type="file"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                      id="file-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      className="border-emerald-500 text-emerald-600 hover:bg-emerald-50"
                    >
                      Choose Folder
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Purpose Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Describe what your code is supposed to do</label>
                <Textarea
                  placeholder="Enter a clear description of your code's purpose and expected behavior..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  className="min-h-[100px] resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                {/* Analyze Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || (!code.trim() && !githubUrl.trim()) || !purpose.trim()}
                    className="px-8 py-3 text-lg bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin mr-2" />
                        Analyzing with DeepSeek AI...
                      </>
                    ) : (
                      <>
                        <Brain className="h-5 w-5 mr-2" />
                        Analyze with DeepSeek AI
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        {showResults && (
          <div className="space-y-6">
            {/* Modern Analysis Results Card */}
            <div className="relative rounded-2xl shadow-2xl bg-gradient-to-br from-indigo-700 via-purple-800 to-pink-700 p-1 animate-in fade-in-0 duration-500">
              <div className="rounded-2xl bg-white/90 dark:bg-slate-900/90 p-8">
                <div className="flex items-center gap-4 mb-6">
                  <Brain className="h-10 w-10 text-purple-500 animate-pulse" />
                  <div>
                    <h2 className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 bg-clip-text text-transparent">Analysis Results</h2>
                    <p className="text-purple-400 font-medium">AI-powered insights and recommendations</p>
                  </div>
                </div>
                <div className="mb-6">
                  <span className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-pink-500 text-white text-xs font-semibold uppercase tracking-wider shadow">{selectedLanguage}</span>
                  <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">{inputMethod === 'paste' ? 'Manual Input' : inputMethod === 'github' ? 'GitHub' : 'Upload'}</span>
                </div>
                {/* Render Analysis Results Only */}
                <ResultsDashboard analysisResults={analysisResults} testResults={null} />
              </div>
              <div className="absolute -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-pink-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
              <div className="absolute -bottom-2 -right-2 w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-400 rounded-full blur-2xl opacity-30 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {(isAnalyzing || isGeneratingTests) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-96 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                <Brain className="h-16 w-16 text-indigo-600 animate-pulse mx-auto" />
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full blur-xl opacity-30 animate-ping"></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isAnalyzing ? 'Analyzing with DeepSeek AI...' : 'Generating Tests...'}
              </h3>
              <p className="text-muted-foreground mb-4">{loadingStatus || 'Processing your code...'}</p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300 bg-gradient-to-r from-indigo-600 to-purple-600"
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

export default Index;
