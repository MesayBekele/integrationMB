const configManager = require('./configManager');

/**
 * Database Helper utility for database operations in tests
 * Supports MySQL and PostgreSQL
 */
class DatabaseHelper {
  constructor() {
    this.config = configManager.getDatabaseConfig();
    this.connection = null;
    this.dbType = this.detectDatabaseType();
  }

  /**
   * Detect database type from configuration
   * @returns {string} Database type (mysql, postgresql)
   */
  detectDatabaseType() {
    if (this.config.port === 3306 || this.config.host?.includes('mysql')) {
      return 'mysql';
    } else if (this.config.port === 5432 || this.config.host?.includes('postgres')) {
      return 'postgresql';
    }
    return 'mysql'; // default
  }

  /**
   * Execute database query via Cypress task
   * @param {string} query - SQL query to execute
   * @param {array} params - Query parameters
   * @returns {Cypress.Chainable} Query result
   */
  query(query, params = []) {
    return cy.task('queryDb', {
      query,
      params,
      config: this.config,
      dbType: this.dbType
    });
  }

  /**
   * Execute SELECT query
   * @param {string} table - Table name
   * @param {object} conditions - WHERE conditions
   * @param {array} columns - Columns to select
   * @returns {Cypress.Chainable} Query result
   */
  select(table, conditions = {}, columns = ['*']) {
    const columnList = columns.join(', ');
    let query = `SELECT ${columnList} FROM ${table}`;
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    return this.query(query, params);
  }

  /**
   * Execute INSERT query
   * @param {string} table - Table name
   * @param {object} data - Data to insert
   * @returns {Cypress.Chainable} Insert result
   */
  insert(table, data) {
    const columns = Object.keys(data).join(', ');
    const placeholders = Object.keys(data).map(() => '?').join(', ');
    const query = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
    const params = Object.values(data);

    return this.query(query, params);
  }

  /**
   * Execute UPDATE query
   * @param {string} table - Table name
   * @param {object} data - Data to update
   * @param {object} conditions - WHERE conditions
   * @returns {Cypress.Chainable} Update result
   */
  update(table, data, conditions) {
    const setClause = Object.keys(data)
      .map(key => `${key} = ?`)
      .join(', ');
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const query = `UPDATE ${table} SET ${setClause} WHERE ${whereClause}`;
    const params = [...Object.values(data), ...Object.values(conditions)];

    return this.query(query, params);
  }

  /**
   * Execute DELETE query
   * @param {string} table - Table name
   * @param {object} conditions - WHERE conditions
   * @returns {Cypress.Chainable} Delete result
   */
  delete(table, conditions) {
    const whereClause = Object.keys(conditions)
      .map(key => `${key} = ?`)
      .join(' AND ');
    
    const query = `DELETE FROM ${table} WHERE ${whereClause}`;
    const params = Object.values(conditions);

    return this.query(query, params);
  }

  /**
   * Count records in table
   * @param {string} table - Table name
   * @param {object} conditions - WHERE conditions
   * @returns {Cypress.Chainable} Count result
   */
  count(table, conditions = {}) {
    let query = `SELECT COUNT(*) as count FROM ${table}`;
    const params = [];

    if (Object.keys(conditions).length > 0) {
      const whereClause = Object.keys(conditions)
        .map(key => `${key} = ?`)
        .join(' AND ');
      query += ` WHERE ${whereClause}`;
      params.push(...Object.values(conditions));
    }

    return this.query(query, params).then(result => {
      return result[0].count;
    });
  }

  /**
   * Check if record exists
   * @param {string} table - Table name
   * @param {object} conditions - WHERE conditions
   * @returns {Cypress.Chainable} Boolean result
   */
  exists(table, conditions) {
    return this.count(table, conditions).then(count => count > 0);
  }

  /**
   * Get the last inserted ID
   * @param {string} table - Table name
   * @returns {Cypress.Chainable} Last insert ID
   */
  getLastInsertId(table) {
    if (this.dbType === 'mysql') {
      return this.query('SELECT LAST_INSERT_ID() as id').then(result => result[0].id);
    } else {
      // PostgreSQL
      return this.query(`SELECT currval(pg_get_serial_sequence('${table}', 'id')) as id`)
        .then(result => result[0].id);
    }
  }

  /**
   * Truncate table (remove all records)
   * @param {string} table - Table name
   * @returns {Cypress.Chainable} Truncate result
   */
  truncate(table) {
    const query = this.dbType === 'mysql' 
      ? `TRUNCATE TABLE ${table}`
      : `TRUNCATE TABLE ${table} RESTART IDENTITY CASCADE`;
    
    return this.query(query);
  }

