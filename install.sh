#!/usr/bin/env bash
set -euo pipefail

REPO="jonathansedrez/ponto-cli"
BIN_NAME="ponto"
INSTALL_DIR="/usr/local/bin"

# Detect OS
OS=$(uname -s | tr '[:upper:]' '[:lower:]')
if [[ "$OS" != "linux" && "$OS" != "darwin" ]]; then
  echo "Unsupported OS: $OS"
  exit 1
fi

# Detect architecture
ARCH=$(uname -m)
case "$ARCH" in
  x86_64)  ARCH="x64" ;;
  aarch64) ARCH="arm64" ;;
  arm64)   ARCH="arm64" ;;
  *)
    echo "Unsupported architecture: $ARCH"
    exit 1
    ;;
esac

# Resolve latest release tag
echo "Fetching latest release..."
TAG=$(curl -fsSL "https://api.github.com/repos/$REPO/releases/latest" \
  | grep '"tag_name"' \
  | sed -E 's/.*"tag_name": *"([^"]+)".*/\1/')

if [[ -z "$TAG" ]]; then
  echo "Could not determine latest release tag."
  exit 1
fi

if [[ "$OS" == "darwin" && "$ARCH" == "x64" ]]; then
  echo "Pre-built binaries are not available for Intel Macs."
  echo "Install from source instead:"
  echo "  git clone https://github.com/${REPO} && cd ponto-cli && bun install && bun link"
  exit 1
fi

ASSET="${BIN_NAME}-${OS}-${ARCH}"
URL="https://github.com/${REPO}/releases/download/${TAG}/${ASSET}"

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

echo "Downloading $BIN_NAME $TAG for $OS/$ARCH..."
curl -fsSL "$URL" -o "$TMP"
chmod +x "$TMP"

# Install — prefer /usr/local/bin, fall back to ~/.local/bin
if [[ -w "$INSTALL_DIR" ]]; then
  mv "$TMP" "$INSTALL_DIR/$BIN_NAME"
else
  mkdir -p "$HOME/.local/bin"
  mv "$TMP" "$HOME/.local/bin/$BIN_NAME"
  INSTALL_DIR="$HOME/.local/bin"
  if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
    SHELL_PROFILE="$HOME/.zshrc"
    [[ "$SHELL" == */bash ]] && SHELL_PROFILE="$HOME/.bashrc"
    echo "" >> "$SHELL_PROFILE"
    echo "export PATH=\"\$HOME/.local/bin:\$PATH\"" >> "$SHELL_PROFILE"
    echo "Added $INSTALL_DIR to PATH in $SHELL_PROFILE"
    export PATH="$INSTALL_DIR:$PATH"
  fi
fi

echo ""
echo "ponto $TAG installed to $INSTALL_DIR/$BIN_NAME"
echo "Run 'ponto --help' to get started."
