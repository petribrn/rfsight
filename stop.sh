#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}--- Stopping RFSight ---${NC}"

# Check for Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo -e "${RED}[ERROR] docker compose is not installed.${NC}"
    exit 1
fi

echo -e "${BLUE}[INFO] Stopping containers...${NC}"

# Stop containers and remove networks
docker compose down

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}[SUCCESS] RFSight stopped successfully.${NC}"
else
    echo -e "${RED}[ERROR] Failed to stop containers.${NC}"
    exit 1
fi
