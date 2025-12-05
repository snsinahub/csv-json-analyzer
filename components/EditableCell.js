'use client';

import { useState, useEffect, useRef } from 'react';
import { validateValue } from '../lib/dataValidation';

export default function EditableCell({ value, onSave, type = 'text' }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value);
  const [error, setError] = useState(null);
  const inputRef = useRef(null);
  
  useEffect(() => {
    setEditValue(value);
  }, [value]);
  
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);
  
  const handleDoubleClick = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    // Validate the value
    const validation = validateValue(editValue, type);
    
    if (!validation.valid) {
      setError(validation.errors[0]);
      return;
    }
    
    setError(null);
    if (editValue !== value) {
      onSave(editValue);
    }
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditValue(value);
    setError(null);
    setIsEditing(false);
  };
  
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };
  
  const handleBlur = () => {
    // Small delay to allow clicking save button
    setTimeout(() => {
      if (isEditing) {
        handleSave();
      }
    }, 150);
  };
  
  if (!isEditing) {
    return (
      <div 
        className="editable-cell-display"
        onDoubleClick={handleDoubleClick}
        title="Double-click to edit"
      >
        {value || <span className="text-muted">(empty)</span>}
      </div>
    );
  }
  
  return (
    <div className="editable-cell-input">
      <input
        ref={inputRef}
        type="text"
        className={`form-control form-control-sm ${error ? 'is-invalid' : ''}`}
        value={editValue || ''}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
      />
      {error && (
        <div className="invalid-feedback d-block">
          {error}
        </div>
      )}
    </div>
  );
}
