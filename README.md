# Langtrain Studio Desktop

<div align="center">
  <img src="public/langtrain-app-logo.svg" alt="Langtrain Logo" width="128" height="128">
  
  **The desktop companion for [Langtrain](https://www.langtrain.xyz) - AI Fine-tuning Made Simple**
  
  [![Tauri](https://img.shields.io/badge/Tauri-2.0-blue?logo=tauri)](https://tauri.app)
  [![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://typescriptlang.org)
  [![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)
</div>

---

## Overview

Langtrain Studio is a cross-platform desktop application for managing AI model fine-tuning workflows. Built with Tauri for native performance, it provides a seamless experience for:

- 🎯 **Fine-tuning Jobs** - Create, monitor, and manage training runs
- 📊 **Analytics** - Real-time metrics and usage insights
- 📁 **Datasets** - Upload and manage training datasets
- 🤖 **Models** - Browse and download base models
- ⚙️ **Settings** - Configure API keys, preferences, and more

## Screenshots

| Dashboard | Training | Analytics |
|-----------|----------|-----------|
| ![Dashboard](docs/screenshots/dashboard.png) | ![Training](docs/screenshots/training.png) | ![Analytics](docs/screenshots/analytics.png) |

## Features

### Core Functionality
- **TOTP Authentication** - Secure 2FA login with authenticator apps
- **Real-time Monitoring** - Live training metrics and logs
- **Cross-platform** - Native apps for Windows and Linux (macOS via Swift app)
- **Offline Support** - Works offline with local model training
- **Cloud Sync** - Seamless sync with Langtrain cloud infrastructure

### Technical Highlights
- **Native Performance** - Built with Rust/Tauri, uses only ~50MB RAM
- **Secure Storage** - Credentials stored in system keychain
- **Modern UI** - Premium dark theme with smooth animations
- **API Integration** - Full access to Langtrain API endpoints

## Installation

### Pre-built Binaries

Download the latest release for your platform:

| Platform | Download |
|----------|----------|
| Windows (64-bit) | [Langtrain-Studio-Setup.exe](https://github.com/langtrain-ai/langtrain-studio-desktop/releases) |
| Linux (AppImage) | [Langtrain-Studio.AppImage](https://github.com/langtrain-ai/langtrain-studio-desktop/releases) |
| Linux (Debian) | [langtrain-studio.deb](https://github.com/langtrain-ai/langtrain-studio-desktop/releases) |

> **macOS Users**: Please download the native Swift app from [langtrain-studio](https://github.com/langtrain-ai/langtrain-studio/releases) for the best experience on Apple Silicon and Intel Macs.


### Build from Source

#### Prerequisites

- [Node.js](https://nodejs.org/) 18+
- [Rust](https://rustup.rs/) 1.70+
- Platform-specific dependencies:
  - **Windows**: Visual Studio Build Tools
  - **Linux**: `libwebkit2gtk-4.1-dev`, `libssl-dev`, `libgtk-3-dev`

#### Steps

```bash
# Clone the repository
git clone https://github.com/langtrain-ai/langtrain-studio-desktop.git
cd langtrain-studio-desktop

# Install dependencies
npm install

# Run in development mode
npm run tauri dev

# Build for production
npm run tauri build
```

## Development

### Project Structure

```
langtrain-studio-desktop/
├── src/                    # React frontend
│   ├── components/
│   │   ├── layout/        # MainLayout, Sidebar
│   │   └── views/         # Page components
│   ├── services/          # API & Auth services
│   ├── lib/               # Utilities & theme
│   └── styles/            # Global CSS
├── src-tauri/             # Rust backend
│   ├── src/               # Rust source
│   └── icons/             # App icons
└── public/                # Static assets
```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build React frontend |
| `npm run tauri dev` | Run Tauri in development |
| `npm run tauri build` | Build production bundle |
| `npm run preview` | Preview production build |

### Environment Configuration

The app connects to:
- **API**: `https://api.langtrain.xyz`
- **Auth**: `https://www.langtrain.xyz/api/auth`

For local development with a custom backend:
```typescript
// src/services/api.ts
export const API_CONFIG = {
    baseURL: 'http://localhost:8000',  // Local backend
    webURL: 'http://localhost:3000',   // Local web
};
```

## Architecture

### Frontend (React)

- **State Management**: React hooks + AuthManager singleton
- **Routing**: React Router DOM v7
- **Styling**: CSS Modules with CSS variables
- **Icons**: Lucide React

### Backend (Tauri/Rust)

- **Window Management**: Native window controls
- **Storage**: Plugin-based secure storage
- **Shell**: URL opening and external commands

### API Integration

```typescript
import { apiClient } from './services/api';

// List fine-tuning jobs
const jobs = await apiClient.listFineTuningJobs();

// Create a new job
await apiClient.createFineTuningJob({
  datasetId: 'ds-123',
  baseModel: 'llama-3-8b',
  trainingMethod: 'qlora',
});
```

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

## Roadmap

- [ ] Command palette (⌘K)
- [ ] Keyboard shortcuts
- [ ] Light/Dark theme toggle
- [ ] Real-time job notifications
- [ ] Local model training (MLX/GGML)
- [ ] Model export to ONNX

## Support

- 📖 [Documentation](https://www.langtrain.xyz/docs)
- 💬 [Discord Community](https://discord.gg/langtrain)
- 📧 [Email Support](mailto:support@langtrain.xyz)
- 🐛 [Issue Tracker](https://github.com/langtrain-ai/langtrain-studio-desktop/issues)

## License

Copyright © 2024 Langtrain AI Private Limited. All rights reserved.

This software is proprietary and confidential. Unauthorized copying, modification,
distribution, or use of this software is strictly prohibited.

---

<div align="center">
  Built with ❤️ by the <a href="https://www.langtrain.xyz">Langtrain</a> team
</div>
