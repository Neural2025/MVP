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

// Removed unused languageOptions

const TestSuiteRunner: React.FC = () => {
  const { suiteType } = useParams<{ suiteType: string }>();
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [inputType, setInputType] = useState<'paste' | 'github' | 'folder'>('paste');
  const [githubUrl, setGithubUrl] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any>(null);
  const [tab, setTab] = useState('analysis');

  const handleAnalyze = async () => {
    setIsLoading(true);
    setResults(null);
    try {
      const token = localStorage.getItem('token');
      let response;
      if (inputType === 'paste') {
        response = await fetch('/api/execute-tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            code,
            purpose,
            role: 'tester',
          })
        });
      } else if (inputType === 'github') {
        response = await fetch('/api/execute-tests', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: JSON.stringify({
            githubUrl,
            purpose,
            role: 'tester',
          })
        });
      } else if (inputType === 'folder' && files) {
        const formData = new FormData();
        Array.from(files).forEach(file => formData.append('files', file));
        formData.append('purpose', purpose);
        formData.append('role', 'tester');
        response = await fetch('/api/execute-tests', {
          method: 'POST',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          body: formData
        });
      } else {
        setResults({ error: 'No input provided.' });
        setIsLoading(false);
        return;
      }
      const data = await response.json();
      if (data.status === 'success') {
        setResults(data.data);
      } else {
        setResults({ error: data.error || 'Test execution failed.' });
      }
    } catch (err) {
      setResults({ error: 'Test execution failed.' });
    }
    setIsLoading(false);
  };


  const handleDownload = () => {
    let content = `Purpose: ${purpose}\n`;
    if (inputType === 'paste') {
      content += `Code:\n${code}\n`;
    } else if (inputType === 'github') {
      content += `GitHub Repo: ${githubUrl}\n`;
    } else if (inputType === 'folder' && files) {
      content += `Files: ${Array.from(files).map(f => f.name).join(', ')}\n`;
    }
    content += `\nResults:\n${JSON.stringify(results, null, 2)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${suiteType}-test-suite-report.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container mx-auto py-8 max-w-3xl mt-20">
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
            <Textarea
              placeholder="Describe what your code does..."
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              rows={5}
              className="font-mono text-base w-full min-h-[80px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Input Type</label>
            <div className="flex gap-2 mb-4">
              <Button variant={inputType === 'paste' ? 'default' : 'outline'} onClick={() => setInputType('paste')}>Paste Code</Button>
              <Button variant={inputType === 'github' ? 'default' : 'outline'} onClick={() => setInputType('github')}>GitHub Repo</Button>
              <Button variant={inputType === 'folder' ? 'default' : 'outline'} onClick={() => setInputType('folder')}>Folder Upload</Button>
            </div>
            {inputType === 'paste' && (
              <Textarea
                placeholder="Paste your code here..."
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={10}
                className="font-mono text-sm"
              />
            )}
            {inputType === 'github' && (
              <Input
                type="url"
                placeholder="Enter GitHub repository URL..."
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                className="font-mono text-sm"
              />
            )}
            {inputType === 'folder' && (
              <Input
                type="file"
                multiple
                onChange={e => setFiles(e.target.files)}
                className="font-mono text-sm"
              />
            )}
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
                <TabsTrigger value="tests">Tests</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              </TabsList>
              <TabsContent value="tests">
                {results.testCases ? (
                  <ul className="list-disc pl-6">
                    {results.testCases.map((test: any, idx: number) => (
                      <li key={idx}>
                        <strong>{test.name}:</strong> {test.status}
                        {test.message && (
                          <>
                            <br />
                            <span className="text-xs">{typeof test.message === 'object' ? JSON.stringify(test.message) : test.message}</span>
                          </>
                        )}
                        {test.details && typeof test.details === 'object' && (
                          <pre className="bg-gray-800 text-white rounded p-2 mt-1 text-xs">{JSON.stringify(test.details, null, 2)}</pre>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <pre className="bg-gray-900 text-white rounded p-4 whitespace-pre-wrap">{results.tests}</pre>
                )}
              </TabsContent>
              <TabsContent value="recommendations">
                {results.recommendations && Array.isArray(results.recommendations) ? (
                  <ul className="list-disc pl-6">
                    {results.recommendations.map((rec: any, idx: number) => (
                      <li key={idx}>{typeof rec === 'object' ? JSON.stringify(rec) : rec}</li>
                    ))}
                  </ul>
                ) : (
                  <span>No recommendations.</span>
                )}
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
