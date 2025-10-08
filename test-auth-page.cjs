/**
 * Simple Auth Page Test
 * Tests if the /auth page is accessible and functional
 */

const http = require('http');
const { URL } = require('url');

const FRONTEND_URL = 'http://172.18.0.4:3000';

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'User-Agent': 'AuthPageTest/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        ...options.headers
      },
      timeout: 15000
    };

    const req = http.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.setTimeout(15000);
    req.end();
  });
}

async function testAuthPageAccessibility() {
  console.log('🔍 Testing auth page accessibility...');
  try {
    const response = await makeRequest(`${FRONTEND_URL}/auth`);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers['content-type']}`);
    
    if (response.status === 200) {
      // Check if it's HTML content
      if (response.headers['content-type']?.includes('text/html')) {
        console.log('✅ Auth page returns HTML content');
        
        // Check if it contains React app indicators
        if (response.body.includes('react') || response.body.includes('root') || response.body.includes('div id=')) {
          console.log('✅ Contains React app structure');
          return true;
        } else {
          console.log('⚠️ HTML returned but no React app structure detected');
          console.log('Response preview:', response.body.substring(0, 200) + '...');
          return false;
        }
      } else {
        console.log('⚠️ Auth page returns non-HTML content');
        console.log('Content preview:', response.body.substring(0, 100));
        return false;
      }
    } else {
      console.log(`❌ Auth page returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Auth page not accessible:', error.message);
    return false;
  }
}

async function testFrontendRoot() {
  console.log('🔍 Testing frontend root page...');
  try {
    const response = await makeRequest(FRONTEND_URL);
    
    console.log(`📊 Status: ${response.status}`);
    console.log(`📋 Content-Type: ${response.headers['content-type']}`);
    
    if (response.status === 200) {
      console.log('✅ Frontend root accessible');
      return true;
    } else {
      console.log(`❌ Frontend root returned status ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log('❌ Frontend root not accessible:', error.message);
    return false;
  }
}

async function runAuthTests() {
  console.log('🚀 Starting Auth Page Tests');
  console.log('='.repeat(40));
  
  const results = {
    frontendRoot: false,
    authPage: false
  };
  
  try {
    // Test 1: Frontend root
    results.frontendRoot = await testFrontendRoot();
    console.log();
    
    // Test 2: Auth page
    results.authPage = await testAuthPageAccessibility();
    console.log();
    
  } catch (error) {
    console.error('❌ Test execution failed:', error.message);
  }
  
  // Summary
  console.log('='.repeat(40));
  console.log('📊 AUTH PAGE TEST RESULTS');
  console.log('='.repeat(40));
  
  const testResults = [
    { name: 'Frontend Root Accessible', status: results.frontendRoot },
    { name: 'Auth Page Accessible', status: results.authPage }
  ];
  
  testResults.forEach(test => {
    const icon = test.status ? '✅' : '❌';
    console.log(`${icon} ${test.name}: ${test.status ? 'PASS' : 'FAIL'}`);
  });
  
  const passCount = testResults.filter(t => t.status).length;
  const totalCount = testResults.length;
  
  console.log();
  console.log(`🎯 Overall Result: ${passCount}/${totalCount} tests passed`);
  
  if (passCount === totalCount) {
    console.log('🎉 Auth page is working correctly!');
  } else {
    console.log('⚠️ Some auth page tests failed. Check the issues above.');
  }
  
  console.log('='.repeat(40));
}

// Run the tests
if (require.main === module) {
  runAuthTests().catch(console.error);
}

module.exports = { runAuthTests };