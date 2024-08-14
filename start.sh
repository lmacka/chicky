#!/bin/bash

USER=ubuntu
BRANCH=devel

# Navigate to the project directory
cd /home/$USER/chicky

# Stash local changes to config.js and start.sh
git stash push -m "Stash before pull" config.js start.sh

# Pull the latest code from the repository
git pull origin $BRANCH

# Apply the stashed changes back
git stash pop

# Start the Node.js application
/usr/bin/node /home/$USER/chicky/server.js