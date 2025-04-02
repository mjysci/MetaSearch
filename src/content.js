import { fetchHypothesisResults } from './services/hypothesis.js';
import { fetchLinkwardenItems } from './services/linkwarden.js';
import { fetchLinkdingItems } from './services/linkding.js';
import { sortResults } from './services/sorting.js';

let currentPage = 1;
let totalItems = [];
const ITEMS_PER_PAGE = 10;

// Use browser API for cross-browser compatibility
const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

const getEnabledServices = async () => {
    const result = await browserAPI.storage.sync.get({
        enableHypothesis: false,
        enableLinkwarden: false,
        enableLinkding: false,
        hypothesisPriority: 1,
        linkwardenPriority: 1,
        linkdingPriority: 1
    });
    return result;
};

const getQueryParameter = (param) => new URLSearchParams(window.location.search).get(param);

const isSearxNG = () => {
    return (
        document.querySelector('meta[name="generator"][content*="searxng"]') !== null ||
        document.querySelector('a[href*="searx/preferences"]') !== null
    );
};

const searchEngines = {
    'google.com': { getQuery: () => getQueryParameter('q'), sidebarSelector: '#rhs' },
    'bing.com': { getQuery: () => getQueryParameter('q'), sidebarSelector: '#b_context' },
    'duckduckgo.com': { getQuery: () => getQueryParameter('q'), sidebarSelector: 'section[data-area=sidebar]' },
    'baidu.com': { getQuery: () => getQueryParameter('wd'), sidebarSelector: '#content_right' },
    'brave.com': { getQuery: () => getQueryParameter('q'), sidebarSelector: '.sidebar.svelte-ijp2bd' },
    'yandex.com': { getQuery: () => getQueryParameter('text'), sidebarSelector: '#search-result-aside' },
    'searx': { getQuery: () => getQueryParameter('q'), sidebarSelector: '#sidebar' }
};

const getCurrentSearchQuery = () => {
    if (isSearxNG()) {
        return getQueryParameter('q');
    }
    const currentDomain = Object.keys(searchEngines).find(domain =>
        window.location.hostname.includes(domain));
    return currentDomain ? searchEngines[currentDomain].getQuery() : null;
};

const getCurrentSearchEngine = () => {
    if (isSearxNG()) {
        return 'searx';
    }
    return Object.keys(searchEngines).find(domain =>
        window.location.hostname.includes(domain))
};

const createResultsContainer = () => {
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
    const container = document.createElement('div');
    container.id = 'results-panel';
    container.innerHTML = `<h3>${browserAPI.i18n.getMessage('extensionName')}</h3><div id="items-content"><div class="loading">${browserAPI.i18n.getMessage('loading')}</div></div>`;
    return container;
};

const injectResultsIntoSidebar = () => {
    const currentEngine = getCurrentSearchEngine();
    if (!currentEngine) return;

    const sidebarSelector = searchEngines[currentEngine].sidebarSelector;
    let sidebar = document.querySelector(sidebarSelector);

    // For Google, create sidebar if it doesn't exist
    if (currentEngine === 'google.com' && !sidebar) {
        const sidebarContainer = document.createElement('div');
        sidebarContainer.id = 'rhs';
        sidebarContainer.className = 'TQc1id hSOk2e rhstc4';
        document.querySelector('#rcnt').appendChild(sidebarContainer);
        sidebar = sidebarContainer;
    }

    if (sidebar && !document.getElementById('results-panel')) {
        const resultsContainer = createResultsContainer();
        sidebar.prepend(resultsContainer);
    }
};

