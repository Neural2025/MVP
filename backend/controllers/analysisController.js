const Validator = require('../utils/validator');
const deepseekService = require('../services/deepseekService');
const logger = require('../utils/logger');
const User = require('../models/User');

class AnalysisController {
  async analyzeCode(req, res, next) {
    try {
      const { code, purpose } = req.body;

      // Validate inputs
      const sanitizedCode = Validator.validateCode(code);
      const sanitizedPurpose = Validator.validatePurpose(purpose);

      // Note: Removed JavaScript-only syntax validation to support any programming language

      logger.info('Starting code analysis', {
        codeLength: sanitizedCode.length,
        purposeLength: sanitizedPurpose.length,
        userId: req.user?.id || 'anonymous'
      });

      // Perform analysis using DeepSeek API
      const analysisResult = await deepseekService.analyzeCode(sanitizedCode, sanitizedPurpose);

      // Update user analysis count if authenticated
      if (req.user) {
        try {
          await req.user.incrementAnalysisCount();
        } catch (error) {
          logger.warn('Failed to update user analysis count:', error);
        }
      }

      res.json({
        status: 'success',
        data: analysisResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Analysis error:', error);
      next(error);
    }
  }

  async generateTests(req, res, next) {
    try {
      const { code, purpose } = req.body;

      // Validate inputs
      const sanitizedCode = Validator.validateCode(code);
      const sanitizedPurpose = Validator.validatePurpose(purpose);



      logger.info('Starting test generation', {
        codeLength: sanitizedCode.length,
        purposeLength: sanitizedPurpose.length,
        userId: req.user?.id || 'anonymous'
      });

      // Generate tests using DeepSeek API
      const testResult = await deepseekService.generateTests(sanitizedCode, sanitizedPurpose);

      // Update user test generation count if authenticated
      if (req.user) {
        try {
          await req.user.incrementTestGenerationCount();
        } catch (error) {
          logger.warn('Failed to update user test generation count:', error);
        }
      }

      res.json({
        status: 'success',
        data: testResult,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      logger.error('Test generation error:', error);
      next(error);
    }
  }
}

module.exports = new AnalysisController();
