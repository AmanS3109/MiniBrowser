function parseChunkedBody(rawBody) {
  let i = 0;
  let result = "";

  while (i < rawBody.length) {
    // find next line (chunk size)
    const lineEnd = rawBody.indexOf("\r\n", i);
    if (lineEnd === -1) break;

    const sizeHex = rawBody.substring(i, lineEnd);
    const size = parseInt(sizeHex, 16);

    if (size === 0) break;

    // move pointer to start of data
    i = lineEnd + 2;

    // extract chunk
    const chunk = rawBody.substring(i, i + size);
    result += chunk;

    // move pointer past data + CRLF
    i = i + size + 2;
  }

  return result;
}

module.exports = { parseChunkedBody };