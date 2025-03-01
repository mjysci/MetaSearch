document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('settingsForm');
    const status = document.getElementById('status');
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');

    // Use browser API for cross-browser compatibility
    const browserAPI = typeof browser !== 'undefined' ? browser : chrome;

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
        hypothesisUsername: '',
        hypothesisApiToken: '',
        hypothesisExcludeTags: '',
        mergeByUri: true,
        linkwardenUrl: 'https://cloud.linkwarden.app',
        linkwardenApiToken: '',
        hypothesisPriority: 1,
        linkwardenPriority: 1,
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
    document.getElementById('username').value = settings.hypothesisUsername;
    document.getElementById('apiToken').value = settings.hypothesisApiToken;
    document.getElementById('excludeTags').value = settings.hypothesisExcludeTags;
    document.getElementById('mergeByUri').checked = settings.mergeByUri;
    document.getElementById('linkwardenUrl').value = settings.linkwardenUrl;
    document.getElementById('linkwardenApiToken').value = settings.linkwardenApiToken;
    document.getElementById('hypothesisPriority').value = settings.hypothesisPriority;
    document.getElementById('linkwardenPriority').value = settings.linkwardenPriority;
    document.getElementById('sortingMethod').value = settings.sortingMethod;

    // Update required attributes based on service status
    const updateRequiredFields = () => {
        const hypothesisEnabled = document.getElementById('enableHypothesis').checked;
        const linkwardenEnabled = document.getElementById('enableLinkwarden').checked;

        // Update Hypothesis fields
        document.getElementById('username').required = hypothesisEnabled;
        document.getElementById('apiToken').required = hypothesisEnabled;

        // Update Linkwarden fields
        document.getElementById('linkwardenUrl').required = linkwardenEnabled;
        document.getElementById('linkwardenApiToken').required = linkwardenEnabled;
    };

    // Add listeners for service toggles
    document.getElementById('enableHypothesis').addEventListener('change', updateRequiredFields);
    document.getElementById('enableLinkwarden').addEventListener('change', updateRequiredFields);

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
            hypothesisUsername: document.getElementById('username').value,
            hypothesisApiToken: document.getElementById('apiToken').value,
            hypothesisExcludeTags: document.getElementById('excludeTags').value,
            mergeByUri: document.getElementById('mergeByUri').checked,
            linkwardenUrl: document.getElementById('linkwardenUrl').value,
            linkwardenApiToken: document.getElementById('linkwardenApiToken').value,
            hypothesisPriority: parseInt(document.getElementById('hypothesisPriority').value, 10),
            linkwardenPriority: parseInt(document.getElementById('linkwardenPriority').value, 10),
            sortingMethod: document.getElementById('sortingMethod').value,
            themeMode: document.getElementById('themeMode').value
        });

        const username = document.getElementById('username').value.trim();
        const apiToken = document.getElementById('apiToken').value.trim();
        const excludeTags = document.getElementById('excludeTags').value.trim();
        const mergeByUri = document.getElementById('mergeByUri').checked;
        const linkwardenUrl = document.getElementById('linkwardenUrl').value.trim();
        const linkwardenApiToken = document.getElementById('linkwardenApiToken').value.trim();

        // Only validate enabled services
        let hasError = false;
        if (hypothesisEnabled) {
            if (!username || !apiToken) {
                status.textContent = 'Hypothesis username and API token are required when the service is enabled';
                status.className = 'status error';
                hasError = true;
            }
        }

        if (linkwardenEnabled) {
            if (!linkwardenUrl || !linkwardenApiToken) {
                status.textContent = 'Linkwarden URL and API token are required when the service is enabled';
                status.className = 'status error';
                hasError = true;
            }
        }

        if (!hasError) {
            status.textContent = 'Settings saved successfully!';
            status.className = 'status success';
            setTimeout(() => {
                status.textContent = '';
                status.className = '';
            }, 3000);
        }
    });
});
