# Keylight Control

A sleek desktop application to control your Elgato Key Light. Features automatic camera-based control.

![App Screenshot](screenshots/app.png)

## Features

- 🎥 Camera-based auto-mode: automatically controls your Key Light based on camera usage
- 💡 Manual brightness control with presets
- 🖥️ Native desktop app for macOS (Apple Silicon & Intel)

## Installation

1. Download the [latest version](https://github.com/netoabel/keylight-control/releases/latest)

2. Open the app:
   - Right-click on the app
   - Select "Open" from the context menu
   - Click "Open" in the security dialog

Alternatively, you can run this command in Terminal:

```bash
xattr -cr /Applications/keylight-control.app
```

### Requirements

- macOS 10.13 or later
- Elgato Key Light connected to your network

## Development

```bash
# Clone the repository
git clone https://github.com/netoabel/keylight-control.git
cd keylight-control

# Install dependencies
npm install

# Start development server
npm run electron:dev

# Build for production
npm run electron:build
```

## License

MIT © [Abel Neto](https://github.com/netoabel)
