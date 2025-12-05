'use client';

import { useState, useMemo } from 'react';
import { sortData, filterData, paginateData, getPaginationInfo } from '../lib/tableUtils';
import TablePagination from './TablePagination';
import EditableCell from './EditableCell';
import { Icon } from 'semantic-ui-react';

export default function DataTable({ 
  data, 
  editable = false, 
  onEdit,
  pageSize: initialPageSize = 25,
  columnTypes = {},
  editedCells = new Set()
}) {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortColumn, setSortColumn] = useState(null);
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({});
  
  if (!data || data.length === 0) {
    return (
      <div className="alert alert-info">
        <Icon name="info circle" /> No data to display
      </div>
    );
  }
  
  const columns = Object.keys(data[0]);
  
  // Apply filters and sorting
  const processedData = useMemo(() => {
    let result = data;
    result = filterData(result, filters);
    result = sortData(result, sortColumn, sortDirection);
    return result;
  }, [data, filters, sortColumn, sortDirection]);
  
  // Paginate
  const paginatedData = useMemo(() => {
    return paginateData(processedData, currentPage, pageSize);
  }, [processedData, currentPage, pageSize]);
  
  const paginationInfo = getPaginationInfo(currentPage, pageSize, processedData.length);
  
  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };
  
  const handleFilter = (column, value) => {
    setFilters(prev => ({
      ...prev,
      [column]: value
    }));
    setCurrentPage(1); // Reset to first page when filtering
  };
  
  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
  };
  
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1);
  };
  
  const handleCellEdit = (rowIndex, column, newValue) => {
    if (onEdit) {
      // Get the actual row index in the original data
      const actualRowIndex = (currentPage - 1) * pageSize + rowIndex;
      onEdit(actualRowIndex, column, newValue);
    }
  };
  
  const getCellKey = (rowIndex, column) => {
    const actualRowIndex = (currentPage - 1) * pageSize + rowIndex;
    return `${actualRowIndex}-${column}`;
  };
  
  return (
    <div className="data-table-container">
      <div className="table-controls mb-3">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <label className="me-2">Rows per page:</label>
            <select 
              className="form-select form-select-sm d-inline-block" 
              style={{ width: 'auto' }}
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="text-muted">
            Showing {paginationInfo.startRow}-{paginationInfo.endRow} of {paginationInfo.totalRows} rows
          </div>
        </div>
      </div>
      
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="table-light sticky-top">
            <tr>
              {columns.map(column => (
                <th key={column} className="sortable-header">
                  <div className="d-flex flex-column">
                    <div 
                      className="d-flex align-items-center cursor-pointer"
                      onClick={() => handleSort(column)}
                    >
                      <span className="me-2">{column}</span>
                      {sortColumn === column && (
                        <Icon name={sortDirection === 'asc' ? 'angle up' : 'angle down'} />
                      )}
                      {columnTypes[column] && (
                        <small className="text-muted ms-2">({columnTypes[column].type})</small>
                      )}
                    </div>
                    <input
                      type="text"
                      className="form-control form-control-sm mt-1"
                      placeholder="Filter..."
                      value={filters[column] || ''}
                      onChange={(e) => handleFilter(column, e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {columns.map(column => (
                  <td key={column} className={editedCells.has(getCellKey(rowIndex, column)) ? 'edited-cell' : ''}>
                    {editable ? (
                      <EditableCell
                        value={row[column]}
                        onSave={(newValue) => handleCellEdit(rowIndex, column, newValue)}
                        type={columnTypes[column]?.type}
                      />
                    ) : (
                      <span>{row[column]}</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <TablePagination
        currentPage={currentPage}
        totalPages={paginationInfo.totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