  /**
   * Create test user in database
   * @param {object} userData - User data
   * @returns {Cypress.Chainable} Created user
   */
  createTestUser(userData = {}) {
    const defaultUser = {
      username: `testuser_${Date.now()}`,
      email: `test_${Date.now()}@example.com`,
      password: 'hashedpassword123',
      first_name: 'Test',
      last_name: 'User',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const user = { ...defaultUser, ...userData };
    return this.insert('users', user).then(() => {
      return this.getLastInsertId('users').then(id => {
        return { ...user, id };
      });
    });
  }

  /**
   * Create test product in database
   * @param {object} productData - Product data
   * @returns {Cypress.Chainable} Created product
   */
  createTestProduct(productData = {}) {
    const defaultProduct = {
      name: `Test Product ${Date.now()}`,
      description: 'Test product description',
      price: 99.99,
      category: 'test-category',
      stock_quantity: 100,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const product = { ...defaultProduct, ...productData };
    return this.insert('products', product).then(() => {
      return this.getLastInsertId('products').then(id => {
        return { ...product, id };
      });
    });
  }

  /**
   * Create test order in database
   * @param {object} orderData - Order data
   * @returns {Cypress.Chainable} Created order
   */
  createTestOrder(orderData = {}) {
    const defaultOrder = {
      user_id: 1,
      total_amount: 99.99,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const order = { ...defaultOrder, ...orderData };
    return this.insert('orders', order).then(() => {
      return this.getLastInsertId('orders').then(id => {
        return { ...order, id };
      });
    });
  }

  /**
   * Clean up test data by pattern
   * @param {string} table - Table name
   * @param {string} column - Column to match
   * @param {string} pattern - Pattern to match (for LIKE queries)
   * @returns {Cypress.Chainable} Cleanup result
   */
  cleanupTestData(table, column, pattern) {
    const query = `DELETE FROM ${table} WHERE ${column} LIKE ?`;
    return this.query(query, [pattern]);
  }

  /**
   * Clean up test users
   * @returns {Cypress.Chainable} Cleanup result
   */
  cleanupTestUsers() {
    return this.cleanupTestData('users', 'username', 'testuser_%');
  }

  /**
   * Clean up test products
   * @returns {Cypress.Chainable} Cleanup result
   */
  cleanupTestProducts() {
    return this.cleanupTestData('products', 'name', 'Test Product%');
  }

  /**
   * Clean up test orders
   * @returns {Cypress.Chainable} Cleanup result
   */
  cleanupTestOrders() {
    return this.cleanupTestData('orders', 'status', 'test_%');
  }

  /**
   * Execute database transaction
   * @param {function} transactionFn - Function containing transaction logic
   * @returns {Cypress.Chainable} Transaction result
   */
  transaction(transactionFn) {
    return cy.task('executeTransaction', {
      transactionFn: transactionFn.toString(),
      config: this.config,
      dbType: this.dbType
    });
  }

  /**
   * Get table schema information
   * @param {string} table - Table name
   * @returns {Cypress.Chainable} Schema information
   */
  getTableSchema(table) {
    let query;
    if (this.dbType === 'mysql') {
      query = `DESCRIBE ${table}`;
    } else {
      query = `
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = ?
        ORDER BY ordinal_position
      `;
    }
    
    return this.query(query, this.dbType === 'postgresql' ? [table] : []);
  }

  /**
   * Check database connection
   * @returns {Cypress.Chainable} Connection status
   */
  checkConnection() {
    const query = this.dbType === 'mysql' ? 'SELECT 1' : 'SELECT 1 as test';
    return this.query(query).then(() => {
      cy.log('Database connection successful');
      return true;
    }).catch((error) => {
      cy.log(`Database connection failed: ${error.message}`);
      return false;
    });
  }

  /**
   * Execute SQL script from file
   * @param {string} scriptPath - Path to SQL script file
   * @returns {Cypress.Chainable} Script execution result
   */
  executeScript(scriptPath) {
    return cy.task('readFile', scriptPath).then(scriptContent => {
      const statements = scriptContent.split(';').filter(stmt => stmt.trim());
      
      const executeStatements = statements.map(statement => {
        return this.query(statement.trim());
      });
      
      return Promise.all(executeStatements);
    });
  }

  /**
   * Backup table data
   * @param {string} table - Table name
   * @returns {Cypress.Chainable} Backup data
   */
  backupTable(table) {
    return this.select(table).then(data => {
      const backupPath = `cypress/fixtures/backups/${table}_backup_${Date.now()}.json`;
      return cy.task('writeFile', {
        filename: backupPath,
        content: JSON.stringify(data, null, 2)
      }).then(() => {
        cy.log(`Table ${table} backed up to ${backupPath}`);
        return backupPath;
      });
    });
  }

  /**
   * Restore table data from backup
   * @param {string} table - Table name
   * @param {string} backupPath - Path to backup file
   * @returns {Cypress.Chainable} Restore result
   */
  restoreTable(table, backupPath) {
    return cy.task('readFile', backupPath).then(backupContent => {
      const data = JSON.parse(backupContent);
      
      // Truncate table first
      return this.truncate(table).then(() => {
        // Insert backup data
        const insertPromises = data.map(record => {
          return this.insert(table, record);
        });
        
        return Promise.all(insertPromises).then(() => {
          cy.log(`Table ${table} restored from ${backupPath}`);
        });
      });
    });
  }

  /**
   * Generate database report
   * @returns {Cypress.Chainable} Database report
   */
  generateReport() {
    const tables = ['users', 'products', 'orders']; // Add your tables here
    
    const reportPromises = tables.map(table => {
      return this.count(table).then(count => {
        return { table, count };
      });
    });
    
    return Promise.all(reportPromises).then(results => {
      const report = {
        timestamp: new Date().toISOString(),
        database: this.config.database,
        tables: results
      };
      
      cy.log('Database Report:', report);
      return report;
    });
  }
}

// Export singleton instance
const dbHelper = new DatabaseHelper();

// Make it available globally in Cypress
if (typeof window !== 'undefined') {
  window.dbHelper = dbHelper;
}

module.exports = dbHelper;

