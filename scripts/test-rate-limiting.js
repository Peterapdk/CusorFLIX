/**
 * Test Rate Limiting
 * 
 * This script tests the rate limiting functionality by making
 * multiple requests to the discover API endpoint.
 * 
 * Usage:
 *   node scripts/test-rate-limiting.js [baseUrl] [limit]
 * 
 * Examples:
 *   node scripts/test-rate-limiting.js http://localhost:3000
 *   node scripts/test-rate-limiting.js http://localhost:3000 40
 */

const BASE_URL = process.argv[2] || 'http://localhost:3000';
const LIMIT = parseInt(process.argv[3] || '40', 10);
const ENDPOINT = '/api/discover?type=movie&page=1';

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

async function makeRequest(index) {
  try {
    const startTime = Date.now();
    const response = await fetch(`${BASE_URL}${ENDPOINT}`);
    const endTime = Date.now();
    const duration = endTime - startTime;

    const status = response.status;
    const headers = Object.fromEntries(response.headers.entries());

    return {
      index,
      status,
      duration,
      headers,
      rateLimitLimit: headers['x-ratelimit-limit'],
      rateLimitRemaining: headers['x-ratelimit-remaining'],
      rateLimitReset: headers['x-ratelimit-reset'],
      retryAfter: headers['retry-after'],
    };
  } catch (error) {
    return {
      index,
      error: error.message,
    };
  }
}

async function testRateLimiting() {
  log(`\n🚀 Testing Rate Limiting`, 'cyan');
  log(`Base URL: ${BASE_URL}`, 'blue');
  log(`Endpoint: ${ENDPOINT}`, 'blue');
  log(`Expected Limit: ${LIMIT} requests/minute\n`, 'blue');

  const results = [];
  const totalRequests = LIMIT + 5; // Make 5 extra requests to test limit

  log(`Making ${totalRequests} requests...\n`, 'yellow');

  // Make requests sequentially to avoid race conditions
  for (let i = 1; i <= totalRequests; i++) {
    const result = await makeRequest(i);
    results.push(result);

    if (result.error) {
      log(`❌ Request ${i}: Error - ${result.error}`, 'red');
    } else if (result.status === 429) {
      log(
        `⚠️  Request ${i}: Rate Limited (429) - Retry After: ${result.retryAfter}s - Remaining: ${result.rateLimitRemaining}`,
        'yellow'
      );
    } else if (result.status === 200) {
      log(
        `✅ Request ${i}: Success (200) - Duration: ${result.duration}ms - Remaining: ${result.rateLimitRemaining}/${result.rateLimitLimit}`,
        'green'
      );
    } else {
      log(`❌ Request ${i}: Unexpected Status (${result.status})`, 'red');
    }

    // Small delay between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  // Summary
  log(`\n📊 Summary:\n`, 'cyan');
  const successful = results.filter((r) => r.status === 200).length;
  const rateLimited = results.filter((r) => r.status === 429).length;
  const errors = results.filter((r) => r.error).length;

  log(`Total Requests: ${totalRequests}`, 'blue');
  log(`Successful (200): ${successful}`, 'green');
  log(`Rate Limited (429): ${rateLimited}`, rateLimited > 0 ? 'yellow' : 'blue');
  log(`Errors: ${errors}`, errors > 0 ? 'red' : 'blue');

  // Check if rate limiting is working
  if (rateLimited > 0) {
    log(`\n✅ Rate limiting is working!`, 'green');
    log(`   Requests exceeded the limit of ${LIMIT}/minute`, 'blue');
  } else if (successful === totalRequests) {
    log(`\n⚠️  Rate limiting may not be working`, 'yellow');
    log(`   All requests succeeded (expected some 429 responses)`, 'yellow');
    log(`   Check if Redis is configured or rate limiting is enabled`, 'yellow');
  }

  // Check for rate limit headers
  const firstResult = results.find((r) => r.rateLimitLimit);
  if (firstResult) {
    log(`\n📋 Rate Limit Headers:`, 'cyan');
    log(`   X-RateLimit-Limit: ${firstResult.rateLimitLimit}`, 'blue');
    log(`   X-RateLimit-Remaining: ${firstResult.rateLimitRemaining}`, 'blue');
    log(`   X-RateLimit-Reset: ${firstResult.rateLimitReset}`, 'blue');
  } else {
    log(`\n⚠️  Rate limit headers not found`, 'yellow');
    log(`   Check if rate limiting is properly configured`, 'yellow');
  }

  log(`\n`);
}

// Run the test
testRateLimiting().catch((error) => {
  log(`\n❌ Test failed: ${error.message}`, 'red');
  process.exit(1);
});

