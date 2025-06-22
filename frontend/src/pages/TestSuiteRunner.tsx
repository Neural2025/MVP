import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, Download, Loader2 } from 'lucide-react';

const suiteLabels: Record<string, string> = {
  functionality: 'Functionality Testing',
  security: 'Security Testing',
  bias: 'Bias Testing',
};

const languageOptions = ['javascript', 'python', 'java', 'c++', 'go'];

const TestSuiteRunner: React.FC = () => {
  const { suiteType } = useParams<{ suiteType: string }>();
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [language, setLanguage] = useState(languageOptions[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [tab, setTab] = useState('analysis');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResults(null);
    // Simulate API call
    setTimeout(() => {
      const simulatedResults = {
        analysis: `Analysis results for ${suiteLabels[suiteType ?? 'functionality']}`,
        tests: `Test results for ${suiteLabels[suiteType ?? 'functionality']}`,
        recommendations: ['Improve input validation', 'Add more test cases'],
      };
      setResults(simulatedResults);
      setIsLoading(false);

      // --- Bug Reporting Integration for Testers ---
      const token = localStorage.getItem('token');
      let bugsReported = 0;
      if (token) {
        // Treat each recommendation as a bug
        if (Array.isArray(simulatedResults.recommendations)) {
          simulatedResults.recommendations.forEach((rec: string) => {
            fetch('/api/bug-reports', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({
                title: `${suiteLabels[suiteType ?? 'functionality']} Recommendation`,
                description: rec,
                severity: 'medium',
                status: 'open',
                language,
                source: 'test',
              })
            }).then(() => {}).catch(() => {});
            bugsReported++;
          });
        }
      }
      if (bugsReported > 0) {
        // Optionally notify the tester
        // toast.info(`${bugsReported} bugs reported from test suite and saved as 'open'.`);
      }
      // --- End Bug Reporting Integration ---
    }, 1200);
  };

  const handleDownload = () => {
    const content = `Purpose: ${purpose}\nLanguage: ${language}\nCode:\n${code}\n\nResults:\n${JSON.stringify(results, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suiteType}-test-suite-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{suiteLabels[suiteType ?? 'functionality'] || 'Test Suite'}</CardTitle>
          <CardDescription>
            Paste your code and describe its purpose. Analyze and generate tests specific to this suite.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="text-sm font-medium mb-2 block">Purpose/Description</label>
            <Input
              placeholder="Describe what your code does..."
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Programming Language</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={language}
              onChange={e => setLanguage(e.target.value)}
            >
              {languageOptions.map(lang => (
                <option key={lang} value={lang}>{lang}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-2 block">Code</label>
            <Textarea
              placeholder="Paste your code here..."
              value={code}
              onChange={e => setCode(e.target.value)}
              rows={10}
              className="font-mono text-sm"
            />
          </div>
          <Button
            onClick={handleAnalyze}
            disabled={isLoading || !code}
            className="w-full"
            size="lg"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analyze & Generate Tests
              </>
            )}
          </Button>

          {results && (
            <Tabs value={tab} onValueChange={setTab} className="mt-6">
              <TabsList>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="analysis">
                <pre className="bg-gray-900 text-white rounded p-4 whitespace-pre-wrap">{results.analysis}</pre>
              </TabsContent>
              <TabsContent value="tests">
                <pre className="bg-gray-900 text-white rounded p-4 whitespace-pre-wrap">{results.tests}</pre>
              </TabsContent>
              <TabsContent value="recommendations">
                <ul className="list-disc pl-6">
                  {results.recommendations.map((rec: string, idx: number) => (
                    <li key={idx}>{rec}</li>
                  ))}
                </ul>
              </TabsContent>
            </Tabs>
          )}

          {results && (
            <Button variant="outline" onClick={handleDownload} className="w-full mt-4">
              <Download className="mr-2 h-4 w-4" />
              Download Report
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TestSuiteRunner;
