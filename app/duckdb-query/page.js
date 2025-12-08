'use client';
import { useState, useEffect } from 'react';
import { Card, Button, Form, Table, Alert, Container } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import toast, { Toaster } from 'react-hot-toast';
import Navigation from '../../components/Navigation';

export default function DuckDBQueryPage() {
  const [tables, setTables] = useState([]);
  const [selectedTable, setSelectedTable] = useState('');
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [schema, setSchema] = useState([]);
  const [stats, setStats] = useState(null);
  const [activeTab, setActiveTab] = useState('query'); // query, upload, tables, edit
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState([]);
  const [showCreateTable, setShowCreateTable] = useState(false);
  const [newTableName, setNewTableName] = useState('');
  const [newTableColumns, setNewTableColumns] = useState([{ name: '', type: 'VARCHAR' }]);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');
  const [newColumnType, setNewColumnType] = useState('VARCHAR');
  const [showAddRow, setShowAddRow] = useState(false);
  const [newRowData, setNewRowData] = useState({});

  useEffect(() => {
    loadTables();
  }, []);

  const loadTables = async () => {
    try {
      const response = await fetch('/api/duckdb/tables');
      const data = await response.json();
      if (data.success) {
        setTables(data.tables);
      }
    } catch (error) {
      console.error('Failed to load tables:', error);
    }
  };

  const handleTableSelect = async (tableName) => {
    setSelectedTable(tableName);
    setQuery(`SELECT * FROM ${tableName} LIMIT 100`);
    
    // Load schema
    try {
      const response = await fetch(`/api/duckdb/table/${tableName}?action=schema`);
      const data = await response.json();
      if (data.success) {
        setSchema(data.data);
      }
    } catch (error) {
      console.error('Failed to load schema:', error);
    }

    // Load stats
    try {
      const response = await fetch(`/api/duckdb/table/${tableName}?action=stats`);
      const data = await response.json();
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }

    // Load table data for editing
    if (editMode) {
      loadTableData(tableName);
    }
  };

  const loadTableData = async (tableName) => {
    try {
      const response = await fetch('/api/duckdb/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: `SELECT * FROM ${tableName}` })
      });
      const data = await response.json();
      if (data.success) {
        setEditData(data.data);
      }
    } catch (error) {
      console.error('Failed to load table data:', error);
    }
  };

  const handleDeleteTable = async (tableName) => {
    if (!confirm(`Are you sure you want to delete table "${tableName}"? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch('/api/duckdb/table-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'delete',
          data: { tableName }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Table "${tableName}" deleted successfully`);
        loadTables();
        if (selectedTable === tableName) {
          setSelectedTable('');
          setSchema([]);
          setStats(null);
        }
      } else {
        toast.error(result.error || 'Failed to delete table');
      }
    } catch (error) {
      toast.error('Failed to delete table');
      console.error('Delete error:', error);
    }
  };

  const handleCreateTable = async () => {
    if (!newTableName.trim()) {
      toast.error('Please enter a table name');
      return;
    }

    const validColumns = newTableColumns.filter(col => col.name.trim());
    if (validColumns.length === 0) {
      toast.error('Please add at least one column');
      return;
    }

    try {
      const response = await fetch('/api/duckdb/table-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'create',
          data: { 
            tableName: newTableName,
            columns: validColumns
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Table "${newTableName}" created successfully`);
        setShowCreateTable(false);
        setNewTableName('');
        setNewTableColumns([{ name: '', type: 'VARCHAR' }]);
        loadTables();
      } else {
        toast.error(result.error || 'Failed to create table');
      }
    } catch (error) {
      toast.error('Failed to create table');
      console.error('Create error:', error);
    }
  };

  const handleAddColumn = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    if (!newColumnName.trim()) {
      toast.error('Please enter a column name');
      return;
    }

    try {
      const response = await fetch('/api/duckdb/table-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'add-column',
          data: { 
            tableName: selectedTable,
            columnName: newColumnName,
            columnType: newColumnType
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success(`Column "${newColumnName}" added successfully`);
        setShowAddColumn(false);
        setNewColumnName('');
        setNewColumnType('VARCHAR');
        handleTableSelect(selectedTable); // Reload schema
      } else {
        toast.error(result.error || 'Failed to add column');
      }
    } catch (error) {
      toast.error('Failed to add column');
      console.error('Add column error:', error);
    }
  };

  const handleAddRow = async () => {
    if (!selectedTable) {
      toast.error('Please select a table first');
      return;
    }

    try {
      const response = await fetch('/api/duckdb/table-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'insert',
          data: { 
            tableName: selectedTable,
            row: newRowData
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Row added successfully');
        setShowAddRow(false);
        setNewRowData({});
        if (editMode) {
          loadTableData(selectedTable);
        }
      } else {
        toast.error(result.error || 'Failed to add row');
      }
    } catch (error) {
      toast.error('Failed to add row');
      console.error('Add row error:', error);
    }
  };

  const handleUpdateCell = async (rowIndex, columnName, newValue) => {
    if (!selectedTable || !editData[rowIndex]) {
      return;
    }

    const oldRow = editData[rowIndex];
    
    try {
      const response = await fetch('/api/duckdb/table-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'update',
          data: { 
            tableName: selectedTable,
            updates: { [columnName]: newValue },
            where: oldRow // Use entire row for WHERE to ensure unique match
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Cell updated successfully');
        loadTableData(selectedTable);
      } else {
        toast.error(result.error || 'Failed to update cell');
      }
    } catch (error) {
      toast.error('Failed to update cell');
      console.error('Update error:', error);
    }
  };

  const handleDeleteRow = async (rowData) => {
    if (!selectedTable) {
      return;
    }

    if (!confirm('Are you sure you want to delete this row?')) {
      return;
    }

    try {
      const response = await fetch('/api/duckdb/table-operations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          operation: 'delete-row',
          data: { 
            tableName: selectedTable,
            where: rowData
          }
        })
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Row deleted successfully');
        loadTableData(selectedTable);
      } else {
        toast.error(result.error || 'Failed to delete row');
      }
    } catch (error) {
      toast.error('Failed to delete row');
      console.error('Delete row error:', error);
    }
  };

  const executeQuery = async () => {
    if (!query.trim()) {
      toast.error('Please enter a query');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/duckdb/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      const data = await response.json();
      
      if (data.success) {
        setResults(data.data);
        toast.success(`Query executed: ${data.rowCount} rows returned`);
      } else {
        toast.error(data.error || 'Query failed');
      }
    } catch (error) {
      toast.error('Failed to execute query');
      console.error('Query error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileType = file.name.endsWith('.json') ? 'json' : 'csv';
    const tableName = file.name.replace(/\.(csv|json)$/i, '');

    setLoading(true);
    toast.loading('Importing file to DuckDB...');

    try {
      const content = await file.text();
      let data = content;

      if (fileType === 'json') {
        data = JSON.parse(content);
      }

      const response = await fetch('/api/duckdb/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data, tableName, fileType })
      });

      const result = await response.json();
      
      if (result.success) {
        toast.dismiss();
        toast.success(`Imported ${result.stats.rowCount} rows to table: ${result.stats.tableName}`);
        loadTables();
      } else {
        toast.dismiss();
        toast.error(result.error || 'Import failed');
      }
    } catch (error) {
      toast.dismiss();
      toast.error('Failed to import file');
      console.error('Import error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sampleQueries = [
    { label: 'Select All', query: `SELECT * FROM ${selectedTable || 'table_name'} LIMIT 100` },
    { label: 'Count Rows', query: `SELECT COUNT(*) as total_rows FROM ${selectedTable || 'table_name'}` },
    { label: 'Group By', query: `SELECT column_name, COUNT(*) as count FROM ${selectedTable || 'table_name'} GROUP BY column_name` },
    { label: 'Distinct Values', query: `SELECT DISTINCT column_name FROM ${selectedTable || 'table_name'}` }
  ];

  return (
    <>
      <Navigation />
      <Container className="py-4">
        <Toaster position="top-right" />
        
        <h1 className="mb-4">
          <Icon name="database" /> DuckDB Query Interface
        </h1>

      <div className="btn-group mb-3" role="group">
        <button 
          className={`btn ${activeTab === 'query' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('query')}
        >
          <Icon name="code" /> SQL Query
        </button>
        <button 
          className={`btn ${activeTab === 'upload' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('upload')}
        >
          <Icon name="upload" /> Upload Data
        </button>
        <button 
          className={`btn ${activeTab === 'tables' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => setActiveTab('tables')}
        >
          <Icon name="table" /> Tables
        </button>
        <button 
          className={`btn ${activeTab === 'edit' ? 'btn-primary' : 'btn-outline-primary'}`}
          onClick={() => {
            setActiveTab('edit');
            setEditMode(true);
            if (selectedTable) {
              loadTableData(selectedTable);
            }
          }}
        >
          <Icon name="edit" /> Edit Table
        </button>
      </div>

      {/* Upload Tab */}
      {activeTab === 'upload' && (
        <Card className="mb-4">
          <Card.Header>
            <Icon name="upload" /> Upload CSV or JSON File
          </Card.Header>
          <Card.Body>
            <Form.Group>
              <Form.Label>Select File</Form.Label>
              <Form.Control
                type="file"
                accept=".csv,.json"
                onChange={handleFileUpload}
                disabled={loading}
              />
              <Form.Text className="text-muted">
                Upload a CSV or JSON file to import into DuckDB
              </Form.Text>
            </Form.Group>
          </Card.Body>
        </Card>
      )}

      {/* Tables Tab */}
      {activeTab === 'tables' && (
        <>
          <div className="mb-3">
            <Button variant="success" onClick={() => setShowCreateTable(true)}>
              <Icon name="plus" /> Create New Table
            </Button>
          </div>

          <Card className="mb-4">
            <Card.Header>
              <Icon name="table" /> Available Tables ({tables.length})
            </Card.Header>
            <Card.Body>
              {tables.length === 0 ? (
                <Alert variant="info">
                  No tables found. Upload a file or create a new table to get started.
                </Alert>
              ) : (
                <div className="list-group">
                  {tables.map((table) => (
                    <div
                      key={table.table_name}
                      className={`list-group-item ${
                        selectedTable === table.table_name ? 'active' : ''
                      }`}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <button
                          className="btn btn-link text-start flex-grow-1 p-0 text-decoration-none"
                          style={{ color: selectedTable === table.table_name ? 'white' : 'inherit' }}
                          onClick={() => {
                            handleTableSelect(table.table_name);
                            setActiveTab('query');
                          }}
                        >
                          <Icon name="table" /> {table.table_name}
                          <small className="ms-2">{table.table_type}</small>
                        </button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTable(table.table_name);
                          }}
                        >
                          <Icon name="trash" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Create Table Modal */}
          {showCreateTable && (
            <Card className="mb-4">
              <Card.Header>
                <Icon name="plus" /> Create New Table
              </Card.Header>
              <Card.Body>
                <Form.Group className="mb-3">
                  <Form.Label>Table Name</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTableName}
                    onChange={(e) => setNewTableName(e.target.value)}
                    placeholder="Enter table name"
                  />
                </Form.Group>

                <Form.Label>Columns</Form.Label>
                {newTableColumns.map((col, idx) => (
                  <div key={idx} className="d-flex gap-2 mb-2">
                    <Form.Control
                      type="text"
                      placeholder="Column name"
                      value={col.name}
                      onChange={(e) => {
                        const updated = [...newTableColumns];
                        updated[idx].name = e.target.value;
                        setNewTableColumns(updated);
                      }}
                    />
                    <Form.Select
                      value={col.type}
                      onChange={(e) => {
                        const updated = [...newTableColumns];
                        updated[idx].type = e.target.value;
                        setNewTableColumns(updated);
                      }}
                    >
                      <option value="VARCHAR">VARCHAR</option>
                      <option value="INTEGER">INTEGER</option>
                      <option value="DOUBLE">DOUBLE</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                      <option value="DATE">DATE</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                    </Form.Select>
                    <Button
                      variant="danger"
                      onClick={() => {
                        setNewTableColumns(newTableColumns.filter((_, i) => i !== idx));
                      }}
                    >
                      <Icon name="minus" />
                    </Button>
                  </div>
                ))}

                <Button
                  variant="secondary"
                  size="sm"
                  className="mb-3"
                  onClick={() => setNewTableColumns([...newTableColumns, { name: '', type: 'VARCHAR' }])}
                >
                  <Icon name="plus" /> Add Column
                </Button>

                <div className="d-flex gap-2">
                  <Button variant="primary" onClick={handleCreateTable}>
                    Create Table
                  </Button>
                  <Button variant="secondary" onClick={() => {
                    setShowCreateTable(false);
                    setNewTableName('');
                    setNewTableColumns([{ name: '', type: 'VARCHAR' }]);
                  }}>
                    Cancel
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </>
      )}

      {/* Edit Table Tab */}
      {activeTab === 'edit' && (
        <>
          {!selectedTable ? (
            <Alert variant="info">
              Please select a table from the Tables tab to edit.
            </Alert>
          ) : (
            <>
              <div className="mb-3 d-flex gap-2">
                <Button variant="success" onClick={() => setShowAddRow(true)}>
                  <Icon name="plus" /> Add Row
                </Button>
                <Button variant="primary" onClick={() => setShowAddColumn(true)}>
                  <Icon name="columns" /> Add Column
                </Button>
                <Button variant="info" onClick={() => loadTableData(selectedTable)}>
                  <Icon name="refresh" /> Refresh
                </Button>
              </div>

              {/* Add Column Modal */}
              {showAddColumn && (
                <Card className="mb-3">
                  <Card.Header>
                    <Icon name="columns" /> Add Column to {selectedTable}
                  </Card.Header>
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label>Column Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="Enter column name"
                      />
                    </Form.Group>
                    <Form.Group className="mb-3">
                      <Form.Label>Data Type</Form.Label>
                      <Form.Select
                        value={newColumnType}
                        onChange={(e) => setNewColumnType(e.target.value)}
                      >
                        <option value="VARCHAR">VARCHAR</option>
                        <option value="INTEGER">INTEGER</option>
                        <option value="DOUBLE">DOUBLE</option>
                        <option value="BOOLEAN">BOOLEAN</option>
                        <option value="DATE">DATE</option>
                        <option value="TIMESTAMP">TIMESTAMP</option>
                      </Form.Select>
                    </Form.Group>
                    <div className="d-flex gap-2">
                      <Button variant="primary" onClick={handleAddColumn}>
                        Add Column
                      </Button>
                      <Button variant="secondary" onClick={() => {
                        setShowAddColumn(false);
                        setNewColumnName('');
                        setNewColumnType('VARCHAR');
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Add Row Modal */}
              {showAddRow && (
                <Card className="mb-3">
                  <Card.Header>
                    <Icon name="plus" /> Add Row to {selectedTable}
                  </Card.Header>
                  <Card.Body>
                    {schema.map((col) => (
                      <Form.Group key={col.column_name} className="mb-3">
                        <Form.Label>{col.column_name} ({col.data_type})</Form.Label>
                        <Form.Control
                          type="text"
                          value={newRowData[col.column_name] || ''}
                          onChange={(e) => setNewRowData({
                            ...newRowData,
                            [col.column_name]: e.target.value
                          })}
                          placeholder={`Enter ${col.column_name}`}
                        />
                      </Form.Group>
                    ))}
                    <div className="d-flex gap-2">
                      <Button variant="primary" onClick={handleAddRow}>
                        Add Row
                      </Button>
                      <Button variant="secondary" onClick={() => {
                        setShowAddRow(false);
                        setNewRowData({});
                      }}>
                        Cancel
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Editable Table */}
              <Card>
                <Card.Header>
                  Edit Table: {selectedTable} ({editData.length} rows)
                </Card.Header>
                <Card.Body className="p-0">
                  <div style={{ maxHeight: '600px', overflow: 'auto' }}>
                    {editData.length === 0 ? (
                      <Alert variant="info" className="m-3">
                        No data in table. Add rows to get started.
                      </Alert>
                    ) : (
                      <Table striped bordered hover size="sm" className="mb-0">
                        <thead className="sticky-top bg-light">
                          <tr>
                            <th>Actions</th>
                            {Object.keys(editData[0] || {}).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {editData.map((row, rowIdx) => (
                            <tr key={rowIdx}>
                              <td>
                                <Button
                                  variant="danger"
                                  size="sm"
                                  onClick={() => handleDeleteRow(row)}
                                >
                                  <Icon name="trash" />
                                </Button>
                              </td>
                              {Object.entries(row).map(([colName, value], colIdx) => (
                                <td key={colIdx}>
                                  <Form.Control
                                    size="sm"
                                    type="text"
                                    value={value || ''}
                                    onChange={(e) => {
                                      const updated = [...editData];
                                      updated[rowIdx][colName] = e.target.value;
                                      setEditData(updated);
                                    }}
                                    onBlur={(e) => handleUpdateCell(rowIdx, colName, e.target.value)}
                                    style={{ minWidth: '100px' }}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </>
      )}

      {/* Query Tab */}
      {activeTab === 'query' && (
        <>
          <div className="row mb-4">
            <div className="col-md-3">
              <Card>
                <Card.Header>Tables</Card.Header>
                <Card.Body className="p-0">
                  <div className="list-group list-group-flush">
                    {tables.map((table) => (
                      <button
                        key={table.table_name}
                        className={`list-group-item list-group-item-action ${
                          selectedTable === table.table_name ? 'active' : ''
                        }`}
                        onClick={() => handleTableSelect(table.table_name)}
                      >
                        {table.table_name}
                      </button>
                    ))}
                  </div>
                </Card.Body>
              </Card>

              {schema.length > 0 && (
                <Card className="mt-3">
                  <Card.Header>Schema</Card.Header>
                  <Card.Body className="p-0">
                    <Table size="sm" className="mb-0">
                      <tbody>
                        {schema.map((col, idx) => (
                          <tr key={idx}>
                            <td><small><strong>{col.column_name}</strong></small></td>
                            <td><small className="text-muted">{col.data_type}</small></td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </div>

            <div className="col-md-9">
              <Card className="mb-3">
                <Card.Header>
                  <Icon name="code" /> SQL Query
                </Card.Header>
                <Card.Body>
                  <Form.Group className="mb-3">
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter SQL query..."
                      style={{ fontFamily: 'monospace' }}
                    />
                  </Form.Group>

                  <div className="d-flex gap-2 mb-3">
                    <Button 
                      variant="primary" 
                      onClick={executeQuery}
                      disabled={loading || !query.trim()}
                    >
                      <Icon name="play" /> Execute Query
                    </Button>
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setQuery('')}
                    >
                      <Icon name="eraser" /> Clear
                    </Button>
                  </div>

                  <div className="border-top pt-3">
                    <small className="text-muted d-block mb-2">Sample Queries:</small>
                    <div className="d-flex gap-2 flex-wrap">
                      {sampleQueries.map((sq, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline-info"
                          onClick={() => setQuery(sq.query)}
                        >
                          {sq.label}
                        </Button>
                      ))}
                    </div>
                  </div>
                </Card.Body>
              </Card>

              {stats && (
                <Card className="mb-3">
                  <Card.Header>Table Statistics</Card.Header>
                  <Card.Body>
                    <div className="row text-center">
                      <div className="col">
                        <h4>{stats.rowCount?.toLocaleString()}</h4>
                        <small className="text-muted">Rows</small>
                      </div>
                      <div className="col">
                        <h4>{stats.columnCount}</h4>
                        <small className="text-muted">Columns</small>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              )}

              {results && (
                <Card>
                  <Card.Header>
                    Query Results ({results.length} rows)
                  </Card.Header>
                  <Card.Body className="p-0">
                    <div style={{ maxHeight: '500px', overflow: 'auto' }}>
                      <Table striped bordered hover size="sm" className="mb-0">
                        <thead className="sticky-top bg-light">
                          <tr>
                            {Object.keys(results[0] || {}).map((key) => (
                              <th key={key}>{key}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {results.map((row, idx) => (
                            <tr key={idx}>
                              {Object.values(row).map((val, i) => (
                                <td key={i}>
                                  {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  </Card.Body>
                </Card>
              )}
            </div>
          </div>
        </>
      )}
      </Container>
      
      <footer className="bg-dark text-white text-center py-3 mt-5">
        <Container>
          <p className="mb-0">CSV Analyzer © 2025 | Built with Next.js, React, Bootstrap & Semantic UI</p>
        </Container>
      </footer>
    </>
  );
}
