'use client';

import { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { Toaster, toast } from 'react-hot-toast';
import { Container } from 'react-bootstrap';
import Papa from 'papaparse';
import { saveAs } from 'file-saver';
import Navigation from '../../components/Navigation';
import SchemaBuilder from '../../components/SchemaBuilder';
import DataTable from '../../components/DataTable';
import { generateData, getTemplatesList, getTemplate } from '../../lib/schemaGenerator';
import { downloadCSV, downloadJSON } from '../../lib/exportUtils';

export default function SchemaDesignerPage() {
  const [schema, setSchema] = useState({
    name: 'Custom Schema',
    columns: []
  });
  const [rowCount, setRowCount] = useState(100);
  const [seed, setSeed] = useState('');
  const [useSeed, setUseSeed] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [showTemplates, setShowTemplates] = useState(true);
  const [generatedData, setGeneratedData] = useState(null);
  const [schemaSource, setSchemaSource] = useState(null); // 'scratch', 'upload', 'csv'
  const [exportFormat, setExportFormat] = useState('csv'); // 'csv', 'json', 'sql'
  const [sqlOptions, setSqlOptions] = useState({
    tableName: 'generated_data',
    dbType: 'postgresql',
    includeCreate: true,
    includeDrop: false
  });
  const [dragActiveCSV, setDragActiveCSV] = useState(false);
  const [dragActiveJSON, setDragActiveJSON] = useState(false);
  
  const templates = getTemplatesList();
  
  const handleStartFromScratch = () => {
    setSchema({ name: 'Custom Schema', columns: [] });
    setSchemaSource('scratch');
    setShowTemplates(false);
    toast.success('Starting from scratch');
  };
  
  const handleUploadSchema = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (file.name.endsWith('.json')) {
          const schemaData = JSON.parse(event.target.result);
          setSchema(schemaData);
          setSchemaSource('upload');
          setShowTemplates(false);
          toast.success('Schema loaded from JSON');
        } else if (file.name.endsWith('.csv')) {
          // Parse CSV to infer schema
          Papa.parse(event.target.result, {
            header: true,
            skipEmptyLines: true,
            complete: (result) => {
              const inferredSchema = inferSchemaFromCSV(result.data);
              setSchema(inferredSchema);
              setSchemaSource('csv');
              setShowTemplates(false);
              toast.success('Schema generated from CSV');
            }
          });
        }
      } catch (error) {
        toast.error(`Failed to load schema: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };
  
  const handleGenerateFromCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const inferredSchema = inferSchemaFromCSV(result.data);
        setSchema(inferredSchema);
        setSchemaSource('csv');
        setShowTemplates(false);
        toast.success(`Schema generated from ${file.name}`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };
  
  const handleDragCSV = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'enter' || type === 'over') {
      setDragActiveCSV(true);
    } else if (type === 'leave' || type === 'drop') {
      setDragActiveCSV(false);
    }
  };
  
  const handleDragJSON = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    if (type === 'enter' || type === 'over') {
      setDragActiveJSON(true);
    } else if (type === 'leave' || type === 'drop') {
      setDragActiveJSON(false);
    }
  };
  
  const handleDropCSV = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveCSV(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const inferredSchema = inferSchemaFromCSV(result.data);
        setSchema(inferredSchema);
        setSchemaSource('csv');
        setShowTemplates(false);
        toast.success(`Schema generated from ${file.name}`);
      },
      error: (error) => {
        toast.error(`Failed to parse CSV: ${error.message}`);
      }
    });
  };
  
  const handleDropJSON = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActiveJSON(false);
    
    const file = e.dataTransfer.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
      toast.error('Please upload a JSON file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const schemaData = JSON.parse(event.target.result);
        setSchema(schemaData);
        setSchemaSource('upload');
        setShowTemplates(false);
        toast.success('Schema loaded from JSON');
      } catch (error) {
        toast.error(`Failed to load schema: ${error.message}`);
      }
    };
    reader.readAsText(file);
  };
  
  const inferSchemaFromCSV = (data) => {
    if (!data || data.length === 0) {
      throw new Error('CSV file is empty');
    }
    
    const columns = Object.keys(data[0]).map(colName => {
      const values = data.map(row => row[colName]).filter(v => v !== null && v !== '');
      const type = inferColumnType(values);
      
      return {
        name: colName,
        type: type,
        config: getDefaultConfig(type, values)
      };
    });
    
    return {
      name: 'Generated Schema',
      columns
    };
  };
  
  const inferColumnType = (values) => {
    if (values.length === 0) return 'text';
    
    // Check for sequential numbers
    const numbers = values.map(v => parseFloat(v)).filter(n => !isNaN(n));
    if (numbers.length === values.length && numbers.length > 1) {
      const diffs = numbers.slice(1).map((n, i) => n - numbers[i]);
      const allSame = diffs.every(d => d === diffs[0]);
      if (allSame && diffs[0] === 1) return 'sequential';
      
      const hasDecimals = numbers.some(n => n % 1 !== 0);
      if (hasDecimals) return 'decimal';
      return 'integer';
    }
    
    // Check for emails
    if (values.every(v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))) return 'email';
    
    // Check for dates
    if (values.every(v => !isNaN(Date.parse(v)))) return 'date';
    
    // Check for UUIDs
    if (values.every(v => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v))) return 'uuid';
    
    // Check for boolean
    if (values.every(v => ['true', 'false', '0', '1', 'yes', 'no'].includes(v.toLowerCase()))) return 'boolean';
    
    // Check for phone
    if (values.every(v => /^[\d\s\-\+\(\)]+$/.test(v) && v.replace(/\D/g, '').length >= 10)) return 'phone';
    
    // Check for URLs
    if (values.every(v => /^https?:\/\/.+/.test(v))) return 'url';
    
    // Check if it's a category (limited unique values)
    const unique = new Set(values);
    if (unique.size <= Math.min(10, values.length / 2)) {
      return 'category';
    }
    
    return 'text';
  };
  
  const getDefaultConfig = (type, values) => {
    switch (type) {
      case 'sequential':
        const nums = values.map(v => parseFloat(v));
        return { start: Math.min(...nums), increment: 1 };
      case 'integer':
      case 'decimal':
        const numbers = values.map(v => parseFloat(v));
        return { min: Math.min(...numbers), max: Math.max(...numbers) };
      case 'category':
        return { values: Array.from(new Set(values)) };
      default:
        return {};
    }
  };
  
  const handleLoadTemplate = (templateId) => {
    const template = getTemplate(templateId);
    if (template) {
      setSchema(template);
      setShowTemplates(false);
      toast.success(`Loaded template: ${template.name}`);
    }
  };
  
  const handleSchemaChange = (updatedSchema) => {
    setSchema(updatedSchema);
    setPreviewData(null); // Clear preview when schema changes
  };
  
  const handlePreview = () => {
    if (schema.columns.length === 0) {
      toast.error('Add at least one column to preview');
      return;
    }
    
    try {
      const seedValue = useSeed && seed ? parseInt(seed) : null;
      const data = generateData(schema, Math.min(20, rowCount), seedValue);
      setPreviewData(data);
      toast.success('Preview generated!');
    } catch (error) {
      toast.error(`Preview failed: ${error.message}`);
    }
  };
  
  const handleGenerate = () => {
    if (schema.columns.length === 0) {
      toast.error('Add at least one column to generate data');
      return;
    }
    
    if (rowCount < 1 || rowCount > 100000) {
      toast.error('Row count must be between 1 and 100,000');
      return;
    }
    
    try {
      const seedValue = useSeed && seed ? parseInt(seed) : null;
      const data = generateData(schema, rowCount, seedValue);
      setGeneratedData(data);
      toast.success(`Generated ${data.length} rows!`);
    } catch (error) {
      toast.error(`Generation failed: ${error.message}`);
    }
  };
  
  const handleDownload = () => {
    if (!generatedData) {
      toast.error('No data to download');
      return;
    }
    
    try {
      const baseName = schema.name.toLowerCase().replace(/\s+/g, '_');
      
      if (exportFormat === 'csv') {
        const filename = `${baseName}_${rowCount}_rows.csv`;
        const result = downloadCSV(generatedData, filename);
        if (result.success) {
          toast.success('CSV downloaded!');
        } else {
          toast.error(`Download failed: ${result.error}`);
        }
      } else if (exportFormat === 'json') {
        const filename = `${baseName}_${rowCount}_rows.json`;
        const result = downloadJSON(generatedData, filename, { pretty: true, includeMetadata: true });
        if (result.success) {
          toast.success('JSON downloaded!');
        } else {
          toast.error(`Download failed: ${result.error}`);
        }
      } else if (exportFormat === 'sql') {
        const filename = `${baseName}_${rowCount}_rows.sql`;
        const sql = generateSQL(generatedData, schema, sqlOptions);
        const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
        saveAs(blob, filename);
        toast.success('SQL file downloaded!');
      }
    } catch (error) {
      toast.error(`Export failed: ${error.message}`);
    }
  };
  
  const generateSQL = (data, schema, options) => {
    const { tableName, dbType, includeCreate, includeDrop } = options;
    
    let sql = `-- Generated by CSV Analyzer - ${new Date().toISOString()}\n`;
    sql += `-- Table: ${tableName}\n`;
    sql += `-- Rows: ${data.length}\n\n`;
    
    if (includeDrop) {
      sql += `DROP TABLE IF EXISTS ${tableName};\n\n`;
    }
    
    if (includeCreate) {
      sql += `CREATE TABLE ${tableName} (\n`;
      const columnDefs = schema.columns.map((col, idx) => {
        const sqlType = mapToSQLType(col.type, col.config, dbType);
        const isPK = idx === 0 && col.type === 'sequential';
        return `  ${col.name} ${sqlType}${isPK ? ' PRIMARY KEY' : ''}`;
      });
      sql += columnDefs.join(',\n');
      sql += `\n);\n\n`;
    }
    
    // Generate INSERT statements
    const columns = schema.columns.map(c => c.name);
    sql += `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES\n`;
    
    const values = data.map((row, idx) => {
      const vals = columns.map(col => {
        const val = row[col];
        if (val === null || val === undefined) return 'NULL';
        if (typeof val === 'number') return val;
        if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
        return `'${String(val).replace(/'/g, "''")}'`;
      });
      return `  (${vals.join(', ')})`;
    });
    
    sql += values.join(',\n');
    sql += ';\n';
    
    return sql;
  };
  
  const mapToSQLType = (type, config, dbType) => {
    const typeMap = {
      postgresql: {
        sequential: 'SERIAL',
        integer: 'INTEGER',
        decimal: 'NUMERIC',
        currency: 'NUMERIC(10,2)',
        text: 'VARCHAR(255)',
        firstName: 'VARCHAR(100)',
        lastName: 'VARCHAR(100)',
        fullName: 'VARCHAR(200)',
        email: 'VARCHAR(255)',
        phone: 'VARCHAR(20)',
        address: 'TEXT',
        city: 'VARCHAR(100)',
        state: 'VARCHAR(100)',
        country: 'VARCHAR(100)',
        zipCode: 'VARCHAR(20)',
        date: 'DATE',
        datetime: 'TIMESTAMP',
        boolean: 'BOOLEAN',
        uuid: 'UUID',
        url: 'TEXT',
        category: 'VARCHAR(100)',
        status: 'VARCHAR(50)',
        company: 'VARCHAR(200)',
        jobTitle: 'VARCHAR(200)',
        product: 'VARCHAR(200)',
        sku: 'VARCHAR(50)',
        price: 'NUMERIC(10,2)',
        percentage: 'INTEGER'
      },
      mysql: {
        sequential: 'INT AUTO_INCREMENT',
        integer: 'INT',
        decimal: 'DECIMAL(10,2)',
        currency: 'DECIMAL(10,2)',
        text: 'VARCHAR(255)',
        firstName: 'VARCHAR(100)',
        lastName: 'VARCHAR(100)',
        fullName: 'VARCHAR(200)',
        email: 'VARCHAR(255)',
        phone: 'VARCHAR(20)',
        address: 'TEXT',
        city: 'VARCHAR(100)',
        state: 'VARCHAR(100)',
        country: 'VARCHAR(100)',
        zipCode: 'VARCHAR(20)',
        date: 'DATE',
        datetime: 'DATETIME',
        boolean: 'TINYINT(1)',
        uuid: 'CHAR(36)',
        url: 'TEXT',
        category: 'VARCHAR(100)',
        status: 'VARCHAR(50)',
        company: 'VARCHAR(200)',
        jobTitle: 'VARCHAR(200)',
        product: 'VARCHAR(200)',
        sku: 'VARCHAR(50)',
        price: 'DECIMAL(10,2)',
        percentage: 'INT'
      }
    };
    
    return typeMap[dbType]?.[type] || 'VARCHAR(255)';
  };
  
  const handleSaveSchema = () => {
    if (schema.columns.length === 0) {
      toast.error('Cannot save empty schema');
      return;
    }
    
    if (!schema.name || schema.name.trim() === '') {
      toast.error('Please provide a schema name');
      return;
    }
    
    try {
      // Load existing custom schemas
      const saved = localStorage.getItem('customSchemas');
      let customSchemas = [];
      if (saved) {
        customSchemas = JSON.parse(saved);
      }
      
      // Check if schema with same name exists
      const existingIndex = customSchemas.findIndex(s => s.name === schema.name);
      if (existingIndex >= 0) {
        if (!confirm(`Schema "${schema.name}" already exists. Overwrite?`)) {
          return;
        }
        customSchemas[existingIndex] = schema;
      } else {
        customSchemas.push(schema);
      }
      
      // Save to localStorage
      localStorage.setItem('customSchemas', JSON.stringify(customSchemas));
      toast.success(`Schema "${schema.name}" saved! You can now use it in the Data Generator.`);
    } catch (error) {
      toast.error(`Failed to save schema: ${error.message}`);
    }
  };
  
  const handleSaveTemplate = () => {
    if (schema.columns.length === 0) {
      toast.error('Add at least one column to save template');
      return;
    }
    
    try {
      const templates = JSON.parse(localStorage.getItem('customSchemas') || '[]');
      const templateId = schema.name.toLowerCase().replace(/\s+/g, '-');
      
      templates.push({
        id: templateId,
        ...schema,
        savedAt: new Date().toISOString()
      });
      
      localStorage.setItem('customSchemas', JSON.stringify(templates));
      toast.success('Template saved!');
    } catch (error) {
      toast.error(`Save failed: ${error.message}`);
    }
  };
  
  const handleRandomSeed = () => {
    const randomSeed = Math.floor(Math.random() * 1000000);
    setSeed(randomSeed.toString());
    setUseSeed(true);
  };
  
  return (
    <>
      <Navigation />
      <Container fluid className="mt-4">
        <Toaster position="top-right" />
      
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-6">
            <Icon name="magic" /> Schema Designer
          </h1>
          <p className="text-muted">
            Design custom data schemas and generate realistic fake CSV data
          </p>
        </div>
      </div>
      
      {!schemaSource && (
        <div className="card mb-4">
          <div className="card-header bg-primary text-white">
            <Icon name="magic" /> Create Schema
          </div>
          <div className="card-body">
            <div className="row g-4">
              <div className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <Icon name="pencil" size="huge" className="text-primary mb-3" />
                    <h5 className="card-title">Start from Scratch</h5>
                    <p className="card-text text-muted">
                      Build your schema from the ground up by adding columns one by one.
                    </p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <button 
                      className="btn btn-primary w-100"
                      onClick={handleStartFromScratch}
                    >
                      <Icon name="plus" /> Create New Schema
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <Icon name="upload" size="huge" className="text-success mb-3" />
                    <h5 className="card-title">Upload Schema</h5>
                    <p className="card-text text-muted">
                      Import an existing schema from JSON file.
                    </p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <div 
                      className={`upload-zone ${dragActiveJSON ? 'dragover' : ''}`}
                      onDragEnter={(e) => handleDragJSON(e, 'enter')}
                      onDragOver={(e) => handleDragJSON(e, 'over')}
                      onDragLeave={(e) => handleDragJSON(e, 'leave')}
                      onDrop={handleDropJSON}
                    >
                      <label className="btn btn-success w-100 mb-0">
                        <Icon name="file" /> {dragActiveJSON ? 'Drop JSON here' : 'Upload JSON Schema'}
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleUploadSchema}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {!dragActiveJSON && (
                        <small className="d-block text-muted mt-2">or drag & drop</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card h-100 shadow-sm">
                  <div className="card-body text-center">
                    <Icon name="table" size="huge" className="text-info mb-3" />
                    <h5 className="card-title">Generate from CSV</h5>
                    <p className="card-text text-muted">
                      Automatically infer schema structure from an existing CSV file.
                    </p>
                  </div>
                  <div className="card-footer bg-transparent">
                    <div 
                      className={`upload-zone ${dragActiveCSV ? 'dragover' : ''}`}
                      onDragEnter={(e) => handleDragCSV(e, 'enter')}
                      onDragOver={(e) => handleDragCSV(e, 'over')}
                      onDragLeave={(e) => handleDragCSV(e, 'leave')}
                      onDrop={handleDropCSV}
                    >
                      <label className="btn btn-info w-100 mb-0">
                        <Icon name="file excel" /> {dragActiveCSV ? 'Drop CSV here' : 'Upload CSV File'}
                        <input
                          type="file"
                          accept=".csv"
                          onChange={handleGenerateFromCSV}
                          style={{ display: 'none' }}
                        />
                      </label>
                      {!dragActiveCSV && (
                        <small className="d-block text-muted mt-2">or drag & drop</small>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {schemaSource && (
        <>
          <div className="card mb-4">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">
                  <Icon name="cog" /> Schema Configuration
                </h5>
                <div className="btn-group btn-group-sm">
                  <button 
                    className="btn btn-outline-success"
                    onClick={handleSaveSchema}
                    disabled={schema.columns.length === 0}
                    title="Save this schema to use in Data Generator"
                  >
                    <Icon name="star" /> Save for Data Generator
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={handleSaveTemplate}
                    disabled={schema.columns.length === 0}
                  >
                    <Icon name="save" /> Save Template
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={() => {
                      setSchema({ name: 'Custom Schema', columns: [] });
                      setSchemaSource(null);
                      setShowTemplates(true);
                      setPreviewData(null);
                      setGeneratedData(null);
                    }}
                  >
                    <Icon name="refresh" /> Start Over
                  </button>
                </div>
              </div>
              
              <SchemaBuilder
                schema={schema}
                onSchemaChange={handleSchemaChange}
              />
            </div>
          </div>
          
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <Icon name="settings" /> Generation & Export Options
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label">Number of Rows</label>
                  <input
                    type="number"
                    className="form-control"
                    value={rowCount}
                    onChange={(e) => setRowCount(parseInt(e.target.value) || 0)}
                    min="1"
                    max="100000"
                  />
                  <small className="text-muted">1 - 100,000</small>
                </div>
                
                <div className="col-md-3">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="useSeedCheck"
                      checked={useSeed}
                      onChange={(e) => setUseSeed(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="useSeedCheck">
                      Use Seed (reproducible)
                    </label>
                  </div>
                  <div className="input-group">
                    <input
                      type="number"
                      className="form-control"
                      value={seed}
                      onChange={(e) => setSeed(e.target.value)}
                      disabled={!useSeed}
                      placeholder="Seed value"
                    />
                    <button 
                      className="btn btn-outline-secondary"
                      onClick={handleRandomSeed}
                      disabled={!useSeed}
                      title="Generate random seed"
                    >
                      <Icon name="random" />
                    </button>
                  </div>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">Locale</label>
                  <select 
                    className="form-select"
                    value={locale}
                    onChange={(e) => setLocale(e.target.value)}
                  >
                    <option value="en">English</option>
                    {/* Future language options:
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                    <option value="it">Italian</option>
                    <option value="ja">Japanese</option>
                    <option value="zh">Chinese</option>
                    */}
                  </select>
                  <small className="text-muted">More coming soon</small>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">Export Format</label>
                  <select 
                    className="form-select"
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                  >
                    <option value="csv">CSV</option>
                    <option value="json">JSON</option>
                    <option value="sql">SQL (Database Import)</option>
                  </select>
                </div>
                
                <div className="col-md-2">
                  <label className="form-label">&nbsp;</label>
                  <div className="btn-group w-100" role="group">
                    <button 
                      className="btn btn-outline-primary"
                      onClick={handlePreview}
                      disabled={schema.columns.length === 0}
                    >
                      <Icon name="eye" /> Preview
                    </button>
                    <button 
                      className="btn btn-primary"
                      onClick={handleGenerate}
                      disabled={schema.columns.length === 0}
                    >
                      <Icon name="magic" /> Generate
                    </button>
                  </div>
                </div>
              </div>
              
              {exportFormat === 'sql' && (
                <div className="row g-3 mt-2 pt-3 border-top">
                  <div className="col-12">
                    <h6 className="mb-3"><Icon name="database" /> SQL Export Options</h6>
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Table Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={sqlOptions.tableName}
                      onChange={(e) => setSqlOptions({...sqlOptions, tableName: e.target.value})}
                      placeholder="table_name"
                    />
                  </div>
                  <div className="col-md-3">
                    <label className="form-label">Database Type</label>
                    <select 
                      className="form-select"
                      value={sqlOptions.dbType}
                      onChange={(e) => setSqlOptions({...sqlOptions, dbType: e.target.value})}
                    >
                      <option value="postgresql">PostgreSQL</option>
                      <option value="mysql">MySQL</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Options</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="includeCreate"
                          checked={sqlOptions.includeCreate}
                          onChange={(e) => setSqlOptions({...sqlOptions, includeCreate: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="includeCreate">
                          Include CREATE TABLE
                        </label>
                      </div>
                      <div className="form-check">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="includeDrop"
                          checked={sqlOptions.includeDrop}
                          onChange={(e) => setSqlOptions({...sqlOptions, includeDrop: e.target.checked})}
                        />
                        <label className="form-check-label" htmlFor="includeDrop">
                          Include DROP TABLE
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              {generatedData && (
                <div className="mt-3 pt-3 border-top">
                  <button 
                    className="btn btn-success btn-lg w-100"
                    onClick={handleDownload}
                  >
                    <Icon name="download" /> Download {exportFormat.toUpperCase()}
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {previewData && (
            <div className="card mb-4">
              <div className="card-header bg-info text-white">
                <Icon name="eye" /> Preview - First {previewData.length} Rows
              </div>
              <div className="card-body">
                <DataTable data={previewData} pageSize={20} />
              </div>
            </div>
          )}
          
          {generatedData && (
            <div className="card mb-4">
              <div className="card-header bg-success text-white">
                <Icon name="check circle" /> Generated Data - {generatedData.length} Rows
              </div>
              <div className="card-body">
                <div className="alert alert-success">
                  <Icon name="check" /> Successfully generated {generatedData.length} rows!
                  Click "Download CSV" to save the file.
                </div>
                <DataTable data={generatedData} pageSize={25} />
              </div>
            </div>
          )}
        </>
      )}
      </Container>
      
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <Container>
          <p className="mb-0">CSV Analyzer &copy; 2025 | Built with Next.js, React, Bootstrap & Semantic UI</p>
        </Container>
      </footer>
    </>
  );
}
