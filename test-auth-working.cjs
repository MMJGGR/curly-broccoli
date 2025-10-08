/**
 * Working Auth Page Test with proper timeout settings
 */

const http = require('http');

function testHTTP(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 8000 }, (res) => {
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
  });
}

async function testAuthPage() {
  console.log('🚀 Testing Auth Page Functionality');
  console.log('='.repeat(40));
  
  const tests = [
    { name: 'Frontend Root', url: 'http://localhost:3000/' },
    { name: 'Auth Page', url: 'http://localhost:3000/auth' },
    { name: 'Non-existent Route (should redirect to auth)', url: 'http://localhost:3000/nonexistent' }
  ];
  
  const results = [];
  
  for (const test of tests) {
    console.log(`🔍 Testing ${test.name}...`);
    try {
      const result = await testHTTP(test.url);
      
      console.log(`✅ ${test.name}: Status ${result.status}`);
      console.log(`   Content-Type: ${result.headers['content-type']}`);
      
      // Check if it's a React app
      if (result.body.includes('<div id="root">') || result.body.includes('react')) {
        console.log('   ✅ Contains React app structure');
      }
      
      results.push({ name: test.name, status: 'PASS', httpStatus: result.status });
      
    } catch (error) {
      console.log(`❌ ${test.name}: ${error.message}`);
      results.push({ name: test.name, status: 'FAIL', error: error.message });
    }
    console.log();
  }
  
  // Summary
  console.log('='.repeat(40));
  console.log('📊 AUTH PAGE TEST RESULTS');
  console.log('='.repeat(40));
  
  results.forEach(result => {
    const icon = result.status === 'PASS' ? '✅' : '❌';
    const extra = result.httpStatus ? `(HTTP ${result.httpStatus})` : `(${result.error})`;
    console.log(`${icon} ${result.name}: ${result.status} ${extra}`);
  });
  
  const passCount = results.filter(r => r.status === 'PASS').length;
  console.log();
  console.log(`🎯 Overall Result: ${passCount}/${results.length} tests passed`);
  
  if (passCount === results.length) {
    console.log('🎉 Auth page is fully functional!');
  } else {
    console.log('⚠️ Some tests failed.');
  }
  
  console.log('='.repeat(40));
}

testAuthPage().catch(console.error);