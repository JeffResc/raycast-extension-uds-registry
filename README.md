# UDS Registry Search

A Raycast extension for searching and browsing packages in the UDS Registry (registry.defenseunicorns.com).

## Features

- **Search Packages**: Browse and search through all available packages in the UDS Registry catalog
- **Package Details**: View detailed information about each package including:
  - Available versions and architectures
  - CVE/vulnerability summaries
  - Package sizes and metadata
  - Components and flavors
- **Public & Authenticated Access**: Works without authentication by default, with optional token support for enhanced data access
- **Configurable Registry**: Support for custom registry URLs

## Installation

### For Development

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` to start development mode
4. The extension will appear in Raycast

### For Production

Run `npm run build` to build the extension for production use.

## Configuration

Open Raycast preferences for this extension to configure:

### Registry URL (Optional)
- **Default**: `https://registry.defenseunicorns.com`
- Set a custom registry URL if you're using a different UDS Registry instance

### Authentication Token (Optional)
- **Default**: None (public access)
- For enhanced data access, you can provide a Bearer token from your authenticated browser session

#### How to get your authentication token:

1. Log in to the UDS Registry at https://registry.defenseunicorns.com through your browser (via Keycloak SSO)
2. Open your browser's Developer Tools (F12 or Cmd+Option+I)
3. Go to the Network tab
4. Refresh the page or navigate to a package
5. Find any request to `registry.defenseunicorns.com`
6. Look for the `Authorization` header in the request headers
7. Copy the Bearer token value (everything after "Bearer ")
8. Paste it into the "Authentication Token" field in Raycast preferences

Note: The token may expire after some time, and you'll need to retrieve a fresh one.

## Usage

1. Open Raycast (Cmd+Space or your configured hotkey)
2. Type "Search UDS Registry" or start typing package names
3. Browse through the list of packages
4. Press Enter or click to view detailed package information
5. Use keyboard shortcuts:
   - `Cmd+O` - Open package repository in browser
   - `Cmd+C` - Copy package reference to clipboard

## Development

- `npm run dev` - Start development mode
- `npm run build` - Build for production
- `npm run lint` - Run linter
- `npm run fix-lint` - Fix linting issues

## License

MIT