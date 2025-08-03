let structure = JSON.parse(localStorage.getItem('folderStructure')) || [];
let history = JSON.parse(localStorage.getItem('structureHistory')) || [];

function saveToHistory(struct) {
  const timestamp = new Date().toLocaleString();
  const firstFolder = struct.find(item => item.type === 'folder')?.name || 'Unnamed';
  history.unshift({ 
    name: firstFolder,
    timestamp: timestamp,
    structure: struct 
  });
  // Keep only last 10 histories
  history = history.slice(0, 10);
  localStorage.setItem('structureHistory', JSON.stringify(history));
  updateHistoryList();
}

function renderStructure() {
  const container = document.getElementById('structure');
  container.innerHTML = '';
  if (structure.length === 0) {
    const emptyDiv = document.createElement('div');
    emptyDiv.className = 'empty-structure-message';
    emptyDiv.textContent = 'No folder structure created';
    container.appendChild(emptyDiv);
  } else {
    structure.forEach(item => container.appendChild(createNode(item)));
  }
  saveStructure();
}

function createNode(item, parent) {
  const div = document.createElement('div');
  div.className = item.type;
  div.setAttribute('data-name', item.name);
  
  const itemContent = document.createElement('div');
  itemContent.className = 'item-content';
  // Add icon element (Bootstrap Icon)
  const icon = document.createElement('i');
  if (item.type === 'folder') {
    icon.className = 'bi bi-folder-fill folder-icon';
  } else {
    icon.className = 'bi bi-file-earmark-fill file-icon';
  }
  itemContent.appendChild(icon);

  let toggleBtn = null;
  if (item.type === 'folder') {
    toggleBtn = document.createElement('button');
    toggleBtn.className = 'btn btn-sm btn-toggle';
    toggleBtn.innerHTML = '<i class="bi bi-caret-down-fill"></i>';
    toggleBtn.onclick = e => {
      e.stopPropagation();
      const isExpanded = toggleBtn.querySelector('i').classList.contains('bi-caret-down-fill');
      toggleBtn.innerHTML = isExpanded ? 
        '<i class="bi bi-caret-right-fill"></i>' : 
        '<i class="bi bi-caret-down-fill"></i>';
      // Toggle visibility of children
      const children = div.querySelectorAll(':scope > .folder, :scope > .file');
      children.forEach(child => {
        child.style.display = isExpanded ? 'none' : 'block';
      });
      // Add rotation animation class
      toggleBtn.querySelector('i').classList.add('rotate-icon');
      setTimeout(() => {
        toggleBtn.querySelector('i').classList.remove('rotate-icon');
      }, 200);
    };
  }
  
  // Insert toggleBtn to the left of the icon
  if (item.type === 'folder' && toggleBtn) {
    itemContent.insertBefore(toggleBtn, itemContent.firstChild);
  }
  const nameSpan = document.createElement('span');
  nameSpan.textContent = item.name;
  itemContent.appendChild(nameSpan);
  
  const moreButton = document.createElement('button');
  moreButton.className = 'btn btn-sm btn-more';
  moreButton.innerHTML = '<i class="bi bi-three-dots-vertical"></i>';
  
  const actionsDiv = document.createElement('div');
  actionsDiv.className = 'actions dropdown-menu';
  actionsDiv.style.display = 'none';
  
  // Only add file/folder buttons if this is a folder
  if (item.type === 'folder') {
    const addFileBtn = document.createElement('button');
    addFileBtn.className = 'btn btn-sm btn-outline-primary btn-add-file';
    addFileBtn.innerHTML = '<i class="bi bi-file-earmark-plus"></i><span>Add File</span>';
    addFileBtn.onclick = e => {
      e.stopPropagation();
      showNameInput(item, 'file');
    };
    
    const addFolderBtn = document.createElement('button');
    addFolderBtn.className = 'btn btn-sm btn-outline-success btn-add-folder';
    addFolderBtn.innerHTML = '<i class="bi bi-folder-plus"></i><span>Add Folder</span>';
    addFolderBtn.onclick = e => {
      e.stopPropagation();
      showNameInput(item, 'folder');
    };
    
    actionsDiv.appendChild(addFileBtn);
    actionsDiv.appendChild(addFolderBtn);
  }
  
  const renameBtn = document.createElement('button');
  renameBtn.className = 'btn btn-sm btn-outline-secondary btn-rename';
  renameBtn.innerHTML = '<i class="bi bi-pencil"></i><span>Rename</span>';
  renameBtn.onclick = e => {
    e.stopPropagation();
    const input = document.createElement('input');
    input.type = 'text';
    input.value = item.name;
    input.className = 'name-input';
    nameSpan.replaceWith(input);
    input.focus();
    
    input.onblur = () => {
      item.name = input.value || item.name;
      input.replaceWith(nameSpan);
      nameSpan.textContent = item.name;
      renderStructure();
    };
    
    input.onkeypress = e => {
      if (e.key === 'Enter') input.blur();
    };
  };
  
  const deleteBtn = document.createElement('button');
  deleteBtn.className = 'btn btn-sm btn-outline-danger btn-delete';
  deleteBtn.innerHTML = '<i class="bi bi-trash"></i><span>Delete</span>';
  deleteBtn.onclick = e => {
    e.stopPropagation();
    if (parent) parent.children = parent.children.filter(child => child !== item);
    else structure = structure.filter(root => root !== item);
    renderStructure();
  };
  
  actionsDiv.appendChild(renameBtn);
  actionsDiv.appendChild(deleteBtn);
  
  const actionsWrapper = document.createElement('div');
  actionsWrapper.className = 'actions-wrapper';
  actionsWrapper.appendChild(moreButton);
  actionsWrapper.appendChild(actionsDiv);
  itemContent.appendChild(actionsWrapper);
  div.appendChild(itemContent);
  
  // Close dropdown when clicking outside
  document.addEventListener('click', () => {
    actionsDiv.style.display = 'none';
  });
  
  // Handle more button click
  moreButton.onclick = e => {
    e.stopPropagation();
    const wasVisible = actionsDiv.style.display === 'block';
    document.querySelectorAll('.actions').forEach(el => el.style.display = 'none');
    actionsDiv.style.display = wasVisible ? 'none' : 'block';
    if (!wasVisible) {
      // Default: open to right
      actionsDiv.style.top = '0';
      actionsDiv.style.left = '100%';
      actionsDiv.style.right = '';
      actionsDiv.style.transform = 'translateX(8px)';
      // Check if it overflows the popup
      setTimeout(() => {
        const popupRect = document.body.getBoundingClientRect();
        const actionsRect = actionsDiv.getBoundingClientRect();
        if (actionsRect.right > popupRect.right) {
          // Open to left
          actionsDiv.style.left = '';
          actionsDiv.style.right = '100%';
          actionsDiv.style.transform = 'translateX(-8px)';
        }
      }, 0);
    }
  };

  if (item.children) {
    item.children.forEach(child => div.appendChild(createNode(child, item)));
  }

  return div;
}

