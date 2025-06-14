const Validator = require('../utils/validator');
const deepseekService = require('../services/deepseekService');
const logger = require('../utils/logger');
const User = require('../models/User');
const githubService = require('../services/githubService');
const fileUploadService = require('../services/fileUploadService');

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
}

module.exports = new AnalysisController();
