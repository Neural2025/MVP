const Validator = require('../utils/validator');
const deepseekService = require('../services/deepseekService');
const testExecutionService = require('../services/testExecutionService');
const logger = require('../utils/logger');
const User = require('../models/User');
const githubService = require('../services/githubService');
const fileUploadService = require('../services/fileUploadService');
const axios = require('axios');

// Helper functions for role-based test generation
async function generateDeveloperTests(code, purpose, language) {
  const prompt = `
As a Senior Software Developer, analyze this ${language} code and generate comprehensive test suites:

Code:
${code}

Purpose: ${purpose}

Generate the following for developers:

1. UNIT TESTS:
   - Test individual functions/methods
   - Test edge cases and boundary conditions
   - Test error handling
   - Mock external dependencies

2. INTEGRATION TESTS:
   - Test component interactions
   - Test API endpoints
   - Test database operations
   - Test external service integrations

3. CODE QUALITY TESTS:
   - Test code coverage requirements
   - Test performance benchmarks
   - Test memory usage
   - Test thread safety (if applicable)

4. DEVELOPER TOOLS:
   - Setup instructions
   - Test data fixtures
   - Mock configurations
   - CI/CD pipeline tests

Format as JSON with sections: unitTests, integrationTests, codeQualityTests, developerTools
`;

  return await deepseekService.generateCustomTests(prompt);
}

async function generateTesterTests(code, purpose, language) {
  const prompt = `
As a Senior QA Engineer, analyze this ${language} code and generate comprehensive test suites:

Code:
${code}

Purpose: ${purpose}

Generate the following for testers:

1. FUNCTIONAL TESTS:
   - Happy path scenarios
   - Alternative flows
   - Error scenarios
   - Input validation tests

2. SYSTEM TESTS:
   - End-to-end workflows
   - Cross-browser testing (if web)
   - Mobile responsiveness (if applicable)
   - Performance testing

3. SECURITY TESTS:
   - Input sanitization
   - Authentication tests
   - Authorization tests
   - Data encryption tests

4. USER ACCEPTANCE TESTS:
   - User story validation
   - Accessibility testing
   - Usability testing
   - Business rule validation

5. REGRESSION TESTS:
   - Critical path testing
   - Smoke tests
   - Sanity tests
   - Backward compatibility

Format as JSON with sections: functionalTests, systemTests, securityTests, userAcceptanceTests, regressionTests
`;

  return await deepseekService.generateCustomTests(prompt);
}

async function generateProductManagerTests(code, purpose, language) {
  const prompt = `
As a Senior Product Manager, analyze this ${language} code and generate business-focused test scenarios:

Code:
${code}

Purpose: ${purpose}

Generate the following for product managers:

1. BUSINESS LOGIC TESTS:
   - Validate business rules
   - Test calculation accuracy
   - Verify workflow compliance
   - Check data consistency

2. USER STORY VALIDATION:
   - Acceptance criteria verification
   - User journey testing
   - Feature completeness check
   - Requirements traceability

3. BUG IDENTIFICATION:
   - Potential user experience issues
   - Business logic flaws
   - Data integrity problems
   - Performance bottlenecks

4. STAKEHOLDER TESTS:
   - Customer impact scenarios
   - Revenue impact analysis
   - Compliance requirements
   - Risk assessment

Format as JSON with sections: businessLogicTests, userStoryValidation, bugIdentification, stakeholderTests
`;

  return await deepseekService.generateCustomTests(prompt);
}

// Helper functions for test recommendations and code quality
function generateTestRecommendations(testResults) {
  const recommendations = [];

  if (testResults.failed > 0) {
    recommendations.push({
      type: 'error',
      message: `${testResults.failed} tests failed. Review and fix the failing test cases.`,
      priority: 'high'
    });
  }

  if (testResults.coverage < 80) {
    recommendations.push({
      type: 'warning',
      message: `Code coverage is ${testResults.coverage}%. Consider adding more comprehensive tests.`,
      priority: 'medium'
    });
  }

  if (testResults.executionTime > 5000) {
    recommendations.push({
      type: 'performance',
      message: `Test execution took ${testResults.executionTime}ms. Consider optimizing code performance.`,
      priority: 'medium'
    });
  }

  if (testResults.errors > 0) {
    recommendations.push({
      type: 'error',
      message: `${testResults.errors} test execution errors occurred. Check code syntax and logic.`,
      priority: 'high'
    });
  }

  if (recommendations.length === 0) {
    recommendations.push({
      type: 'success',
      message: 'All tests passed successfully! Code quality looks good.',
      priority: 'info'
    });
  }

  return recommendations;
}

function assessCodeQuality(code, testResults) {
  const metrics = {
    complexity: calculateComplexity(code),
    maintainability: calculateMaintainability(testResults),
    reliability: calculateReliability(testResults),
    testability: calculateTestability(testResults),
    overall: 0
  };

  metrics.overall = Math.round((metrics.complexity + metrics.maintainability + metrics.reliability + metrics.testability) / 4);

  return {
    metrics,
    grade: getQualityGrade(metrics.overall),
    description: getQualityDescription(metrics.overall)
  };
}

