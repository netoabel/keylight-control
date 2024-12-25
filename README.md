# Keylight Control

A sleek desktop application to control your Elgato Key Light. Features automatic camera-based control.

![App Screenshot](screenshots/app.png)

## Features

- 🎥 Camera-based auto-mode: automatically controls your Key Light based on camera usage
- 💡 Manual brightness control with customizable presets
- 🌡️ Color temperature control with customizable presets
- 🖥️ Native desktop app for macOS (Apple Silicon & Intel)

## Installation

1. Download the [latest version](https://github.com/netoabel/keylight-control/releases/latest)

2. After installing, open Terminal and run:

```bash
xattr -cr /Applications/keylight-control.app
```

3. Open the app and enjoy!

### Requirements

- macOS 10.13 or later
- Elgato Key Light connected to your network

## Usage

### Presets

The app includes customizable presets for both brightness and color temperature:

#### Brightness Presets (Low/High)

- Click a preset button to apply its brightness value
- Long press a preset button to save the current brightness as the new preset value
- Note: High preset must be brighter than Low preset

#### Temperature Presets (Warm/Cold)

- Click a preset button to apply its temperature value
- Long press a preset button to save the current temperature as the new preset value
- Note: Cold preset must be cooler (higher Kelvin) than Warm preset

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
