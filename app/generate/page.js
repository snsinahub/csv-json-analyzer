'use client';

import { useState } from 'react';
import { Container, Card, Button, Form, Alert, Table } from 'react-bootstrap';
import { Icon, Message } from 'semantic-ui-react';
import Navigation from '../../components/Navigation';
import Papa from 'papaparse';

export default function GeneratePage() {
  const [rows, setRows] = useState(10);
  const [generatedData, setGeneratedData] = useState(null);
  const [error, setError] = useState(null);
  const [exportFormat, setExportFormat] = useState('csv');

  const generateSampleData = (numRows) => {
    const data = [];
    const firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller'];
    const departments = ['Sales', 'Marketing', 'Engineering', 'HR', 'Finance'];

    for (let i = 1; i <= numRows; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const department = departments[Math.floor(Math.random() * departments.length)];
      const salary = Math.floor(Math.random() * 100000) + 30000;
      const age = Math.floor(Math.random() * 40) + 22;

      data.push({
        id: i,
        firstName,
        lastName,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        department,
        salary,
        age,
        hireDate: new Date(2020 + Math.floor(Math.random() * 5), Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0]
      });
    }

    return data;
  };

  const handleGenerate = () => {
    if (rows < 1 || rows > 10000) {
      setError('Please enter a number between 1 and 10,000');
      return;
    }

    setError(null);
    const data = generateSampleData(rows);
    setGeneratedData(data);
  };

  const handleDownload = () => {
    if (!generatedData) return;

    if (exportFormat === 'json') {
      const json = JSON.stringify(generatedData, null, 2);
      const blob = new Blob([json], { type: 'application/json;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `generated_${rows}_rows.json`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const csv = Papa.unparse(generatedData);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      
      link.setAttribute('href', url);
      link.setAttribute('download', `generated_${rows}_rows.csv`);
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
          <Icon name="plus circle" /> Generate Data
        </h1>

        <Card className="mb-4">
          <Card.Body>
            <h5 className="mb-3">Generate Sample Data</h5>
            
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Number of Rows</Form.Label>
                <Form.Control
                  type="number"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 0)}
                  min="1"
                  max="10000"
                  placeholder="Enter number of rows (1-10,000)"
                />
                <Form.Text className="text-muted">
                  Generate sample employee data with random values
                </Form.Text>
              </Form.Group>

              {error && (
                <Alert variant="danger">
                  <Icon name="exclamation circle" /> {error}
                </Alert>
              )}

              <div className="d-flex gap-2 align-items-end flex-wrap">
                <Button
                  variant="success"
                  onClick={handleGenerate}
                  disabled={rows < 1}
                >
                  <Icon name="refresh" /> Generate Data
                </Button>
                
                {generatedData && (
                  <>
                    <Form.Group className="mb-0">
                      <Form.Label className="small mb-1">Export Format</Form.Label>
                      <Form.Select
                        size="sm"
                        value={exportFormat}
                        onChange={(e) => setExportFormat(e.target.value)}
                        style={{ width: '120px' }}
                      >
                        <option value="csv">CSV</option>
                        <option value="json">JSON</option>
                      </Form.Select>
                    </Form.Group>
                    <Button
                      variant="primary"
                      onClick={handleDownload}
                    >
                      <Icon name="download" /> Download {exportFormat.toUpperCase()}
                    </Button>
                  </>
                )}
              </div>
            </Form>
          </Card.Body>
        </Card>

        {generatedData && (
          <>
            <Card className="mb-4">
              <Card.Header>
                <h5 className="mb-0">
                  <Icon name="info circle" /> Generated Data Summary
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="row">
                  <div className="col-md-4">
                    <Message color="green">
                      <Message.Header>Total Rows</Message.Header>
                      <p className="h3 mt-2">{generatedData.length}</p>
                    </Message>
                  </div>
                  <div className="col-md-4">
                    <Message color="blue">
                      <Message.Header>Columns</Message.Header>
                      <p className="h3 mt-2">{Object.keys(generatedData[0]).length}</p>
                    </Message>
                  </div>
                  <div className="col-md-4">
                    <Message color="purple">
                      <Message.Header>Column Names</Message.Header>
                      <p className="mt-2">{Object.keys(generatedData[0]).join(', ')}</p>
                    </Message>
                  </div>
                </div>
              </Card.Body>
            </Card>

            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  <Icon name="table" /> Preview (First 10 Rows)
                </h5>
              </Card.Header>
              <Card.Body>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        {Object.keys(generatedData[0]).map(key => (
                          <th key={key}>{key}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {generatedData.slice(0, 10).map((row, idx) => (
                        <tr key={idx}>
                          {Object.values(row).map((value, i) => (
                            <td key={i}>{value}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                  {generatedData.length > 10 && (
                    <p className="text-muted text-center mt-2">
                      Showing 10 of {generatedData.length} rows
                    </p>
                  )}
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </Container>
    </>
  );
}
