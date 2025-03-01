// Hypothesis.is integration module
let totalHypothesisItems = [];
const API_URL = 'https://api.hypothes.is/api/search';

// Use browser API for cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const getHypothesisSettings = async () => {
    const result = await browserAPI.storage.sync.get({
        hypothesisUsername: '',
        hypothesisApiToken: '',
        hypothesisExcludeTags: '',
        mergeByUri: true
    });
    return {
        username: result.hypothesisUsername,
        apiToken: result.hypothesisApiToken,
        excludeTags: result.hypothesisExcludeTags,
        mergeByUri: result.mergeByUri
    };
};

const constructHypothesisItem = (item) => {
    return {
        uri: item.uri,
        document: {
            title: item.document?.title || 'Untitled'
        },
        text: item.text || '',
        source: 'hypothesis'
    };
};

const fetchHypothesisResults = async (query) => {
    const settings = await getHypothesisSettings();
    if (!settings.username || !settings.apiToken) {
        return { error: 'credentials_missing' };
    }

    try {
        // Determine if we're in Firefox (which has stricter CSP)
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');

        let data;
        const requestUrl = `${API_URL}?user=acct:${settings.username}@hypothes.is&limit=200&any=${encodeURIComponent(query)}`;
        const requestOptions = {
            headers: { 'Authorization': `Bearer ${settings.apiToken}` },
            mode: 'cors'
        };
        
        if (isFirefox) {
            // In Firefox, use the background script to make the request
            // This avoids CSP restrictions of the page
            try {
                // Send a message to the background script to make the request
                const response = await browserAPI.runtime.sendMessage({
                    action: 'fetchHypothesis',
                    url: requestUrl,
                    options: requestOptions
                });
                
                if (response.success) {
                    data = response.data;
                } else {
                    throw new Error(response.error || 'Failed to fetch data from background script');
                }
            } catch (error) {
                console.error('Background script request failed', error);
                throw error; // Don't try fallbacks in Firefox - they will be blocked by CSP
            }
        } else {
            // In Chrome and other browsers, use fetch directly
            const response = await fetch(requestUrl, requestOptions);
            data = await response.json();
        }
        
        // Reset the items array before processing new results
        totalHypothesisItems = [];
        
        const excludedTags = settings.excludeTags.split(',').map(tag => tag.trim()).filter(Boolean);
        const uniqueUri = new Map();

        data.rows.forEach(item => {
            const hasExcludedTag = item.tags && excludedTags.some(excludeTag => item.tags.includes(excludeTag));
            if (!hasExcludedTag) {
                const constructedItem = constructHypothesisItem(item);
                if (settings.mergeByUri) {
                    if (!uniqueUri.has(item.uri)) {
                        uniqueUri.set(item.uri, constructedItem);
                    }
                } else {
                    totalHypothesisItems.push(constructedItem);
                }
            }
        });

        if (settings.mergeByUri) {
            totalHypothesisItems = Array.from(uniqueUri.values());
        }

        return { items: totalHypothesisItems };
    } catch (err) {
        console.error('Failed to fetch annotations', err);
        return { error: 'fetch_failed' };
    }
};

export { fetchHypothesisResults };