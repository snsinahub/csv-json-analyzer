'use client';

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';

export default function ScatterPlotChart({ data, xField, yField, title }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">
          <Icon name="circle outline" size="huge" />
          <p className="mt-3">No data available for scatter plot</p>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-secondary text-white">
        <h5 className="mb-0">
          <Icon name="circle outline" /> {title || 'Correlation Analysis'}
        </h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name={xField || 'X'} 
              tick={{ fontSize: 12 }}
              label={{ value: xField || 'X-Axis', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name={yField || 'Y'} 
              tick={{ fontSize: 12 }}
              label={{ value: yField || 'Y-Axis', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value) => value.toFixed(2)}
            />
            <Legend />
            <Scatter 
              name={`${xField || 'X'} vs ${yField || 'Y'}`} 
              data={data} 
              fill="#764ba2"
              fillOpacity={0.6}
            />
          </ScatterChart>
        </ResponsiveContainer>
        <div className="text-center mt-3 text-muted">
          <small>
            <Icon name="info circle" /> 
            Showing {data.length} data point{data.length !== 1 ? 's' : ''}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
