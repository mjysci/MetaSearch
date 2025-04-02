// Background script for handling API requests without CSP restrictions

// Use browser API for cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

// Listen for messages from content scripts
browserAPI.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchHypothesis') {
    fetchFromHypothesis(request.url, request.options)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required to use sendResponse asynchronously
  }
  
  if (request.action === 'fetchLinkwarden') {
    fetchFromLinkwarden(request.url, request.options)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required to use sendResponse asynchronously
  }
  
  if (request.action === 'fetchLinkding') {
    fetchFromLinkding(request.url, request.options)
      .then(data => sendResponse({ success: true, data }))
      .catch(error => sendResponse({ success: false, error: error.message }));
    return true; // Required to use sendResponse asynchronously
  }
});

// Function to fetch data from Hypothesis API
async function fetchFromHypothesis(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Hypothesis:', error);
    throw error;
  }
}

// Function to fetch data from Linkwarden API
async function fetchFromLinkwarden(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Linkwarden:', error);
    throw error;
  }
}

// Function to fetch data from Linkding API
async function fetchFromLinkding(url, options) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching from Linkding:', error);
    throw error;
  }
}