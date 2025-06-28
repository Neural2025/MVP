import { useState, useEffect } from "react";
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
  ChevronDown,
  ChevronRight,
  Copy,
  TestTube,
  Github,
  Upload,
  Code2,
} from "lucide-react";
import { toast } from "sonner";

interface AnalysisResults {
  security: string[];
  performance: string[];
  optimization: string[];
  functionality: string[];
  corrections?: string[];
  fixedCode?: string;
  language?: string;
  sourceInfo?: {
    type: string;
    repository?: any;
    summary?: any;
  };
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

interface TestResults {
  tests?: string;
  fixes?: Array<{
    issue: string;
    fixedCode: string;
  }>;
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
  const [activeTab, setActiveTab] = useState("analysis");
  const [showFix, setShowFix] = useState(false);

  useEffect(() => {
    if (analysisResults && analysisResults.fixedCode) {
      setShowFix(true);
    }
  }, [analysisResults]);

  const toggleSection = (section: string) => {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getIssueIcon = (category: string) => {
    switch (category) {
      case "security":
        return <Shield className="h-4 w-4" />;
      case "performance":
        return <Zap className="h-4 w-4" />;
      case "optimization":
        return <Target className="h-4 w-4" />;
      case "functionality":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <TestTube className="h-4 w-4" />;
    }
  };

  const getIssueVariant = (category: string) => {
    switch (category) {
      case "security":
        return "destructive";
      case "performance":
        return "default";
      case "optimization":
        return "secondary";
      case "functionality":
        return "outline";
      default:
        return "secondary";
    }
  };

  const renderIssueList = (issues: string[], category: string) => {
    if (!issues || issues.length === 0) {
      return (
        <div className="text-sm text-gray-700 italic">
          No {category} issues found
        </div>
      );
    }

    return (
      <div className="space-y-3">
        {issues.map((issue, index) => (
          <div key={index} className="border border-black rounded-lg p-3 bg-white text-black">
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
          <CardDescription>Results will appear here after code analysis</CardDescription>
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

  const fixedCode = analysisResults?.fixedCode || null;

  return (
    <Card className="h-fit animate-in slide-in-from-right-5 duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <TestTube className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
            <CardDescription>AI-powered insights and recommendations</CardDescription>
          </div>
          {analysisResults?.language && (
            <Badge variant="outline" className="animate-in fade-in duration-300">
              {analysisResults.language}
            </Badge>
          )}
        </div>
        {analysisResults?.sourceInfo && (
          <div className="bg-white rounded-lg p-4 space-y-3 border border-black">
            {analysisResults.sourceInfo.type === "github" && (
              <>
                <Github className="h-3 w-3" />
                <span>From GitHub Repository</span>
              </>
            )}
            {analysisResults.sourceInfo.type === "upload" && (
              <>
                <Upload className="h-3 w-3" />
                <span>From Uploaded Files</span>
              </>
            )}
            {analysisResults.sourceInfo.type === "manual" && (
              <>
                <Code2 className="h-3 w-3" />
                <span>Manual Input</span>
              </>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
            <TabsTrigger value="tests">Test Results</TabsTrigger>
          </TabsList>
          <TabsContent value="analysis" className="space-y-4">
            {analysisResults && (
              <div className="space-y-4">
                {/* Security Issues */}
                <Collapsible open={openSections.security} onOpenChange={() => toggleSection("security")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant("security")} className="gap-1">
                          {getIssueIcon("security")}
                          Security ({analysisResults.security?.length || 0})
                        </Badge>
                      </div>
                      {openSections.security ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.security, "security")}
                  </CollapsibleContent>
                </Collapsible>

                {/* Performance Issues */}
                <Collapsible open={openSections.performance} onOpenChange={() => toggleSection("performance")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant("performance")} className="gap-1">
                          {getIssueIcon("performance")}
                          Performance ({analysisResults.performance?.length || 0})
                        </Badge>
                      </div>
                      {openSections.performance ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.performance, "performance")}
                  </CollapsibleContent>
                </Collapsible>

                {/* Optimization Issues */}
                <Collapsible open={openSections.optimization} onOpenChange={() => toggleSection("optimization")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant("optimization")} className="gap-1">
                          {getIssueIcon("optimization")}
                          Optimization ({analysisResults.optimization?.length || 0})
                        </Badge>
                      </div>
                      {openSections.optimization ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.optimization, "optimization")}
                  </CollapsibleContent>
                </Collapsible>

                {/* Functionality Issues */}
                <Collapsible open={openSections.functionality} onOpenChange={() => toggleSection("functionality")}>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full justify-between p-0 h-auto">
                      <div className="flex items-center gap-2">
                        <Badge variant={getIssueVariant("functionality")} className="gap-1">
                          {getIssueIcon("functionality")}
                          Functionality ({analysisResults.functionality?.length || 0})
                        </Badge>
                      </div>
                      {openSections.functionality ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3">
                    {renderIssueList(analysisResults.functionality, "functionality")}
                  </CollapsibleContent>
                </Collapsible>

                {/* Apply Fix Button */}
                <div className="mt-8 flex flex-col items-center">
                  <Button
                    type="button"
                    className="bg-black text-white mb-4"
                    disabled={!fixedCode}
                    onClick={() => setShowFix((prev) => !prev)}
                  >
                    {showFix ? "Hide Fix" : "Apply Fix"}
                  </Button>
                  {showFix && fixedCode && (
                    <div className="w-full max-w-3xl">
                      <h4 className="text-lg font-semibold mb-2 text-black">Corrected Code</h4>
                      <pre className="bg-white p-4 border border-black text-black">
                        {fixedCode}
                      </pre>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={() => copyToClipboard(fixedCode)}
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                  )}
                  {showFix && !fixedCode && (
                    <div className="text-black">No fix available for this code.</div>
                  )}
                </div>

                {/* Code Quality */}
                {analysisResults?.codeQuality && (
                  <div className="space-y-3">
                    <h4 className="font-medium flex items-center gap-2 text-black">
                      <Shield className="h-4 w-4" />
                      Code Quality Assessment
                    </h4>
                    <div className="text-center p-4 bg-white border border-black">
                      <div className="text-4xl font-bold mb-2 text-black">
                        {analysisResults.codeQuality.grade}
                      </div>
                      <p className="text-black">{analysisResults.codeQuality.description}</p>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="font-semibold">{analysisResults.codeQuality.metrics?.complexity || 0}</div>
                        <div className="text-sm text-black">Complexity</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="font-semibold">{analysisResults.codeQuality.metrics?.maintainability || 0}</div>
                        <div className="text-sm text-black">Maintainability</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="font-semibold">{analysisResults.codeQuality.metrics?.reliability || 0}</div>
                        <div className="text-sm text-black">Reliability</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="font-semibold">{analysisResults.codeQuality.metrics?.testability || 0}</div>
                        <div className="text-sm text-black">Testability</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tests" className="space-y-4">
            {testResults && (
              <div className="space-y-4">
                {/* Test Execution Results */}
                {testResults.summary && (
                  <>
                    {/* Test Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="text-2xl font-bold text-black">{testResults.summary.totalTests}</div>
                        <div className="text-sm text-black">Total Tests</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="text-2xl font-bold text-black">{testResults.summary.passed}</div>
                        <div className="text-sm text-black">Passed</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="text-2xl font-bold text-black">{testResults.summary.failed}</div>
                        <div className="text-sm text-black">Failed</div>
                      </div>
                      <div className="text-center p-3 bg-white rounded border border-black text-black">
                        <div className="text-2xl font-bold text-black">{testResults.summary.passRate}%</div>
                        <div className="text-sm text-black">Pass Rate</div>
                      </div>
                    </div>

                    {/* Test Cases */}
                    {testResults.testCases && testResults.testCases.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-black">
                          <TestTube className="h-4 w-4" />
                          Test Cases ({testResults.testCases.length})
                        </h4>
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                          {testResults.testCases.map((test, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg border border-black bg-white text-black"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-sm text-black">{test.name}</h5>
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-black">
                                    {test.status.toUpperCase()}
                                  </Badge>
                                  <span className="text-xs text-black">{test.executionTime}ms</span>
                                </div>
                              </div>
                              <p className="text-sm text-black space-y-1">{test.message}</p>
                              {test.type && (
                                <Badge variant="outline" className="text-xs text-black">
                                  {test.type}
                                </Badge>
                              )}
                              {test.error && (
                                <div className="mt-2 p-2 bg-white border border-black text-black">
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
                        <h4 className="font-medium flex items-center gap-2 text-black">
                          <Target className="h-4 w-4" />
                          Recommendations
                        </h4>
                        <div className="space-y-2">
                          {testResults.recommendations.map((rec, index) => (
                            <div
                              key={index}
                              className="p-3 rounded-lg border border-black bg-white text-black"
                            >
                              <div className="flex items-center gap-2 mb-1">
                                <Badge variant="outline" className="text-black">
                                  {rec.priority.toUpperCase()}
                                </Badge>
                              </div>
                              <p className="text-sm text-black">{rec.message}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Code Quality */}
                    {testResults.codeQuality && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2 text-black">
                          <Shield className="h-4 w-4" />
                          Code Quality Assessment
                        </h4>
                        <div className="text-center p-4 bg-white border border-black text-black">
                          <div className="text-4xl font-bold mb-2 text-black">
                            {testResults.codeQuality.grade}
                          </div>
                          <p className="text-black">{testResults.codeQuality.description}</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div className="text-center p-3 bg-white rounded border border-black text-black">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.complexity || 0}</div>
                            <div className="text-sm text-black">Complexity</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border border-black text-black">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.maintainability || 0}</div>
                            <div className="text-sm text-black">Maintainability</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border border-black text-black">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.reliability || 0}</div>
                            <div className="text-sm text-black">Reliability</div>
                          </div>
                          <div className="text-center p-3 bg-white rounded border border-black text-black">
                            <div className="font-semibold">{testResults.codeQuality.metrics?.testability || 0}</div>
                            <div className="text-sm text-black">Testability</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Legacy Test Results */}
                {testResults.tests && !testResults.summary && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium flex items-center gap-2 text-black">
                        <TestTube className="h-4 w-4" />
                        Generated Test Suite
                      </h4>
                      <Button variant="outline" size="sm" onClick={() => copyToClipboard(testResults.tests!)}>
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                    </div>
                    <div className="bg-white rounded border border-black text-black">
                      <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">{testResults.tests}</pre>
                    </div>
                  </div>
                )}

                {/* Code Fixes */}
                {testResults.fixes && testResults.fixes.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium flex items-center gap-2 text-black">
                      <AlertTriangle className="h-4 w-4" />
                      Suggested Fixes ({testResults.fixes.length})
                    </h4>
                    <div className="space-y-3">
                      {testResults.fixes.map((fix, index) => (
                        <div
                          key={index}
                          className="border border-black rounded-lg p-4 bg-white text-black"
                        >
                          <div className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-black mt-0.5" />
                            <div>
                              <p className="font-medium text-sm text-black">{fix.issue}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-black">Fixed Code:</span>
                              <Button variant="outline" size="sm" onClick={() => copyToClipboard(fix.fixedCode)}>
                                <Copy className="h-3 w-3 mr-1" />
                                Copy
                              </Button>
                            </div>
                            <div className="bg-white rounded border border-black text-black">
                              <pre className="text-sm overflow-x-auto whitespace-pre-wrap font-mono">{fix.fixedCode}</pre>
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