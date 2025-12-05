'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'semantic-ui-react';

const DATA_TYPES = [
  // Number Types
  { value: 'sequential', label: 'Sequential Number', category: 'Number' },
  { value: 'integer', label: 'Random Integer', category: 'Number' },
  { value: 'decimal', label: 'Random Decimal', category: 'Number' },
  { value: 'currency', label: 'Currency', category: 'Number' },
  { value: 'percentage', label: 'Percentage', category: 'Number' },
  
  // Text Types
  { value: 'text', label: 'Random Text', category: 'Text' },
  { value: 'firstName', label: 'First Name', category: 'Text' },
  { value: 'lastName', label: 'Last Name', category: 'Text' },
  { value: 'fullName', label: 'Full Name', category: 'Text' },
  { value: 'username', label: 'Username', category: 'Text' },
  { value: 'company', label: 'Company Name', category: 'Text' },
  { value: 'jobTitle', label: 'Job Title', category: 'Text' },
  { value: 'department', label: 'Department', category: 'Text' },
  { value: 'loremWords', label: 'Lorem Words', category: 'Text' },
  { value: 'loremSentence', label: 'Lorem Sentence', category: 'Text' },
  { value: 'loremParagraph', label: 'Lorem Paragraph', category: 'Text' },
  { value: 'sentence', label: 'Sentence', category: 'Text' },
  { value: 'paragraph', label: 'Paragraph', category: 'Text' },
  { value: 'slug', label: 'Slug', category: 'Text' },
  
  // Contact Types
  { value: 'email', label: 'Email Address', category: 'Contact' },
  { value: 'phone', label: 'Phone Number', category: 'Contact' },
  { value: 'url', label: 'Website URL', category: 'Contact' },
  { value: 'ipv4', label: 'IP Address (v4)', category: 'Contact' },
  { value: 'ipv6', label: 'IP Address (v6)', category: 'Contact' },
  { value: 'macAddress', label: 'MAC Address', category: 'Contact' },
  { value: 'userAgent', label: 'User Agent', category: 'Contact' },
  
  // Location Types
  { value: 'address', label: 'Street Address', category: 'Location' },
  { value: 'city', label: 'City', category: 'Location' },
  { value: 'state', label: 'State/Province', category: 'Location' },
  { value: 'country', label: 'Country', category: 'Location' },
  { value: 'zipCode', label: 'ZIP/Postal Code', category: 'Location' },
  { value: 'latitude', label: 'Latitude', category: 'Location' },
  { value: 'longitude', label: 'Longitude', category: 'Location' },
  
  // Date/Time Types
  { value: 'date', label: 'Date', category: 'Date/Time' },
  { value: 'datetime', label: 'Date & Time', category: 'Date/Time' },
  { value: 'timestamp', label: 'Unix Timestamp', category: 'Date/Time' },
  
  // Identifier Types
  { value: 'uuid', label: 'UUID', category: 'Identifier' },
  { value: 'sku', label: 'SKU/Product Code', category: 'Identifier' },
  { value: 'isbn', label: 'ISBN', category: 'Identifier' },
  { value: 'ean', label: 'EAN-13', category: 'Identifier' },
  { value: 'creditCard', label: 'Credit Card Number', category: 'Identifier' },
  { value: 'iban', label: 'IBAN', category: 'Identifier' },
  { value: 'accountNumber', label: 'Account Number', category: 'Identifier' },
  
  // Commerce Types
  { value: 'product', label: 'Product Name', category: 'Commerce' },
  { value: 'price', label: 'Product Price', category: 'Commerce' },
  
  // Category/Boolean Types
  { value: 'boolean', label: 'Boolean', category: 'Boolean/Category' },
  { value: 'category', label: 'Category', category: 'Boolean/Category' },
  { value: 'status', label: 'Status', category: 'Boolean/Category' },
  
  // Advanced Types
  { value: 'color', label: 'Color', category: 'Advanced' },
  { value: 'hashtag', label: 'Hashtag', category: 'Advanced' },
  { value: 'emoji', label: 'Emoji', category: 'Advanced' },
  { value: 'avatar', label: 'Avatar URL', category: 'Advanced' },
  { value: 'imageUrl', label: 'Image URL', category: 'Advanced' },
  { value: 'filePath', label: 'File Path', category: 'Advanced' },
  { value: 'fileName', label: 'File Name', category: 'Advanced' },
  { value: 'mimeType', label: 'MIME Type', category: 'Advanced' },
  
  // Crypto Types
  { value: 'bitcoinAddress', label: 'Bitcoin Address', category: 'Crypto' },
  { value: 'ethereumAddress', label: 'Ethereum Address', category: 'Crypto' }
];

