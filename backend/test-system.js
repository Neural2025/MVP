#!/usr/bin/env node

/**
 * Simple test script to verify the Test Automation System is working
 * Run with: node test-system.js
 */

const http = require('http');

const BASE_URL = 'http://localhost:3001';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 Testing Test Automation System...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing health endpoint...');
    const healthResponse = await makeRequest('/health');
    if (healthResponse.status === 200 && healthResponse.data.status === 'healthy') {
      console.log('✅ Health check passed');
    } else {
      console.log('❌ Health check failed');
      return;
    }

    // Test 2: Code Analysis (without API key - should handle gracefully)
    console.log('\n2. Testing code analysis endpoint...');
    const analysisData = {
      code: 'function add(a, b) { return a + b; }',
      purpose: 'Add two numbers'
    };
    
    const analysisResponse = await makeRequest('/api/analyze', 'POST', analysisData);
    if (analysisResponse.status === 200 || analysisResponse.status === 502) {
      console.log('✅ Analysis endpoint responding (status:', analysisResponse.status, ')');
      if (analysisResponse.status === 502) {
        console.log('   Note: API key needed for full functionality');
      }
    } else {
      console.log('❌ Analysis endpoint failed with status:', analysisResponse.status);
    }

    // Test 3: Test Generation (without API key - should handle gracefully)
    console.log('\n3. Testing test generation endpoint...');
    const testGenData = {
      code: 'function multiply(a, b) { return a * b; }',
      purpose: 'Multiply two numbers'
    };
    
    const testGenResponse = await makeRequest('/api/generate-tests', 'POST', testGenData);
    if (testGenResponse.status === 200 || testGenResponse.status === 502) {
      console.log('✅ Test generation endpoint responding (status:', testGenResponse.status, ')');
      if (testGenResponse.status === 502) {
        console.log('   Note: API key needed for full functionality');
      }
    } else {
      console.log('❌ Test generation endpoint failed with status:', testGenResponse.status);
    }

    // Test 4: Input Validation
    console.log('\n4. Testing input validation...');
    const invalidData = { purpose: 'Missing code field' };
    
    const validationResponse = await makeRequest('/api/analyze', 'POST', invalidData);
    if (validationResponse.status === 400) {
      console.log('✅ Input validation working correctly');
    } else {
      console.log('❌ Input validation not working, status:', validationResponse.status);
    }

    // Test 5: 404 handling
    console.log('\n5. Testing 404 handling...');
    const notFoundResponse = await makeRequest('/nonexistent');
    if (notFoundResponse.status === 404) {
      console.log('✅ 404 handling working correctly');
    } else {
      console.log('❌ 404 handling not working, status:', notFoundResponse.status);
    }

    console.log('\n🎉 Basic system tests completed!');
    console.log('\n📝 Next steps:');
    console.log('   1. Add your DeepSeek API key to .env file');
    console.log('   2. Test the web UI at http://localhost:3001');
    console.log('   3. Run the full test suite in TESTING.md');

  } catch (error) {
    console.log('❌ Test failed with error:', error.message);
    console.log('\n💡 Make sure the server is running with: npm start');
  }
}

runTests();
