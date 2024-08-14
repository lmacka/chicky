const path = require('path');

module.exports = {
    port: 3000,
    remoteHost: 'onlychicks.tv', // Replace with your remote host address.  This is the cloud server that handles the masses.
    remotePort: 3080, // Port on the remote host where the API will be available
    sshUsername: 'ubuntu',
    privateKeyPath: path.resolve(process.env.HOME, '.ssh/id_ed25519'), // ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519
    debug: false, // Set this to false to disable debug output
    servo1: 14, // GPIO pin for servo 1
    servo2: 15 // GPIO pin for servo 2
};