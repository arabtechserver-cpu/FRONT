function isRetiredPagePath(pathname) {
  return /^\/(?:ar\/|en\/)?pricing(?:\/|$)/i.test(pathname)
    || /^\/(?:ar\/|en\/|admin\/)?(?:blog|blogs|news|newsletter|articles|academy|tutorials)(?:\/|$)/i.test(pathname)
    || /^\/(?:ar\/|en\/|admin\/)videos(?:\/|$)/i.test(pathname)
    || /^\/videos\/?$/i.test(pathname);
}

function isRetiredApiPath(pathname) {
  return /^(?:blog|blogs|news|newsletter|articles|videos|tutorials)(?:\/|$)/i.test(pathname)
    || /^dhru\/services\/notify\/?$/i.test(pathname);
}

module.exports = { isRetiredPagePath, isRetiredApiPath };
