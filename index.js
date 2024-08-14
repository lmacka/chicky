const express = require('express');
const { spawnSync } = require('child_process');
const { Client } = require('ssh2');
const net = require('net');
const fs = require('fs');
const path = require('path');
const config = require('./config');

const app = express();
const port = config.port;
const remoteHost = config.remoteHost;
const remotePort = config.remotePort;
const sshUsername = config.sshUsername;
const privateKeyPath = config.privateKeyPath;
const debug = config.debug;
const servo1 = config.servo1;
const servo2 = config.servo2;

app.use(express.json());

function executeScript(args) {
    const result = spawnSync('python3', ['chicky.py', ...args]);

    if (result.error) {
        console.error(`spawnSync error: ${result.error}`);
        return { success: false, message: 'Error executing script' };
    }

    if (result.stderr.toString()) {
        console.error(`stderr: ${result.stderr.toString()}`);
        return { success: false, message: 'Error executing script' };
    }

    return { success: true };
}

app.post('/up', (req, res) => {
    const { servo } = req.body;
    const servoValue = servo === 'servo1' ? servo1 : servo2;
    console.log('Received request to /up with servo:', servo);
    const result = executeScript([servoValue.toString(), '180']);

    if (!result.success) {
        return res.status(500).send(result.message);
    }

    res.send('Servo up');
});

app.post('/down', (req, res) => {
    const { servo } = req.body;
    const servoValue = servo === 'servo1' ? servo1 : servo2;
    console.log('Received request to /down with servo:', servo);
    const result = executeScript([servoValue.toString(), '0']);

    if (!result.success) {
        return res.status(500).send(result.message);
    }

    res.send('Servo down');
});

app.post('/cycle', (req, res) => {
    const { servo } = req.body;
    const servoValue = servo === 'servo1' ? servo1 : servo2;
    console.log('Received request to /cycle with servo:', servo);

    let result = executeScript([servoValue.toString(), '0']);
    if (!result.success) {
        return res.status(500).send(result.message);
    }

    setTimeout(() => {
        result = executeScript([servoValue.toString(), '180']);
        if (!result.success) {
            return res.status(500).send(result.message);
        }

        res.send('Servo cycled');
    }, 3000);
});

const conn = new Client();

function connectSSH() {
    if (debug) console.log('Attempting to connect via SSH...');
    conn.on('ready', () => {
        if (debug) console.log('Client :: ready');
        conn.forwardIn('0.0.0.0', remotePort, (err) => {
            if (err) {
                console.error('Error setting up reverse tunnel:', err);
                return;
            }
            console.log(`Reverse tunnel set up from ${remoteHost}:${remotePort} to localhost:${port}`);
        });

        conn.on('tcp connection', (info, accept, reject) => {
            if (debug) console.log(`TCP connection from ${info.srcIP}:${info.srcPort}`);
            const stream = accept();
            const localSocket = new net.Socket();

            localSocket.connect(port, '127.0.0.1', () => {
                if (debug) console.log(`Connected to localhost:${port}`);
            });

            stream.on('data', (data) => {
                if (debug) console.log('TCP :: DATA: ' + data);
                localSocket.write(data);
            });

            localSocket.on('data', (data) => {
                if (debug) console.log('Local :: DATA: ' + data);
                stream.write(data);
            });

            stream.on('close', () => {
                if (debug) console.log('TCP :: CLOSED');
                localSocket.end();
            });

            localSocket.on('close', () => {
                if (debug) console.log('Local :: CLOSED');
                stream.end();
            });
        });
    }).on('error', (err) => {
        console.error('SSH connection error:', err);
        setTimeout(connectSSH, 5000); // Retry connection after 5 seconds
    }).on('end', () => {
        if (debug) console.log('SSH connection ended');
        setTimeout(connectSSH, 5000); // Retry connection after 5 seconds
    }).on('close', (hadError) => {
        if (debug) console.log('SSH connection closed', hadError ? 'due to error' : '');
        setTimeout(connectSSH, 5000); // Retry connection after 5 seconds
    }).connect({
        host: remoteHost,
        port: 22,
        username: sshUsername,
        privateKey: fs.readFileSync(privateKeyPath)
    });
    if (debug) console.log('SSH connection initiated');
}

connectSSH();

app.listen(port, '0.0.0.0', () => {
    console.log(`Chicky app listening locally at http://0.0.0.0:${port}`);
});