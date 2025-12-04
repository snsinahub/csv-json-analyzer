'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default function BarChartComponent({ data, categoryField, valueField, title }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">
          <Icon name="chart bar" size="huge" />
          <p className="mt-3">No data available for bar chart</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-info text-white">
        <h5 className="mb-0">
          <Icon name="chart bar" /> {title || 'Category Comparison'}
        </h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart 
            data={data} 
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name" 
              angle={-45}
              textAnchor="end"
              height={100}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend />
            <Bar 
              dataKey="value" 
              fill="#4facfe" 
              name={valueField || 'Count'}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
        <div className="text-center mt-3 text-muted">
          <small>
            <Icon name="info circle" /> 
            Showing {data.length} categor{data.length !== 1 ? 'ies' : 'y'}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
