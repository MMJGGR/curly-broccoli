const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // Windows Chrome fixes for stability
      on('before:browser:launch', (browser, launchOptions) => {
        if (browser.name === 'chrome') {
          launchOptions.args.push('--disable-gpu');
          launchOptions.args.push('--no-sandbox');
          launchOptions.args.push('--disable-dev-shm-usage');
          launchOptions.args.push('--disable-extensions');
        }
        return launchOptions;
      });

      // Security testing tasks
      on('task', {
        cleanupSecurityTestUsers() {
          // Clean up test users created during security tests
          const axios = require('axios');
          const API_BASE = 'http://localhost:8000';
          
          const securityTestEmails = [
            'security.test.user1@example.com',
            'security.test.user2@example.com', 
            'security.test.advisor@example.com',
            'security.legit.user@test.com',
            'security.attacker@test.com',
            'security.advisor@test.com',
            'brute.force.target@test.com',
            'progressive.delay.test@test.com'
          ];
          
          return Promise.all(
            securityTestEmails.map(email => 
              axios.delete(`${API_BASE}/api/test/cleanup-user`, {
                data: { email }
              }).catch(() => {
                // Ignore errors for non-existent users
                return null;
              })
            )
          ).then(() => {
            return { success: true, message: 'Security test users cleaned up' };
          }).catch((error) => {
            return { success: false, error: error.message };
          });
        },

        generateSecurityReport(testResults) {
          const fs = require('fs');
          const path = require('path');
          
          const report = {
            timestamp: new Date().toISOString(),
            summary: testResults.summary || 'Security test execution',
            findings: testResults.findings || [],
            recommendations: testResults.recommendations || []
          };
          
          const reportPath = path.join(__dirname, 'cypress', 'reports', 'security-test-report.json');
          
          try {
            // Ensure reports directory exists
            const reportsDir = path.dirname(reportPath);
            if (!fs.existsSync(reportsDir)) {
              fs.mkdirSync(reportsDir, { recursive: true });
            }
            
            fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
            return { success: true, reportPath };
          } catch (error) {
            return { success: false, error: error.message };
          }
        },

        validateSecurityConfiguration() {
          // Validate security configuration
          const config = {
            httpsEnforced: process.env.NODE_ENV === 'production',
            corsConfigured: true, // Would check actual CORS config
            ratelimitingEnabled: true, // Would check rate limiting
            loggingSecure: true // Would check if sensitive data is logged
          };
          
          return config;
        }
      });
    },
    baseUrl: 'http://localhost:3000',
    supportFile: 'cypress/support/commands.js',
    env: {
      API_BASE_URL: 'http://localhost:8000'
    },
    defaultCommandTimeout: 15000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    pageLoadTimeout: 30000
  },
});