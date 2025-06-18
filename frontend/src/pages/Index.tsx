import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import useStatsTracking from "@/hooks/useStatsTracking";
import { triggerDashboardRefresh } from "@/utils/dashboardRefresh";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Code,
  Upload,
  Github,
  Brain,
  Loader2,
  Key,
  Search,
  CheckCircle,
  XCircle,
  Moon,
  Sun,
  User,
  LogOut,
  Download,
  FileJson,
  FileImage,
  TestTube,
  Bug,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";
import { toast } from "sonner";
import { analyzeCode, generateTests } from "@/lib/api";
import CodeEditor from "@/components/CodeEditor";
import ResultsDashboard from "@/components/ResultsDashboard";

const Index = () => {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const { trackCodeAnalysis, trackTestGeneration, trackBugReport } = useStatsTracking();

  // App state
  const [currentStep, setCurrentStep] = useState('role-selection');
  const [selectedRole, setSelectedRole] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Input states
  const [inputMethod, setInputMethod] = useState('paste');
  const [code, setCode] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [purpose, setPurpose] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');
  const [apiKey, setApiKey] = useState('');
  const [apiKeyStatus, setApiKeyStatus] = useState('');

  // Loading states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isGeneratingTests, setIsGeneratingTests] = useState(false);
  const [isTestingApiKey, setIsTestingApiKey] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStatus, setLoadingStatus] = useState('');

  // Results
  const [analysisResults, setAnalysisResults] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [showResults, setShowResults] = useState(false);

  // Test execution states
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [testRole, setTestRole] = useState('developer');

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

  // API Key testing
  const testApiKey = async () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    setIsTestingApiKey(true);
    try {
      const response = await fetch('/api/test-api-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const result = await response.json();

      if (result.status === 'success') {
        setApiKeyStatus('valid');
        toast.success('✅ API Key is valid and working!');
      } else {
        setApiKeyStatus('invalid');
        toast.error(`❌ ${result.error}`);
      }
    } catch (error) {
      setApiKeyStatus('invalid');
      toast.error('❌ Failed to test API key');
    } finally {
      setIsTestingApiKey(false);
    }
  };

  // Handle code analysis
  const handleAnalyze = async () => {
    if (!code.trim() && !githubUrl.trim()) {
      toast.error('Please provide code to analyze');
      return;
    }

    if (!purpose.trim()) {
      toast.error('Please describe what your code is supposed to do');
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

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      setLoadingStatus('Analysis complete!');

      const result = await response.json();

      if (result.status === 'success') {
        setAnalysisResults(result.data);
        setShowResults(true);

        // Track successful analysis
        trackCodeAnalysis(code.trim(), selectedLanguage, true);

        // Trigger dashboard refresh
        triggerDashboardRefresh();

        console.log('Analysis results set:', result.data);
        toast.success('🎉 Code analysis completed successfully! Test panel should now be visible.');
      } else {
        // Track failed analysis
        trackCodeAnalysis(code.trim(), selectedLanguage, false);
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

  // Handle test execution
  const handleRunTests = async () => {
    if (!code.trim() && !githubUrl.trim()) {
      toast.error('Please provide code to test');
      return;
    }

    setIsRunningTests(true);
    setLoadingProgress(0);
    setLoadingStatus('Executing tests...');

    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => Math.min(prev + 15, 90));
      }, 300);

      setLoadingStatus('Running test suites...');

      const response = await fetch('/api/execute-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code.trim(),
          purpose: purpose.trim(),
          githubUrl: githubUrl.trim(),
          language: selectedLanguage,
          role: testRole
        }),
      });

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setLoadingStatus('Tests completed!');

      const result = await response.json();

      if (result.status === 'success') {
        setTestResults(result.data);

        // Track test execution
        trackTestGeneration();

        // Trigger dashboard refresh
        triggerDashboardRefresh();

        const passRate = Math.round((result.data.summary.passed / result.data.summary.totalTests) * 100);
        toast.success(`🧪 Tests executed! ${result.data.summary.passed}/${result.data.summary.totalTests} passed (${passRate}%)`);
      } else {
        toast.error(`❌ Test execution failed: ${result.error}`);
      }
    } catch (error) {
      toast.error('❌ Failed to execute tests. Please try again.');
      console.error('Test execution error:', error);
    } finally {
      setIsRunningTests(false);
      setLoadingProgress(0);
      setLoadingStatus('');
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
                  Generate comprehensive test cases and security assessments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-purple-300">
                  <div className="flex items-center gap-2">
                    <TestTube className="h-4 w-4" />
                    <span>Test Case Generation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4" />
                    <span>Security Testing</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4" />
                    <span>Edge Case Detection</span>
                  </div>
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
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    <span>Feature Validation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics & Reports</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileJson className="h-4 w-4" />
                    <span>Export Capabilities</span>
                  </div>
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
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-lg bg-white/80 dark:bg-slate-900/80 border-b border-gray-200 dark:border-slate-700">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Brain className="h-8 w-8 text-indigo-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AI QA Assistant
              </span>
            </div>

            {/* Language Selector */}
            <div className="flex-1 flex justify-center">
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger className="w-48">
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

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="rounded-full"
              >
                {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>

              {/* User Menu */}
              <div className="flex items-center gap-3">
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
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
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
                      webkitdirectory=""
                      directory=""
                      onChange={handleFileUpload}
                      className="hidden"
                      id="folder-upload"
                    />
                    <Button
                      variant="outline"
                      onClick={() => document.getElementById('folder-upload')?.click()}
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

              {/* API Key Testing */}
              <div className="space-y-4 p-4 bg-gray-50 dark:bg-slate-700/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-indigo-600" />
                  <span className="font-medium">API Key Testing</span>
                </div>
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Key className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="Enter DeepSeek API Key to Test"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button
                    onClick={testApiKey}
                    disabled={isTestingApiKey || !apiKey.trim()}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    {isTestingApiKey ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                    Test API Key
                  </Button>
                </div>
                {apiKeyStatus && (
                  <div className={`flex items-center gap-2 text-sm ${
                    apiKeyStatus === 'valid' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {apiKeyStatus === 'valid' ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <XCircle className="h-4 w-4" />
                    )}
                    {apiKeyStatus === 'valid' ? 'API Key is valid' : 'API Key is invalid'}
                  </div>
                )}
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
            {/* Analysis Results */}
            <ResultsDashboard
              analysisResults={analysisResults}
              testResults={testResults}
            />

            {/* Test Execution Panel - RIGHT AFTER ANALYSIS RESULTS */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30 border-4 border-emerald-400 dark:border-emerald-400 shadow-2xl animate-pulse">
              <CardHeader className="bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/50 dark:to-teal-900/50">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <TestTube className="h-8 w-8 text-emerald-600 animate-bounce" />
                  🧪 EXECUTE TEST SUITES - READY!
                </CardTitle>
                <CardDescription className="text-emerald-700 dark:text-emerald-300 font-bold text-lg">
                  ✅ Code analyzed! Now run comprehensive tests to find bugs and issues
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  {/* Test Role Selection */}
                  <div className="md:col-span-3">
                    <label className="text-sm font-medium mb-2 block">Choose Test Type</label>
                    <div className="flex gap-2">
                      <Button
                        variant={testRole === 'developer' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTestRole('developer')}
                        className="flex-1"
                      >
                        👨‍💻 Developer Tests
                      </Button>
                      <Button
                        variant={testRole === 'tester' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTestRole('tester')}
                        className="flex-1"
                      >
                        🧪 Tester Tests
                      </Button>
                      <Button
                        variant={testRole === 'product_manager' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setTestRole('product_manager')}
                        className="flex-1"
                      >
                        📊 Product Manager Tests
                      </Button>
                    </div>
                  </div>

                  {/* Run Tests Button */}
                  <div className="md:col-span-1 flex items-end">
                    <Button
                      onClick={handleRunTests}
                      disabled={isRunningTests || (!code.trim() && !githubUrl.trim())}
                      className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-600 hover:via-teal-600 hover:to-cyan-600 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300 text-lg py-3"
                    >
                      {isRunningTests ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin mr-2" />
                          Running...
                        </>
                      ) : (
                        <>
                          <TestTube className="h-5 w-5 mr-2" />
                          Execute Tests
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {/* Test Results Summary */}
                {testResults && testResults.summary && (
                  <div className="mt-4 p-4 bg-white dark:bg-slate-800 rounded-lg border">
                    <h4 className="font-medium text-sm mb-3">Latest Test Results</h4>
                    <div className="grid grid-cols-4 gap-3 text-center">
                      <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded">
                        <div className="font-bold text-blue-600">{testResults.summary.totalTests}</div>
                        <div className="text-blue-600 text-xs">Total</div>
                      </div>
                      <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded">
                        <div className="font-bold text-green-600">{testResults.summary.passed}</div>
                        <div className="text-green-600 text-xs">Passed</div>
                      </div>
                      <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded">
                        <div className="font-bold text-red-600">{testResults.summary.failed}</div>
                        <div className="text-red-600 text-xs">Failed</div>
                      </div>
                      <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded">
                        <div className="font-bold text-purple-600">{testResults.summary.passRate}%</div>
                        <div className="text-purple-600 text-xs">Pass Rate</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {(isAnalyzing || isGeneratingTests || isRunningTests) && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <Card className="w-96 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="relative mb-6">
                {isRunningTests ? (
                  <TestTube className="h-16 w-16 text-emerald-600 animate-pulse mx-auto" />
                ) : (
                  <Brain className="h-16 w-16 text-indigo-600 animate-pulse mx-auto" />
                )}
                <div className={`absolute inset-0 ${
                  isRunningTests ? 'bg-gradient-to-r from-emerald-400 to-teal-400' : 'bg-gradient-to-r from-indigo-400 to-purple-400'
                } rounded-full blur-xl opacity-30 animate-ping`}></div>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {isAnalyzing ? 'Analyzing with DeepSeek AI...' :
                 isRunningTests ? 'Executing Test Suites...' : 'Generating Tests...'}
              </h3>
              <p className="text-muted-foreground mb-4">{loadingStatus || 'Processing your code...'}</p>
              <div className="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    isRunningTests ? 'bg-gradient-to-r from-emerald-600 to-teal-600' : 'bg-gradient-to-r from-indigo-600 to-purple-600'
                  }`}
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
