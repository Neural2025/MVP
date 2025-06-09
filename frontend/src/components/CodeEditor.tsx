import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  TestTube, 
  Code2, 
  Sparkles, 
  FileText,
  Loader2,
  Info
} from "lucide-react";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  purpose: string;
  setPurpose: (purpose: string) => void;
  onAnalyze: () => void;
  onGenerateTests: () => void;
  isAnalyzing: boolean;
  isGeneratingTests: boolean;
}

const CodeEditor = ({
  code,
  setCode,
  purpose,
  setPurpose,
  onAnalyze,
  onGenerateTests,
  isAnalyzing,
  isGeneratingTests,
}: CodeEditorProps) => {
  const [codeLength, setCodeLength] = useState(0);
  const maxLength = 10240; // 10KB

  const handleCodeChange = (value: string) => {
    setCode(value);
    setCodeLength(value.length);
  };

  const getLanguageFromCode = (code: string): string => {
    if (code.includes('function') || code.includes('const') || code.includes('let')) return 'JavaScript';
    if (code.includes('def ') || code.includes('import ') || code.includes('print(')) return 'Python';
    if (code.includes('public class') || code.includes('System.out')) return 'Java';
    if (code.includes('#include') || code.includes('cout')) return 'C++';
    if (code.includes('using System') || code.includes('Console.Write')) return 'C#';
    if (code.includes('<?php') || code.includes('echo ')) return 'PHP';
    if (code.includes('package main') || code.includes('fmt.Print')) return 'Go';
    if (code.includes('def ') && code.includes('end')) return 'Ruby';
    return 'Code';
  };

  const detectedLanguage = code ? getLanguageFromCode(code) : null;

  return (
    <Card className="h-fit">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              Code Editor
            </CardTitle>
            <CardDescription>
              Enter your code and describe its purpose for AI analysis
            </CardDescription>
          </div>
          {detectedLanguage && (
            <Badge variant="secondary" className="ml-auto">
              {detectedLanguage}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Purpose Input */}
        <div className="space-y-2">
          <label htmlFor="purpose" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Purpose Description
          </label>
          <Input
            id="purpose"
            placeholder="Describe what your code is supposed to do..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="h-11"
          />
        </div>

        {/* Code Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="code" className="text-sm font-medium flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              Code (any programming language)
            </label>
            <div className="text-xs text-muted-foreground">
              {codeLength}/{maxLength} characters
            </div>
          </div>
          <Textarea
            id="code"
            placeholder="Enter your code here (syntax errors are OK - we'll help fix them!)..."
            value={code}
            onChange={(e) => handleCodeChange(e.target.value)}
            className="min-h-[300px] font-mono text-sm"
            maxLength={maxLength}
          />
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            <span>Supports JavaScript, Python, Java, C++, C#, PHP, Ruby, Go, and more</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing || isGeneratingTests || !code.trim() || !purpose.trim()}
            className="flex-1"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Play className="mr-2 h-4 w-4" />
                Analyze Code
              </>
            )}
          </Button>
          
          <Button
            onClick={onGenerateTests}
            disabled={isAnalyzing || isGeneratingTests || !code.trim() || !purpose.trim()}
            variant="outline"
            className="flex-1"
          >
            {isGeneratingTests ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <TestTube className="mr-2 h-4 w-4" />
                Generate Tests
              </>
            )}
          </Button>
        </div>

        {/* Features Info */}
        <div className="bg-muted/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI-Powered Analysis Features
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Security vulnerability detection</li>
            <li>• Performance optimization suggestions</li>
            <li>• Logic error identification</li>
            <li>• Syntax error fixes</li>
            <li>• Automated test suite generation</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
