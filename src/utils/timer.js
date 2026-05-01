function startTimer() {
  return Date.now();
}

function getElapsed(start) {
  return Date.now() - start;
}

module.exports = { startTimer, getElapsed };