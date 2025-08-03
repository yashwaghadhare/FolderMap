function updateHistoryList() {
  const historyList = document.getElementById('historyList');
  const history = JSON.parse(localStorage.getItem('structureHistory')) || [];

  historyList.innerHTML = '';
  if (history.length === 0) {
    const emptyItem = document.createElement('div');
    emptyItem.className = 'history-item empty';
    emptyItem.textContent = 'No history available';
    historyList.appendChild(emptyItem);
    return;
  }

  history.forEach((item, index) => {
    const historyItem = document.createElement('div');
    historyItem.className = 'history-card';
    historyItem.innerHTML = `
      <div class="history-name">${item.name}</div>
      <div class="history-time">${item.timestamp}</div>
    `;
    historyItem.onclick = () => {
      const structure = item.structure;
      localStorage.setItem('folderStructure', JSON.stringify(structure));
      window.location.href = 'popup.html';
    };
    historyList.appendChild(historyItem);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateHistoryList();
  const clearBtn = document.getElementById('clearHistoryBtn');
  if (clearBtn) {
    clearBtn.onclick = () => {
      if (confirm('Are you sure you want to clear all history?')) {
        localStorage.removeItem('structureHistory');
        updateHistoryList();
      }
    };
  }
  const backBtn = document.getElementById('backToPopupBtn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      window.location.href = 'popup.html';
    });
  }
});
