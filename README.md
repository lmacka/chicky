# chicky
A small application to securely control servos, lights and stream RTSP feeds

This app is designed to be run on a Raspberry Pi Zero which lives inside the chicken coop.  It provides an API to control a pair of servos locally, but also creates a SSH tunnel to a remote host (a VPS somewhere) so that its sister application can access the API via `localhost`.

The point of this is to not poke any holes in my home router and instead tunnel the required services directly to the host that needs them, thus increasing the security posture of the whole setup.

## Quickstart

### Prerequisites

Ensure you have the following installed on your Raspberry Pi Zero:
- Node.js
- npm
- git

### Installation

1. **Clone the Repository**

    ```bash
    git clone https://github.com/lmacka/chicky.git
    cd chicky
    ```

2. **Install Dependencies**

    ```bash
    npm install --no-fund --no-audit
    ```

3. **Configure the Application**

    Edit `config.js` appropriately. For example, you might need to set the remote host for the SSH tunnel.
    Edit `start.sh` and set the user you'll run as.

4. **Run the Application**

    ```bash
    node server.js
    ```

### Running as a Service

To run the application as a service using `systemd`, follow these steps:

1. **Create a Systemd Service File**

    ```bash
    sudo nano /etc/systemd/system/chicky.service
    ```

    Add the following content to the file:

    ```ini
    [Unit]
    Description=chicky - A small Raspberry Pi application to securely control servos, lights and stream RTSP feeds.
    Documentation=https://github.com/lmacka/chicky
    After=network.target

    [Service]
    ExecStart=/usr/bin/node /home/ubuntu/chicky/server.js
    WorkingDirectory=/home/ubuntu/chicky
    StandardOutput=inherit
    StandardError=inherit
    Restart=always
    User=ubuntu

    [Install]
    WantedBy=multi-user.target
    ```

2. **Reload Systemd and Start the Service**

    ```bash
    sudo systemctl daemon-reload
    sudo systemctl start chicky
    sudo systemctl enable chicky
    ```

3. **Check the Status of the Service**

    ```bash
    sudo systemctl status chicky
    ```

### Updating the Application

To update the application, navigate to the project directory and pull the latest changes:

```bash
cd /home/ubuntu/chicky
git pull origin devel