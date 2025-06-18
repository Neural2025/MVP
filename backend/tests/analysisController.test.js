const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const analysisController = require('../controllers/analysisController');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Create test app
const app = express();
app.use(express.json());

// Mock middleware
const mockAuth = (req, res, next) => {
  req.user = { id: 'test-user-id', name: 'Test User', email: 'test@example.com' };
  next();
};

// Test routes
app.post('/api/analyze', mockAuth, analysisController.analyzeCode);
app.post('/api/generate-role-tests', mockAuth, analysisController.generateRoleBasedTests);
app.post('/api/analyze-bugs', mockAuth, analysisController.analyzeBugs);
app.get('/api/user/stats', mockAuth, analysisController.getUserStats);
app.get('/api/bug-reports', mockAuth, analysisController.getBugReports);
app.get('/api/test-history', mockAuth, analysisController.getTestHistory);

// Mock User model
jest.mock('../models/User');
jest.mock('../services/deepseekService');

describe('Analysis Controller Tests', () => {
  let mockUser;

  beforeEach(() => {
    mockUser = {
      id: 'test-user-id',
      name: 'Test User',
      email: 'test@example.com',
      analysisHistory: [
        {
          code: 'function test() { return "hello"; }',
          language: 'javascript',
          timestamp: new Date(),
          results: { security: ['No issues'], performance: ['Good'] }
        }
      ],
      testHistory: [
        {
          code: 'function add(a, b) { return a + b; }',
          language: 'javascript',
          timestamp: new Date(),
          tests: 'describe("add function", () => { it("should add numbers", () => {}); });'
        }
      ],
      bugReports: [
        {
          id: '1',
          title: 'Test Bug',
          description: 'Test bug description',
          severity: 'medium',
          status: 'open',
          createdAt: new Date()
        }
      ],
      save: jest.fn().mockResolvedValue(true),
      addAnalysisHistory: jest.fn().mockResolvedValue(true),
      addTestHistory: jest.fn().mockResolvedValue(true),
      addBugReport: jest.fn().mockResolvedValue(true),
      incrementAnalysisCount: jest.fn().mockResolvedValue(true),
      incrementTestGenerationCount: jest.fn().mockResolvedValue(true)
    };

    User.findById = jest.fn().mockResolvedValue(mockUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/analyze', () => {
    test('should analyze code successfully', async () => {
      const testCode = 'function hello() { console.log("Hello World"); }';
      
      const response = await request(app)
        .post('/api/analyze')
        .send({
          code: testCode,
          purpose: 'Test function',
          language: 'javascript'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });

    test('should handle missing code', async () => {
      const response = await request(app)
        .post('/api/analyze')
        .send({
          purpose: 'Test function',
          language: 'javascript'
        });

      expect(response.status).toBe(400);
      expect(response.body.status).toBe('error');
    });
  });

  describe('POST /api/generate-role-tests', () => {
    test('should generate developer tests', async () => {
      const testCode = 'function add(a, b) { return a + b; }';
      
      const response = await request(app)
        .post('/api/generate-role-tests')
        .send({
          code: testCode,
          purpose: 'Addition function',
          language: 'javascript',
          role: 'developer'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.role).toBe('developer');
    });

    test('should generate tester tests', async () => {
      const testCode = 'function validate(input) { return input.length > 0; }';
      
      const response = await request(app)
        .post('/api/generate-role-tests')
        .send({
          code: testCode,
          purpose: 'Input validation',
          language: 'javascript',
          role: 'tester'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.role).toBe('tester');
    });

    test('should handle GitHub URL', async () => {
      const response = await request(app)
        .post('/api/generate-role-tests')
        .send({
          githubUrl: 'https://github.com/test/repo',
          purpose: 'Test repository',
          language: 'javascript',
          role: 'developer'
        });

      // This will likely fail due to GitHub API, but we test the handling
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });

  describe('POST /api/analyze-bugs', () => {
    test('should analyze bugs in code', async () => {
      const buggyCode = 'function divide(a, b) { return a / b; }'; // No zero check
      
      const response = await request(app)
        .post('/api/analyze-bugs')
        .send({
          code: buggyCode,
          purpose: 'Division function',
          language: 'javascript'
        });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
    });
  });

  describe('GET /api/user/stats', () => {
    test('should return user statistics', async () => {
      const response = await request(app)
        .get('/api/user/stats');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.stats).toBeDefined();
      expect(response.body.stats.linesAnalyzed).toBeGreaterThanOrEqual(0);
      expect(response.body.stats.totalAnalyses).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/bug-reports', () => {
    test('should return user bug reports', async () => {
      const response = await request(app)
        .get('/api/bug-reports');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data.bugReports).toBeDefined();
      expect(Array.isArray(response.body.data.bugReports)).toBe(true);
    });
  });

  describe('GET /api/test-history', () => {
    test('should return user test history', async () => {
      const response = await request(app)
        .get('/api/test-history');

      expect(response.status).toBe(200);
      expect(response.body.status).toBe('success');
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
    });
  });
});

describe('Integration Tests', () => {
  test('should handle complete workflow', async () => {
    const testCode = `
function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price * item.quantity;
  }
  return total;
}
`;

    // 1. Analyze code
    const analysisResponse = await request(app)
      .post('/api/analyze')
      .send({
        code: testCode,
        purpose: 'Calculate shopping cart total',
        language: 'javascript'
      });

    expect(analysisResponse.status).toBe(200);

    // 2. Generate tests
    const testResponse = await request(app)
      .post('/api/generate-role-tests')
      .send({
        code: testCode,
        purpose: 'Calculate shopping cart total',
        language: 'javascript',
        role: 'developer'
      });

    expect(testResponse.status).toBe(200);

    // 3. Check for bugs
    const bugResponse = await request(app)
      .post('/api/analyze-bugs')
      .send({
        code: testCode,
        purpose: 'Calculate shopping cart total',
        language: 'javascript'
      });

    expect(bugResponse.status).toBe(200);

    // 4. Get updated stats
    const statsResponse = await request(app)
      .get('/api/user/stats');

    expect(statsResponse.status).toBe(200);
  });
});
