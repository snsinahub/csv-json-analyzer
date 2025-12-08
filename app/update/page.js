'use client';

import { useState } from 'react';
import { Container, Card, Button, Form, Alert, Table, Spinner } from 'react-bootstrap';
import { Icon, Message } from 'semantic-ui-react';
import Navigation from '../../components/Navigation';
import Papa from 'papaparse';
import { storeGeneratedData, storeAnalysisLog, storeFileMetadata } from '../../lib/duckdbLogger';

export default function UpdatePage() {
  const [file, setFile] = useState(null);
  const [rowsToAdd, setRowsToAdd] = useState(1);
  const [originalData, setOriginalData] = useState(null);
  const [updatedData, setUpdatedData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.type === 'application/json' || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.json'))) {
      setFile(selectedFile);
      setError(null);
      parseFile(selectedFile);
    } else {
      setError('Please select a valid CSV or JSON file');
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.type === 'text/csv' || droppedFile.type === 'application/json' || droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.json'))) {
      setFile(droppedFile);
      setError(null);
      parseFile(droppedFile);
    } else {
      setError('Please drop a valid CSV or JSON file');
    }
  };

  const parseFile = (file) => {
    setLoading(true);
    
    const isJSON = file.name.endsWith('.json') || file.type === 'application/json';
    
    if (isJSON) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          let normalizedData;
          if (Array.isArray(jsonData)) {
            normalizedData = jsonData;
          } else if (jsonData.data && Array.isArray(jsonData.data)) {
            normalizedData = jsonData.data;
          } else {
            normalizedData = [jsonData];
          }
          
          // Flatten nested JSON
          const flattenedData = normalizedData.map(item => {
            const flatten = (obj, prefix = '') => {
              const flattened = {};
              for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  const value = obj[key];
                  const newKey = prefix ? `${prefix}.${key}` : key;
                  
                  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(flattened, flatten(value, newKey));
                  } else if (Array.isArray(value)) {
                    flattened[newKey] = JSON.stringify(value);
                  } else {
                    flattened[newKey] = value;
                  }
                }
              }
              return flattened;
            };
            return flatten(item);
          });
          
          setOriginalData(flattenedData);
          setUpdatedData(null);
          setLoading(false);
        } catch (error) {
          setError('Error parsing JSON: ' + error.message);
          setLoading(false);
        }
      };
      reader.onerror = () => {
        setError('Error reading JSON file');
        setLoading(false);
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setOriginalData(results.data);
          setUpdatedData(null);
          setLoading(false);
        },
        error: (error) => {
          setError('Error parsing CSV: ' + error.message);
          setLoading(false);
        }
      });
    }
  };

  const generateNewRow = (existingData) => {
    if (!existingData || existingData.length === 0) {
      return null;
    }

    const columns = Object.keys(existingData[0]);
    const newRow = {};

    columns.forEach(col => {
      const lowerCol = col.toLowerCase();
      
      if (lowerCol.includes('id')) {
        newRow[col] = existingData.length + 1;
      } else if (lowerCol.includes('name')) {
        newRow[col] = 'New Entry';
      } else if (lowerCol.includes('email')) {
        newRow[col] = 'new.entry@example.com';
      } else if (lowerCol.includes('date')) {
        newRow[col] = new Date().toISOString().split('T')[0];
      } else if (lowerCol.includes('price') || lowerCol.includes('amount') || lowerCol.includes('salary')) {
        newRow[col] = Math.floor(Math.random() * 1000);
      } else {
        const sampleValues = existingData.map(row => row[col]).filter(v => v);
        newRow[col] = sampleValues[Math.floor(Math.random() * sampleValues.length)] || 'New Value';
      }
    });

    return newRow;
  };

  const handleUpdate = () => {
    if (!originalData) {
      setError('Please upload a file first');
      return;
    }

    if (rowsToAdd < 1 || rowsToAdd > 1000) {
      setError('Please enter a number between 1 and 1,000');
      return;
    }

    setError(null);
    const newData = [...originalData];

    for (let i = 0; i < rowsToAdd; i++) {
      const newRow = generateNewRow(newData);
      if (newRow) {
        newData.push(newRow);
      }
    }

    setUpdatedData(newData);
  };

  const handleDownload = () => {
    if (!updatedData) return;

    const isJSON = file.name.endsWith('.json');
    const originalName = file.name.replace(/\.(csv|json)$/, '');
    
    if (isJSON) {
      const json = JSON.stringify(updatedData, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${originalName}_updated.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const csv = Papa.unparse(updatedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${originalName}_updated.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    // Log the update operation
    storeAnalysisLog({
      type: 'file_update',
      page: 'update',
      filename: file.name,
      rowCount: updatedData.length,
      columnCount: Object.keys(updatedData[0] || {}).length,
      status: 'success',
      metadata: { 
        originalRows: originalData.length,
        rowsAdded: rowsToAdd,
        fileType: isJSON ? 'json' : 'csv'
      }
    });
  };

  const handleSaveToDuckDB = async () => {
    if (!updatedData || updatedData.length === 0) {
      setError('No data to save. Please update the file first.');
      return;
    }

    try {
      const originalName = file.name.replace(/\.(csv|json)$/, '');
      const tableName = `${originalName}_updated`;
      const result = await storeGeneratedData(updatedData, tableName, 'update');
      
      if (result.success) {
        alert(`Saved ${result.stats.rowCount} rows to DuckDB table: ${result.stats.tableName}`);
      } else {
        setError(`Failed to save to DuckDB: ${result.error}`);
      }
    } catch (error) {
      setError(`Failed to save to DuckDB: ${error.message}`);
    }
  };
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `${originalName}_updated.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <>
      <Navigation />
      <Container className="py-5">
        <h1 className="mb-4">
          <Icon name="edit" /> Update Data
        </h1>

        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">Upload CSV or JSON File</h5>
            
            <div
              className={`upload-zone ${dragOver ? 'dragover' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <Icon name="cloud upload" size="huge" color="grey" />
              <h4 className="mt-3">
                {file ? file.name : 'Drop CSV or JSON file here or click to browse'}
              </h4>
              <p className="text-muted">
                {file ? `Size: ${(file.size / 1024).toFixed(2)} KB` : 'Supports .csv and .json files'}
              </p>
              <input
                id="fileInput"
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
            </div>

            {loading && (
              <div className="text-center mt-3">
                <Spinner animation="border" variant="primary" />
                <p className="mt-2">Loading CSV file...</p>
              </div>
            )}

            {originalData && (
              <>
                <hr className="my-4" />
                <h5 className="mb-3">Add New Rows</h5>
                
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Number of Rows to Add</Form.Label>
                    <Form.Control
                      type="number"
                      value={rowsToAdd}
                      onChange={(e) => setRowsToAdd(parseInt(e.target.value) || 0)}
                      min="1"
                      max="1000"
                      placeholder="Enter number of rows to add (1-1,000)"
                    />
                    <Form.Text className="text-muted">
                      New rows will be generated with sample data based on existing columns
                    </Form.Text>
                  </Form.Group>

                  {error && (
                    <Alert variant="danger">
                      <Icon name="exclamation circle" /> {error}
                    </Alert>
                  )}

                  <div className="d-flex gap-2">
                    <Button
                      variant="warning"
                      onClick={handleUpdate}
                      disabled={!originalData || rowsToAdd < 1}
                    >
                      <Icon name="plus" /> Add Rows
                    </Button>
                    
                    {updatedData && (
                      <>
                        <Button
                          variant="primary"
                          onClick={handleDownload}
                        >
                          <Icon name="download" /> Download Updated CSV
                        </Button>
                        <Button
                          variant="success"
                          onClick={handleSaveToDuckDB}
                        >
                          <Icon name="database" /> Save to DuckDB
                        </Button>
                      </>
                    )}
                  </div>
                </Form>
              </>
            )}
          </Card.Body>
        </Card>

        {originalData && (
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <Icon name="info circle" /> Original File Information
              </h5>
            </Card.Header>
            <Card.Body>
              <div className="row">
                <div className="col-md-4">
                  <Message color="blue">
                    <Message.Header>Current Rows</Message.Header>
                    <p className="h3 mt-2">{originalData.length}</p>
                  </Message>
                </div>
                <div className="col-md-4">
                  <Message color="green">
                    <Message.Header>Columns</Message.Header>
                    <p className="h3 mt-2">{Object.keys(originalData[0]).length}</p>
                  </Message>
                </div>
                <div className="col-md-4">
                  <Message color={updatedData ? "orange" : "grey"}>
                    <Message.Header>New Rows</Message.Header>
                    <p className="h3 mt-2">{updatedData ? updatedData.length : originalData.length}</p>
                  </Message>
                </div>
              </div>
            </Card.Body>
          </Card>
        )}

        {updatedData && (
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                <Icon name="table" /> Preview Updated Data (Last 10 Rows)
              </h5>
            </Card.Header>
            <Card.Body>
              <Alert variant="success">
                <Icon name="check circle" /> Successfully added {updatedData.length - originalData.length} new row(s)!
              </Alert>
              
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-dark">
                    <tr>
                      {Object.keys(updatedData[0]).map(key => (
                        <th key={key}>{key}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {updatedData.slice(-10).map((row, idx) => (
                      <tr key={idx} className={idx >= updatedData.slice(-10).length - rowsToAdd ? 'table-warning' : ''}>
                        {Object.values(row).map((value, i) => (
                          <td key={i}>{value}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>
                <p className="text-muted text-center mt-2">
                  Showing last 10 rows (highlighted rows are newly added)
                </p>
              </div>
            </Card.Body>
          </Card>
        )}
      </Container>
    </>
  );
}
