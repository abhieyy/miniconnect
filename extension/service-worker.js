/**
 * MiniConnect Service Worker
 * Handles background tasks and popup communication
 */

// Listen for extension installation/update
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        // Open setup page on install
        chrome.tabs.create({ url: 'popup.html' });
        
        // Set default server URL
        chrome.storage.local.set({ serverUrl: 'http://localhost:3000' });
    }
    console.log('[MiniConnect] Extension installed/updated');
});

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'setServer') {
        chrome.storage.local.set({ serverUrl: request.serverUrl }, () => {
            console.log('[MiniConnect] Server URL saved:', request.serverUrl);
            sendResponse({ success: true });
        });
    } else if (request.action === 'getServer') {
        chrome.storage.local.get(['serverUrl'], (result) => {
            sendResponse({ serverUrl: result.serverUrl || 'http://localhost:3000' });
        });
    }
    return true; // Keep channel open for async response
});

console.log('[MiniConnect] Service Worker loaded');