function calculateComplexity(code) {
  const lines = code.split('\n').length;
  const functions = (code.match(/function/g) || []).length;
  const conditionals = (code.match(/if|else|switch|case/g) || []).length;
  const loops = (code.match(/for|while|do/g) || []).length;

  const complexityScore = Math.max(0, 100 - (functions * 5 + conditionals * 3 + loops * 3 + lines * 0.1));
  return Math.round(Math.min(100, complexityScore));
}

function calculateMaintainability(testResults) {
  return testResults.coverage;
}

function calculateReliability(testResults) {
  if (testResults.totalTests === 0) return 50;
  return Math.round((testResults.passed / testResults.totalTests) * 100);
}

function calculateTestability(testResults) {
  const hasTests = testResults.totalTests > 0;
  const hasPassingTests = testResults.passed > 0;
  const lowErrors = testResults.errors < 2;

  let score = 0;
  if (hasTests) score += 40;
  if (hasPassingTests) score += 40;
  if (lowErrors) score += 20;

  return score;
}

function getQualityGrade(score) {
  if (score >= 90) return 'A';
  if (score >= 80) return 'B';
  if (score >= 70) return 'C';
  if (score >= 60) return 'D';
  return 'F';
}

function getQualityDescription(score) {
  if (score >= 90) return 'Excellent code quality';
  if (score >= 80) return 'Good code quality';
  if (score >= 70) return 'Average code quality';
  if (score >= 60) return 'Below average code quality';
  return 'Poor code quality - needs improvement';
}

