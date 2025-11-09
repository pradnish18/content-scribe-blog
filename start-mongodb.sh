#!/bin/bash

# MongoDB Startup Script for ContentScribe Blog
# This script starts MongoDB for local development

MONGO_BIN="/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod"
DATA_DIR="$HOME/data/db"
LOG_FILE="$HOME/data/db/mongod.log"

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Starting MongoDB for ContentScribe Blog...${NC}"

# Check if MongoDB binary exists
if [ ! -f "$MONGO_BIN" ]; then
    echo -e "${RED}❌ MongoDB binary not found at: $MONGO_BIN${NC}"
    echo "Please update the MONGO_BIN path in this script."
    exit 1
fi

# Create data directory if it doesn't exist
if [ ! -d "$DATA_DIR" ]; then
    echo "Creating data directory: $DATA_DIR"
    mkdir -p "$DATA_DIR"
fi

# Check if MongoDB is already running
if pgrep -f "mongod" > /dev/null; then
    echo -e "${YELLOW}⚠️  MongoDB appears to be already running${NC}"
    echo "Process info:"
    ps aux | grep mongod | grep -v grep
    echo ""
    read -p "Do you want to continue anyway? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 0
    fi
fi

# Start MongoDB
echo "Starting MongoDB..."
echo "Data directory: $DATA_DIR"
echo "Log file: $LOG_FILE"
echo ""

# Try to start MongoDB in foreground first (easier to see errors)
echo -e "${YELLOW}Starting MongoDB in foreground mode...${NC}"
echo -e "${YELLOW}Press Ctrl+C to stop MongoDB${NC}"
echo ""

$MONGO_BIN --dbpath "$DATA_DIR" --logpath "$LOG_FILE" --logappend

# If you want to run in background instead, uncomment the following:
# $MONGO_BIN --dbpath "$DATA_DIR" --fork --logpath "$LOG_FILE" --logappend
# if [ $? -eq 0 ]; then
#     echo -e "${GREEN}✅ MongoDB started successfully in background${NC}"
#     echo "PID: $(pgrep -f mongod)"
#     echo "Log file: $LOG_FILE"
# else
#     echo -e "${RED}❌ Failed to start MongoDB${NC}"
#     echo "Check the log file: $LOG_FILE"
#     exit 1
# fi

