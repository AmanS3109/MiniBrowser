function normalizeUrl(inputUrl) {
  if (!inputUrl.startsWith("http")) {
    inputUrl = "https://" + inputUrl;
  }
  return inputUrl;
}

function parseUrl(inputUrl) {
  return new URL(inputUrl);
}

module.exports = { normalizeUrl, parseUrl };