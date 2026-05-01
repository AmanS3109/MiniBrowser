const net = require("net");

function rawHttpRequest(host, path = "/") {
  const client = net.createConnection({ host, port: 80 }, () => {
    console.log("TCP Connected");

    const request = `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`;

    console.log("\n--- Raw HTTP Request ---\n");
    console.log(request);

    client.write(request);
  });

  let responseData = "";

  client.on("data", (chunk) => {
    responseData += chunk.toString();
  });

  client.on("end", () => {
    console.log("\n--- Raw HTTP Response ---\n");
    console.log(responseData.slice(0, 1000));
  });

  client.on("error", (err) => {
    console.log("Error:", err.message);
  });
}

module.exports = { rawHttpRequest };