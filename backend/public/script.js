class TestAutomationUI {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.updateCharacterCounters();
    }

    initializeElements() {
        this.codeInput = document.getElementById('code-input');
        this.purposeInput = document.getElementById('purpose-input');
        this.analyzeBtn = document.getElementById('analyze-btn');
        this.generateTestsBtn = document.getElementById('generate-tests-btn');
        this.clearOutputBtn = document.getElementById('clear-output');
        this.output = document.getElementById('output');
        this.status = document.getElementById('status');
        this.timestamp = document.getElementById('timestamp');
        this.codeCounter = document.getElementById('code-counter');
        this.purposeCounter = document.getElementById('purpose-counter');
    }

    attachEventListeners() {
        this.analyzeBtn.addEventListener('click', () => this.analyzeCode());
        this.generateTestsBtn.addEventListener('click', () => this.generateTests());
        this.clearOutputBtn.addEventListener('click', () => this.clearOutput());

        this.codeInput.addEventListener('input', () => this.updateCharacterCounters());
        this.purposeInput.addEventListener('input', () => this.updateCharacterCounters());

        // Enable keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'Enter') {
                this.analyzeCode();
            }
        });
    }

    updateCharacterCounters() {
        this.codeCounter.textContent = this.codeInput.value.length;
        this.purposeCounter.textContent = this.purposeInput.value.length;

        // Update counter colors based on limits
        this.codeCounter.style.color = this.codeInput.value.length > 10240 ? '#e74c3c' : '#7f8c8d';
        this.purposeCounter.style.color = this.purposeInput.value.length > 1024 ? '#e74c3c' : '#7f8c8d';
    }

    validateInputs() {
        const code = this.codeInput.value.trim();
        const purpose = this.purposeInput.value.trim();

        if (!code) {
            this.showError('Code is required');
            return false;
        }

        if (!purpose) {
            this.showError('Purpose is required');
            return false;
        }

        if (code.length > 10240) {
            this.showError('Code exceeds maximum size of 10KB');
            return false;
        }

        if (purpose.length > 1024) {
            this.showError('Purpose exceeds maximum size of 1KB');
            return false;
        }

        return true;
    }

    async analyzeCode() {
        if (!this.validateInputs()) return;

        this.setLoading(this.analyzeBtn, true);
        this.updateStatus('Analyzing code...', 'warning');

        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: this.codeInput.value,
                    purpose: this.purposeInput.value
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.displayResult(result, 'Code Analysis Results');
                this.updateStatus('Analysis completed successfully', 'success');
            } else {
                this.showError(result.message || 'Analysis failed');
            }

        } catch (error) {
            this.showError('Network error: ' + error.message);
        } finally {
            this.setLoading(this.analyzeBtn, false);
        }
    }

    async generateTests() {
        if (!this.validateInputs()) return;

        this.setLoading(this.generateTestsBtn, true);
        this.updateStatus('Generating tests...', 'warning');

        try {
            const response = await fetch('/api/generate-tests', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    code: this.codeInput.value,
                    purpose: this.purposeInput.value
                })
            });

            const result = await response.json();

            if (response.ok) {
                this.displayResult(result, 'Test Generation Results');
                this.updateStatus('Test generation completed successfully', 'success');
            } else {
                this.showError(result.message || 'Test generation failed');
            }

        } catch (error) {
            this.showError('Network error: ' + error.message);
        } finally {
            this.setLoading(this.generateTestsBtn, false);
        }
    }

    setLoading(button, isLoading) {
        const textSpan = button.querySelector('.btn-text');
        const loadingSpan = button.querySelector('.btn-loading');

        if (isLoading) {
            textSpan.style.display = 'none';
            loadingSpan.style.display = 'inline';
            button.disabled = true;
        } else {
            textSpan.style.display = 'inline';
            loadingSpan.style.display = 'none';
            button.disabled = false;
        }
    }

    displayResult(result, title) {
        if (result.status === 'success' && result.data) {
            if (title.includes('Analysis')) {
                this.displayAnalysisResult(result.data, title);
            } else if (title.includes('Test')) {
                this.displayTestResult(result.data, title);
            } else {
                this.displayRawResult(result, title);
            }
        } else {
            this.displayRawResult(result, title);
        }
        this.updateTimestamp();
    }

    displayAnalysisResult(data, title) {
        let html = `<div class="result-container">`;
        html += `<h3>${title}</h3>`;

        // Error Detection Section (New)
        html += this.generateErrorDetectionSection(data);

        // Security Analysis
        html += `<div class="analysis-section security-section">`;
        html += `<div class="section-title">🔒 Security Analysis</div>`;
        html += `<div class="section-content">`;
        if (data.security && data.security.length > 0) {
            data.security.forEach((item) => {
                const { icon, severity } = this.categorizeSecurityItem(item);
                html += `<div class="analysis-item ${severity}">${icon} ${this.highlightErrorLocation(item)}</div>`;
            });
        } else {
            html += `<div class="analysis-item">No security analysis available</div>`;
        }
        html += `</div></div>`;

        // Performance Analysis
        html += `<div class="analysis-section performance-section">`;
        html += `<div class="section-title">⚡ Performance Analysis</div>`;
        html += `<div class="section-content">`;
        if (data.performance && data.performance.length > 0) {
            data.performance.forEach((item) => {
                const { icon, severity } = this.categorizePerformanceItem(item);
                html += `<div class="analysis-item ${severity}">${icon} ${this.highlightErrorLocation(item)}</div>`;
            });
        } else {
            html += `<div class="analysis-item">No performance analysis available</div>`;
        }
        html += `</div></div>`;

        // Optimization Suggestions
        html += `<div class="analysis-section optimization-section">`;
        html += `<div class="section-title">🚀 Optimization Suggestions</div>`;
        html += `<div class="section-content">`;
        if (data.optimization && data.optimization.length > 0) {
            data.optimization.forEach((item) => {
                const { icon, severity } = this.categorizeOptimizationItem(item);
                html += `<div class="analysis-item ${severity}">${icon} ${this.highlightErrorLocation(item)}</div>`;
            });
        } else {
            html += `<div class="analysis-item">No optimization suggestions available</div>`;
        }
        html += `</div></div>`;

        // Functionality Assessment
        html += `<div class="analysis-section functionality-section">`;
        html += `<div class="section-title">✅ Functionality Assessment</div>`;
        html += `<div class="section-content">`;
        if (data.functionality && data.functionality.length > 0) {
            data.functionality.forEach((item) => {
                html += `<div class="analysis-item">📋 ${item}</div>`;
            });
        } else {
            html += `<div class="analysis-item">No functionality assessment available</div>`;
        }
        html += `</div></div>`;

        html += `</div>`;
        this.output.innerHTML = html;
    }

    displayTestResult(data, title) {
        let html = `<div class="result-container">`;
        html += `<h3>${title}</h3>`;

        // Generated Tests
        html += `<div class="test-section">`;
        html += `<div class="section-title">🧪 Generated Test Suite</div>`;
        if (data.tests) {
            html += `<div class="test-code"><pre>${this.escapeHtml(data.tests)}</pre></div>`;
        } else {
            html += `<div class="no-content">No tests generated</div>`;
        }
        html += `</div>`;

        // Code Fixes
        html += `<div class="fixes-section">`;
        html += `<div class="section-title">🔧 Suggested Fixes</div>`;
        if (data.fixes && data.fixes.length > 0) {
            data.fixes.forEach((fix, index) => {
                html += `<div class="fix-item">`;
                html += `<div class="fix-header">Fix #${index + 1}</div>`;
                html += `<div class="issue-description">Issue: ${this.escapeHtml(fix.issue)}</div>`;
                html += `<div class="fix-label">Fixed Code:</div>`;
                html += `<div class="fix-code"><pre>${this.escapeHtml(fix.fixedCode)}</pre></div>`;
                html += `</div>`;
            });
        } else {
            html += `<div class="no-fixes">✅ No fixes needed - code looks good!</div>`;
        }
        html += `</div>`;

        html += `</div>`;
        this.output.innerHTML = html;
    }

    displayRawResult(result, title) {
        const formattedResult = JSON.stringify(result, null, 2);
        this.output.textContent = `=== ${title} ===\n\n${formattedResult}`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    generateErrorDetectionSection(data) {
        let html = `<div class="analysis-section error-detection-section">`;
        html += `<div class="section-title">🐛 Error Detection & Fix Suggestions</div>`;
        html += `<div class="section-content">`;

        const errors = this.detectPotentialErrors(data);

        if (errors.length > 0) {
            errors.forEach((error) => {
                html += `<div class="error-item ${error.severity}">`;
                html += `<div class="error-header">${error.icon} ${error.type} Error</div>`;
                html += `<div class="error-location">Location: ${error.location}</div>`;
                html += `<div class="error-description">Issue: ${error.description}</div>`;
                html += `<div class="error-fix">`;
                html += `<div class="fix-label">💡 How to fix:</div>`;
                html += `<div class="fix-suggestion">${error.fixSuggestion}</div>`;
                if (error.codeExample) {
                    html += `<div class="fix-code-example">`;
                    html += `<div class="fix-example-label">Example fix:</div>`;
                    html += `<pre>${this.escapeHtml(error.codeExample)}</pre>`;
                    html += `</div>`;
                }
                html += `</div>`;
                html += `</div>`;
            });
        } else {
            html += `<div class="analysis-item success">✅ No obvious errors detected in the code</div>`;
        }

        html += `</div></div>`;
        return html;
    }

    detectPotentialErrors(data) {
        const errors = [];

        // Analyze security issues for errors
        if (data.security) {
            data.security.forEach(item => {
                const securityError = this.parseSecurityError(item);
                if (securityError) errors.push(securityError);
            });
        }

        // Analyze performance issues for errors
        if (data.performance) {
            data.performance.forEach(item => {
                const performanceError = this.parsePerformanceError(item);
                if (performanceError) errors.push(performanceError);
            });
        }

        // Analyze optimization suggestions for potential errors
        if (data.optimization) {
            data.optimization.forEach(item => {
                const optimizationError = this.parseOptimizationError(item);
                if (optimizationError) errors.push(optimizationError);
            });
        }

        return errors;
    }

    parseSecurityError(item) {
        const lowerItem = item.toLowerCase();

        if (lowerItem.includes('eval') || lowerItem.includes('function constructor')) {
            return {
                type: 'Security',
                severity: 'critical',
                icon: '🚨',
                location: this.extractLocation(item),
                description: 'Use of eval() or Function constructor detected',
                fixSuggestion: 'Replace eval() with safer alternatives like JSON.parse() for data or proper function calls',
                codeExample: '// Instead of: eval(userInput)\n// Use: JSON.parse(userInput) or predefined functions'
            };
        }

        if (lowerItem.includes('innerhtml') || lowerItem.includes('xss')) {
            return {
                type: 'Security',
                severity: 'high',
                icon: '⚠️',
                location: this.extractLocation(item),
                description: 'Potential XSS vulnerability with innerHTML',
                fixSuggestion: 'Use textContent instead of innerHTML, or sanitize input properly',
                codeExample: '// Instead of: element.innerHTML = userInput\n// Use: element.textContent = userInput'
            };
        }

        if (lowerItem.includes('sql') || lowerItem.includes('injection')) {
            return {
                type: 'Security',
                severity: 'critical',
                icon: '🚨',
                location: this.extractLocation(item),
                description: 'Potential SQL injection vulnerability',
                fixSuggestion: 'Use parameterized queries or prepared statements',
                codeExample: '// Use parameterized queries:\n// db.query("SELECT * FROM users WHERE id = ?", [userId])'
            };
        }

        return null;
    }

    parsePerformanceError(item) {
        const lowerItem = item.toLowerCase();

        if (lowerItem.includes('loop') && (lowerItem.includes('inefficient') || lowerItem.includes('nested'))) {
            return {
                type: 'Performance',
                severity: 'medium',
                icon: '🐌',
                location: this.extractLocation(item),
                description: 'Inefficient loop structure detected',
                fixSuggestion: 'Optimize loop logic, avoid nested loops where possible, use efficient algorithms',
                codeExample: '// Instead of nested loops:\n// Use Map, Set, or single-pass algorithms'
            };
        }

        if (lowerItem.includes('memory') && lowerItem.includes('leak')) {
            return {
                type: 'Performance',
                severity: 'high',
                icon: '💾',
                location: this.extractLocation(item),
                description: 'Potential memory leak detected',
                fixSuggestion: 'Ensure proper cleanup of event listeners, timers, and references',
                codeExample: '// Clean up resources:\n// clearInterval(timer);\n// element.removeEventListener(\'click\', handler);'
            };
        }

        if (lowerItem.includes('blocking') || lowerItem.includes('synchronous')) {
            return {
                type: 'Performance',
                severity: 'medium',
                icon: '⏳',
                location: this.extractLocation(item),
                description: 'Blocking operation detected',
                fixSuggestion: 'Use asynchronous operations with async/await or Promises',
                codeExample: '// Instead of: syncOperation()\n// Use: await asyncOperation()'
            };
        }

        return null;
    }

    parseOptimizationError(item) {
        const lowerItem = item.toLowerCase();

        if (lowerItem.includes('syntax') && (lowerItem.includes('error') || lowerItem.includes('issue'))) {
            return {
                type: 'Syntax',
                severity: 'high',
                icon: '🔧',
                location: this.extractLocation(item),
                description: 'Syntax error detected',
                fixSuggestion: 'Fix the syntax error to make the code valid',
                codeExample: '// Check for missing semicolons, brackets, quotes, or keywords\n// Ensure proper indentation and structure'
            };
        }

        if (lowerItem.includes('validation') && lowerItem.includes('missing')) {
            return {
                type: 'Logic',
                severity: 'medium',
                icon: '🔍',
                location: this.extractLocation(item),
                description: 'Missing input validation',
                fixSuggestion: 'Add proper input validation to prevent runtime errors',
                codeExample: 'function add(a, b) {\n  if (typeof a !== \'number\' || typeof b !== \'number\') {\n    throw new Error(\'Invalid input\');\n  }\n  return a + b;\n}'
            };
        }

        if (lowerItem.includes('error handling') || lowerItem.includes('try-catch')) {
            return {
                type: 'Logic',
                severity: 'medium',
                icon: '🛡️',
                location: this.extractLocation(item),
                description: 'Missing error handling',
                fixSuggestion: 'Add try-catch blocks for operations that might fail',
                codeExample: 'try {\n  // risky operation\n  result = riskyFunction();\n} catch (error) {\n  console.error(\'Error:\', error.message);\n  // handle error appropriately\n}'
            };
        }

        if (lowerItem.includes('null') || lowerItem.includes('undefined')) {
            return {
                type: 'Logic',
                severity: 'high',
                icon: '❌',
                location: this.extractLocation(item),
                description: 'Potential null/undefined reference error',
                fixSuggestion: 'Add null checks before accessing object properties',
                codeExample: '// Instead of: obj.property\n// Use: obj?.property or if (obj && obj.property)'
            };
        }

        return null;
    }

    extractLocation(text) {
        // Try to extract line numbers or function names from the text
        const lineMatch = text.match(/line\s+(\d+)/i);
        if (lineMatch) {
            return `Line ${lineMatch[1]}`;
        }

        const functionMatch = text.match(/function\s+(\w+)/i);
        if (functionMatch) {
            return `Function: ${functionMatch[1]}`;
        }

        const atMatch = text.match(/at\s+(.+)/i);
        if (atMatch) {
            return atMatch[1];
        }

        return 'Code analysis';
    }

    categorizeSecurityItem(item) {
        const lowerItem = item.toLowerCase();

        if (lowerItem.includes('no') && (lowerItem.includes('issues') || lowerItem.includes('vulnerabilities'))) {
            return { icon: '✅', severity: 'success' };
        }

        if (lowerItem.includes('critical') || lowerItem.includes('eval') || lowerItem.includes('injection')) {
            return { icon: '🚨', severity: 'critical' };
        }

        if (lowerItem.includes('warning') || lowerItem.includes('potential') || lowerItem.includes('xss')) {
            return { icon: '⚠️', severity: 'high' };
        }

        return { icon: '🔍', severity: 'medium' };
    }

    categorizePerformanceItem(item) {
        const lowerItem = item.toLowerCase();

        if (lowerItem.includes('no') && lowerItem.includes('issues')) {
            return { icon: '✅', severity: 'success' };
        }

        if (lowerItem.includes('critical') || lowerItem.includes('blocking') || lowerItem.includes('memory leak')) {
            return { icon: '🚨', severity: 'critical' };
        }

        if (lowerItem.includes('slow') || lowerItem.includes('inefficient') || lowerItem.includes('optimization')) {
            return { icon: '⚠️', severity: 'high' };
        }

        return { icon: '💡', severity: 'medium' };
    }

    categorizeOptimizationItem(item) {
        const lowerItem = item.toLowerCase();

        if (lowerItem.includes('well') || lowerItem.includes('good') || lowerItem.includes('optimized')) {
            return { icon: '✅', severity: 'success' };
        }

        if (lowerItem.includes('critical') || lowerItem.includes('must') || lowerItem.includes('required')) {
            return { icon: '🚨', severity: 'critical' };
        }

        if (lowerItem.includes('should') || lowerItem.includes('recommend') || lowerItem.includes('consider')) {
            return { icon: '💡', severity: 'medium' };
        }

        return { icon: '🔍', severity: 'low' };
    }

    highlightErrorLocation(text) {
        // Highlight line numbers, function names, and error keywords
        return text
            .replace(/line\s+(\d+)/gi, '<span class="line-highlight">Line $1</span>')
            .replace(/function\s+(\w+)/gi, '<span class="function-highlight">Function $1</span>')
            .replace(/\b(error|warning|critical|issue|problem)\b/gi, '<span class="error-keyword">$1</span>');
    }



    showError(message) {
        this.output.innerHTML = `<div class="error-message">
            <div class="error-header">❌ Error</div>
            <div class="error-content">${this.escapeHtml(message)}</div>
        </div>`;
        this.updateStatus(message, 'error');
        this.updateTimestamp();
    }

    clearOutput() {
        this.output.innerHTML = '<div class="no-content">Results will appear here...</div>';
        this.updateStatus('Ready', '');
        this.timestamp.textContent = '';
    }

    updateStatus(message, type = '') {
        this.status.textContent = message;
        this.status.className = type;
    }

    updateTimestamp() {
        this.timestamp.textContent = new Date().toLocaleString();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new TestAutomationUI();
});
