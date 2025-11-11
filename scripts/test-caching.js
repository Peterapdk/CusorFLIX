/**
 * Test Caching
 * 
 * This script tests the caching functionality by making
 * the same request twice and comparing response times.
 * 
 * Usage:
 *   node scripts/test-caching.js [baseUrl] [endpoint]
 * 
 * Examples:
 *   node scripts/test-caching.js http://localhost:3000
 *   node scripts/test-caching.js http://localhost:3000 /api/discover?type=movie
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const ENDPOINT = process.argv[3] || '/api/discover?type=movie&page=1';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function makeRequest(attempt) {
  const startTime = Date.now();
  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const data = await response.json();
    const headers = Object.fromEntries(response.headers.entries());

    return {
      attempt,
      status: response.status,
      duration,
      dataSize: JSON.stringify(data).length,
      headers,
      cacheControl: headers['cache-control'],
    };
  } catch (error) {
    return {
      attempt,
      error: error.message,
    };
  }
}

async function testCaching() {
  log(`\n🚀 Testing Caching`, 'cyan');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Endpoint: ${ENDPOINT}\n`, 'blue');

  // First request (cache miss - should be slower)
  log(`Making first request (cache miss expected)...`, 'yellow');
  const firstRequest = await makeRequest(1);

  if (firstRequest.error) {
    log(`❌ First request failed: ${firstRequest.error}`, 'red');
    return;
  }

  log(`✅ First request completed:`, 'green');
  log(`   Status: ${firstRequest.status}`, 'blue');
  log(`   Duration: ${firstRequest.duration}ms`, 'blue');
  log(`   Data Size: ${firstRequest.dataSize} bytes`, 'blue');
  if (firstRequest.cacheControl) {
    log(`   Cache-Control: ${firstRequest.cacheControl}`, 'blue');
  }

  // Wait a bit before second request
  log(`\n⏳ Waiting 1 second before second request...\n`, 'yellow');
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Second request (cache hit - should be faster)
  log(`Making second request (cache hit expected)...`, 'yellow');
  const secondRequest = await makeRequest(2);

  if (secondRequest.error) {
    log(`❌ Second request failed: ${secondRequest.error}`, 'red');
    return;
  }

  log(`✅ Second request completed:`, 'green');
  log(`   Status: ${secondRequest.status}`, 'blue');
  log(`   Duration: ${secondRequest.duration}ms`, 'blue');
  log(`   Data Size: ${secondRequest.dataSize} bytes`, 'blue');
  if (secondRequest.cacheControl) {
    log(`   Cache-Control: ${secondRequest.cacheControl}`, 'blue');
  }

  // Compare results
  log(`\n📊 Comparison:\n`, 'cyan');
  const timeDifference = firstRequest.duration - secondRequest.duration;
  const speedImprovement = ((timeDifference / firstRequest.duration) * 100).toFixed(2);

  log(`First Request:  ${firstRequest.duration}ms`, 'blue');
  log(`Second Request: ${secondRequest.duration}ms`, 'blue');
  log(`Difference:     ${timeDifference}ms (${speedImprovement}% faster)`, timeDifference > 0 ? 'green' : 'yellow');

  // Check if caching is working
  if (timeDifference > 50) {
    log(`\n✅ Caching appears to be working!`, 'green');
    log(`   Second request was significantly faster`, 'blue');
  } else if (timeDifference > 0) {
    log(`\n⚠️  Caching may be working, but improvement is minimal`, 'yellow');
    log(`   This could be due to:`, 'yellow');
    log(`   - Redis not configured (no caching)`, 'yellow');
    log(`   - Response already very fast`, 'yellow');
    log(`   - Cache TTL expired`, 'yellow');
  } else {
    log(`\n⚠️  Caching may not be working`, 'yellow');
    log(`   Second request was not faster (or was slower)`, 'yellow');
    log(`   Check if Redis is configured`, 'yellow');
  }

  // Verify data is the same
  if (firstRequest.dataSize === secondRequest.dataSize) {
    log(`\n✅ Data size matches (cached data is consistent)`, 'green');
  } else {
    log(`\n⚠️  Data size differs (may indicate different responses)`, 'yellow');
  }

  log(`\n`);
}

// Run the test
testCaching().catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});