export default function ColumnConfig({ column, onUpdate }) {
  const [localColumn, setLocalColumn] = useState(column);
  
  useEffect(() => {
    setLocalColumn(column);
  }, [column]);
  
  const handleChange = (field, value) => {
    const updated = { ...localColumn, [field]: value };
    setLocalColumn(updated);
    onUpdate(updated);
  };
  
  const handleConfigChange = (field, value) => {
    const updated = {
      ...localColumn,
      config: { ...localColumn.config, [field]: value }
    };
    setLocalColumn(updated);
    onUpdate(updated);
  };
  
  const renderTypeSpecificConfig = () => {
    const { type, config = {} } = localColumn;
    
    switch (type) {
      case 'sequential':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Start Value</label>
              <input
                type="number"
                className="form-control"
                value={config.start || 1}
                onChange={(e) => handleConfigChange('start', parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Increment By</label>
              <input
                type="number"
                className="form-control"
                value={config.increment || 1}
                onChange={(e) => handleConfigChange('increment', parseInt(e.target.value))}
              />
            </div>
          </>
        );
        
      case 'integer':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Minimum Value</label>
              <input
                type="number"
                className="form-control"
                value={config.min || 0}
                onChange={(e) => handleConfigChange('min', parseInt(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Maximum Value</label>
              <input
                type="number"
                className="form-control"
                value={config.max || 1000}
                onChange={(e) => handleConfigChange('max', parseInt(e.target.value))}
              />
            </div>
          </>
        );
        
      case 'decimal':
      case 'currency':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Minimum Value</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={config.min || 0}
                onChange={(e) => handleConfigChange('min', parseFloat(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Maximum Value</label>
              <input
                type="number"
                step="0.01"
                className="form-control"
                value={config.max || 1000}
                onChange={(e) => handleConfigChange('max', parseFloat(e.target.value))}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Decimal Places</label>
              <input
                type="number"
                className="form-control"
                value={config.precision || 2}
                min="0"
                max="10"
                onChange={(e) => handleConfigChange('precision', parseInt(e.target.value))}
              />
            </div>
          </>
        );
        
      case 'date':
        return (
          <>
            <div className="mb-3">
              <label className="form-label">Start Date</label>
              <input
                type="date"
                className="form-control"
                value={config.startDate || '2020-01-01'}
                onChange={(e) => handleConfigChange('startDate', e.target.value)}
              />
            </div>
            <div className="mb-3">
              <label className="form-label">End Date</label>
              <input
                type="date"
                className="form-control"
                value={config.endDate || new Date().toISOString().split('T')[0]}
                onChange={(e) => handleConfigChange('endDate', e.target.value)}
              />
            </div>
          </>
        );
        
      case 'text':
        return (
          <div className="mb-3">
            <label className="form-label">Word Count</label>
            <input
              type="number"
              className="form-control"
              value={config.wordCount || 3}
              min="1"
              max="20"
              onChange={(e) => handleConfigChange('wordCount', parseInt(e.target.value))}
            />
          </div>
        );
        
      case 'loremWords':
        return (
          <div className="mb-3">
            <label className="form-label">Number of Words</label>
            <input
              type="number"
              className="form-control"
              value={config.wordCount || 5}
              min="1"
              max="50"
              onChange={(e) => handleConfigChange('wordCount', parseInt(e.target.value))}
            />
          </div>
        );
        
      case 'loremSentence':
        return (
          <div className="mb-3">
            <label className="form-label">Words per Sentence</label>
            <input
              type="number"
              className="form-control"
              value={config.words || 10}
              min="3"
              max="30"
              onChange={(e) => handleConfigChange('words', parseInt(e.target.value))}
            />
          </div>
        );
        
      case 'loremParagraph':
        return (
          <div className="mb-3">
            <label className="form-label">Number of Paragraphs</label>
            <input
              type="number"
              className="form-control"
              value={config.paragraphs || 1}
              min="1"
              max="10"
              onChange={(e) => handleConfigChange('paragraphs', parseInt(e.target.value))}
            />
          </div>
        );
        
      case 'color':
        return (
          <div className="mb-3">
            <label className="form-label">Color Format</label>
            <select
              className="form-select"
              value={config.format || 'hex'}
              onChange={(e) => handleConfigChange('format', e.target.value)}
            >
              <option value="hex">Hex (#RRGGBB)</option>
              <option value="rgb">RGB (rgb(r,g,b))</option>
              <option value="named">Named Colors</option>
            </select>
          </div>
        );
        
      case 'department':
        return (
          <div className="mb-3">
            <label className="form-label">Departments (one per line)</label>
            <textarea
              className="form-control"
              rows="5"
              value={(config.values || ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Operations']).join('\n')}
              onChange={(e) => handleConfigChange('values', e.target.value.split('\n').filter(v => v.trim()))}
              placeholder="Enter departments, one per line"
            />
          </div>
        );
        
      case 'category':
      case 'status':
        return (
          <div className="mb-3">
            <label className="form-label">Possible Values (one per line)</label>
            <textarea
              className="form-control"
              rows="5"
              value={(config.values || []).join('\n')}
              onChange={(e) => handleConfigChange('values', e.target.value.split('\n').filter(v => v.trim()))}
              placeholder="Enter possible values, one per line"
            />
            <small className="text-muted">
              Leave empty to use defaults
            </small>
          </div>
        );
        
      default:
        return (
          <div className="alert alert-info">
            <Icon name="info circle" /> This type has no additional configuration options.
          </div>
        );
    }
  };
  
  // Group types by category
  const groupedTypes = DATA_TYPES.reduce((acc, type) => {
    if (!acc[type.category]) {
      acc[type.category] = [];
    }
    acc[type.category].push(type);
    return acc;
  }, {});
  
  return (
    <div className="card">
      <div className="card-header bg-info text-white">
        <Icon name="sliders horizontal" /> Column Configuration
      </div>
      <div className="card-body" style={{ maxHeight: '600px', overflow: 'auto' }}>
        <div className="mb-3">
          <label className="form-label">
            <Icon name="font" /> Column Name
          </label>
          <input
            type="text"
            className="form-control"
            value={localColumn.name || ''}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="e.g., customer_id"
          />
          <small className="text-muted">
            Use lowercase with underscores (e.g., first_name)
          </small>
        </div>
        
        <div className="mb-3">
          <label className="form-label">
            <Icon name="tag" /> Data Type
          </label>
          <select
            className="form-select"
            value={localColumn.type || 'text'}
            onChange={(e) => handleChange('type', e.target.value)}
          >
            {Object.entries(groupedTypes).map(([category, types]) => (
              <optgroup key={category} label={category}>
                {types.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        
        <hr />
        
        <h6 className="mb-3">
          <Icon name="cog" /> Type-Specific Settings
        </h6>
        
        {renderTypeSpecificConfig()}
      </div>
    </div>
  );
}
