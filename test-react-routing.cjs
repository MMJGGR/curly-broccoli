/**
 * Test React Router Behavior
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

async function testReactRouting() {
  console.log('🔍 Testing React Router Configuration');
  console.log('='.repeat(50));
  
  try {
    // Test root page
    console.log('Testing root page (/)...');
    const rootResult = await testHTTP('http://localhost:3000/');
    console.log(`Root Status: ${rootResult.status}`);
    
    // Test auth page
    console.log('\nTesting auth page (/auth)...');
    const authResult = await testHTTP('http://localhost:3000/auth');
    console.log(`Auth Status: ${authResult.status}`);
    
    // Check what the 404 page contains
    if (authResult.status === 404) {
      console.log('\n📋 Checking 404 response content...');
      console.log('Content-Type:', authResult.headers['content-type']);
      
      if (authResult.body.includes('<div id="root">')) {
        console.log('✅ Contains React root div - React app is loading');
        
        if (authResult.body.includes('react-scripts') || authResult.body.includes('webpack')) {
          console.log('✅ Contains development server markers');
        }
        
        console.log('\n📝 HTML Structure Analysis:');
        const lines = authResult.body.split('\n').slice(0, 20);
        lines.forEach((line, i) => {
          if (line.trim()) {
            console.log(`  ${i + 1}: ${line.trim()}`);
          }
        });
        
        console.log('\n🔍 React Router Analysis:');
        if (authResult.body.includes('Cannot GET /auth')) {
          console.log('❌ Express/Node.js 404 - React Router not handling the route');
          console.log('🔧 Solution: Need to configure React dev server for SPA routing');
        } else {
          console.log('✅ Likely React Router handling - need client-side inspection');
        }
        
      } else {
        console.log('❌ Does not contain React structure');
      }
    } else {
      console.log('✅ Auth page returned non-404 status');
    }
    
  } catch (error) {
    console.log('❌ Error testing React routing:', error.message);
  }
}

testReactRouting().catch(console.error);