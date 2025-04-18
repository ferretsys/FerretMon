const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
const wsUrl = `${protocol}//${window.location.host}`;
const socket = new WebSocket(wsUrl);

const terminalElement = document.getElementById('terminal');
const statisticsElement = terminalElement.querySelector('#statistics');
const serverStatisticsElement = terminalElement.querySelector('#server_statistics');

function createElementWithText(text, color, highlight, ...additionalElements) {
    const lineElement = document.createElement('span');
    lineElement.innerText = text;
    if (color) {
        lineElement.style.color = color;
    }
    if (highlight) {
        lineElement.style.backgroundColor = highlight;
        if (color === null) {
            lineElement.style.color = "rgb(30, 30, 34)";
        }
    }
    additionalElements.forEach(element => {
        if (typeof element === "string") {
            const textNode = document.createTextNode(element);
            lineElement.appendChild(textNode);
        } else {
            lineElement.appendChild(element);
        }
    });
    return lineElement;
}

function createTextElement(text, ...additionalElements) {
    return createElementWithText(text, null, null, ...additionalElements);
}

function createColouredTextElement(text, color, ...additionalElements) {
    return createElementWithText(text, color, null, ...additionalElements);
}
function createColouredHighlightTextElement(text, highlight, ...additionalElements) {
    return createElementWithText(text, null, highlight, ...additionalElements);
}

function line(target, element) {
    const lineElement = document.createElement('div');
    lineElement.appendChild(element);
    target.appendChild(lineElement);
}

socket.onopen = () => {
    console.log('WebSocket connection established');
};

socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    switch (message.type) {
        case "statistics":
            updateStatistics(statisticsElement, message);
            break;
        case "server_statistics":
            updateServerStatistics(serverStatisticsElement, message);
            break;
    }
};

socket.onerror = (error) => {
    console.error('WebSocket error:', error);
};

socket.onclose = () => {
    console.log('WebSocket connection closed');
};