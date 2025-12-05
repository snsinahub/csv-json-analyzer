// Edit history management for undo/redo functionality

export class EditHistory {
  constructor(maxHistorySize = 50) {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = maxHistorySize;
  }
  
  addEdit(edit) {
    // Remove any history after current index (if we've undone some changes)
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new edit
    this.history.push({
      ...edit,
      timestamp: Date.now()
    });
    
    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }
  
  undo() {
    if (!this.canUndo()) return null;
    
    const edit = this.history[this.currentIndex];
    this.currentIndex--;
    return edit;
  }
  
  redo() {
    if (!this.canRedo()) return null;
    
    this.currentIndex++;
    return this.history[this.currentIndex];
  }
  
  canUndo() {
    return this.currentIndex >= 0;
  }
  
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }
  
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
  
  getHistory() {
    return this.history.slice(0, this.currentIndex + 1);
  }
  
  getEditCount() {
    return this.currentIndex + 1;
  }
}

export function createCellEdit(rowIndex, column, oldValue, newValue) {
  return {
    type: 'cell',
    rowIndex,
    column,
    oldValue,
    newValue
  };
}

export function createRowAddEdit(rowIndex, rowData) {
  return {
    type: 'row-add',
    rowIndex,
    rowData
  };
}

export function createRowDeleteEdit(rowIndex, rowData) {
  return {
    type: 'row-delete',
    rowIndex,
    rowData
  };
}

export function applyEdit(data, edit) {
  const newData = [...data];
  
  switch (edit.type) {
    case 'cell':
      if (newData[edit.rowIndex]) {
        newData[edit.rowIndex] = {
          ...newData[edit.rowIndex],
          [edit.column]: edit.newValue
        };
      }
      break;
      
    case 'row-add':
      newData.splice(edit.rowIndex, 0, edit.rowData);
      break;
      
    case 'row-delete':
      newData.splice(edit.rowIndex, 1);
      break;
  }
  
  return newData;
}

export function reverseEdit(data, edit) {
  const newData = [...data];
  
  switch (edit.type) {
    case 'cell':
      if (newData[edit.rowIndex]) {
        newData[edit.rowIndex] = {
          ...newData[edit.rowIndex],
          [edit.column]: edit.oldValue
        };
      }
      break;
      
    case 'row-add':
      newData.splice(edit.rowIndex, 1);
      break;
      
    case 'row-delete':
      newData.splice(edit.rowIndex, 0, edit.rowData);
      break;
  }
  
  return newData;
}

export function getEditedCells(history) {
  const edited = new Set();
  
  history.forEach(edit => {
    if (edit.type === 'cell') {
      edited.add(`${edit.rowIndex}-${edit.column}`);
    }
  });
  
  return edited;
}
