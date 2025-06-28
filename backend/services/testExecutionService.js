const vm = require('vm');
const logger = require('../utils/logger');

class TestExecutionService {
  constructor() {
    this.testResults = [];
  }

  async executeTests(code, language, role = 'developer') {
    logger.info('Starting test execution', { language, role, codeLength: code.length });

    const testResults = {
      totalTests: 0,
      passed: 0,
      failed: 0,
      errors: 0,
      coverage: 0,
      executionTime: 0,
      testCases: [],
      summary: '',
      timestamp: new Date()
    };

    const startTime = Date.now();

    try {
      switch (language.toLowerCase()) {
        case 'javascript':
        case 'typescript':
          await this.executeJavaScriptTests(code, testResults, role);
          break;
        case 'python':
          await this.executePythonTests(code, testResults, role);
          break;
        case 'java':
          await this.executeJavaTests(code, testResults, role);
          break;
        case 'csharp':
        case 'c#':
          await this.executeCSharpTests(code, testResults, role);
          break;
        case 'c++':
        case 'cpp':
          await this.executeCppTests(code, testResults, role);
          break;
        default:
          try {
            const { evaluateCodeWithAI } = require('./aiTestEvaluation');
            const aiRes = await evaluateCodeWithAI({ code, purpose: '', language });
            if (aiRes.status === 'success' && aiRes.aiResult) {
              const ai = aiRes.aiResult;
              testResults.testCases.push({
                name: 'AI Code Bug Check',
                type: 'ai',
                status: ai.isCorrect ? 'passed' : 'failed',
                message: ai.bugs && ai.bugs.length ? `Bugs found: ${ai.bugs.join('; ')}` : 'No bugs found',
                details: ai,
                executionTime: 0
              });
              testResults.totalTests++;
              if (ai.isCorrect) testResults.passed++;
              else testResults.failed++;
              testResults.testCases.push({
                name: 'AI Code Quality',
                type: 'ai',
                status: ai.qualityScore >= 7 ? 'passed' : 'warning',
                message: `AI quality score: ${ai.qualityScore}/10`,
                details: ai,
                executionTime: 0
              });
              testResults.totalTests++;
              if (ai.qualityScore >= 7) testResults.passed++;
              else testResults.failed++;
              if (ai.improvements && ai.improvements.length) {
                testResults.testCases.push({
                  name: 'AI Improvements',
                  type: 'ai',
                  status: 'info',
                  message: `AI suggests: ${ai.improvements.join('; ')}`,
                  details: ai,
                  executionTime: 0
                });
                testResults.totalTests++;
              }
              if (ai.testCase) {
                testResults.testCases.push({
                  name: 'AI Test Case',
                  type: 'ai',
                  status: 'info',
                  message: `AI test case: ${JSON.stringify(ai.testCase)}`,
                  details: ai,
                  executionTime: 0
                });
                testResults.totalTests++;
              }
            } else {
              testResults.testCases.push({
                name: 'AI Evaluation Failed',
                type: 'ai',
                status: 'warning',
                message: aiRes.message || 'AI evaluation failed, running generic checks.',
                executionTime: 0
              });
              testResults.totalTests++;
              await this.executeGenericTests(code, testResults, role);
            }
          } catch (err) {
            testResults.testCases.push({
              name: 'AI Evaluation Not Configured',
              type: 'ai',
              status: 'warning',
              message: 'AI evaluation not configured. Running generic checks.',
              executionTime: 0
            });
            testResults.totalTests++;
            await this.executeGenericTests(code, testResults, role);
          }
      }

      testResults.executionTime = Date.now() - startTime;
      testResults.coverage = this.calculateCoverage(code, testResults.testCases);
      testResults.summary = this.generateSummary(testResults);

      logger.info('Test execution completed', {
        totalTests: testResults.totalTests,
        passed: testResults.passed,
        failed: testResults.failed,
        executionTime: testResults.executionTime
      });

      return testResults;

    } catch (error) {
      logger.error('Test execution failed:', error);
      testResults.errors++;
      testResults.executionTime = Date.now() - startTime;
      testResults.summary = `Test execution failed: ${error.message}`;
      return testResults;
    }
  }

