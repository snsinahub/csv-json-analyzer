'use client';

import { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import Navigation from '../components/Navigation';
import ConfigBanner from '../components/ConfigBanner';

export default function Home() {
  const { data: session } = useSession();
  const [stats] = useState({
    totalFiles: 0,
    lastAnalyzed: 'None',
    avgProcessingTime: '0s'
  });

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <div className="hero-section">
        <Container>
          <ConfigBanner />
          {session && (
            <p className="mb-2 text-white-50">
              <Icon name="user" /> Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!
            </p>
          )}
          <h1 className="display-4 fw-bold mb-3">CSV Analyzer</h1>
          <p className="lead mb-4">
            Powerful tools for analyzing, generating, and updating CSV and JSON files
          </p>
          <div className="d-flex gap-3">
            <Button as={Link} href="/analyze" variant="light" size="lg">
              <Icon name="chart line" /> Start Analysis
            </Button>
            <Button as={Link} href="/generate" variant="outline-light" size="lg">
              <Icon name="file alternate" /> Generate CSV
            </Button>
          </div>
        </Container>
      </div>

      <Container className="py-5">
        {/* Stats Cards */}
        <div className="row mb-5">
          <div className="col-md-4">
            <div className="stat-card text-center">
              <Icon name="file excel" size="huge" color="green" />
              <h3 className="mt-3">{stats.totalFiles}</h3>
              <p className="text-muted">Files Processed</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card text-center">
              <Icon name="clock" size="huge" color="blue" />
              <h3 className="mt-3">{stats.avgProcessingTime}</h3>
              <p className="text-muted">Avg Processing Time</p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="stat-card text-center">
              <Icon name="check circle" size="huge" color="teal" />
              <h3 className="mt-3">{stats.lastAnalyzed}</h3>
              <p className="text-muted">Last Analyzed</p>
            </div>
          </div>
        </div>

        {/* Features */}
        <h2 className="text-center mb-5">Features</h2>
        <div className="row g-4">
          <div className="col-md-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <Icon name="chart bar" size="huge" color="purple" />
                </div>
                <Card.Title className="text-center">Analyze CSV</Card.Title>
                <Card.Text>
                  Upload and analyze CSV or JSON files to get detailed statistics, dynamic insights,
                  field type detection, and interactive visualizations.
                </Card.Text>
                <div className="text-center">
                  <Button as={Link} href="/analyze" variant="primary">
                    Analyze <Icon name="arrow right" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <Icon name="table" size="huge" color="blue" />
                </div>
                <Card.Title className="text-center">Table View</Card.Title>
                <Card.Text>
                  View CSV or JSON data in a paginated table with sorting, filtering, inline editing,
                  and export to both CSV and JSON formats.
                </Card.Text>
                <div className="text-center">
                  <Button as={Link} href="/table-view" variant="info">
                    View <Icon name="arrow right" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <Icon name="pencil" size="huge" color="orange" />
                </div>
                <Card.Title className="text-center">Schema Designer</Card.Title>
                <Card.Text>
                  Design custom data schemas from scratch, upload existing schemas (JSON),
                  or auto-generate from CSV or JSON files. Export to CSV, JSON, or SQL.
                </Card.Text>
                <div className="text-center">
                  <Button as={Link} href="/schema-designer" variant="warning">
                    Design <Icon name="arrow right" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <Icon name="magic" size="huge" color="violet" />
                </div>
                <Card.Title className="text-center">Data Generator</Card.Title>
                <Card.Text>
                  Generate realistic fake data using pre-built templates for orders,
                  customers, products, employees, and sales transactions.
                </Card.Text>
                <div className="text-center">
                  <Button as={Link} href="/data-generator" variant="secondary">
                    Generate <Icon name="arrow right" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <Icon name="plus circle" size="huge" color="green" />
                </div>
                <Card.Title className="text-center">Generate CSV</Card.Title>
                <Card.Text>
                  Create new CSV or JSON files with sample data. Perfect for testing, prototyping,
                  or creating templates with customizable rows and columns.
                </Card.Text>
                <div className="text-center">
                  <Button as={Link} href="/generate" variant="success">
                    Generate <Icon name="arrow right" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>

          <div className="col-md-4">
            <Card className="feature-card">
              <Card.Body>
                <div className="text-center mb-3">
                  <Icon name="edit" size="huge" color="orange" />
                </div>
                <Card.Title className="text-center">Update CSV</Card.Title>
                <Card.Text>
                  Modify existing CSV or JSON files by adding new rows, updating values,
                  or combining multiple files into one.
                </Card.Text>
                <div className="text-center">
                  <Button as={Link} href="/update" variant="warning">
                    Update <Icon name="arrow right" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </div>
        </div>

        {/* CLI Info */}
        <div className="mt-5 p-4 bg-light rounded">
          <h3 className="mb-3">
            <Icon name="terminal" /> Command Line Interface
          </h3>
          <p>This application also includes powerful CLI tools. Get started with:</p>
          <pre className="bg-white p-3 rounded">
            <code>
              # Analyze a CSV file{'\n'}
              node scripts/analyze.js data/orders.csv{'\n\n'}
              # Generate a new CSV with 100 rows{'\n'}
              node scripts/generate.js data/output.csv 100{'\n\n'}
              # Update a CSV file{'\n'}
              node scripts/update.js data/orders.csv data/orders-updated.csv 5
            </code>
          </pre>
        </div>
      </Container>

      {/* Footer */}
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <Container>
          <p className="mb-0">CSV Analyzer &copy; 2025 | Built with Next.js, React, Bootstrap & Semantic UI</p>
        </Container>
      </footer>
    </>
  );
}
