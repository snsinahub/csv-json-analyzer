import { useState } from 'react';
import { Icon } from 'semantic-ui-react';

/**
 * JSONViewer Component
 * Displays JSON data with syntax highlighting and interactive features
 */
export default function JSONViewer({ data, onCopy }) {
  const [collapsed, setCollapsed] = useState(new Set());
  const [theme, setTheme] = useState('dark'); // 'dark' or 'light'
  const [searchTerm, setSearchTerm] = useState('');

  // Recursively parse JSON strings within the data
  const deepParseJSON = (obj) => {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === 'string') {
      // Try to parse as JSON
      try {
        const parsed = JSON.parse(obj);
        // If it's an object or array, recursively parse it
        if (typeof parsed === 'object' && parsed !== null) {
          return deepParseJSON(parsed);
        }
        return obj; // Return original string if parsed value is primitive
      } catch {
        return obj; // Not valid JSON, return as-is
      }
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => deepParseJSON(item));
    }
    
    if (typeof obj === 'object') {
      const result = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          result[key] = deepParseJSON(obj[key]);
        }
      }
      return result;
    }
    
    return obj;
  };

  const syntaxHighlight = (json) => {
    if (!json) return '';
    
    // Deep parse any nested JSON strings first
    const parsedJSON = deepParseJSON(json);
    
    const jsonString = JSON.stringify(parsedJSON, null, 2);
    
    // Escape HTML
    const escaped = jsonString.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    
    // Apply syntax highlighting with span tags and CSS classes
    return escaped.replace(
      /("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
      (match) => {
        let cls = 'json-number';
        if (/^"/.test(match)) {
          if (/:$/.test(match)) {
            cls = 'json-key';
          } else {
            cls = 'json-string';
          }
        } else if (/true|false/.test(match)) {
          cls = 'json-boolean';
        } else if (/null/.test(match)) {
          cls = 'json-null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
      }
    );
  };

  const highlightedJSON = syntaxHighlight(data);
  
  // Filter data based on search term
  const getFilteredData = () => {
    if (!searchTerm) return data;
    
    const search = searchTerm.toLowerCase();
    if (Array.isArray(data)) {
      return data.filter(item => 
        JSON.stringify(item).toLowerCase().includes(search)
      );
    }
    return data;
  };

  const filteredData = getFilteredData();
  const displayJSON = searchTerm ? syntaxHighlight(filteredData) : highlightedJSON;

  const handleCopyClick = () => {
    const jsonString = JSON.stringify(searchTerm ? filteredData : data, null, 2);
    navigator.clipboard.writeText(jsonString);
    if (onCopy) onCopy();
  };

  const downloadJSON = () => {
    const jsonString = JSON.stringify(searchTerm ? filteredData : data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="json-viewer-wrapper">
      <div className="json-viewer-controls d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <h5 className="mb-0">
            <Icon name="code" /> JSON Data View
          </h5>
          <span className="badge bg-secondary">
            {Array.isArray(data) ? `${data.length} items` : 'Object'}
          </span>
          {searchTerm && (
            <span className="badge bg-info">
              {Array.isArray(filteredData) ? filteredData.length : 1} filtered
            </span>
          )}
        </div>
        
        <div className="d-flex gap-2 align-items-center flex-wrap">
          <div className="input-group" style={{ width: '250px' }}>
            <span className="input-group-text">
              <Icon name="search" />
            </span>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="Search JSON..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                className="btn btn-sm btn-outline-secondary"
                onClick={() => setSearchTerm('')}
              >
                <Icon name="times" />
              </button>
            )}
          </div>
          
          <div className="btn-group btn-group-sm">
            <button
              className={`btn ${theme === 'dark' ? 'btn-dark' : 'btn-outline-dark'}`}
              onClick={() => setTheme('dark')}
              title="Dark Theme"
            >
              <Icon name="moon" />
            </button>
            <button
              className={`btn ${theme === 'light' ? 'btn-light' : 'btn-outline-light'}`}
              onClick={() => setTheme('light')}
              title="Light Theme"
            >
              <Icon name="sun" />
            </button>
          </div>
          
          <button
            className="btn btn-sm btn-outline-secondary"
            onClick={handleCopyClick}
            title="Copy to clipboard"
          >
            <Icon name="copy" /> Copy
          </button>
          
          <button
            className="btn btn-sm btn-outline-primary"
            onClick={downloadJSON}
            title="Download JSON file"
          >
            <Icon name="download" /> Download
          </button>
        </div>
      </div>
      
      <div className={`json-viewer-content ${theme === 'light' ? 'light-theme' : 'dark-theme'}`}>
        <pre className="json-display">
          <code dangerouslySetInnerHTML={{ __html: displayJSON }} />
        </pre>
      </div>
      
      <div className="json-viewer-footer mt-2">
        <small className="text-muted">
          <Icon name="info circle" /> 
          {' '}Use the search box to filter data • Toggle theme for better visibility
        </small>
      </div>
      
      <style jsx>{`
        .json-viewer-wrapper {
          width: 100%;
        }
        
        .json-viewer-content {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .json-display {
          margin: 0;
          padding: 1.5rem;
          max-height: 600px;
          overflow: auto;
          font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
          font-size: 14px;
          line-height: 1.6;
          border-radius: 8px;
        }
        
        .dark-theme .json-display {
          background-color: #1e1e1e;
          color: #d4d4d4;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.3);
        }
        
        .light-theme .json-display {
          background-color: #f5f5f5;
          color: #333;
          box-shadow: inset 0 2px 8px rgba(0,0,0,0.1);
          border: 1px solid #ddd;
        }
        
        /* Syntax highlighting */
        :global(.json-key) {
          color: #9cdcfe;
        }
        
        :global(.json-string) {
          color: #ce9178;
        }
        
        :global(.json-number) {
          color: #b5cea8;
        }
        
        :global(.json-boolean) {
          color: #569cd6;
        }
        
        :global(.json-null) {
          color: #569cd6;
        }
        
        /* Light theme syntax colors */
        .light-theme :global(.json-key) {
          color: #0451a5;
        }
        
        .light-theme :global(.json-string) {
          color: #a31515;
        }
        
        .light-theme :global(.json-number) {
          color: #098658;
        }
        
        .light-theme :global(.json-boolean) {
          color: #0000ff;
        }
        
        .light-theme :global(.json-null) {
          color: #0000ff;
        }
        
        /* Scrollbar styling */
        .dark-theme .json-display::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .dark-theme .json-display::-webkit-scrollbar-track {
          background: #1e1e1e;
        }
        
        .dark-theme .json-display::-webkit-scrollbar-thumb {
          background: #4a4a4a;
          border-radius: 4px;
        }
        
        .dark-theme .json-display::-webkit-scrollbar-thumb:hover {
          background: #5a5a5a;
        }
        
        .light-theme .json-display::-webkit-scrollbar {
          width: 10px;
          height: 10px;
        }
        
        .light-theme .json-display::-webkit-scrollbar-track {
          background: #f5f5f5;
        }
        
        .light-theme .json-display::-webkit-scrollbar-thumb {
          background: #ccc;
          border-radius: 4px;
        }
        
        .light-theme .json-display::-webkit-scrollbar-thumb:hover {
          background: #aaa;
        }
      `}</style>
    </div>
  );
}
