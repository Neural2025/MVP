import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Shield,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ChevronDown,
  ChevronRight,
  Copy,
  TestTube,
  Bug,
  Wrench,
  Github,
  Upload,
  Code2,
  Info
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisResults {
  security: string[];
  performance: string[];
  optimization: string[];
  functionality: string[];
  corrections?: string[];
  language?: string;
  sourceInfo?: {
    type: string;
    repository?: any;
    summary?: any;
  };
}

interface TestResults {
  tests?: string;
  fixes?: Array<{
    issue: string;
    fixedCode: string;
  }>;
  // New test execution format
  metadata?: {
    language: string;
    role: string;
    codeLength: number;
    purpose: string;
    executedAt: string;
    executedBy: string;
  };
  summary?: {
    totalTests: number;
    passed: number;
    failed: number;
    errors: number;
    passRate: number;
    coverage: number;
    executionTime: number;
    status: string;
  };
  testCases?: Array<{
    name: string;
    type: string;
    status: string;
    message: string;
    executionTime: number;
    details?: any;
    error?: string;
  }>;
  recommendations?: Array<{
    type: string;
    message: string;
    priority: string;
  }>;
  codeQuality?: {
    metrics: {
      complexity: number;
      maintainability: number;
      reliability: number;
      testability: number;
      overall: number;
    };
    grade: string;
    description: string;
  };
}

interface ResultsDashboardProps {
  analysisResults: AnalysisResults | null;
  testResults: TestResults | null;
}

