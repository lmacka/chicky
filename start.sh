#!/bin/bash

USER=ubuntu
BRANCH=devel

# Navigate to the project directory
cd /home/$USER/chicky

# Pull the latest code from the repository
git pull origin $BRANCH

# Start the Node.js application
/usr/bin/node /home/$USER/chicky/server.js