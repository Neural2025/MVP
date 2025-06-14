const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const AdmZip = require('adm-zip');
const logger = require('../utils/logger');

class FileUploadService {
  constructor() {
    this.maxFileSize = 10 * 1024 * 1024; // 10MB
    this.maxFiles = 50;
    this.supportedExtensions = [
      '.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.cpp', '.c', '.cs',
      '.php', '.rb', '.go', '.rs', '.swift', '.kt', '.scala', '.r',
      '.sql', '.html', '.css', '.vue', '.svelte', '.dart', '.lua', '.zip'
    ];
    this.uploadDir = path.join(__dirname, '../uploads');
    this.initializeUploadDir();
  }

  /**
   * Initialize upload directory
   */
  async initializeUploadDir() {
    try {
      await fs.mkdir(this.uploadDir, { recursive: true });
    } catch (error) {
      logger.error('Failed to create upload directory:', error);
    }
  }

  /**
   * Configure multer for file uploads
   */
  getMulterConfig() {
    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, this.uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
      }
    });

    const fileFilter = (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      if (this.supportedExtensions.includes(ext)) {
        cb(null, true);
      } else {
        cb(new Error(`Unsupported file type: ${ext}`), false);
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: this.maxFileSize,
        files: this.maxFiles
      }
    });
  }

  /**
   * Process uploaded files
   * @param {Array} files - Array of uploaded files
   * @returns {Promise<object>} Processed files data
   */
  async processUploadedFiles(files) {
    try {
      const processedFiles = [];
      
      for (const file of files) {
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (ext === '.zip') {
          // Process ZIP file
          const zipFiles = await this.processZipFile(file.path);
          processedFiles.push(...zipFiles);
        } else {
          // Process regular file
          const content = await fs.readFile(file.path, 'utf8');
          processedFiles.push({
            name: file.originalname,
            path: file.originalname,
            extension: ext,
            language: this.getLanguageFromExtension(ext),
            content,
            size: file.size,
            type: 'uploaded'
          });
        }
        
        // Clean up uploaded file
        await this.cleanupFile(file.path);
      }

      return {
        success: true,
        files: processedFiles,
        summary: {
          totalFiles: processedFiles.length,
          languages: [...new Set(processedFiles.map(f => f.language))],
          totalSize: processedFiles.reduce((sum, f) => sum + f.size, 0)
        }
      };
    } catch (error) {
      logger.error('File processing error:', error);
      return { success: false, error: 'Failed to process uploaded files' };
    }
  }

  /**
   * Process ZIP file and extract code files
   * @param {string} zipPath - Path to ZIP file
   * @returns {Promise<Array>} Extracted files
   */
  async processZipFile(zipPath) {
    try {
      const zip = new AdmZip(zipPath);
      const zipEntries = zip.getEntries();
      const extractedFiles = [];

      for (const entry of zipEntries) {
        if (extractedFiles.length >= this.maxFiles) break;
        
        if (!entry.isDirectory) {
          const ext = path.extname(entry.entryName).toLowerCase();
          
          if (this.supportedExtensions.includes(ext) && ext !== '.zip') {
            try {
              const content = entry.getData('utf8');
              
              // Skip binary files or files that are too large
              if (content && content.length < this.maxFileSize) {
                extractedFiles.push({
                  name: path.basename(entry.entryName),
                  path: entry.entryName,
                  extension: ext,
                  language: this.getLanguageFromExtension(ext),
                  content,
                  size: entry.header.size,
                  type: 'zip'
                });
              }
            } catch (error) {
              logger.warn(`Failed to extract file ${entry.entryName}:`, error.message);
            }
          }
        }
      }

      return extractedFiles;
    } catch (error) {
      logger.error('ZIP processing error:', error);
      throw new Error('Failed to process ZIP file');
    }
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

  /**
   * Clean up uploaded file
   * @param {string} filePath - Path to file to delete
   */
  async cleanupFile(filePath) {
    try {
      await fs.unlink(filePath);
    } catch (error) {
      logger.warn('Failed to cleanup file:', error.message);
    }
  }

  /**
   * Clean up old uploaded files (run periodically)
   */
  async cleanupOldFiles() {
    try {
      const files = await fs.readdir(this.uploadDir);
      const now = Date.now();
      const maxAge = 24 * 60 * 60 * 1000; // 24 hours

      for (const file of files) {
        const filePath = path.join(this.uploadDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          logger.info(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      logger.error('Cleanup error:', error);
    }
  }
}

module.exports = new FileUploadService();
