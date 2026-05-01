const http = require("http");
const https = require("https");
const zlib = require("zlib");

const {
  storeCookies,
  getCookieHeader,
  hasCookies,
  logCookies,
} = require("./cookieJar");

const { setToken, getToken } = require("./tokenStore");

// =========================
// CLI MODE (unchanged + stable)
// =========================
function fetchUrl(inputUrl, redirectCount = 0, totalStart) {
  if (redirectCount > 5) {
    console.log("Too many redirects. Stopping.");
    return;
  }

  const url = new URL(inputUrl);

  console.log(`\nRequesting [${redirectCount}]:`, inputUrl);

  const client = url.protocol === "https:" ? https : http;

  const options = {
    hostname: url.hostname,
    port: url.port || (url.protocol === "https:" ? 443 : 80),
    path: url.pathname + url.search,
    method: "GET",
    headers: {
      "User-Agent": "MiniBrowser/1.0",
      "Accept-Encoding": "gzip, deflate",
    },
  };

  if (hasCookies()) {
    options.headers["Cookie"] = getCookieHeader();
  }

  if (getToken()) {
    options.headers["Authorization"] = `Bearer ${getToken()}`;
  }

  const requestStart = Date.now();

  const req = client.request(options, (res) => {
    const requestTime = Date.now() - requestStart;

    console.log("Status Code:", res.statusCode);
    console.log("Request Time:", requestTime, "ms");

    const contentType = res.headers["content-type"];
    console.log("Content-Type:", contentType);

    console.log("\nHeaders:");
    for (let key in res.headers) {
      console.log(`${key}: ${res.headers[key]}`);
    }

    storeCookies(res.headers["set-cookie"]);
    logCookies();

    if (res.statusCode >= 300 && res.statusCode < 400) {
      let redirectUrl = res.headers.location;

      if (redirectUrl && redirectUrl.startsWith("/")) {
        redirectUrl = url.origin + redirectUrl;
      }

      console.log("\nRedirecting to:", redirectUrl);

      return fetchUrl(redirectUrl, redirectCount + 1, totalStart);
    }

    console.log("\nFinal URL reached.");

    let stream = res;
    const encoding = res.headers["content-encoding"];

    if (encoding === "gzip") {
      stream = res.pipe(zlib.createGunzip());
    } else if (encoding === "deflate") {
      stream = res.pipe(zlib.createInflate());
    }

    let body = "";

    stream.on("data", (chunk) => {
      body += chunk;
    });

    stream.on("end", () => {
      console.log("\n--- Body Preview ---");

      if (contentType && contentType.includes("application/json")) {
        try {
          const parsed = JSON.parse(body);

          if (parsed.token) {
            setToken(parsed.token);
            console.log("Token stored.");
          }

          console.log(JSON.stringify(parsed, null, 2));
        } catch {
          console.log(body.slice(0, 500));
        }
      } else {
        console.log(body.slice(0, 500));
      }

      const totalTime = Date.now() - totalStart;
      console.log("\nTotal Time:", totalTime, "ms");
    });
  });

  req.on("error", (err) => {
    console.log("Request Error:", err.message);
  });

  req.end();
}

// =========================
// UI MODE (FULLY FIXED)
// =========================
function fetchForUI(inputUrl, redirectCount = 0) {
  return new Promise((resolve) => {
    if (redirectCount > 5) {
      return resolve({ html: "Too many redirects", status: 500 });
    }

    try {
      // ✅ normalize URL
      if (!inputUrl.startsWith("http")) {
        inputUrl = "https://" + inputUrl;
      }

      const url = new URL(inputUrl);
      const client = url.protocol === "https:" ? https : http;

      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === "https:" ? 443 : 80),
        path: url.pathname + url.search,
        method: "GET",
        headers: {
          "User-Agent": "MiniBrowser/1.0",
          "Accept-Encoding": "gzip, deflate",
        },
      };

      if (hasCookies()) {
        options.headers["Cookie"] = getCookieHeader();
      }

      if (getToken()) {
        options.headers["Authorization"] = `Bearer ${getToken()}`;
      }

      const req = client.request(options, (res) => {
        storeCookies(res.headers["set-cookie"]);

        // ✅ robust redirect handling
        if (res.statusCode >= 300 && res.statusCode < 400) {
          let redirectUrl = res.headers.location;

          if (!redirectUrl) {
            return resolve({
              html: "Redirect with no location",
              status: res.statusCode,
            });
          }

          if (redirectUrl.startsWith("/")) {
            redirectUrl = url.origin + redirectUrl;
          }

          return resolve(fetchForUI(redirectUrl, redirectCount + 1));
        }

        let stream = res;
        const encoding = res.headers["content-encoding"];

        if (encoding === "gzip") {
          stream = res.pipe(zlib.createGunzip());
        } else if (encoding === "deflate") {
          stream = res.pipe(zlib.createInflate());
        }

        let body = "";

        stream.on("data", (chunk) => {
          body += chunk;
        });

        stream.on("end", () => {
          try {
            if (
              res.headers["content-type"] &&
              res.headers["content-type"].includes("application/json")
            ) {
              const parsed = JSON.parse(body);

              if (parsed.token) {
                setToken(parsed.token);
              }

              return resolve({
                html: `<pre>${JSON.stringify(parsed, null, 2)}</pre>`,
                status: res.statusCode,
              });
            }
          } catch {}

          resolve({
            html: body || "Empty response",
            status: res.statusCode,
          });
        });
      });

      req.on("error", (err) => {
        console.log("UI Fetch Error:", err.message);
        resolve({ html: "Error loading page", status: 500 });
      });

      req.end();
    } catch (err) {
      resolve({ html: "Invalid URL", status: 400 });
    }
  });
}

module.exports = { fetchUrl, fetchForUI };