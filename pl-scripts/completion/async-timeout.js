class TimeoutError extends Error {}

// Throw an error if a Promise doesn't resolve within the timeLimit
function asyncTimeout(promise, timeLimit) {
  const timeoutPromise = new Promise((resolve) => {
    const timeout = setTimeout(() => {
      clearTimeout(timeout);
      resolve(new TimeoutError(`Execution timed out after ${timeLimit}ms.`));
    }, timeLimit);
  });
  return Promise.race([promise, timeoutPromise]);
}

module.exports = {
  asyncTimeout,
  TimeoutError,
};
