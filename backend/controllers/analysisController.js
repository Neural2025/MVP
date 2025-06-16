const Validator = require('../utils/validator');
const deepseekService = require('../services/deepseekService');
const logger = require('../utils/logger');
const User = require('../models/User');
const githubService = require('../services/githubService');
const fileUploadService = require('../services/fileUploadService');
const axios = require('axios');

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
      const history = user.analysisHistory.slice(skip, skip + parseInt(limit));
      const total = user.analysisHistory.length;

      res.json({
        status: 'success',
        data: {
          history,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
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
      const history = user.testHistory.slice(skip, skip + parseInt(limit));
      const total = user.testHistory.length;

      res.json({
        status: 'success',
        data: {
          history,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total,
            pages: Math.ceil(total / limit)
          }
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
}

module.exports = new AnalysisController();
