const testExecutionService = require('./services/testExecutionService');

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

function calculateDiscount(price, discount) {
  // BUG: No validation
  return price - (price * discount / 100);
}

function validatePassword(password) {
  // BUG: Weak validation
  return password.length > 3;
}
`;

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

function calculateDiscount(price, discount) {
  if (typeof price !== 'number' || price < 0) {
    throw new Error('Price must be a positive number');
  }
  if (typeof discount !== 'number' || discount < 0 || discount > 100) {
    throw new Error('Discount must be between 0 and 100');
  }
  return price - (price * discount / 100);
}

function validatePassword(password) {
  if (typeof password !== 'string') {
    return false;
  }
  return password.length >= 8 && 
         /[A-Z]/.test(password) && 
         /[a-z]/.test(password) && 
         /[0-9]/.test(password);
}
`;

async function runComparisonTest() {
  console.log('🔴 === TESTING BUGGY CODE ===');
  const buggyResults = await testExecutionService.executeTests(buggyCode, 'javascript', 'tester');
  
  console.log('\n📊 BUGGY CODE RESULTS:');
  console.log(`Total Tests: ${buggyResults.totalTests}`);
  console.log(`Passed: ${buggyResults.passed}`);
  console.log(`Failed: ${buggyResults.failed}`);
  console.log(`Pass Rate: ${Math.round((buggyResults.passed / buggyResults.totalTests) * 100)}%`);
  console.log(`Execution Time: ${buggyResults.executionTime}ms`);
  
  console.log('\n❌ FAILED TESTS:');
  buggyResults.testCases.filter(t => t.status === 'failed').forEach(test => {
    console.log(`- ${test.name}: ${test.message}`);
  });

  console.log('\n\n🟢 === TESTING GOOD CODE ===');
  const goodResults = await testExecutionService.executeTests(goodCode, 'javascript', 'tester');
  
  console.log('\n📊 GOOD CODE RESULTS:');
  console.log(`Total Tests: ${goodResults.totalTests}`);
  console.log(`Passed: ${goodResults.passed}`);
  console.log(`Failed: ${goodResults.failed}`);
  console.log(`Pass Rate: ${Math.round((goodResults.passed / goodResults.totalTests) * 100)}%`);
  console.log(`Execution Time: ${goodResults.executionTime}ms`);

  console.log('\n\n📈 === COMPARISON REPORT ===');
  console.log(`Buggy Code Pass Rate: ${Math.round((buggyResults.passed / buggyResults.totalTests) * 100)}%`);
  console.log(`Good Code Pass Rate: ${Math.round((goodResults.passed / goodResults.totalTests) * 100)}%`);
  console.log(`Improvement: ${Math.round((goodResults.passed / goodResults.totalTests) * 100) - Math.round((buggyResults.passed / buggyResults.totalTests) * 100)}%`);
  
  console.log('\n🎯 === FINAL ASSESSMENT ===');
  if (buggyResults.failed > 0) {
    console.log('❌ BUGGY CODE: Contains bugs and fails multiple tests');
    console.log('🔧 RECOMMENDATION: Fix the identified issues before deployment');
  }
  
  if (goodResults.failed === 0) {
    console.log('✅ GOOD CODE: All tests pass, code is production ready');
    console.log('🚀 RECOMMENDATION: Code can be safely deployed');
  }
}

runComparisonTest().catch(console.error);
