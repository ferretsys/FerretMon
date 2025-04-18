import { buildAndSendServerData, buildAndSendStatisticData } from "./internalsocket.js";

var activeConnections = [];

export function sendServerData(data, target=null) {
    if (target) {
        if (target.readyState === target.OPEN) {
            target.send(data);
        }
        return;
    }
    activeConnections.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(data);
        }
    });
}

export function handleSocket(ws) {
    activeConnections.push(ws);
    console.log('Client connected to monitor socket');
    buildAndSendStatisticData(ws);
    buildAndSendServerData(ws)

    const heartbeatInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
            ws.send(JSON.stringify({ type: 'heartbeat' }));
        } else {
            clearInterval(heartbeatInterval);
        }
    }, 30000);

    ws.on('close', () => {
        clearInterval(heartbeatInterval);
        console.log('Client disconnected from monitor socket');
        activeConnections = activeConnections.filter((client) => client !== ws);
    });
}