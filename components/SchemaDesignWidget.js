'use client';

import { useState } from 'react';
import { Icon } from 'semantic-ui-react';
import { toast } from 'react-hot-toast';
import SchemaBuilder from './SchemaBuilder';

export default function SchemaDesignWidget({ 
  schema, 
  onSchemaChange, 
  showSaveButton = true,
  onSave = null 
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleSaveSchema = () => {
    if (schema.columns.length === 0) {
      toast.error('Cannot save empty schema');
      return;
    }
    
    if (!schema.name || schema.name.trim() === '') {
      toast.error('Please provide a schema name');
      return;
    }
    
    try {
      // Load existing custom schemas
      const saved = localStorage.getItem('customSchemas');
      let customSchemas = [];
      if (saved) {
        customSchemas = JSON.parse(saved);
      }
      
      // Check if schema with same name exists
      const existingIndex = customSchemas.findIndex(s => s.name === schema.name);
      if (existingIndex >= 0) {
        if (!confirm(`Schema "${schema.name}" already exists. Overwrite?`)) {
          return;
        }
        customSchemas[existingIndex] = schema;
      } else {
        customSchemas.push(schema);
      }
      
      // Save to localStorage
      localStorage.setItem('customSchemas', JSON.stringify(customSchemas));
      toast.success(`Schema "${schema.name}" saved!`);
      
      // Call parent save callback if provided
      if (onSave) {
        onSave(schema);
      }
    } catch (error) {
      toast.error(`Failed to save schema: ${error.message}`);
    }
  };

  return (
    <div className="card mb-4">
      <div 
        className="card-header bg-info text-white d-flex justify-content-between align-items-center"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h5 className="mb-0">
          <Icon name="cog" /> Schema Designer
        </h5>
        <div className="d-flex align-items-center gap-2">
          {showSaveButton && (
            <button 
              className="btn btn-success btn-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleSaveSchema();
              }}
              disabled={schema.columns.length === 0}
            >
              <Icon name="save" /> Save Schema
            </button>
          )}
          <Icon name={isExpanded ? 'chevron up' : 'chevron down'} />
        </div>
      </div>
      
      {isExpanded && (
        <div className="card-body">
          <div className="mb-3">
            <label className="form-label">Schema Name</label>
            <input
              type="text"
              className="form-control"
              value={schema.name || ''}
              onChange={(e) => onSchemaChange({ ...schema, name: e.target.value })}
              placeholder="Enter schema name..."
            />
          </div>
          
          <SchemaBuilder schema={schema} onChange={onSchemaChange} />
          
          {schema.columns.length === 0 && (
            <div className="alert alert-info mt-3">
              <Icon name="info circle" /> Click "Add Column" to start building your schema.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