function showNameInput(parent, type) {
  const input = document.createElement('input');
  input.type = 'text';
  input.className = 'name-input';
  input.placeholder = type === 'file' ? 'File name' : 'Folder name';
  
  const inputContainer = document.createElement('div');
  inputContainer.className = type;
  inputContainer.style.marginLeft = '20px';
  inputContainer.appendChild(input);
  
  input.onblur = () => {
    if (input.value) {
      const newItem = { 
        type: type, 
        name: input.value,
        children: type === 'folder' ? [] : undefined 
      };
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(newItem);
      } else {
        structure.push(newItem);
      }
      renderStructure();
    }
    inputContainer.remove();
  };
  
  input.onkeypress = e => {
    if (e.key === 'Enter') input.blur();
  };
  
  const container = parent ? 
    document.querySelector(`[data-name="${parent.name}"]`) : 
    document.getElementById('structure');
  
  if (container) {
    container.appendChild(inputContainer);
    input.focus();
  }
}

function addFolder() {
  showNameInput(null, 'folder');
}

function saveStructure() {
  localStorage.setItem('folderStructure', JSON.stringify(structure));
}

function downloadImage() {
  const node = document.getElementById('structure');
  htmlToImage.toPng(node)
    .then(dataUrl => {
      const link = document.createElement('a');
      link.download = 'folder-structure.png';
      link.href = dataUrl;
      link.click();
    })
    .catch(err => console.error('Download failed', err));
}

function clearAll() {
  if (structure.length > 0) {
    saveToHistory([...structure]);
  }
  structure = [];
  localStorage.removeItem('folderStructure');
  renderStructure();
}

function showHistory() {
  window.location.href = 'history.html';
}

function loadFromHistory(index) {
  if (history[index]) {
    structure = [...history[index].structure];
    localStorage.setItem('folderStructure', JSON.stringify(structure));
    renderStructure();
  }
}

function updateHistoryList() {
  const historyList = document.getElementById('historyList');
  if (!historyList) return;
  
  historyList.innerHTML = '';
  if (history.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'history-item empty';
    emptyItem.textContent = 'No history available';
    historyList.appendChild(emptyItem);
    return;
  }

  history.forEach((item, index) => {
    const historyItem = document.createElement('button');
    historyItem.className = 'history-item';
    historyItem.innerHTML = `
      <div class="history-name">${item.name}</div>
      <div class="history-time">${item.timestamp}</div>
    `;
    historyItem.onclick = () => {
      loadFromHistory(index);
      showHistory(); // Hide dropdown after loading
    };
    historyList.appendChild(historyItem);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  renderStructure();
  updateHistoryList();
  const addFolderBtn = document.getElementById('addFolderBtn');
  if (addFolderBtn) addFolderBtn.addEventListener('click', addFolder);
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  if (downloadImageBtn) downloadImageBtn.addEventListener('click', downloadImage);
  const clearAllBtn = document.getElementById('clearAllBtn');
  if (clearAllBtn) clearAllBtn.addEventListener('click', clearAll);
  const showHistoryBtn = document.getElementById('showHistoryBtn');
  if (showHistoryBtn) showHistoryBtn.addEventListener('click', showHistory);
});