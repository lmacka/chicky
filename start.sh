#!/bin/bash

BRANCH=devel

start() {
    # Navigate to the project directory
    cd "$HOME/chicky" || { echo "Directory not found"; exit 1; }

    # Start the Node.js application
    /usr/bin/node "$HOME/chicky/server.js"
}

update() {
    # Navigate to the project directory
    cd "$HOME/chicky" || { echo "Directory not found"; exit 1; }

    # Fetch the latest changes
    git fetch origin $BRANCH

    # Check for upstream changes
    LOCAL=$(git rev-parse @)
    REMOTE=$(git rev-parse @{u})

    if [ $LOCAL != $REMOTE ]; then
        if [ -z "$INVOCATION_ID" ]; then
            read -p "There are upstream changes. Do you want to pull the latest changes? (y/n): " answer
            if [ "$answer" != "${answer#[Yy]}" ]; then
                git pull origin $BRANCH
            else
                echo "Skipping update."
            fi
        else
            echo "Skipping update when invoked by systemd."
        fi
    else
        echo "No upstream changes."
    fi
}

# Check if node is installed
if ! command -v node &> /dev/null
then
    echo "Node.js is not installed. Please install it and try again."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null
then
    echo "npm is not installed. Please install it and try again."
    exit 1
fi

# Check if git is installed
if ! command -v git &> /dev/null
then
    echo "git is not installed. Please install it and try again."
    exit 1
fi

# Check if the project directory exists
if [ ! -d "$HOME/chicky" ]
then
    echo "Project directory not found. Please clone the repository and try again."
    exit 1
fi

# Update the application
update

# Start the application
start