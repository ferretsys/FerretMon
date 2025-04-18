import http from "http";
import httpProxy from "http-proxy";
import fs from "fs";
import yaml from "js-yaml";
import {} from "./monitor.js"; // Import monitor.js to ensure it runs
import {} from "./internal_server.js"; // Import internalsocket.js to ensure it runs

let routeConfig;
try {
  const configFile = fs.readFileSync("run/routeconfig.yml", "utf8");
  routeConfig = yaml.load(configFile);
} catch (err) {
  console.error("Error loading routeconfig.yml:", err.message);
  process.exit(1);
}

const proxy = httpProxy.createProxyServer();

const server = http.createServer((req, res) => {
  const host = req.headers.host;

  if (routeConfig[host]) {
    const target = `http://${routeConfig[host].domain || "localhost"}${routeConfig[host].port ? `:${routeConfig[host].port}` : ""}`;
    proxy.web(req, res, { target }, (err) => {
      if (err && (err.code === "ECONNREFUSED" || err.code === "ETIMEDOUT")) {
        const fallbackTarget = "http://localhost:82/serverdown.html";
        http
          .get(fallbackTarget, (fallbackRes) => {
            res.writeHead(fallbackRes.statusCode, fallbackRes.headers);
            fallbackRes.pipe(res);
          })
          .on("error", (fallbackErr) => {
            console.error("Fallback error:", fallbackErr.message);
            res.writeHead(502);
            res.end("Bad Gateway");
          });
      } else {
        res.writeHead(502);
        res.end("Bad Gateway");
      }
    });

    req.on("response", (proxyRes) => {
      if (proxyRes.statusCode === 521) {
        const fallbackTarget = "http://localhost:82/serverdown.html";
        http
          .get(fallbackTarget, (fallbackRes) => {
            res.writeHead(fallbackRes.statusCode, fallbackRes.headers);
            fallbackRes.pipe(res);
          })
          .on("error", (fallbackErr) => {
            console.error("Fallback error:", fallbackErr.message);
            res.writeHead(502);
            res.end("Bad Gateway");
          });
      }
    });
  } else {
    res.writeHead(403);
    res.end("Domain not found in configuration");
  }
});

server.on("upgrade", (req, socket, head) => {
  const host = req.headers.host;

  if (routeConfig[host]) {
    const target = `http://localhost:${routeConfig[host].port}`;
    proxy.ws(req, socket, head, { target }, (err) => {
      console.error("WebSocket proxy error:", err.message);
      socket.destroy();
    });
  } else {
    socket.destroy();
  }
});

server.listen(80, () => {
  console.log("Proxy server is running on port 80");
});