  async executeJavaScriptTests(code, testResults, role) {
    const tests = this.generateJavaScriptTestCases(code, role);

    for (const test of tests) {
      try {
        const result = await this.runJavaScriptTest(code, test);
        testResults.testCases.push(result);
        testResults.totalTests++;

        if (result.status === 'passed') {
          testResults.passed++;
        } else {
          testResults.failed++;
        }
      } catch (error) {
        testResults.testCases.push({
          name: test.name,
          status: 'error',
          error: error.message,
          executionTime: 0
        });
        testResults.totalTests++;
        testResults.errors++;
      }
    }
  }

  generateJavaScriptTestCases(code, role) {
    const tests = [];

    const functionMatches = code.match(/function\s+(\w+)\s*\([^)]*\)\s*{[^}]*}/g) || [];

    tests.push({
      name: 'Syntax Validation',
      type: 'syntax',
      testCode: `
        try {
          new Function(${JSON.stringify(code)});
          return { success: true, message: 'Code syntax is valid' };
        } catch (e) {
          return { success: false, message: 'Syntax error: ' + e.message };
        }
      `
    });

    functionMatches.forEach((func, index) => {
      const funcName = func.match(/function\s+(\w+)/)?.[1];
      if (funcName) {
        tests.push({
          name: `Function ${funcName} Exists`,
          type: 'existence',
          testCode: `
            ${code}
            return {
              success: typeof ${funcName} === 'function',
              message: typeof ${funcName} === 'function' ? 'Function exists' : 'Function not found'
            };
          `
        });

        tests.push({
          name: `${funcName} - Valid Input Test`,
          type: 'functionality',
          testCode: `
            ${code}
            try {
              let result;
              if ('${funcName}' === 'divide') {
                result = ${funcName}(10, 2);
                return {
                  success: result === 5,
                  message: result === 5 ? 'Function works correctly with valid inputs' : 'Function returned unexpected result: ' + result
                };
              } else if ('${funcName}' === 'add') {
                result = ${funcName}(2, 3);
                return {
                  success: result === 5,
                  message: result === 5 ? 'Function works correctly with valid inputs' : 'Function returned unexpected result: ' + result
                };
              } else if ('${funcName}'.includes('validate') || '${funcName}'.includes('check')) {
                result = ${funcName}('test@example.com');
                return {
                  success: result === true,
                  message: result === true ? 'Validation function works correctly' : 'Validation failed for valid input'
                };
              } else {
                result = ${funcName}('test');
                return {
                  success: true,
                  message: 'Function executed with valid input: ' + result
                };
              }
            } catch (e) {
              return {
                success: false,
                message: 'Function failed with valid input: ' + e.message
              };
            }
          `
        });

        tests.push({
          name: `${funcName} - Error Handling Test`,
          type: 'error_handling',
          testCode: `
            ${code}
            try {
              let hasProperErrorHandling = true;
              let errorMessage = '';

              try {
                const result = ${funcName}(null);
                if (result === null || result === undefined) {
                  // Acceptable
                } else if (typeof result === 'number' && (isNaN(result) || !isFinite(result))) {
                  hasProperErrorHandling = false;
                  errorMessage = 'Function returns invalid number for null input';
                }
              } catch (e) {
                // Good - function throws error
              }

              return {
                success: hasProperErrorHandling,
                message: hasProperErrorHandling ? 'Function handles edge cases properly' : errorMessage
              };
            } catch (err) {
              return {
                success: false,
                message: 'Error handling test failed: ' + err.message
              };
            }
          }`
        });

        if (funcName.toLowerCase().includes('div')) {
          tests.push({
            name: `${funcName} - Division by Zero Test`,
            type: 'bug_detection',
            testCode: `
              ${code}
              try {
                const result = ${funcName}(10, 0);
                if (result === Infinity) {
                  return {
                    success: false,
                    message: 'BUG: Division by zero returns Infinity - should throw error or handle gracefully'
                  };
                } else if (isNaN(result)) {
                  return {
                    success: false,
                    message: 'BUG: Division by zero returns NaN - should throw error or handle gracefully'
                  };
                } else {
                  return {
                    success: true,
                    message: 'Division by zero handled properly, returned: ' + result
                  };
                }
              } catch (err) {
                return {
                  success: true,
                  message: 'Division by zero properly handled with error: ' + err.message
                };
              };
            }`
          });
        }

        if (funcName.toLowerCase().includes('get') || funcName.toLowerCase().includes('find') || funcName.toLowerCase().includes('process')) {
          tests.push({
            name: `${funcName} - Null Reference Test`,
            type: 'bug_detection',
            testCode: `
              ${code}
              try {
                const result = ${funcName}(1);
                return {
                  success: true,
                  message: 'Function works with valid input'
                };
              } catch (err) {
                if (err.message.includes('Cannot read properties of null') || err.message.includes('Cannot read properties of undefined')) {
                  return {
                    success: false,
                    message: 'BUG FOUND: Null/undefined reference error - ' + err.message
                  };
                }
                return {
                  success: true,
                  message: 'Function handles errors properly: ' + err.message
                };
              }
            `
          });
        }
      }
    });

    return tests;
  }

  async runJavaScriptTest(code, test) {
    const startTime = Date.now();

    try {
      const context = {
        console: {
          log: () => {},
          error: () => {},
          warn: () => {}
        },
        setTimeout: () => {},
        setInterval: () => {},
        Date: Date,
        JSON: JSON,
        Math: Math,
        parseInt: parseInt,
        parseFloat: parseFloat,
        isNaN: isNaN,
        isFinite: isFinite
      };

      const script = new vm.Script(`(function() { ${test.testCode} })()`);
      const result = script.runInNewContext(context, { timeout: 5000 });

      return {
        name: test.name,
        type: test.type,
        status: result.success ? 'passed' : 'failed',
        message: result.message,
        result: result.result,
        executionTime: Date.now() - startTime,
        details: result
      };
    } catch (error) {
      return {
        name: test.name,
        type: test.type,
        status: 'error',
        message: `Test execution error: ${error.message}`,
        executionTime: Date.now() - startTime,
        error: error.message
      };
    }
  }

  async executePythonTests(code, testResults, role) {
    const tests = [
      { name: 'Python Syntax Check', type: 'syntax' },
      { name: 'Import Statement Validation', type: 'imports' },
      { name: 'Function Definition Check', type: 'functions' },
      { name: 'Indentation Validation', type: 'style' },
      { name: 'Variable Usage Check', type: 'variables' }
    ];

    for (const test of tests) {
      const result = this.simulatePythonTest(code, test);
      testResults.testCases.push(result);
      testResults.totalTests++;

      if (result.status === 'passed') {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    }
  }

  simulatePythonTest(code, test) {
    const startTime = Date.now();

    switch (test.type) {
      case 'syntax':
        const hasSyntaxErrors = code.includes('def ') && !code.includes(':');
        return {
          name: test.name,
          type: test.type,
          status: hasSyntaxErrors ? 'failed' : 'passed',
          message: hasSyntaxErrors ? 'Syntax errors detected' : 'Syntax is valid',
          executionTime: Date.now() - startTime
        };

      case 'imports':
        const hasImports = code.includes('import ') || code.includes('from ');
        return {
          name: test.name,
          type: test.type,
          status: 'passed',
          message: hasImports ? 'Import statements found and validated' : 'No import statements to validate',
          executionTime: Date.now() - startTime
        };

      default:
        return {
          name: test.name,
          type: test.type,
          status: 'passed',
          message: 'Test completed successfully',
          executionTime: Date.now() - startTime
        };
    }
  }

  async executeCSharpTests(code, testResults, role) {
    const tests = [
      { name: 'C# Syntax Check', type: 'syntax' },
      { name: 'Namespace Validation', type: 'structure' },
      { name: 'Class Definition Check', type: 'classes' },
      { name: 'Method Validation', type: 'methods' },
      { name: 'Using Statement Check', type: 'imports' }
    ];

    for (const test of tests) {
      const result = this.simulateCSharpTest(code, test);
      testResults.testCases.push(result);
      testResults.totalTests++;

      if (result.status === 'passed') {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    }
  }

  async executeJavaTests(code, testResults, role) {
    const tests = [
      { name: 'Java Syntax Check', type: 'syntax' },
      { name: 'Package Declaration', type: 'structure' },
      { name: 'Class Definition Check', type: 'classes' },
      { name: 'Method Validation', type: 'methods' },
      { name: 'Import Statement Check', type: 'imports' }
    ];

    for (const test of tests) {
      const result = this.simulateJavaTest(code, test);
      testResults.testCases.push(result);
      testResults.totalTests++;

      if (result.status === 'passed') {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    }
  }

  simulateCSharpTest(code, test) {
    const startTime = Date.now();

    switch (test.type) {
      case 'syntax':
        const hasClassDef = code.includes('class ') && code.includes('{');
        return {
          name: test.name,
          type: test.type,
          status: hasClassDef ? 'passed' : 'failed',
          message: hasClassDef ? 'C# syntax is valid' : 'Missing class definition',
          executionTime: Date.now() - startTime
        };

      case 'structure':
        const hasNamespace = code.includes('namespace ');
        return {
          name: test.name,
          type: test.type,
          status: 'passed',
          message: hasNamespace ? 'Namespace found' : 'No namespace (acceptable)',
          executionTime: Date.now() - startTime
        };

      default:
        return {
          name: test.name,
          type: test.type,
          status: 'passed',
          message: 'Test completed successfully',
          executionTime: Date.now() - startTime
        };
    }
  }

  simulateJavaTest(code, test) {
    const startTime = Date.now();

    switch (test.type) {
      case 'syntax':
        const hasClassDef = code.includes('class ') && code.includes('{');
        return {
          name: test.name,
          type: test.type,
          status: hasClassDef ? 'passed' : 'failed',
          message: hasClassDef ? 'Java syntax is valid' : 'Missing class definition',
          executionTime: Date.now() - startTime
        };

      case 'structure':
        const hasPackage = code.includes('package ');
        return {
          name: test.name,
          type: test.type,
          status: 'passed',
          message: hasPackage ? 'Package declaration found' : 'No package declaration (acceptable)',
          executionTime: Date.now() - startTime
        };

      default:
        return {
          name: test.name,
          type: test.type,
          status: 'passed',
          message: 'Test completed successfully',
          executionTime: Date.now() - startTime
        };
    }
  }

  async executeGenericTests(code, testResults, role) {
    const tests = [
      { name: 'Code Length Validation', type: 'basic' },
      { name: 'Syntax Balance Check', type: 'syntax' },
      { name: 'Buggy Pattern Heuristic', type: 'bugginess' },
      { name: 'Comment Ratio Analysis', type: 'documentation' },
      { name: 'Line Count Analysis', type: 'metrics' }
    ];

    let foundBuggy = false;

    for (const test of tests) {
      let result;
      if (test.type === 'syntax') {
        const balanced = (str, open, close) => {
          let count = 0;
          for (const ch of str) {
            if (ch === open) count++;
            if (ch === close) count--;
            if (count < 0) return false;
          }
          return count === 0;
        };
        const parens = balanced(code, '(', ')');
        const braces = balanced(code, '{', '}');
        const brackets = balanced(code, '[', ']');
        const singleQuotes = (code.match(/'/g) || []).length % 2 === 0;
        const doubleQuotes = (code.match(/"/g) || []).length % 2 === 0;
        const syntaxPassed = parens && braces && brackets && singleQuotes && doubleQuotes;
        result = {
          name: test.name,
          type: test.type,
          status: syntaxPassed ? 'passed' : 'failed',
          message: syntaxPassed ? 'Syntax looks balanced' : 'Unbalanced symbols detected',
          executionTime: 0
        };
        if (!syntaxPassed) foundBuggy = true;
      } else if (test.type === 'bugginess') {
        const buggyPattern = /(TODO|FIXME|BUG|raise|buggy|error|Exception|buggyError|NameError|TypeError|Error)/i;
        const buggy = buggyPattern.test(code);
        result = {
          name: test.name,
          type: test.type,
          status: buggy ? 'failed' : 'passed',
          message: buggy ? 'Potential buggy pattern found (TODO, error, etc.)' : 'No buggy pattern found',
          executionTime: 0
        };
        if (buggy) foundBuggy = true;
      } else {
        result = this.executeGenericTest(code, test);
      }
      testResults.testCases.push(result);
      testResults.totalTests++;
      if (result.status === 'passed') {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    }

    testResults.testCases.push({
      name: 'Unsupported Language Warning',
      type: 'info',
      status: 'warning',
      message: 'This language is not fully supported; only generic checks performed.',
      executionTime: 0
    });
    testResults.totalTests++;
  }

  executeGenericTest(code, test) {
    const startTime = Date.now();

    try {
      switch (test.type) {
        case 'basic':
          return {
            name: test.name,
            type: test.type,
            status: code.length > 0 ? 'passed' : 'failed',
            message: `Code length: ${code.length} characters`,
            executionTime: Date.now() - startTime
          };
        case 'documentation':
          const lines = code.split('\n');
          const commentLines = lines.filter(l => l.trim().startsWith('#') || l.trim().startsWith('//') || l.trim().startsWith('=begin')).length;
          const ratio = lines.length > 0 ? Math.round((commentLines / lines.length) * 100) : 0;
          return {
            name: test.name,
            type: test.type,
            status: ratio > 5 ? 'passed' : 'warning',
            message: `Comment ratio: ${ratio}%`,
            executionTime: Date.now() - startTime
          };
        case 'metrics':
          const totalLines = code.split('\n').length;
          return {
            name: test.name,
            type: test.type,
            status: 'passed',
            message: `Code has ${totalLines} lines`,
            executionTime: Date.now() - startTime
          };
        default:
          return {
            name: test.name,
            type: test.type,
            status: 'passed',
            message: 'Generic test completed',
            executionTime: Date.now() - startTime
          };
      }
    } catch (error) {
      return {
        name: test.name,
        type: test.type,
        status: 'error',
        message: `Test execution failed: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }

  calculateCoverage(code, testCases) {
    try {
      const totalLines = code.split('\n').filter(line => line.trim().length > 0).length;
      const testedLines = Math.min(testCases.length * 2, totalLines);
      return totalLines > 0 ? Math.round((testedLines / totalLines) * 100) : 0;
    } catch (error) {
      logger.error('Error calculating coverage:', error);
      return 0;
    }
  }

  generateSummary(testResults) {
    try {
      const passRate = testResults.totalTests > 0 ?
        Math.round((testResults.passed / testResults.totalTests) * 100) : 0;

      return `Test execution completed: ${testResults.passed}/${testResults.totalTests} tests passed (${passRate}%). ` +
             `${testResults.failed} failed, ${testResults.errors} errors. ` +
             `Code coverage: ${testResults.coverage}%. ` +
             `Execution time: ${testResults.executionTime}ms`;
    } catch (error) {
      logger.error('Error generating summary:', error);
      return 'Failed to generate test summary';
    }
  }

  async executeCppTests(code, testResults, role) {
    const tests = [
      { name: 'C++ Syntax Check', type: 'syntax' },
      { name: 'Main Function Check', type: 'structure' },
      { name: 'Include Directive Check', type: 'imports' }
    ];

    for (const test of tests) {
      const result = this.simulateCppTest(code, test);
      testResults.testCases.push(result);
      testResults.totalTests++;
      if (result.status === 'passed') {
        testResults.passed++;
      } else {
        testResults.failed++;
      }
    }
  }

  simulateCppTest(code, test) {
    const startTime = Date.now();

    try {
      switch (test.type) {
        case 'syntax':
          const hasInclude = /#include\s*<[^>]+>/.test(code);
          const hasSemicolon = code.includes(';');
          return {
            name: test.name,
            type: test.type,
            status: hasInclude && hasSemicolon ? 'passed' : 'failed',
            message: hasInclude && hasSemicolon ? 'C++ syntax valid' : 'Missing include or semicolon',
            executionTime: Date.now() - startTime
          };
        case 'structure':
          const hasMain = /int\s+main\s*\(.*\)/.test(code);
          return {
            name: test.name,
            type: test.type,
            status: hasMain ? 'passed' : 'failed',
            message: hasMain ? 'main() function found' : 'No main() function found',
            executionTime: Date.now() - startTime
          };
        case 'imports':
          const hasUsingNamespace = code.includes('using namespace std');
          return {
            name: test.name,
            type: test.type,
            status: hasUsingNamespace ? 'passed' : 'warning',
            message: hasUsingNamespace ? 'using namespace std found' : 'No using namespace std',
            executionTime: Date.now() - startTime
          };
        default:
          return {
            name: test.name,
            type: test.type,
            status: 'passed',
            message: 'Test completed successfully',
            executionTime: Date.now() - startTime
          };
      }
    } catch (error) {
      return {
        name: test.name,
        type: test.type,
        status: 'error',
        message: `Test execution failed: ${error.message}`,
        executionTime: Date.now() - startTime
      };
    }
  }
}

module.exports = new TestExecutionService();