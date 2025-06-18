const testExecutionService = require('./services/testExecutionService');

// ACTUALLY BUGGY CODE - should fail tests
const buggyCode = `
function divide(a, b) {
  return a / b;  // BUG: No zero division check
}

function getUser(id) {
  const users = null;  // BUG: Null reference
  return users.find(u => u.id === id);
}

function processArray(arr) {
  // BUG: No null/undefined check
  return arr.map(item => item.value * 2);
}
`;

// GOOD CODE - should pass tests
const goodCode = `
function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero not allowed');
  }
  return a / b;
}

function getUser(id) {
  const users = [
    { id: 1, name: 'John' },
    { id: 2, name: 'Jane' }
  ];
  if (!users) {
    throw new Error('Users array is null');
  }
  return users.find(u => u.id === id) || null;
}

function processArray(arr) {
  if (!Array.isArray(arr)) {
    throw new Error('Input must be an array');
  }
  return arr.map(item => {
    if (typeof item !== 'object' || item.value === undefined) {
      throw new Error('Invalid item structure');
    }
    return item.value * 2;
  });
}
`;

async function testBugDetection() {
  console.log('🔍 === TESTING REAL BUG DETECTION ===\n');

  console.log('❌ Testing BUGGY CODE (should find bugs):');
  console.log('Code with bugs:', buggyCode.substring(0, 100) + '...\n');
  
  try {
    const buggyResults = await testExecutionService.executeTests(buggyCode, 'javascript', 'developer');
    
    console.log(`📊 BUGGY CODE RESULTS:`);
    console.log(`Total Tests: ${buggyResults.totalTests}`);
    console.log(`Passed: ${buggyResults.passed}`);
    console.log(`Failed: ${buggyResults.failed}`);
    console.log(`Pass Rate: ${Math.round((buggyResults.passed / buggyResults.totalTests) * 100)}%`);
    
    console.log('\n🐛 BUGS FOUND:');
    buggyResults.testCases.forEach((test, index) => {
      if (test.status === 'failed') {
        console.log(`${index + 1}. ❌ ${test.name}: ${test.message}`);
      }
    });
    
    console.log('\n' + '='.repeat(50) + '\n');
    
  } catch (error) {
    console.log(`❌ Buggy code test failed: ${error.message}\n`);
  }

  console.log('✅ Testing GOOD CODE (should pass):');
  console.log('Code without bugs:', goodCode.substring(0, 100) + '...\n');
  
  try {
    const goodResults = await testExecutionService.executeTests(goodCode, 'javascript', 'developer');
    
    console.log(`📊 GOOD CODE RESULTS:`);
    console.log(`Total Tests: ${goodResults.totalTests}`);
    console.log(`Passed: ${goodResults.passed}`);
    console.log(`Failed: ${goodResults.failed}`);
    console.log(`Pass Rate: ${Math.round((goodResults.passed / goodResults.totalTests) * 100)}%`);
    
    if (goodResults.failed > 0) {
      console.log('\n⚠️ ISSUES FOUND:');
      goodResults.testCases.forEach((test, index) => {
        if (test.status === 'failed') {
          console.log(`${index + 1}. ⚠️ ${test.name}: ${test.message}`);
        }
      });
    } else {
      console.log('\n🎉 All tests passed! Code is clean.');
    }
    
  } catch (error) {
    console.log(`❌ Good code test failed: ${error.message}\n`);
  }

  console.log('\n🎯 === SUMMARY ===');
  console.log('If the system is working correctly:');
  console.log('- Buggy code should have FAILED tests');
  console.log('- Good code should have PASSED tests');
  console.log('- Bug detection should show specific error messages');
}

testBugDetection().catch(console.error);
