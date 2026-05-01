const dns = require("dns");

function resolveDNS(hostname, callback) {
  const start = Date.now();

  dns.lookup(hostname, (err, address, family) => {
    if (err) return callback(err);

    const time = Date.now() - start;

    callback(null, {
      address,
      family: family === 4 ? "IPv4" : "IPv6",
      time,
    });
  });
}

module.exports = { resolveDNS };