const ResultsDashboard = ({ analysisResults, testResults }: ResultsDashboardProps) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getIssueIcon = (category: string) => {
    switch (category) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'optimization': return <Target className="h-4 w-4" />;
      case 'functionality': return <CheckCircle className="h-4 w-4" />;
      default: return <Bug className="h-4 w-4" />;
    }
  };

  const getIssueVariant = (category: string) => {
    switch (category) {
      case 'security': return 'destructive';
      case 'performance': return 'default';
      case 'optimization': return 'secondary';
      case 'functionality': return 'outline';
      default: return 'secondary';
    }
  };

  const renderIssueList = (issues: string[], category: string) => {
    if (!issues || issues.length === 0) {
      return (
        <div className="text-sm text-muted-foreground italic">
          No {category} issues found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div key={index} className="border rounded-lg p-3 bg-muted/30">
            <div className="flex items-start gap-2">
              {getIssueIcon(category)}
              <div className="flex-1">
                <p className="text-sm">{issue}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (!analysisResults && !testResults) {
    return (
      <Card className="h-fit animate-in slide-in-from-right-5 duration-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5 text-muted-foreground" />
            Analysis Results
          </CardTitle>
          <CardDescription>
            Results will appear here after code analysis
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <TestTube className="h-12 w-12 mx-auto mb-4 opacity-50 animate-pulse" />
            <p className="animate-in fade-in duration-1000 delay-500">Run code analysis to see results</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-fit animate-in slide-in-from-right-5 duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
            <CardDescription>
              AI-powered insights and recommendations
            </CardDescription>
          </div>
          {analysisResults?.language && (
            <Badge variant="outline" className="animate-in fade-in duration-300">
              {analysisResults.language}
            </Badge>
          )}
        </div>
        {analysisResults?.sourceInfo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground animate-in slide-in-from-top-2 duration-300">
            {analysisResults.sourceInfo.type === 'github' && (
              <>
                <Github className="h-3 w-3" />
                <span>From GitHub Repository</span>
              </>
            )}
            {analysisResults.sourceInfo.type === 'upload' && (
              <>
                <Upload className="h-3 w-3" />
                <span>From Uploaded Files</span>
              </>
            )}
            {analysisResults.sourceInfo.type === 'manual' && (
              <>
                <Code2 className="h-3 w-3" />
                <span>Manual Input</span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="analysis" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="analysis" disabled={!analysisResults}>
              Analysis
            </TabsTrigger>
            <TabsTrigger value="corrections" disabled={!analysisResults?.corrections}>
              Corrections
            </TabsTrigger>
            <TabsTrigger value="tests" disabled={!testResults}>
              Tests
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analysis" className="space-y-4 animate-in slide-in-from-bottom-3 duration-300">
            {analysisResults && (
              <div className="space-y-4">
                {/* Security Issues */}
                <Collapsible
                  open={openSections.security}
                  onOpenChange={() => toggleSection('security')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto transition-all duration-200 hover:scale-[1.02]">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant('security')} className="gap-1">
                          {getIssueIcon('security')}
                          Security ({analysisResults.security?.length || 0})
                        </Badge>
                      </div>
                      {openSections.security ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 animate-in slide-in-from-top-2 duration-200">
                    {renderIssueList(analysisResults.security, 'security')}
                  </CollapsibleContent>
                </Collapsible>

                {/* Performance Issues */}
                <Collapsible
                  open={openSections.performance}
                  onOpenChange={() => toggleSection('performance')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant('performance')} className="gap-1">
                          {getIssueIcon('performance')}
                          Performance ({analysisResults.performance?.length || 0})
                        </Badge>
                      </div>
                      {openSections.performance ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.performance, 'performance')}
                  </CollapsibleContent>
                </Collapsible>

                {/* Optimization Issues */}
                <Collapsible
                  open={openSections.optimization}
                  onOpenChange={() => toggleSection('optimization')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant('optimization')} className="gap-1">
                          {getIssueIcon('optimization')}
                          Optimization ({analysisResults.optimization?.length || 0})
                        </Badge>
                      </div>
                      {openSections.optimization ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.optimization, 'optimization')}
                  </CollapsibleContent>
                </Collapsible>

                {/* Functionality Issues */}
                <Collapsible
                  open={openSections.functionality}
                  onOpenChange={() => toggleSection('functionality')}
                >
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant('functionality')} className="gap-1">
                          {getIssueIcon('functionality')}
                          Functionality ({analysisResults.functionality?.length || 0})
                        </Badge>
                      </div>
                      {openSections.functionality ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.functionality, 'functionality')}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            )}
          </TabsContent>

          <TabsContent value="corrections" className="space-y-4 animate-in slide-in-from-bottom-3 duration-300">
            {analysisResults?.corrections && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Code Corrections & Improvements</h3>
                  <Badge variant="secondary">{analysisResults.corrections.length}</Badge>
                </div>

                <div className="space-y-3">
                  {analysisResults.corrections.map((correction, index) => (
                    <div
                      key={index}
                      className="border rounded-lg p-4 bg-muted/30 hover:bg-muted/50 transition-all duration-200 hover:scale-[1.01] animate-in slide-in-from-left-2"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center mt-0.5">
                          <span className="text-xs font-medium text-primary">{index + 1}</span>
                        </div>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed">{correction}</p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(correction)}
                          className="flex-shrink-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="bg-gradient-to-r from-primary/5 to-primary/10 rounded-lg p-4 border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Info className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">How to Apply Corrections</span>
                  </div>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Review each correction carefully in the context of your code</li>
                    <li>• Test changes in a development environment first</li>
                    <li>• Consider the impact on existing functionality</li>
                    <li>• Use version control to track your improvements</li>
                  </ul>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4 animate-in slide-in-from-bottom-3 duration-300">
            {testResults && (
              <div className="space-y-4">
                {/* Test Execution Results */}
                {testResults.summary && (
                  <>
                    {/* Test Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{testResults.summary.totalTests}</div>
                        <div className="text-sm text-blue-600">Total Tests</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{testResults.summary.passed}</div>
                        <div className="text-sm text-green-600">Passed</div>
                      </div>
                      <div className="text-center p-3 bg-red-50 dark:bg-red-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-red-600">{testResults.summary.failed}</div>
                        <div className="text-sm text-red-600">Failed</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{testResults.summary.passRate}%</div>
                        <div className="text-sm text-purple-600">Pass Rate</div>
                      </div>
                    </div>

                    {/* Test Cases */}
                    {testResults.testCases && testResults.testCases.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <TestTube className="h-4 w-4" />
                          Test Cases ({testResults.testCases.length})
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {testResults.testCases.map((test, index) => (
                            <div key={index} className={`p-3 rounded-lg border ${
                              test.status === 'PASSED' || test.status === 'passed' ? 'bg-green-50 dark:bg-green-950/30 border-green-200' :
                              test.status === 'FAILED' || test.status === 'failed' ? 'bg-red-50 dark:bg-red-950/30 border-red-200' :
                              'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-200'
                            }`}>
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-sm">{test.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Badge variant={
                                    test.status === 'PASSED' || test.status === 'passed' ? 'default' :
                                    test.status === 'FAILED' || test.status === 'failed' ? 'destructive' :
                                    'secondary'
                                  }>
                                    {test.status.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">{test.executionTime}ms</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground mb-1">{test.message}</p>
                              {test.type && (
                                <Badge variant="outline" className="text-xs">
                                  {test.type}
                                </Badge>
                              )}
                              {test.error && (
                                <div className="mt-2 p-2 bg-red-100 dark:bg-red-950/50 border border-red-200 rounded text-sm text-red-700 dark:text-red-300">
                                  <strong>Error:</strong> {test.error}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommendations */}
                    {testResults.recommendations && testResults.recommendations.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Target className="h-4 w-4" />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {testResults.recommendations.map((rec, index) => (
                            <div key={index} className={`p-3 rounded-lg ${
                              rec.type === 'error' ? 'bg-red-50 dark:bg-red-950/30 border border-red-200' :
                              rec.type === 'warning' ? 'bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200' :
                              rec.type === 'success' ? 'bg-green-50 dark:bg-green-950/30 border border-green-200' :
                              'bg-blue-50 dark:bg-blue-950/30 border border-blue-200'
                            }`}>
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant={
                                  rec.priority === 'high' ? 'destructive' :
                                  rec.priority === 'medium' ? 'default' :
                                  'secondary'
                                }>
                                  {rec.priority?.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm">{rec.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Quality */}
                    {testResults.codeQuality && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Code Quality Assessment
                        </h4>
                        <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg">
                          <div className={`text-4xl font-bold mb-2 ${
                            testResults.codeQuality.grade === 'A' ? 'text-green-600' :
                            testResults.codeQuality.grade === 'B' ? 'text-blue-600' :
                            testResults.codeQuality.grade === 'C' ? 'text-yellow-600' :
                            'text-red-600'
                          }`}>
                            {testResults.codeQuality.grade}
                          </div>
                          <p className="text-muted-foreground">{testResults.codeQuality.description}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-muted/50 rounded">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.complexity || 0}</div>
                            <div className="text-sm text-muted-foreground">Complexity</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.maintainability || 0}</div>
                            <div className="text-sm text-muted-foreground">Maintainability</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.reliability || 0}</div>
                            <div className="text-sm text-muted-foreground">Reliability</div>
                          </div>
                          <div className="text-center p-3 bg-muted/50 rounded">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.testability || 0}</div>
                            <div className="text-sm text-muted-foreground">Testability</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Legacy Test Results (for backward compatibility) */}
                {testResults.tests && !testResults.summary && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2">
                        <TestTube className="h-4 w-4" />
                        Generated Test Suite
                      </h4>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(testResults.tests!)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-muted rounded-lg p-4">
                      <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                        {testResults.tests}
                      </pre>
                    </div>
                  </div>
                )}

                {/* Code Fixes */}
                {testResults.fixes && testResults.fixes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2">
                      <Wrench className="h-4 w-4" />
                      Suggested Fixes ({testResults.fixes.length})
                    </h4>
                    <div className="space-y-3">
                      {testResults.fixes.map((fix, index) => (
                        <div key={index} className="border rounded-lg p-4 space-y-3">
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5" />
                            <div>
                              <p className="font-medium text-sm">{fix.issue}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">Fixed Code:</span>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(fix.fixedCode)}
                              >
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-muted rounded-lg p-3">
                              <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">
                                {fix.fixedCode}
                              </pre>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ResultsDashboard;
