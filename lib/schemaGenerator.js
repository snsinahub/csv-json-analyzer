// Schema templates for data generation
import { faker } from '@faker-js/faker';

export function generateData(schema, rowCount = 100, seed = null, locale = 'en') {
  // Use English locale by default
  faker.setLocale('en');
  
  if (seed !== null) {
    faker.seed(seed);
  }
  
  const data = [];
  
  for (let i = 0; i < rowCount; i++) {
    const row = {};
    
    schema.columns.forEach(column => {
      row[column.name] = generateFieldValue(column, i, faker);
    });
    
    data.push(row);
  }
  
  return data;
}

function generateFieldValue(column, index, faker) {
  const { type, config = {} } = column;
  
  switch (type) {
    case 'sequential':
      return (config.start || 1) + index * (config.increment || 1);
      
    case 'text':
      return faker.lorem.words(config.wordCount || 3);
      
    case 'firstName':
      return faker.person.firstName();
      
    case 'lastName':
      return faker.person.lastName();
      
    case 'fullName':
      return faker.person.fullName();
      
    case 'email':
      return faker.internet.email();
      
    case 'phone':
      return faker.phone.number();
      
    case 'company':
      return faker.company.name();
      
    case 'jobTitle':
      return faker.person.jobTitle();
      
    case 'address':
      return faker.location.streetAddress();
      
    case 'city':
      return faker.location.city();
      
    case 'state':
      return faker.location.state();
      
    case 'country':
      return faker.location.country();
      
    case 'zipCode':
      return faker.location.zipCode();
      
    case 'integer':
      return faker.number.int({ 
        min: config.min || 0, 
        max: config.max || 1000 
      });
      
    case 'decimal':
      return faker.number.float({ 
        min: config.min || 0, 
        max: config.max || 1000,
        fractionDigits: config.precision || 2
      });
      
    case 'currency':
      return faker.number.float({ 
        min: config.min || 0, 
        max: config.max || 1000,
        fractionDigits: 2
      });
      
    case 'percentage':
      return faker.number.int({ min: 0, max: 100 });
      
    case 'date':
      const start = config.startDate ? new Date(config.startDate) : new Date(2020, 0, 1);
      const end = config.endDate ? new Date(config.endDate) : new Date();
      return faker.date.between({ from: start, to: end }).toISOString().split('T')[0];
      
    case 'datetime':
      return faker.date.recent().toISOString();
      
    case 'boolean':
      return faker.datatype.boolean();
      
    case 'category':
      if (config.values && config.values.length > 0) {
        return faker.helpers.arrayElement(config.values);
      }
      return 'Category';
      
    case 'status':
      const statuses = config.values || ['active', 'inactive', 'pending'];
      return faker.helpers.arrayElement(statuses);
      
    case 'uuid':
      return faker.string.uuid();
      
    case 'url':
      return faker.internet.url();
      
    case 'product':
      return faker.commerce.productName();
      
    case 'price':
      return faker.commerce.price();
      
    case 'sku':
      return faker.string.alphanumeric(10).toUpperCase();
      
    case 'username':
      return faker.internet.username();
      
    case 'department':
      const departments = config.values || ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations', 'IT', 'Support'];
      return faker.helpers.arrayElement(departments);
      
    case 'loremParagraph':
      return faker.lorem.paragraph(config.paragraphs || 1);
      
    case 'loremSentence':
      return faker.lorem.sentence(config.words || 10);
      
    case 'loremWords':
      return faker.lorem.words(config.wordCount || 5);
      
    case 'ipv4':
      return faker.internet.ipv4();
      
    case 'ipv6':
      return faker.internet.ipv6();
      
    case 'macAddress':
      return faker.internet.mac();
      
    case 'latitude':
      return faker.location.latitude();
      
    case 'longitude':
      return faker.location.longitude();
      
    case 'timestamp':
      return Math.floor(faker.date.recent().getTime() / 1000);
      
    case 'creditCard':
      return faker.finance.creditCardNumber();
      
    case 'iban':
      return faker.finance.iban();
      
    case 'accountNumber':
      return faker.finance.accountNumber();
      
    case 'color':
      if (config.format === 'rgb') {
        return faker.color.rgb();
      } else if (config.format === 'named') {
        return faker.color.human();
      }
      return faker.color.hex();
      
    case 'sentence':
      return faker.lorem.sentence();
      
    case 'paragraph':
      return faker.lorem.paragraph();
      
    case 'hashtag':
      return '#' + faker.lorem.word();
      
    case 'emoji':
      return faker.internet.emoji();
      
    case 'avatar':
      return faker.image.avatar();
      
    case 'imageUrl':
      return faker.image.url();
      
    case 'filePath':
      return faker.system.filePath();
      
    case 'fileName':
      return faker.system.fileName();
      
    case 'mimeType':
      return faker.system.mimeType();
      
    case 'userAgent':
      return faker.internet.userAgent();
      
    case 'slug':
      return faker.lorem.slug();
      
    case 'isbn':
      return faker.commerce.isbn();
      
    case 'ean':
      return faker.commerce.isbn(13);
      
    case 'bitcoinAddress':
      return faker.finance.bitcoinAddress();
      
    case 'ethereumAddress':
      return faker.finance.ethereumAddress();
      
    default:
      return '';
  }
}

