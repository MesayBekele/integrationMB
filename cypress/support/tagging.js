/**
 * Custom Tagging System for Cypress Tests
 * Replaces Cucumber tags with a flexible tagging mechanism
 */

// Global tag registry
const tagRegistry = new Map();

/**
 * Add tags to a test
 * @param {string[]} tags - Array of tags to add
 * @param {Function} testFn - Test function
 */
function addTags(tags, testFn) {
  const testTitle = testFn.name || 'anonymous';
  tagRegistry.set(testTitle, tags);
  return testFn;
}

/**
 * Custom test function with tagging support
 * @param {string} title - Test title
 * @param {string[]} tags - Array of tags
 * @param {Function} testFn - Test function
 */
function taggedTest(title, tags, testFn) {
  // Store tags for this test
  tagRegistry.set(title, tags);
  
  // Check if we should run this test based on tag filtering
  const shouldRun = shouldRunTest(tags);
  
  if (shouldRun) {
    it(title, testFn);
  } else {
    it.skip(title, testFn);
  }
}

/**
 * Custom describe function with tagging support
 * @param {string} title - Suite title
 * @param {string[]} tags - Array of tags
 * @param {Function} suiteFn - Suite function
 */
function taggedDescribe(title, tags, suiteFn) {
  // Store tags for this suite
  tagRegistry.set(title, tags);
  
  // Check if we should run this suite based on tag filtering
  const shouldRun = shouldRunTest(tags);
  
  if (shouldRun) {
    describe(title, suiteFn);
  } else {
    describe.skip(title, suiteFn);
  }
}

/**
 * Determine if a test should run based on its tags
 * @param {string[]} testTags - Tags for the test
 * @returns {boolean} - Whether the test should run
 */
function shouldRunTest(testTags) {
  const runTags = Cypress.env('TAGS');
  
  if (!runTags) {
    return true; // Run all tests if no tag filter specified
  }
  
  const tagsToRun = runTags.split(',').map(tag => tag.trim());
  
  // Check for exclusion tags (starting with ~)
  const excludeTags = tagsToRun.filter(tag => tag.startsWith('~')).map(tag => tag.substring(1));
  const includeTags = tagsToRun.filter(tag => !tag.startsWith('~'));
  
  // If test has any exclude tags, skip it
  if (excludeTags.some(excludeTag => testTags.includes(excludeTag))) {
    return false;
  }
  
  // If include tags specified, test must have at least one
  if (includeTags.length > 0) {
    return includeTags.some(includeTag => testTags.includes(includeTag));
  }
  
  return true;
}

/**
 * Get tags for a test
 * @param {string} testTitle - Test title
 * @returns {string[]} - Array of tags
 */
function getTestTags(testTitle) {
  return tagRegistry.get(testTitle) || [];
}

/**
 * Predefined tag constants
 */
const TAGS = {
  SMOKE: 'smoke',
  REGRESSION: 'regression',
  CRITICAL: 'critical',
  UI: 'ui',
  API: 'api',
  INTEGRATION: 'integration',
  POSITIVE: 'positive',
  NEGATIVE: 'negative',
  EDGE_CASE: 'edge-case',
  SLOW: 'slow',
  FAST: 'fast',
  DEV: 'dev',
  QA: 'qa',
  UAT: 'uat',
  PROD: 'prod'
};

// Export functions and constants
module.exports = {
  taggedTest,
  taggedDescribe,
  addTags,
  shouldRunTest,
  getTestTags,
  TAGS
};

// Make functions available globally
global.taggedTest = taggedTest;
global.taggedDescribe = taggedDescribe;
global.TAGS = TAGS;

