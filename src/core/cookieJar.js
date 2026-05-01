let cookieJar = {};

function storeCookies(setCookieHeaders) {
  if (!setCookieHeaders) return;

  setCookieHeaders.forEach((cookie) => {
    const [pair] = cookie.split(";");
    const [key, value] = pair.split("=");
    cookieJar[key] = value;
  });
}

function getCookieHeader() {
  return Object.entries(cookieJar)
    .map(([k, v]) => `${k}=${v}`)
    .join("; ");
}

function hasCookies() {
  return Object.keys(cookieJar).length > 0;
}

function logCookies() {
  console.log("Cookies:", cookieJar);
}

module.exports = { storeCookies, getCookieHeader, hasCookies, logCookies };