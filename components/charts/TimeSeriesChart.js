'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default function TimeSeriesChart({ data, dateField, valueField, title }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">
          <Icon name="chart line" size="huge" />
          <p className="mt-3">No data available for time series chart</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">
          <Icon name="chart line" /> {title || 'Time Series Chart'}
        </h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="date" 
              angle={-45}
              textAnchor="end"
              height={80}
              tick={{ fontSize: 12 }}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value) => value.toLocaleString()}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="value" 
              stroke="#667eea" 
              strokeWidth={2}
              dot={{ fill: '#667eea', r: 4 }}
              activeDot={{ r: 6 }}
              name={valueField || 'Value'}
            />
          </LineChart>
        </ResponsiveContainer>
        <div className="text-center mt-3 text-muted">
          <small>
            <Icon name="info circle" /> 
            Showing {data.length} data point{data.length !== 1 ? 's' : ''} over time
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
