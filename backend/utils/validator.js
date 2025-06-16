const sanitizeHtml = require('sanitize-html');

class Validator {
  // Supported programming languages - Enhanced list
  static SUPPORTED_LANGUAGES = [
    'javascript', 'python', 'java', 'cpp', 'csharp',
    'php', 'ruby', 'go', 'typescript', 'kotlin',
    'swift', 'rust', 'scala', 'dart', 'r',
    'c', 'perl', 'lua', 'haskell', 'erlang',
    'elixir', 'clojure', 'f#', 'vb.net', 'objective-c',
    'shell', 'bash', 'powershell', 'sql', 'html',
    'css', 'sass', 'less', 'xml', 'json',
    'yaml', 'toml', 'dockerfile', 'makefile', 'cmake'
  ];

  // Language file extensions mapping
  static LANGUAGE_EXTENSIONS = {
    'javascript': ['.js', '.jsx', '.mjs', '.cjs'],
    'typescript': ['.ts', '.tsx'],
    'python': ['.py', '.pyw', '.pyx'],
    'java': ['.java'],
    'cpp': ['.cpp', '.cc', '.cxx', '.c++', '.hpp', '.h++'],
    'c': ['.c', '.h'],
    'csharp': ['.cs'],
    'php': ['.php', '.phtml'],
    'ruby': ['.rb', '.rbw'],
    'go': ['.go'],
    'rust': ['.rs'],
    'swift': ['.swift'],
    'kotlin': ['.kt', '.kts'],
    'scala': ['.scala'],
    'dart': ['.dart'],
    'r': ['.r', '.R'],
    'perl': ['.pl', '.pm'],
    'lua': ['.lua'],
    'haskell': ['.hs', '.lhs'],
    'erlang': ['.erl', '.hrl'],
    'elixir': ['.ex', '.exs'],
    'clojure': ['.clj', '.cljs', '.cljc'],
    'f#': ['.fs', '.fsx', '.fsi'],
    'vb.net': ['.vb'],
    'objective-c': ['.m', '.mm'],
    'shell': ['.sh'],
    'bash': ['.bash'],
    'powershell': ['.ps1', '.psm1'],
    'sql': ['.sql'],
    'html': ['.html', '.htm'],
    'css': ['.css'],
    'sass': ['.sass', '.scss'],
    'less': ['.less'],
    'xml': ['.xml'],
    'json': ['.json'],
    'yaml': ['.yaml', '.yml'],
    'toml': ['.toml'],
    'dockerfile': ['Dockerfile', '.dockerfile'],
    'makefile': ['Makefile', 'makefile', '.mk'],
    'cmake': ['.cmake', 'CMakeLists.txt']
  };

  // Detect language from file extension
  static detectLanguage(filename) {
    const ext = filename.toLowerCase();
    for (const [language, extensions] of Object.entries(this.LANGUAGE_EXTENSIONS)) {
      if (extensions.some(extension => ext.endsWith(extension.toLowerCase()))) {
        return language;
      }
    }
    return 'text'; // Default fallback
  }
  static validateCode(code) {
    if (!code || typeof code !== 'string') {
      throw new Error('Code is required and must be a string');
    }

    if (code.length > 10240) { // 10KB limit
      throw new Error('Code exceeds maximum size of 10KB');
    }

    // Completely disabled validation to allow any code analysis, including syntax errors
    // The system will analyze code regardless of syntax validity

    return sanitizeHtml(code, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'escape'
    });
  }

  static validatePurpose(purpose) {
    if (!purpose || typeof purpose !== 'string') {
      throw new Error('Purpose is required and must be a string');
    }

    if (purpose.length > 1024) { // 1KB limit
      throw new Error('Purpose exceeds maximum size of 1KB');
    }

    return sanitizeHtml(purpose, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'escape'
    });
  }

  static containsDangerousPatterns(code) {
    // Only check for extremely dangerous patterns that could harm the system
    // Very minimal validation to allow legitimate code analysis of any programming language
    const dangerousPatterns = [
      /<script[^>]*>[\s\S]*document\.write[\s\S]*<\/script>/i,  // Only block script tags with document.write
      /javascript:\s*eval\s*\(\s*["'][^"']*rm\s+-rf/i,  // Only block javascript: with system commands
      /data:text\/html.*<script[\s\S]*eval[\s\S]*<\/script>/i,  // Only block data URLs with script+eval
      /<iframe[^>]*srcdoc\s*=\s*["'][^"']*<script/i  // Only block iframe srcdoc with scripts
    ];

    return dangerousPatterns.some(pattern => pattern.test(code));
  }

  static containsSuspiciousPatterns(code) {
    // Keep the old method for backward compatibility but make it less restrictive
    const suspiciousPatterns = [
      /javascript:\s*eval\s*\(/i,
      /data:text\/html.*<script/i,
      /vbscript:\s*eval/i,
      /<script[^>]*>.*<\/script>/i
    ];

    return suspiciousPatterns.some(pattern => pattern.test(code));
  }

  static validateJavaScriptSyntax(code) {
    try {
      // Basic syntax check without execution
      new Function(code);
      return true;
    } catch (error) {
      return false;
    }
  }

  static sanitizeInput(input) {
    if (typeof input !== 'string') {
      return input;
    }

    return sanitizeHtml(input, {
      allowedTags: [],
      allowedAttributes: {},
      disallowedTagsMode: 'escape'
    });
  }
}

module.exports = Validator;
