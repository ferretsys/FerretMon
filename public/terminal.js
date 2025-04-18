var lastRuntimeStatistics = {};

function updateStatistics(element, data) {
    element.innerHTML = ""; // Clear previous content

    line(element, createTextElement("----RUNTIME Statistics----"));
    for (var key in data.runtime_statistics) {
        var didChange = data.runtime_statistics[key] != lastRuntimeStatistics[key];
        line(element, createTextElement(`${key.toUpperCase()} : [`,
            (didChange ? createColouredHighlightTextElement : createColouredTextElement)(data.runtime_statistics[key], "lightblue"),
            "]"
        ));
    }
    lastRuntimeStatistics = data.runtime_statistics;
}

function updateServerStatistics(element, data) {
    element.innerHTML = ""; // Clear previous content

    line(element, createTextElement("----SERVER Statistics----"));
    for (var key in data.server_statistics) {
        line(element, createTextElement(`${key.toUpperCase()} : [`,
            createColouredTextElement(data.server_statistics[key], "lightblue"),
            "]"
        ));
    }
}