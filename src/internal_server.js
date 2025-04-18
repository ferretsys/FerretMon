import { WebSocketServer } from 'ws';
import { sendServerData } from './socket.js';
import http from 'http';

const PORT = 83;

const httpServer = http.createServer((req, res) => {
    if (req.url == "/notify_server_update") {
        notifiedUpdateDowntimeTimestamp = Math.floor(Date.now() / 1000);
        buildAndSendConnectionData();
        console.log("Server update notification received");
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.end('Server update notification received');
        return;
    }
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Unknown request');
});

const wss = new WebSocketServer({ server: httpServer });

var runtimeStatistics = {};
var serverStatistics = {};
var currentInternalServerSocket = null;
var downtime = 0;
var notifiedUpdateDowntimeTimestamp = 0;

export function buildAndSendStatisticData(target = null) {
    sendServerData(JSON.stringify({
        type: "runtime_statistics",
        data: runtimeStatistics
    }), target);
}

export function buildAndSendServerData(target = null) {
    sendServerData(JSON.stringify({
        type: "server_statistics",
        data: serverStatistics
    }), target);
}

export function buildAndSendConnectionData(target = null) {
    sendServerData(JSON.stringify({
        type: "connection_statistics",
        data: {
            downtime,
            is_connected: currentInternalServerSocket != null,
            notified_update_downtime_timestamp: notifiedUpdateDowntimeTimestamp,
        }
    }), target);
}

wss.on('connection', (ws) => {
    if (currentInternalServerSocket) {
        currentInternalServerSocket.close();
    }
    currentInternalServerSocket = ws;

    console.log('Server connected to internal socket');
    buildAndSendStatisticData();
    buildAndSendServerData();
    downtime = 0;
    buildAndSendConnectionData();

    ws.on('message', (message) => {
        var content = JSON.parse(message);
        var dataChanged = false;
        switch (content.type) {
            case "heartbeat":
                ws.send(JSON.stringify({ type: 'heartbeat_response' }));
                sendServerData(JSON.stringify({
                    type: 'server_heartbeat'
                }));
                break;

            case "runtime_statistics":
                runtimeStatistics = content.data;
                dataChanged = true;
                break;

            case "server_statistics":
                serverStatistics = content.data;
                buildAndSendServerData();
                break;

            default:
                break;
        }
        if (dataChanged) {
            buildAndSendStatisticData();
            dataChanged = false;
        }
    });

    ws.on('close', () => {
        console.log('Client disconnected');
        currentInternalServerSocket = null;
        downtime = Math.floor(Date.now() / 1000);
        buildAndSendConnectionData();
    });
});

httpServer.listen(PORT, () => {
    console.log(`HTTP and WebSocket server is running on port ${PORT}`);
});