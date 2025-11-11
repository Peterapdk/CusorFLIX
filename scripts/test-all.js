/**
 * Test All Optimizations
 * 
 * This script runs all optimization tests in sequence:
 * 1. Rate Limiting Test
 * 2. Caching Test
 * 3. Performance Monitoring Instructions
 * 
 * Usage:
 *   node scripts/test-all.js [baseUrl]
 * 
 * Example:
 *   node scripts/test-all.js http://localhost:3000
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);

const BASE_URL = process.argv[2] || 'http://localhost:3000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function runTest(testName, scriptPath, args = []) {
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Running: ${testName}`, 'magenta');
  log(`${'='.repeat(60)}\n`, 'cyan');

  try {
    const command = `node ${scriptPath} ${[BASE_URL, ...args].join(' ')}`;
    const { stdout, stderr } = await execAsync(command, {
      cwd: process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
    });

    if (stdout) {
      console.log(stdout);
    }
    if (stderr) {
      console.error(stderr);
    }

    return { success: true };
  } catch (error) {
    log(`❌ Test failed: ${error.message}`, 'red');
    if (error.stdout) {
      console.log(error.stdout);
    }
    if (error.stderr) {
      console.error(error.stderr);
    }
    return { success: false, error: error.message };
  }
}

async function testAll() {
  log(`\n🚀 Running All Optimization Tests`, 'cyan');
  log(`Base URL: ${BASE_URL}\n`, 'blue');

  const results = [];

  // Test 1: Rate Limiting
  log(`\n📋 Test 1: Rate Limiting`, 'yellow');
  const rateLimitResult = await runTest(
    'Rate Limiting Test',
    'scripts/test-rate-limiting.js'
  );
  results.push({ name: 'Rate Limiting', ...rateLimitResult });

  // Wait between tests
  log(`\n⏳ Waiting 2 seconds before next test...\n`, 'yellow');
  await new Promise((resolve) => setTimeout(resolve, 2000));

  // Test 2: Caching
  log(`\n📋 Test 2: Caching`, 'yellow');
  const cachingResult = await runTest('Caching Test', 'scripts/test-caching.js');
  results.push({ name: 'Caching', ...cachingResult });

  // Test 3: Performance Monitoring (instructions only)
  log(`\n📋 Test 3: Performance Monitoring`, 'yellow');
  log(`   (Instructions - must be tested in browser)\n`, 'blue');
  await runTest(
    'Performance Monitoring Instructions',
    'scripts/test-performance.js'
  );
  results.push({ name: 'Performance Monitoring', success: true, manual: true });

  // Summary
  log(`\n${'='.repeat(60)}`, 'cyan');
  log(`Test Summary`, 'magenta');
  log(`${'='.repeat(60)}\n`, 'cyan');

  results.forEach((result) => {
    if (result.manual) {
      log(`✅ ${result.name}: Manual test (see instructions above)`, 'yellow');
    } else if (result.success) {
      log(`✅ ${result.name}: Passed`, 'green');
    } else {
      log(`❌ ${result.name}: Failed - ${result.error}`, 'red');
    }
  });

  const passed = results.filter((r) => r.success).length;
  const total = results.length;

  log(`\n📊 Results: ${passed}/${total} tests passed\n`, passed === total ? 'green' : 'yellow');

  if (passed === total) {
    log(`✅ All automated tests passed!`, 'green');
    log(`   Don't forget to test performance monitoring in the browser.\n`, 'blue');
  } else {
    log(`⚠️  Some tests failed. Check the output above for details.\n`, 'yellow');
  }

  log(`\n`);
}

// Run all tests
testAll().catch((error) => {
  log(`\n❌ Test suite failed: ${error.message}`, 'red');
  process.exit(1);
});

