/**
 * Test Data Generator utility
 * Generates dynamic test data for various test scenarios
 */

class TestDataGenerator {
  constructor() {
    this.faker = this.initializeFaker();
  }

  /**
   * Initialize faker library (mock implementation)
   * In a real implementation, you would use faker.js
   */
  initializeFaker() {
    return {
      name: {
        firstName: () => this.randomChoice(['John', 'Jane', 'Mike', 'Sarah', 'David', 'Lisa']),
        lastName: () => this.randomChoice(['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia'])
      },
      internet: {
        email: () => `test${Date.now()}@example.com`,
        userName: () => `user${Date.now()}`,
        password: () => this.generatePassword()
      },
      commerce: {
        productName: () => this.randomChoice(['Laptop', 'Phone', 'Tablet', 'Monitor', 'Keyboard', 'Mouse']),
        price: () => (Math.random() * 1000 + 10).toFixed(2),
        department: () => this.randomChoice(['Electronics', 'Clothing', 'Books', 'Home', 'Sports'])
      },
      address: {
        streetAddress: () => `${Math.floor(Math.random() * 9999) + 1} ${this.randomChoice(['Main', 'Oak', 'Pine', 'Elm'])} St`,
        city: () => this.randomChoice(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix']),
        zipCode: () => String(Math.floor(Math.random() * 90000) + 10000),
        state: () => this.randomChoice(['NY', 'CA', 'IL', 'TX', 'AZ'])
      },
      phone: {
        phoneNumber: () => `${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
      },
      company: {
        companyName: () => this.randomChoice(['Tech Corp', 'Innovation Inc', 'Digital Solutions', 'Future Systems', 'Smart Tech'])
      }
    };
  }

  /**
   * Generate test data based on type
   * @param {string} type - Type of data to generate
   * @returns {object} Generated test data
   */
  generate(type) {
    const generators = {
      user: () => this.generateUser(),
      admin: () => this.generateAdmin(),
      product: () => this.generateProduct(),
      order: () => this.generateOrder(),
      address: () => this.generateAddress(),
      company: () => this.generateCompany(),
      creditCard: () => this.generateCreditCard(),
      contact: () => this.generateContact(),
      loginCredentials: () => this.generateLoginCredentials(),
      registrationData: () => this.generateRegistrationData()
    };

    const generator = generators[type];
    if (!generator) {
      throw new Error(`Unknown data type: ${type}`);
    }

    return generator();
  }

  /**
   * Generate user data
   * @returns {object} User data
   */
  generateUser() {
    const firstName = this.faker.name.firstName();
    const lastName = this.faker.name.lastName();
    
    return {
      id: this.generateId(),
      username: this.faker.internet.userName(),
      email: this.faker.internet.email(),
      password: this.faker.internet.password(),
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      phone: this.faker.phone.phoneNumber(),
      role: 'user',
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      preferences: {
        theme: this.randomChoice(['light', 'dark']),
        language: this.randomChoice(['en', 'es', 'fr']),
        notifications: this.randomBoolean()
      }
    };
  }

  /**
   * Generate admin user data
   * @returns {object} Admin user data
   */
  generateAdmin() {
    const user = this.generateUser();
    return {
      ...user,
      role: 'admin',
      permissions: ['read', 'write', 'delete', 'admin'],
      department: this.randomChoice(['IT', 'HR', 'Finance', 'Operations']),
      accessLevel: 'full'
    };
  }

  /**
   * Generate product data
   * @returns {object} Product data
   */
  generateProduct() {
    return {
      id: this.generateId(),
      name: this.faker.commerce.productName(),
      description: `High-quality ${this.faker.commerce.productName().toLowerCase()} for everyday use`,
      price: parseFloat(this.faker.commerce.price()),
      category: this.faker.commerce.department(),
      sku: this.generateSKU(),
      stockQuantity: Math.floor(Math.random() * 1000) + 1,
      weight: (Math.random() * 10 + 0.1).toFixed(2),
      dimensions: {
        length: (Math.random() * 50 + 1).toFixed(1),
        width: (Math.random() * 50 + 1).toFixed(1),
        height: (Math.random() * 50 + 1).toFixed(1)
      },
      tags: this.generateTags(),
      isActive: this.randomBoolean(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate order data
   * @returns {object} Order data
   */
  generateOrder() {
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const items = [];
    let totalAmount = 0;

    for (let i = 0; i < itemCount; i++) {
      const quantity = Math.floor(Math.random() * 3) + 1;
      const price = parseFloat((Math.random() * 100 + 10).toFixed(2));
      const itemTotal = quantity * price;
      totalAmount += itemTotal;

      items.push({
        productId: this.generateId(),
        productName: this.faker.commerce.productName(),
        quantity,
        unitPrice: price,
        totalPrice: itemTotal
      });
    }

    return {
      id: this.generateId(),
      orderNumber: this.generateOrderNumber(),
      customerId: this.generateId(),
      items,
      subtotal: totalAmount,
      tax: totalAmount * 0.08,
      shipping: 9.99,
      totalAmount: totalAmount + (totalAmount * 0.08) + 9.99,
      status: this.randomChoice(['pending', 'processing', 'shipped', 'delivered']),
      paymentStatus: this.randomChoice(['pending', 'paid', 'failed']),
      shippingAddress: this.generateAddress(),
      billingAddress: this.generateAddress(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      estimatedDelivery: this.generateFutureDate(7, 14)
    };
  }

  /**
   * Generate address data
   * @returns {object} Address data
   */
  generateAddress() {
    return {
      id: this.generateId(),
      street: this.faker.address.streetAddress(),
      city: this.faker.address.city(),
      state: this.faker.address.state(),
      zipCode: this.faker.address.zipCode(),
      country: 'United States',
      type: this.randomChoice(['home', 'work', 'other']),
      isDefault: this.randomBoolean()
    };
  }

  /**
   * Generate company data
   * @returns {object} Company data
   */
  generateCompany() {
    return {
      id: this.generateId(),
      name: this.faker.company.companyName(),
      industry: this.randomChoice(['Technology', 'Healthcare', 'Finance', 'Retail', 'Manufacturing']),
      size: this.randomChoice(['startup', 'small', 'medium', 'large', 'enterprise']),
      website: `https://www.${this.faker.company.companyName().toLowerCase().replace(/\s+/g, '')}.com`,
      phone: this.faker.phone.phoneNumber(),
      email: `info@${this.faker.company.companyName().toLowerCase().replace(/\s+/g, '')}.com`,
      address: this.generateAddress(),
      foundedYear: Math.floor(Math.random() * 50) + 1970,
      employeeCount: Math.floor(Math.random() * 10000) + 1,
      revenue: Math.floor(Math.random() * 1000000000) + 100000
    };
  }

  /**
   * Generate credit card data
   * @returns {object} Credit card data
   */
  generateCreditCard() {
    return {
      number: '4111111111111111', // Test card number
      expiryMonth: String(Math.floor(Math.random() * 12) + 1).padStart(2, '0'),
      expiryYear: String(new Date().getFullYear() + Math.floor(Math.random() * 5) + 1),
      cvv: String(Math.floor(Math.random() * 900) + 100),
      holderName: `${this.faker.name.firstName()} ${this.faker.name.lastName()}`,
      type: this.randomChoice(['visa', 'mastercard', 'amex']),
      billingAddress: this.generateAddress()
    };
  }

  /**
   * Generate contact data
   * @returns {object} Contact data
   */
  generateContact() {
    return {
      id: this.generateId(),
      firstName: this.faker.name.firstName(),
      lastName: this.faker.name.lastName(),
      email: this.faker.internet.email(),
      phone: this.faker.phone.phoneNumber(),
      company: this.faker.company.companyName(),
      jobTitle: this.randomChoice(['Manager', 'Developer', 'Designer', 'Analyst', 'Director']),
      address: this.generateAddress(),
      notes: 'Generated test contact',
      tags: this.generateTags(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Generate login credentials
   * @returns {object} Login credentials
   */
  generateLoginCredentials() {
    return {
      username: this.faker.internet.userName(),
      password: this.faker.internet.password(),
      email: this.faker.internet.email(),
      rememberMe: this.randomBoolean()
    };
  }

  /**
   * Generate registration data
   * @returns {object} Registration data
   */
  generateRegistrationData() {
    const firstName = this.faker.name.firstName();
    const lastName = this.faker.name.lastName();
    
    return {
      firstName,
      lastName,
      username: this.faker.internet.userName(),
      email: this.faker.internet.email(),
      password: this.faker.internet.password(),
      confirmPassword: this.faker.internet.password(), // Same as password in real usage
      phone: this.faker.phone.phoneNumber(),
      dateOfBirth: this.generatePastDate(18, 65),
      gender: this.randomChoice(['male', 'female', 'other', 'prefer-not-to-say']),
      agreeToTerms: true,
      subscribeToNewsletter: this.randomBoolean()
    };
  }

  /**
   * Generate unique ID
   * @returns {string} Unique ID
   */
  generateId() {
    return Date.now().toString() + Math.random().toString(36).substr(2, 9);
  }

  /**
   * Generate SKU
   * @returns {string} SKU
   */
  generateSKU() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    let sku = '';
    
    // 3 letters
    for (let i = 0; i < 3; i++) {
      sku += letters.charAt(Math.floor(Math.random() * letters.length));
    }
    
    sku += '-';
    
    // 4 numbers
    for (let i = 0; i < 4; i++) {
      sku += numbers.charAt(Math.floor(Math.random() * numbers.length));
    }
    
    return sku;
  }

  /**
   * Generate order number
   * @returns {string} Order number
   */
  generateOrderNumber() {
    const prefix = 'ORD';
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `${prefix}-${timestamp}-${random}`;
  }

  /**
   * Generate tags
   * @returns {string[]} Array of tags
   */
  generateTags() {
    const allTags = ['popular', 'new', 'sale', 'featured', 'bestseller', 'limited', 'premium', 'eco-friendly'];
    const tagCount = Math.floor(Math.random() * 3) + 1;
    const selectedTags = [];
    
    for (let i = 0; i < tagCount; i++) {
      const tag = this.randomChoice(allTags);
      if (!selectedTags.includes(tag)) {
        selectedTags.push(tag);
      }
    }
    
    return selectedTags;
  }

  /**
   * Generate password with specific criteria
   * @returns {string} Generated password
   */
  generatePassword() {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*';
    
    let password = '';
    
    // Ensure at least one character from each category
    password += this.randomChoice(lowercase);
    password += this.randomChoice(uppercase);
    password += this.randomChoice(numbers);
    password += this.randomChoice(symbols);
    
    // Fill remaining length with random characters
    const allChars = lowercase + uppercase + numbers + symbols;
    const remainingLength = Math.floor(Math.random() * 8) + 4; // 4-12 additional characters
    
    for (let i = 0; i < remainingLength; i++) {
      password += this.randomChoice(allChars);
    }
    
    // Shuffle the password
    return password.split('').sort(() => Math.random() - 0.5).join('');
  }

  /**
   * Generate future date
   * @param {number} minDays - Minimum days from now
   * @param {number} maxDays - Maximum days from now
   * @returns {string} ISO date string
   */
  generateFutureDate(minDays, maxDays) {
    const now = new Date();
    const daysToAdd = Math.floor(Math.random() * (maxDays - minDays + 1)) + minDays;
    const futureDate = new Date(now.getTime() + (daysToAdd * 24 * 60 * 60 * 1000));
    return futureDate.toISOString();
  }

  /**
   * Generate past date
   * @param {number} minYears - Minimum years ago
   * @param {number} maxYears - Maximum years ago
   * @returns {string} ISO date string
   */
  generatePastDate(minYears, maxYears) {
    const now = new Date();
    const yearsAgo = Math.floor(Math.random() * (maxYears - minYears + 1)) + minYears;
    const pastDate = new Date(now.getFullYear() - yearsAgo, 
                             Math.floor(Math.random() * 12), 
                             Math.floor(Math.random() * 28) + 1);
    return pastDate.toISOString().split('T')[0]; // Return date only
  }

  /**
   * Get random choice from array
   * @param {Array} choices - Array of choices
   * @returns {*} Random choice
   */
  randomChoice(choices) {
    return choices[Math.floor(Math.random() * choices.length)];
  }

  /**
   * Generate random boolean
   * @returns {boolean} Random boolean
   */
  randomBoolean() {
    return Math.random() < 0.5;
  }

  /**
   * Generate batch of test data
   * @param {string} type - Type of data to generate
   * @param {number} count - Number of items to generate
   * @returns {Array} Array of generated data
   */
  generateBatch(type, count) {
    const batch = [];
    for (let i = 0; i < count; i++) {
      batch.push(this.generate(type));
    }
    return batch;
  }

  /**
   * Generate test data with relationships
   * @returns {object} Related test data
   */
  generateRelatedData() {
    const user = this.generateUser();
    const company = this.generateCompany();
    const products = this.generateBatch('product', 3);
    const order = this.generateOrder();
    
    // Create relationships
    user.companyId = company.id;
    order.customerId = user.id;
    order.items = order.items.map((item, index) => ({
      ...item,
      productId: products[index % products.length].id,
      productName: products[index % products.length].name
    }));
    
    return {
      user,
      company,
      products,
      order,
      relationships: {
        userCompany: { userId: user.id, companyId: company.id },
        orderCustomer: { orderId: order.id, customerId: user.id },
        orderProducts: order.items.map(item => ({
          orderId: order.id,
          productId: item.productId
        }))
      }
    };
  }
}

// Export singleton instance
const testDataGenerator = new TestDataGenerator();

// Make it available globally in Cypress
if (typeof window !== 'undefined') {
  window.testDataGenerator = testDataGenerator;
}

module.exports = testDataGenerator;

