'use client';

import { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import ColumnConfig from './ColumnConfig';

export default function SchemaBuilder({ schema, onSchemaChange, onGenerate }) {
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(null);
  const [schemaName, setSchemaName] = useState(schema?.name || 'Custom Schema');
  
  const columns = schema?.columns || [];
  
  const handleAddColumn = () => {
    const newColumn = {
      name: `column_${columns.length + 1}`,
      type: 'text',
      config: {}
    };
    
    const updatedSchema = {
      ...schema,
      name: schemaName,
      columns: [...columns, newColumn]
    };
    
    onSchemaChange(updatedSchema);
    setSelectedColumnIndex(columns.length);
  };
  
  const handleRemoveColumn = (index) => {
    const updatedColumns = columns.filter((_, i) => i !== index);
    const updatedSchema = {
      ...schema,
      name: schemaName,
      columns: updatedColumns
    };
    
    onSchemaChange(updatedSchema);
    
    if (selectedColumnIndex === index) {
      setSelectedColumnIndex(null);
    } else if (selectedColumnIndex > index) {
      setSelectedColumnIndex(selectedColumnIndex - 1);
    }
  };
  
  const handleUpdateColumn = (index, updatedColumn) => {
    const updatedColumns = [...columns];
    updatedColumns[index] = updatedColumn;
    
    const updatedSchema = {
      ...schema,
      name: schemaName,
      columns: updatedColumns
    };
    
    onSchemaChange(updatedSchema);
  };
  
  const handleMoveColumn = (index, direction) => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === columns.length - 1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    const updatedColumns = [...columns];
    [updatedColumns[index], updatedColumns[newIndex]] = [updatedColumns[newIndex], updatedColumns[index]];
    
    const updatedSchema = {
      ...schema,
      name: schemaName,
      columns: updatedColumns
    };
    
    onSchemaChange(updatedSchema);
    setSelectedColumnIndex(newIndex);
  };
  
  const getTypeIcon = (type) => {
    const iconMap = {
      sequential: 'sort numeric up',
      text: 'font',
      firstName: 'user',
      lastName: 'user',
      fullName: 'user',
      email: 'mail',
      phone: 'phone',
      company: 'building',
      jobTitle: 'briefcase',
      address: 'map marker alternate',
      city: 'map marker',
      state: 'map',
      country: 'globe',
      zipCode: 'map pin',
      integer: 'hashtag',
      decimal: 'percent',
      currency: 'dollar sign',
      percentage: 'percent',
      date: 'calendar',
      datetime: 'clock',
      boolean: 'toggle on',
      category: 'tags',
      status: 'flag',
      uuid: 'key',
      url: 'linkify',
      product: 'shopping bag',
      price: 'dollar',
      sku: 'barcode'
    };
    
    return iconMap[type] || 'file';
  };
  
  return (
    <div className="schema-builder">
      <div className="row">
        <div className="col-md-5">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <Icon name="list" /> Schema Columns
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Schema Name</label>
                <input
                  type="text"
                  className="form-control"
                  value={schemaName}
                  onChange={(e) => setSchemaName(e.target.value)}
                />
              </div>
              
              <div className="column-list" style={{ maxHeight: '500px', overflow: 'auto' }}>
                {columns.length === 0 ? (
                  <div className="text-center text-muted py-4">
                    <Icon name="inbox" size="huge" />
                    <p>No columns yet. Click "Add Column" to start.</p>
                  </div>
                ) : (
                  columns.map((column, index) => (
                    <div
                      key={index}
                      className={`column-item p-2 mb-2 border rounded ${selectedColumnIndex === index ? 'border-primary bg-light' : ''}`}
                      onClick={() => setSelectedColumnIndex(index)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-start">
                        <div className="flex-grow-1">
                          <div className="d-flex align-items-center">
                            <Icon name={getTypeIcon(column.type)} className="me-2" />
                            <strong>{column.name}</strong>
                          </div>
                          <div className="text-muted small">
                            Type: {column.type}
                          </div>
                        </div>
                        <div className="btn-group btn-group-sm">
                          <button
                            className="btn btn-outline-secondary"
                            onClick={(e) => { e.stopPropagation(); handleMoveColumn(index, 'up'); }}
                            disabled={index === 0}
                            title="Move up"
                          >
                            <Icon name="angle up" />
                          </button>
                          <button
                            className="btn btn-outline-secondary"
                            onClick={(e) => { e.stopPropagation(); handleMoveColumn(index, 'down'); }}
                            disabled={index === columns.length - 1}
                            title="Move down"
                          >
                            <Icon name="angle down" />
                          </button>
                          <button
                            className="btn btn-outline-danger"
                            onClick={(e) => { e.stopPropagation(); handleRemoveColumn(index); }}
                            title="Remove column"
                          >
                            <Icon name="trash" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              
              <button 
                className="btn btn-primary w-100 mt-3"
                onClick={handleAddColumn}
              >
                <Icon name="plus" /> Add Column
              </button>
            </div>
          </div>
        </div>
        
        <div className="col-md-7">
          {selectedColumnIndex !== null && columns[selectedColumnIndex] ? (
            <ColumnConfig
              column={columns[selectedColumnIndex]}
              onUpdate={(updatedColumn) => handleUpdateColumn(selectedColumnIndex, updatedColumn)}
            />
          ) : (
            <div className="card">
              <div className="card-body text-center text-muted py-5">
                <Icon name="hand point left" size="huge" />
                <p className="mt-3">Select a column to configure its properties</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
