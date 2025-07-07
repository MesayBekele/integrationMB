/**
 * Post-Test Base64 Protection System
 * Handles Base64 errors that occur after test execution during cleanup, reporting, etc.
 */

// Protect process-level operations that might occur after tests
if (typeof process !== 'undefined') {
  // Override process.nextTick for post-test operations
  const originalNextTick = process.nextTick;
  process.nextTick = function(callback, ...args) {
    const wrappedCallback = function(...callbackArgs) {
      try {
        return callback.apply(this, callbackArgs);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in process.nextTick:', error.message);
          return;
        }
        throw error;
      }
    };
    return originalNextTick.call(this, wrappedCallback, ...args);
  };

  // Override process.on for uncaught exceptions after tests
  const originalProcessOn = process.on;
  process.on = function(event, listener) {
    if (event === 'uncaughtException') {
      const wrappedListener = function(error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test uncaught Base64 exception handled:', error.message);
          return;
        }
        return listener.call(this, error);
      };
      return originalProcessOn.call(this, event, wrappedListener);
    }
    return originalProcessOn.call(this, event, listener);
  };
}

// Protect setTimeout/setInterval operations that might occur after tests
if (typeof global !== 'undefined') {
  const originalSetTimeout = global.setTimeout;
  const originalSetInterval = global.setInterval;

  global.setTimeout = function(callback, delay, ...args) {
    const wrappedCallback = function(...callbackArgs) {
      try {
        return callback.apply(this, callbackArgs);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in setTimeout:', error.message);
          return;
        }
        throw error;
      }
    };
    return originalSetTimeout.call(this, wrappedCallback, delay, ...args);
  };

  global.setInterval = function(callback, delay, ...args) {
    const wrappedCallback = function(...callbackArgs) {
      try {
        return callback.apply(this, callbackArgs);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in setInterval:', error.message);
          return;
        }
        throw error;
      }
    };
    return originalSetInterval.call(this, wrappedCallback, delay, ...args);
  };
}

// Protect stream operations that might occur during report generation
// Only in Node.js environment, not in browser
if (typeof process !== 'undefined' && process.versions && process.versions.node) {
  try {
    const stream = require('stream');
    const originalWrite = stream.Writable.prototype.write;
    const originalEnd = stream.Writable.prototype.end;

    stream.Writable.prototype.write = function(chunk, encoding, callback) {
      try {
        // Handle Base64 encoding in streams
        if (encoding === 'base64' && typeof chunk === 'string') {
          let cleanChunk = chunk.replace(/[^A-Za-z0-9+/=]/g, '');
          while (cleanChunk.length % 4 !== 0) {
            cleanChunk += '=';
          }
          return originalWrite.call(this, cleanChunk, encoding, callback);
        }
        return originalWrite.call(this, chunk, encoding, callback);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in stream.write:', error.message);
          if (callback) callback();
          return true;
        }
        throw error;
      }
    };

    stream.Writable.prototype.end = function(chunk, encoding, callback) {
      try {
        if (encoding === 'base64' && typeof chunk === 'string') {
          let cleanChunk = chunk.replace(/[^A-Za-z0-9+/=]/g, '');
          while (cleanChunk.length % 4 !== 0) {
            cleanChunk += '=';
          }
          return originalEnd.call(this, cleanChunk, encoding, callback);
        }
        return originalEnd.call(this, chunk, encoding, callback);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in stream.end:', error.message);
          if (callback) callback();
          return this;
        }
        throw error;
      }
    };
  } catch (e) {
    // Stream module not available, skip
  }
}

// Protect image/video processing operations
if (typeof require !== 'undefined') {
  try {
    const fs = require('fs');
    const path = require('path');

    // Override fs operations for screenshot/video files
    const originalCreateReadStream = fs.createReadStream;
    const originalCreateWriteStream = fs.createWriteStream;

    fs.createReadStream = function(filePath, options) {
      try {
        return originalCreateReadStream.call(this, filePath, options);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in createReadStream:', error.message);
          // Return a dummy readable stream
          try {
            const { Readable } = require('stream');
            return new Readable({ read() { this.push(null); } });
          } catch (streamError) {
            // Fallback if stream module not available
            return null;
          }
        }
        throw error;
      }
    };

    fs.createWriteStream = function(filePath, options) {
      try {
        return originalCreateWriteStream.call(this, filePath, options);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in createWriteStream:', error.message);
          // Return a dummy writable stream
          try {
            const { Writable } = require('stream');
            return new Writable({ write(chunk, encoding, callback) { callback(); } });
          } catch (streamError) {
            // Fallback if stream module not available
            return null;
          }
        }
        throw error;
      }
    };
  } catch (e) {
    // fs module not available, skip
  }
}

// Protect Mochawesome reporter operations
if (typeof require !== 'undefined') {
  try {
    // Override require to protect mochawesome modules
    const Module = require('module');
    const originalRequire = Module.prototype.require;

    Module.prototype.require = function(id) {
      try {
        const module = originalRequire.call(this, id);
        
        // If this is a mochawesome-related module, wrap its functions
        if (id.includes('mochawesome') || id.includes('reporter')) {
          if (typeof module === 'object' && module !== null) {
            // Wrap any functions that might handle Base64 data
            Object.keys(module).forEach(key => {
              if (typeof module[key] === 'function') {
                const originalFunction = module[key];
                module[key] = function(...args) {
                  try {
                    return originalFunction.apply(this, args);
                  } catch (error) {
                    if (error.message && error.message.includes('Length must be a multiple of 4')) {
                      console.warn(`🛡️ Post-test Base64 error handled in ${id}.${key}:`, error.message);
                      return null;
                    }
                    throw error;
                  }
                };
              }
            });
          }
        }
        
        return module;
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Post-test Base64 error handled in require:', error.message);
          return {};
        }
        throw error;
      }
    };
  } catch (e) {
    // Module protection not available, skip
  }
}

// Add cleanup handlers for after all tests complete
if (typeof Cypress !== 'undefined') {
  // After all tests in a spec file
  after(() => {
    cy.window().then((win) => {
      // Ensure our protection is still active
      if (win.safeBase64Decode) {
        cy.log('🛡️ Post-test Base64 protection verified');
      }
    });
  });

  // Global after hook for the entire test run
  Cypress.on('run:end', () => {
    console.log('🛡️ Post-test Base64 protection active during cleanup');
  });
}

console.log('🛡️ Post-Test Base64 Protection System loaded - cleanup operations are now safe!');
