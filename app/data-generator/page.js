'use client';

import { useState, useEffect } from 'react';
import { Icon } from 'semantic-ui-react';
import { Toaster, toast } from 'react-hot-toast';
import { Container } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import DataTable from '../../components/DataTable';
import SchemaDesignWidget from '../../components/SchemaDesignWidget';
import { generateData, getTemplatesList, getTemplate } from '../../lib/schemaGenerator';
import { downloadCSV, downloadJSON } from '../../lib/exportUtils';
import { saveAs } from 'file-saver';

export default function DataGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [customSchemas, setCustomSchemas] = useState([]);
  const [showCustomSchemas, setShowCustomSchemas] = useState(false);
  const [mode, setMode] = useState('template'); // 'template', 'custom', 'design'
  const [customSchema, setCustomSchema] = useState({ name: 'Custom Schema', columns: [] });
  const [rowCount, setRowCount] = useState(100);
  const [useSeed, setUseSeed] = useState(false);
  const [seed, setSeed] = useState('12345');
  const [locale, setLocale] = useState('en');
  const [previewData, setPreviewData] = useState(null);
  const [generatedData, setGeneratedData] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');
  const [sqlOptions, setSqlOptions] = useState({
    tableName: 'generated_data',
    dbType: 'postgresql',
    includeCreate: true,
    includeDrop: false
  });
  
  const templates = getTemplatesList();
  
  useEffect(() => {
    // Load custom schemas from localStorage
    const saved = localStorage.getItem('customSchemas');
    if (saved) {
      try {
        setCustomSchemas(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load custom schemas:', error);
      }
    }
  }, []);
  
  const handleSelectTemplate = (templateId) => {
    const template = getTemplate(templateId);
    setSelectedTemplate(template);
    setMode('template');
    setPreviewData(null);
    setGeneratedData(null);
    toast.success(`Template loaded: ${template.name}`);
  };
  
  const handleSelectCustomSchema = (schema) => {
    setSelectedTemplate(schema);
    setMode('custom');
    setPreviewData(null);
    setGeneratedData(null);
    toast.success(`Custom schema loaded: ${schema.name}`);
  };
  
  const handleDeleteCustomSchema = (schemaName) => {
    const updated = customSchemas.filter(s => s.name !== schemaName);
    setCustomSchemas(updated);
    localStorage.setItem('customSchemas', JSON.stringify(updated));
    toast.success('Schema deleted');
  };
  
  const reloadCustomSchemas = () => {
    const saved = localStorage.getItem('customSchemas');
    if (saved) {
      try {
        setCustomSchemas(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load custom schemas:', error);
      }
    }
  };
  
  const handleRandomSeed = () => {
    setSeed(Math.floor(Math.random() * 1000000).toString());
  };
  
  const handlePreview = () => {
    const currentSchema = mode === 'design' ? customSchema : selectedTemplate;
    
    if (!currentSchema || (currentSchema.columns && currentSchema.columns.length === 0)) {
      toast.error('Please select a template or design a schema first');
      return;
    }
    
    try {
      const data = generateData(
        currentSchema, 
        20, 
        useSeed ? parseInt(seed) : undefined,
        locale
      );
      setPreviewData(data);
      toast.success('Preview generated!');
    } catch (error) {
      toast.error(`Preview failed: ${error.message}`);
    }
  };
  
  const handleGenerate = () => {
    const currentSchema = mode === 'design' ? customSchema : selectedTemplate;
    
    if (!currentSchema || (currentSchema.columns && currentSchema.columns.length === 0)) {
      toast.error('Please select a template or design a schema first');
      return;
    }
    
    if (rowCount < 1 || rowCount > 100000) {
      toast.error('Row count must be between 1 and 100,000');
      return;
    }
    
    try {
      const data = generateData(
        currentSchema, 
        rowCount, 
        useSeed ? parseInt(seed) : undefined,
        locale
      );
      setGeneratedData(data);
      setPreviewData(null);
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
      const baseName = selectedTemplate.name.toLowerCase().replace(/\s+/g, '_');
      
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
        const sql = generateSQL(generatedData, selectedTemplate, sqlOptions);
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
  
  return (
    <>
      <Navigation />
      <Container className="py-4">
        <Toaster position="top-right" />
        
        <div className="mb-4">
          <h1><Icon name="magic" /> Data Generator</h1>
          <p className="text-muted">
            Generate realistic fake data using pre-built templates, saved schemas, or design your own.
          </p>
        </div>
        
        {/* Mode Selection */}
        <div className="card mb-4">
          <div className="card-header bg-dark text-white">
            <div className="btn-group w-100" role="group">
              <button 
                className={`btn ${mode === 'template' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setMode('template')}
              >
                <Icon name="file" /> Templates
              </button>
              <button 
                className={`btn ${mode === 'custom' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setMode('custom')}
              >
                <Icon name="star" /> My Schemas ({customSchemas.length})
              </button>
              <button 
                className={`btn ${mode === 'design' ? 'btn-light' : 'btn-outline-light'}`}
                onClick={() => setMode('design')}
              >
                <Icon name="pencil" /> Design Schema
              </button>
            </div>
          </div>
        </div>
        
        {/* Schema Design Widget - shown when in design mode */}
        {mode === 'design' && (
          <SchemaDesignWidget
            schema={customSchema}
            onSchemaChange={setCustomSchema}
            showSaveButton={true}
            onSave={reloadCustomSchemas}
          />
        )}
        
        {/* Template Selection */}
        {mode === 'template' && (
          <div className="card mb-4">
            <div className="card-header bg-primary text-white">
              <Icon name="file" /> Select a Template
            </div>
            <div className="card-body">
              <div className="row g-3">
                {templates.map(template => (
                  <div key={template.id} className="col-md-4 col-lg-3">
                    <div 
                      className={`card h-100 shadow-sm ${selectedTemplate?.id === template.id ? 'border-primary' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleSelectTemplate(template.id)}
                    >
                      <div className="card-body">
                        <h5 className="card-title">
                          <Icon name="file" /> {template.name}
                        </h5>
                        <p className="card-text text-muted small">
                          {template.description}
                        </p>
                        <p className="text-muted small mb-0">
                          <Icon name="columns" /> {template.columnCount} columns
                        </p>
                      </div>
                      {selectedTemplate?.id === template.id && (
                        <div className="card-footer bg-primary text-white">
                          <small><Icon name="check" /> Selected</small>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Custom Schemas Selection */}
        {mode === 'custom' && (
          <div className="card mb-4">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <span><Icon name="star" /> My Saved Schemas</span>
              <button 
                className="btn btn-light btn-sm"
                onClick={reloadCustomSchemas}
              >
                <Icon name="refresh" /> Reload
              </button>
            </div>
            <div className="card-body">
            {customSchemas.length === 0 ? (
              <div className="alert alert-info">
                <Icon name="info circle" /> No custom schemas saved yet. Use "Design Schema" mode to create and save schemas.
              </div>
            ) : (
              <div className="row g-3">
                {customSchemas.map((schema, idx) => (
                  <div key={idx} className="col-md-4 col-lg-3">
                    <div 
                      className={`card h-100 shadow-sm ${selectedTemplate?.name === schema.name ? 'border-success' : ''}`}
                    >
                      <div 
                        className="card-body" 
                        style={{ cursor: 'pointer' }}
                        onClick={() => handleSelectCustomSchema(schema)}
                      >
                        <h5 className="card-title">
                          <Icon name="star" className="text-warning" /> {schema.name}
                        </h5>
                        <p className="text-muted small mb-0">
                          <Icon name="columns" /> {schema.columns?.length || 0} columns
                        </p>
                      </div>
                      <div className="card-footer bg-transparent d-flex justify-content-between">
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`Delete schema "${schema.name}"?`)) {
                              handleDeleteCustomSchema(schema.name);
                            }
                          }}
                        >
                          <Icon name="trash" /> Delete
                        </button>
                        {selectedTemplate?.name === schema.name && (
                          <span className="badge bg-success align-self-center">
                            <Icon name="check" /> Selected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            </div>
          </div>
        )}
        
        {/* Template Details */}
        {(mode === 'template' || mode === 'custom') && selectedTemplate && (
          <div className="card mb-4">
            <div className="card-header bg-info text-white">
              <Icon name="info circle" /> Template Details: {selectedTemplate.name}
            </div>
            <div className="card-body">
              <p className="mb-3">{selectedTemplate.description}</p>
              <h6 className="mb-2">Columns:</h6>
              <div className="row g-2">
                {selectedTemplate.columns.map((col, idx) => (
                  <div key={idx} className="col-md-3">
                    <span className="badge bg-secondary">
                      {col.name} ({col.type})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
        
        {/* Generation Options */}
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
                    disabled={!selectedTemplate}
                  >
                    <Icon name="eye" /> Preview
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={handleGenerate}
                    disabled={!selectedTemplate}
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
        
        {/* Data Preview */}
        {previewData && (
          <div className="card mb-4">
            <div className="card-header bg-warning">
              <Icon name="eye" /> Preview (First 20 Rows)
            </div>
            <div className="card-body">
              <DataTable 
                data={previewData}
                pageSize={20}
              />
            </div>
          </div>
        )}
        
        {/* Generated Data */}
        {generatedData && (
          <div className="card mb-4">
            <div className="card-header bg-success text-white">
              <Icon name="check" /> Generated Data ({generatedData.length} rows)
            </div>
            <div className="card-body">
              <DataTable 
                data={generatedData.slice(0, 100)}
                pageSize={20}
              />
              {generatedData.length > 100 && (
                <div className="alert alert-info mt-3">
                  <Icon name="info circle" /> Showing first 100 rows of {generatedData.length}. Click "Download {exportFormat.toUpperCase()}" to get all data.
                </div>
              )}
            </div>
          </div>
        )}
        
        <footer className="text-center text-muted py-4 border-top mt-5">
          <p className="mb-0">CSV Analyzer - Data Generator Tool</p>
        </footer>
      </Container>
    </>
  );
}
