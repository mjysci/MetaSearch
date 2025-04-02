// Linkding integration module
let totalLinkdingItems = [];

// Use browser API for cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const constructLinkdingItem = (item) => {
    return {
        uri: item.url,
        document: {
            title: item.title || 'Untitled'
        },
        text: item.description || '',
        source: 'linkding'
    };
};

// Fetch items from Linkding API
const fetchLinkdingItems = async (query) => {
    const settings = await browserAPI.storage.sync.get({
        linkdingUrl: '',
        linkdingApiToken: ''
    });

    if (!settings.linkdingUrl || !settings.linkdingApiToken) {
        return { error: 'credentials_missing' };
    }

    try {
        // Determine if we're in Firefox (which has stricter CSP)
        const isFirefox = navigator.userAgent.toLowerCase().includes('firefox');
        
        let data;
        // Linkding API endpoint for bookmark search
        const requestUrl = `${settings.linkdingUrl}/api/bookmarks/?q=${encodeURIComponent(query)}`;
        const requestOptions = {
            method: 'GET',
            headers: {
                'Authorization': `Token ${settings.linkdingApiToken}`
            },
            mode: 'cors'
        };
        
        if (isFirefox) {
            // In Firefox, use the background script to make the request
            // This avoids CSP restrictions of the page
            try {
                // Send a message to the background script to make the request
                const response = await browserAPI.runtime.sendMessage({
                    action: 'fetchLinkding',
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

        // Linkding API returns results in a 'results' array
        totalLinkdingItems = data.results.map(constructLinkdingItem);
        return { items: totalLinkdingItems };
    } catch (err) {
        console.error('Failed to fetch bookmarks from Linkding', err);
        return { error: 'fetch_failed' };
    }
};

export { fetchLinkdingItems };