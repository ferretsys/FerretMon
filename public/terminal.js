var lastConnectionStatistics = {};
var lastRuntimeStatistics = {};
var lastServerStatistics = {};

function isEmpty(obj) {
    return Object.keys(obj).length === 0;
}

function createElapsedTimestamp(secondsStart, suffix = null) {
    const timestampElement = document.createElement("span");

    const elapsedSeconds = Math.floor(Date.now() / 1000) - secondsStart;
    const days = Math.floor(elapsedSeconds / 86400);
    const hours = Math.floor((elapsedSeconds % 86400) / 3600);
    const minutes = Math.floor((elapsedSeconds % 3600) / 60);
    const seconds = elapsedSeconds % 60;
    let parts = [];
    if (days > 0) parts.push(`${days} days`);
    if (hours > 0) parts.push(`${hours} hours`);
    if (minutes > 0) parts.push(`${minutes} minutes`);
    if (seconds > 0) parts.push(`${seconds} seconds`); // Always include seconds
    timestampElement.innerText = parts.length == 0 ? "Now" : parts.join(", ") + (suffix || "");

    return timestampElement;
}

function createElapsedTimestampAgo(secondsStart) {
    return createElapsedTimestamp(secondsStart, " ago");
}

function buildGenericFieldList(element, data, lastData, baseHandler, specialHandler) {
    for (var key in data) {
        var didChange = data[key] != lastData[key];
        line(element, createTextElement(`  ${key.toUpperCase()} : [`,
            (specialHandler[key] || baseHandler)((didChange ? createColouredHighlightTextElement : createColouredTextElement), (data[key])),
            "]"
        ));
    }
}

const BASE_HANDLER = (f, data) => f(data, "blue");

function updateConnectionStatistics(element, data) {
    element.innerHTML = ""; // Clear previous content

    line(element, createTextElement(" CONNECTION"));
    if (data == null) {
        line(element, createColouredHighlightTextElement("...", "gray"));
        return;
    }
    if (isEmpty(data)) {
        line(element, createColouredHighlightTextElement("  Waiting for connection", "gray"));
        return;
    }

    var special = {
        "downtime" : (f, data) => data === 0 ? f("x", "gray") : f(console.log(data) || createElapsedTimestamp(data), "red"),
        "is_connected" : (f, data) => data ? f("true", "green") : f("false", "red"),
        "notified_update_downtime_timestamp": (f, data) => data === 0  || Math.floor(Date.now() / 1000) - data > 120 ? f("x", "gray") : f(createElapsedTimestampAgo(data), "orange"),
    };
    buildGenericFieldList(element, data, lastConnectionStatistics, BASE_HANDLER, special);
    lastConnectionStatistics = data;
}

function updateServerStatistics(element, data, isConnected) {
    element.innerHTML = ""; // Clear previous content

    line(element, createTextElement(" SERVER"));
    if (data == null) {
        line(element, createColouredHighlightTextElement("...", "gray"));
        return;
    }
    if (isEmpty(data)) {
        line(element, createColouredHighlightTextElement("  Waiting for connection", "gray"));
        return;
    }

    var special = {
        "uptime" : (f, data) => isConnected ? f(createElapsedTimestamp(data), "green") : f("x", "gray"),
    };
    buildGenericFieldList(element, data, lastServerStatistics, BASE_HANDLER, special);
    lastServerStatistics = data;
}

function updateStatistics(element, data) {
    element.innerHTML = ""; // Clear previous content

    line(element, createTextElement(" RUNTIME"));
    if (data == null) {
        line(element, createColouredHighlightTextElement("...", "gray"));
        return;
    }
    if (isEmpty(data)) {
        line(element, createColouredHighlightTextElement("  Waiting for connection", "gray"));
        return;
    }

    var special = {
        "timestamp" : (f, data) => f(createElapsedTimestampAgo(data), "pink")
    };
    buildGenericFieldList(element, data, lastRuntimeStatistics, BASE_HANDLER, special);
    lastRuntimeStatistics = data;
}
