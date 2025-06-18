const testExecutionService = require('./services/testExecutionService');

// GOOD CODE - should pass most tests
const goodCode = `
function add(a, b) {
  return a + b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero not allowed');
  }
  return a / b;
}

function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return false;
  }
  return email.includes('@') && email.includes('.');
}
`;

// BUGGY CODE - should fail tests
const buggyCode = `
function add(a, b) {
  return a / b;  // BUG: Wrong operation
}

function divide(a, b) {
  return a / b;  // BUG: No zero check
}

function getUser(id) {
  const users = null;  // BUG: Null reference
  return users.find(u => u.id === id);
}
`;

async function testFixedLogic() {
  console.log('🔧 === TESTING FIXED TEST LOGIC ===\n');

  console.log('✅ Testing GOOD CODE (should mostly pass):');
  try {
    const goodResults = await testExecutionService.executeTests(goodCode, 'javascript', 'developer');
    
    console.log(`📊 GOOD CODE RESULTS:`);
    console.log(`Total Tests: ${goodResults.totalTests}`);
    console.log(`Passed: ${goodResults.passed}`);
    console.log(`Failed: ${goodResults.failed}`);
    console.log(`Pass Rate: ${Math.round((goodResults.passed / goodResults.totalTests) * 100)}%`);
    
    console.log('\n✅ PASSED TESTS:');
    goodResults.testCases.forEach((test, index) => {
      if (test.status === 'passed') {
        console.log(`${index + 1}. ✅ ${test.name}: ${test.message}`);
      }
    });
    
    if (goodResults.failed > 0) {
      console.log('\n❌ FAILED TESTS:');
      goodResults.testCases.forEach((test, index) => {
        if (test.status === 'failed') {
          console.log(`${index + 1}. ❌ ${test.name}: ${test.message}`);
        }
      });
    }
    
  } catch (error) {
    console.log(`❌ Good code test failed: ${error.message}`);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  console.log('❌ Testing BUGGY CODE (should fail):');
  try {
    const buggyResults = await testExecutionService.executeTests(buggyCode, 'javascript', 'developer');
    
    console.log(`📊 BUGGY CODE RESULTS:`);
    console.log(`Total Tests: ${buggyResults.totalTests}`);
    console.log(`Passed: ${buggyResults.passed}`);
    console.log(`Failed: ${buggyResults.failed}`);
    console.log(`Pass Rate: ${Math.round((buggyResults.passed / buggyResults.totalTests) * 100)}%`);
    
    console.log('\n🐛 BUGS DETECTED:');
    buggyResults.testCases.forEach((test, index) => {
      if (test.status === 'failed') {
        console.log(`${index + 1}. 🐛 ${test.name}: ${test.message}`);
      }
    });
    
  } catch (error) {
    console.log(`❌ Buggy code test failed: ${error.message}`);
  }

  console.log('\n🎯 === EXPECTED RESULTS ===');
  console.log('✅ Good code should have HIGH pass rate (80%+)');
  console.log('❌ Buggy code should have LOW pass rate (50% or less)');
  console.log('🔍 System should detect specific bugs with clear messages');
}

testFixedLogic().catch(console.error);
