// Linkwarden integration module
let totalLinkwardenItems = [];

// Use browser API for cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const constructLinkwardenItem = (item) => {
    return {
        uri: item.url,
        document: {
            title: item.name || 'Untitled'
        },
        text: item.description || '',
        source: 'linkwarden'
    };
};

// Fetch items from Linkwarden API
const fetchLinkwardenItems = async (query) => {
    const settings = await browserAPI.storage.sync.get({
        linkwardenUrl: 'https://cloud.linkwarden.app',
        linkwardenApiToken: ''
    });

    if (!settings.linkwardenUrl || !settings.linkwardenApiToken) {
        return { error: 'credentials_missing' };
    }

    try {
        // Determine if we're in Firefox (which has stricter CSP)
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        
        let data;
        const requestUrl = `${settings.linkwardenUrl}/api/v1/links?searchByName=true&searchByUrl=true&searchByDescription=true&searchByTextContent=true&searchByTags=true&searchQueryString=${encodeURIComponent(query)}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${settings.linkwardenApiToken}`
            },
            mode: 'cors'
        };
        
        if (isFirefox) {
            // In Firefox, use the background script to make the request
            // This avoids CSP restrictions of the page
            try {
                // Send a message to the background script to make the request
                const response = await browserAPI.runtime.sendMessage({
                    action: 'fetchLinkwarden',
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

        totalLinkwardenItems = data.response.map(constructLinkwardenItem);
        return { items: totalLinkwardenItems };
    } catch (err) {
        console.error('Failed to fetch bookmarks', err);
        return { error: 'fetch_failed' };
    }
};

export { fetchLinkwardenItems };