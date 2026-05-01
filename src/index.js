const { normalizeUrl, parseUrl } = require("./core/urlParser");
const { resolveDNS } = require("./core/dnsResolver");
const { fetchUrl } = require("./core/httpClient");
const { startTimer } = require("./utils/timer");

const { testTCPConnection } = require("./core/rawTcp");
const { rawHttpRequest } = require("./core/rawHttp");
const { rawHttpsRequest } = require("./core/rawTls");

const totalStart = startTimer();

let inputUrl = process.argv[2];
const mode = process.argv[3]; // tcp / raw / normal

if (!inputUrl) {
  console.log("Please provide a URL");
  process.exit(1);
}

inputUrl = normalizeUrl(inputUrl);
const url = parseUrl(inputUrl);

console.log("Protocol:", url.protocol);
console.log("Hostname:", url.hostname);
console.log("Pathname:", url.pathname);
console.log("Search:", url.search);

// ===== Mode handling =====
if (mode === "tcp") {
  testTCPConnection(url.hostname, 80);
  return;
}

if (mode === "raw") {
  rawHttpRequest(url.hostname, url.pathname || "/");
  return;
}

if (mode === "tls") {
  rawHttpsRequest(url.hostname, url.pathname || "/");
  return;
}

// ===== Normal flow =====
resolveDNS(url.hostname, (err, dnsData) => {
  if (err) {
    console.log("DNS Error:", err);
    return;
  }

  console.log("\nResolved IP:", dnsData.address);
  console.log("IP Type:", dnsData.family);
  console.log("DNS Time:", dnsData.time, "ms");

  fetchUrl(inputUrl, 0, totalStart);
});