'use client';

import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import { generateColorPalette } from '../../lib/chartUtils';

export default function PieChartComponent({ data, categoryField, title }) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <Card.Body className="text-center text-muted">
          <Icon name="chart pie" size="huge" />
          <p className="mt-3">No data available for pie chart</p>
        </Card.Body>
      </Card>
    );
  }

  const colors = generateColorPalette(data.length);

  const renderLabel = (entry) => {
    return `${entry.name} (${entry.percentage}%)`;
  };

  return (
    <Card className="mb-4 border-0 shadow-sm">
      <Card.Header className="bg-success text-white">
        <h5 className="mb-0">
          <Icon name="chart pie" /> {title || 'Category Distribution'}
        </h5>
      </Card.Header>
      <Card.Body>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderLabel}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
              formatter={(value, name, props) => [
                `${value} (${props.payload.percentage}%)`,
                'Count'
              ]}
            />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
            />
          </PieChart>
        </ResponsiveContainer>
        <div className="text-center mt-3 text-muted">
          <small>
            <Icon name="info circle" /> 
            Showing top {data.length} categor{data.length !== 1 ? 'ies' : 'y'}
          </small>
        </div>
      </Card.Body>
    </Card>
  );
}
