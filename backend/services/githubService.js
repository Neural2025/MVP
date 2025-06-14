const axios = require('axios');
const logger = require('../utils/logger');

class GitHubService {
  constructor() {
    this.baseURL = 'https://api.github.com';
    this.maxFileSize = 1024 * 1024; // 1MB per file
    this.supportedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r',
      '.sql', '.html', '.css', '.vue', '.svelte', '.dart', '.lua'
    ];
  }

  /**
   * Parse GitHub URL and extract owner, repo, and path
   * @param {string} url - GitHub URL
   * @returns {object} Parsed URL components
   */
  parseGitHubURL(url) {
    try {
      // Handle different GitHub URL formats
      const patterns = [
        // https://github.com/owner/repo
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/?$/,
        // https://github.com/owner/repo/tree/branch/path
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/(.+)$/,
        // https://github.com/owner/repo/blob/branch/file
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/blob\/([^\/]+)\/(.+)$/,
        // https://github.com/owner/repo/tree/branch
        /^https?:\/\/github\.com\/([^\/]+)\/([^\/]+)\/tree\/([^\/]+)\/?$/
      ];

      for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match) {
          return {
            owner: match[1],
            repo: match[2],
            branch: match[3] || 'main',
            path: match[4] || '',
            isValid: true
          };
        }
      }

      return { isValid: false, error: 'Invalid GitHub URL format' };
    } catch (error) {
      logger.error('GitHub URL parsing error:', error);
      return { isValid: false, error: 'Failed to parse GitHub URL' };
    }
  }

  /**
   * Fetch repository contents
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} path - Path within repository
   * @param {string} branch - Branch name
   * @returns {Promise<object>} Repository contents
   */
  async fetchRepositoryContents(owner, repo, path = '', branch = 'main') {
    try {
      const url = `${this.baseURL}/repos/${owner}/${repo}/contents/${path}`;
      const params = { ref: branch };

      const response = await axios.get(url, { params });
      return { success: true, data: response.data };
    } catch (error) {
      logger.error('GitHub API error:', error.response?.data || error.message);
      
      if (error.response?.status === 404) {
        return { success: false, error: 'Repository, branch, or path not found' };
      } else if (error.response?.status === 403) {
        return { success: false, error: 'API rate limit exceeded or repository is private' };
      }
      
      return { success: false, error: 'Failed to fetch repository contents' };
    }
  }

  /**
   * Fetch file content from GitHub
   * @param {string} downloadUrl - File download URL
   * @returns {Promise<string>} File content
   */
  async fetchFileContent(downloadUrl) {
    try {
      const response = await axios.get(downloadUrl, {
        timeout: 10000,
        maxContentLength: this.maxFileSize
      });
      return response.data;
    } catch (error) {
      logger.error('File fetch error:', error.message);
      throw new Error('Failed to fetch file content');
    }
  }

  /**
   * Process GitHub repository and extract code files
   * @param {string} url - GitHub URL
   * @returns {Promise<object>} Processed repository data
   */
  async processRepository(url) {
    try {
      const parsed = this.parseGitHubURL(url);
      if (!parsed.isValid) {
        return { success: false, error: parsed.error };
      }

      const { owner, repo, branch, path } = parsed;
      
      // Fetch repository contents
      const contents = await this.fetchRepositoryContents(owner, repo, path, branch);
      if (!contents.success) {
        return contents;
      }

      // Process files
      const files = await this.processFiles(contents.data, owner, repo, branch);
      
      return {
        success: true,
        repository: {
          owner,
          repo,
          branch,
          path,
          url
        },
        files,
        summary: {
          totalFiles: files.length,
          languages: [...new Set(files.map(f => f.language))],
          totalSize: files.reduce((sum, f) => sum + f.size, 0)
        }
      };
    } catch (error) {
      logger.error('Repository processing error:', error);
      return { success: false, error: 'Failed to process repository' };
    }
  }

  /**
   * Process files from GitHub contents
   * @param {Array} contents - GitHub contents array
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @param {string} branch - Branch name
   * @returns {Promise<Array>} Processed files
   */
  async processFiles(contents, owner, repo, branch) {
    const files = [];
    const maxFiles = 20; // Limit number of files to process

    for (const item of contents) {
      if (files.length >= maxFiles) break;

      if (item.type === 'file') {
        const extension = this.getFileExtension(item.name);
        if (this.supportedExtensions.includes(extension)) {
          try {
            const content = await this.fetchFileContent(item.download_url);
            files.push({
              name: item.name,
              path: item.path,
              extension,
              language: this.getLanguageFromExtension(extension),
              content,
              size: item.size,
              url: item.html_url
            });
          } catch (error) {
            logger.warn(`Failed to fetch file ${item.name}:`, error.message);
          }
        }
      } else if (item.type === 'dir' && files.length < maxFiles) {
        // Recursively process directories (limited depth)
        try {
          const subContents = await this.fetchRepositoryContents(owner, repo, item.path, branch);
          if (subContents.success) {
            const subFiles = await this.processFiles(subContents.data, owner, repo, branch);
            files.push(...subFiles);
          }
        } catch (error) {
          logger.warn(`Failed to process directory ${item.path}:`, error.message);
        }
      }
    }

    return files;
  }

  /**
   * Get file extension
   * @param {string} filename - File name
   * @returns {string} File extension
   */
  getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.')).toLowerCase();
  }

  /**
   * Get programming language from file extension
   * @param {string} extension - File extension
   * @returns {string} Programming language
   */
  getLanguageFromExtension(extension) {
    const languageMap = {
      '.js': 'JavaScript',
      '.jsx': 'JavaScript',
      '.ts': 'TypeScript',
      '.tsx': 'TypeScript',
      '.py': 'Python',
      '.java': 'Java',
      '.cpp': 'C++',
      '.c': 'C',
      '.cs': 'C#',
      '.php': 'PHP',
      '.rb': 'Ruby',
      '.go': 'Go',
      '.rs': 'Rust',
      '.swift': 'Swift',
      '.kt': 'Kotlin',
      '.scala': 'Scala',
      '.r': 'R',
      '.sql': 'SQL',
      '.html': 'HTML',
      '.css': 'CSS',
      '.vue': 'Vue',
      '.svelte': 'Svelte',
      '.dart': 'Dart',
      '.lua': 'Lua'
    };

    return languageMap[extension] || 'Unknown';
  }

  /**
   * Combine multiple files into a single code string for analysis
   * @param {Array} files - Array of file objects
   * @returns {string} Combined code
   */
  combineFilesForAnalysis(files) {
    return files.map(file => {
      return `// File: ${file.path} (${file.language})\n${file.content}\n\n`;
    }).join('');
  }
}

module.exports = new GitHubService();
