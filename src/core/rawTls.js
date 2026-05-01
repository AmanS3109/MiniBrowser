const tls = require("tls");
const { parseChunkedBody } = require("./chunkParser");

function rawHttpsRequest(host, path = "/") {
  const client = tls.connect(
    {
      host,
      port: 443,
      servername: host, // important for HTTPS
    },
    () => {
      console.log("TLS Connected (secure)");

      const request = `GET ${path} HTTP/1.1\r\nHost: ${host}\r\nConnection: close\r\n\r\n`;

      console.log("\n--- Raw HTTPS Request ---\n");
      console.log(request);

      client.write(request);
    }
  );

  let responseData = "";

  client.on("data", (chunk) => {
    responseData += chunk.toString();
  });

  client.on("end", () => {
    console.log("\n--- Raw HTTPS Response ---\n");
    const [headers, body] = responseData.split("\r\n\r\n");

    console.log("\n--- Headers ---\n");
    console.log(headers);

    let cleanBody = body;

    if (headers.includes("Transfer-Encoding: chunked")) {
    cleanBody = parseChunkedBody(body);
    }

    console.log("\n--- Clean Body Preview ---\n");
    console.log(cleanBody.slice(0, 1000));
  });

  client.on("error", (err) => {
    console.log("TLS Error:", err.message);
  });
}

module.exports = { rawHttpsRequest };