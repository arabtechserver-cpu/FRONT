function getUserAuthToken(storage) {
  return [storage.getItem("user_token"), storage.getItem("token")]
    .find(token => typeof token === 'string' && token.trim() && !['null', 'undefined', 'false'].includes(token.trim())) || null;
}

module.exports = { getUserAuthToken };
