// aiTestEvaluation.js
// This service uses OpenAI (or compatible) API to evaluate code correctness and quality for unsupported languages.
// It returns an AI-generated assessment and suggested test results.

const deepseekService = require('./deepseekService');

// Evaluate code using DeepSeek API for correctness and quality (for unsupported languages)
async function evaluateCodeWithAI({ code, purpose, language }) {
  try {
    const analysis = await deepseekService.analyzeCode(code, purpose);
    // Format the response into a unified AI result structure
    const bugs = [];
    let isCorrect = true;
    let improvements = [];
    let qualityScore = 8; // Default, adjust below
    let testCase = null;

    // Collect bugs from all categories
    ['security', 'performance', 'optimization', 'functionality'].forEach(cat => {
      if (Array.isArray(analysis[cat])) {
        analysis[cat].forEach(item => {
          if (typeof item === 'string' && !item.toLowerCase().includes('no') && !item.toLowerCase().includes('none')) {
            bugs.push(item);
          }
        });
      }
    });
    if (bugs.length > 0) isCorrect = false;
    // Use optimization and performance suggestions as improvements
    if (Array.isArray(analysis.optimization)) {
      improvements = improvements.concat(analysis.optimization.filter(i => typeof i === 'string'));
    }
    if (Array.isArray(analysis.performance)) {
      improvements = improvements.concat(analysis.performance.filter(i => typeof i === 'string'));
    }
    // Lower quality score if there are bugs
    if (bugs.length >= 3) qualityScore = 5;
    else if (bugs.length > 0) qualityScore = 7;
    // Try to extract a sample test case from functionality
    if (Array.isArray(analysis.functionality)) {
      const testLike = analysis.functionality.find(item => typeof item === 'string' && item.toLowerCase().includes('test'));
      if (testLike) testCase = { description: testLike };
    }
    return {
      status: 'success',
      aiResult: { bugs, isCorrect, qualityScore, improvements, testCase }
    };
  } catch (err) {
    return {
      status: 'error',
      message: err.message || 'DeepSeek code evaluation failed.'
    };
  }
}

module.exports = { evaluateCodeWithAI };