export const schemaTemplates = {
  'ecommerce-orders': {
    name: 'E-commerce Orders',
    description: '8 columns for online order data',
    columns: [
      { name: 'order_id', type: 'sequential', config: { start: 1001 } },
      { name: 'customer_name', type: 'fullName' },
      { name: 'customer_email', type: 'email' },
      { name: 'product_name', type: 'product' },
      { name: 'quantity', type: 'integer', config: { min: 1, max: 10 } },
      { name: 'unit_price', type: 'currency', config: { min: 10, max: 500 } },
      { name: 'total_price', type: 'currency', config: { min: 10, max: 5000 } },
      { name: 'order_date', type: 'date', config: { startDate: '2024-01-01', endDate: '2025-12-31' } },
      { name: 'status', type: 'status', config: { values: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'] } }
    ]
  },
  
  'customer-database': {
    name: 'Customer Database',
    description: '12 columns for customer information',
    columns: [
      { name: 'customer_id', type: 'sequential', config: { start: 1 } },
      { name: 'first_name', type: 'firstName' },
      { name: 'last_name', type: 'lastName' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone' },
      { name: 'address', type: 'address' },
      { name: 'city', type: 'city' },
      { name: 'state', type: 'state' },
      { name: 'zip_code', type: 'zipCode' },
      { name: 'country', type: 'country' },
      { name: 'registration_date', type: 'date', config: { startDate: '2020-01-01' } },
      { name: 'account_status', type: 'status', config: { values: ['active', 'inactive', 'suspended'] } }
    ]
  },
  
  'product-inventory': {
    name: 'Product Inventory',
    description: '11 columns for product stock management',
    columns: [
      { name: 'product_id', type: 'sequential', config: { start: 1 } },
      { name: 'sku', type: 'sku' },
      { name: 'product_name', type: 'product' },
      { name: 'category', type: 'category', config: { values: ['Electronics', 'Clothing', 'Food', 'Books', 'Toys'] } },
      { name: 'brand', type: 'company' },
      { name: 'price', type: 'currency', config: { min: 5, max: 1000 } },
      { name: 'cost', type: 'currency', config: { min: 3, max: 800 } },
      { name: 'quantity_in_stock', type: 'integer', config: { min: 0, max: 500 } },
      { name: 'reorder_level', type: 'integer', config: { min: 10, max: 50 } },
      { name: 'supplier_name', type: 'company' },
      { name: 'last_restocked', type: 'date', config: { startDate: '2024-01-01' } }
    ]
  },
  
  'employee-records': {
    name: 'Employee Records',
    description: '10 columns for employee data',
    columns: [
      { name: 'employee_id', type: 'sequential', config: { start: 1001 } },
      { name: 'first_name', type: 'firstName' },
      { name: 'last_name', type: 'lastName' },
      { name: 'email', type: 'email' },
      { name: 'department', type: 'category', config: { values: ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations'] } },
      { name: 'job_title', type: 'jobTitle' },
      { name: 'hire_date', type: 'date', config: { startDate: '2015-01-01', endDate: '2025-12-31' } },
      { name: 'salary', type: 'currency', config: { min: 40000, max: 150000 } },
      { name: 'manager_id', type: 'integer', config: { min: 1001, max: 1050 } },
      { name: 'employment_status', type: 'status', config: { values: ['active', 'on-leave', 'terminated'] } }
    ]
  },
  
  'sales-transactions': {
    name: 'Sales Transactions',
    description: '10 columns for sales data',
    columns: [
      { name: 'transaction_id', type: 'uuid' },
      { name: 'sale_date', type: 'datetime' },
      { name: 'salesperson_name', type: 'fullName' },
      { name: 'customer_name', type: 'fullName' },
      { name: 'product_name', type: 'product' },
      { name: 'quantity', type: 'integer', config: { min: 1, max: 20 } },
      { name: 'unit_price', type: 'currency', config: { min: 10, max: 1000 } },
      { name: 'discount', type: 'percentage' },
      { name: 'tax', type: 'decimal', config: { min: 0, max: 100, precision: 2 } },
      { name: 'total_amount', type: 'currency', config: { min: 10, max: 20000 } }
    ]
  },
  
  'user-accounts': {
    name: 'User Accounts',
    description: '9 columns for user account data',
    columns: [
      { name: 'user_id', type: 'uuid' },
      { name: 'username', type: 'username' },
      { name: 'email', type: 'email' },
      { name: 'first_name', type: 'firstName' },
      { name: 'last_name', type: 'lastName' },
      { name: 'avatar_url', type: 'avatar' },
      { name: 'role', type: 'category', config: { values: ['admin', 'user', 'moderator', 'guest'] } },
      { name: 'created_at', type: 'datetime' },
      { name: 'is_active', type: 'boolean' }
    ]
  },
  
  'blog-posts': {
    name: 'Blog Posts',
    description: '10 columns for blog content',
    columns: [
      { name: 'post_id', type: 'sequential', config: { start: 1 } },
      { name: 'title', type: 'sentence' },
      { name: 'slug', type: 'slug' },
      { name: 'author_name', type: 'fullName' },
      { name: 'content', type: 'paragraph' },
      { name: 'excerpt', type: 'loremSentence' },
      { name: 'category', type: 'category', config: { values: ['Technology', 'Business', 'Lifestyle', 'Travel', 'Food'] } },
      { name: 'published_date', type: 'date', config: { startDate: '2024-01-01' } },
      { name: 'view_count', type: 'integer', config: { min: 0, max: 10000 } },
      { name: 'status', type: 'status', config: { values: ['draft', 'published', 'archived'] } }
    ]
  },
  
  'event-registrations': {
    name: 'Event Registrations',
    description: '8 columns for event attendees',
    columns: [
      { name: 'registration_id', type: 'uuid' },
      { name: 'event_name', type: 'sentence' },
      { name: 'attendee_name', type: 'fullName' },
      { name: 'email', type: 'email' },
      { name: 'phone', type: 'phone' },
      { name: 'ticket_type', type: 'category', config: { values: ['VIP', 'General', 'Student', 'Early Bird'] } },
      { name: 'ticket_price', type: 'currency', config: { min: 0, max: 500 } },
      { name: 'registration_date', type: 'datetime' }
    ]
  },
  
  'iot-sensor-data': {
    name: 'IoT Sensor Data',
    description: '8 columns for sensor readings',
    columns: [
      { name: 'sensor_id', type: 'uuid' },
      { name: 'timestamp', type: 'timestamp' },
      { name: 'temperature', type: 'decimal', config: { min: -20, max: 50, precision: 2 } },
      { name: 'humidity', type: 'percentage' },
      { name: 'pressure', type: 'decimal', config: { min: 900, max: 1100, precision: 2 } },
      { name: 'latitude', type: 'latitude' },
      { name: 'longitude', type: 'longitude' },
      { name: 'battery_level', type: 'percentage' }
    ]
  },
  
  'financial-transactions': {
    name: 'Financial Transactions',
    description: '9 columns for financial data',
    columns: [
      { name: 'transaction_id', type: 'uuid' },
      { name: 'account_number', type: 'accountNumber' },
      { name: 'transaction_date', type: 'datetime' },
      { name: 'description', type: 'sentence' },
      { name: 'amount', type: 'currency', config: { min: -5000, max: 5000 } },
      { name: 'balance', type: 'currency', config: { min: 0, max: 100000 } },
      { name: 'transaction_type', type: 'category', config: { values: ['debit', 'credit', 'transfer', 'fee'] } },
      { name: 'category', type: 'category', config: { values: ['groceries', 'utilities', 'salary', 'entertainment', 'healthcare'] } },
      { name: 'merchant', type: 'company' }
    ]
  }
};

export function getTemplatesList() {
  return Object.entries(schemaTemplates).map(([id, template]) => ({
    id,
    name: template.name,
    description: template.description,
    columnCount: template.columns.length
  }));
}

export function getTemplate(id) {
  return schemaTemplates[id] || null;
}
