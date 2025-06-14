import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Play,
  TestTube,
  Code2,
  Sparkles,
  FileText,
  Loader2,
  Info,
  Github,
  Upload,
  File,
  FolderOpen,
  X,
  History
} from "lucide-react";
import { toast } from "sonner";

interface CodeEditorProps {
  code: string;
  setCode: (code: string) => void;
  purpose: string;
  setPurpose: (purpose: string) => void;
  onAnalyze: (data: any) => void;
  onGenerateTests: (data: any) => void;
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
  const [githubUrl, setGithubUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [inputMethod, setInputMethod] = useState<"manual" | "github" | "upload">("manual");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const maxLength = 10240; // 10KB

  const handleCodeChange = (value: string) => {
    setCode(value);
    setCodeLength(value.length);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const validExtensions = ['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.zip'];
      const extension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      return validExtensions.includes(extension);
    });

    if (validFiles.length !== files.length) {
      toast.error("Some files were skipped. Only code files and ZIP archives are supported.");
    }

    setUploadedFiles(validFiles);
    if (validFiles.length > 0) {
      setInputMethod("upload");
      toast.success(`${validFiles.length} file(s) selected for analysis`);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    if (newFiles.length === 0) {
      setInputMethod("manual");
    }
  };

  const handleAnalyze = () => {
    const data: any = { purpose };

    if (inputMethod === "github" && githubUrl.trim()) {
      data.githubUrl = githubUrl.trim();
    } else if (inputMethod === "upload" && uploadedFiles.length > 0) {
      data.files = uploadedFiles;
    } else if (inputMethod === "manual" && code.trim()) {
      data.code = code.trim();
    } else {
      toast.error("Please provide code to analyze");
      return;
    }

    onAnalyze(data);
  };

  const handleGenerateTests = () => {
    const data: any = { purpose };

    if (inputMethod === "github" && githubUrl.trim()) {
      data.githubUrl = githubUrl.trim();
    } else if (inputMethod === "upload" && uploadedFiles.length > 0) {
      data.files = uploadedFiles;
    } else if (inputMethod === "manual" && code.trim()) {
      data.code = code.trim();
    } else {
      toast.error("Please provide code to analyze");
      return;
    }

    onGenerateTests(data);
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
  const canAnalyze = !isAnalyzing && !isGeneratingTests && purpose.trim() && (
    (inputMethod === "manual" && code.trim()) ||
    (inputMethod === "github" && githubUrl.trim()) ||
    (inputMethod === "upload" && uploadedFiles.length > 0)
  );

  return (
    <Card className="h-fit animate-in slide-in-from-left-5 duration-500">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5 text-primary" />
              AI Code Analysis
            </CardTitle>
            <CardDescription>
              Analyze code from multiple sources with AI-powered insights
            </CardDescription>
          </div>
          {detectedLanguage && (
            <Badge variant="secondary" className="ml-auto animate-in fade-in duration-300">
              {detectedLanguage}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Purpose Input */}
        <div className="space-y-2 animate-in slide-in-from-bottom-3 duration-300">
          <label htmlFor="purpose" className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Purpose Description
          </label>
          <Input
            id="purpose"
            placeholder="Describe what your code is supposed to do..."
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="h-11 transition-all duration-200 focus:scale-[1.02]"
          />
        </div>

        {/* Input Method Tabs */}
        <div className="animate-in slide-in-from-bottom-4 duration-400">
          <Tabs value={inputMethod} onValueChange={(value) => setInputMethod(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Code2 className="h-4 w-4" />
                Manual
              </TabsTrigger>
              <TabsTrigger value="github" className="flex items-center gap-2">
                <Github className="h-4 w-4" />
                GitHub
              </TabsTrigger>
              <TabsTrigger value="upload" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Upload
              </TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 mt-4">
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
                  className="min-h-[300px] font-mono text-sm transition-all duration-200 focus:scale-[1.01]"
                  maxLength={maxLength}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="h-3 w-3" />
                  <span>Supports JavaScript, Python, Java, C++, C#, PHP, Ruby, Go, and more</span>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="github" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="github-url" className="text-sm font-medium flex items-center gap-2">
                  <Github className="h-4 w-4" />
                  GitHub Repository URL
                </label>
                <Input
                  id="github-url"
                  placeholder="https://github.com/username/repository"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="h-11 transition-all duration-200 focus:scale-[1.02]"
                />
                <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Info className="h-4 w-4 text-primary" />
                    Supported GitHub URLs
                  </h4>
                  <ul className="text-xs text-muted-foreground space-y-1">
                    <li>• Repository: https://github.com/user/repo</li>
                    <li>• Specific branch: https://github.com/user/repo/tree/branch</li>
                    <li>• Specific file: https://github.com/user/repo/blob/branch/file.js</li>
                    <li>• Folder: https://github.com/user/repo/tree/branch/folder</li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="upload" className="space-y-4 mt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Upload Files
                </label>
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".js,.jsx,.ts,.tsx,.py,.java,.cpp,.c,.cs,.php,.rb,.go,.zip"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="space-y-2">
                    <FolderOpen className="h-8 w-8 mx-auto text-muted-foreground" />
                    <div>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="mb-2"
                      >
                        Choose Files
                      </Button>
                      <p className="text-sm text-muted-foreground">
                        Select code files or ZIP archives
                      </p>
                    </div>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Selected Files:</h4>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="flex items-center justify-between bg-muted/50 rounded-lg p-2">
                          <div className="flex items-center gap-2">
                            <File className="h-4 w-4" />
                            <span className="text-sm">{file.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {(file.size / 1024).toFixed(1)} KB
                            </Badge>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 animate-in slide-in-from-bottom-5 duration-500">
          <Button
            onClick={handleAnalyze}
            disabled={!canAnalyze}
            className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
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
            onClick={handleGenerateTests}
            disabled={!canAnalyze}
            variant="outline"
            className="flex-1 transition-all duration-200 hover:scale-105 active:scale-95"
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
        <div className="bg-gradient-to-r from-muted/50 to-muted/30 rounded-lg p-4 space-y-3 animate-in slide-in-from-bottom-6 duration-600">
          <h4 className="text-sm font-medium flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            AI-Powered Analysis Features
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Security vulnerability detection
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Performance optimization suggestions
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Logic error identification
              </li>
            </ul>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Syntax error fixes & corrections
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Automated test suite generation
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1 h-1 bg-primary rounded-full"></div>
                Multi-language support
              </li>
            </ul>
          </div>
          <div className="flex items-center gap-2 pt-2 border-t border-muted-foreground/20">
            <History className="h-3 w-3 text-primary" />
            <span className="text-xs text-muted-foreground">Analysis history automatically saved for authenticated users</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CodeEditor;
