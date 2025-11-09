#!/bin/bash

# Database Setup Script for ContentScribe Blog
# This script helps you set up MongoDB correctly

MONGO_BIN="/Users/pradnishchintada/mongodb-macos-aarch64-8.0.8/bin/mongod"
DATA_DIR="$HOME/data/db"
LOG_FILE="$HOME/data/db/mongod.log"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ContentScribe Blog - Database Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Step 1: Create data directory
echo -e "${YELLOW}Step 1: Creating data directory...${NC}"
if [ ! -d "$DATA_DIR" ]; then
    mkdir -p "$DATA_DIR"
    echo -e "${GREEN}✅ Data directory created: $DATA_DIR${NC}"
else
    echo -e "${GREEN}✅ Data directory already exists: $DATA_DIR${NC}"
fi
echo ""

# Step 2: Check if MongoDB is already running
echo -e "${YELLOW}Step 2: Checking if MongoDB is already running...${NC}"
if pgrep -f "mongod" > /dev/null; then
    echo -e "${GREEN}✅ MongoDB is already running${NC}"
    ps aux | grep mongod | grep -v grep | head -1
    echo ""
    echo -e "${YELLOW}MongoDB is ready to use!${NC}"
    echo -e "Connection string: ${BLUE}mongodb://127.0.0.1:27017/content_scribe${NC}"
    exit 0
else
    echo -e "${YELLOW}MongoDB is not running${NC}"
fi
echo ""

# Step 3: Check MongoDB binary
echo -e "${YELLOW}Step 3: Checking MongoDB binary...${NC}"
if [ ! -f "$MONGO_BIN" ]; then
    echo -e "${RED}❌ MongoDB binary not found at: $MONGO_BIN${NC}"
    echo ""
    echo "Please either:"
    echo "1. Update MONGO_BIN path in this script, or"
    echo "2. Install MongoDB via Homebrew: brew install mongodb-community"
    exit 1
else
    echo -e "${GREEN}✅ MongoDB binary found${NC}"
fi
echo ""

# Step 4: Start MongoDB
echo -e "${YELLOW}Step 4: Starting MongoDB...${NC}"
echo -e "Data directory: ${BLUE}$DATA_DIR${NC}"
echo -e "Log file: ${BLUE}$LOG_FILE${NC}"
echo ""

# Try to start MongoDB in background
echo -e "${YELLOW}Starting MongoDB in background mode...${NC}"
$MONGO_BIN --dbpath "$DATA_DIR" --fork --logpath "$LOG_FILE" --logappend

if [ $? -eq 0 ]; then
    sleep 2
    if pgrep -f "mongod" > /dev/null; then
        echo -e "${GREEN}✅ MongoDB started successfully!${NC}"
        echo ""
        echo -e "Connection details:"
        echo -e "  Host: ${BLUE}127.0.0.1${NC}"
        echo -e "  Port: ${BLUE}27017${NC}"
        echo -e "  Database: ${BLUE}content_scribe${NC}"
        echo -e "  Connection String: ${BLUE}mongodb://127.0.0.1:27017/content_scribe${NC}"
        echo ""
        echo -e "${GREEN}Next steps:${NC}"
        echo "1. Start backend: cd server && npm run dev"
        echo "2. Start frontend: npm run dev"
        echo "3. Open http://localhost:8080 in your browser"
    else
        echo -e "${RED}❌ MongoDB process not found after startup${NC}"
        echo "Check the log file: $LOG_FILE"
        exit 1
    fi
else
    echo -e "${RED}❌ Failed to start MongoDB${NC}"
    echo ""
    echo "Troubleshooting:"
    echo "1. Check the log file: $LOG_FILE"
    echo "2. Make sure port 27017 is not in use: lsof -i :27017"
    echo "3. Try running in foreground to see errors:"
    echo "   $MONGO_BIN --dbpath $DATA_DIR"
    exit 1
fi

