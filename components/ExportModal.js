'use client';

import { useState } from 'react';
import { Modal } from 'react-bootstrap';
import { Icon } from 'semantic-ui-react';
import { downloadJSON, copyToClipboard } from '../lib/exportUtils';
import toast from 'react-hot-toast';

export default function ExportModal({ show, onClose, data, filename }) {
  const [structure, setStructure] = useState('array');
  const [includeMetadata, setIncludeMetadata] = useState(false);
  const [pretty, setPretty] = useState(true);
  const [exportType, setExportType] = useState('all'); // 'all' or 'visible'
  
  const handleDownload = () => {
    const options = { structure, includeMetadata, pretty };
    const result = downloadJSON(data, filename, options);
    
    if (result.success) {
      toast.success('JSON file downloaded successfully!');
      onClose();
    } else {
      toast.error(`Export failed: ${result.error}`);
    }
  };
  
  const handleCopyToClipboard = () => {
    const options = { structure, includeMetadata, pretty };
    const result = copyToClipboard(data, options);
    
    if (result.success) {
      toast.success('JSON copied to clipboard!');
    } else {
      toast.error(`Copy failed: ${result.error}`);
    }
  };
  
  const getPreview = () => {
    const options = { structure, includeMetadata, pretty };
    const preview = require('../lib/exportUtils').convertToJSON(data.slice(0, 2), options);
    return preview.split('\n').slice(0, 15).join('\n') + '\n...';
  };
  
  return (
    <Modal show={show} onHide={onClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>
          <Icon name="download" /> Export to JSON
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <label className="form-label">Structure</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="structure"
              id="structureArray"
              value="array"
              checked={structure === 'array'}
              onChange={(e) => setStructure(e.target.value)}
            />
            <label className="form-check-label" htmlFor="structureArray">
              Array of objects <code>[{'{...}'}, {'{...}'}]</code>
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="radio"
              name="structure"
              id="structureObject"
              value="object"
              checked={structure === 'object'}
              onChange={(e) => setStructure(e.target.value)}
            />
            <label className="form-check-label" htmlFor="structureObject">
              Object with data array <code>{'{data: [...]}'}</code>
            </label>
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Formatting</label>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="prettyPrint"
              checked={pretty}
              onChange={(e) => setPretty(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="prettyPrint">
              Pretty-print (indented)
            </label>
          </div>
          <div className="form-check">
            <input
              className="form-check-input"
              type="checkbox"
              id="includeMetadata"
              checked={includeMetadata}
              onChange={(e) => setIncludeMetadata(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="includeMetadata">
              Include metadata (row count, export date)
            </label>
          </div>
        </div>
        
        <div className="mb-3">
          <label className="form-label">Preview (first 2 rows)</label>
          <pre className="bg-light p-3 rounded" style={{ maxHeight: '300px', overflow: 'auto' }}>
            <code>{getPreview()}</code>
          </pre>
        </div>
        
        <div className="alert alert-info">
          <Icon name="info circle" />
          Exporting {data.length} row{data.length !== 1 ? 's' : ''}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-secondary" onClick={onClose}>
          Cancel
        </button>
        <button className="btn btn-outline-primary" onClick={handleCopyToClipboard}>
          <Icon name="copy" /> Copy to Clipboard
        </button>
        <button className="btn btn-primary" onClick={handleDownload}>
          <Icon name="download" /> Download JSON
        </button>
      </Modal.Footer>
    </Modal>
  );
}
