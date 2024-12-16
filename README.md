# Keylight Control

A desktop application built with Electron and React to control Elgato Key Light devices. This app provides an easy-to-use interface for managing your Key Light settings directly from your desktop.

## Features

- Toggle Key Light on/off
- Adjust brightness levels
- Quick preset controls (High/Low brightness)
- System theme support (light/dark mode)
- Native desktop application for macOS, Windows, and Linux

## Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Git

### Setup

1. Clone the repository

```bash
git clone https://github.com/netoabel/keylight-control.git
cd keylight-control
```

2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run electron:dev
```

### Building

To create a production build:

```bash
npm run electron:build
```

This will generate platform-specific installers in the `release` directory.
