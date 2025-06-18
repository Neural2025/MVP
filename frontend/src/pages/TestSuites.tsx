import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { triggerDashboardRefresh } from '@/utils/dashboardRefresh';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Code,
  TestTube,
  Shield,
  Zap,
  User,
  Bug,
  Play,
  Download,
  FileText,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Target
} from 'lucide-react';
import { toast } from 'sonner';

const TestSuites = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [githubUrl, setGithubUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeRole, setActiveRole] = useState(user?.role || 'developer');

  const roles = [
    {
      id: 'developer',
      name: 'Developer',
      icon: Code,
      description: 'Unit tests, Integration tests, Code quality',
      color: 'bg-blue-500'
    },
    {
      id: 'tester',
      name: 'Tester',
      icon: TestTube,
      description: 'Functional tests, System tests, Security tests',
      color: 'bg-green-500'
    },
    {
      id: 'product_manager',
      name: 'Product Manager',
      icon: User,
      description: 'Business logic, User stories, Bug identification',
      color: 'bg-purple-500'
    }
  ];

  const languages = [
    'javascript', 'python', 'java', 'typescript', 'csharp', 'cpp', 'php', 'ruby', 'go', 'rust',
    'swift', 'kotlin', 'scala', 'dart', 'r', 'matlab', 'perl', 'lua', 'haskell', 'clojure',
    'elixir', 'erlang', 'fsharp', 'vb', 'cobol', 'fortran', 'assembly', 'sql', 'html', 'css'
  ];

  const generateRoleBasedTests = async () => {
    if (!code.trim() && !githubUrl.trim()) {
      toast.error('Please provide code or GitHub URL');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/execute-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          code,
          purpose,
          language,
          role: activeRole,
          githubUrl
        })
      });

      const data = await response.json();

      if (data.status === 'success') {
        setTestResults(data.data);

        // Trigger dashboard refresh
        triggerDashboardRefresh();

        const passRate = Math.round((data.data.summary.passed / data.data.summary.totalTests) * 100);
        toast.success(`Tests executed! ${data.data.summary.passed}/${data.data.summary.totalTests} passed (${passRate}%)`);
      } else {
        toast.error(data.error || 'Failed to execute tests');
      }
    } catch (error) {
      toast.error('Network error occurred');
      console.error('Test generation error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTests = () => {
    if (!testResults) return;

    const content = JSON.stringify(testResults, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeRole}_test_suite_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderTestSection = (title, tests, icon: any) => {
    const Icon = icon;
    if (!tests || tests.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.isArray(tests) ? tests.map((test, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <p className="text-sm">{test}</p>
              </div>
            )) : (
              <div className="p-3 bg-muted rounded-lg">
                <pre className="text-sm whitespace-pre-wrap">{tests}</pre>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Role-Based Test Suites</h1>
        <p className="text-muted-foreground">
          Generate comprehensive test suites tailored to your role and requirements
        </p>
      </div>

      {/* Role Selection */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {roles.map((role) => {
          const Icon = role.icon;
          return (
            <Card
              key={role.id}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 ${
                activeRole === role.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setActiveRole(role.id)}
            >
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center mx-auto mb-3`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-semibold mb-2">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description}</p>
                {activeRole === role.id && (
                  <Badge className="mt-2">Selected</Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Input Section */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Code Input</CardTitle>
              <CardDescription>
                Provide your code for {roles.find(r => r.id === activeRole)?.name.toLowerCase()} testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Programming Language</label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Purpose/Description</label>
                <Input
                  placeholder="Describe what your code does..."
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">GitHub URL (Optional)</label>
                <Input
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Code</label>
                <Textarea
                  placeholder="Paste your code here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  rows={12}
                  className="font-mono text-sm"
                />
              </div>

              <Button
                onClick={generateRoleBasedTests}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <Clock className="mr-2 h-4 w-4 animate-spin" />
                    Executing Tests...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Execute {roles.find(r => r.id === activeRole)?.name} Tests
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Results Section */}
        <div className="space-y-6">
          {testResults ? (
            <>
              {/* Test Summary */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {testResults.summary?.status === 'PASSED' ? (
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      ) : (
                        <XCircle className="h-5 w-5 text-red-500" />
                      )}
                      Test Execution Report
                    </CardTitle>
                    <Button onClick={downloadTests} variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download Report
                    </Button>
                  </div>
                  <CardDescription>
                    {testResults.metadata?.role} tests for {testResults.metadata?.language} code
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{testResults.summary?.totalTests || 0}</div>
                      <div className="text-sm text-blue-600">Total Tests</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{testResults.summary?.passed || 0}</div>
                      <div className="text-sm text-green-600">Passed</div>
                    </div>
                    <div className="text-center p-4 bg-red-50 rounded-lg">
                      <div className="text-2xl font-bold text-red-600">{testResults.summary?.failed || 0}</div>
                      <div className="text-sm text-red-600">Failed</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">{testResults.summary?.passRate || 0}%</div>
                      <div className="text-sm text-purple-600">Pass Rate</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">{testResults.summary?.coverage || 0}%</div>
                      <div className="text-sm text-gray-600">Coverage</div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 rounded">
                      <div className="font-semibold">{testResults.summary?.executionTime || 0}ms</div>
                      <div className="text-sm text-gray-600">Execution Time</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Test Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="h-5 w-5" />
                    Test Cases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {testResults.testCases?.map((test, index) => (
                      <div key={index} className={`p-4 rounded-lg border ${
                        test.status === 'PASSED' ? 'bg-green-50 border-green-200' :
                        test.status === 'FAILED' ? 'bg-red-50 border-red-200' :
                        'bg-yellow-50 border-yellow-200'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{test.name}</h4>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              test.status === 'PASSED' ? 'bg-green-100 text-green-800' :
                              test.status === 'FAILED' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {test.status}
                            </span>
                            <span className="text-xs text-gray-500">{test.executionTime}ms</span>
                          </div>
                        </div>
                        <p className="text-sm text-gray-700 mb-2">{test.message}</p>
                        {test.type && (
                          <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                            {test.type}
                          </span>
                        )}
                        {test.error && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                            <strong>Error:</strong> {test.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recommendations */}
              {testResults.recommendations && testResults.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {testResults.recommendations.map((rec, index) => (
                        <div key={index} className={`p-3 rounded-lg ${
                          rec.type === 'error' ? 'bg-red-50 border border-red-200' :
                          rec.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
                          rec.type === 'success' ? 'bg-green-50 border border-green-200' :
                          'bg-blue-50 border border-blue-200'
                        }`}>
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                              rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {rec.priority?.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm">{rec.message}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Code Quality */}
              {testResults.codeQuality && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Code Quality Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-4">
                      <div className={`text-4xl font-bold mb-2 ${
                        testResults.codeQuality.grade === 'A' ? 'text-green-600' :
                        testResults.codeQuality.grade === 'B' ? 'text-blue-600' :
                        testResults.codeQuality.grade === 'C' ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {testResults.codeQuality.grade}
                      </div>
                      <p className="text-gray-600">{testResults.codeQuality.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-semibold">{testResults.codeQuality.metrics?.complexity || 0}</div>
                        <div className="text-sm text-gray-600">Complexity</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-semibold">{testResults.codeQuality.metrics?.maintainability || 0}</div>
                        <div className="text-sm text-gray-600">Maintainability</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-semibold">{testResults.codeQuality.metrics?.reliability || 0}</div>
                        <div className="text-sm text-gray-600">Reliability</div>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded">
                        <div className="font-semibold">{testResults.codeQuality.metrics?.testability || 0}</div>
                        <div className="text-sm text-gray-600">Testability</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Tests Executed Yet</h3>
                <p className="text-muted-foreground">
                  Execute tests to see detailed results and reports here
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestSuites;
