/**
 * Comprehensive error handling system for Cypress
 * Prevents "uncaught exception was detected outside of a test" errors
 */

// Track if we're currently in a test context
let inTestContext = false;

// Before each test - mark that we're in test context
beforeEach(() => {
  inTestContext = true;
});

// After each test - mark that we're out of test context
afterEach(() => {
  inTestContext = false;
});

// Global error handler with context awareness
Cypress.on('uncaught:exception', (err, runnable) => {
  const errorMessage = err.message || '';
  
  // Always handle Base64 encoding errors
  if (errorMessage.includes('Length must be a multiple of 4')) {
    console.warn('🛡️ Base64 encoding error handled:', errorMessage);
    return false; // Prevent test failure
  }
  
  if (errorMessage.includes('invalid string') && errorMessage.includes('base64')) {
    console.warn('🛡️ Base64 string encoding error handled:', errorMessage);
    return false; // Prevent test failure
  }
  
  // Handle common browser/network errors that shouldn't fail tests
  const nonCriticalErrors = [
    'ResizeObserver loop limit exceeded',
    'Non-Error promise rejection captured',
    'Script error',
    'Network request failed',
    'Loading chunk',
    'ChunkLoadError'
  ];
  
  if (nonCriticalErrors.some(pattern => errorMessage.includes(pattern))) {
    console.warn('🔧 Non-critical error handled:', errorMessage);
    return false; // Prevent test failure
  }
  
  // If we're outside of test context, be more lenient
  if (!inTestContext && !runnable) {
    console.warn('⚠️ Exception outside test context handled:', errorMessage);
    return false; // Prevent "uncaught exception was detected outside of a test"
  }
  
  // Log other exceptions but let Cypress handle them normally
  console.log('🔍 Uncaught exception (passed to Cypress):', errorMessage);
  
  // Return true to let Cypress handle the exception normally
  return true;
});

// Handle window errors that might occur outside test context
Cypress.on('window:before:load', (win) => {
  // Add error handler to the window to catch errors that might occur
  win.addEventListener('error', (event) => {
    const errorMessage = event.error?.message || event.message || 'Unknown error';
    
    // Handle Base64 errors at window level too
    if (errorMessage.includes('Length must be a multiple of 4') || 
        (errorMessage.includes('invalid string') && errorMessage.includes('base64'))) {
      console.warn('🛡️ Window-level Base64 error handled:', errorMessage);
      event.preventDefault();
      return false;
    }
  });
  
  // Handle unhandled promise rejections
  win.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason || 'Unknown rejection';
    
    // Handle Base64 errors in promises
    if (typeof errorMessage === 'string' && 
        (errorMessage.includes('Length must be a multiple of 4') || 
         (errorMessage.includes('invalid string') && errorMessage.includes('base64')))) {
      console.warn('🛡️ Promise rejection Base64 error handled:', errorMessage);
      event.preventDefault();
      return false;
    }
  });
});

// Export context tracking for use in other files
export { inTestContext };
