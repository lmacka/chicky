const path = require('path');

module.exports = {
    port: 3000,
    debug: false, // Set this to false to disable debug output
    servo1: 15, // GPIO pin for servo 1
    servo2: 14, // GPIO pin for servo 2
    remote_ws: 'wss://onlychicks.tv/ws/' // Remote WebSocket URL
};
