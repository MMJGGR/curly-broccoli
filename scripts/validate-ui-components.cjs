#!/usr/bin/env node

/**
 * UI Component Validation Script
 * Validates React components against architectural standards
 * Part of pre-commit hook validation process
 */

const fs = require('fs');
const path = require('path');

class UIComponentValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Validate Select component usage
   * Ensures proper structure and no invalid nested divs
   */
  validateSelectComponents(fileContent, filePath) {
    // Check for invalid nested divs in SelectContent
    if (fileContent.includes('<SelectContent>')) {
      const selectContentRegex = /<SelectContent[\s\S]*?<\/SelectContent>/g;
      const matches = fileContent.match(selectContentRegex);
      
      matches?.forEach((match, index) => {
        // Check for nested divs that aren't SelectItem components
        if (match.includes('<div') && !match.includes('<SelectItem')) {
          this.errors.push({
            file: filePath,
            type: 'INVALID_SELECT_STRUCTURE',
            message: 'Invalid nested div structure in SelectContent. Use SelectItem directly or native HTML select.',
            line: this.getLineNumber(fileContent, match)
          });
        }
      });
    }

    // Check for proper native select usage as alternative
    if (fileContent.includes('<select') && !fileContent.includes('value=') && !fileContent.includes('onChange=')) {
      this.warnings.push({
        file: filePath,
        type: 'UNCONTROLLED_SELECT',
        message: 'Native select should be controlled with value and onChange props.',
        line: this.getLineNumber(fileContent, '<select')
      });
    }
  }

  /**
   * Validate form accessibility standards
   */
  validateFormAccessibility(fileContent, filePath) {
    // Check for proper label associations
    const inputRegex = /<input[^>]*>/g;
    const inputs = fileContent.match(inputRegex) || [];
    
    inputs.forEach(input => {
      if (!input.includes('aria-label') && !input.includes('id=')) {
        this.warnings.push({
          file: filePath,
          type: 'ACCESSIBILITY_WARNING',
          message: 'Input elements should have proper labeling (id + htmlFor or aria-label)',
          line: this.getLineNumber(fileContent, input)
        });
      }
    });

    // Check for error message associations
    if (fileContent.includes('error') || fileContent.includes('Error')) {
      if (!fileContent.includes('aria-describedby')) {
        this.warnings.push({
          file: filePath,
          type: 'ACCESSIBILITY_WARNING',
          message: 'Error messages should be associated with form fields using aria-describedby',
          line: 0
        });
      }
    }
  }

  /**
   * Validate component structure standards
   */
  validateComponentStructure(fileContent, filePath) {
    // Check for proper component exports
    if (!fileContent.includes('export default') && !fileContent.includes('export {')) {
      this.errors.push({
        file: filePath,
        type: 'COMPONENT_EXPORT',
        message: 'Component must have proper export statement',
        line: 0
      });
    }

    // Check for proper prop validation (if using PropTypes)
    if (fileContent.includes('PropTypes') && !fileContent.includes('.propTypes')) {
      this.warnings.push({
        file: filePath,
        type: 'PROP_VALIDATION',
        message: 'Consider adding propTypes validation for better type safety',
        line: 0
      });
    }
  }

  /**
   * Validate hardcoded values
   */
  validateHardcodedValues(fileContent, filePath) {
    // Check for hardcoded API endpoints
    const apiEndpointRegex = /['"`]\/api\/v\d+\/[^'"`]*['"`]/g;
    const endpoints = fileContent.match(apiEndpointRegex) || [];
    
    endpoints.forEach(endpoint => {
      if (!fileContent.includes('process.env') && !fileContent.includes('config')) {
        this.warnings.push({
          file: filePath,
          type: 'HARDCODED_ENDPOINT',
          message: `Consider moving API endpoint ${endpoint} to configuration`,
          line: this.getLineNumber(fileContent, endpoint)
        });
      }
    });

    // Check for hardcoded financial values
    const financialValueRegex = /\b\d+\.?\d*\s*[%$]\b/g;
    const financialValues = fileContent.match(financialValueRegex) || [];
    
    if (financialValues.length > 0) {
      this.warnings.push({
        file: filePath,
        type: 'HARDCODED_FINANCIAL_VALUES',
        message: `Found potential hardcoded financial values: ${financialValues.join(', ')}. Consider database-driven configuration.`,
        line: 0
      });
    }
  }

  /**
   * Get line number for a given match in file content
   */
  getLineNumber(content, searchString) {
    const index = content.indexOf(searchString);
    if (index === -1) return 0;
    
    return content.substring(0, index).split('\n').length;
  }

  /**
   * Validate a single file
   */
  validateFile(filePath) {
    if (!fs.existsSync(filePath)) {
      this.errors.push({
        file: filePath,
        type: 'FILE_NOT_FOUND',
        message: 'File does not exist',
        line: 0
      });
      return;
    }

    const fileContent = fs.readFileSync(filePath, 'utf8');
    const fileName = path.basename(filePath);
    
    // Only validate React components
    if (!fileName.endsWith('.jsx') && !fileName.endsWith('.js')) {
      return;
    }

    // Skip validation for non-component files
    if (!fileContent.includes('React') && !fileContent.includes('function') && !fileContent.includes('const')) {
      return;
    }

    this.validateSelectComponents(fileContent, filePath);
    this.validateFormAccessibility(fileContent, filePath);
    this.validateComponentStructure(fileContent, filePath);
    this.validateHardcodedValues(fileContent, filePath);
  }

  /**
   * Validate multiple files or directories
   */
  validateFiles(paths) {
    paths.forEach(inputPath => {
      if (fs.statSync(inputPath).isDirectory()) {
        this.validateDirectory(inputPath);
      } else {
        this.validateFile(inputPath);
      }
    });
  }

  /**
   * Recursively validate directory
   */
  validateDirectory(dirPath) {
    const files = fs.readdirSync(dirPath);
    
    files.forEach(file => {
      const fullPath = path.join(dirPath, file);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory() && !file.startsWith('.')) {
        this.validateDirectory(fullPath);
      } else if (file.endsWith('.jsx') || file.endsWith('.js')) {
        this.validateFile(fullPath);
      }
    });
  }

  /**
   * Generate validation report
   */
  generateReport() {
    const totalIssues = this.errors.length + this.warnings.length;
    
    console.log('\n🔍 UI Component Validation Report');
    console.log('================================');
    
    if (totalIssues === 0) {
      console.log('✅ All components pass validation!');
      return true;
    }

    if (this.errors.length > 0) {
      console.log(`\n❌ ${this.errors.length} Error(s):`);
      this.errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error.file}:${error.line}`);
        console.log(`   Type: ${error.type}`);
        console.log(`   Message: ${error.message}\n`);
      });
    }

    if (this.warnings.length > 0) {
      console.log(`\n⚠️  ${this.warnings.length} Warning(s):`);
      this.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ${warning.file}:${warning.line}`);
        console.log(`   Type: ${warning.type}`);
        console.log(`   Message: ${warning.message}\n`);
      });
    }

    // Return false if there are errors (blocks commit)
    return this.errors.length === 0;
  }
}

// Main execution
if (require.main === module) {
  const validator = new UIComponentValidator();
  const paths = process.argv.slice(2);
  
  if (paths.length === 0) {
    console.error('Usage: node validate-ui-components.js <file-or-directory> [additional-paths...]');
    process.exit(1);
  }

  validator.validateFiles(paths);
  const isValid = validator.generateReport();
  
  process.exit(isValid ? 0 : 1);
}

module.exports = UIComponentValidator;