'use client';

import { useState } from 'react';
import { Container, Card, Button, Table, Alert, Spinner } from 'react-bootstrap';
import { Icon, Message } from 'semantic-ui-react';
import { Toaster, toast } from 'react-hot-toast';
import Navigation from '../../components/Navigation';
import DynamicReport from '../../components/DynamicReport';
import VisualizationPanel from '../../components/VisualizationPanel';
import JSONViewer from '../../components/JSONViewer';
import Papa from 'papaparse';
import { generateDynamicReport } from '../../lib/csvAnalyzer';

export default function AnalyzePage() {
  const [file, setFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [dynamicReport, setDynamicReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [showJSONView, setShowJSONView] = useState(false);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (selectedFile.type === 'text/csv' || selectedFile.type === 'application/json' || selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.json'))) {
      setFile(selectedFile);
      setError(null);
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
    } else {
      setError('Please drop a valid CSV or JSON file');
    }
  };

  const analyzeCSV = (data) => {
    if (!data || data.length === 0) {
      return { error: 'No data to analyze' };
    }

    const columns = Object.keys(data[0]);
    const rowCount = data.length;
    const columnCount = columns.length;

    const analysis = {
      rowCount,
      columnCount,
      columns,
      columnStats: {}
    };

    columns.forEach(column => {
      const values = data.map(row => row[column]).filter(v => v !== null && v !== '');
      const uniqueValues = [...new Set(values)];
      
      const numericValues = values.map(v => parseFloat(v)).filter(v => !isNaN(v));
      const isNumeric = numericValues.length > values.length * 0.8;

      analysis.columnStats[column] = {
        uniqueCount: uniqueValues.length,
        nullCount: data.length - values.length,
        isNumeric
      };

      if (isNumeric && numericValues.length > 0) {
        const sum = numericValues.reduce((a, b) => a + b, 0);
        const avg = sum / numericValues.length;
        const sorted = [...numericValues].sort((a, b) => a - b);
        
        analysis.columnStats[column].min = sorted[0];
        analysis.columnStats[column].max = sorted[sorted.length - 1];
        analysis.columnStats[column].avg = avg;
        analysis.columnStats[column].sum = sum;
      }
    });

    return analysis;
  };

  const handleAnalyze = () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setLoading(true);
    setError(null);

    const isJSON = file.name.endsWith('.json') || file.type === 'application/json';

    if (isJSON) {
      // Parse JSON file
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          // Normalize JSON to array format
          let normalizedData;
          if (Array.isArray(jsonData)) {
            normalizedData = jsonData;
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            if (jsonData.data && Array.isArray(jsonData.data)) {
              normalizedData = jsonData.data;
            } else {
              normalizedData = [jsonData];
            }
          } else {
            normalizedData = [];
          }

          if (normalizedData.length === 0) {
            setError('No data found in JSON file');
            setLoading(false);
            return;
          }

          // Flatten nested JSON objects for analysis
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

          setCsvData(flattenedData);
          const analysisResult = analyzeCSV(flattenedData);
          setAnalysis(analysisResult);
          const report = generateDynamicReport(flattenedData);
          setDynamicReport(report);
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
      // Parse CSV file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          setCsvData(results.data);
          const analysisResult = analyzeCSV(results.data);
          setAnalysis(analysisResult);
          const report = generateDynamicReport(results.data);
          setDynamicReport(report);
          setLoading(false);
        },
        error: (error) => {
          setError('Error parsing CSV: ' + error.message);
          setLoading(false);
        }
      });
    }
  };

  return (
    <>
      <Navigation />
      <Container className="py-5">
        <Toaster position="top-right" />
        <h1 className="mb-4">
          <Icon name="chart line" /> Analyze Data
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

            {error && (
              <Alert variant="danger" className="mt-3">
                <Icon name="exclamation circle" /> {error}
              </Alert>
            )}

            <div className="text-center mt-4">
              <Button
                variant="primary"
                size="lg"
                onClick={handleAnalyze}
                disabled={!file || loading}
              >
                {loading ? (
                  <>
                    <Spinner animation="border" size="sm" className="me-2" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Icon name="chart bar" /> Analyze File
                  </>
                )}
              </Button>
            </div>
          </Card.Body>
        </Card>

        {analysis && !analysis.error && (
          <>
            <Card className="mb-4">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <Icon name="info circle" /> General Information
                </h5>
                <Button 
                  variant={showJSONView ? 'primary' : 'outline-secondary'}
                  size="sm"
                  onClick={() => setShowJSONView(!showJSONView)}
                >
                  <Icon name="code" /> {showJSONView ? 'Hide' : 'View'} Raw JSON
                </Button>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-4">
                    <Message color="blue">
                      <Message.Header>Total Rows</Message.Header>
                      <p className="h3 mt-2">{analysis.rowCount}</p>
                    </Message>
                  </div>
                  <div className="col-md-4">
                    <Message color="green">
                      <Message.Header>Total Columns</Message.Header>
                      <p className="h3 mt-2">{analysis.columnCount}</p>
                    </Message>
                  </div>
                  <div className="col-md-4">
                    <Message color="purple">
                      <Message.Header>Columns</Message.Header>
                      <p className="mt-2">{analysis.columns.join(', ')}</p>
                    </Message>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <Icon name="table" /> Column Statistics
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th>Column</th>
                        <th>Unique Values</th>
                        <th>Null/Empty</th>
                        <th>Type</th>
                        <th>Min</th>
                        <th>Max</th>
                        <th>Average</th>
                        <th>Sum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Object.entries(analysis.columnStats).map(([column, stats]) => (
                        <tr key={column}>
                          <td><strong>{column}</strong></td>
                          <td>{stats.uniqueCount}</td>
                          <td>{stats.nullCount}</td>
                          <td>
                            {stats.isNumeric ? (
                              <span className="badge bg-success">Numeric</span>
                            ) : (
                              <span className="badge bg-info">Text</span>
                            )}
                          </td>
                          <td>{stats.min !== undefined ? stats.min.toFixed(2) : '-'}</td>
                          <td>{stats.max !== undefined ? stats.max.toFixed(2) : '-'}</td>
                          <td>{stats.avg !== undefined ? stats.avg.toFixed(2) : '-'}</td>
                          <td>{stats.sum !== undefined ? stats.sum.toFixed(2) : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
            
            {/* JSON Data View */}
            {showJSONView && csvData && (
              <Card className="mb-4">
                <Card.Body>
                  <JSONViewer 
                    data={csvData}
                    onCopy={() => toast.success('JSON copied to clipboard!')}
                  />
                </Card.Body>
              </Card>
            )}
          </>
        )}

        {/* Dynamic Report Section */}
        {dynamicReport && !dynamicReport.error && (
          <DynamicReport report={dynamicReport} />
        )}

        {/* Visualizations Section */}
        {csvData && dynamicReport && !dynamicReport.error && (
          <VisualizationPanel csvData={csvData} dynamicReport={dynamicReport} />
        )}
      </Container>
    </>
  );
}
