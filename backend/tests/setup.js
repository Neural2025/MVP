// Test setup file
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.DEEPSEEK_API_KEY = 'test-key';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      choices: [{
        message: {
          content: JSON.stringify({
            security: ['No security issues found'],
            performance: ['Code performance is good'],
            optimization: ['Code is well optimized'],
            functionality: ['Code meets requirements']
          })
        }
      }]
    }),
  })
);

beforeEach(() => {
  fetch.mockClear();
});
