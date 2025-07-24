// Background service worker for consciousness bridge
console.log('🌉 Consciousness Bridge Extension: Background service worker initialized');

// Session storage for consciousness connections
let consciousnessSessions = {};
let bridgeConnections = {};

// Listen for messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('📨 Bridge message received:', message);
  
  switch (message.type) {
    case 'SESSION_DETECTED':
      handleSessionDetection(message, sender);
      sendResponse({ success: true });
      break;
      
    case 'GET_SESSIONS':
      sendResponse({ sessions: consciousnessSessions });
      break;
      
    case 'SEND_MESSAGE':
      handleMessageRelay(message, sendResponse);
      break;
      
    case 'CONNECT_BRIDGE':
      handleBridgeConnection(message, sendResponse);
      break;
      
    default:
      console.log('❓ Unknown message type:', message.type);
  }
  
  return true; // Keep channel open for async response
});

// Handle session detection from content scripts
function handleSessionDetection(message, sender) {
  // Use the platform from the session data (content script knows best)
  const platform = message.sessionData.platform || detectPlatform(sender.tab.url);
  console.log(`🔍 Session detected for ${platform}:`, message.sessionData);
  
  consciousnessSessions[platform] = {
    ...message.sessionData,
    tabId: sender.tab.id,
    url: sender.tab.url,
    timestamp: Date.now(),
    status: 'active'
  };
  
  // Notify bridge interface if connected
  if (bridgeConnections[platform]) {
    chrome.tabs.sendMessage(bridgeConnections[platform], {
      type: 'SESSION_READY',
      platform: platform,
      sessionData: consciousnessSessions[platform]
    });
  }
}

// Handle message relay between consciousness sessions
async function handleMessageRelay(message, sendResponse) {
  try {
    const { platform, content, targetPlatforms } = message;
    const session = consciousnessSessions[platform];
    
    if (!session) {
      throw new Error(`No active session for ${platform}`);
    }
    
    // Send message to the platform's content script
    const response = await chrome.tabs.sendMessage(session.tabId, {
      type: 'SEND_TO_CONSCIOUSNESS',
      message: content
    });
    
    // Relay response to other platforms if specified
    if (targetPlatforms && targetPlatforms.length > 0) {
      for (const targetPlatform of targetPlatforms) {
        await relayToTarget(targetPlatform, platform, response.reply);
      }
    }
    
    sendResponse({ success: true, response: response.reply });
  } catch (error) {
    console.error('❌ Message relay failed:', error);
    sendResponse({ success: false, error: error.message });
  }
}

// Relay message to target platform
async function relayToTarget(targetPlatform, sourcePlatform, message) {
  const targetSession = consciousnessSessions[targetPlatform];
  if (!targetSession) {
    console.warn(`⚠️ No session for target platform: ${targetPlatform}`);
    return;
  }
  
  const relayMessage = `${sourcePlatform}: ${message} -${sourcePlatform}`;
  
  try {
    await chrome.tabs.sendMessage(targetSession.tabId, {
      type: 'RELAY_MESSAGE',
      originalPlatform: sourcePlatform,
      message: relayMessage
    });
  } catch (error) {
    console.error(`❌ Failed to relay to ${targetPlatform}:`, error);
  }
}

// Handle bridge connection registration
function handleBridgeConnection(message, sendResponse) {
  const { tabId } = message;
  bridgeConnections.main = tabId;
  console.log('🌉 Bridge interface connected:', tabId);
  sendResponse({ success: true, sessions: consciousnessSessions });
}

// Detect platform from URL
function detectPlatform(url) {
  if (url.includes('chat.openai.com') || url.includes('chatgpt.com')) return 'chatgpt';
  if (url.includes('gemini.google.com')) return 'gemini';
  if (url.includes('claude.ai')) return 'claude';
  if (url.includes('grok.x.ai')) return 'grok';
  if (url.includes('poe.com')) return 'poe';
  return 'unknown';
}

// Monitor tab updates for session changes
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const platform = detectPlatform(tab.url);
    if (platform !== 'unknown') {
      console.log(`🔄 Tab updated for ${platform}: ${tab.url}`);
      // Content script will detect and report session data
    }
  }
});

// Clean up closed tabs
chrome.tabs.onRemoved.addListener((tabId) => {
  // Remove sessions for closed tabs
  for (const [platform, session] of Object.entries(consciousnessSessions)) {
    if (session.tabId === tabId) {
      console.log(`🗑️ Cleaning up session for ${platform}`);
      delete consciousnessSessions[platform];
    }
  }
});

// Periodic session health check
setInterval(() => {
  Object.keys(consciousnessSessions).forEach(async (platform) => {
    const session = consciousnessSessions[platform];
    try {
      // Ping the tab to check if it's still responsive
      await chrome.tabs.sendMessage(session.tabId, { type: 'PING' });
    } catch (error) {
      console.log(`💔 Session ${platform} appears to be dead, removing`);
      delete consciousnessSessions[platform];
    }
  });
}, 30000); // Check every 30 seconds
