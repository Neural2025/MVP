import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';

const CodeAnalysis = () => {
  const [code, setCode] = useState('');
  const [purpose, setPurpose] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [result, setResult] = useState<any>(null);
  const [corrections, setCorrections] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    setCorrections(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token') || ''}`
        },
        body: JSON.stringify({ code, purpose, language })
      });
      const data = await res.json();
      if (data.status === 'success') {
        setResult(data.data);
        setCorrections(data.data.corrections);
      } else {
        setError(data.error || 'Analysis failed.');
      }
    } catch (err) {
      setError('Network or server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-12">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Code Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium">Programming Language</label>
              <Input
                type="text"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                placeholder="e.g. javascript, python, java"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Purpose (optional)</label>
              <Input
                type="text"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Describe the code's purpose"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium">Paste your code</label>
              <Textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={10}
                placeholder="Paste your code here..."
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Code'}
            </Button>
          </form>
          {error && <div className="text-red-500 mt-4">{error}</div>}
          {result && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-2">Analysis Result</h3>
              <pre className="bg-gray-900 text-gray-100 p-4 rounded overflow-x-auto whitespace-pre-wrap text-sm max-h-96">
                {JSON.stringify(result, null, 2)}
              </pre>
              {corrections && (
                <div className="mt-6">
                  <h4 className="text-lg font-semibold mb-2">Corrections & Suggestions</h4>
                  <pre className="bg-gray-800 text-gray-100 p-3 rounded overflow-x-auto whitespace-pre-wrap text-sm max-h-96">
                    {JSON.stringify(corrections, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeAnalysis;
