function debounce(callee, timeout) {
  let lastCall;
  let lastCallTimer;

  return function (...args) {
    const previousCall = lastCall;

    lastCall = Date.now();

    if (previousCall && lastCall - previousCall <= timeout) {
      clearTimeout(lastCallTimer);
    }

    lastCallTimer = setTimeout(() => callee(...args), timeout);
  }
}

export { debounce };
