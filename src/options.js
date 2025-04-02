document.addEventListener('DOMContentLoaded', async () => {
    // Initialize i18n
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;
    
    // Function to get localized strings
    const getMessage = (messageName) => {
        return browserAPI.i18n.getMessage(messageName);
    };
    
    // Replace all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const messageName = element.getAttribute('data-i18n');
        element.textContent = getMessage(messageName);
    });
    
    // Replace all help tooltips with data-i18n-help attribute
    document.querySelectorAll('[data-i18n-help]').forEach(element => {
        const messageName = element.getAttribute('data-i18n-help');
        element.setAttribute('data-help', getMessage(messageName));
    });
    
    // Replace title if it has data-i18n attribute
    if (document.title && document.querySelector('title').hasAttribute('data-i18n')) {
        const messageName = document.querySelector('title').getAttribute('data-i18n');
        document.title = getMessage(messageName);
    }
    const form = document.getElementById('settingsForm');
    const status = document.getElementById('status');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Use browser API for cross-browser compatibility (already defined above)

    // Tab switching functionality
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });

    // Load existing settings
    const settings = await browserAPI.storage.sync.get({
        enableHypothesis: false,
        enableLinkwarden: false,
        enableLinkding: false,
        hypothesisUsername: '',
        hypothesisApiToken: '',
        hypothesisExcludeTags: '',
        mergeByUri: true,
        linkwardenUrl: 'https://cloud.linkwarden.app',
        linkwardenApiToken: '',
        linkdingUrl: '',
        linkdingApiToken: '',
        hypothesisPriority: 1,
        linkwardenPriority: 1,
        linkdingPriority: 1,
        sortingMethod: 'interleaving',
        themeMode: 'system'
    });

    // Set theme mode
    document.getElementById('themeMode').value = settings.themeMode;

    // Function to apply theme
    const applyTheme = (mode) => {
        if (mode === 'system') {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', mode);
        }
    };

    // Apply initial theme
    applyTheme(settings.themeMode);

    // Listen for theme changes
    document.getElementById('themeMode').addEventListener('change', (e) => {
        applyTheme(e.target.value);
    });

    // Populate form fields
    document.getElementById('enableHypothesis').checked = settings.enableHypothesis;
    document.getElementById('enableLinkwarden').checked = settings.enableLinkwarden;
    document.getElementById('enableLinkding').checked = settings.enableLinkding;
    document.getElementById('username').value = settings.hypothesisUsername;
    document.getElementById('apiToken').value = settings.hypothesisApiToken;
    document.getElementById('excludeTags').value = settings.hypothesisExcludeTags;
    document.getElementById('mergeByUri').checked = settings.mergeByUri;
    document.getElementById('linkwardenUrl').value = settings.linkwardenUrl;
    document.getElementById('linkwardenApiToken').value = settings.linkwardenApiToken;
    document.getElementById('linkdingUrl').value = settings.linkdingUrl;
    document.getElementById('linkdingApiToken').value = settings.linkdingApiToken;
    document.getElementById('hypothesisPriority').value = settings.hypothesisPriority;
    document.getElementById('linkwardenPriority').value = settings.linkwardenPriority;
    document.getElementById('linkdingPriority').value = settings.linkdingPriority;
    document.getElementById('sortingMethod').value = settings.sortingMethod;

    // Update required attributes based on service status
    const updateRequiredFields = () => {
        const hypothesisEnabled = document.getElementById('enableHypothesis').checked;
        const linkwardenEnabled = document.getElementById('enableLinkwarden').checked;
        const linkdingEnabled = document.getElementById('enableLinkding').checked;

        // Update Hypothesis fields
        document.getElementById('username').required = hypothesisEnabled;
        document.getElementById('apiToken').required = hypothesisEnabled;

        // Update Linkwarden fields
        document.getElementById('linkwardenUrl').required = linkwardenEnabled;
        document.getElementById('linkwardenApiToken').required = linkwardenEnabled;
        
        // Update Linkding fields
        document.getElementById('linkdingUrl').required = linkdingEnabled;
        document.getElementById('linkdingApiToken').required = linkdingEnabled;
    };

    // Add listeners for service toggles
    document.getElementById('enableHypothesis').addEventListener('change', updateRequiredFields);
    document.getElementById('enableLinkwarden').addEventListener('change', updateRequiredFields);
    document.getElementById('enableLinkding').addEventListener('change', updateRequiredFields);

    // Initial update of required fields
    updateRequiredFields();

    // Handle form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const hypothesisEnabled = document.getElementById('enableHypothesis').checked;
        const linkwardenEnabled = document.getElementById('enableLinkwarden').checked;

        // Save settings
        await browserAPI.storage.sync.set({
            enableHypothesis: hypothesisEnabled,
            enableLinkwarden: linkwardenEnabled,
            enableLinkding: document.getElementById('enableLinkding').checked,
            hypothesisUsername: document.getElementById('username').value,
            hypothesisApiToken: document.getElementById('apiToken').value,
            hypothesisExcludeTags: document.getElementById('excludeTags').value,
            mergeByUri: document.getElementById('mergeByUri').checked,
            linkwardenUrl: document.getElementById('linkwardenUrl').value,
            linkwardenApiToken: document.getElementById('linkwardenApiToken').value,
            linkdingUrl: document.getElementById('linkdingUrl').value,
            linkdingApiToken: document.getElementById('linkdingApiToken').value,
            hypothesisPriority: parseInt(document.getElementById('hypothesisPriority').value, 10),
            linkwardenPriority: parseInt(document.getElementById('linkwardenPriority').value, 10),
            linkdingPriority: parseInt(document.getElementById('linkdingPriority').value, 10),
            sortingMethod: document.getElementById('sortingMethod').value,
            themeMode: document.getElementById('themeMode').value
        });

        const username = document.getElementById('username').value.trim();
        const apiToken = document.getElementById('apiToken').value.trim();
        const excludeTags = document.getElementById('excludeTags').value.trim();
        const mergeByUri = document.getElementById('mergeByUri').checked;
        const linkwardenUrl = document.getElementById('linkwardenUrl').value.trim();
        const linkwardenApiToken = document.getElementById('linkwardenApiToken').value.trim();
        const linkdingUrl = document.getElementById('linkdingUrl').value.trim();
        const linkdingApiToken = document.getElementById('linkdingApiToken').value.trim();

        // Only validate enabled services
        let hasError = false;
        if (hypothesisEnabled) {
            if (!username || !apiToken) {
                status.textContent = getMessage('hypothesisRequiredError');
                status.className = 'status error';
                hasError = true;
            }
        }

        if (linkwardenEnabled) {
            if (!linkwardenUrl || !linkwardenApiToken) {
                status.textContent = getMessage('linkwardenRequiredError');
                status.className = 'status error';
                hasError = true;
            }
        }
        
        const linkdingEnabled = document.getElementById('enableLinkding').checked;
        if (linkdingEnabled) {
            if (!linkdingUrl || !linkdingApiToken) {
                status.textContent = getMessage('linkdingRequiredError');
                status.className = 'status error';
                hasError = true;
            }
        }

        if (!hasError) {
            status.textContent = getMessage('settingsSaved');
            status.className = 'status success';
            setTimeout(() => {
                status.textContent = '';
                status.className = '';
            }, 3000);
        }
    });
});
