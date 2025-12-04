'use client';

import { useState } from 'react';
import { Container, Card, Button } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import Link from 'next/link';
import Navigation from '../components/Navigation';

export default function Home() {
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
          <h1 className="display-4 fw-bold mb-3">CSV Analyzer</h1>
          <p className="lead mb-4">
            Powerful tools for analyzing, generating, and updating CSV files
          </p>
          <div className="d-flex gap-3">
            <Link href="/analyze" passHref legacyBehavior>
              <Button variant="light" size="lg">
                <Icon name="chart line" /> Start Analysis
              </Button>
            </Link>
            <Link href="/generate" passHref legacyBehavior>
              <Button variant="outline-light" size="lg">
                <Icon name="file alternate" /> Generate CSV
              </Button>
            </Link>
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
                  Upload and analyze CSV files to get detailed statistics, column information,
                  and data insights including min, max, average values for numeric columns.
                </Card.Text>
                <div className="text-center">
                  <Link href="/analyze" passHref legacyBehavior>
                    <Button variant="primary">
                      Analyze <Icon name="arrow right" />
                    </Button>
                  </Link>
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
                  Create new CSV files with sample data. Perfect for testing, prototyping,
                  or creating templates with customizable rows and columns.
                </Card.Text>
                <div className="text-center">
                  <Link href="/generate" passHref legacyBehavior>
                    <Button variant="success">
                      Generate <Icon name="arrow right" />
                    </Button>
                  </Link>
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
                  Modify existing CSV files by adding new rows, updating values,
                  or combining multiple CSV files into one.
                </Card.Text>
                <div className="text-center">
                  <Link href="/update" passHref legacyBehavior>
                    <Button variant="warning">
                      Update <Icon name="arrow right" />
                    </Button>
                  </Link>
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
