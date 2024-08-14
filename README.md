# chicky
A small application to securely control servos, lights and stream RTSP feeds

This app is designed to be run on a Raspberry Pi Zero which lives inside the chicken coop.  It provides an API to control a pair of servos locally, but also creates a SSH tunnel to a remote host (a VPS somewhere) so that its sister application can access the API via `localhost`.

The point of this is to not poke any holes in my home router and instead tunnel the required services directly to the host that needs them, thus increasing the security posture of the whole setup.

## Quickstart

`git clone https://github.com/lmacka/chicky.git`
