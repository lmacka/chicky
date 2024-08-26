const express = require('express');
const { spawnSync } = require('child_process');
const config = require('./config');
const WebSocket = require('ws');

const app = express();
const port = config.port;
const remote_ws = config.remote_ws;

app.use(express.json());

let ws;
let isAlive = true;

function toggleLightHandler(req, res) {
    const { state } = req.body;
    if (state !== 'on' && state !== 'off') {
        return res.status(400).send('Invalid state. Use "on" or "off".');
    }

    console.log('Received request to /toggle-light with state:', state);

    // Run the Python script using the state
    const result = spawnSync('poetry', ['run', 'python3', 'light.py', state]);

    if (result.error) {
        console.error('Error executing Python script:', result.error);
        return res.status(500).send('Failed to toggle light');
    }

    console.log('Python script output:', result.stdout.toString());
    res.send(`Light toggled ${state}`);
}

function feedHandler(req, res) {
    const { servo } = req.body;
    let servoValue;

    if (servo === 'servo1') {
        servoValue = config.servo1;
    } else if (servo === 'servo2') {
        servoValue = config.servo2;
    } else {
        return res.status(400).send('Invalid servo. Use "servo1" or "servo2".');
    }

    console.log(`Received request to move ${servo}`);

    // Run the Python script to move the servo to 180 degrees
    const result = spawnSync('poetry', ['run', 'python3', 'servocontrol.py', servoValue, '180']);

    if (result.error) {
        console.error('Error executing Python script:', result.error);
        return res.status(500).send(`Failed to move ${servo} to 180 degrees`);
    }

    console.log('Python script output:', result.stdout.toString());

    // Wait for 0.5 seconds and then move the servo to 1 degree
    setTimeout(() => {
        const result2 = spawnSync('poetry', ['run', 'python3', 'servocontrol.py', servoValue, '1']);

        if (result2.error) {
            console.error('Error executing Python script:', result2.error);
            return res.status(500).send(`Failed to move ${servo} to 1 degree`);
        }

        console.log('Python script output:', result2.stdout.toString());
        res.send(`${servo} moved to 180 degrees and then to 1 degree`);
    }, 500);
}

function connectWebSocket() {
    ws = new WebSocket(remote_ws);

    // Handle WebSocket connection open event
    ws.on('open', () => {
        console.log('Connected to remote WebSocket server');
        // Send identification message
        ws.send(JSON.stringify({ type: 'identify', name: 'chicky' }));

        // Start heartbeat
        setInterval(() => {
            if (isAlive === false) {
                console.log('Terminating connection due to no pong response');
                return ws.terminate();
            }

            isAlive = false;
            ws.ping();
        }, 30000); // Ping every 30 seconds
    });

    // Handle WebSocket pong response
    ws.on('pong', () => {
        isAlive = true;
    });

    // Handle WebSocket messages
    ws.on('message', (message) => {
        // Convert Buffer to string
        const decodedMessage = message.toString('utf8');
        console.log('Received message from remote server:', decodedMessage);

        // Handle the incoming message
        handleWebSocketMessage(decodedMessage);
    });

    // Handle WebSocket errors
    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    // Handle WebSocket close event
    ws.on('close', () => {
        console.log('WebSocket connection closed. Attempting to reconnect...');
        setTimeout(connectWebSocket, 5000); // Attempt to reconnect after 5 seconds
    });
}

// Function to handle incoming WebSocket messages
function handleWebSocketMessage(message) {
    try {
        const parsedMessage = JSON.parse(message);
        if (parsedMessage.source === 'server') {
            // Ignore messages sent by the server itself
            return;
        }
        if (parsedMessage.command === 'toggle-light') {
            // Simulate a request to the /toggle-light endpoint
            const req = { body: { state: parsedMessage.state || 'on' } }; // Default to 'on' if state is not provided
            const res = {
                status: (code) => ({
                    send: (msg) => console.log(`Response: ${code} - ${msg}`)
                }),
                send: (msg) => console.log(`Response: ${msg}`)
            };
            toggleLightHandler(req, res);
        } else if (parsedMessage.command === 'feed') {
            // Simulate a request to the /feed endpoint
            const req = { body: { servo: parsedMessage.servo } };
            const res = {
                status: (code) => ({
                    send: (msg) => console.log(`Response: ${code} - ${msg}`)
                }),
                send: (msg) => console.log(`Response: ${msg}`)
            };
            feedHandler(req, res);
        }
    } catch (error) {
        console.error('Failed to parse message as JSON:', error);
    }
}

// Initial connection
connectWebSocket();

// app.listen(port, '127.0.0.1', () => {
//     console.log(`Chicky app listening locally at http://127.0.0.1:${port}`);
// });