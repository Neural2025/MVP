const dns = require('dns').promises;
const logger = require('../utils/logger');

class EmailValidationService {
  /**
   * Validates if an email address exists and is deliverable
   * @param {string} email - Email address to validate
   * @returns {Promise<{isValid: boolean, reason?: string}>}
   */
  async validateEmail(email) {
    try {
      // Basic format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { isValid: false, reason: 'Invalid email format' };
      }

      // Extract domain
      const domain = email.split('@')[1];
      
      // Check if domain exists and has MX records
      const mxRecords = await this.checkMXRecords(domain);
      if (!mxRecords.isValid) {
        return { isValid: false, reason: mxRecords.reason };
      }

      // Additional domain validation
      const domainValidation = await this.validateDomain(domain);
      if (!domainValidation.isValid) {
        return { isValid: false, reason: domainValidation.reason };
      }

      return { isValid: true };
    } catch (error) {
      logger.error('Email validation error:', error);
      // In case of validation service failure, allow the email (fail open)
      return { isValid: true, reason: 'Validation service unavailable' };
    }
  }

  /**
   * Check if domain has valid MX records
   * @param {string} domain - Domain to check
   * @returns {Promise<{isValid: boolean, reason?: string}>}
   */
  async checkMXRecords(domain) {
    try {
      const mxRecords = await dns.resolveMx(domain);
      if (mxRecords && mxRecords.length > 0) {
        return { isValid: true };
      } else {
        return { isValid: false, reason: 'No mail servers found for this domain' };
      }
    } catch (error) {
      if (error.code === 'ENOTFOUND') {
        return { isValid: false, reason: 'Domain does not exist' };
      } else if (error.code === 'ENODATA') {
        return { isValid: false, reason: 'No MX records found for this domain' };
      }
      logger.warn('MX record check failed:', error);
      return { isValid: true }; // Fail open
    }
  }

  /**
   * Validate domain existence and basic checks
   * @param {string} domain - Domain to validate
   * @returns {Promise<{isValid: boolean, reason?: string}>}
   */
  async validateDomain(domain) {
    try {
      // Check for common disposable email domains
      const disposableDomains = [
        '10minutemail.com', 'tempmail.org', 'guerrillamail.com',
        'mailinator.com', 'yopmail.com', 'temp-mail.org',
        'throwaway.email', 'getnada.com', 'maildrop.cc'
      ];

      if (disposableDomains.includes(domain.toLowerCase())) {
        return { isValid: false, reason: 'Disposable email addresses are not allowed' };
      }

      // Check if domain resolves
      try {
        await dns.lookup(domain);
        return { isValid: true };
      } catch (error) {
        if (error.code === 'ENOTFOUND') {
          return { isValid: false, reason: 'Domain does not exist' };
        }
        return { isValid: true }; // Fail open for other errors
      }
    } catch (error) {
      logger.warn('Domain validation failed:', error);
      return { isValid: true }; // Fail open
    }
  }

  /**
   * Quick email format validation (synchronous)
   * @param {string} email - Email to validate
   * @returns {boolean}
   */
  isValidFormat(email) {
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return emailRegex.test(email);
  }

  /**
   * Check if email domain is from a known professional provider
   * @param {string} email - Email to check
   * @returns {boolean}
   */
  isProfessionalEmail(email) {
    const domain = email.split('@')[1]?.toLowerCase();
    const professionalDomains = [
      'gmail.com', 'outlook.com', 'hotmail.com', 'yahoo.com',
      'protonmail.com', 'icloud.com', 'aol.com', 'zoho.com'
    ];
    
    // If it's a known personal provider, it's still professional
    if (professionalDomains.includes(domain)) {
      return true;
    }
    
    // If it's not a known personal provider, assume it's a company domain
    return !domain.includes('temp') && !domain.includes('disposable');
  }
}

module.exports = new EmailValidationService();
