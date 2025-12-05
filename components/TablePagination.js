'use client';

import { Icon } from 'semantic-ui-react';

export default function TablePagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  
  const handleFirst = () => onPageChange(1);
  const handlePrev = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLast = () => onPageChange(totalPages);
  
  const handleJumpToPage = (e) => {
    e.preventDefault();
    const input = e.target.elements.pageNumber;
    const page = parseInt(input.value, 10);
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      input.value = '';
    }
  };
  
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };
  
  const pageNumbers = getPageNumbers();
  
  return (
    <div className="pagination-container mt-3">
      <nav aria-label="Table pagination">
        <ul className="pagination justify-content-center mb-2">
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={handleFirst} disabled={currentPage === 1}>
              <Icon name="angle double left" />
            </button>
          </li>
          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
            <button className="page-link" onClick={handlePrev} disabled={currentPage === 1}>
              <Icon name="angle left" />
            </button>
          </li>
          
          {pageNumbers.map((page, index) => (
            page === '...' ? (
              <li key={`ellipsis-${index}`} className="page-item disabled">
                <span className="page-link">...</span>
              </li>
            ) : (
              <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                <button 
                  className="page-link" 
                  onClick={() => onPageChange(page)}
                >
                  {page}
                </button>
              </li>
            )
          ))}
          
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={handleNext} disabled={currentPage === totalPages}>
              <Icon name="angle right" />
            </button>
          </li>
          <li className={`page-item ${currentPage === totalPages ? 'disabled' : ''}`}>
            <button className="page-link" onClick={handleLast} disabled={currentPage === totalPages}>
              <Icon name="angle double right" />
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="text-center">
        <form onSubmit={handleJumpToPage} className="d-inline-flex align-items-center gap-2">
          <label className="mb-0">Jump to page:</label>
          <input
            type="number"
            name="pageNumber"
            className="form-control form-control-sm"
            style={{ width: '80px' }}
            min="1"
            max={totalPages}
            placeholder={currentPage.toString()}
          />
          <button type="submit" className="btn btn-sm btn-primary">Go</button>
        </form>
      </div>
    </div>
  );
}
