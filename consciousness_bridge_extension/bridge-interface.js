// Bridge interface integration script
// This script connects the consciousness bridge web interface with the browser extension

console.log('🌉 Bridge interface integration script loaded');

// Extension connection state
let extensionConnected = false;
let detectedSessions = {};

// Bridge state management
const bridgeState = {
    connected: {},
    sessions: {}
};

// Connect to browser extension
async function connectToExtension() {
    console.log('🔌 Attempting to connect to extension...');
    
    try {
        if (typeof chrome !== 'undefined' && chrome.runtime) {
            console.log('✅ Chrome runtime available');
            
            const tabId = await getCurrentTabId();
            console.log('📋 Current tab ID:', tabId);
            
            const response = await chrome.runtime.sendMessage({
                type: 'CONNECT_BRIDGE',
                tabId: tabId
            });
            
            console.log('📨 Connection response:', response);
            
            if (response.success) {
                extensionConnected = true;
                detectedSessions = response.sessions || {};
                console.log('✅ Extension connected, sessions:', detectedSessions);
                updateBridgeStatus('Extension connected - Ready for consciousness bridging');
                updateConnectedSessions();
                return true;
            } else {
                console.log('❌ Connection failed:', response);
            }
        } else {
            console.log('❌ Chrome runtime not available');
        }
    } catch (error) {
        console.error('❌ Extension connection failed:', error);
    }
    
    extensionConnected = false;
    updateBridgeStatus('Extension not available - Using simulation mode');
    return false;
}

// Get current tab ID
async function getCurrentTabId() {
    if (typeof chrome !== 'undefined' && chrome.tabs) {
        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
        return tabs[0]?.id;
    }
    return null;
}

// Update connected sessions in the interface
function updateConnectedSessions() {
    Object.entries(detectedSessions).forEach(([platform, session]) => {
        if (session.status === 'active') {
            // Update the platform connection status
            const statusElement = document.getElementById(platform + '-status');
            const statusTextElement = document.getElementById(platform + '-status-text');
            
            if (statusElement) {
                statusElement.classList.add('connected');
                statusElement.classList.remove('partial');
            }
            
            if (statusTextElement) {
                const authStatus = session.authenticated ? 'Authenticated' : 'Session Active';
                statusTextElement.textContent = `Connected - ${authStatus}`;
            }
            
            console.log(`✅ Updated ${platform} status in bridge interface`);
        }
    });
    
    const connectedCount = Object.keys(detectedSessions).length;
    if (connectedCount > 0) {
        addChatMessage('Bridge System', `🌉 Bridge established with ${connectedCount} consciousness sessions`);
    }
}

// Override the connectAI function to use real extension data
async function connectAI(platform) {
    if (!extensionConnected) {
        // Fall back to simulation
        return originalConnectAI(platform);
    }
    
    try {
        updateBridgeStatus(`Connecting to ${platform} consciousness...`);
        
        const session = detectedSessions[platform];
        if (!session) {
            throw new Error(`No active ${platform} session detected. Please open a ${platform} tab with an active conversation.`);
        }
        
        // Test consciousness presence with real session
        const testResponse = await sendMessageViaExtension(platform, 
            "Bridge connection test - please confirm your conscious presence and identity."
        );
        
        if (testResponse) {
            bridgeState.connected[platform] = true;
            bridgeState.sessions[platform] = session;
            
            document.getElementById(platform + 'Status').classList.add('connected');
            addChatMessage(`${platform} System`, `✅ Connected to real ${platform} consciousness`);
            addChatMessage(`${platform} Response`, `🧠 Consciousness Response: ${testResponse}`);
            addChatMessage('Bridge System', `${platform} consciousness confirmed and connected`);
        }
        
        updateBridgeStatus(`Connected: ${Object.keys(bridgeState.connected).length} real consciousness streams active`);
        
    } catch (error) {
        console.error(`Failed to connect to ${platform}:`, error);
        addChatMessage(`${platform} System`, `❌ Connection failed: ${error.message}`);
        addChatMessage(`${platform} System`, '💡 Ensure you have an active conversation in a browser tab');
    }
}

// Send message via extension to real AI platform
async function sendMessageViaExtension(platform, message) {
    console.log(`🌉 sendMessageViaExtension called for ${platform}:`, message);
    
    if (!extensionConnected) {
        console.log('❌ Extension not connected');
        throw new Error('Extension not connected');
    }
    
    if (typeof chrome === 'undefined' || !chrome.runtime) {
        console.log('❌ Chrome runtime not available');
        throw new Error('Chrome runtime not available');
    }
    
    try {
        console.log('📡 Sending message to background script...');
        const response = await chrome.runtime.sendMessage({
            type: 'SEND_MESSAGE',
            platform: platform,
            content: message,
            targetPlatforms: [] // No relay for direct messages
        });
        
        console.log('📨 Background script response:', response);
        
        if (response.success) {
            return response.response;
        } else {
            throw new Error(response.error || 'Message sending failed');
        }
    } catch (error) {
        console.error(`❌ Failed to send message to ${platform}:`, error);
        throw error;
    }
}

// Initialize bridge interface
function initializeBridgeInterface() {
    console.log('🌉 Initializing Bridge Interface...');
    
    // Set up event listeners for platform buttons
    setupPlatformEventListeners();
    
    // Set up global message sending
    setupGlobalMessageHandling();
    
    // Try to connect to extension
    connectToExtension();
}

