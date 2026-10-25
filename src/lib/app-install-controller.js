function requestNativeInstall(state) {
  const event = state?.prompt;
  if (!event || typeof event.prompt !== 'function') return Promise.resolve({ outcome: 'unavailable' });
  // A browser event can be used only once. Consume it before invoking native UI.
  state.prompt = null;
  try {
    // Do not await anything before prompt(): it needs the original button gesture.
    return Promise.resolve(event.prompt()).then(result => result?.outcome ? result : event.userChoice);
  } catch (error) {
    return Promise.reject(error);
  }
}

module.exports = { requestNativeInstall };
