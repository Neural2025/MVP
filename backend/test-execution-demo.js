const testExecutionService = require('./services/testExecutionService');

const testCode = `
function add(a, b) {
  return a + b;
}

function divide(a, b) {
  if (b === 0) {
    throw new Error('Division by zero');
  }
  return a / b;
}

function validateEmail(email) {
  return email.includes('@') && email.includes('.');
}

function calculateTotal(items) {
  let total = 0;
  for (let item of items) {
    total += item.price * item.quantity;
  }
  return total;
}
`;

console.log('=== EXECUTING REAL TESTS ===');
console.log('Code to test:');
console.log(testCode);
console.log('\n=== STARTING TEST EXECUTION ===');

testExecutionService.executeTests(testCode, 'javascript', 'developer')
  .then(results => {
    console.log('\n=== TEST EXECUTION REPORT ===');
    console.log('Total Tests:', results.totalTests);
    console.log('Passed:', results.passed);
    console.log('Failed:', results.failed);
    console.log('Errors:', results.errors);
    console.log('Pass Rate:', Math.round((results.passed / results.totalTests) * 100) + '%');
    console.log('Coverage:', results.coverage + '%');
    console.log('Execution Time:', results.executionTime + 'ms');
    console.log('\n=== INDIVIDUAL TEST RESULTS ===');
    results.testCases.forEach((test, index) => {
      console.log(`${index + 1}. ${test.name}`);
      console.log(`   Status: ${test.status.toUpperCase()}`);
      console.log(`   Message: ${test.message}`);
      console.log(`   Time: ${test.executionTime}ms`);
      if (test.error) console.log(`   Error: ${test.error}`);
      if (test.result !== undefined) console.log(`   Result: ${JSON.stringify(test.result)}`);
      console.log('');
    });
    console.log('\n=== SUMMARY ===');
    console.log(results.summary);
    
    console.log('\n=== QUALITY ASSESSMENT ===');
    const passRate = Math.round((results.passed / results.totalTests) * 100);
    if (passRate >= 90) {
      console.log('🟢 EXCELLENT: Code quality is excellent!');
    } else if (passRate >= 70) {
      console.log('🟡 GOOD: Code quality is good with minor issues.');
    } else if (passRate >= 50) {
      console.log('🟠 AVERAGE: Code quality needs improvement.');
    } else {
      console.log('🔴 POOR: Code quality is poor and needs significant work.');
    }
  })
  .catch(error => {
    console.error('❌ Test execution failed:', error);
  });
