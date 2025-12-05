// Table utilities for pagination, sorting, and filtering

export function paginateData(data, currentPage, pageSize) {
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  return data.slice(startIndex, endIndex);
}

export function getTotalPages(totalRows, pageSize) {
  return Math.ceil(totalRows / pageSize);
}

export function sortData(data, column, direction) {
  if (!column) return data;
  
  return [...data].sort((a, b) => {
    const aVal = a[column];
    const bVal = b[column];
    
    // Handle null/undefined
    if (aVal == null) return 1;
    if (bVal == null) return -1;
    
    // Numeric comparison
    if (!isNaN(aVal) && !isNaN(bVal)) {
      return direction === 'asc' 
        ? Number(aVal) - Number(bVal)
        : Number(bVal) - Number(aVal);
    }
    
    // String comparison
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (direction === 'asc') {
      return aStr < bStr ? -1 : aStr > bStr ? 1 : 0;
    } else {
      return bStr < aStr ? -1 : bStr > aStr ? 1 : 0;
    }
  });
}

export function filterData(data, filters) {
  if (!filters || Object.keys(filters).length === 0) return data;
  
  return data.filter(row => {
    return Object.entries(filters).every(([column, filterValue]) => {
      if (!filterValue) return true;
      
      const cellValue = String(row[column] || '').toLowerCase();
      const filter = String(filterValue).toLowerCase();
      
      return cellValue.includes(filter);
    });
  });
}

export function getPaginationInfo(currentPage, pageSize, totalRows) {
  const startRow = totalRows === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRow = Math.min(currentPage * pageSize, totalRows);
  
  return {
    startRow,
    endRow,
    totalRows,
    currentPage,
    totalPages: getTotalPages(totalRows, pageSize)
  };
}

export function validatePageNumber(page, totalPages) {
  const pageNum = parseInt(page, 10);
  if (isNaN(pageNum) || pageNum < 1) return 1;
  if (pageNum > totalPages) return totalPages;
  return pageNum;
}