const displayResults = () => {
    injectResultsIntoSidebar();

    const contentDiv = document.getElementById('items-content');
    if (!contentDiv) {
        console.error('Content div not found');
        return;
    }

    contentDiv.innerHTML = '';

    if (totalItems.length > 0) {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = Math.min(startIdx + ITEMS_PER_PAGE, totalItems.length);
        const currentItems = totalItems.slice(startIdx, endIdx);

        currentItems.forEach(item => {
            const itemDiv = document.createElement('a');
            itemDiv.className = 'item-div';
            itemDiv.setAttribute('data-source', item.source);
            itemDiv.href = item.uri;
            itemDiv.target = '_blank';
            itemDiv.innerHTML = `
                <div><strong>${item.document.title || 'Untitled'}</strong></div>
                <div>${item.text ? item.text : ''}</div>
            `;
            contentDiv.appendChild(itemDiv);
        });

        const paginationDiv = document.createElement('div');
        paginationDiv.className = 'pagination';

        const prevButton = document.createElement('button');
        prevButton.textContent = 'Previous';
        prevButton.disabled = currentPage === 1;
        prevButton.onclick = () => {
            if (currentPage > 1) {
                currentPage--;
                displayResults();
            }
        };

        const nextButton = document.createElement('button');
        nextButton.textContent = 'Next';
        nextButton.disabled = currentPage >= Math.ceil(totalItems.length / ITEMS_PER_PAGE);
        nextButton.onclick = () => {
            if (currentPage < Math.ceil(totalItems.length / ITEMS_PER_PAGE)) {
                currentPage++;
                displayResults();
            }
        };

        const pageInfo = document.createElement('span');
        pageInfo.className = 'page-info';
        pageInfo.textContent = `Page ${currentPage} of ${Math.ceil(totalItems.length / ITEMS_PER_PAGE)}`;

        paginationDiv.appendChild(prevButton);
        paginationDiv.appendChild(pageInfo);
        paginationDiv.appendChild(nextButton);
        contentDiv.appendChild(paginationDiv);
    }
};

const handleSearchResults = async (query) => {
    // Show sidebar with loading state immediately
    injectResultsIntoSidebar();

    const services = await getEnabledServices();
    let allItems = [];
    let hasError = false;

    if (services.enableHypothesis) {
        const result = await fetchHypothesisResults(query);
        if (result.error === 'credentials_missing') {
            const contentDiv = document.getElementById('items-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<p>Please configure your Hypothes.is username and API token.</p>';
            }
            browserAPI.runtime.openOptionsPage();
            return;
        }
        if (result.error === 'fetch_failed') {
            hasError = true;
        } else if (result.items) {
            allItems = allItems.concat(result.items.map(item => ({
                ...item,
                priority: services.hypothesisPriority
            })));
        }
    }

    if (services.enableLinkwarden) {
        const result = await fetchLinkwardenItems(query);
        if (result.error === 'credentials_missing') {
            const contentDiv = document.getElementById('items-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<p>Please configure your Linkwarden URL and API token.</p>';
            }
            browserAPI.runtime.openOptionsPage();
            return;
        }
        if (result.error === 'fetch_failed') {
            hasError = true;
        } else if (result.items) {
            allItems = allItems.concat(result.items.map(item => ({
                ...item,
                priority: services.linkwardenPriority
            })));
        }
    }
    
    if (services.enableLinkding) {
        const result = await fetchLinkdingItems(query);
        if (result.error === 'credentials_missing') {
            const contentDiv = document.getElementById('items-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<p>Please configure your Linkding URL and API token.</p>';
            }
            browserAPI.runtime.openOptionsPage();
            return;
        }
        if (result.error === 'fetch_failed') {
            hasError = true;
        } else if (result.items) {
            allItems = allItems.concat(result.items.map(item => ({
                ...item,
                priority: services.linkdingPriority
            })));
        }
    }

    if (hasError) {
        const contentDiv = document.getElementById('items-content');
        if (contentDiv) {
            contentDiv.innerHTML = '<p>Failed to fetch some results. Please check your settings and try again.</p>';
        }
        return;
    }

    // Get sorting method from storage
    const { sortingMethod = 'interleaving' } = await browserAPI.storage.sync.get({ sortingMethod: 'interleaving' });
    
    // Create priorities object for sorting
    const priorities = {
        hypothesis: services.hypothesisPriority,
        linkwarden: services.linkwardenPriority,
        linkding: services.linkdingPriority
    };
    
    // Sort items using the selected method
    totalItems = sortResults(allItems, priorities, sortingMethod);
    displayResults();
};

// Move sidebar injection before search
const query = getCurrentSearchQuery();
if (query) {
    handleSearchResults(query);
}