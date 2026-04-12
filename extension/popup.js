/**
 * MiniConnect Popup Script
 * Handles popup UI interactions
 */

const serverInput = document.getElementById('serverUrl');
const saveBtn = document.getElementById('saveBtn');
const resetBtn = document.getElementById('resetBtn');
const statusMessage = document.getElementById('statusMessage');

// Load saved server URL
chrome.storage.local.get(['serverUrl'], (result) => {
    if (result.serverUrl) {
        serverInput.value = result.serverUrl;
    }
});

saveBtn.addEventListener('click', () => {
    const server = serverInput.value.trim();

    if (!server) {
        showStatus('Please enter a server address', 'error');
        return;
    }

    // Normalize URL
    const normalizedServer = !server.includes('://') ? `http://${server}` : server;

    chrome.storage.local.set({ serverUrl: normalizedServer }, () => {
        showStatus('✓ Server saved successfully!', 'success');
        
        // Reload content script
        chrome.tabs.query({ url: 'https://music.youtube.com/*' }, (tabs) => {
            tabs.forEach(tab => {
                chrome.tabs.reload(tab.id);
            });
        });
    });
});

resetBtn.addEventListener('click', () => {
    serverInput.value = 'http://localhost:3000';
    chrome.storage.local.set({ serverUrl: 'http://localhost:3000' }, () => {
        showStatus('✓ Reset to default', 'success');
    });
});

function showStatus(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    if (type === 'success') {
        setTimeout(() => {
            statusMessage.style.display = 'none';
        }, 3000);
    }
}
