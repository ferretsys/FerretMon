const VERSION = "1.0";

const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
const socket = new WebSocket(wsUrl);

const terminalElement = document.getElementById('terminal');
const headerElement = terminalElement.querySelector('#header');
const connectionElement = terminalElement.querySelector('#connection_statistics');
const statisticsElement = terminalElement.querySelector('#statistics');
const serverStatisticsElement = terminalElement.querySelector('#server_statistics');

function createElementWithText(content, color, highlight, ...additionalElements) {
    const lineElement = document.createElement('span');
    if (content instanceof HTMLElement) {
        lineElement.appendChild(content);
    } else {
        const textNode = document.createTextNode(content.toString());
        lineElement.appendChild(textNode);
    }

    if (color) {
        lineElement.style.color = `var(--console-${color})`;
    }
    if (highlight) {
        lineElement.style.backgroundColor = `var(--console-${highlight})`;;
        if (color === null) {
            lineElement.style.color = "rgb(30, 30, 34)";
        }
    }
    additionalElements.forEach(element => {
        if (element instanceof HTMLElement) {
            lineElement.appendChild(element);
        } else {
            const textNode = document.createTextNode(element.toString());
            lineElement.appendChild(textNode);
        }
    });
    lineElement.style.whiteSpace = "pre-wrap";
    return lineElement;
}

function createTextElement(content, ...additionalElements) {
    return createElementWithText(content, null, null, ...additionalElements);
}

function createColouredTextElement(content, color, ...additionalElements) {
    return createElementWithText(content, color, null, ...additionalElements);
}
function createColouredHighlightTextElement(content, highlight, ...additionalElements) {
    return createElementWithText(content, null, highlight, ...additionalElements);
}

function line(target, element) {
    const lineElement = document.createElement('div');
    lineElement.appendChild(element);
    target.appendChild(lineElement);
}

socket.onopen = () => {
    console.log('WebSocket connection established');
};

var data = {};
const ferretVersionElement = createTextElement("FerretMon v" + VERSION);
ferretVersionElement.classList.add("bold");
line(headerElement, ferretVersionElement);

function draw() {
    updateConnectionStatistics(connectionElement, data.connection_statistics);
    updateServerStatistics(serverStatisticsElement, data.server_statistics, data.connection_statistics?.is_connected);
    updateStatistics(statisticsElement, data.runtime_statistics);
}

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case "connection_statistics":
            data.connection_statistics = message.data;
            break;
        case "runtime_statistics":
            data.runtime_statistics = message.data;
            break;
        case "server_statistics":
            data.server_statistics = message.data;
            break;
    }
};

setInterval(draw, 500);

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};