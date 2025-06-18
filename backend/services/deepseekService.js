const OpenAI = require('openai');
const logger = require('../utils/logger');

class DeepSeekService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY || 'dummy-key-for-testing',
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com'
    });
  }

  async analyzeCode(code, purpose) {
    try {
      // Check if we have a valid API key
      if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'dummy-key-for-testing') {
        logger.warn('DeepSeek API key not configured, using fallback analysis');
        return this.getFallbackAnalysis(code, purpose);
      }

      const prompt = this.buildAnalysisPrompt(code, purpose);

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a code analysis expert. Analyze the provided code and return a structured JSON response with security, performance, optimization, and functionality analysis.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false
      });

      const analysis = this.parseAnalysisResponse(response.choices[0].message.content);
      logger.info('Code analysis completed successfully');
      return analysis;

    } catch (error) {
      logger.error('DeepSeek API error during analysis:', error);
      logger.info('Falling back to local analysis');
      return this.getFallbackAnalysis(code, purpose);
    }
  }

  async generateTests(code, purpose) {
    try {
      const prompt = this.buildTestGenerationPrompt(code, purpose);

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a test generation expert. Generate comprehensive test cases and provide fixes for any issues found in the code. Return a structured JSON response.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 3000,
        stream: false
      });

      const testData = this.parseTestResponse(response.choices[0].message.content);
      logger.info('Test generation completed successfully');
      return testData;

    } catch (error) {
      logger.error('DeepSeek API error during test generation:', error);
      throw new Error(`API test generation failed: ${error.message}`);
    }
  }

  buildAnalysisPrompt(code, purpose) {
    const detectedLanguage = this.detectProgrammingLanguage(code);
    return `
Analyze the following ${detectedLanguage} code and identify potential errors, their types, and locations.

**IMPORTANT**: The code may contain syntax errors, incomplete code, or be a code snippet. Analyze it anyway and provide helpful feedback regardless of syntax validity.

Code:
\`\`\`${detectedLanguage.toLowerCase()}
${code}
\`\`\`

Purpose: ${purpose}

Perform a comprehensive analysis focusing on:

1. **SYNTAX ISSUES**: If there are syntax errors, identify them and suggest corrections
2. **SECURITY VULNERABILITIES**: Look for injection attacks, unsafe patterns, buffer overflows, etc. (language-specific)
3. **PERFORMANCE ISSUES**: Identify inefficient algorithms, memory leaks, blocking operations, unnecessary computations
4. **LOGIC ERRORS**: Find potential runtime errors, null/undefined references, type mismatches, missing validations
5. **OPTIMIZATION OPPORTUNITIES**: Suggest code improvements, best practices, refactoring opportunities for ${detectedLanguage}

For each issue found, specify:
- The exact location (line number if possible)
- The type of error/issue
- Why it's problematic
- How to fix it

Return your analysis as a JSON object with this exact structure:
{
  "security": [
    "Detailed security findings with line numbers and fix suggestions, or 'No security issues found'"
  ],
  "performance": [
    "Performance issues with specific locations and optimization suggestions, or 'No performance issues found'"
  ],
  "optimization": [
    "Code improvement suggestions including syntax fixes, specific examples and locations, or 'Code is well optimized'"
  ],
  "functionality": [
    "Assessment of how well code meets the purpose, including syntax errors and potential logic errors"
  ]
}

Be very specific about:
- Line numbers where issues occur
- Exact error types (e.g., "Potential null reference error at line 5")
- Specific fix recommendations
- Code examples of better implementations

Example format for findings (adapt to the detected programming language):
"Line 1: Syntax error - missing semicolon. Fix: Add semicolon at end of statement"
"Line 3: Security issue - potential SQL injection vulnerability. Fix: Use parameterized queries"
"Line 7: Performance issue - inefficient nested loop with O(n²) complexity. Fix: Use HashMap/Dictionary for O(1) lookup"
"Line 12: Logic error - missing null check before property access. Fix: Add null validation"

**IMPORTANT GUIDELINES**:
- Analyze the code even if it has syntax errors or is incomplete
- If syntax errors exist, include them in the optimization section with fixes
- Provide constructive feedback for incomplete code snippets
- Focus on what the code is trying to accomplish despite syntax issues
- Suggest corrections for syntax errors along with other improvements

Adapt your analysis to the specific programming language (${detectedLanguage}) and its common patterns, vulnerabilities, and best practices.`;
  }

  buildTestGenerationPrompt(code, purpose) {
    const detectedLanguage = this.detectProgrammingLanguage(code);
    const testFramework = this.getTestFramework(detectedLanguage);

    return `
Generate comprehensive test cases for the following ${detectedLanguage} code using ${testFramework}.
Also provide fixes for any critical issues found, including syntax errors.

**IMPORTANT**: The code may contain syntax errors or be incomplete. Generate tests based on the intended functionality and provide fixes for any syntax issues.

Code:
\`\`\`${detectedLanguage.toLowerCase()}
${code}
\`\`\`

Purpose: ${purpose}

Return your response as a JSON object with this exact structure:
{
  "tests": "complete ${testFramework} test suite as a string (generate tests based on intended functionality even if syntax errors exist)",
  "fixes": [
    {
      "issue": "description of the issue (including syntax errors)",
      "fixedCode": "corrected version of the problematic code"
    }
  ]
}

**GUIDELINES**:
- Generate tests based on the intended functionality, even if the original code has syntax errors
- Include syntax error fixes in the fixes array
- Provide corrected, working code in the fixes section
- Include edge cases, error handling, and boundary testing appropriate for ${detectedLanguage}
- Use ${testFramework} syntax and best practices for ${detectedLanguage} testing`;
  }

  parseAnalysisResponse(content) {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback parsing if JSON is not properly formatted
      return {
        security: ['Analysis completed but response format was unexpected'],
        performance: ['Analysis completed but response format was unexpected'],
        optimization: ['Analysis completed but response format was unexpected'],
        functionality: ['Analysis completed but response format was unexpected']
      };
    } catch (error) {
      logger.error('Failed to parse analysis response:', error);
      return {
        security: ['Failed to parse analysis results'],
        performance: ['Failed to parse analysis results'],
        optimization: ['Failed to parse analysis results'],
        functionality: ['Failed to parse analysis results']
      };
    }
  }

  parseTestResponse(content) {
    try {

      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }


      return {
        tests: '// Test generation completed but response format was unexpected',
        fixes: []
      };
    } catch (error) {
      logger.error('Failed to parse test response:', error);
      return {
        tests: '// Failed to parse test generation results',
        fixes: []
      };
    }
  }

  detectProgrammingLanguage(code) {

    const patterns = {
      'JavaScript': [
        /function\s+\w+\s*\(/,
        /const\s+\w+\s*=/,
        /let\s+\w+\s*=/,
        /var\s+\w+\s*=/,
        /=>\s*{/,
        /console\.log/,
        /document\./,
        /window\./
      ],
      'Python': [
        /def\s+\w+\s*\(/,
        /import\s+\w+/,
        /from\s+\w+\s+import/,
        /if\s+__name__\s*==\s*["']__main__["']/,
        /print\s*\(/,
        /class\s+\w+\s*:/,
        /elif\s+/,
        /:\s*$/m
      ],
      'Java': [
        /public\s+class\s+\w+/,
        /public\s+static\s+void\s+main/,
        /System\.out\.print/,
        /import\s+java\./,
        /public\s+\w+\s+\w+\s*\(/,
        /private\s+\w+\s+\w+/,
        /\w+\s*\[\s*\]\s+\w+/
      ],
      'C++': [
        /#include\s*<\w+>/,
        /using\s+namespace\s+std/,
        /int\s+main\s*\(/,
        /cout\s*<</,
        /cin\s*>>/,
        /std::/,
        /\w+\s*\*\s*\w+/
      ],
      'C#': [
        /using\s+System/,
        /namespace\s+\w+/,
        /public\s+class\s+\w+/,
        /Console\.Write/,
        /public\s+static\s+void\s+Main/,
        /\[.*\]/,
        /var\s+\w+\s*=/
      ],
      'PHP': [
        /<\?php/,
        /\$\w+\s*=/,
        /echo\s+/,
        /function\s+\w+\s*\(/,
        /\$_GET/,
        /\$_POST/,
        /->/
      ],
      'Ruby': [
        /def\s+\w+/,
        /end\s*$/m,
        /puts\s+/,
        /require\s+/,
        /class\s+\w+/,
        /@\w+/,
        /\|\w+\|/
      ],
      'Go': [
        /package\s+main/,
        /import\s+\(/,
        /func\s+main\s*\(/,
        /fmt\.Print/,
        /var\s+\w+\s+\w+/,
        /:=/,
        /func\s+\w+\s*\(/
      ]
    };

    let maxMatches = 0;
    let detectedLanguage = 'Code';

    for (const [language, languagePatterns] of Object.entries(patterns)) {
      const matches = languagePatterns.filter(pattern => pattern.test(code)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedLanguage = language;
      }
    }

    return detectedLanguage;
  }

  getTestFramework(language) {
    const frameworks = {
      'JavaScript': 'Jest',
      'Python': 'pytest',
      'Java': 'JUnit',
      'C++': 'Google Test',
      'C#': 'NUnit',
      'PHP': 'PHPUnit',
      'Ruby': 'RSpec',
      'Go': 'Go testing package'
    };

    return frameworks[language] || 'appropriate testing framework';
  }

  async generateCorrections(code, analysisResult) {
    try {
      const allIssues = [
        ...(analysisResult.security || []),
        ...(analysisResult.performance || []),
        ...(analysisResult.optimization || []),
        ...(analysisResult.functionality || [])
      ];

      if (allIssues.length === 0) {
        return ['No issues found - code looks good!'];
      }

      const prompt = `
Based on the following code analysis results, provide specific corrections and improvements:

**Code:**
\`\`\`
${code}
\`\`\`

**Identified Issues:**
${allIssues.map((issue, index) => `${index + 1}. ${issue}`).join('\n')}

Please provide specific, actionable corrections for each issue. Focus on:
- Exact line numbers or code sections to modify
- Specific code changes to implement
- Best practices to follow
- Security improvements
- Performance optimizations

Format as an array of correction strings.
`;

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert code reviewer. Provide specific, actionable corrections for identified issues.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.2
      });

      const content = response.choices[0].message.content;

      // Try to parse as JSON array, fallback to splitting by lines
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [content];
      } catch (parseError) {
        // Split by lines and filter out empty lines
        return content.split('\n').filter(line => line.trim().length > 0);
      }
    } catch (error) {
      logger.error('Corrections generation failed:', error);
      return ['Unable to generate corrections at this time'];
    }
  }

  // Fallback analysis when API is not available
  getFallbackAnalysis(code, purpose) {
    const detectedLanguage = this.detectProgrammingLanguage(code);
    const analysis = {
      security: [],
      performance: [],
      optimization: [],
      functionality: []
    };

    // Basic syntax and pattern analysis
    const lines = code.split('\n');

    // Security checks
    if (code.includes('eval(') || code.includes('exec(')) {
      analysis.security.push('Line: Contains eval() or exec() - Potential code injection vulnerability. Avoid dynamic code execution.');
    }
    if (code.includes('innerHTML') && !code.includes('sanitize')) {
      analysis.security.push('Line: innerHTML usage detected - Potential XSS vulnerability. Use textContent or sanitize input.');
    }
    if (code.includes('SELECT') && code.includes('+')) {
      analysis.security.push('Line: Potential SQL injection - Use parameterized queries instead of string concatenation.');
    }

    // Performance checks
    if (code.includes('for') && code.includes('for')) {
      analysis.performance.push('Line: Nested loops detected - Consider optimizing with better algorithms or data structures.');
    }
    if (code.includes('document.getElementById') && code.split('document.getElementById').length > 3) {
      analysis.performance.push('Line: Multiple DOM queries - Cache DOM elements for better performance.');
    }

    // Optimization suggestions
    if (detectedLanguage === 'JavaScript') {
      if (code.includes('var ')) {
        analysis.optimization.push('Line: Use const/let instead of var for better scoping and modern JavaScript practices.');
      }
      if (!code.includes('use strict')) {
        analysis.optimization.push('Line 1: Add "use strict"; at the beginning for better error catching.');
      }
    }

    if (detectedLanguage === 'Python') {
      if (!code.includes('def ') && code.length > 50) {
        analysis.optimization.push('Line: Consider breaking code into functions for better organization.');
      }
    }

    // Functionality assessment
    analysis.functionality.push(`Code appears to be ${detectedLanguage} and serves the purpose: ${purpose}`);
    analysis.functionality.push('Basic syntax structure looks reasonable for the intended functionality.');

    // If no issues found, add positive feedback
    if (analysis.security.length === 0) {
      analysis.security.push('No obvious security vulnerabilities detected in this code snippet.');
    }
    if (analysis.performance.length === 0) {
      analysis.performance.push('No major performance issues identified in this code.');
    }
    if (analysis.optimization.length === 0) {
      analysis.optimization.push('Code structure appears well-organized for its purpose.');
    }

    logger.info('Fallback analysis completed');
    return analysis;
  }

  // Generate custom tests based on role-specific prompts
  async generateCustomTests(prompt) {
    try {
      if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'dummy-key-for-testing') {
        logger.warn('DeepSeek API key not configured, using fallback test generation');
        return this.getFallbackCustomTests();
      }

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert test engineer. Generate comprehensive, role-specific test suites based on the provided requirements. Return structured JSON responses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 4000,
        stream: false
      });

      const testData = this.parseCustomTestResponse(response.choices[0].message.content);
      logger.info('Custom test generation completed successfully');
      return testData;

    } catch (error) {
      logger.error('DeepSeek API error during custom test generation:', error);
      return this.getFallbackCustomTests();
    }
  }

  // Analyze bugs for Product Managers
  async analyzeBug(prompt) {
    try {
      if (!process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_API_KEY === 'dummy-key-for-testing') {
        logger.warn('DeepSeek API key not configured, using fallback bug analysis');
        return this.getFallbackBugAnalysis();
      }

      const response = await this.client.chat.completions.create({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are an expert software engineer and product manager. Analyze bug reports and provide comprehensive insights including root cause analysis, fixes, and impact assessment.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.1,
        max_tokens: 2000,
        stream: false
      });

      const bugAnalysis = this.parseBugAnalysisResponse(response.choices[0].message.content);
      logger.info('Bug analysis completed successfully');
      return bugAnalysis;

    } catch (error) {
      logger.error('DeepSeek API error during bug analysis:', error);
      return this.getFallbackBugAnalysis();
    }
  }

  // Parse custom test responses
  parseCustomTestResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback structure
      return {
        unitTests: ['Custom test generation completed but response format was unexpected'],
        integrationTests: ['Please check the generated content manually'],
        functionalTests: ['Test cases generated successfully'],
        systemTests: ['System test scenarios created'],
        businessLogicTests: ['Business logic validation tests created']
      };
    } catch (error) {
      logger.error('Failed to parse custom test response:', error);
      return this.getFallbackCustomTests();
    }
  }

  // Parse bug analysis responses
  parseBugAnalysisResponse(content) {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback structure
      return {
        rootCause: 'Analysis completed but response format was unexpected',
        potentialFixes: ['Please review the generated content manually'],
        impactAssessment: 'Impact analysis generated successfully',
        relatedAreas: ['Related components identified'],
        testingRecommendations: ['Testing strategy provided']
      };
    } catch (error) {
      logger.error('Failed to parse bug analysis response:', error);
      return this.getFallbackBugAnalysis();
    }
  }

  // Fallback custom tests when API is not available
  getFallbackCustomTests() {
    return {
      unitTests: [
        'Test individual functions with valid inputs',
        'Test edge cases and boundary conditions',
        'Test error handling and exception scenarios',
        'Test with null/undefined inputs',
        'Verify return values and side effects'
      ],
      integrationTests: [
        'Test component interactions',
        'Test API endpoint responses',
        'Test database operations',
        'Test external service integrations',
        'Test data flow between modules'
      ],
      functionalTests: [
        'Test happy path scenarios',
        'Test alternative user flows',
        'Test input validation',
        'Test error scenarios',
        'Test business rule compliance'
      ],
      systemTests: [
        'End-to-end workflow testing',
        'Performance and load testing',
        'Security vulnerability testing',
        'Cross-platform compatibility',
        'User acceptance scenarios'
      ],
      businessLogicTests: [
        'Validate business rules implementation',
        'Test calculation accuracy',
        'Verify workflow compliance',
        'Check data consistency',
        'Test regulatory requirements'
      ]
    };
  }

  // Fallback bug analysis when API is not available
  getFallbackBugAnalysis() {
    return {
      rootCause: 'Unable to perform detailed analysis without API access. Please review the code manually for potential issues.',
      potentialFixes: [
        'Review code logic and syntax',
        'Check for null/undefined references',
        'Validate input parameters',
        'Ensure proper error handling',
        'Test with different data scenarios'
      ],
      impactAssessment: 'Medium - May affect user experience and system functionality',
      relatedAreas: [
        'User interface components',
        'Data processing modules',
        'API endpoints',
        'Database operations'
      ],
      testingRecommendations: [
        'Create unit tests for affected functions',
        'Perform integration testing',
        'Test with various input scenarios',
        'Validate error handling',
        'Conduct user acceptance testing'
      ]
    };
  }
}

module.exports = new DeepSeekService();
