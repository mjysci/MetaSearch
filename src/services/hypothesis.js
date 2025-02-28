// Hypothesis.is integration module
let totalHypothesisItems = [];
const API_URL = 'https://api.hypothes.is/api/search';

const getHypothesisSettings = async () => {
    const result = await chrome.storage.sync.get({
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
        const response = await fetch(
            `${API_URL}?user=acct:${settings.username}@hypothes.is&limit=200&any=${encodeURIComponent(query)}`,
            {
                headers: { 'Authorization': `Bearer ${settings.apiToken}` }
            }
        );
        const data = await response.json();
        const excludedTags = settings.excludeTags.split(',').map(tag => tag.trim()).filter(Boolean);
        const uniqueUri = new Map();

        data.rows.forEach(item => {
            const hasExcludedTag = item.tags && excludedTags.some(excludeTag => item.tags.includes(excludeTag));
            if (!hasExcludedTag) {
                const constructedItem = constructHypothesisItem(item);
                if (settings.mergeByUri) {
                    uniqueUri.set(item.uri, constructedItem);
                } else {
                    totalHypothesisItems.push(constructedItem);
                }
            }
        });

        totalHypothesisItems = settings.mergeByUri ? Array.from(uniqueUri.values()) : totalHypothesisItems;
        return { items: totalHypothesisItems };
    } catch (err) {
        console.error('Failed to fetch results', err);
        return { error: 'fetch_failed' };
    }
};

export { fetchHypothesisResults, getHypothesisSettings };