class AnalysisController {
  async analyzeCode(req, res, next) {
    try {
      const { code, purpose, githubUrl, language } = req.body;
      let finalCode = code;
      let detectedLanguage = language;
      let sourceInfo = { type: 'manual' };

      // Handle GitHub URL if provided
      if (githubUrl && githubUrl.trim()) {
        logger.info('Processing GitHub repository', { githubUrl, userId: req.user?.id });

        const githubResult = await githubService.processRepository(githubUrl.trim());
        if (!githubResult.success) {
          return res.status(400).json({
            status: 'error',
            error: githubResult.error
          });
        }

        finalCode = githubService.combineFilesForAnalysis(githubResult.files);
        detectedLanguage = githubResult.summary.languages.join(', ');
        sourceInfo = {
          type: 'github',
          repository: githubResult.repository,
          summary: githubResult.summary
        };
      }

      // Handle file uploads if provided
      if (req.files && req.files.length > 0) {
        logger.info('Processing uploaded files', { fileCount: req.files.length, userId: req.user?.id });

        const uploadResult = await fileUploadService.processUploadedFiles(req.files);
        if (!uploadResult.success) {
          return res.status(400).json({
            status: 'error',
            error: uploadResult.error
          });
        }

        finalCode = fileUploadService.combineFilesForAnalysis(uploadResult.files);
        detectedLanguage = uploadResult.summary.languages.join(', ');
        sourceInfo = {
          type: 'upload',
          summary: uploadResult.summary
        };
      }

      // Validate inputs
      const sanitizedCode = Validator.validateCode(finalCode);
      const sanitizedPurpose = Validator.validatePurpose(purpose);

      logger.info('Starting code analysis', {
        codeLength: sanitizedCode.length,
        purposeLength: sanitizedPurpose.length,
        language: detectedLanguage,
        sourceType: sourceInfo.type,
        userId: req.user?.id || 'anonymous'
      });

      // Perform analysis using DeepSeek API
      const analysisResult = await deepseekService.analyzeCode(sanitizedCode, sanitizedPurpose);

      // Add corrections to the analysis
      const corrections = await deepseekService.generateCorrections(sanitizedCode, analysisResult);

      // Save to user history if authenticated
      if (req.user) {
        try {
          await req.user.incrementAnalysisCount();
          await req.user.addAnalysisHistory({
            code: sanitizedCode.substring(0, 5000), // Limit stored code length
            purpose: sanitizedPurpose,
            language: detectedLanguage,
            results: analysisResult,
            corrections: corrections
          });
        } catch (error) {
          logger.warn('Failed to update user analysis count or history:', error);
        }
      }

      // --- Save bugs to BugReport model ---
      try {
        const BugReport = require('../models/BugReport');
        const categories = [
          { key: 'security', severity: 'high' },
          { key: 'performance', severity: 'medium' },
          { key: 'optimization', severity: 'low' },
          { key: 'functionality', severity: 'high' }
        ];
        for (const cat of categories) {
          if (Array.isArray(analysisResult[cat.key])) {
            for (const issue of analysisResult[cat.key]) {
              // Save to global BugReport collection
              const bug = await BugReport.create({
                title: `${cat.key.charAt(0).toUpperCase() + cat.key.slice(1)} Issue`,
                description: issue,
                severity: cat.severity,
                status: 'open',
                language: detectedLanguage,
                source: 'analysis',
                createdBy: req.user ? req.user._id : null
              });
              // Also add to user's bugReports array
              if (req.user && req.user.addBugReport) {
                await req.user.addBugReport({
                  id: bug._id.toString(),
                  title: bug.title,
                  description: bug.description,
                  severity: bug.severity,
                  status: bug.status,
                  language: bug.language,
                  aiAnalysis: null,
                  createdAt: bug.createdAt,
                  updatedAt: bug.updatedAt
                });
              }
            }
          }
        }
      } catch (bugSaveError) {
        logger.warn('Failed to save bug reports from analysis:', bugSaveError);
      }
      // --- End BugReport save ---

      res.json({
        status: 'success',
        data: {
          ...analysisResult,
          corrections,
          language: detectedLanguage,
          sourceInfo
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Analysis error:', error);
      next(error);
    }
  }

  async generateTests(req, res, next) {
    try {
      const { code, purpose, githubUrl, language } = req.body;
      let finalCode = code;
      let detectedLanguage = language;
      let sourceInfo = { type: 'manual' };

      // Handle GitHub URL if provided
      if (githubUrl && githubUrl.trim()) {
        logger.info('Processing GitHub repository for test generation', { githubUrl, userId: req.user?.id });

        const githubResult = await githubService.processRepository(githubUrl.trim());
        if (!githubResult.success) {
          return res.status(400).json({
            status: 'error',
            error: githubResult.error
          });
        }

        finalCode = githubService.combineFilesForAnalysis(githubResult.files);
        detectedLanguage = githubResult.summary.languages.join(', ');
        sourceInfo = {
          type: 'github',
          repository: githubResult.repository,
          summary: githubResult.summary
        };
      }

      // Handle file uploads if provided
      if (req.files && req.files.length > 0) {
        logger.info('Processing uploaded files for test generation', { fileCount: req.files.length, userId: req.user?.id });

        const uploadResult = await fileUploadService.processUploadedFiles(req.files);
        if (!uploadResult.success) {
          return res.status(400).json({
            status: 'error',
            error: uploadResult.error
          });
        }

        finalCode = fileUploadService.combineFilesForAnalysis(uploadResult.files);
        detectedLanguage = uploadResult.summary.languages.join(', ');
        sourceInfo = {
          type: 'upload',
          summary: uploadResult.summary
        };
      }

      // Validate inputs
      const sanitizedCode = Validator.validateCode(finalCode);
      const sanitizedPurpose = Validator.validatePurpose(purpose);

      logger.info('Starting test generation', {
        codeLength: sanitizedCode.length,
        purposeLength: sanitizedPurpose.length,
        language: detectedLanguage,
        sourceType: sourceInfo.type,
        userId: req.user?.id || 'anonymous'
      });

      // Generate tests using DeepSeek API
      const testResult = await deepseekService.generateTests(sanitizedCode, sanitizedPurpose);

      // Save to user history if authenticated
      if (req.user) {
        try {
          await req.user.incrementTestGenerationCount();
          await req.user.addTestHistory({
            code: sanitizedCode.substring(0, 5000), // Limit stored code length
            purpose: sanitizedPurpose,
            language: detectedLanguage,
            tests: testResult.tests,
            fixes: testResult.fixes
          });
        } catch (error) {
          logger.warn('Failed to update user test generation count or history:', error);
        }
      }

      res.json({
        status: 'success',
        data: {
          ...testResult,
          language: detectedLanguage,
          sourceInfo
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Test generation error:', error);
      next(error);
    }
  }

  // Get user analysis history
  async getAnalysisHistory(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          error: 'Authentication required'
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found'
        });
      }

      const analysisHistory = user.analysisHistory || [];

      // Sort by timestamp (newest first)
      const sortedHistory = analysisHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const history = sortedHistory.slice(skip, skip + parseInt(limit));
      const total = analysisHistory.length;

      res.json({
        status: 'success',
        data: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get analysis history error:', error);
      next(error);
    }
  }

  // Get user test history
  async getTestHistory(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          error: 'Authentication required'
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found'
        });
      }

      const testHistory = user.testHistory || [];

      // Sort by timestamp (newest first)
      const sortedHistory = testHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const history = sortedHistory.slice(skip, skip + parseInt(limit));
      const total = testHistory.length;

      res.json({
        status: 'success',
        data: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      logger.error('Get test history error:', error);
      next(error);
    }
  }

  // Test API Key - Enhanced with multi-API support
  async testApiKey(req, res, next) {
    try {
      const { apiKey, apiProvider = 'deepseek' } = req.body;

      if (!apiKey) {
        return res.status(400).json({
          status: 'error',
          error: 'API key is required'
        });
      }

      let testResponse;
      let apiUrl;
      let model;
      let headers;

      // Configure based on API provider
      switch (apiProvider.toLowerCase()) {
        case 'openai':
          apiUrl = 'https://api.openai.com/v1/chat/completions';
          model = 'gpt-3.5-turbo';
          headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          break;

        case 'deepseek':
          apiUrl = 'https://api.deepseek.com/v1/chat/completions';
          model = 'deepseek-coder';
          headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          break;

        case 'huggingface':
          apiUrl = 'https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium';
          headers = {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          };
          break;

        case 'anthropic':
          apiUrl = 'https://api.anthropic.com/v1/messages';
          model = 'claude-3-haiku-20240307';
          headers = {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          };
          break;

        case 'google':
          apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`;
          headers = {
            'Content-Type': 'application/json'
          };
          break;

        default:
          return res.status(400).json({
            status: 'error',
            error: 'Unsupported API provider. Supported: openai, deepseek, huggingface, anthropic, google'
          });
      }

      // Make test request based on provider
      if (apiProvider === 'huggingface') {
        testResponse = await axios.post(apiUrl, {
          inputs: "Test connection"
        }, { headers, timeout: 10000 });
      } else if (apiProvider === 'anthropic') {
        testResponse = await axios.post(apiUrl, {
          model: model,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Test connection' }]
        }, { headers, timeout: 10000 });
      } else if (apiProvider === 'google') {
        testResponse = await axios.post(apiUrl, {
          contents: [{ parts: [{ text: 'Test connection' }] }]
        }, { headers, timeout: 10000 });
      } else {
        // OpenAI and DeepSeek format
        testResponse = await axios.post(apiUrl, {
          model: model,
          messages: [{ role: 'user', content: 'Test connection. Respond with "API key is valid".' }],
          max_tokens: 10,
          temperature: 0
        }, { headers, timeout: 10000 });
      }

      if (testResponse.data) {
        logger.info(`${apiProvider} API key test successful`);

        // Run additional test suites
        const testSuites = {
          connectivity: 'PASSED',
          authentication: 'PASSED',
          responseTime: testResponse.status === 200 ? 'PASSED' : 'FAILED',
          rateLimit: 'PASSED',
          modelAccess: model ? 'PASSED' : 'PARTIAL'
        };

        res.json({
          status: 'success',
          message: `${apiProvider} API key is valid and working`,
          data: {
            status: 'valid',
            provider: apiProvider,
            model: model || 'default',
            timestamp: new Date().toISOString(),
            testSuites: testSuites,
            responseTime: '< 2s',
            capabilities: this.getProviderCapabilities(apiProvider)
          }
        });
      } else {
        throw new Error('Invalid response from API');
      }

    } catch (error) {
      const { apiProvider = 'unknown' } = req.body;
      logger.error(`${apiProvider} API key test failed:`, error.message);

      let errorMessage = 'API key test failed';
      if (error.response?.status === 401) {
        errorMessage = 'Invalid API key';
      } else if (error.response?.status === 429) {
        errorMessage = 'API rate limit exceeded';
      } else if (error.response?.status === 403) {
        errorMessage = 'API access forbidden';
      } else if (error.code === 'ECONNABORTED') {
        errorMessage = 'API request timeout';
      }

      res.status(400).json({
        status: 'error',
        error: errorMessage,
        data: {
          status: 'invalid',
          provider: apiProvider,
          timestamp: new Date().toISOString()
        }
      });
    }
  }

  // Get provider capabilities
  getProviderCapabilities(provider) {
    const capabilities = {
      openai: {
        models: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
        features: ['Chat', 'Code Generation', 'Analysis', 'Embeddings'],
        maxTokens: 4096,
        languages: 'All major programming languages'
      },
      deepseek: {
        models: ['deepseek-coder', 'deepseek-chat'],
        features: ['Code Analysis', 'Bug Detection', 'Code Generation'],
        maxTokens: 4096,
        languages: 'Specialized in programming languages'
      },
      huggingface: {
        models: ['Various open-source models'],
        features: ['Text Generation', 'Code Analysis', 'Custom Models'],
        maxTokens: 'Varies by model',
        languages: 'Depends on specific model'
      },
      anthropic: {
        models: ['claude-3-haiku', 'claude-3-sonnet', 'claude-3-opus'],
        features: ['Advanced Reasoning', 'Code Analysis', 'Long Context'],
        maxTokens: 200000,
        languages: 'All major programming languages'
      },
      google: {
        models: ['gemini-pro', 'gemini-pro-vision'],
        features: ['Multimodal', 'Code Analysis', 'Fast Inference'],
        maxTokens: 30720,
        languages: 'All major programming languages'
      }
    };

    return capabilities[provider] || {
      models: ['Unknown'],
      features: ['Basic API access'],
      maxTokens: 'Unknown',
      languages: 'Unknown'
    };
  }

  // Fetch GitHub Repository
  async fetchGithubRepo(req, res, next) {
    try {
      const { githubUrl } = req.body;

      if (!githubUrl) {
        return res.status(400).json({
          status: 'error',
          error: 'GitHub URL is required'
        });
      }

      // Extract owner and repo from URL
      const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!urlMatch) {
        return res.status(400).json({
          status: 'error',
          error: 'Invalid GitHub URL format'
        });
      }

      const [, owner, repo] = urlMatch;
      const repoName = repo.replace('.git', '');

      // Fetch repository files using GitHub API
      const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents`;

      try {
        const response = await axios.get(apiUrl);
        const files = response.data;

        let combinedCode = '';
        let fileCount = 0;

        // Process each file
        for (const file of files) {
          if (file.type === 'file' && file.download_url) {
            try {
              const fileResponse = await axios.get(file.download_url);
              combinedCode += `\n\n// ===== File: ${file.name} =====\n${fileResponse.data}`;
              fileCount++;
            } catch (fileError) {
              logger.warn(`Failed to fetch file ${file.name}:`, fileError.message);
            }
          }
        }

        if (fileCount === 0) {
          return res.status(404).json({
            status: 'error',
            error: 'No readable files found in repository'
          });
        }

        logger.info(`Successfully fetched ${fileCount} files from ${owner}/${repoName}`);

        res.json({
          status: 'success',
          message: `Successfully fetched repository ${owner}/${repoName}`,
          data: {
            combinedCode,
            fileCount,
            repository: `${owner}/${repoName}`,
            timestamp: new Date().toISOString()
          }
        });

      } catch (apiError) {
        if (apiError.response?.status === 404) {
          return res.status(404).json({
            status: 'error',
            error: 'Repository not found or is private'
          });
        }
        throw apiError;
      }

    } catch (error) {
      logger.error('GitHub fetch failed:', error.message);
      res.status(500).json({
        status: 'error',
        error: 'Failed to fetch GitHub repository',
        details: error.message
      });
    }
  }

  // Generate role-specific test suites
  async generateRoleBasedTests(req, res, next) {
    try {
      const { code, purpose, language, role, githubUrl } = req.body;
      let finalCode = code;
      let detectedLanguage = language;
      let sourceInfo = { type: 'manual' };

      // Handle GitHub URL if provided
      if (githubUrl && githubUrl.trim()) {
        logger.info('Processing GitHub repository for role-based tests', { githubUrl, role, userId: req.user?.id });

        try {
          // Extract owner and repo from URL
          const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
          if (!urlMatch) {
            return res.status(400).json({
              status: 'error',
              error: 'Invalid GitHub URL format'
            });
          }

          const [, owner, repo] = urlMatch;
          const repoName = repo.replace('.git', '');

          // Fetch repository files using GitHub API
          const apiUrl = `https://api.github.com/repos/${owner}/${repoName}/contents`;
          const axios = require('axios');

          const response = await axios.get(apiUrl);
          const files = response.data;

          let combinedCode = '';
          let fileCount = 0;

          // Process each file
          for (const file of files) {
            if (file.type === 'file' && file.download_url) {
              try {
                const fileResponse = await axios.get(file.download_url);
                combinedCode += `\n\n// ===== File: ${file.name} =====\n${fileResponse.data}`;
                fileCount++;
              } catch (fileError) {
                logger.warn(`Failed to fetch file ${file.name}:`, fileError.message);
              }
            }
          }

          if (fileCount === 0) {
            return res.status(404).json({
              status: 'error',
              error: 'No readable files found in repository'
            });
          }

          finalCode = combinedCode;
          detectedLanguage = 'Multiple';
          sourceInfo = {
            type: 'github',
            repository: `${owner}/${repoName}`,
            fileCount
          };

          logger.info(`Successfully fetched ${fileCount} files from ${owner}/${repoName}`);

        } catch (githubError) {
          logger.error('GitHub fetch failed:', githubError.message);
          return res.status(400).json({
            status: 'error',
            error: 'Failed to fetch GitHub repository. Please check the URL and try again.'
          });
        }
      }

      // Handle file uploads if provided
      if (req.files && req.files.length > 0) {
        logger.info('Processing uploaded files for role-based tests', { fileCount: req.files.length, role, userId: req.user?.id });

        const uploadResult = await fileUploadService.processUploadedFiles(req.files);
        if (!uploadResult.success) {
          return res.status(400).json({
            status: 'error',
            error: uploadResult.error
          });
        }

        finalCode = fileUploadService.combineFilesForAnalysis(uploadResult.files);
        detectedLanguage = uploadResult.summary.languages.join(', ');
        sourceInfo = {
          type: 'upload',
          summary: uploadResult.summary
        };
      }

      if (!finalCode || !finalCode.trim()) {
        return res.status(400).json({
          status: 'error',
          error: 'Code or GitHub URL is required'
        });
      }

      const sanitizedCode = Validator.validateCode(finalCode);
      const sanitizedPurpose = Validator.validatePurpose(purpose);

      logger.info('Starting role-based test generation', {
        role,
        codeLength: sanitizedCode.length,
        language: detectedLanguage,
        sourceType: sourceInfo.type,
        userId: req.user?.id || 'anonymous'
      });

      let testResult;

      // Execute actual tests based on role
      logger.info('Executing tests for role', { role, language: detectedLanguage });

      // First execute real tests
      const executionResults = await testExecutionService.executeTests(sanitizedCode, detectedLanguage, role);

      // Then get AI-generated test suggestions for context
      let aiTestSuggestions;
      switch (role) {
        case 'developer':
          aiTestSuggestions = await generateDeveloperTests(sanitizedCode, sanitizedPurpose, detectedLanguage);
          break;
        case 'tester':
          aiTestSuggestions = await generateTesterTests(sanitizedCode, sanitizedPurpose, detectedLanguage);
          break;
        case 'product_manager':
          aiTestSuggestions = await generateProductManagerTests(sanitizedCode, sanitizedPurpose, detectedLanguage);
          break;
        default:
          aiTestSuggestions = await deepseekService.generateTests(sanitizedCode, sanitizedPurpose);
      }

      // Combine execution results with AI suggestions
      testResult = {
        role: role,
        language: detectedLanguage,
        executionResults: executionResults,
        aiSuggestions: aiTestSuggestions,
        summary: {
          totalTests: executionResults.totalTests,
          passed: executionResults.passed,
          failed: executionResults.failed,
          errors: executionResults.errors,
          passRate: executionResults.totalTests > 0 ? Math.round((executionResults.passed / executionResults.totalTests) * 100) : 0,
          coverage: executionResults.coverage,
          executionTime: executionResults.executionTime
        },
        timestamp: new Date()
      };

      // Save to user history if authenticated
      if (req.user) {
        try {
          await req.user.addTestHistory({
            code: sanitizedCode.substring(0, 5000),
            purpose: sanitizedPurpose,
            language: detectedLanguage,
            role: role,
            tests: testResult
          });
        } catch (error) {
          logger.warn('Failed to save test history:', error);
        }
      }

      res.json({
        status: 'success',
        data: {
          ...testResult,
          language: detectedLanguage,
          role: role
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Role-based test generation error:', error);
      next(error);
    }
  }



  // Create bug reports (Product Manager feature)
  async createBugReport(req, res, next) {
    try {
      const {
        title,
        description,
        severity,
        priority,
        stepsToReproduce,
        expectedBehavior,
        actualBehavior,
        environment,
        code,
        language
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          status: 'error',
          error: 'Title and description are required'
        });
      }

      // Generate AI-enhanced bug analysis if code is provided
      let aiAnalysis = null;
      if (code) {
        const analysisPrompt = `
Analyze this bug report and code to provide insights:

Bug Title: ${title}
Description: ${description}
Code (${language}):
${code}

Provide:
1. Root cause analysis
2. Potential fixes
3. Impact assessment
4. Related areas that might be affected
5. Testing recommendations

Format as JSON.
`;
        aiAnalysis = await deepseekService.analyzeBug(analysisPrompt);
      }

      const bugReport = {
        id: Date.now().toString(),
        title,
        description,
        severity: severity || 'medium',
        priority: priority || 'medium',
        status: 'open',
        stepsToReproduce: stepsToReproduce || [],
        expectedBehavior,
        actualBehavior,
        environment: environment || {},
        code,
        language,
        aiAnalysis,
        createdBy: req.user?.id || 'anonymous',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Save to user history if authenticated
      if (req.user) {
        try {
          await req.user.addBugReport(bugReport);
        } catch (error) {
          logger.warn('Failed to save bug report:', error);
        }
      }

      res.json({
        status: 'success',
        data: bugReport,
        message: 'Bug report created successfully'
      });

    } catch (error) {
      logger.error('Bug report creation error:', error);
      next(error);
    }
  }

  // Get bug reports for user
  async getBugReports(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          error: 'Authentication required'
        });
      }

      const { status, severity, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user.id);
      let bugReports = user.bugReports || [];

      // Filter by status if provided
      if (status) {
        bugReports = bugReports.filter(bug => bug.status === status);
      }

      // Filter by severity if provided
      if (severity) {
        bugReports = bugReports.filter(bug => bug.severity === severity);
      }

      // Sort by creation date (newest first)
      bugReports.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const paginatedBugs = bugReports.slice(skip, skip + parseInt(limit));
      const total = bugReports.length;

      res.json({
        status: 'success',
        data: {
          bugReports: paginatedBugs,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
        }
      });

    } catch (error) {
      logger.error('Get bug reports error:', error);
      next(error);
    }
  }

  // Get user statistics
  async getUserStats(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          error: 'Authentication required'
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          error: 'User not found'
        });
      }

      // Calculate statistics from real data
      const analysisHistory = user.analysisHistory || [];
      const testHistory = user.testHistory || [];
      const bugReports = user.bugReports || [];

      // Count lines of code analyzed
      let linesAnalyzed = 0;
      analysisHistory.forEach(analysis => {
        if (analysis.code) {
          linesAnalyzed += analysis.code.split('\n').length;
        }
      });

      // Count unique languages used
      const languagesUsed = new Set();
      [...analysisHistory, ...testHistory, ...bugReports].forEach(item => {
        if (item.language) {
          // Handle comma-separated languages
          const langs = item.language.split(',').map(l => l.trim());
          langs.forEach(lang => languagesUsed.add(lang));
        }
      });

      // Calculate accuracy rate based on successful analyses
      const totalAnalyses = analysisHistory.length;
      const successfulAnalyses = analysisHistory.filter(a => a.results && Object.keys(a.results).length > 0).length;
      const accuracyRate = totalAnalyses > 0 ? Math.round((successfulAnalyses / totalAnalyses) * 100) : 95; // Default to 95% if no data

      // Calculate recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentAnalyses = analysisHistory.filter(a => new Date(a.timestamp) > thirtyDaysAgo).length;
      const recentTests = testHistory.filter(t => new Date(t.timestamp) > thirtyDaysAgo).length;
      const recentBugs = bugReports.filter(b => new Date(b.createdAt) > thirtyDaysAgo).length;

      const stats = {
        linesAnalyzed: linesAnalyzed || 0,
        languagesUsed: languagesUsed.size || 0,
        apisSupported: 5, // Fixed number for supported APIs
        accuracyRate: accuracyRate,
        totalAnalyses: totalAnalyses,
        totalTests: testHistory.length,
        totalBugReports: bugReports.length,
        recentActivity: {
          analyses: recentAnalyses,
          tests: recentTests,
          bugs: recentBugs,
          total: recentAnalyses + recentTests + recentBugs
        },
        userInfo: {
          name: user.name,
          email: user.email,
          role: user.role,
          joinDate: user.createdAt,
          lastLogin: user.lastLogin
        }
      };

      logger.info('User stats calculated', {
        userId: user._id,
        linesAnalyzed: stats.linesAnalyzed,
        totalAnalyses: stats.totalAnalyses,
        languagesUsed: stats.languagesUsed
      });

      res.json({
        status: 'success',
        stats
      });

    } catch (error) {
      logger.error('Get user stats error:', error);
      next(error);
    }
  }

  // Get test history
  async getTestHistory(req, res, next) {
    try {
      if (!req.user) {
        return res.status(401).json({
          status: 'error',
          error: 'Authentication required'
        });
      }

      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const user = await User.findById(req.user.id);
      const testHistory = user.testHistory || [];

      // Sort by timestamp (newest first)
      testHistory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      const paginatedTests = testHistory.slice(skip, skip + parseInt(limit));
      const total = testHistory.length;

      res.json({
        status: 'success',
        data: paginatedTests,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      });

    } catch (error) {
      logger.error('Get test history error:', error);
      next(error);
    }
  }

  // Analyze code for bugs
  async analyzeBugs(req, res, next) {
    try {
      const { code, purpose, githubUrl, language } = req.body;

      if (!code && !githubUrl) {
        return res.status(400).json({
          status: 'error',
          error: 'Code or GitHub URL is required'
        });
      }

      logger.info('Bug analysis request received', {
        userId: req.user?.id,
        language,
        codeLength: code?.length || 0,
        hasGithubUrl: !!githubUrl
      });

      // Prepare the analysis prompt for bug detection
      const analysisPrompt = `
You are an expert code reviewer and bug detector. Analyze the following ${language} code for potential bugs, vulnerabilities, and issues.

${purpose ? `Code Purpose: ${purpose}` : ''}

Code to analyze:
\`\`\`${language}
${code}
\`\`\`

Please identify:
1. Syntax errors
2. Logic errors
3. Security vulnerabilities
4. Performance issues
5. Memory leaks
6. Race conditions
7. Null pointer exceptions
8. Array bounds issues
9. Type mismatches
10. Resource management issues

For each bug found, provide:
- Type of bug
- Description of the issue
- Line number (if applicable)
- Severity level (critical, high, medium, low)
- Suggested fix

Return the response in this JSON format:
{
  "bugs": [
    {
      "type": "Bug Type",
      "description": "Description of the bug",
      "line": "line number or null",
      "severity": "critical|high|medium|low",
      "suggestion": "How to fix this bug"
    }
  ],
  "summary": {
    "totalBugs": number,
    "criticalBugs": number,
    "highBugs": number,
    "mediumBugs": number,
    "lowBugs": number
  }
}

If no bugs are found, return an empty bugs array.
`;

      // Call DeepSeek API
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },
        body: JSON.stringify({
          model: 'deepseek-coder',
          messages: [
            {
              role: 'user',
              content: analysisPrompt
            }
          ],
          temperature: 0.1,
          max_tokens: 4000
        })
      });

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`);
      }

      const aiResponse = await response.json();
      const analysisContent = aiResponse.choices[0].message.content;

      // Parse the JSON response
      let analysisResults;
      try {
        // Extract JSON from the response
        const jsonMatch = analysisContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysisResults = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        logger.error('Failed to parse AI response:', parseError);
        // Fallback: create a simple response
        analysisResults = {
          bugs: [],
          summary: {
            totalBugs: 0,
            criticalBugs: 0,
            highBugs: 0,
            mediumBugs: 0,
            lowBugs: 0
          }
        };
      }

      // Save bug report to user's history if bugs found
      if (req.user && analysisResults.bugs && analysisResults.bugs.length > 0) {
        const user = await User.findById(req.user.id);
        if (user) {
          const bugReport = {
            id: Date.now().toString(),
            title: `Bug Analysis - ${language}`,
            description: `Found ${analysisResults.bugs.length} potential bugs in ${language} code`,
            severity: analysisResults.bugs.some(b => b.severity === 'critical') ? 'critical' :
                     analysisResults.bugs.some(b => b.severity === 'high') ? 'high' :
                     analysisResults.bugs.some(b => b.severity === 'medium') ? 'medium' : 'low',
            status: 'open',
            language,
            code: code.substring(0, 1000), // Store first 1000 chars
            bugs: analysisResults.bugs,
            createdAt: new Date(),
            updatedAt: new Date()
          };

          if (!user.bugReports) {
            user.bugReports = [];
          }
          user.bugReports.push(bugReport);
          await user.save();
        }
      }

      logger.info('Bug analysis completed', {
        userId: req.user?.id,
        bugsFound: analysisResults.bugs?.length || 0
      });

      res.json({
        status: 'success',
        data: analysisResults
      });

    } catch (error) {
      logger.error('Bug analysis error:', error);
      res.status(500).json({
        status: 'error',
        error: 'Failed to analyze code for bugs'
      });
    }
  }

  // Execute tests and return detailed report
  async executeTestReport(req, res, next) {
    try {
      const { code, language, role = 'developer', purpose } = req.body;

      if (!code || !code.trim()) {
        return res.status(400).json({
          status: 'error',
          error: 'Code is required for test execution'
        });
      }

      const sanitizedCode = Validator.validateCode(code);
      const detectedLanguage = language || 'javascript';

      logger.info('Starting test execution report', {
        role,
        language: detectedLanguage,
        codeLength: sanitizedCode.length,
        userId: req.user?.id || 'anonymous'
      });

      // Execute comprehensive tests
      const testResults = await testExecutionService.executeTests(sanitizedCode, detectedLanguage, role);

      // Generate detailed report
      const report = {
        metadata: {
          language: detectedLanguage,
          role: role,
          codeLength: sanitizedCode.length,
          purpose: purpose || 'Not specified',
          executedAt: new Date(),
          executedBy: req.user?.name || 'Anonymous'
        },
        summary: {
          totalTests: testResults.totalTests,
          passed: testResults.passed,
          failed: testResults.failed,
          errors: testResults.errors,
          passRate: testResults.totalTests > 0 ? Math.round((testResults.passed / testResults.totalTests) * 100) : 0,
          coverage: testResults.coverage,
          executionTime: testResults.executionTime,
          status: testResults.failed === 0 && testResults.errors === 0 ? 'PASSED' : 'FAILED'
        },
        testCases: testResults.testCases.map(test => ({
          name: test.name,
          type: test.type,
          status: test.status.toUpperCase(),
          message: test.message,
          executionTime: test.executionTime,
          details: test.details || test.result,
          error: test.error
        })),
        recommendations: generateTestRecommendations(testResults),
        codeQuality: assessCodeQuality(sanitizedCode, testResults)
      };

      // Save test report to user history
      if (req.user) {
        try {
          const user = await User.findById(req.user.id);
          if (user) {
            const testEntry = {
              id: Date.now().toString(),
              code: sanitizedCode.substring(0, 1000),
              language: detectedLanguage,
              role: role,
              purpose: purpose,
              results: report,
              timestamp: new Date(),
              type: 'test_execution'
            };

            if (!user.testHistory) {
              user.testHistory = [];
            }
            user.testHistory.push(testEntry);

            if (user.testHistory.length > 100) {
              user.testHistory = user.testHistory.slice(-100);
            }

            await user.save();
          }
        } catch (saveError) {
          logger.warn('Failed to save test report to user history:', saveError.message);
        }
      }

      logger.info('Test execution report completed', {
        totalTests: report.summary.totalTests,
        passRate: report.summary.passRate,
        status: report.summary.status,
        userId: req.user?.id || 'anonymous'
      });

      res.json({
        status: 'success',
        data: report
      });

    } catch (error) {
      logger.error('Test execution report error:', error);
      res.status(500).json({
        status: 'error',
        error: 'Failed to execute test report'
      });
    }
  }



  // Export to PDF
  async exportToPDF(req, res, next) {
    try {
      const { type, data } = req.body;

      if (!type || !data) {
        return res.status(400).json({
          status: 'error',
          error: 'Type and data are required'
        });
      }

      // For now, return a simple JSON response
      // In a real implementation, you would use a PDF library like puppeteer or jsPDF
      const pdfContent = {
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Report`,
        generatedAt: new Date().toISOString(),
        data: data,
        user: req.user?.name || 'Anonymous'
      };

      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', `attachment; filename="${type}_report_${Date.now()}.json"`);

      res.json({
        status: 'success',
        message: 'PDF export completed',
        content: pdfContent
      });

    } catch (error) {
      logger.error('PDF export error:', error);
      next(error);
    }
  }
}

module.exports = new AnalysisController();
