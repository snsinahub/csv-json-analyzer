'use client';

import { useState } from 'react';
import Papa from 'papaparse';
import { Icon } from 'semantic-ui-react';
import { Toaster, toast } from 'react-hot-toast';
import { Container } from 'react-bootstrap';
import Navigation from '../../components/Navigation';
import DataTable from '../../components/DataTable';
import ExportModal from '../../components/ExportModal';
import { inferColumnTypes } from '../../lib/dataValidation';
import { downloadCSV, getExportFilename } from '../../lib/exportUtils';
import { EditHistory, createCellEdit, applyEdit, reverseEdit, getEditedCells } from '../../lib/editHistory';

export default function TableViewPage() {
  const [csvData, setCsvData] = useState(null);
  const [fileName, setFileName] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [columnTypes, setColumnTypes] = useState({});
  const [editHistory] = useState(() => new EditHistory());
  const [editedCells, setEditedCells] = useState(new Set());
  const [dragActive, setDragActive] = useState(false);
  
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
    
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    
    setFileName(file.name);
    
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
    } else {
      toast.error(`Save failed: ${result.error}`);
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
            View, edit, and export CSV data in a tabular format
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
                <h3>Upload CSV File</h3>
                <p className="text-muted">
                  Drag and drop a CSV file here, or click to browse
                </p>
                <label className="btn btn-primary btn-lg">
                  <Icon name="file" /> Choose CSV File
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
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="card">
            <div className="card-body">
              <DataTable 
                data={csvData}
                editable={editMode}
                onEdit={handleCellEdit}
                columnTypes={columnTypes}
                editedCells={editedCells}
              />
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
      
      <footer className="bg-dark text-white text-center py-4 mt-5">
        <Container>
          <p className="mb-0">CSV Analyzer &copy; 2025 | Built with Next.js, React, Bootstrap & Semantic UI</p>
        </Container>
      </footer>
    </>
  );
}
