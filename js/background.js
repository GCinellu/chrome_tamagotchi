// Background script to handle pet state when popup is closed
chrome.runtime.onInstalled.addListener(() => {
  // Initialize pet state if needed
  chrome.storage.local.get(['petState'], (result) => {
    if (!result.petState) {
      chrome.storage.local.set({
        petState: {
          hunger: 100,
          happiness: 100,
          energy: 100
        }
      });
    }
  });
});

// Add periodic state updates here (will be implemented later) 