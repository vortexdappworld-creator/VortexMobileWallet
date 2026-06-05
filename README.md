<div align="center">

# Vortex: Secure Crypto Wallet

Anti-scam, open-source crypto wallet for every chain.
Supports Bitcoin, Ethereum, Solana, Tron, BNB Smart Chain, and more.

[![Github Stars](https://img.shields.io/github/stars/vortexdappworld-creator/VortexMobileWallet?logo=github&style=for-the-badge&labelColor=000)](https://github.com/vortexdappworld-creator/VortexMobileWallet/stargazers)
[![Last commit](https://img.shields.io/github/last-commit/vortexdappworld-creator/VortexMobileWallet.svg?style=for-the-badge&labelColor=000)](https://github.com/vortexdappworld-creator/VortexMobileWallet/commits/main)
[![Issues](https://img.shields.io/github/issues-raw/vortexdappworld-creator/VortexMobileWallet.svg?style=for-the-badge&labelColor=000)](https://github.com/vortexdappworld-creator/VortexMobileWallet/issues?q=is%3Aissue+is%3Aopen)
[![License](https://img.shields.io/github/license/vortexdappworld-creator/VortexMobileWallet?style=for-the-badge&labelColor=000)](LICENSE.md)

</div>

## 📋 Table of Contents

- [🗂 Project Structure](#-project-structure)
- [🚀 Getting Onboard](#-getting-onboard)
- [🧑‍💻 Development](#-development)
- [💡 Support](#-support)
- [🔰 Security](#-security)
- [📄 License](#-license)

## 🗂 Project Structure

This is a monorepo managed with Yarn workspaces.

```
VortexMobileWallet/
├── apps/
│   ├── desktop/        # Electron desktop app (macOS, Windows, Linux)
│   ├── ext/            # Browser extension (Chrome)
│   ├── mobile/         # React Native mobile app (iOS, Android)
│   ├── web/            # Web application
│   └── web-embed/      # Embeddable web component
├── packages/
│   ├── components/     # Shared UI component library
│   ├── core/           # Core business logic & crypto utilities
│   ├── kit/            # Main UI kit
│   ├── kit-bg/         # Background service kit
│   ├── qr-wallet-sdk/  # QR-code hardware wallet SDK
│   └── shared/         # Shared utilities, constants, and types
├── development/        # Dev tooling & scripts
├── patches/            # Dependency patches
└── docs/               # Documentation & i18n
```

## 🚀 Getting Onboard

> **Prerequisites:** Node.js >= 22, Yarn 4.x (bundled via Corepack), [Git LFS](https://git-lfs.github.com/)

```bash
git clone https://github.com/vortexdappworld-creator/VortexMobileWallet.git
cd VortexMobileWallet
yarn
yarn app:web    # starts dev server at http://localhost:3000
```

<details>
<summary><strong>📱 Platform-specific requirements</strong></summary>

- **iOS:** Xcode >= 13.3
- **Android:** JDK >= 11

</details>

## 🧑‍💻 Development

Run these commands from the root directory:

| Command | Description |
|---------|-------------|
| `yarn app:web` | Start web dev server (port 3000) |
| `yarn app:ios` | Run iOS app via USB-connected device |
| `yarn app:android` | Run Android app |
| `yarn app:desktop` | Run desktop (Electron) app |
| `yarn app:ext` | Run browser extension |

## 💡 Support

- [GitHub Issues](https://github.com/vortexdappworld-creator/VortexMobileWallet/issues) — Bug reports and feature requests.
- Email: **vortexdappworld@gmail.com**

## 🔰 Security

- Please report suspected vulnerabilities **privately** to **vortexdappworld@gmail.com**.
- Please do **NOT** open publicly viewable issues for suspected security vulnerabilities.

## 📄 License

This project is licensed under the [MIT License](LICENSE.md).
