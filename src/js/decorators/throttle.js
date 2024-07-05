function throttle(callee, timeout) {
  let timer = null;

  return function (...args) {
    if (timer) return;

    timer = setTimeout(() => {
      callee(...args);
      clearTimeout(timer);
      timer = null;
    }, timeout);
  }
}

export { throttle };