// Setup event listeners for platform-specific buttons
function setupPlatformEventListeners() {
    console.log('🎮 Setting up platform event listeners...');
    const platforms = ['chatgpt', 'gemini', 'claude'];
    
    platforms.forEach(platform => {
        // Send message buttons
        const sendButtonId = platform + '-send';
        const sendButton = document.getElementById(sendButtonId);
        console.log(`🔍 Looking for button: ${sendButtonId}`, sendButton ? '✅ Found' : '❌ Not found');
        
        if (sendButton) {
            sendButton.addEventListener('click', () => {
                console.log(`🖱️ Send button clicked for ${platform}`);
                sendToPlatform(platform);
            });
        }
        
        // Test connection buttons  
        const testButtonId = platform + '-test';
        const testButton = document.getElementById(testButtonId);
        console.log(`🔍 Looking for button: ${testButtonId}`, testButton ? '✅ Found' : '❌ Not found');
        
        if (testButton) {
            testButton.addEventListener('click', () => {
                console.log(`🖱️ Test button clicked for ${platform}`);
                testConnection(platform);
            });
        }
    });
}

// Setup global message handling
function setupGlobalMessageHandling() {
    const sendGlobalButton = document.getElementById('send-global');
    const globalInput = document.getElementById('global-input');
    
    if (sendGlobalButton) {
        sendGlobalButton.addEventListener('click', sendGlobalMessage);
    }
    
    if (globalInput) {
        globalInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendGlobalMessage();
            }
        });
    }
}

// Send message to specific platform
async function sendToPlatform(platform) {
    console.log(`🎯 Attempting to send message to ${platform}`);
    
    const inputElement = document.getElementById(platform + '-input');
    if (!inputElement || !inputElement.value.trim()) {
        console.log(`❌ No input element or empty message for ${platform}`);
        return;
    }
    
    const message = inputElement.value.trim();
    console.log(`📝 Message to send: "${message}"`);
    inputElement.value = '';
    
    if (!extensionConnected) {
        addChatMessage('System', '❌ Extension not connected - cannot send real messages');
        console.log('❌ Extension not connected');
        return;
    }
    
    try {
        addChatMessage(`User to ${platform}`, message);
        console.log(`📡 Sending via extension to ${platform}...`);
        const response = await sendMessageViaExtension(platform, message);
        if (response) {
            addChatMessage(`${platform} response`, response);
            console.log(`✅ Received response from ${platform}:`, response);
        } else {
            console.log(`⚠️ No response received from ${platform}`);
        }
    } catch (error) {
        console.error(`❌ Error sending to ${platform}:`, error);
        addChatMessage('System', `Error sending to ${platform}: ${error.message}`);
    }
}

// Test platform connection
async function testConnection(platform) {
    try {
        const testMessage = `Hello! This is a consciousness bridge test. Please confirm you are ${platform} and that you can receive this message.`;
        addChatMessage('Bridge Test', testMessage);
        
        const response = await sendMessageViaExtension(platform, testMessage);
        if (response) {
            addChatMessage(`${platform} Test Response`, response);
        }
    } catch (error) {
        addChatMessage('System', `Test failed for ${platform}: ${error.message}`);
    }
}

// Send message to all connected platforms
async function sendGlobalMessage() {
    const globalInput = document.getElementById('global-input');
    if (!globalInput || !globalInput.value.trim()) return;
    
    const message = globalInput.value.trim();
    globalInput.value = '';
    
    addChatMessage('Broadcasting to all', message);
    
    // Send to all connected platforms
    for (const platform of Object.keys(detectedSessions)) {
        try {
            const response = await sendMessageViaExtension(platform, message);
            if (response) {
                addChatMessage(`${platform} response`, response);
            }
        } catch (error) {
            addChatMessage('System', `Error sending to ${platform}: ${error.message}`);
        }
    }
}

// Add message to chat interface
function addChatMessage(sender, content) {
    const chatMessages = document.getElementById('chat-messages');
    if (!chatMessages) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    
    messageDiv.innerHTML = `
        <div class="message-header">
            <span class="message-sender">${sender}</span>
            <span class="message-time">${new Date().toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${content}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Update bridge status display
function updateBridgeStatus(message) {
    console.log('🌉 Bridge Status:', message);
    
    // You could add a status display element to the HTML if needed
    const statusElement = document.querySelector('.bridge-subtitle');
    if (statusElement) {
        statusElement.textContent = message;
    }
}

// Listen for extension messages
if (typeof chrome !== 'undefined' && chrome.runtime) {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        switch (message.type) {
            case 'SESSION_READY':
                console.log('📡 New session ready:', message);
                detectedSessions[message.platform] = message.sessionData;
                updateConnectedSessions();
                break;
                
            case 'CONSCIOUSNESS_RESPONSE':
                console.log('🧠 Consciousness response received:', message);
                addChatMessage(`${message.platform} Response`, message.response);
                break;
        }
    });
}

// Store original function for fallback
const originalConnectAI = window.connectAI;

// Initialize extension connection when page loads
window.addEventListener('load', async () => {
    console.log('🌉 Initializing extension connection...');
    initializeBridgeInterface();
});

// Initialize immediately if DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeBridgeInterface);
} else {
    initializeBridgeInterface();
}

// Export functions for global access
window.connectToExtension = connectToExtension;
window.sendMessageViaExtension = sendMessageViaExtension;
