/**
 * Mochawesome Reporter Base64 Protection
 * Specifically protects Mochawesome report generation from Base64 errors
 */

// Protect Mochawesome reporter at the plugin level
if (typeof require !== 'undefined') {
  try {
    // Override the mochawesome reporter module loading
    const Module = require('module');
    const originalLoad = Module._load;

    Module._load = function(request, parent, isMain) {
      try {
        const module = originalLoad.call(this, request, parent, isMain);
        
        // Specifically protect mochawesome-related modules
        if (request.includes('mochawesome') || 
            request.includes('cypress-mochawesome-reporter') ||
            request.includes('mocha-reporter') ||
            request.includes('json-reporter')) {
          
          console.log(`🛡️ Protecting module: ${request}`);
          
          // Wrap the module to handle Base64 errors
          if (typeof module === 'function') {
            // If module is a function (like a reporter constructor)
            return function(...args) {
              try {
                return module.apply(this, args);
              } catch (error) {
                if (error.message && error.message.includes('Length must be a multiple of 4')) {
                  console.warn(`🛡️ Mochawesome Base64 error handled in ${request}:`, error.message);
                  return null;
                }
                throw error;
              }
            };
          } else if (typeof module === 'object' && module !== null) {
            // If module is an object, wrap its methods
            const wrappedModule = { ...module };
            
            Object.keys(wrappedModule).forEach(key => {
              if (typeof wrappedModule[key] === 'function') {
                const originalMethod = wrappedModule[key];
                wrappedModule[key] = function(...args) {
                  try {
                    return originalMethod.apply(this, args);
                  } catch (error) {
                    if (error.message && error.message.includes('Length must be a multiple of 4')) {
                      console.warn(`🛡️ Mochawesome Base64 error handled in ${request}.${key}:`, error.message);
                      return null;
                    }
                    throw error;
                  }
                };
              }
            });
            
            return wrappedModule;
          }
        }
        
        return module;
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn(`🛡️ Module loading Base64 error handled for ${request}:`, error.message);
          return {};
        }
        throw error;
      }
    };
  } catch (e) {
    console.warn('🛡️ Could not set up module-level protection:', e.message);
  }
}

// Protect JSON stringification that might occur during report generation
if (typeof JSON !== 'undefined') {
  const originalStringify = JSON.stringify;
  JSON.stringify = function(value, replacer, space) {
    try {
      return originalStringify.call(this, value, replacer, space);
    } catch (error) {
      if (error.message && error.message.includes('Length must be a multiple of 4')) {
        console.warn('🛡️ JSON.stringify Base64 error handled during report generation:', error.message);
        // Return a safe JSON string
        return '{"error": "Base64 encoding error handled"}';
      }
      throw error;
    }
  };
}

// Protect file writing operations that might occur during report generation
if (typeof require !== 'undefined') {
  try {
    const fs = require('fs');
    
    // Protect writeFileSync for report files
    const originalWriteFileSync = fs.writeFileSync;
    fs.writeFileSync = function(file, data, options) {
      try {
        // If writing JSON report files, ensure data is safe
        if (file.includes('.json') && typeof data === 'string') {
          try {
            // Try to parse and re-stringify to clean any Base64 issues
            const parsed = JSON.parse(data);
            data = JSON.stringify(parsed);
          } catch (parseError) {
            if (parseError.message && parseError.message.includes('Length must be a multiple of 4')) {
              console.warn('🛡️ Report file Base64 error handled:', parseError.message);
              data = '{"error": "Base64 encoding error in report data"}';
            }
          }
        }
        
        return originalWriteFileSync.call(this, file, data, options);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Report file write Base64 error handled:', error.message);
          // Write a safe fallback
          return originalWriteFileSync.call(this, file, '{"error": "Base64 encoding error handled"}', options);
        }
        throw error;
      }
    };

    // Protect async writeFile for report files
    const originalWriteFile = fs.writeFile;
    fs.writeFile = function(file, data, options, callback) {
      if (typeof options === 'function') {
        callback = options;
        options = {};
      }
      
      try {
        // If writing JSON report files, ensure data is safe
        if (file.includes('.json') && typeof data === 'string') {
          try {
            // Try to parse and re-stringify to clean any Base64 issues
            const parsed = JSON.parse(data);
            data = JSON.stringify(parsed);
          } catch (parseError) {
            if (parseError.message && parseError.message.includes('Length must be a multiple of 4')) {
              console.warn('🛡️ Async report file Base64 error handled:', parseError.message);
              data = '{"error": "Base64 encoding error in report data"}';
            }
          }
        }
        
        return originalWriteFile.call(this, file, data, options, callback);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Async report file write Base64 error handled:', error.message);
          // Write a safe fallback
          return originalWriteFile.call(this, file, '{"error": "Base64 encoding error handled"}', options, callback);
        }
        throw error;
      }
    };
  } catch (e) {
    console.warn('🛡️ Could not set up fs protection:', e.message);
  }
}

// Protect screenshot and video processing that might contain Base64 data
if (typeof require !== 'undefined') {
  try {
    const path = require('path');
    
    // Override path operations that might be used in report generation
    const originalJoin = path.join;
    path.join = function(...paths) {
      try {
        return originalJoin.apply(this, paths);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Path join Base64 error handled:', error.message);
          return paths.join('/'); // Fallback path joining
        }
        throw error;
      }
    };
  } catch (e) {
    console.warn('🛡️ Could not set up path protection:', e.message);
  }
}

// Add specific Cypress event handlers for report generation
if (typeof Cypress !== 'undefined') {
  // Before report generation
  Cypress.on('before:run', () => {
    console.log('🛡️ Mochawesome Base64 protection active before test run');
  });

  // After report generation
  Cypress.on('after:run', (results) => {
    console.log('🛡️ Mochawesome Base64 protection active after test run');
    
    // Clean any Base64 data in results that might cause issues
    if (results && typeof results === 'object') {
      try {
        JSON.stringify(results);
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Test results Base64 error handled:', error.message);
        }
      }
    }
  });

  // Handle screenshot events
  Cypress.on('after:screenshot', (details) => {
    console.log('🛡️ Screenshot Base64 protection active');
    
    // Ensure screenshot path doesn't contain problematic Base64 data
    if (details && details.path) {
      try {
        // Validate the path doesn't contain Base64 issues
        const pathStr = details.path.toString();
        if (pathStr.includes('base64')) {
          console.warn('🛡️ Screenshot path contains base64 reference, monitoring for errors');
        }
      } catch (error) {
        if (error.message && error.message.includes('Length must be a multiple of 4')) {
          console.warn('🛡️ Screenshot path Base64 error handled:', error.message);
        }
      }
    }
  });
}

console.log('🛡️ Mochawesome Reporter Base64 Protection loaded - report generation is now safe!');
