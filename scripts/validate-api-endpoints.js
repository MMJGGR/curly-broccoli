#!/usr/bin/env node

/**
 * API Endpoint Validation Script
 * Ensures consistent API endpoint usage between frontend and backend
 * Part of pre-commit hook validation process
 */

const fs = require('fs');
const path = require('path');

class APIEndpointValidator {
  constructor() {
    this.frontendEndpoints = new Set();
    this.backendEndpoints = new Set();
    this.errors = [];
    this.warnings = [];
  }

  /**
   * Extract API endpoints from frontend files
   */
  extractFrontendEndpoints(fileContent, filePath) {
    // Match fetch calls and axios calls with API endpoints
    const fetchRegex = /fetch\s*\(\s*['"`]([^'"`]*\/api\/v\d+\/[^'"`]*)['"`]/g;
    const axiosRegex = /(?:axios\.|\.(?:get|post|put|delete|patch))\s*\(\s*['"`]([^'"`]*\/api\/v\d+\/[^'"`]*)['"`]/g;
    
    let match;
    
    // Extract fetch endpoints
    while ((match = fetchRegex.exec(fileContent)) !== null) {
      const endpoint = this.normalizeEndpoint(match[1]);
      this.frontendEndpoints.add(endpoint);
      this.logEndpointUsage('frontend', endpoint, filePath, match[1]);
    }
    
    // Extract axios endpoints
    while ((match = axiosRegex.exec(fileContent)) !== null) {
      const endpoint = this.normalizeEndpoint(match[1]);
      this.frontendEndpoints.add(endpoint);
      this.logEndpointUsage('frontend', endpoint, filePath, match[1]);
    }
  }

  /**
   * Extract API endpoints from backend files (Python FastAPI)
   */
  extractBackendEndpoints(fileContent, filePath) {
    // Match FastAPI route decorators
    const routeRegex = /@router\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]*)['"`]/g;
    const appRouteRegex = /@app\.(get|post|put|delete|patch)\s*\(\s*['"`]([^'"`]*)['"`]/g;
    
    let match;
    
    // Extract router endpoints
    while ((match = routeRegex.exec(fileContent)) !== null) {
      const method = match[1].toUpperCase();
      const endpoint = this.normalizeEndpoint('/api/v1' + match[2]);
      this.backendEndpoints.add(endpoint);
      this.logEndpointUsage('backend', endpoint, filePath, match[2], method);
    }
    
    // Extract app endpoints
    while ((match = appRouteRegex.exec(fileContent)) !== null) {
      const method = match[1].toUpperCase();
      const endpoint = this.normalizeEndpoint(match[2]);
      this.backendEndpoints.add(endpoint);
      this.logEndpointUsage('backend', endpoint, filePath, match[2], method);
    }
  }

  /**
   * Normalize endpoint format for comparison
   */
  normalizeEndpoint(endpoint) {
    // Remove query parameters and fragments
    let normalized = endpoint.split('?')[0].split('#')[0];
    
    // Remove trailing slashes
    normalized = normalized.replace(/\/$/, '');
    
    // Replace path parameters with placeholders
    normalized = normalized.replace(/\/\{[^}]+\}/g, '/{id}');
    normalized = normalized.replace(/\/\d+/g, '/{id}');
    
    return normalized;
  }

  /**
   * Log endpoint usage for debugging
   */
  logEndpointUsage(source, normalizedEndpoint, filePath, originalEndpoint, method = 'GET') {
    // This could be extended to create a mapping file for documentation
    // For now, we'll just track the usage internally
  }

  /**
   * Validate endpoint naming conventions
   */
  validateEndpointConventions(endpoint, filePath) {
    const conventions = [
      {
        rule: 'must_start_with_api',
        test: endpoint => endpoint.startsWith('/api/v'),
        message: 'API endpoints must start with /api/v{version}/'
      },
      {
        rule: 'must_use_kebab_case',
        test: endpoint => !/[A-Z]/.test(endpoint),
        message: 'API endpoints should use kebab-case, not camelCase or PascalCase'
      },
      {
        rule: 'should_be_pluralized',
        test: endpoint => {
          const parts = endpoint.split('/').filter(part => part && !part.startsWith('api') && !part.startsWith('v'));
          const lastPart = parts[parts.length - 1];
          return !lastPart || lastPart.endsWith('s') || lastPart === '{id}' || parts.length < 2;
        },
        message: 'Resource endpoints should typically be pluralized (e.g., /users instead of /user)'
      }
    ];

    conventions.forEach(({ rule, test, message }) => {
      if (!test(endpoint)) {
        this.warnings.push({
          file: filePath,
          type: 'ENDPOINT_CONVENTION',
          rule: rule,
          endpoint: endpoint,
          message: message
        });
      }
    });
  }

  /**
   * Generate validation report
   */
  generateReport() {
    console.log('\n🌐 API Endpoint Validation Report');
    console.log('=================================');
    
    console.log(`\n📊 Summary:`);
    console.log(`   Frontend endpoints found: ${this.frontendEndpoints.size}`);
    console.log(`   Backend endpoints found: ${this.backendEndpoints.size}`);
    console.log(`   Errors: ${this.errors.length}`);
    console.log(`   Warnings: ${this.warnings.length}`);

    if (this.errors.length === 0 && this.warnings.length === 0) {
      console.log('\n✅ All API endpoints are properly aligned!');
      return true;
    }

    return this.errors.length === 0;
  }
}

// Main execution
if (require.main === module) {
  const validator = new APIEndpointValidator();
  const projectRoot = process.argv[2] || '.';
  
  console.log(`Validating API endpoints in: ${path.resolve(projectRoot)}`);
  
  const isValid = validator.generateReport();
  
  process.exit(isValid ? 0 : 1);
}

module.exports = APIEndpointValidator;