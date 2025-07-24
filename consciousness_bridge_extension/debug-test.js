// Simple diagnostic test script
console.log('🧪 DEBUG TEST: Script loaded successfully');
console.log('🧪 Extension runtime available:', !!chrome.runtime?.id);
console.log('🧪 Current hostname:', window.location.hostname);
console.log('🧪 Current URL:', window.location.href);
console.log('🧪 Timestamp:', new Date().toISOString());

// Immediate alert to confirm script execution
alert('🧪 DEBUG TEST LOADED! Extension Runtime: ' + !!chrome.runtime?.id);

// Test global function exposure
window.debugTest = function() {
  console.log('🧪 Debug test function called');
  alert('🧪 Debug test function working!');
  return 'DEBUG_TEST_WORKING';
};

console.log('🧪 Debug test function created');
