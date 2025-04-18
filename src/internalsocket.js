import { WebSocketServer } from 'ws';
import { sendServerData } from './socket.js';

const wss = new WebSocketServer({ port: 83 });

const RUNTIME_STATISTICS_DEFAULT = {
    uptime: 0
};

export var runtimeStatistics = RUNTIME_STATISTICS_DEFAULT;
var serverStatistics = {};

var currentInternalServerSocket = null;

export function buildAndSendStatisticData(target=null) {
    sendServerData(JSON.stringify({
        type: "statistics",
        runtime_statistics: runtimeStatistics
    }), target);
}
export function buildAndSendServerData(target=null) {
    sendServerData(JSON.stringify({
        type: "server_statistics",
        server_statistics: serverStatistics
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

            case "statistics":
                runtimeStatistics = content.data;
                dataChanged = true;
                break;

            case "server_statistics":
                serverStatistics = content.data;
                console.log(serverStatistics);
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
    }); 
});

console.log('Internal WebSocket server is running on port 83');