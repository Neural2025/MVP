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
  const [activeTab, setActiveTab] = useState<'errors' | 'recommendations' | 'applyfix'>('errors');

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
      <Card className="mb-8 bg-white border border-gray-300">
        <CardHeader>
          <CardTitle className="text-black">Code Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="block mb-1 font-medium text-black">Programming Language</label>
              <Input
                type="text"
                value={language}
                onChange={e => setLanguage(e.target.value)}
                placeholder="e.g. javascript, python, java"
                required
                className="border border-gray-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-black">Purpose (optional)</label>
              <Input
                type="text"
                value={purpose}
                onChange={e => setPurpose(e.target.value)}
                placeholder="Describe the code's purpose"
                className="border border-gray-400"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-black">Paste your code</label>
              <Textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                rows={10}
                placeholder="Paste your code here..."
                required
                className="border border-gray-400"
              />
            </div>
            <Button type="submit" className="w-full bg-black text-white" disabled={loading}>
              {loading ? 'Analyzing...' : 'Analyze Code'}
            </Button>
          </form>
          {error && <div className="text-black mt-4">{error}</div>}
          {result && (
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4 text-black">Analysis Result</h3>
              <div className="w-full">
                {result.errors && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-black">Errors</h4>
                    <pre className="bg-gray-100 text-black p-3 rounded whitespace-pre-wrap text-sm max-h-60 overflow-x-auto">
                      {Array.isArray(result.errors) ? result.errors.join('\n') : JSON.stringify(result.errors, null, 2)}
                    </pre>
                  </div>
                )}
                {result.recommendations && (
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2 text-black">Recommendations</h4>
                      <pre className="bg-gray-100 text-black p-3 rounded whitespace-pre-wrap text-sm max-h-60 overflow-x-auto">
                        {Array.isArray(result.recommendations) ? result.recommendations.join('\n') : JSON.stringify(result.recommendations, null, 2)}
                      </pre>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="button"
                        className="bg-black text-white"
                        disabled={!corrections || !corrections.fixedCode}
                        onClick={() => setActiveTab('applyfix')}
                      >
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                )}
                {activeTab === 'applyfix' && (
                  corrections && corrections.fixedCode ? (
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2 text-black">Corrected Code</h4>
                      <pre className="bg-gray-900 text-white p-4 rounded mt-2 overflow-x-auto whitespace-pre-wrap text-sm max-h-96">
                        {corrections.fixedCode}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-gray-400">No fix available for this code.</div>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeAnalysis;
