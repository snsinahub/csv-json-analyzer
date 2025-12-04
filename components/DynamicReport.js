'use client';

import { Card, Badge, Accordion } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default function DynamicReport({ report }) {
  if (!report || report.error) {
    return null;
  }

  const { summary, fieldAnalyses, insights, visualizationRecommendations, dataQuality } = report;

  const getPatternLabel = (pattern) => {
    const patterns = {
      'ecommerce_orders': 'E-commerce Orders',
      'sales_data': 'Sales Data',
      'customer_data': 'Customer Data',
      'inventory_data': 'Inventory Data',
      'transaction_logs': 'Transaction Logs',
      'generic': 'General Data'
    };
    return patterns[pattern] || 'Unknown';
  };

  const getVariantByType = (type) => {
    const variants = {
      'success': 'success',
      'info': 'info',
      'warning': 'warning',
      'error': 'danger'
    };
    return variants[type] || 'secondary';
  };

  const formatFieldType = (type) => {
    const typeLabels = {
      'id': 'Identifier',
      'date': 'Date',
      'numeric': 'Number',
      'currency': 'Currency',
      'percentage': 'Percentage',
      'integer': 'Integer',
      'category': 'Category',
      'email': 'Email',
      'text': 'Text',
      'empty': 'Empty'
    };
    return typeLabels[type] || type;
  };

  const getTypeIcon = (type) => {
    const icons = {
      'id': 'hashtag',
      'date': 'calendar',
      'numeric': 'calculator',
      'currency': 'dollar sign',
      'percentage': 'percent',
      'integer': 'sort numeric down',
      'category': 'tags',
      'email': 'mail',
      'text': 'align left',
      'empty': 'ban'
    };
    return icons[type] || 'question';
  };

  const getTypeColor = (type) => {
    const colors = {
      'id': 'purple',
      'date': 'blue',
      'numeric': 'teal',
      'currency': 'green',
      'percentage': 'orange',
      'integer': 'teal',
      'category': 'pink',
      'email': 'violet',
      'text': 'grey',
      'empty': 'red'
    };
    return colors[type] || 'grey';
  };

  return (
    <div className="dynamic-report mt-4">
      {/* Summary Section */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <Icon name="chart pie" /> Analysis Summary
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row text-center">
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="d-flex flex-column">
                <Icon name="table" size="big" color="blue" />
                <h4 className="mt-2 mb-0">{summary.rowCount.toLocaleString()}</h4>
                <small className="text-muted">Rows</small>
              </div>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="d-flex flex-column">
                <Icon name="columns" size="big" color="green" />
                <h4 className="mt-2 mb-0">{summary.columnCount}</h4>
                <small className="text-muted">Columns</small>
              </div>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <div className="d-flex flex-column">
                <Icon name="folder open" size="big" color="purple" />
                <h4 className="mt-2 mb-0">
                  <Badge bg="info">{getPatternLabel(summary.pattern)}</Badge>
                </h4>
                <small className="text-muted">Data Type</small>
              </div>
            </div>
            <div className="col-md-3">
              <div className="d-flex flex-column">
                <Icon name="check circle" size="big" color={summary.completeness === 100 ? 'green' : 'orange'} />
                <h4 className="mt-2 mb-0">{summary.completeness}%</h4>
                <small className="text-muted">Complete</small>
              </div>
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* Key Insights */}
      {insights && insights.length > 0 && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-success text-white">
            <h5 className="mb-0">
              <Icon name="lightbulb" /> Key Insights
            </h5>
          </Card.Header>
          <Card.Body>
            {insights.map((insight, idx) => (
              <div key={idx} className={`alert alert-${getVariantByType(insight.type)} d-flex align-items-center mb-2`}>
                <Icon name={insight.icon} className="me-2" />
                <span>{insight.text}</span>
              </div>
            ))}
          </Card.Body>
        </Card>
      )}

      {/* Field Analysis */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-info text-white">
          <h5 className="mb-0">
            <Icon name="list" /> Field Analysis
          </h5>
        </Card.Header>
        <Card.Body>
          <Accordion>
            {Object.entries(fieldAnalyses).map(([fieldName, analysis], idx) => (
              <Accordion.Item key={idx} eventKey={idx.toString()}>
                <Accordion.Header>
                  <div className="d-flex align-items-center justify-content-between w-100 pe-3">
                    <span>
                      <Icon name={getTypeIcon(analysis.type)} color={getTypeColor(analysis.type)} />
                      <strong className="ms-2">{fieldName}</strong>
                    </span>
                    <div>
                      <Badge bg="secondary" className="me-2">{formatFieldType(analysis.type)}</Badge>
                      <Badge bg={analysis.completeness === '100.0' ? 'success' : 'warning'}>
                        {analysis.completeness}% complete
                      </Badge>
                    </div>
                  </div>
                </Accordion.Header>
                <Accordion.Body>
                  <div className="row">
                    <div className="col-md-6">
                      <p><strong>Total Values:</strong> {analysis.totalCount.toLocaleString()}</p>
                      <p><strong>Unique Values:</strong> {analysis.uniqueCount.toLocaleString()}</p>
                      {analysis.nullCount > 0 && (
                        <p className="text-warning">
                          <Icon name="exclamation triangle" />
                          <strong> Missing Values:</strong> {analysis.nullCount}
                        </p>
                      )}
                    </div>
                    <div className="col-md-6">
                      {/* Type-specific details */}
                      {(analysis.type === 'numeric' || analysis.type === 'currency' || analysis.type === 'integer') && (
                        <>
                          <p><strong>Min:</strong> {analysis.type === 'currency' ? '$' : ''}{analysis.min?.toFixed(2)}</p>
                          <p><strong>Max:</strong> {analysis.type === 'currency' ? '$' : ''}{analysis.max?.toFixed(2)}</p>
                          <p><strong>Average:</strong> {analysis.type === 'currency' ? '$' : ''}{analysis.avg?.toFixed(2)}</p>
                          <p><strong>Sum:</strong> {analysis.type === 'currency' ? '$' : ''}{analysis.sum?.toFixed(2)}</p>
                        </>
                      )}
                      
                      {analysis.type === 'date' && (
                        <>
                          <p><strong>Earliest:</strong> {analysis.earliest}</p>
                          <p><strong>Latest:</strong> {analysis.latest}</p>
                          <p><strong>Range:</strong> {analysis.range} days</p>
                        </>
                      )}
                      
                      {analysis.type === 'id' && (
                        <>
                          <p><strong>Unique Ratio:</strong> {analysis.uniqueRatio}%</p>
                          {analysis.duplicates > 0 && (
                            <p className="text-warning">
                              <Icon name="copy" />
                              <strong> Duplicates:</strong> {analysis.duplicates}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top values for categories */}
                  {analysis.topValues && analysis.topValues.length > 0 && (
                    <div className="mt-3">
                      <strong>Top Values:</strong>
                      <ul className="list-unstyled mt-2">
                        {analysis.topValues.map((item, i) => (
                          <li key={i} className="mb-1">
                            <Badge bg="primary" className="me-2">{item.value}</Badge>
                            <span className="text-muted">
                              {item.count} occurrence{item.count !== 1 ? 's' : ''}
                              {item.percentage && ` (${item.percentage}%)`}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Top domains for emails */}
                  {analysis.topDomains && analysis.topDomains.length > 0 && (
                    <div className="mt-3">
                      <strong>Top Email Domains:</strong>
                      <ul className="list-unstyled mt-2">
                        {analysis.topDomains.map((item, i) => (
                          <li key={i} className="mb-1">
                            <Badge bg="info" className="me-2">{item.domain}</Badge>
                            <span className="text-muted">{item.count} email{item.count !== 1 ? 's' : ''}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>
        </Card.Body>
      </Card>

      {/* Visualization Recommendations */}
      {visualizationRecommendations && visualizationRecommendations.length > 0 && (
        <Card className="mb-4 border-0 shadow-sm">
          <Card.Header className="bg-warning text-dark">
            <h5 className="mb-0">
              <Icon name="chart area" /> Visualization Recommendations
            </h5>
          </Card.Header>
          <Card.Body>
            <div className="row">
              {visualizationRecommendations.map((rec, idx) => (
                <div key={idx} className="col-md-6 mb-3">
                  <Card className="h-100">
                    <Card.Body>
                      <h6>
                        <Icon name="chart bar" color="purple" />
                        {rec.type}
                      </h6>
                      <p className="text-muted mb-2">{rec.purpose}</p>
                      <div>
                        <small className="text-muted">Fields: </small>
                        {rec.fields.map((field, i) => (
                          <Badge key={i} bg="secondary" className="me-1">{field}</Badge>
                        ))}
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              ))}
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Data Quality Metrics */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Header className="bg-secondary text-white">
          <h5 className="mb-0">
            <Icon name="shield" /> Data Quality Metrics
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="row text-center">
            <div className="col-md-3 mb-3 mb-md-0">
              <h5>{dataQuality.totalCells.toLocaleString()}</h5>
              <small className="text-muted">Total Cells</small>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <h5 className="text-success">{dataQuality.completeCells.toLocaleString()}</h5>
              <small className="text-muted">Complete Cells</small>
            </div>
            <div className="col-md-3 mb-3 mb-md-0">
              <h5 className={dataQuality.nullCells > 0 ? 'text-warning' : 'text-success'}>
                {dataQuality.nullCells.toLocaleString()}
              </h5>
              <small className="text-muted">Missing Values</small>
            </div>
            <div className="col-md-3">
              <h5 className={dataQuality.completeness === 100 ? 'text-success' : 'text-warning'}>
                {dataQuality.completeness}%
              </h5>
              <small className="text-muted">Completeness</small>
            </div>
          </div>
          
          {summary.processingTime && (
            <div className="text-center mt-3 pt-3 border-top">
              <small className="text-muted">
                <Icon name="clock" /> Analysis completed in {summary.processingTime}ms
              </small>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
