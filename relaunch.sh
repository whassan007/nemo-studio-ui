#!/usr/bin/env bash

echo "========================================="
echo "   Relaunching NeMo Studio UI            "
echo "========================================="

# Ensure we are executing from the script's directory
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$DIR"

# 1. Shutdown existing services
if [ -x "./shutdown.sh" ]; then
    ./shutdown.sh
else
    echo "Warning: shutdown.sh not found or not executable!"
fi

echo ""
echo "Starting fresh instance..."
echo "-----------------------------------------"

# 2. Launch again
if [ -x "./launch.sh" ]; then
    # Passes control entirely to launch.sh, keeping the terminal open for logs
    ./launch.sh
else
    echo "Error: launch.sh is missing or not executable! Cannot relaunch."
    exit 1
fi
