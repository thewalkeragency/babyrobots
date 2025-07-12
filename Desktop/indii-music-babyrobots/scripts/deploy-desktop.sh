#!/bin/bash

# 🖥️ Indii Music Desktop Deployment Script
# This script prepares and builds the desktop version

echo "🎵 Indii Music Desktop Deployment Starting..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Create desktop directory structure
echo "📁 Creating desktop application structure..."
mkdir -p desktop
mkdir -p desktop/src-tauri
mkdir -p desktop/dist

# Install dependencies
echo "📦 Installing desktop dependencies..."
npm install

# Build the web application
echo "🏗️ Building web application..."
npm run build

# Option 1: Setup for Tauri (Recommended)
echo "🦀 Setting up Tauri desktop application..."
if command -v cargo &> /dev/null; then
    echo "✅ Rust/Cargo found, proceeding with Tauri setup..."
    
    # Install Tauri CLI if not already installed
    if ! command -v cargo-tauri &> /dev/null; then
        echo "📥 Installing Tauri CLI..."
        cargo install tauri-cli
    fi
    
    # Create Tauri configuration
    cat > desktop/src-tauri/tauri.conf.json << 'EOF'
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "beforeBuildCommand": "npm run build",
    "devPath": "http://localhost:3000",
    "distDir": "../out",
    "withGlobalTauri": false
  },
  "package": {
    "productName": "Indii Music",
    "version": "1.0.0"
  },
  "tauri": {
    "allowlist": {
      "all": true,
      "fs": {
        "all": true,
        "scope": ["$APPDATA/indii-music/*", "$DESKTOP/*", "$DOWNLOAD/*"]
      }
    },
    "bundle": {
      "active": true,
      "category": "Music",
      "copyright": "2025 Indii Music",
      "deb": {
        "depends": []
      },
      "externalBin": [],
      "icon": [
        "icons/32x32.png",
        "icons/128x128.png",
        "icons/128x128@2x.png",
        "icons/icon.icns",
        "icons/icon.ico"
      ],
      "identifier": "com.indii-music.app",
      "longDescription": "Professional music platform for artists, licensors, and fans",
      "macOS": {
        "entitlements": null,
        "exceptionDomain": "",
        "frameworks": [],
        "providerShortName": null,
        "signingIdentity": null
      },
      "resources": [],
      "shortDescription": "Indii Music Platform",
      "targets": "all",
      "windows": {
        "certificateThumbprint": null,
        "digestAlgorithm": "sha256",
        "timestampUrl": ""
      }
    },
    "security": {
      "csp": null
    },
    "updater": {
      "active": false
    },
    "windows": [
      {
        "fullscreen": false,
        "height": 800,
        "resizable": true,
        "title": "Indii Music",
        "width": 1200,
        "minWidth": 800,
        "minHeight": 600
      }
    ]
  }
}
EOF

    # Create main Rust file for Tauri
    cat > desktop/src-tauri/src/main.rs << 'EOF'
#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

use tauri::Manager;

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
EOF

    # Create Cargo.toml for Tauri
    cat > desktop/src-tauri/Cargo.toml << 'EOF'
[package]
name = "indii-music"
version = "1.0.0"
description = "Professional music platform for artists, licensors, and fans"
authors = ["Indii Music Team"]
license = "MIT"
repository = "https://github.com/thewalkeragency/babyrobots"
edition = "2021"

[build-dependencies]
tauri-build = { version = "1.0", features = [] }

[dependencies]
serde_json = "1.0"
serde = { version = "1.0", features = ["derive"] }
tauri = { version = "1.0", features = ["api-all"] }

[features]
default = ["custom-protocol"]
custom-protocol = ["tauri/custom-protocol"]
EOF

    echo "✅ Tauri setup complete!"
    echo "🚀 To build desktop app, run: cd desktop && cargo tauri build"
    
else
    echo "⚠️ Rust not found. Installing via Electron instead..."
    
    # Option 2: Setup for Electron
    echo "⚡ Setting up Electron desktop application..."
    npm install electron electron-builder --save-dev
    
    # Create main.js for Electron
    cat > desktop/main.js << 'EOF'
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    const mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        minWidth: 800,
        minHeight: 600,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: path.join(__dirname, 'assets/icon.png'),
        titleBarStyle: 'default',
        show: false
    });

    // Load the app
    if (isDev) {
        mainWindow.loadURL('http://localhost:3000');
        mainWindow.webContents.openDevTools();
    } else {
        mainWindow.loadFile(path.join(__dirname, '../out/index.html'));
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Create application menu
    const template = [
        {
            label: 'File',
            submenu: [
                { role: 'quit' }
            ]
        },
        {
            label: 'Edit',
            submenu: [
                { role: 'undo' },
                { role: 'redo' },
                { type: 'separator' },
                { role: 'cut' },
                { role: 'copy' },
                { role: 'paste' }
            ]
        },
        {
            label: 'View',
            submenu: [
                { role: 'reload' },
                { role: 'forceReload' },
                { role: 'toggleDevTools' },
                { type: 'separator' },
                { role: 'resetZoom' },
                { role: 'zoomIn' },
                { role: 'zoomOut' },
                { type: 'separator' },
                { role: 'togglefullscreen' }
            ]
        },
        {
            label: 'Window',
            submenu: [
                { role: 'minimize' },
                { role: 'close' }
            ]
        }
    ];

    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
});
EOF

    # Create preload.js for Electron
    cat > desktop/preload.js << 'EOF'
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    // Add any secure APIs you want to expose to the renderer process
    platform: process.platform,
    openDevTools: () => ipcRenderer.invoke('open-dev-tools')
});
EOF

    echo "✅ Electron setup complete!"
    echo "🚀 To build desktop app, run: npm run electron:build"
fi

# Update package.json scripts
echo "📝 Updating package.json scripts..."
node -p "
const pkg = require('./package.json');
pkg.scripts = {
    ...pkg.scripts,
    'electron': 'electron desktop/main.js',
    'electron:dev': 'NODE_ENV=development electron desktop/main.js',
    'electron:build': 'npm run build && electron-builder',
    'tauri:dev': 'cd desktop && cargo tauri dev',
    'tauri:build': 'cd desktop && cargo tauri build',
    'desktop:dev': pkg.scripts['tauri:dev'] || pkg.scripts['electron:dev'],
    'desktop:build': pkg.scripts['tauri:build'] || pkg.scripts['electron:build']
};
JSON.stringify(pkg, null, 2);
" > package.json.tmp && mv package.json.tmp package.json

echo ""
echo "🎉 Desktop application setup complete!"
echo ""
echo "🚀 Available commands:"
echo "  npm run desktop:dev    - Run desktop app in development"
echo "  npm run desktop:build  - Build desktop app for production"
echo ""
echo "📱 Your Indii Music app is ready for desktop deployment!"
echo "🔗 GitHub repository updated at: https://github.com/thewalkeragency/babyrobots"
echo ""

# Final commit
git add .
git commit -m "🖥️ Desktop application setup complete - Ready for deployment"
git push origin main

echo "✅ All changes pushed to GitHub!"
echo "🎵 Indii Music Desktop is ready to rock! 🚀"
