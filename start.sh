#!/bin/bash

USER=ubuntu
BRANCH=devel

update() {
    # Navigate to the project directory
    cd /home/$USER/chicky || { echo "Directory not found"; exit 1; }

    # Pull the latest code from the repository
    git pull origin $BRANCH

    # Check for dependencies and install if required
    /usr/bin/npm install
}

start() {
    # Navigate to the project directory
    cd /home/$USER/chicky || { echo "Directory not found"; exit 1; }

    # Start the Node.js application
    /usr/bin/node /home/$USER/chicky/server.js
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
if [ ! -d "/home/$USER/chicky" ]
then
    echo "Project directory not found. Please clone the repository and try again."
    exit 1
fi

# Update the application
update

# Start the application
start