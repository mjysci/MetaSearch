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
        const response = await fetch(
            `${settings.linkwardenUrl}/api/v1/links?searchByName=true&searchByUrl=true&searchByDescription=true&searchByTextContent=true&searchByTags=true&searchQueryString=${encodeURIComponent(query)}`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${settings.linkwardenApiToken}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        totalLinkwardenItems = data.response.map(constructLinkwardenItem);
        return { items: totalLinkwardenItems };
    } catch (err) {
        console.error('Failed to fetch bookmarks', err);
        return { error: 'fetch_failed' };
    }
};

export { fetchLinkwardenItems };