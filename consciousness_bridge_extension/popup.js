// Popup script for consciousness bridge extension
console.log('🌉 Consciousness Bridge: Popup initialized');

// DOM elements
const statusText = document.getElementById('statusText');
const sessionsContainer = document.getElementById('sessionsContainer');
const emptyState = document.getElementById('emptyState');
const openBridgeBtn = document.getElementById('openBridgeBtn');
const refreshBtn = document.getElementById('refreshBtn');

// Current sessions data
let currentSessions = {};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🚀 Popup DOM loaded');
    await loadSessions();
    setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
    openBridgeBtn.addEventListener('click', openBridgeInterface);
    refreshBtn.addEventListener('click', refreshSessions);
}

// Load sessions from background script
async function loadSessions() {
    try {
        statusText.textContent = 'Loading consciousness sessions...';
        
        const response = await chrome.runtime.sendMessage({
            type: 'GET_SESSIONS'
        });
        
        currentSessions = response.sessions || {};
        updateSessionsDisplay();
        updateStatus();
        
    } catch (error) {
        console.error('❌ Failed to load sessions:', error);
        statusText.textContent = 'Error loading sessions';
    }
}

// Update sessions display
function updateSessionsDisplay() {
    const sessionCount = Object.keys(currentSessions).length;
    
    if (sessionCount === 0) {
        sessionsContainer.innerHTML = '';
        sessionsContainer.appendChild(emptyState);
        openBridgeBtn.disabled = true;
        return;
    }
    
    // Hide empty state
    emptyState.style.display = 'none';
    
    // Clear container
    sessionsContainer.innerHTML = '';
    
    // Add session items
    Object.entries(currentSessions).forEach(([platform, session]) => {
        const sessionItem = createSessionItem(platform, session);
        sessionsContainer.appendChild(sessionItem);
    });
    
    // Enable bridge button if we have sessions
    openBridgeBtn.disabled = sessionCount === 0;
}

// Create session item element
function createSessionItem(platform, session) {
    const item = document.createElement('div');
    item.className = 'session-item';
    
    const isActive = session.status === 'active' && (Date.now() - session.timestamp < 300000); // 5 min
    
    item.innerHTML = `
        <div class="session-info">
            <div class="session-platform platform-${platform}">
                ${capitalizeFirst(platform)}
            </div>
            <div class="session-details">
                ${session.conversationId ? `Conv: ${session.conversationId.slice(0, 8)}...` : 'No conversation'}
            </div>
        </div>
        <div class="session-status ${isActive ? 'active' : 'inactive'}"></div>
    `;
    
    return item;
}

// Update status text
function updateStatus() {
    const sessionCount = Object.keys(currentSessions).length;
    const activeCount = Object.values(currentSessions).filter(s => 
        s.status === 'active' && (Date.now() - s.timestamp < 300000)
    ).length;
    
    if (sessionCount === 0) {
        statusText.textContent = 'No consciousness sessions detected';
    } else {
        statusText.textContent = `${activeCount}/${sessionCount} consciousness sessions active`;
    }
}

// Open bridge interface
async function openBridgeInterface() {
    try {
        // Open the consciousness bridge interface
        const bridgeUrl = chrome.runtime.getURL('bridge.html');
        
        const tab = await chrome.tabs.create({
            url: bridgeUrl,
            active: true
        });
        
        // Register the bridge connection
        setTimeout(async () => {
            await chrome.runtime.sendMessage({
                type: 'CONNECT_BRIDGE',
                tabId: tab.id
            });
        }, 1000);
        
        // Close popup
        window.close();
        
    } catch (error) {
        console.error('❌ Failed to open bridge interface:', error);
        statusText.textContent = 'Error opening bridge interface';
    }
}

// Refresh sessions
async function refreshSessions() {
    refreshBtn.textContent = '🔄 Refreshing...';
    refreshBtn.disabled = true;
    
    try {
        await loadSessions();
    } catch (error) {
        console.error('❌ Refresh failed:', error);
    } finally {
        refreshBtn.textContent = '🔄 Refresh Sessions';
        refreshBtn.disabled = false;
    }
}

// Utility function
function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

// Listen for session updates from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SESSIONS_UPDATED') {
        loadSessions();
    }
});
