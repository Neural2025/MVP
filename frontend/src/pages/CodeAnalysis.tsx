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
              <h3 className="text-xl font-bold mb-4">Analysis Result</h3>
              <div className="w-full">
                {/* Errors Section */}
                {result.errors && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold mb-2 text-red-600">Errors</h4>
                    <pre className="bg-red-100 text-red-700 p-3 rounded whitespace-pre-wrap text-sm max-h-60 overflow-x-auto">
                      {Array.isArray(result.errors) ? result.errors.join('\n') : JSON.stringify(result.errors, null, 2)}
                    </pre>
                  </div>
                )}
                {/* Recommendations Section with Apply Fix button */}
                {result.recommendations && (
                  <div className="mb-6 flex items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold mb-2 text-green-700">Recommendations</h4>
                      <pre className="bg-green-50 text-green-900 p-3 rounded whitespace-pre-wrap text-sm max-h-60 overflow-x-auto">
                        {Array.isArray(result.recommendations) ? result.recommendations.join('\n') : JSON.stringify(result.recommendations, null, 2)}
                      </pre>
                    </div>
                    <div className="pt-2">
                      <Button
                        type="button"
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                        disabled={!corrections || !corrections.fixedCode}
                        onClick={() => setActiveTab('applyfix')}
                      >
                        Apply Fix
                      </Button>
                    </div>
                  </div>
                )}
                {/* Corrected Code (shown only when Apply Fix is clicked) */}
                {activeTab === 'applyfix' && (
                  corrections && corrections.fixedCode ? (
                    <div className="mb-4">
                      <h4 className="text-lg font-semibold mb-2 text-purple-700">Corrected Code</h4>
                      <pre className="bg-gray-900 text-green-300 p-4 rounded mt-2 overflow-x-auto whitespace-pre-wrap text-sm max-h-96">
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
