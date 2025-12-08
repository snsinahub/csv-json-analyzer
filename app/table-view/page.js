'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Icon } from 'semantic-ui-react';
import { Toaster, toast } from 'react-hot-toast';
import { Container } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import DataTable from '../../components/DataTable';
import ExportModal from '../../components/ExportModal';
import JSONViewer from '../../components/JSONViewer';
import { inferColumnTypes } from '../../lib/dataValidation';
import { downloadCSV, getExportFilename } from '../../lib/exportUtils';
import { EditHistory, createCellEdit, applyEdit, reverseEdit, getEditedCells } from '../../lib/editHistory';
import { storeGeneratedData, storeAnalysisLog, storeFileMetadata } from '../../lib/duckdbLogger';

export default function TableViewPage() {
  const [csvData, setCsvData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [columnTypes, setColumnTypes] = useState({});
  const [editHistory] = useState(() => new EditHistory());
  const [editedCells, setEditedCells] = useState(new Set());
  const [dragActive, setDragActive] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'json'
  
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };
  
  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };
  
  const handleFile = (file) => {
    if (!file) return;
    
    const isJSON = file.name.endsWith('.json') || file.type === 'application/json';
    const isCSV = file.name.endsWith('.csv') || file.type === 'text/csv';
    
    if (!isJSON && !isCSV) {
      toast.error('Please upload a CSV or JSON file');
      return;
    }
    
    setFileName(file.name);
    
    if (isJSON) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const jsonData = JSON.parse(e.target.result);
          
          // Normalize JSON to array format
          let normalizedData;
          if (Array.isArray(jsonData)) {
            normalizedData = jsonData;
          } else if (typeof jsonData === 'object' && jsonData !== null) {
            if (jsonData.data && Array.isArray(jsonData.data)) {
              normalizedData = jsonData.data;
            } else {
              normalizedData = [jsonData];
            }
          } else {
            normalizedData = [];
          }

          if (normalizedData.length === 0) {
            toast.error('No data found in JSON file');
            return;
          }

          // Flatten nested JSON for table display
          const flattenedData = normalizedData.map(item => {
            const flatten = (obj, prefix = '') => {
              const flattened = {};
              for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                  const value = obj[key];
                  const newKey = prefix ? `${prefix}.${key}` : key;
                  
                  if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
                    Object.assign(flattened, flatten(value, newKey));
                  } else if (Array.isArray(value)) {
                    flattened[newKey] = JSON.stringify(value);
                  } else {
                    flattened[newKey] = value;
                  }
                }
              }
              return flattened;
            };
            return flatten(item);
          });

          setCsvData(flattenedData);
          const types = inferColumnTypes(flattenedData);
          setColumnTypes(types);
          editHistory.clear();
          setEditedCells(new Set());
          toast.success(`Loaded ${flattenedData.length} rows from ${file.name}`);
        } catch (error) {
          toast.error(`Error parsing JSON: ${error.message}`);
        }
      };
      reader.onerror = () => {
        toast.error('Error reading JSON file');
      };
      reader.readAsText(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (result) => {
          if (result.data && result.data.length > 0) {
            setCsvData(result.data);
            const types = inferColumnTypes(result.data);
            setColumnTypes(types);
            editHistory.clear();
            setEditedCells(new Set());
            toast.success(`Loaded ${result.data.length} rows from ${file.name}`);
          } else {
            toast.error('No data found in CSV file');
          }
        },
        error: (error) => {
          toast.error(`Error parsing CSV: ${error.message}`);
        }
      });
    }
  };
  
  const handleCellEdit = (rowIndex, column, newValue) => {
    const oldValue = csvData[rowIndex][column];
    
    if (oldValue === newValue) return;
    
    const edit = createCellEdit(rowIndex, column, oldValue, newValue);
    editHistory.addEdit(edit);
    
    const updatedData = applyEdit(csvData, edit);
    setCsvData(updatedData);
    
    // Update edited cells visualization
    const edited = getEditedCells(editHistory.getHistory());
    setEditedCells(edited);
    
    toast.success('Cell updated');
  };
  
  const handleUndo = () => {
    if (!editHistory.canUndo()) {
      toast.error('Nothing to undo');
      return;
    }
    
    const edit = editHistory.undo();
    const updatedData = reverseEdit(csvData, edit);
    setCsvData(updatedData);
    
    const edited = getEditedCells(editHistory.getHistory());
    setEditedCells(edited);
    
    toast.success('Undone');
  };
  
  const handleRedo = () => {
    if (!editHistory.canRedo()) {
      toast.error('Nothing to redo');
      return;
    }
    
    const edit = editHistory.redo();
    const updatedData = applyEdit(csvData, edit);
    setCsvData(updatedData);
    
    const edited = getEditedCells(editHistory.getHistory());
    setEditedCells(edited);
    
    toast.success('Redone');
  };
  
  const handleAddRow = () => {
    if (!csvData || csvData.length === 0) return;
    
    const newRow = {};
    Object.keys(csvData[0]).forEach(key => {
      newRow[key] = '';
    });
    
    setCsvData([...csvData, newRow]);
    toast.success('Row added');
  };
  
  const handleSaveChanges = () => {
    const filename = getExportFilename(fileName, '_edited', 'csv');
    const result = downloadCSV(csvData, filename);
    
    if (result.success) {
      toast.success('Changes saved!');
      editHistory.clear();
      setEditedCells(new Set());
      
      // Log the edit operation
      storeAnalysisLog({
        type: 'file_edit',
        page: 'table-view',
        filename: fileName,
        rowCount: csvData.length,
        columnCount: Object.keys(csvData[0] || {}).length,
        status: 'success',
        metadata: { 
          editsCount: editHistory.getEditCount(),
          editMode: editMode
        }
      });
    } else {
      toast.error(`Save failed: ${result.error}`);
    }
  };

  const handleSaveToDuckDB = async () => {
    if (!csvData || csvData.length === 0) {
      toast.error('No data to save');
      return;
    }

    try {
      const tableName = fileName.replace(/\.(csv|json)$/, '').toLowerCase().replace(/\s+/g, '_');
      const result = await storeGeneratedData(csvData, tableName, 'table-view');
      
      if (result.success) {
        toast.success(`Saved ${result.stats.rowCount} rows to DuckDB table: ${result.stats.tableName}`);
        
        // Store file metadata
        await storeFileMetadata({
          filename: fileName,
          fileType: fileName.endsWith('.json') ? 'json' : 'csv',
          fileSize: 0,
          rowCount: csvData.length,
          columnCount: Object.keys(csvData[0] || {}).length,
          source: 'table-view',
          columns: Object.keys(csvData[0] || {})
        });
      } else {
        toast.error(`Failed to save to DuckDB: ${result.error}`);
      }
    } catch (error) {
      toast.error(`Failed to save to DuckDB: ${error.message}`);
    }
  };
  
  const handleDiscardChanges = () => {
    if (editHistory.getEditCount() === 0) {
      toast.error('No changes to discard');
      return;
    }
    
    // Reverse all edits
    let data = csvData;
    while (editHistory.canUndo()) {
      const edit = editHistory.undo();
      data = reverseEdit(data, edit);
    }
    
    setCsvData(data);
    editHistory.clear();
    setEditedCells(new Set());
    toast.success('Changes discarded');
  };
  
  return (
    <>
      <Navigation />
      <Container fluid className="mt-4">
        <Toaster position="top-right" />
      
      <div className="row mb-4">
        <div className="col">
          <h1 className="display-6">
            <Icon name="table" /> Table View
          </h1>
          <p className="text-muted">
            View, edit, and export CSV or JSON data in a tabular format
          </p>
        </div>
      </div>
      
      {!csvData ? (
        <div className="row">
          <div className="col-md-8 offset-md-2">
            <div 
              className={`card upload-zone ${dragActive ? 'dragover' : ''}`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="card-body text-center py-5">
                <Icon name="upload" size="huge" className="text-primary mb-3" />
                <h3>Upload CSV or JSON File</h3>
                <p className="text-muted">
                  Drag and drop a CSV or JSON file here, or click to browse
                </p>
                <label className="btn btn-primary btn-lg">
                  <Icon name="file" /> Choose File
                  <input
                    type="file"
                    accept=".csv,.json"
                    onChange={handleFileUpload}
                    style={{ display: 'none' }}
                  />
                </label>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="card mb-3">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h5 className="mb-1">
                    <Icon name="file" /> {fileName}
                  </h5>
                  <small className="text-muted">
                    {csvData.length} rows × {Object.keys(csvData[0]).length} columns
                  </small>
                </div>
                
                <div className="d-flex gap-2 flex-wrap">
                  <div className="btn-group" role="group">
                    <button 
                      className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('table')}
                    >
                      <Icon name="table" /> Table View
                    </button>
                    <button 
                      className={`btn ${viewMode === 'json' ? 'btn-primary' : 'btn-outline-primary'}`}
                      onClick={() => setViewMode('json')}
                    >
                      <Icon name="code" /> JSON View
                    </button>
                  </div>
                  
                  <div className="btn-group" role="group">
                  <button 
                    className={`btn ${editMode ? 'btn-warning' : 'btn-outline-secondary'}`}
                    onClick={() => setEditMode(!editMode)}
                  >
                    <Icon name={editMode ? 'lock open' : 'lock'} />
                    Edit Mode: {editMode ? 'ON' : 'OFF'}
                  </button>
                  <button 
                    className="btn btn-outline-success"
                    onClick={() => {
                      const filename = getExportFilename(fileName, '', 'csv');
                      const result = downloadCSV(csvData, filename);
                      if (result.success) {
                        toast.success('CSV exported successfully!');
                      } else {
                        toast.error(`Export failed: ${result.error}`);
                      }
                    }}
                  >
                    <Icon name="download" /> Export CSV
                  </button>
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => setShowExportModal(true)}
                  >
                    <Icon name="download" /> Export JSON
                  </button>
                  <label className="btn btn-outline-secondary mb-0">
                    <Icon name="upload" /> Load Different File
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
                </div>
              </div>
              
              {editMode && (
                <div className="mt-3 pt-3 border-top">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    <div>
                      <span className="badge bg-info me-2">
                        {editHistory.getEditCount()} edit{editHistory.getEditCount() !== 1 ? 's' : ''}
                      </span>
                      <small className="text-muted">
                        Double-click cells to edit
                      </small>
                    </div>
                    
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handleUndo}
                        disabled={!editHistory.canUndo()}
                      >
                        <Icon name="undo" /> Undo
                      </button>
                      <button 
                        className="btn btn-outline-secondary"
                        onClick={handleRedo}
                        disabled={!editHistory.canRedo()}
                      >
                        <Icon name="redo" /> Redo
                      </button>
                      <button 
                        className="btn btn-outline-primary"
                        onClick={handleAddRow}
                      >
                        <Icon name="plus" /> Add Row
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={handleDiscardChanges}
                        disabled={editHistory.getEditCount() === 0}
                      >
                        <Icon name="times" /> Discard Changes
                      </button>
                      <button 
                        className="btn btn-success"
                        onClick={handleSaveChanges}
                        disabled={editHistory.getEditCount() === 0}
                      >
                        <Icon name="save" /> Save Changes
                      </button>
                      <button 
                        className="btn btn-info"
                        onClick={handleSaveToDuckDB}
                        disabled={!csvData || csvData.length === 0}
                      >
                        <Icon name="database" /> Save to DuckDB
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              {viewMode === 'table' ? (
                <DataTable 
                  data={csvData}
                  editable={editMode}
                  onEdit={handleCellEdit}
                  columnTypes={columnTypes}
                  editedCells={editedCells}
                />
              ) : (
                <JSONViewer 
                  data={csvData}
                  onCopy={() => toast.success('JSON copied to clipboard!')}
                />
              )}
            </div>
          </div>
        </>
      )}
      
      {showExportModal && csvData && (
        <ExportModal
          show={showExportModal}
          onClose={() => setShowExportModal(false)}
          data={csvData}
          filename={getExportFilename(fileName, '', 'json')}
        />
      )}
      </Container>
    </>
  );
}
