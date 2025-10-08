/**
 * Ultra-simple HTTP test
 */

const http = require('http');

function testSimpleHTTP(url) {
  return new Promise((resolve, reject) => {
    const req = http.get(url, { timeout: 5000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          bodyLength: data.length,
          bodyPreview: data.substring(0, 100)
        });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout after 5s'));
    });
    
    req.setTimeout(5000);
  });
}

async function runSimpleTest() {
  console.log('🔍 Testing HTTP connectivity to localhost:3000');
  
  try {
    const result = await testSimpleHTTP('http://localhost:3000/');
    console.log('✅ SUCCESS!');
    console.log('Status:', result.status);
    console.log('Content-Type:', result.headers['content-type']);
    console.log('Body Length:', result.bodyLength);
    console.log('Body Preview:', result.bodyPreview);
  } catch (error) {
    console.log('❌ FAILED:', error.message);
    console.log('This indicates a connectivity issue between host and container');
  }
}

runSimpleTest().catch(console.error);