'use client';

import { useState } from 'react';
import { Card, Nav, Spinner, Alert } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import TimeSeriesChart from './charts/TimeSeriesChart';
import PieChartComponent from './charts/PieChartComponent';
import BarChartComponent from './charts/BarChartComponent';
import HistogramChart from './charts/HistogramChart';
import ScatterPlotChart from './charts/ScatterPlotChart';
import {
  detectAvailableCharts,
  prepareTimeSeriesData,
  preparePieChartData,
  prepareBarChartData,
  prepareHistogramData,
  prepareScatterPlotData
} from '../lib/chartUtils';

export default function VisualizationPanel({ csvData, dynamicReport }) {
  const [activeTab, setActiveTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [chartData, setChartData] = useState({});

  if (!csvData || !dynamicReport) {
    return null;
  }

  const availableCharts = detectAvailableCharts(dynamicReport);

  if (availableCharts.length === 0) {
    return (
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-secondary text-white">
          <h5 className="mb-0">
            <Icon name="chart area" /> Visualizations
          </h5>
        </Card.Header>
        <Card.Body className="text-center text-muted py-5">
          <Icon name="chart area" size="huge" />
          <p className="mt-3">No visualizations available for this dataset</p>
          <small>Upload a CSV with date, numeric, or category fields to see charts</small>
        </Card.Body>
      </Card>
    );
  }

  // Set default active tab to first available chart
  if (activeTab === null && availableCharts.length > 0) {
    setActiveTab(availableCharts[0].type);
  }

  // Prepare chart data when tab is selected
  const getChartData = (chartType) => {
    if (chartData[chartType]) {
      return chartData[chartType];
    }

    setLoading(true);
    let data = null;

    const chart = availableCharts.find(c => c.type === chartType);
    if (!chart) return null;

    try {
      switch (chartType) {
        case 'timeSeries':
          data = prepareTimeSeriesData(csvData, chart.fields.date, chart.fields.value);
          break;
        case 'pie':
          data = preparePieChartData(csvData, chart.fields.category, 10);
          break;
        case 'bar':
          data = prepareBarChartData(csvData, chart.fields.category, chart.fields.value, 15);
          break;
        case 'histogram':
          data = prepareHistogramData(csvData, chart.fields.value, 10);
          break;
        case 'scatter':
          data = prepareScatterPlotData(csvData, chart.fields.x, chart.fields.y, 1000);
          break;
        default:
          data = null;
      }

      setChartData(prev => ({ ...prev, [chartType]: data }));
    } catch (error) {
      console.error(`Error preparing ${chartType} data:`, error);
    } finally {
      setLoading(false);
    }

    return data;
  };

  const renderChart = () => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Generating visualization...</p>
        </div>
      );
    }

    const chart = availableCharts.find(c => c.type === activeTab);
    if (!chart) return null;

    const data = getChartData(activeTab);

    if (!data || data.length === 0) {
      return (
        <Alert variant="warning" className="text-center">
          <Icon name="exclamation triangle" />
          No data available for this visualization
        </Alert>
      );
    }

    switch (activeTab) {
      case 'timeSeries':
        return (
          <TimeSeriesChart
            data={data}
            dateField={chart.fields.date}
            valueField={chart.fields.value}
            title={`${chart.fields.value} Over Time`}
          />
        );
      case 'pie':
        return (
          <PieChartComponent
            data={data}
            categoryField={chart.fields.category}
            title={`${chart.fields.category} Distribution`}
          />
        );
      case 'bar':
        return (
          <BarChartComponent
            data={data}
            categoryField={chart.fields.category}
            valueField={chart.fields.value}
            title={`${chart.fields.category} Comparison`}
          />
        );
      case 'histogram':
        return (
          <HistogramChart
            data={data}
            valueField={chart.fields.value}
            title={`${chart.fields.value} Distribution`}
          />
        );
      case 'scatter':
        return (
          <ScatterPlotChart
            data={data}
            xField={chart.fields.x}
            yField={chart.fields.y}
            title={`${chart.fields.x} vs ${chart.fields.y}`}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="visualization-panel mb-4">
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-gradient text-white" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <h5 className="mb-0">
            <Icon name="chart area" /> Data Visualizations
          </h5>
          <small>Interactive charts to explore your data</small>
        </Card.Header>
        <Card.Body className="p-0">
          {/* Chart Selection Tabs */}
          <Nav variant="tabs" className="px-3 pt-3">
            {availableCharts.map((chart) => (
              <Nav.Item key={chart.type}>
                <Nav.Link
                  active={activeTab === chart.type}
                  onClick={() => setActiveTab(chart.type)}
                  className="d-flex align-items-center"
                >
                  <Icon name={chart.icon} className="me-2" />
                  <div className="d-flex flex-column align-items-start">
                    <span>{chart.name}</span>
                    <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                      {chart.description}
                    </small>
                  </div>
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>

          {/* Chart Display Area */}
          <div className="p-3">
            {renderChart()}
          </div>
        </Card.Body>
      </Card>

      {/* Chart Info */}
      <div className="text-center mt-3">
        <small className="text-muted">
          <Icon name="info circle" />
          {availableCharts.length} visualization{availableCharts.length !== 1 ? 's' : ''} available based on your data structure
        </small>
      </div>
    </div>
  );
}
