#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}--- Starting RFSight ---${NC}"

# Check for .env file
if [ ! -f backend/.env ]; then
    echo -e "${RED}[ERROR] Configuration file 'backend/.env' not found.${NC}"
    echo "Please run './install.sh' first to generate configurations."
    exit 1
fi

# Check for Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}[ERROR] Docker is not installed.${NC}"
    exit 1
fi

if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}[ERROR] docker-compose is not installed.${NC}"
    exit 1
fi

echo -e "${BLUE}[INFO] Building and starting containers...${NC}"
docker compose up --force-recreate

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}[SUCCESS] RFSight is running!${NC}"
    echo "------------------------------------------------"
    echo "UI Access:    https://ui.rfsight.duckdns.org"
    echo "API Access:   https://backend.rfsight.duckdns.org"
    echo "Mongo Admin:  http://localhost:3046"
    echo "Mail Dev:     http://localhost:5400"
    echo "------------------------------------------------"
    echo "Default Login:"
    echo "User: root"
    echo "Pass: Admin@123"
    echo "------------------------------------------------"
else
    echo -e "${RED}[ERROR] Failed to start containers.${NC}"
    exit 1
fi
