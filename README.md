# MetaSearch

MetaSearch is a powerful browser extension that seamlessly integrates search results from private services like Hypothesis into search engines like Google.

![MetaSearch Screenshot](https://cdn.jsdelivr.net/gh/mjysci/imgs@master/blog/MetaSearch-sidebar.png)

## Features

- Multiple search engine support (Google, Bing, DuckDuckGo, Baidu, Brave, Yandex, SearXNG, etc.)
- Hypothesis API integration for web annotations
- Linkwarden integration for smart bookmark management
- Customizable search settings
- Clean Material Design UI

## Installation

### Chrome
1. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the root directory of the project

### Firefox
1. Load the extension in Firefox:
   - Open Firefox and go to `about:debugging#/runtime/this-firefox`
   - Click "Load Temporary Add-on"
   - Select the manifest.json file in the project directory
   - For permanent installation, package the extension using `npm run package` and install the generated `metasearch-firefox.zip` file through `about:addons`
2. Right-click the extension icon in the browser toolbar, then select Options to open Settings.
3. Enable the integrations you need, and configure the necessary information such as API tokens on the relevant tabs. Save Settings.

## Usage

1. **Open a Search Engine**: Visit any supported search engine (e.g., Google, Bing, DuckDuckGo).

2. **Search for a Term**: Type your search query. The extension will automatically fetch relevant items.

3. **View Results**: Your search results will appear in a convenient panel alongside the regular search results. Simply click any result to open it in a new tab.

## Contributing

We welcome contributions! Please check our [Contributing Guidelines](docs/CONTRIBUTING.md) for details on:

- Development setup
- Coding standards
- Submitting pull requests

## License

This project is licensed under the GPL-3.0 License. See the [LICENSE](https://github.com/mjysci/MetaSearch/blob/main/LICENSE) file for more information.

## Support

If you encounter any issues or have questions, please:

1. Check the [documentation](docs/)
2. Search through existing issues
3. Create a new issue if needed

## Acknowledgments

- [Freepik](https://www.freepik.com/) for the icon design
- [Hypothesis](https://web.hypothes.is/) for their annotation platform
- [Linkwarden](https://linkwarden.app/) for bookmark management integration
- All contributors who have helped improve this project
