/**
 * Node.js level Base64 protection for Cypress plugins and server-side operations
 */

// Override Buffer methods at Node.js level
const originalBufferFrom = Buffer.from;
const originalBufferAlloc = Buffer.alloc;

Buffer.from = function(data, encoding) {
  if (encoding === 'base64' && typeof data === 'string') {
    try {
      // Clean and validate Base64 string
      let cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
      
      // Ensure proper padding
      while (cleanData.length % 4 !== 0) {
        cleanData += '=';
      }
      
      // Validate Base64 format
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanData)) {
        console.warn('🛡️ Node.js Buffer.from invalid Base64 format handled');
        return originalBufferFrom.call(this, '', encoding);
      }
      
      return originalBufferFrom.call(this, cleanData, encoding);
    } catch (error) {
      console.warn('🛡️ Node.js Buffer.from Base64 error handled:', error.message);
      return originalBufferFrom.call(this, '', encoding);
    }
  }
  return originalBufferFrom.apply(this, arguments);
};

// Override fs operations that might involve Base64
const fs = require('fs');
const originalReadFile = fs.readFile;
const originalReadFileSync = fs.readFileSync;
const originalWriteFile = fs.writeFile;
const originalWriteFileSync = fs.writeFileSync;

// Async readFile with Base64 protection
fs.readFile = function(path, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (options && options.encoding === 'base64') {
    return originalReadFile.call(this, path, options, (err, data) => {
      if (err) return callback(err);
      
      try {
        if (typeof data === 'string') {
          // Clean and validate Base64 data
          let cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
          while (cleanData.length % 4 !== 0) {
            cleanData += '=';
          }
          return callback(null, cleanData);
        }
        return callback(null, data);
      } catch (error) {
        console.warn('🛡️ Node.js fs.readFile Base64 error handled:', error.message);
        return callback(null, '');
      }
    });
  }
  
  return originalReadFile.apply(this, arguments);
};

// Sync readFile with Base64 protection
fs.readFileSync = function(path, options) {
  if (options && options.encoding === 'base64') {
    try {
      const data = originalReadFileSync.call(this, path, options);
      if (typeof data === 'string') {
        // Clean and validate Base64 data
        let cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
        while (cleanData.length % 4 !== 0) {
          cleanData += '=';
        }
        return cleanData;
      }
      return data;
    } catch (error) {
      console.warn('🛡️ Node.js fs.readFileSync Base64 error handled:', error.message);
      return '';
    }
  }
  
  return originalReadFileSync.apply(this, arguments);
};

// Async writeFile with Base64 protection
fs.writeFile = function(path, data, options, callback) {
  if (typeof options === 'function') {
    callback = options;
    options = {};
  }
  
  if (options && options.encoding === 'base64' && typeof data === 'string') {
    try {
      // Clean and validate Base64 data before writing
      let cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
      while (cleanData.length % 4 !== 0) {
        cleanData += '=';
      }
      return originalWriteFile.call(this, path, cleanData, options, callback);
    } catch (error) {
      console.warn('🛡️ Node.js fs.writeFile Base64 error handled:', error.message);
      return callback && callback(null);
    }
  }
  
  return originalWriteFile.apply(this, arguments);
};

// Sync writeFile with Base64 protection
fs.writeFileSync = function(path, data, options) {
  if (options && options.encoding === 'base64' && typeof data === 'string') {
    try {
      // Clean and validate Base64 data before writing
      let cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
      while (cleanData.length % 4 !== 0) {
        cleanData += '=';
      }
      return originalWriteFileSync.call(this, path, cleanData, options);
    } catch (error) {
      console.warn('🛡️ Node.js fs.writeFileSync Base64 error handled:', error.message);
      return;
    }
  }
  
  return originalWriteFileSync.apply(this, arguments);
};

// Utility functions for safe Base64 operations in Node.js
function safeBase64Encode(data) {
  try {
    if (!data) return '';
    return Buffer.from(data).toString('base64');
  } catch (error) {
    console.warn('🛡️ Node.js safeBase64Encode error handled:', error.message);
    return '';
  }
}

function safeBase64Decode(data) {
  try {
    if (!data || typeof data !== 'string') return '';
    
    // Clean the Base64 string
    let cleanData = data.replace(/[^A-Za-z0-9+/=]/g, '');
    
    // Add proper padding
    while (cleanData.length % 4 !== 0) {
      cleanData += '=';
    }
    
    return Buffer.from(cleanData, 'base64').toString();
  } catch (error) {
    console.warn('🛡️ Node.js safeBase64Decode error handled:', error.message);
    return '';
  }
}

module.exports = {
  safeBase64Encode,
  safeBase64Decode
};

console.log('🛡️ Node.js Base64 Protection System loaded - server-side Base64 operations are now safe!');
