const net = require("net");

function testTCPConnection(host, port = 80) {
  const client = net.createConnection({ host, port }, () => {
    console.log("Connected to server via TCP");
    client.end();
  });

  client.on("error", (err) => {
    console.log("TCP Error:", err.message);
  });
}

module.exports = { testTCPConnection };